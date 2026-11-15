"""Monitor continuo por línea de órdenes.

    python -m motor.monitor --demo                              # sistema simulado incluido
    python -m motor.monitor --fuente tcp://10.0.0.5:9000 --salida eventos.jsonl
    python -m motor.monitor --fuente telemetria.jsonl --seguir --entorno TIERRA
    otro_programa | python -m motor.monitor --fuente -

Lee telemetría (un JSON por línea), la evalúa de forma periódica y escribe un
evento JSON por línea. Sólo lectura: no envía nada al sistema de origen.
Prototipo de investigación: no usar para decisiones reales.
"""
from __future__ import annotations

import argparse
import json
import sys
import time

from .conexion import SalidaJSONL, abrir_fuente, ejecutar
from .flujo import ConfigMonitor, MonitorContinuo


def _legible(t0):
    def f(ev):
        dt = "" if t0[0] is None or ev["t"] is None else f"+{int(ev['t'] - t0[0]):>6d}s "
        extra = " ".join(f"{k}={ev[k]}" for k in ("id_regla", "nivel", "nivel_anterior", "valor", "canal",
                                                  "duracion_s", "motivo", "falta") if ev.get(k) is not None)
        nombre = f" «{ev['nombre']}»" if ev.get("nombre") else ""
        print(f"{dt}{ev['evento']:<24} {ev['ambito']:<7}{nombre} {extra}")
    return f


def main(argv=None):
    ap = argparse.ArgumentParser(prog="python -m motor.monitor", description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--fuente", help="tcp://host:puerto, archivo .jsonl o '-' (entrada estándar)")
    ap.add_argument("--demo", action="store_true", help="usar el sistema simulado incluido (3,5 h de telemetría)")
    ap.add_argument("--entorno", default="ESPACIO", choices=["ESPACIO", "TIERRA"])
    ap.add_argument("--salida", help="archivo .jsonl donde añadir los eventos ('-' = salida estándar en JSON)")
    ap.add_argument("--periodo", type=float, default=30.0, help="segundos entre evaluaciones (por defecto 30)")
    ap.add_argument("--seguir", action="store_true", help="seguir leyendo el archivo mientras crece")
    ap.add_argument("--sin-ensamble", action="store_true", help="sólo capa de reglas")
    a = ap.parse_args(argv)
    if not a.demo and not a.fuente:
        ap.error("indicar --fuente o --demo")

    monitor = MonitorContinuo(a.entorno, ConfigMonitor(periodo_eval_s=a.periodo), usar_ensamble=not a.sin_ensamble)
    if a.demo:
        from .demo_flujo import T0, escenario
        fuente, t0 = escenario(), [T0]
    else:
        fuente, t0 = abrir_fuente(a.fuente, seguir=a.seguir), [None]
    salidas = []
    if a.salida:
        salidas.append(SalidaJSONL(a.salida))
    if a.salida != "-":
        def primero(ev, _t0=t0):
            if _t0[0] is None and ev["t"] is not None:
                _t0[0] = ev["t"]
        salidas += [primero, _legible(t0)]
    ini = time.time()
    try:
        n = ejecutar(monitor, fuente, *salidas)
    except KeyboardInterrupt:
        n = monitor.cuentas["mensajes"]
    est = monitor.estado_actual()
    print(f"\n{n} mensajes en {time.time() - ini:.1f} s. Estado final:", file=sys.stderr)
    print(json.dumps(est, ensure_ascii=False, indent=1), file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
