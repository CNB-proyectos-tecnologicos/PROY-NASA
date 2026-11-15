"""Motor híbrido de alertas: validación -> reglas del catálogo -> ensamble -> fusión.

PROTOTIPO DE INVESTIGACIÓN. No diagnostica, no prescribe y no sustituye al
médico de vuelo ni al control ambiental. Toda salida exige revisión humana.

Política de fusión (a prueba de fallos)
---------------------------------------
* El nivel final nunca es menor que el de las reglas activadas del catálogo.
* El ensamble sólo puede SUBIR el nivel, y lo hace señalando que es una
  sugerencia a confirmar (lectura dentro del margen de error de un umbral).
* Cuando una regla se activa pero el ensamble estima que el cruce cabe en el
  error de medida, la alerta se mantiene y se pide confirmar la medida.
* Dato ausente o sensor en duda => NO_EVALUABLE / VERIFICAR, nunca "normal".
"""
from __future__ import annotations

import csv
import datetime as _dt
import json
import math
import unicodedata
from pathlib import Path

import joblib
import numpy as np

from . import rasgos as F
from . import reglas as R
from . import simulador as S

VERSION = "0.2.0-investigacion"
RAIZ = Path(__file__).resolve().parent.parent
MODELOS = RAIZ / "modelos"

AVISO_USO = ("Prototipo de investigación: no es dispositivo médico ni sistema certificado de vuelo. "
             "No diagnostica ni prescribe. Requiere revisión por personal médico u operativo autorizado.")

# Nombres del diccionario terrestre v03 aceptados como alias
ALIAS = {"edad": "age_years", "temperatura": "core_temp_c", "fc_reposo": "rest_hr_10min",
         "pa_sistolica": "sbp_confirmed", "pa_diastolica": "dbp_confirmed", "cgm": "cgm_mg_dl",
         "peso_kg": "mass_kg", "cintura_cm": "waist_cm"}
ALIAS_CON_VENTANA = {"fc_reposo", "pa_sistolica", "pa_diastolica", "cgm", "spo2"}
NO_PREDICTORES = ("ethnic_background_self_report", "origen_etnico", "cycle_phase", "fase_ciclo")
ESTRUCTURAS = ("antecedentes", "secuelas", "vte", "noise_exposures", "unidades", "entorno",
               "id_evento", "notas")
FISICOS_EXTRA = {"height_m": (0.5, 2.6), "mass_kg": (20, 400), "waist_cm": (30, 300),
                 "serum_creatinine_mg_dl": (0.1, 30), "gestational_weeks": (0, 45),
                 "habitat_duration_days": (0, 5000), "cabin_pressure_delta_psi": (0, 100),
                 "cgm_days": (0, 400), "cgm_coverage_pct": (0, 100),
                 "cabin_ppco2_1h_coverage_pct": (0, 100), "vo2max_baseline_ml_kg_min": (5, 100)}
DERIVABLES = {"age_years", "height_m", "mass_kg", "waist_cm", "serum_creatinine_mg_dl", "sex_for_formula",
              "vo2max_baseline_ml_kg_min", "estatura_cm"}


def _norm(txt: str) -> str:
    t = unicodedata.normalize("NFKD", str(txt)).encode("ascii", "ignore").decode().lower()
    return "".join(c for c in t if c.isalnum())


def _unidad_eq(a: str, b: str) -> bool:
    return _norm(a).replace("2", "") == _norm(b).replace("2", "") or _norm(a) == _norm(b)


class MotorAlertas:
    def __init__(self, entorno: str = "ESPACIO", ruta_modelo: str | Path | None = None,
                 usar_ensamble: bool = True):
        entorno = entorno.upper()
        self.entorno = entorno
        self.spec = S.especificacion(entorno)
        if entorno == "ESPACIO":
            self.reglas = R.cargar_reglas_espacio()
            self.sha_catalogo = R.sha256_archivo(R.DATOS / "reglas_espaciales.json")
            self.catalogo = "reglas_espaciales.json v1.0 (211 reglas, 190 habilitadas para revisión)"
        else:
            self.reglas = R.cargar_reglas_tierra()
            self.sha_catalogo = None                      # no hay archivo de catálogo ejecutable de origen
            self.catalogo = (f"subconjunto ejecutable de {len(self.reglas)} reglas transcritas del "
                             "catálogo terrestre v03 (512 criterios en lenguaje natural)")
        self.huella = R.huella(self.reglas)
        self.columnas_base = S.columnas_modelo(entorno)
        self.variables_regla = sorted({r.variable for r in self.reglas}
                                      | {g[0] for r in self.reglas for g in r.gates + r.gates_opc}
                                      | set(R.QC))
        self.conocidas = set(self.columnas_base) | set(self.variables_regla)
        self.ensamble, self.meta_modelo, self.aviso_modelo = None, {}, None
        if usar_ensamble:
            ruta = Path(ruta_modelo) if ruta_modelo else MODELOS / f"ensamble_{entorno.lower()}.joblib"
            if ruta.exists():
                paquete = joblib.load(ruta)
                if paquete["huella_reglas"] != self.huella:
                    self.aviso_modelo = ("El ensamble guardado se entrenó con otra versión del catálogo; "
                                         "se desactiva hasta reentrenar (control de versiones, D30).")
                else:
                    self.ensamble, self.meta_modelo = paquete["ensamble"], paquete["meta"]
                    for mod in self.ensamble.modelos.values():      # un caso cada vez: sin hilos es 3x más rápido
                        try:
                            mod.set_params(n_jobs=1)
                        except ValueError:
                            pass
            else:
                self.aviso_modelo = f"No hay ensamble entrenado en {ruta.name}: sólo capa de reglas."
        self._plan = self._cargar_planes()

    # ------------------------------------------------------------ antecedentes
    def _cargar_planes(self):
        plan = []
        if self.entorno == "ESPACIO":
            with open(R.DATOS / "antecedentes_espacio.csv", encoding="utf-8-sig") as fh:
                for f in csv.DictReader(fh):
                    plan.append((f["tipo"], f["antecedente"], f["modificacion_plan"], f"fases {f['fases']}; fuente {f['fuente']}"))
        else:
            d = json.loads((R.DATOS / "antecedentes_tierra.json").read_text(encoding="utf-8"))
            plan += [("ENFERMEDAD", a["enfermedad"], a["efecto"], "catálogo terrestre v03") for a in d["antecedentes"]]
            plan += [("SECUELA", a["secuela"], a["efecto"], "catálogo terrestre v03") for a in d["secuelas"]]
        return plan

    def _planes_para(self, lista):
        out, sin = [], []
        for item in lista or []:
            clave = _norm(item)
            hits = [p for p in self._plan
                    if len(clave) >= 4 and (clave in _norm(p[1]) or any(_norm(t) == clave for t in p[1].replace("/", " ").split()))]
            if hits:
                out += [{"tipo": t, "antecedente": a, "modificacion_del_plan": m, "origen": o} for t, a, m, o in hits]
            else:
                sin.append(item)
        return out, sin

    # ---------------------------------------------------------------- entrada
    def _preparar(self, datos: dict):
        avisos, invalidos, no_reconocidos = [], [], []
        d = {}
        alias = dict(ALIAS, spo2="spo2_5min") if self.entorno == "TIERRA" else ALIAS
        if self.entorno == "ESPACIO" and "spo2" in datos:
            avisos.append("'spo2' no se usa: el catálogo espacial exige medias de ventana; enviar "
                          "'spo2_2min' y/o 'spo2_5min' (ver reglas.media_ventana).")
        for k, v in datos.items():
            if k in alias:
                if k in ALIAS_CON_VENTANA:
                    avisos.append(f"'{k}' se toma como '{alias[k]}': se asume que cumple la ventana y la "
                                  "confirmación que exige el catálogo; una lectura puntual no basta.")
                k = alias[k]
            d[k] = v
        if "estatura_cm" in d and "height_m" not in d and isinstance(d["estatura_cm"], (int, float)):
            d["height_m"] = d["estatura_cm"] / 100.0

        usados = [k for k in NO_PREDICTORES if k in d]
        if usados:
            avisos.append("Etnia y fase del ciclo se conservan sólo como contexto/auditoría: no modifican "
                          "ninguna alerta ni entran al ensamble (D5, D23, D24).")

        # fase de misión
        if self.entorno == "ESPACIO":
            fase = d.get("mission_phase")
            if isinstance(fase, str):
                f = fase.strip().upper()
                f = {"P": "PREFLIGHT", "F": "INFLIGHT", "R": "POSTFLIGHT", "PREVUELO": "PREFLIGHT",
                     "VUELO": "INFLIGHT", "POSVUELO": "POSTFLIGHT", "POSTVUELO": "POSTFLIGHT"}.get(f, f)
                d["mission_phase"] = float(R.FASES[f]) if f in R.FASES else None
                if d["mission_phase"] is None:
                    invalidos.append({"campo": "mission_phase", "motivo": "fase no reconocida"})
            if d.get("mission_phase") is None:
                d["mission_phase_unknown"] = 1
        else:
            emb = d.get("pregnancy_status")
            if isinstance(emb, str):
                d["pregnancy_status"] = {"confirmed": 1, "confirmado": 1, "not_pregnant": 0, "no": 0,
                                         "no_embarazada": 0}.get(emb.strip().lower())
            sx = d.get("sex_for_reference")
            if isinstance(sx, str):
                d["sex_for_reference"] = {"m": 1, "male": 1, "hombre": 1, "varon": 1, "f": 0, "female": 0,
                                          "mujer": 0}.get(_norm(sx))
            ant = " ".join(_norm(a) for a in (d.get("antecedentes") or []))
            if "known_diabetes" not in d and "diabetes" in ant and "gestacional" not in ant:
                d["known_diabetes"] = 1
            if "known_heart_failure" not in d and "insuficienciacardiaca" in ant:
                d["known_heart_failure"] = 1

        # unidades declaradas: sin conversiones implícitas (D41)
        for var, u in (d.get("unidades") or {}).items():
            var = ALIAS.get(var, var)
            esperada = (self.spec["num"].get(var) or [None])[0] or next(
                (r.unidad for r in self.reglas if r.variable == var), None)
            if esperada and not _unidad_eq(u, esperada) and var in d:
                invalidos.append({"campo": var, "motivo": f"ERROR_UNIDAD: llegó '{u}', el catálogo espera '{esperada}'"})
                d.pop(var)

        # derivaciones autorizadas
        deriv = {}
        try:
            if d.get("noise_exposures") is not None and d.get("noise_dose_pct") is None:
                deriv["noise_dose_pct"] = R.dosis_acustica_24h_pct([tuple(x) for x in d["noise_exposures"]])
        except (ValueError, TypeError):
            invalidos.append({"campo": "noise_exposures", "motivo": "segmentos acústicos inválidos"})
        vte = None
        if isinstance(d.get("vte"), dict):
            c = dict(d["vte"])
            if c.get("age") is None:
                c["age"] = d.get("age_years")
            if c.get("ijv_stasis") is None:
                vel, retro = d.get("ijv_peak_velocity_cm_s"), d.get("ijv_retrograde")
                if vel is not None or retro is not None:
                    c["ijv_stasis"] = bool((vel is not None and vel < 10) or retro == 1)
            if c.get("d_dimer_change_pct") is None:
                c["d_dimer_change_pct"] = d.get("d_dimer_inflight_change_pct")
            try:
                vte = R.puntuacion_vte_nasa_2026(c)
            except KeyError as e:
                vte = {"estado": "NO_CALCULABLE", "puntos": None, "faltan": [], "error": f"categoría no documentada: {e}"}
            if vte["estado"] == "CALCULADO" and d.get("nasa_vte_score") is None:
                deriv["nasa_vte_score"] = float(vte["puntos"])
            elif vte["estado"] != "CALCULADO":
                d.setdefault("vte_score_missing", 1)
        if d.get("urine_l_24h") is not None and d.get("urine_ml_day") is None:
            deriv["urine_ml_day"] = d["urine_l_24h"] * 1000.0
        if d.get("urine_ml_day") is not None and d.get("urine_l_24h") is None:
            deriv["urine_l_24h"] = d["urine_ml_day"] / 1000.0
        if d.get("vo2max_ratio") is None and d.get("vo2max_ml_kg_min") and d.get("vo2max_baseline_ml_kg_min"):
            deriv["vo2max_ratio"] = d["vo2max_ml_kg_min"] / d["vo2max_baseline_ml_kg_min"]
        h, m = d.get("height_m"), d.get("mass_kg")
        if d.get("bmi") is None and isinstance(h, (int, float)) and isinstance(m, (int, float)) and h > 0:
            deriv["bmi"] = m / h ** 2
        if d.get("whtr") is None and isinstance(h, (int, float)) and isinstance(d.get("waist_cm"), (int, float)) and h > 0:
            deriv["whtr"] = d["waist_cm"] / (h * 100.0)
        if d.get("egfr") is None and d.get("serum_creatinine_mg_dl") is not None:
            try:
                deriv["egfr"] = R.ckd_epi_2021(d["age_years"], d["serum_creatinine_mg_dl"], d.get("sex_for_formula"))
            except (ValueError, KeyError, TypeError):
                avisos.append("eGFR no derivado: faltan edad o la categoría de sexo de la ecuación (no se infiere).")
        d.update(deriv)
        if self.entorno == "TIERRA":
            sx, emb = d.get("sex_for_reference"), d.get("pregnancy_status")
            d["not_pregnant"] = 1 if sx == 1 else (None if emb is None else 1 - int(emb))

        # validación de tipo y plausibilidad
        vals: dict[str, float] = {}
        num = self.spec["num"]
        for k, v in d.items():
            if k in ESTRUCTURAS or k in NO_PREDICTORES or k in DERIVABLES and k not in self.conocidas:
                continue
            if k not in self.conocidas:
                no_reconocidos.append(k)
                continue
            if v is None:
                continue
            if isinstance(v, bool):
                v = 1.0 if v else 0.0
            if not isinstance(v, (int, float)) or not math.isfinite(v):
                invalidos.append({"campo": k, "motivo": "valor no numérico o no finito"})
                continue
            if k in num:
                lo, hi = num[k][1]
            elif k in FISICOS_EXTRA:
                lo, hi = FISICOS_EXTRA[k]
            elif k == "mission_phase":
                lo, hi = 0, 2
            else:
                lo, hi = 0, 1                                   # indicadores
            if not lo <= v <= hi:
                invalidos.append({"campo": k, "motivo": f"DATO_INVALIDO: {v} fuera de [{lo}, {hi}]"})
                continue
            vals[k] = float(v)
        return vals, deriv, vte, avisos, invalidos, no_reconocidos, d

    # --------------------------------------------------------------- evaluar
    def evaluar(self, datos: dict, explicar: bool = True) -> dict:
        vals, deriv, vte, avisos, invalidos, no_rec, bruto = self._preparar(dict(datos))
        obs = {k: np.array([v]) for k, v in vals.items()}
        X, cols, cod = F.construir(self.entorno, obs, 1, self.reglas)
        cod = cod[:, 0]
        num = self.spec["num"]

        def margen(r):
            if r.op == "==" or r.variable not in num or r.variable not in vals:
                return None
            sd = float(np.mean(S._sd(r.variable, num, vals[r.variable])))
            return round(abs(vals[r.variable] - r.umbral) / sd, 2) if sd > 0 else None

        def ficha(r, extra=None):
            f = {"id": r.id, "nombre": r.nombre, "dominio": r.dominio,
                 "nivel": R.NIVELES[r.nivel] if r.nivel else None,
                 "prioridad_en_catalogo": r.prioridad, "canal": r.canal, "evidencia": r.evidencia,
                 "criterio": f"{r.variable} {r.op} {r.umbral:g} {r.unidad}",
                 "valor": None if vals.get(r.variable) is None else round(vals[r.variable], 4),
                 "accion_propuesta": r.accion,
                 "confirmacion": r.confirmacion, "limites": r.limites, "fuente": r.fuente}
            if r.refs:
                f["reglas_de_origen"] = list(r.refs)
            if extra:
                f.update(extra)
            return f

        activadas, verificar, contexto, calidad, cercanas = [], [], [], [], []
        falt_dom: dict[str, dict] = {}
        n_eval = n_nocalc = n_noaplica = 0
        for r, c in zip(self.reglas, cod):
            if not r.habilitada:
                continue
            if c == R.ACTIVADA:
                n_eval += bool(r.nivel)
                if r.canal == "CALIDAD_ABSTENCION":
                    calidad.append(ficha(r))
                else:
                    mg = margen(r)
                    activadas.append((r, ficha(r, {"margen_sobre_umbral_en_dt_sensor": mg,
                                                  "dentro_del_margen_de_error": bool(mg is not None and mg < 1.0)})))
            elif c == R.INACTIVA:
                n_eval += bool(r.nivel)
                mg = margen(r)
                if r.nivel and mg is not None and mg <= 2.0:
                    cercanas.append((r, mg))
            elif c == R.VERIFICAR:
                flags = [fl for fl in R.QC_POR_VAR.get(r.variable, []) if vals.get(fl) == 1]
                desconocidos = [g[0] for g in r.gates if g[0] not in vals]
                if flags:
                    verificar.append((r, ficha(r, {
                        "estado": "SEÑAL_NO_CONFIRMADA",
                        "motivo": f"calidad de sensor en duda ({', '.join(flags)})",
                        "que_hacer": "Verificar ya con una medida independiente; no descartar el valor "
                                     "ni tratarlo como confirmado."})))
                if desconocidos:
                    contexto.append((r, ficha(r, {
                        "estado": "CONTEXTO_INCOMPLETO", "falta": desconocidos,
                        "que_hacer": "El valor cumple el criterio, pero la regla depende de un dato de contexto "
                                     "no informado. Completarlo para poder evaluarla."})))
            elif c == R.NO_CALCULABLE:
                n_nocalc += bool(r.nivel)
                if r.canal != "CALIDAD_ABSTENCION":
                    e = falt_dom.setdefault(r.dominio, {"reglas_sin_evaluar": 0, "faltan": set(), "como_completar": set()})
                    e["reglas_sin_evaluar"] += 1
                    falta = [v for v in [r.variable] + [g[0] for g in r.gates] if v not in vals]
                    e["faltan"].update(falta or [f"{r.variable} (lectura no fiable o ventana incompleta)"])
                    if r.confirmacion:
                        e["como_completar"].add(r.confirmacion)
            else:
                n_noaplica += bool(r.nivel)

        # deduplicación: una alerta por variable y sentido, la más grave (D36)
        grupos: dict[tuple, list] = {}
        for r, f in activadas:
            sentido = "bajo" if r.op in ("<", "<=") else ("alto" if r.op in (">", ">=") else r.id)
            grupos.setdefault((r.variable, sentido), []).append((r, f))
        alertas = []
        for (_, sentido), lst in grupos.items():
            lst.sort(key=lambda t: (-t[0].nivel, t[0].umbral if sentido == "bajo" else -t[0].umbral))
            ppal = lst[0][1]
            if len(lst) > 1:
                ppal["subsume"] = [f["id"] for _, f in lst[1:]]
            alertas.append((lst[0][0], ppal))
        alertas.sort(key=lambda t: (-t[0].nivel, t[0].id))
        verificar.sort(key=lambda t: (-(t[0].nivel or 0), t[0].id))
        vistos, verif_out = set(), []
        for r, f in verificar:
            if (r.variable, r.nivel) not in vistos:
                vistos.add((r.variable, r.nivel))
                verif_out.append(f)

        nivel_reglas = max([r.nivel for r, _ in alertas], default=0)
        nivel_verif = max([r.nivel or 0 for r, _ in verificar], default=0)
        nivel_ctx = max([r.nivel or 0 for r, _ in contexto], default=0)
        contexto.sort(key=lambda t: (-(t[0].nivel or 0), t[0].id))

        # ------------------------------------------------------- ensamble
        ens = {"disponible": False, "motivo": self.aviso_modelo or "desactivado"}
        nivel_ens = 0
        if self.ensamble is not None:
            P, Pb = self.ensamble.predecir_proba(X, detalle=True)
            nivel_ens = int(self.ensamble.nivel_conservador(P)[0])
            acuerdo = float(self.ensamble.acuerdo(Pb)[0])
            pmax = float(P[0].max())
            conf = "ALTA" if (pmax >= 0.8 and acuerdo >= 0.75) else ("BAJA" if (pmax < 0.55 or acuerdo < 0.5) else "MEDIA")
            ens = {"disponible": True,
                   "nivel_mas_probable": R.NIVELES[int(P[0].argmax())],
                   "nivel_conservador": R.NIVELES[nivel_ens],
                   "puntuacion_por_nivel": {R.NIVELES[i]: round(float(p), 4) for i, p in enumerate(P[0])},
                   "puntuacion_acumulada": {f">={R.NIVELES[L]}": round(float(P[0, L:].sum()), 4) for L in (2, 3, 4)},
                   "acuerdo_entre_modelos": round(acuerdo, 2), "confianza": conf,
                   "que_significa": "Puntuación del ensamble sobre el nivel de triage, calibrada sólo en el banco "
                                    "sintético. NO es probabilidad de enfermedad ni de evento clínico."}
            if explicar:
                ens["datos_que_mas_pesan"] = self._explicar(vals, max(nivel_ens, nivel_reglas))
            if max(nivel_reglas, nivel_ens) < 3 and float(P[0, 3:].sum()) >= 0.15:
                ens["vigilancia"] = (f"Puntuación apreciable de nivel PRIORITARIA o superior ({float(P[0, 3:].sum()):.2f}) "
                                     "sin alcanzar el umbral de decisión: alguna lectura queda cerca de un umbral "
                                     "(ver 'lecturas_cercanas_a_umbral'). Considerar repetir la medida.")
            if nivel_reglas > 0:
                resp = float(P[0, nivel_reglas:].sum())
                ens["respaldo_al_nivel_de_reglas"] = round(resp, 4)

        nivel_final = max(nivel_reglas, nivel_ens)
        origen = ("NINGUNO" if nivel_final == 0 else
                  "REGLAS_Y_ENSAMBLE" if nivel_reglas == nivel_ens else
                  "REGLAS" if nivel_reglas > nivel_ens else "ENSAMBLE")
        notas = []
        if origen == "ENSAMBLE":
            cerca = sorted([(mg, r) for r, mg in cercanas if r.nivel > nivel_reglas], key=lambda t: t[0])[:3]
            det = "; ".join(f"{r.variable}={vals[r.variable]:g} a {mg} d.t. del umbral {r.op}{r.umbral:g} ({r.id})"
                            for mg, r in cerca)
            notas.append("El ensamble sugiere subir el nivel: ninguna regla de ese nivel llegó a activarse, pero "
                         "la combinación de lecturas es compatible con él dentro del error de medida"
                         + (f" [{det}]" if det else "") + ". Confirmar la medida antes de actuar.")
        if ens.get("respaldo_al_nivel_de_reglas") is not None and ens["respaldo_al_nivel_de_reglas"] < 0.5:
            notas.append("La regla activada se mantiene, pero el cruce de umbral cabe dentro del error de medida "
                         "supuesto para el sensor: repetir o confirmar la lectura.")
        if any(f.get("dentro_del_margen_de_error") for _, f in alertas):
            notas.append("Hay activaciones a menos de 1 desviación típica del umbral (ver 'dentro_del_margen_de_error').")

        if nivel_final > 0:
            estado = "ALERTA"
        elif nivel_verif >= 3:
            estado = "VERIFICACION_URGENTE_DE_SEÑAL"
        elif nivel_ctx >= 3:
            estado = "COMPLETAR_CONTEXTO_URGENTE" if nivel_ctx >= 4 else "COMPLETAR_CONTEXTO"
        elif n_eval == 0:
            estado = "NO_EVALUABLE"
        else:
            estado = "SIN_ALERTA_EN_LO_EVALUADO"

        if self.entorno == "TIERRA":
            if "age_years" not in vals:
                avisos.append("Edad no informada: las reglas terrestres son sólo para adultos y no se evalúan sin ella.")
            elif vals["age_years"] < 18:
                avisos.append("FUERA_DE_POBLACION: menor de 18 años; este prototipo sólo contiene reglas de adultos.")
        if self.entorno == "ESPACIO":
            if "cabin_ppco2_1h" in vals and "cabin_ppco2_1h_coverage_pct" not in vals:
                avisos.append("CO2 de cabina: no se informó la cobertura de la hora; se evalúa asumiendo media "
                              "horaria completa (si no lo es, el resultado correcto es NO_CALCULABLE).")
            if "mission_phase" not in vals:
                avisos.append("Fase de misión no informada: las reglas dependientes de fase no se evalúan.")
        apagadas = [r.id for r in self.reglas if not r.habilitada and r.variable in vals
                    and bool(R._OPS[r.op](vals[r.variable], r.umbral))]
        if apagadas:
            avisos.append(f"Hay valores que cumplen criterios de reglas apagadas ({', '.join(apagadas[:8])}"
                          f"{'…' if len(apagadas) > 8 else ''}): heurísticas o derivadas sin validar; "
                          "no generan alerta.")
        if self.aviso_modelo:
            avisos.append(self.aviso_modelo)
        planes, sin_plan = self._planes_para((bruto.get("antecedentes") or []) + (bruto.get("secuelas") or []))
        if sin_plan:
            avisos.append(f"Antecedentes sin entrada en el catálogo (no modifican nada): {', '.join(map(str, sin_plan))}.")

        canales = sorted({r.canal for r, _ in alertas})
        salida = {
            "estado": estado,
            "nivel_final": R.NIVELES[nivel_final],
            "origen_del_nivel": origen,
            "canales": canales,
            "resumen": self._resumen(estado, nivel_final, origen, alertas, verif_out, contexto, n_eval, n_nocalc),
            "alertas": [f for _, f in alertas],
            "verificar_señal": verif_out,
            "completar_contexto": [f for _, f in contexto],
            "avisos_de_calidad_y_abstencion": calidad,
            "lecturas_cercanas_a_umbral": [
                {"regla": r.id, "variable": r.variable, "valor": vals[r.variable],
                 "umbral": f"{r.op} {r.umbral:g} {r.unidad}", "nivel_si_cruzara": R.NIVELES[r.nivel],
                 "distancia_en_dt_sensor": mg}
                for r, mg in sorted(cercanas, key=lambda t: (-t[0].nivel, t[1]))[:8]],
            "no_evaluable": {
                "aviso": "Lo no medido NO se considera normal. Sin estos datos el motor no puede pronunciarse.",
                "por_dominio": {dom: {"reglas_sin_evaluar": e["reglas_sin_evaluar"],
                                      "faltan": sorted(e["faltan"]),
                                      "como_completar": sorted(e["como_completar"])[:3]}
                                for dom, e in sorted(falt_dom.items())}},
            "cobertura": {"reglas_con_nivel_habilitadas": sum(bool(r.habilitada and r.nivel) for r in self.reglas),
                          "evaluadas": n_eval, "no_calculables": n_nocalc, "no_aplican_por_contexto": n_noaplica},
            "niveles": {"reglas": R.NIVELES[nivel_reglas], "ensamble": R.NIVELES[nivel_ens] if ens["disponible"] else None,
                        "mayor_nivel_pendiente_de_verificar": R.NIVELES[nivel_verif] if nivel_verif else None},
            "ensamble": ens,
            "notas_de_fusion": notas,
            "puntuacion_vte_nasa_2026": vte,
            "plan_por_antecedentes": planes,
            "avisos": avisos,
            "datos_rechazados": invalidos,
            "campos_no_reconocidos": no_rec,
            "seguridad": {"diagnostico_autonomo": False, "probabilidad_de_enfermedad": None,
                          "prescripcion_automatica": False, "requiere_revision_humana": True, "uso": AVISO_USO},
            "auditoria": {"version_motor": VERSION, "entorno": self.entorno, "catalogo": self.catalogo,
                          "sha256_catalogo": self.sha_catalogo, "huella_reglas": self.huella,
                          "modelo": self.meta_modelo.get("id") if self.ensamble is not None else None,
                          "fecha_evaluacion_utc": _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="seconds"),
                          "id_evento": bruto.get("id_evento"),
                          "entradas_usadas": vals, "derivadas": {k: round(v, 4) for k, v in deriv.items()}},
        }
        return salida

    def _explicar(self, vals: dict, nivel: int, top: int = 6) -> list:
        """Explicación local: cuánto cambia la puntuación de 'nivel >= L' al ocultar cada dato.

        Se oculta el dato de entrada y se recalculan reglas y rasgos, de modo que el
        efecto recoge todo lo que ese dato aporta (no es atribución causal)."""
        claves = [k for k in vals if k in self.conocidas]
        if not claves:
            return []
        n = len(claves)
        obs = {k: np.full(n + 1, v) for k, v in vals.items()}
        for j, k in enumerate(claves):
            obs[k][j] = np.nan
        X, _, _ = F.construir(self.entorno, obs, n + 1, self.reglas)
        L = max(int(nivel), 1)
        s = self.ensamble.predecir_proba(X)[:, L:].sum(axis=1)
        efecto = s[-1] - s[:-1]
        orden = np.argsort(-np.abs(efecto))[:top]
        return [{"dato": claves[i], "valor": round(vals[claves[i]], 4),
                 f"cambio_en_puntuacion_de_>={R.NIVELES[L]}": round(float(efecto[i]), 4)}
                for i in orden if abs(efecto[i]) >= 0.01]

    @staticmethod
    def _resumen(estado, nivel, origen, alertas, verif, contexto, n_eval, n_nocalc):
        if estado == "NO_EVALUABLE":
            return "Ninguna regla pudo evaluarse con los datos recibidos. Esto no equivale a ausencia de riesgo."
        partes = []
        if nivel:
            ppal = alertas[0][1] if alertas else None
            if origen == "ENSAMBLE":
                partes.append(f"Nivel {R.NIVELES[nivel]} SUGERIDO por el ensamble, a confirmar; las reglas activadas "
                              f"llegan a {ppal['nivel'] if ppal else 'SIN_ALERTA'}."
                              + (f" Regla principal: {ppal['nombre']} [{ppal['id']}]." if ppal else ""))
            else:
                partes.append(f"Nivel {R.NIVELES[nivel]} (origen: {origen.lower().replace('_', ' ')})."
                              + (f" Principal: {ppal['nombre']} [{ppal['id']}]." if ppal else ""))
        else:
            partes.append("Sin alertas en lo evaluado.")
        if verif:
            partes.append(f"{len(verif)} señal(es) grave(s) sin confirmar: verificar.")
        if contexto:
            partes.append(f"{len(contexto)} criterio(s) cumplido(s) pendientes de contexto.")
        partes.append(f"{n_eval} reglas evaluadas; {n_nocalc} sin poder evaluarse por falta de dato "
                      "(lo no medido no se considera normal).")
        return " ".join(partes)


def guardar_modelo(ruta: Path, ensamble, entorno: str, huella_reglas: str, meta: dict):
    ruta = Path(ruta)
    ruta.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"ensamble": ensamble, "entorno": entorno, "huella_reglas": huella_reglas, "meta": meta},
                ruta, compress=("lzma", 6))
