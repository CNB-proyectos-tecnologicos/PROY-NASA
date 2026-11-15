"""Ensamble de clasificación de triage: bosques aleatorios + boosting de árboles.

Qué predice: el NIVEL ordinal de atención (0..4) que el catálogo asignaría si
las medidas fueran exactas, a partir de medidas ruidosas e incompletas.

Qué NO predice: probabilidad de enfermedad. Las salidas son puntuaciones del
ensamble sobre el nivel de triage; su calibración se refiere SÓLO al banco
sintético y no a personas reales (D2, D29, D53).

Modelos base
------------
* ``rf``  RandomForestClassifier           (bagging de árboles)
* ``et``  ExtraTreesClassifier             (árboles extremadamente aleatorios)
* ``hgb`` HistGradientBoostingClassifier   (boosting por histogramas)
* ``gb``  GradientBoostingClassifier       (boosting clásico; sin NaN nativo -> centinela)
* ``xgb`` / ``lgbm``: se añaden solos si XGBoost / LightGBM están instalados.

Combinación: voto blando con pesos que minimizan la pérdida logarítmica en
validación, seguido de un escalado de temperatura ajustado en un conjunto de
calibración independiente.
"""
from __future__ import annotations

import time

import numpy as np
from scipy.optimize import minimize
from sklearn.ensemble import (ExtraTreesClassifier, GradientBoostingClassifier,
                              HistGradientBoostingClassifier, RandomForestClassifier)
from sklearn.impute import SimpleImputer
from sklearn.metrics import (accuracy_score, balanced_accuracy_score, cohen_kappa_score,
                             confusion_matrix, f1_score, log_loss)
from sklearn.pipeline import make_pipeline

from .reglas import NIVELES

K = len(NIVELES)
EPS = 1e-9
# Sensibilidad mínima exigida (en validación sintética) a la detección de
# "nivel >= L" al fijar los umbrales de decisión. Marcador de posición: en un
# sistema real el umbral sale del balance beneficio/daño (protocolo, punto 6).
SENSIBILIDAD_OBJETIVO = {1: 0.90, 2: 0.95, 3: 0.97, 4: 0.98}


def modelos_base(semilla: int = 0, rapido: bool = False) -> dict:
    f = 0.4 if rapido else 1.0
    m = {
        "rf": RandomForestClassifier(n_estimators=int(200 * f), min_samples_leaf=2, max_features=0.2,
                                     max_samples=0.6, class_weight="balanced_subsample", n_jobs=-1,
                                     random_state=semilla),
        "et": ExtraTreesClassifier(n_estimators=int(200 * f), min_samples_leaf=2, max_features=0.3,
                                   class_weight="balanced", n_jobs=-1, random_state=semilla),
        "hgb": HistGradientBoostingClassifier(max_iter=int(300 * f), learning_rate=0.08, max_leaf_nodes=31,
                                              l2_regularization=0.1, class_weight="balanced",
                                              early_stopping=False, random_state=semilla),
        "gb": make_pipeline(
            SimpleImputer(strategy="constant", fill_value=-999.0, keep_empty_features=True),
            GradientBoostingClassifier(n_estimators=int(120 * f), max_depth=4, subsample=0.5,
                                       max_features=0.3, learning_rate=0.1, random_state=semilla)),
    }
    try:                                    # opcionales: sólo si están instalados
        from xgboost import XGBClassifier
        m["xgb"] = XGBClassifier(n_estimators=int(300 * f), max_depth=6, learning_rate=0.08,
                                 subsample=0.8, colsample_bytree=0.5, tree_method="hist",
                                 n_jobs=-1, random_state=semilla)
    except Exception:
        pass
    try:
        from lightgbm import LGBMClassifier
        m["lgbm"] = LGBMClassifier(n_estimators=int(300 * f), learning_rate=0.08, num_leaves=31,
                                   subsample=0.8, colsample_bytree=0.5, class_weight="balanced",
                                   n_jobs=-1, random_state=semilla, verbose=-1)
    except Exception:
        pass
    return m


def _completa(P, clases):
    """Proyecta probabilidades a las K clases aunque el modelo no viera alguna."""
    out = np.zeros((P.shape[0], K))
    out[:, np.asarray(clases, dtype=int)] = P
    return out


class EnsambleTriage:
    def __init__(self, columnas: list[str], entorno: str, semilla: int = 0, rapido: bool = False):
        self.columnas = list(columnas)
        self.entorno = entorno
        self.semilla = semilla
        self.modelos = modelos_base(semilla, rapido)
        self.pesos = None
        self.temperatura = 1.0
        self.umbrales = {L: 0.5 for L in range(1, K)}
        self.info: dict = {}

    # ------------------------------------------------------------------ ajuste
    def ajustar(self, Xtr, ytr, Xva, yva, Xca, yca, verboso=True):
        tiempos = {}
        for nombre, mod in self.modelos.items():
            t0 = time.time()
            mod.fit(Xtr, ytr)
            tiempos[nombre] = round(time.time() - t0, 1)
            if verboso:
                print(f"    {nombre:5s} ajustado en {tiempos[nombre]:6.1f} s", flush=True)
        Pva = self._proba_base(Xva)
        nombres = list(self.modelos)

        def perdida(w):
            w = np.clip(w, 0, None)
            w = w / max(w.sum(), EPS)
            return log_loss(yva, np.clip(np.tensordot(w, Pva, axes=1), EPS, 1), labels=list(range(K)))

        m = len(nombres)
        r = minimize(perdida, np.full(m, 1.0 / m), method="SLSQP", bounds=[(0.0, 1.0)] * m,
                     constraints=[{"type": "eq", "fun": lambda w: w.sum() - 1.0}],
                     options={"maxiter": 200, "ftol": 1e-7})
        w = np.clip(r.x, 0, None)
        self.pesos = dict(zip(nombres, (w / w.sum()).round(4).tolist()))

        mezcla_ca = self._mezcla(self._proba_base(Xca))

        def perdida_t(t):
            return log_loss(yca, self._templar(mezcla_ca, float(t[0])), labels=list(range(K)))

        rt = minimize(perdida_t, [1.0], method="Nelder-Mead", options={"xatol": 1e-3, "initial_simplex": [[1.0], [1.3]]})
        self.temperatura = float(np.clip(rt.x[0], 0.2, 5.0))

        # umbrales de decisión conservadora sobre P(nivel >= L), fijados en validación
        Pv = self._templar(self._mezcla(Pva), self.temperatura)
        for L in range(1, K):
            s = Pv[:, L:].sum(axis=1)
            pos = s[yva >= L]
            if len(pos) == 0:
                self.umbrales[L] = 0.5
                continue
            t = np.quantile(pos, 1 - SENSIBILIDAD_OBJETIVO[L])
            self.umbrales[L] = float(np.clip(t, 0.05, 0.5))
        self.info = {"tiempos_s": tiempos, "pesos": self.pesos, "temperatura": round(self.temperatura, 4),
                     "umbrales_P_nivel_mayor_igual": {NIVELES[L]: round(u, 4) for L, u in self.umbrales.items()},
                     "perdida_log_validacion_por_modelo": {
                         n: round(log_loss(yva, np.clip(Pva[i], EPS, 1), labels=list(range(K))), 4)
                         for i, n in enumerate(nombres)}}
        return self

    # ------------------------------------------------------------- predicción
    def _proba_base(self, X):
        return np.stack([_completa(m.predict_proba(X), m.classes_) for m in self.modelos.values()])

    def _mezcla(self, Pb):
        w = np.array([self.pesos[n] for n in self.modelos])
        return np.tensordot(w, Pb, axes=1)

    @staticmethod
    def _templar(P, t):
        L = np.log(np.clip(P, EPS, 1)) / t
        L -= L.max(axis=1, keepdims=True)
        E = np.exp(L)
        return E / E.sum(axis=1, keepdims=True)

    def predecir_proba(self, X, detalle=False):
        Pb = self._proba_base(np.asarray(X, dtype=float))
        P = self._templar(self._mezcla(Pb), self.temperatura)
        return (P, Pb) if detalle else P

    def nivel_conservador(self, P):
        """Nivel más alto L cuya puntuación acumulada P(nivel >= L) supera su umbral."""
        niv = np.zeros(P.shape[0], dtype=int)
        for L in range(1, K):
            niv = np.where(P[:, L:].sum(axis=1) >= self.umbrales[L], L, niv)
        return niv

    def acuerdo(self, Pb):
        """Fracción de modelos base cuyo nivel más probable coincide con el del ensamble."""
        voto = Pb.argmax(axis=2)
        final = self._mezcla(Pb).argmax(axis=1)
        return (voto == final[None, :]).mean(axis=0)


# ----------------------------------------------------------------- métricas
def ece(P, y, cubos=10):
    conf, pred = P.max(axis=1), P.argmax(axis=1)
    bordes = np.linspace(0, 1, cubos + 1)
    e = 0.0
    for a, b in zip(bordes[:-1], bordes[1:]):
        m = (conf > a) & (conf <= b)
        if m.any():
            e += m.mean() * abs((pred[m] == y[m]).mean() - conf[m].mean())
    return float(e)


def brier(P, y):
    Y = np.eye(K)[y]
    return float(((P - Y) ** 2).sum(axis=1).mean())


def metricas_nivel(y, pred) -> dict:
    """Métricas de triage para una asignación de niveles (reglas, ensamble o híbrido)."""
    y, pred = np.asarray(y), np.asarray(pred)
    out = {
        "exactitud": round(accuracy_score(y, pred), 4),
        "exactitud_balanceada": round(balanced_accuracy_score(y, pred), 4),
        "f1_macro": round(f1_score(y, pred, average="macro", labels=list(range(K)), zero_division=0), 4),
        "kappa_cuadratica": round(cohen_kappa_score(y, pred, weights="quadratic", labels=list(range(K))), 4),
        "infra_triage_pct": round(100 * float((pred < y).mean()), 3),
        "sobre_triage_pct": round(100 * float((pred > y).mean()), 3),
        "matriz_confusion": confusion_matrix(y, pred, labels=list(range(K))).tolist(),
    }
    for L in (3, 4):
        pos, neg = y >= L, y < L
        out[f"sensibilidad_nivel>={L}"] = round(float((pred[pos] >= L).mean()), 4) if pos.any() else None
        out[f"especificidad_nivel>={L}"] = round(float((pred[neg] < L).mean()), 4) if neg.any() else None
        out[f"falsas_alertas_nivel>={L}_por_100_evaluaciones"] = round(100 * float(((pred >= L) & neg).mean()), 3)
        out[f"omitidas_nivel>={L}_por_100_evaluaciones"] = round(100 * float(((pred < L) & pos).mean()), 3)
    inm = y == 4
    out["inmediatas_reales_dejadas_en_consulta_o_menos_pct"] = (
        round(100 * float((pred[inm] <= 2).mean()), 3) if inm.any() else None)
    return out


def metricas_probabilidad(P, y) -> dict:
    return {"perdida_log": round(log_loss(y, np.clip(P, EPS, 1), labels=list(range(K))), 4),
            "brier_multiclase": round(brier(P, y), 4), "ece": round(ece(P, y), 4)}
