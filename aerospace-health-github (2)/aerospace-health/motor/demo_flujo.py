"""Sistema continuo SIMULADO para probar la conexión de extremo a extremo.

Genera 3,5 h de telemetría de dos tripulantes y de la cabina, con incidencias
guionizadas. Sirve para ensayar el monitor sin el sistema real; los valores
son inventados para ejercitar la lógica y no representan a nadie.

Guion (segundos desde el inicio)
    1800–9000   el CO2 de cabina sube de 2,2 a 3,6 mmHg y luego se corrige
    4000–4120   CM-1: artefacto de movimiento en SpO2 (muestras no válidas)
    6000–6600   CM-1: desaturación real a 88 %
    7000–7900   CM-2: ejercicio (FC 150 sin etiqueta de reposo)
    8200–8600   CM-2: el canal de SpO2 deja de emitir
    9500–fin    CM-2: temperatura 38,3 °C
    además: una muestra fuera de orden, una en °F y un valor imposible
"""
from __future__ import annotations

import json
import socket
import threading

import numpy as np

T0 = 1794300000.0            # instante inicial arbitrario (segundos Unix)
DURACION = 12600


def escenario(duracion: int = DURACION, semilla: int = 0, t0: float = T0):
    """Genera los mensajes en orden temporal."""
    rng = np.random.default_rng(semilla)
    yield {"t": t0, "tipo": "contexto", "sujeto": "*", "datos": {"mission_phase": "INFLIGHT"}}
    yield {"t": t0, "tipo": "contexto", "sujeto": "CM-1", "datos": {"age_years": 44, "microgravity_eva": 1, "surface_eva": 0}}
    yield {"t": t0, "tipo": "contexto", "sujeto": "CM-2", "datos": {"age_years": 39, "antecedentes": ["Migraña recurrente"]}}
    for s in range(duracion):
        t = t0 + s
        # --- cabina, cada 60 s
        if s % 60 == 0:
            co2 = 2.2 if s < 1800 else (2.2 + 1.4 * (s - 1800) / 3600 if s < 5400 else (3.6 if s < 9000 else 2.0))
            yield {"t": t, "sujeto": "CABINA", "canal": "cabin_ppco2", "valor": round(co2 + rng.normal(0, 0.03), 3), "unidad": "mmHg"}
            yield {"t": t, "sujeto": "CABINA", "canal": "cabin_pressure_kpa", "valor": round(70.3 + rng.normal(0, 0.05), 2)}
        # --- CM-1
        if 4000 <= s < 4120:
            yield {"t": t, "sujeto": "CM-1", "canal": "spo2", "valor": 85.0, "valido": False}
        else:
            base = 88.0 if 6000 <= s < 6600 else 97.5
            yield {"t": t, "sujeto": "CM-1", "canal": "spo2", "valor": round(base + rng.normal(0, 0.4), 1)}
        yield {"t": t, "sujeto": "CM-1", "canal": "hr", "valor": round(64 + rng.normal(0, 1.5)),
               "etiquetas": {"reposo": True, "despierto": True}}
        # --- CM-2
        if not 8200 <= s < 8600:
            yield {"t": t, "sujeto": "CM-2", "canal": "spo2", "valor": round(98.0 + rng.normal(0, 0.4), 1)}
        ejercicio = 7000 <= s < 7900
        yield {"t": t, "sujeto": "CM-2", "canal": "hr", "valor": round((150 if ejercicio else 70) + rng.normal(0, 2)),
               "etiquetas": {"reposo": not ejercicio, "despierto": True}}
        if s % 60 == 0:
            yield {"t": t, "sujeto": "CM-1", "canal": "temp", "valor": round(36.8 + rng.normal(0, 0.05), 2), "unidad": "°C"}
            yield {"t": t, "sujeto": "CM-2", "canal": "temp",
                   "valor": round((38.3 if s >= 9500 else 36.9) + rng.normal(0, 0.05), 2), "unidad": "°C"}
        if s % 300 == 0:
            for suj, (ps, pd, g) in {"CM-1": (116, 74, 98), "CM-2": (121, 77, 104)}.items():
                yield {"t": t, "sujeto": suj, "canal": "sbp", "valor": round(ps + rng.normal(0, 3))}
                yield {"t": t, "sujeto": suj, "canal": "dbp", "valor": round(pd + rng.normal(0, 2))}
                yield {"t": t, "sujeto": suj, "canal": "cgm", "valor": round(g + rng.normal(0, 4))}
        # --- mensajes defectuosos que el monitor debe rechazar
        if s == 3000:
            yield {"t": t - 400, "sujeto": "CM-1", "canal": "spo2", "valor": 70.0}        # fuera de orden
            yield {"t": t, "sujeto": "CM-2", "canal": "temp", "valor": 98.6, "unidad": "°F"}   # unidad equivocada
            yield {"t": t, "sujeto": "CM-2", "canal": "hr", "valor": 900}                 # valor imposible


def servidor_tcp(mensajes, host: str = "127.0.0.1", puerto: int = 0, pausa_tras: int | None = None,
                 pausa_s: float = 0.0):
    """Sirve los mensajes como JSON por línea al primer cliente. Devuelve (hilo, puerto).

    ``pausa_tras`` / ``pausa_s`` simulan un silencio del sistema a mitad de emisión.
    """
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind((host, puerto))
    srv.listen(1)
    puerto = srv.getsockname()[1]

    def servir():
        import time
        con, _ = srv.accept()
        with con, srv:
            lote = []
            for i, m in enumerate(mensajes):
                lote.append(json.dumps(m, ensure_ascii=False))
                if pausa_tras is not None and i == pausa_tras:
                    con.sendall(("\n".join(lote) + "\n").encode())
                    lote = []
                    time.sleep(pausa_s)
                elif len(lote) >= 500:
                    con.sendall(("\n".join(lote) + "\n").encode())
                    lote = []
            if lote:
                con.sendall(("\n".join(lote) + "\n").encode())

    h = threading.Thread(target=servir, daemon=True)
    h.start()
    return h, puerto
