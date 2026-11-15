"""Monitor continuo: del flujo de telemetría a eventos de alerta.

PROTOTIPO DE INVESTIGACIÓN. Sólo LEE datos y EMITE avisos para personas: no
envía órdenes al sistema de control ni actúa sobre equipos o tratamientos.

Qué resuelve respecto al motor caso a caso
------------------------------------------
* Convierte muestras sueltas en las medias de ventana que exige el catálogo
  (SpO2 de 2 y 5 min, FC en reposo de 10 min, CO2 de 1 h…), con cobertura
  mínima y sin rellenar huecos (D9, D11, D43).
* Evalúa de forma periódica y agrupa en EPISODIOS: un aviso al empezar,
  recordatorios espaciados y un aviso al terminar, no uno por muestra (D36, D54).
* Vigila la propia telemetría: canal en silencio, enlace caído, mensajes fuera
  de orden, unidades o valores imposibles. Sin datos no hay "todo bien".
* Las alarmas del vehículo (canal OPERATIVO_VEHICULO) se emiten una vez para
  la cabina, no una por tripulante (D28).

Formato de mensaje (un objeto JSON por muestra)
-----------------------------------------------
    {"t": 1794300000.0, "sujeto": "CM-1", "canal": "spo2", "valor": 97.0,
     "valido": true, "unidad": "%", "etiquetas": {"reposo": true}}
    {"t": ..., "tipo": "contexto", "sujeto": "*", "datos": {"mission_phase": "INFLIGHT"}}

``t`` en segundos Unix o ISO-8601. ``sujeto`` = identificador del tripulante,
"CABINA" para telemetría del vehículo, "*" para contexto común. ``canal`` es un
canal continuo de ``CANALES`` o directamente una variable del catálogo (p. ej.
"potassium_mmol_l", "chest_pain_flag"), que se conserva hasta caducar.
"""
from __future__ import annotations

import datetime as _dt
import math
from collections import defaultdict, deque
from dataclasses import dataclass, field

import numpy as np

from .motor import MotorAlertas
from .reglas import NIVELES

CABINA = "CABINA"
REPOSO, DESPIERTO = 1, 2
_ETIQ = {"reposo": REPOSO, "despierto": DESPIERTO}


@dataclass(frozen=True)
class Canal:
    """Cómo se transforma un canal continuo en variables del catálogo."""
    derivadas: dict                     # variable -> (ventana_s, etiqueta exigida o None)
    periodo_s: float                    # periodo nominal de muestreo
    unidad: str
    fis: tuple                          # límites físicos; fuera => mensaje rechazado
    modo: str = "continua"              # "continua": media ponderada por tiempo; "lecturas": media de lecturas
    cobertura_min: float = 0.8          # fracción de la ventana con dato válido (modo continua)
    min_lecturas: int = 2               # lecturas válidas exigidas (modo lecturas)
    flag_calidad: str | None = None     # indicador que se activa si sólo hay señal no fiable
    var_cobertura: str | None = None    # variable donde se informa la cobertura en %
    ambito: str = "SUJETO"              # SUJETO | CABINA
    max_hueco_s: float | None = None    # cuánto "vale" una muestra hasta la siguiente
    silencio_s: float | None = None     # sin muestras durante este tiempo => telemetría perdida

    @property
    def hueco(self):
        return self.max_hueco_s or 3 * self.periodo_s

    @property
    def silencio(self):
        return self.silencio_s or max(30.0, 5 * self.periodo_s)

    @property
    def retencion(self):
        return max(v[0] for v in self.derivadas.values()) + self.hueco


# Valores por defecto: SUPUESTOS de ingeniería a ajustar al sistema real.
CANALES = {
    "spo2": Canal({"spo2_2min": (120, None), "spo2_5min": (300, None)}, 1, "%", (40, 100),
                  flag_calidad="spo2_quality_bad"),
    "eva_spo2": Canal({"eva_spo2_2min": (120, None)}, 1, "%", (40, 100), flag_calidad="spo2_quality_bad"),
    # FC "en reposo" sólo con muestras etiquetadas como reposo (R0156); sin etiqueta no se calcula
    "hr": Canal({"rest_hr_10min": (600, "reposo"), "rest_hr_5min": (300, "reposo"),
                 "awake_hr_5min": (300, "despierto")}, 1, "lpm", (20, 260)),
    "temp": Canal({"core_temp_c": (300, None)}, 60, "°C", (25, 45), cobertura_min=0.6),
    # PA "confirmada": media de al menos dos lecturas válidas en 15 min
    "sbp": Canal({"sbp_confirmed": (900, None)}, 300, "mmHg", (40, 330), modo="lecturas"),
    "dbp": Canal({"dbp_confirmed": (900, None)}, 300, "mmHg", (20, 200), modo="lecturas"),
    "cgm": Canal({"cgm_mg_dl": (900, None)}, 300, "mg/dL", (20, 600), modo="lecturas",
                 flag_calidad="cgm_quality_bad", max_hueco_s=900, silencio_s=1800),
    # media horaria reglamentaria: exige la hora completa (V2 6004, caso B)
    "cabin_ppco2": Canal({"cabin_ppco2_1h": (3600, None)}, 60, "mmHg", (0, 60), cobertura_min=1.0,
                         var_cobertura="cabin_ppco2_1h_coverage_pct", ambito=CABINA),
    "cabin_pressure_kpa": Canal({"cabin_pressure_kpa": (120, None)}, 60, "kPa", (0, 200),
                                cobertura_min=0.5, ambito=CABINA),
}
CGM_14D = 14 * 86400.0


@dataclass
class ConfigMonitor:
    periodo_eval_s: float = 30.0                 # cada cuánto se evalúa a cada sujeto
    t_resolucion_s: float = 120.0                # tiempo sin cumplirse el criterio para cerrar un episodio
    recordatorio_s: dict = field(default_factory=lambda: {3: 900.0, 4: 300.0})   # primer recordatorio, por nivel
    recordatorio_max_s: float = 3600.0           # el intervalo se duplica cada vez, hasta este tope (fatiga de alertas)
    ttl_valor_s: float = 86400.0                 # caducidad de analíticas y otros valores puntuales
    ttl_indicador_s: float = 3600.0              # caducidad de indicadores 0/1 (síntomas, alarmas)
    ttl_por_variable: dict = field(default_factory=dict)
    tolerancia_orden_s: float = 5.0              # retraso admitido entre muestras de un canal
    salto_futuro_max_s: float = 6 * 3600.0       # un salto mayor del reloj se trata como reloj defectuoso
    canales: dict = field(default_factory=lambda: dict(CANALES))


@dataclass
class _Episodio:
    clave: tuple
    ambito: str
    inicio: float
    visto: float
    notificado: float
    nivel: int
    ficha: dict
    n: int
    sin_datos: bool = False
    recordatorios: int = 0


def _iso(t):
    return _dt.datetime.fromtimestamp(t, _dt.timezone.utc).isoformat(timespec="seconds")


def _a_segundos(t):
    if isinstance(t, bool):
        raise ValueError("t")
    if isinstance(t, (int, float)):
        if not math.isfinite(t):
            raise ValueError("t")
        return float(t)
    d = _dt.datetime.fromisoformat(str(t).replace("Z", "+00:00"))
    if d.tzinfo is None:
        d = d.replace(tzinfo=_dt.timezone.utc)
    return d.timestamp()


def ventana(buf, ahora: float, ventana_s: float, hueco_s: float, etiqueta: int = 0) -> dict:
    """Media ponderada por tiempo de los últimos ``ventana_s`` segundos.

    Cada muestra vale hasta la siguiente, como máximo ``hueco_s``; los huecos
    mayores no se rellenan. Devuelve la media y cobertura de la señal válida y
    las de toda la señal (válida o no), para poder pedir verificación.
    """
    vacio = {"valor": None, "cobertura": 0.0, "valor_todo": None, "cobertura_todo": 0.0}
    if not buf:
        return vacio
    a = np.array([(t, v, ok, et) for (t, v, ok, et) in buf if ahora - ventana_s - hueco_s < t <= ahora], dtype=float)
    if a.size == 0:
        return vacio
    t, v, ok, et = a[:, 0], a[:, 1], a[:, 2] > 0, a[:, 3].astype(int)
    fin = np.minimum(np.minimum(np.append(t[1:], np.inf), t + hueco_s), ahora)
    dur = np.clip(fin - np.maximum(t, ahora - ventana_s), 0, None)
    if etiqueta:
        dur = np.where((et & etiqueta) > 0, dur, 0.0)
    dv = np.where(ok, dur, 0.0)
    sv, st = dv.sum(), dur.sum()
    return {"valor": float((v * dv).sum() / sv) if sv > 0 else None, "cobertura": float(sv / ventana_s),
            "valor_todo": float((v * dur).sum() / st) if st > 0 else None, "cobertura_todo": float(st / ventana_s)}


def metricas_cgm(buf, ahora: float) -> dict:
    """TBR/TIR/TAR/CV sobre los últimos 14 días (anexo de fórmulas §4.1).

    Sólo cuentan intervalos entre lecturas válidas consecutivas separadas ≤15 min.
    TBR54 es subconjunto de TBR70. Son exposiciones, no probabilidades.
    """
    a = np.array([(t, v, ok) for (t, v, ok, _) in buf if ahora - CGM_14D < t <= ahora], dtype=float)
    if len(a) < 2:
        return {}
    t, g, ok = a[:, 0], a[:, 1], a[:, 2] > 0
    dt = np.diff(t)
    usar = (dt > 0) & (dt <= 900) & ok[:-1] & ok[1:]
    w, x = dt[usar], g[:-1][usar]
    total = w.sum()
    dias = (t[-1] - t[0]) / 86400.0
    out = {"cgm_days": round(float(dias), 2),
           "cgm_coverage_pct": round(100 * float(total / max(t[-1] - t[0], 1e-9)), 1)}
    if total > 0:
        media = float((x * w).sum() / total)
        sd = float(np.sqrt(((x - media) ** 2 * w).sum() / total))
        out.update({"cgm_tbr70_pct": 100 * float(w[x < 70].sum() / total),
                    "cgm_tbr54_pct": 100 * float(w[x < 54].sum() / total),
                    "cgm_tir_pct": 100 * float(w[(x >= 70) & (x <= 180)].sum() / total),
                    "cgm_tar180_pct": 100 * float(w[x > 180].sum() / total),
                    "cgm_cv_pct": 100 * sd / media if media > 0 else 0.0})
    return out


class MonitorContinuo:
    """Mantiene el estado del flujo y devuelve eventos al ingerir mensajes."""

    def __init__(self, entorno: str = "ESPACIO", config: ConfigMonitor | None = None,
                 motor: MotorAlertas | None = None, usar_ensamble: bool = True):
        self.cfg = config or ConfigMonitor()
        self.motor = motor or MotorAlertas(entorno, usar_ensamble=usar_ensamble)
        self.entorno = self.motor.entorno
        self.ahora: float | None = None
        self._prox: float | None = None
        self._buf = defaultdict(deque)            # (ambito, canal) -> muestras
        self._ultimo_t = {}                       # (ambito, canal) -> t de la última muestra
        self._perdido = set()                     # canales en silencio ya notificados
        self._ctx = defaultdict(dict)             # ambito -> contexto persistente
        self._puntual = defaultdict(dict)         # ambito -> variable -> (t, valor)
        self._epis: dict[tuple, _Episodio] = {}
        self._nivel = {}                          # ambito -> (nivel, sugerido por el ensamble)
        self._cgm_cache = {}
        self._n_epi = 0
        self._enlace_ok = True
        self.sujetos: set[str] = set()
        self.ultimo: dict[str, dict] = {}         # última salida completa del motor por sujeto
        self.cuentas = defaultdict(int)           # estadísticas
        self._rechazo_avisado = set()

    # ---------------------------------------------------------------- entrada
    def ingerir(self, m: dict) -> list[dict]:
        """Procesa un mensaje y devuelve los eventos que genera (puede ser lista vacía)."""
        self.cuentas["mensajes"] += 1
        if not isinstance(m, dict):
            return self._rechazar(None, "?", "formato", "el mensaje no es un objeto JSON")
        tipo = m.get("tipo", "muestra")
        if tipo == "error_formato":
            return self._rechazar(None, "?", "formato", str(m.get("detalle", "línea no interpretable"))[:120])
        try:
            t = _a_segundos(m["t"]) if "t" in m else None
        except (ValueError, TypeError):
            return self._rechazar(None, "?", "tiempo", "marca de tiempo ilegible")
        if tipo == "latido":
            return self.avanzar(t) if t is not None else []
        if tipo == "conexion":
            return self._conexion(str(m.get("estado", "")), t)
        if t is None:
            return self._rechazar(None, "?", "tiempo", "falta la marca de tiempo 't'")
        if self.ahora is not None and t - self.ahora > self.cfg.salto_futuro_max_s:
            return self._rechazar(t, m.get("sujeto", "?"), "reloj_futuro",
                                  "salto de reloj hacia el futuro mayor que el admitido")
        suj = m.get("sujeto")
        if not isinstance(suj, str) or not suj:
            return self._rechazar(t, "?", "sujeto", "falta el identificador de sujeto")
        ev = self.avanzar(t)          # primero los ciclos pendientes, con el estado anterior a este mensaje
        if tipo == "contexto":
            datos = m.get("datos")
            if not isinstance(datos, dict):
                return ev + self._rechazar(t, suj, "formato", "contexto sin 'datos'")
            self._ctx[suj].update(datos)
            if suj not in ("*", CABINA):
                self.sujetos.add(suj)
            return ev

        canal, valor = m.get("canal"), m.get("valor")
        if isinstance(valor, bool):
            valor = 1.0 if valor else 0.0
        if not isinstance(valor, (int, float)) or not math.isfinite(valor):
            return ev + self._rechazar(t, suj, "valor", f"{canal}: valor no numérico")
        if canal in self.cfg.canales:
            c = self.cfg.canales[canal]
            amb = CABINA if c.ambito == CABINA else suj
            u = m.get("unidad")
            if u is not None and _norm_u(u) != _norm_u(c.unidad):
                return ev + self._rechazar(t, amb, "unidad", f"{canal}: llegó '{u}', se espera '{c.unidad}'")
            if not c.fis[0] <= valor <= c.fis[1]:
                return ev + self._rechazar(t, amb, "valor", f"{canal}: {valor} fuera de [{c.fis[0]}, {c.fis[1]}]")
            k = (amb, canal)
            if k in self._ultimo_t and t < self._ultimo_t[k] - self.cfg.tolerancia_orden_s:
                return ev + self._rechazar(t, amb, "fuera_de_orden", f"{canal}: muestra anterior a las ya recibidas")
            et = sum(bit for nombre, bit in _ETIQ.items() if (m.get("etiquetas") or {}).get(nombre))
            b = self._buf[k]
            b.append((t, float(valor), 1.0 if m.get("valido", True) else 0.0, et))
            ret = CGM_14D if canal == "cgm" else c.retencion
            while b and b[0][0] < t - ret:
                b.popleft()
            self._ultimo_t[k] = max(t, self._ultimo_t.get(k, t))
            if k in self._perdido:
                self._perdido.discard(k)
                ev.append(self._evento(t, "TELEMETRIA_RECUPERADA", amb, canal=canal))
            if amb != CABINA:
                self.sujetos.add(amb)
            self.cuentas["muestras"] += 1
        elif canal in self.motor.conocidas:
            if not m.get("valido", True):
                return ev + self._rechazar(t, suj, "valor", f"{canal}: valor puntual marcado como no válido")
            self._puntual[suj][canal] = (t, float(valor))
            if suj not in ("*", CABINA):
                self.sujetos.add(suj)
            self.cuentas["valores_puntuales"] += 1
        else:
            return ev + self._rechazar(t, suj, "canal_desconocido", f"canal '{canal}' no configurado")
        return ev

    def avanzar(self, t: float | None) -> list[dict]:
        """Adelanta el reloj del monitor y ejecuta las evaluaciones periódicas pendientes."""
        if t is None:
            return []
        if self.ahora is None:
            self.ahora, self._prox = t, t + self.cfg.periodo_eval_s
            return []
        self.ahora = max(self.ahora, t)
        ev = []
        if self.ahora - self._prox > 40 * self.cfg.periodo_eval_s:      # hueco largo: no simular miles de ciclos
            limite = self._prox + 40 * self.cfg.periodo_eval_s
            while self._prox <= limite:
                ev += self._ciclo(self._prox)
                self._prox += self.cfg.periodo_eval_s
            self._prox = self.ahora
        while self._prox <= self.ahora:
            ev += self._ciclo(self._prox)
            self._prox += self.cfg.periodo_eval_s
        return ev

    # --------------------------------------------------------------- derivar
    def datos_de(self, sujeto: str, ahora: float) -> dict:
        """Construye la entrada del motor para un sujeto en el instante ``ahora``."""
        d: dict = {}
        for amb in ("*", CABINA, sujeto):
            d.update(self._ctx.get(amb, {}))
        for amb in ("*", CABINA, sujeto):
            for var, (t, v) in self._puntual.get(amb, {}).items():
                ttl = self.cfg.ttl_por_variable.get(var) or (
                    self.cfg.ttl_indicador_s if var.endswith(("_flag", "_alarm", "_alert", "_event", "_bad"))
                    else self.cfg.ttl_valor_s)
                if ahora - t <= ttl:
                    d[var] = v
        for canal, c in self.cfg.canales.items():
            buf = self._buf.get((CABINA if c.ambito == CABINA else sujeto, canal))
            if not buf:
                continue
            for var, (vent, etiq) in c.derivadas.items():
                if var not in self.motor.conocidas:
                    continue
                if c.modo == "lecturas":
                    lect = [(v, ok) for (t, v, ok, _) in buf if ahora - vent < t <= ahora]
                    buenas = [v for v, ok in lect if ok]
                    if len(buenas) >= c.min_lecturas:
                        d[var] = float(np.mean(buenas))
                    elif len(lect) >= c.min_lecturas and c.flag_calidad:
                        d[var], d[c.flag_calidad] = float(np.mean([v for v, _ in lect])), 1
                else:
                    w = ventana(buf, ahora, vent, c.hueco, _ETIQ.get(etiq, 0))
                    cob = round(100 * w["cobertura"], 1)
                    if c.var_cobertura:
                        if w["valor"] is not None:
                            d[var], d[c.var_cobertura] = w["valor"], min(cob, 100.0)
                    elif w["cobertura"] >= c.cobertura_min:
                        d[var] = w["valor"]
                    elif w["cobertura_todo"] >= c.cobertura_min and c.flag_calidad:
                        d[var], d[c.flag_calidad] = w["valor_todo"], 1     # sólo hay señal no fiable
            if canal == "cgm":
                k = (sujeto, int(ahora // 300))
                if self._cgm_cache.get(sujeto, (None,))[0] != k:
                    self._cgm_cache[sujeto] = (k, metricas_cgm(buf, ahora))
                d.update({a: b for a, b in self._cgm_cache[sujeto][1].items() if a in self.motor.conocidas})
        return d

    # ----------------------------------------------------------------- ciclo
    def _ciclo(self, t: float) -> list[dict]:
        ev = []
        for (amb, canal), ult in list(self._ultimo_t.items()):
            if t - ult > self.cfg.canales[canal].silencio and (amb, canal) not in self._perdido:
                self._perdido.add((amb, canal))
                ev.append(self._evento(t, "TELEMETRIA_PERDIDA", amb, canal=canal, segundos_sin_dato=round(t - ult),
                                       detalle="Sin muestras del canal: lo que dependa de él deja de evaluarse. "
                                               "No equivale a normalidad."))
        vistos, con_dato, dudosas = set(), set(), set()
        objetivos = sorted(self.sujetos) or ([CABINA] if any(k[0] == CABINA for k in self._buf) else [])
        for suj in objetivos:
            res = self.motor.evaluar(self.datos_de(suj, t), explicar=False)
            self.ultimo[suj] = res
            self.cuentas["evaluaciones"] += 1
            usados = set(res["auditoria"]["entradas_usadas"])
            for a in res["alertas"]:
                var, op = a["criterio"].split()[:2]
                amb = CABINA if a["canal"] == "OPERATIVO_VEHICULO" else suj
                sentido = "bajo" if op in ("<", "<=") else ("alto" if op in (">", ">=") else a["id"])
                self._ver(ev, vistos, t, ("ALERTA", amb, var, sentido), amb, NIVELES.index(a["nivel"]), a)
            for v in res["verificar_señal"]:
                self._ver(ev, vistos, t, ("VERIFICAR", suj, v["criterio"].split()[0], v["id"]), suj,
                          NIVELES.index(v["nivel"]), v)
                dudosas.add((suj, v["criterio"].split()[0]))
            for c in res["completar_contexto"]:
                amb = CABINA if c["canal"] == "OPERATIVO_VEHICULO" else suj
                self._ver(ev, vistos, t, ("CONTEXTO", amb, c["id"]), amb, NIVELES.index(c["nivel"]), c)
                dudosas.add((amb, c["criterio"].split()[0]))
            for q in res["avisos_de_calidad_y_abstencion"]:
                self._ver(ev, vistos, t, ("CALIDAD", suj, q["id"]), suj, 0, q)
            if res["origen_del_nivel"] == "ENSAMBLE":        # el ensamble sube el nivel: se avisa como sugerencia
                e = res["ensamble"]
                self._ver(ev, vistos, t, ("SUGERENCIA", suj, "ensamble"), suj, NIVELES.index(res["nivel_final"]), {
                    "id": "ENSAMBLE", "nombre": "Nivel sugerido por el ensamble, a confirmar", "nivel": res["nivel_final"],
                    "canal": "CLINICO", "criterio": "puntuación acumulada del ensamble sobre su umbral de decisión",
                    "valor": e["puntuacion_acumulada"].get(f">={res['nivel_final']}"),
                    "accion_propuesta": "Repetir o confirmar la medida cercana al umbral antes de actuar",
                    "confirmacion": "; ".join(res["notas_de_fusion"])[:400]})
            for k in self._epis:                       # ¿sigue habiendo dato fiable para dar por resuelta la alerta?
                if k[1] in (suj, CABINA) and k[2] in usados and (k[1], k[2]) not in dudosas:
                    con_dato.add(k)
        ev += self._cerrar(t, vistos, con_dato)
        # nivel por ámbito = el mayor entre sus episodios abiertos (ya llevan su histéresis)
        actual = {amb: (0, False) for amb in objetivos + ([CABINA] if objetivos else [])}
        for e in self._epis.values():
            if e.clave[0] in ("ALERTA", "SUGERENCIA"):
                n, s = actual.get(e.ambito, (0, False))
                if e.nivel > n:
                    actual[e.ambito] = (e.nivel, e.clave[0] == "SUGERENCIA")
        for amb, (niv, sug) in actual.items():
            previo = self._nivel.get(amb, (0, False))
            if niv != previo[0]:
                ev.append(self._evento(t, "NIVEL_CAMBIA", amb, nivel=NIVELES[niv], nivel_anterior=NIVELES[previo[0]],
                                       sugerido_por_ensamble=sug))
            self._nivel[amb] = (niv, sug)
        self.cuentas["sujeto_segundos"] += len(self.sujetos) * self.cfg.periodo_eval_s
        return ev

    def _ver(self, ev, vistos, t, clave, amb, nivel, ficha):
        vistos.add(clave)
        tipo = clave[0]
        e = self._epis.get(clave)
        if e is None:
            self._n_epi += 1
            self._epis[clave] = _Episodio(clave, amb, t, t, t, nivel, ficha, self._n_epi)
            self.cuentas[f"episodios_{tipo.lower()}"] += 1
            ev.append(self._evento(t, f"{tipo}_INICIO", amb, episodio=self._n_epi, **self._resumen(ficha)))
            return
        e.visto, e.sin_datos = t, False
        if nivel > e.nivel:
            ev.append(self._evento(t, f"{tipo}_ESCALA", amb, episodio=e.n, nivel_anterior=NIVELES[e.nivel],
                                   **self._resumen(ficha)))
            e.notificado = t
        elif tipo == "ALERTA" and nivel in self.cfg.recordatorio_s and t - e.notificado >= min(
                self.cfg.recordatorio_s[nivel] * 2 ** e.recordatorios, self.cfg.recordatorio_max_s):
            ev.append(self._evento(t, "ALERTA_RECORDATORIO", amb, episodio=e.n, duracion_s=round(t - e.inicio),
                                   **self._resumen(ficha)))
            e.notificado, e.recordatorios = t, e.recordatorios + 1
        e.nivel, e.ficha = nivel, ficha

    def _cerrar(self, t, vistos, con_dato):
        ev = []
        for clave, e in list(self._epis.items()):
            if clave in vistos:
                continue
            tipo = clave[0]
            if tipo == "ALERTA" and clave not in con_dato:
                if not e.sin_datos:                     # el criterio dejó de poder evaluarse: NO se da por resuelto
                    e.sin_datos = True
                    ev.append(self._evento(t, "ALERTA_SIN_SEGUIMIENTO", e.ambito, episodio=e.n,
                                           duracion_s=round(t - e.inicio), **self._resumen(e.ficha),
                                           detalle="La alerta sigue abierta: faltan datos para confirmar si se resolvió."))
                continue
            if t - e.visto >= (self.cfg.t_resolucion_s if tipo in ("ALERTA", "SUGERENCIA") else self.cfg.periodo_eval_s):
                ev.append(self._evento(t, f"{tipo}_FIN", e.ambito, episodio=e.n, duracion_s=round(e.visto - e.inicio),
                                       id_regla=e.ficha["id"], nombre=e.ficha["nombre"]))
                del self._epis[clave]
        return ev

    # -------------------------------------------------------------- utilidades
    def _conexion(self, estado, t):
        t = t if t is not None else self.ahora
        if estado == "PERDIDA" and self._enlace_ok:
            self._enlace_ok = False
            self.cuentas["caidas_de_enlace"] += 1
            return [self._evento(t, "CONEXION_PERDIDA", "SISTEMA", detalle=(
                "Sin enlace con el sistema de control y signos vitales: el motor no puede evaluar. Las alertas "
                "abiertas siguen abiertas y la falta de avisos NO significa ausencia de problema."))]
        if estado == "RESTABLECIDA" and not self._enlace_ok:
            self._enlace_ok = True
            return [self._evento(t, "CONEXION_RESTABLECIDA", "SISTEMA")]
        return []

    def _rechazar(self, t, amb, motivo, detalle):
        self.cuentas[f"rechazados_{motivo}"] += 1
        if (amb, motivo) in self._rechazo_avisado:        # un aviso por ámbito y motivo; el resto, al contador
            return []
        self._rechazo_avisado.add((amb, motivo))
        return [self._evento(self.ahora if self.ahora is not None else t, "MENSAJE_RECHAZADO", amb, motivo=motivo,
                             detalle=detalle + ". Los siguientes del mismo tipo sólo se cuentan.")]

    @staticmethod
    def _resumen(f):
        return {"id_regla": f["id"], "nombre": f["nombre"], "nivel": f["nivel"], "canal_aviso": f["canal"],
                "criterio": f["criterio"], "valor": f["valor"], "accion_propuesta": f["accion_propuesta"],
                "confirmacion": f["confirmacion"], **({"motivo": f["motivo"]} if "motivo" in f else {}),
                **({"falta": f["falta"]} if "falta" in f else {})}

    @staticmethod
    def _evento(t, tipo_evento, ambito, **kw):
        return {"t": t, "hora_utc": _iso(t) if t is not None else None, "evento": tipo_evento, "ambito": ambito, **kw}

    def estado_actual(self) -> dict:
        """Fotografía para un panel: nivel por ámbito, episodios abiertos y telemetría."""
        return {
            "hora_utc": _iso(self.ahora) if self.ahora else None, "enlace_ok": self._enlace_ok,
            "niveles": {a: {"nivel": NIVELES[n], "sugerido_por_ensamble": bool(s)} for a, (n, s) in self._nivel.items()},
            "episodios_abiertos": [{"episodio": e.n, "tipo": e.clave[0], "ambito": e.ambito, "id_regla": e.ficha["id"],
                                    "nombre": e.ficha["nombre"], "nivel": NIVELES[e.nivel],
                                    "desde_utc": _iso(e.inicio), "sin_seguimiento": e.sin_datos}
                                   for e in sorted(self._epis.values(), key=lambda x: (-x.nivel, x.n))],
            "canales_en_silencio": sorted(f"{a}/{c}" for a, c in self._perdido),
            "estadisticas": self.estadisticas(),
            "aviso": "Sin dato o sin enlace no hay evaluación: no interpretar como normalidad.",
        }

    def estadisticas(self) -> dict:
        dias = self.cuentas["sujeto_segundos"] / 86400.0
        out = dict(self.cuentas)
        out["sujeto_dias"] = round(dias, 3)
        out["episodios_de_alerta_por_100_sujeto_dias"] = (
            round(100 * self.cuentas["episodios_alerta"] / dias, 1) if dias > 0 else None)
        return out


def _norm_u(u: str) -> str:
    return str(u).strip().lower().replace(" ", "").replace("º", "°")
