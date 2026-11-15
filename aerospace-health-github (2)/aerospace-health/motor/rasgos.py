"""Entradas del ensamble: medidas observadas + resumen de la capa de reglas.

El ensamble no trabaja a ciegas: recibe, además de cada dato observado, lo que
ya dijo el catálogo sobre esos datos y a qué distancia quedó cada lectura de
sus umbrales, medida en desviaciones típicas del error supuesto del sensor.
Con eso puede valorar algo que una regla sola no ve: si un cruce de umbral (o
su ausencia) cabe dentro del error de medida.

Rasgos añadidos (todos calculados con las mismas funciones que las reglas):

* ``r_nivel``         nivel máximo entre las reglas ACTIVADAS
* ``r_nivel_verif``   nivel máximo entre las reglas en VERIFICAR (sensor/contexto dudoso)
* ``r_act_L``         nº de reglas activadas de nivel L (L = 1..4)
* ``r_ma_L``          margen (en d.t. del sensor) con que la activación más
                      holgada de nivel >= L supera su umbral; 0 si no hay
* ``r_mi_L``          margen de la regla NO activada de nivel >= L más cercana
                      a dispararse; 10 si no hay ninguna evaluable
* ``r_mv``            margen de la regla en VERIFICAR más holgada

No entran como predictores la etnia ni la fase del ciclo (D5, D23, D24).
Tampoco se añade ningún recuento de datos ausentes: cuántas cosas se midieron
no debe actuar como indicio a favor ni en contra de una alerta.
"""
from __future__ import annotations

import numpy as np

from . import reglas as R
from . import simulador as S

TOPE = 10.0
EXTRA = (["r_nivel", "r_nivel_verif", "r_mv"]
         + [f"r_act_{L}" for L in range(1, 5)]
         + [f"r_ma_{L}" for L in range(1, 5)]
         + [f"r_mi_{L}" for L in range(1, 5)])


def columnas(entorno: str) -> list[str]:
    return S.columnas_modelo(entorno) + EXTRA


def construir(entorno: str, obs: dict, n: int, reglas: list[R.Regla]):
    """Devuelve (X, columnas, codigos_de_regla)."""
    num = S.especificacion(entorno)["num"]
    cod = R.evaluar(reglas, obs, n, aplicar_qc=True)
    nivel = np.array([r.nivel or 0 for r in reglas])
    act, ver = cod == R.ACTIVADA, cod == R.VERIFICAR
    f = {"r_nivel": np.where(act, nivel[:, None], 0).max(axis=0).astype(float),
         "r_nivel_verif": np.where(ver, nivel[:, None], 0).max(axis=0).astype(float)}
    for L in range(1, 5):
        f[f"r_act_{L}"] = (act & (nivel[:, None] == L)).sum(axis=0).astype(float)
        f[f"r_ma_{L}"] = np.zeros(n)
        f[f"r_mi_{L}"] = np.full(n, TOPE)
    f["r_mv"] = np.zeros(n)

    for i, r in enumerate(reglas):
        if not r.habilitada or not r.nivel:
            continue
        if r.op == "==" or r.variable not in num:
            m = np.full(n, TOPE)                      # indicadores: sin error de medida modelado
        else:
            x = np.asarray(obs.get(r.variable, np.full(n, np.nan)), dtype=float)
            sd = np.maximum(S._sd(r.variable, num, np.nan_to_num(x, nan=r.umbral)), 1e-9)
            m = np.minimum(np.abs(np.nan_to_num(x, nan=r.umbral) - r.umbral) / sd, TOPE)
        a, v, ina = act[i], ver[i], cod[i] == R.INACTIVA
        if v.any():
            f["r_mv"] = np.where(v, np.maximum(f["r_mv"], m), f["r_mv"])
        for L in range(1, r.nivel + 1):
            if a.any():
                f[f"r_ma_{L}"] = np.where(a, np.maximum(f[f"r_ma_{L}"], m), f[f"r_ma_{L}"])
            if ina.any():
                f[f"r_mi_{L}"] = np.where(ina, np.minimum(f[f"r_mi_{L}"], m), f[f"r_mi_{L}"])
    cols = columnas(entorno)
    base = S.a_matriz(obs, S.columnas_modelo(entorno), n)
    X = np.column_stack([base] + [f[c] for c in EXTRA])
    return X, cols, cod
