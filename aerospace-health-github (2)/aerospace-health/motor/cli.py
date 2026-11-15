"""Línea de órdenes:  python -m motor.cli caso.json [--entorno ESPACIO|TIERRA] [--breve]

Lee un caso en JSON (o por la entrada estándar con '-') y escribe la salida
auditada del motor. Prototipo de investigación: no usar para decisiones reales.
"""
from __future__ import annotations

import argparse
import json
import sys

from .motor import MotorAlertas


def main(argv=None):
    ap = argparse.ArgumentParser(prog="python -m motor.cli", description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("caso", help="archivo JSON con los datos, o '-' para leer de la entrada estándar")
    ap.add_argument("--entorno", choices=["ESPACIO", "TIERRA"], help="por defecto, el campo 'entorno' del caso o ESPACIO")
    ap.add_argument("--sin-ensamble", action="store_true", help="sólo capa de reglas")
    ap.add_argument("--breve", action="store_true", help="resumen legible en vez del JSON completo")
    a = ap.parse_args(argv)
    datos = json.load(sys.stdin if a.caso == "-" else open(a.caso, encoding="utf-8"))
    entorno = (a.entorno or datos.get("entorno") or "ESPACIO").upper()
    res = MotorAlertas(entorno, usar_ensamble=not a.sin_ensamble).evaluar(datos)
    if not a.breve:
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0
    print(f"[{entorno}] {res['estado']} · nivel {res['nivel_final']} (origen {res['origen_del_nivel']})")
    print(res["resumen"])
    for al in res["alertas"]:
        print(f"  ALERTA {al['nivel']:<11} {al['id']} {al['nombre']} | {al['criterio']} (valor {al['valor']}) -> {al['accion_propuesta']}")
    for v in res["verificar_señal"]:
        print(f"  VERIFICAR {v['id']} {v['nombre']} | {v['motivo']}")
    for c in res["completar_contexto"]:
        print(f"  CONTEXTO  {c['id']} {c['nombre']} | falta {', '.join(c['falta'])}")
    for q in res["avisos_de_calidad_y_abstencion"]:
        print(f"  CALIDAD   {q['id']} {q['nombre']}")
    e = res["ensamble"]
    if e["disponible"]:
        print(f"  ENSAMBLE  más probable {e['nivel_mas_probable']}, conservador {e['nivel_conservador']}, "
              f"confianza {e['confianza']}, puntuaciones {e['puntuacion_por_nivel']}")
    for n in res["notas_de_fusion"] + res["avisos"]:
        print(f"  NOTA      {n}")
    dom = res["no_evaluable"]["por_dominio"]
    if dom:
        print(f"  SIN EVALUAR {res['cobertura']['no_calculables']} reglas en {len(dom)} dominios (lo no medido no es normal).")
    print("  " + res["seguridad"]["uso"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
