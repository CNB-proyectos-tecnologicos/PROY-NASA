#!/usr/bin/env python3
"""Servidor mínimo del Monitor Aerospace Health.

Hace tres cosas, solo con la biblioteca estándar:
  1. Sirve la página (web/index.html).
  2. Expone el motor de alertas del proyecto (carpeta motor/, sin cambios) como herramienta:
       POST /api/ingerir   {"mensajes": [{"t", "sujeto", "canal", "valor", ...}]}  -> eventos del monitor continuo
       POST /api/evaluar   {"datos": {...}, "explicar": false}                     -> evaluación caso a caso (reglas + ensamble)
       POST /api/reiniciar                                                          -> ventanas y episodios en cero
       GET  /api/estado                                                             -> versión, catálogo, modelo y episodios abiertos
       GET  /api/catalogo                                                           -> los dominios, variables y reglas del catálogo
  3. Recibe señales reales y las reparte a la página:
       POST /api/senal     un JSON o varias líneas JSON  ({"canal": "hr", "valor": 72} o {"hr": 72, "spo2": 98})
       TCP  --tcp 9100     un JSON por línea (el mismo formato)
       GET  /api/flujo     flujo de eventos (SSE) que la página escucha con el modo demo apagado
  4. Lleva la conversación a un modelo de lenguaje:
       POST /api/llm        {"proveedor": "groq" | "local", "mensajes": [...], "modelo", "base"}
                            groq  = API de Groq (https://api.groq.com/openai/v1), por defecto openai/gpt-oss-120b
                            local = cualquier servidor compatible con OpenAI en la propia máquina (p. ej. Ollama)
       POST /api/llm/clave  {"clave": "gsk_..."}  guarda GROQ_API_KEY en .env
       POST /api/llm/probar comprueba que el proveedor responde

PROTOTIPO DE INVESTIGACIÓN. No diagnostica ni sustituye al médico de vuelo.
Uso:  python3 servidor.py [--puerto 8777] [--host 127.0.0.1] [--tcp 9100] [--sin-ensamble]
"""
import argparse
import json
import mimetypes
import os
import queue
import socketserver
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
WEB = RAIZ / "web"
DATOS = RAIZ / "datos"
PRESUPUESTO_LOTE_S = 0.35                       # tiempo de motor que se admite por lote de lecturas
sys.path.insert(0, str(RAIZ))

from motor.flujo import MonitorContinuo          # noqa: E402  (el motor del proyecto, sin cambios)
from motor.motor import FISICOS_EXTRA, VERSION, MotorAlertas    # noqa: E402
from motor.reglas import NIVELES, QC_POR_VAR     # noqa: E402

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


class Tierra:
    """Enlace tripulación <-> médico en tierra: último estado de cada tripulante y mensajes entre ambos.

    Nada se simula: el directorio lo forman los tripulantes cuyo monitor ha informado a este servidor,
    y cada mensaje lo escribe una persona en el monitor o en la consola de tierra (/medico).
    """

    def __init__(self):
        self.candado = threading.Lock()
        self.estados = {}
        self.mensajes = []
        self.archivo = DATOS / "mensajes.jsonl"
        if self.archivo.is_file():
            for linea in self.archivo.read_text(encoding="utf-8").splitlines():
                try:
                    self.mensajes.append(json.loads(linea))
                except ValueError:
                    pass

    def informar(self, d):
        suj = str(d.get("sujeto") or "").strip()
        if not suj:
            raise ValueError("falta 'sujeto'")
        with self.candado:
            self.estados[suj] = {"sujeto": suj, "t": time.time(), "estado": d.get("estado") or {}}
        return {"ok": True}

    def directorio(self):
        ahora = time.time()
        with self.candado:
            out = []
            for suj, e in self.estados.items():
                r = e["estado"].get("resumen") or {}
                out.append({"sujeto": suj, "nombre": r.get("nombre"), "rol": r.get("rol"), "nivel": r.get("nivel"), "alertas": r.get("alertas"),
                            "mision": r.get("mision"), "hace_s": round(ahora - e["t"], 1), "en_linea": ahora - e["t"] < 15,
                            "sin_leer": sum(1 for m in self.mensajes if m["sujeto"] == suj and m["de"] == "tripulante" and not m.get("leido"))})
            return sorted(out, key=lambda x: x["sujeto"])

    def estado(self, suj):
        with self.candado:
            e = self.estados.get(suj)
            return dict(e, hace_s=round(time.time() - e["t"], 1)) if e else None

    def enviar(self, d):
        suj, de, texto = str(d.get("sujeto") or "").strip(), d.get("de"), str(d.get("texto") or "").strip()
        if not suj or de not in ("tripulante", "tierra") or not texto:
            raise ValueError("un mensaje necesita 'sujeto', 'de' (tripulante o tierra) y 'texto'")
        with self.candado:
            m = {"id": (self.mensajes[-1]["id"] + 1) if self.mensajes else 1, "t": time.time(), "sujeto": suj, "de": de,
                 "autor": str(d.get("autor") or "")[:80], "tipo": d.get("tipo") or "mensaje", "texto": texto[:8000]}
            if d.get("adjunto") is not None:
                m["adjunto"] = d["adjunto"]
            self.mensajes.append(m)
            DATOS.mkdir(exist_ok=True)
            with open(self.archivo, "a", encoding="utf-8") as fh:
                fh.write(json.dumps(m, ensure_ascii=False) + "\n")
            return m

    def leer(self, suj, desde=0, lector=None):
        with self.candado:
            out = [m for m in self.mensajes if m["sujeto"] == suj and m["id"] > desde]
            if lector:                                  # lo que lee una parte queda marcado como leído por ella
                for m in self.mensajes:
                    if m["sujeto"] == suj and m["de"] != lector:
                        m["leido"] = True
            return out
GROQ_MODELO = "openai/gpt-oss-120b"
LOCAL_BASE = "http://127.0.0.1:11434/v1"


def _a_json(o):
    try:
        return float(o)
    except (TypeError, ValueError):
        return str(o)


class Estacion:
    """Un motor compartido: el monitor continuo (flujo -> eventos) y la evaluación caso a caso."""

    def __init__(self, usar_ensamble=True):
        self.candado = threading.Lock()
        self.aviso = None
        try:
            self.motor = MotorAlertas("ESPACIO", usar_ensamble=usar_ensamble)
            self.aviso = self.motor.aviso_modelo
        except Exception as ex:                    # p. ej. falta scikit-learn: se sigue solo con reglas
            self.aviso = f"No pude cargar el ensamble ({type(ex).__name__}: {ex}); sigo solo con reglas."
            self.motor = MotorAlertas("ESPACIO", usar_ensamble=False)
        self.tierra = Tierra()
        self.costo_eval = 0.08                     # segundos que tarda una evaluación del motor en este equipo (media móvil)
        self._flujo = {}                           # último estado del flujo, para responder sin esperar al motor
        self.oyentes = []                          # colas de las páginas que escuchan /api/flujo
        self.n_senales = 0
        DATOS.mkdir(exist_ok=True)
        self.bitacora = DATOS / "eventos.jsonl"
        self.reiniciar()

    def reiniciar(self):
        with self.candado:
            self.monitor = MonitorContinuo("ESPACIO", motor=self.motor)
            self.periodo_base = self.monitor.cfg.periodo_eval_s
            self.monitor.ingerir({"tipo": "contexto", "t": time.time(), "sujeto": "*", "datos": {"mission_phase": "INFLIGHT"}})

    def ingerir(self, mensajes):
        # El número de evaluaciones por lote se acota: un equipo lento o un lote largo (la hora previa del modo demo)
        # no deben dejar al servidor sin responder. Se ajusta el periodo de evaluación del monitor solo durante el lote.
        eventos = []
        ts = [m["t"] for m in mensajes if isinstance(m, dict) and type(m.get("t")) in (int, float)]
        tramo = (max(ts) - min(ts)) if ts else 0.0
        with self.candado:
            mon, base = self.monitor, self.periodo_base
            caben = max(1, min(4, int(PRESUPUESTO_LOTE_S / max(self.costo_eval, 1e-3))))
            mon.cfg.periodo_eval_s = max(base, tramo / caben)
            n0, t0 = mon.cuentas["evaluaciones"], time.perf_counter()
            try:
                for m in mensajes:
                    eventos += mon.ingerir(dict(m))
            finally:
                dn, dt = mon.cuentas["evaluaciones"] - n0, time.perf_counter() - t0
                if dn > 0:
                    self.costo_eval = 0.7 * self.costo_eval + 0.3 * dt / dn
                mon.cfg.periodo_eval_s = base
                if getattr(mon, "_prox", None) is not None and mon.ahora is not None:
                    mon._prox = min(mon._prox, mon.ahora + base)
        if eventos:
            with self.bitacora.open("a", encoding="utf-8") as f:
                for e in eventos:
                    f.write(json.dumps(e, ensure_ascii=False, default=_a_json) + "\n")
        return eventos

    def evaluar(self, datos, explicar=False):
        with self.candado:
            return self.motor.evaluar(dict(datos), explicar=bool(explicar))

    def estado(self):
        m = self.motor
        if self.candado.acquire(timeout=0.3):       # si el motor está ocupado se responde con el último estado conocido
            try:
                self._flujo = self.monitor.estado_actual()
            finally:
                self.candado.release()
        flujo = self._flujo
        return {"servidor": "Monitor Aerospace Health", "motor": {"version": VERSION, "entorno": m.entorno, "catalogo": m.catalogo, "reglas": len(m.reglas),
                "ensamble": m.ensamble is not None, "modelo": (m.meta_modelo or {}).get("id"), "aviso": self.aviso},
                "flujo": flujo, "llm": {"groq": bool(clave_groq()), "modelo_groq": GROQ_MODELO, "base_local": LOCAL_BASE},
                "senales_recibidas": self.n_senales, "paginas_escuchando": len(self.oyentes)}

    def catalogo(self):
        """Dominios -> variables -> reglas, con el nivel que asigna el motor cargado."""
        if getattr(self, "_catalogo", None):
            return self._catalogo
        crudo = json.loads((RAIZ / "motor" / "datos" / "reglas_espaciales.json").read_text(encoding="utf-8"))
        por_id = {r.id: r for r in self.motor.reglas}
        num = self.motor.spec["num"]

        def limites(v):                            # los mismos límites con que el motor valida cada dato
            if v in num:
                return list(num[v][1])
            if v in FISICOS_EXTRA:
                return list(FISICOS_EXTRA[v])
            return [0, 2] if v == "mission_phase" else [0, 1]
        dominios = {}
        contexto = {}
        for r in crudo["reglas"]:
            o = por_id.get(r["id"])
            if o is None:
                continue
            v = dominios.setdefault(r["dominio"], {}).setdefault(r["variable"], {
                "variable": r["variable"], "unidad": r["unidad"], "indicador": r["unidad"] == "indicador",
                "limites": limites(r["variable"]), "reglas": []})
            for g in list(o.gates) + list(o.gates_opc):
                contexto[g[0]] = limites(g[0])
            v["reglas"].append({"id": r["id"], "nombre": r["nombre"], "op": r["comparador"], "umbral": r["umbral"],
                                "nivel": NIVELES[o.nivel] if o.nivel else None, "habilitada": bool(o.habilitada), "accion": r["accion"],
                                "confirmacion": r["confirmacion"], "evidencia": r["evidencia"], "ventana": r["ventana"],
                                "justificacion": r["justificacion"], "url": r["url"],
                                "canal": o.canal, "gates": [[g[0], g[1], g[2]] for g in o.gates],
                                "gates_opc": [[g[0], g[1], g[2]] for g in o.gates_opc]})
        self._catalogo = {"version": crudo.get("version"), "actualizado": crudo.get("actualizado"), "n_reglas": len(crudo["reglas"]),
                          "aviso": crudo.get("disclaimer"), "niveles": list(NIVELES),
                          "calidad_por_variable": QC_POR_VAR, "contexto": contexto,
                          "dominios": [{"nombre": d, "variables": list(vs.values())} for d, vs in dominios.items()]}
        return self._catalogo

    # ---- señales reales: llegan por HTTP o TCP y se reparten a las páginas
    def senal(self, texto):
        n = 0
        for linea in texto.splitlines() or [texto]:
            linea = linea.strip()
            if not linea:
                continue
            try:
                m = json.loads(linea)
            except ValueError:
                m = {"texto": linea}                # p. ej. "hr=72,spo2=98": la página lo interpreta
            for q in list(self.oyentes):
                try:
                    q.put_nowait(m)
                except queue.Full:
                    pass
            n += 1
        self.n_senales += n
        return n


def clave_groq():
    k = os.environ.get("GROQ_API_KEY", "").strip()
    env = RAIZ / ".env"
    if not k and env.exists():
        for linea in env.read_text(encoding="utf-8").splitlines():
            if linea.strip().startswith("GROQ_API_KEY="):
                k = linea.split("=", 1)[1].strip().strip('"').strip("'")
    return k


def guardar_clave_groq(clave):
    clave = clave.strip()
    os.environ["GROQ_API_KEY"] = clave
    env = RAIZ / ".env"
    lineas = [x for x in (env.read_text(encoding="utf-8").splitlines() if env.exists() else []) if not x.strip().startswith("GROQ_API_KEY=")]
    if clave:
        lineas.append("GROQ_API_KEY=" + clave)
    env.write_text("\n".join(lineas) + "\n", encoding="utf-8")


def _post_json(url, cuerpo, cabeceras, espera):
    pet = urllib.request.Request(url, data=json.dumps(cuerpo).encode(), headers=dict({"Content-Type": "application/json",
                                 "User-Agent": "monitor-aerospace-health/2.0"}, **cabeceras))
    with urllib.request.urlopen(pet, timeout=espera) as r:
        return json.loads(r.read())


def llamar_llm(proveedor, mensajes, modelo=None, base=None, max_tokens=900):
    """Devuelve (texto, modelo usado). Groq es la API real; 'local' es un servidor compatible con OpenAI en esta máquina."""
    if proveedor == "local":
        url = (base or LOCAL_BASE).rstrip("/") + "/chat/completions"
        modelo = modelo or "llama3.1"
        d = _post_json(url, {"model": modelo, "messages": mensajes, "temperature": 0.3, "max_tokens": max_tokens, "stream": False}, {}, 120)
        return d["choices"][0]["message"]["content"], modelo
    if not clave_groq():
        raise RuntimeError("No hay GROQ_API_KEY en el servidor. Escríbela en Opciones › Asistente o en el archivo .env.")
    modelo = modelo or GROQ_MODELO
    cab = {"Authorization": "Bearer " + clave_groq()}
    cuerpo = {"model": modelo, "messages": mensajes, "temperature": 0.3, "max_completion_tokens": max_tokens}
    if "gpt-oss" in modelo:                         # modelos con razonamiento: esfuerzo bajo para responder rápido
        cuerpo["reasoning_effort"] = "low"
    try:
        d = _post_json(GROQ_URL, cuerpo, cab, 40)
    except urllib.error.HTTPError as ex:
        if ex.code != 400 or "reasoning_effort" not in cuerpo:
            raise
        cuerpo.pop("reasoning_effort")
        d = _post_json(GROQ_URL, cuerpo, cab, 40)
    return d["choices"][0]["message"]["content"] or "", modelo


class Servidor(ThreadingHTTPServer):
    daemon_threads = True

    def handle_error(self, request, client_address):   # una conexión cortada por el navegador no merece una traza en la terminal
        if isinstance(sys.exc_info()[1], (ConnectionError, TimeoutError)):
            return
        super().handle_error(request, client_address)


class Peticion(BaseHTTPRequestHandler):
    server_version = "MonitorAH/1.0"
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):                      # sin ruido en la terminal
        pass

    def _enviar(self, codigo, cuerpo, tipo="application/json; charset=utf-8"):
        if not isinstance(cuerpo, (bytes, bytearray)):
            cuerpo = json.dumps(cuerpo, ensure_ascii=False, default=_a_json).encode("utf-8")
        try:
            self.send_response(codigo)
            self.send_header("Content-Type", tipo)
            self.send_header("Content-Length", str(len(cuerpo)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(cuerpo)
        except (ConnectionError, TimeoutError):      # el navegador cerró o canceló la petición (recarga, pestaña cerrada): no es un error
            self.close_connection = True

    def _cuerpo(self):
        n = int(self.headers.get("Content-Length") or 0)
        if n > 4_000_000:
            raise ValueError("cuerpo demasiado grande")
        return self.rfile.read(n).decode("utf-8", "replace") if n else ""

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        ruta = self.path.split("?", 1)[0]
        est = self.server.estacion
        if ruta == "/api/estado":
            return self._enviar(200, est.estado())
        if ruta == "/api/catalogo":
            return self._enviar(200, est.catalogo())
        if ruta == "/api/flujo":
            return self._flujo(est)
        q = urllib.parse.parse_qs(self.path.split("?", 1)[1]) if "?" in self.path else {}
        if ruta == "/api/tripulacion":
            return self._enviar(200, {"tripulacion": est.tierra.directorio()})
        if ruta == "/api/tripulacion/estado":
            e = est.tierra.estado((q.get("sujeto") or [""])[0])
            return self._enviar(200 if e else 404, e or {"error": "ese tripulante no ha informado a este servidor"})
        if ruta == "/api/mensajes":
            return self._enviar(200, {"mensajes": est.tierra.leer((q.get("sujeto") or [""])[0], int((q.get("desde") or ["0"])[0] or 0), (q.get("lector") or [None])[0])})
        if ruta in ("/medico", "/medico/"):
            ruta = "/medico.html"
        archivo = (WEB / (ruta.lstrip("/") or "index.html")).resolve()
        if WEB.resolve() not in archivo.parents or not archivo.is_file():
            return self._enviar(404, {"error": "no existe " + ruta})
        self._enviar(200, archivo.read_bytes(), mimetypes.guess_type(archivo.name)[0] or "application/octet-stream")

    def _flujo(self, est):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Connection", "close")
        self.end_headers()
        q = queue.Queue(maxsize=2000)
        est.oyentes.append(q)
        try:
            self.wfile.write(b": conectado\n\n")
            self.wfile.flush()
            while True:
                try:
                    m = q.get(timeout=10)
                    self.wfile.write(b"data: " + json.dumps(m, ensure_ascii=False).encode("utf-8") + b"\n\n")
                except queue.Empty:
                    self.wfile.write(b": latido\n\n")
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            pass
        finally:
            est.oyentes.remove(q)
            self.close_connection = True

    def do_POST(self):
        ruta = self.path.split("?", 1)[0]
        est = self.server.estacion
        try:
            texto = self._cuerpo()
            if ruta == "/api/senal":
                return self._enviar(200, {"ok": True, "recibidas": est.senal(texto)})
            d = json.loads(texto) if texto.strip() else {}
            if ruta == "/api/ingerir":
                msjs = d.get("mensajes")
                if not isinstance(msjs, list):
                    return self._enviar(400, {"error": "falta la lista 'mensajes'"})
                return self._enviar(200, {"eventos": est.ingerir(msjs), "recibidos": len(msjs)})
            if ruta == "/api/evaluar":
                if not isinstance(d.get("datos"), dict):
                    return self._enviar(400, {"error": "falta el objeto 'datos'"})
                return self._enviar(200, est.evaluar(d["datos"], d.get("explicar", False)))
            if ruta == "/api/tripulacion/estado":
                return self._enviar(200, est.tierra.informar(d))
            if ruta == "/api/mensajes":
                try:
                    return self._enviar(200, est.tierra.enviar(d))
                except ValueError as ex:
                    return self._enviar(400, {"error": str(ex)})
            if ruta == "/api/reiniciar":
                est.reiniciar()
                return self._enviar(200, {"ok": True})
            if ruta == "/api/llm/clave":
                guardar_clave_groq(str(d.get("clave") or ""))
                return self._enviar(200, {"ok": True, "groq": bool(clave_groq())})
            if ruta in ("/api/llm", "/api/llm/probar"):
                prov = d.get("proveedor") or "groq"
                msjs = d.get("mensajes") or []
                if ruta.endswith("probar"):
                    msjs = [{"role": "user", "content": "Responde solo con la palabra: listo"}]
                t0 = time.time()
                try:
                    texto, modelo = llamar_llm(prov, msjs, d.get("modelo") or None, d.get("base") or None, int(d.get("max_tokens") or 900))
                except RuntimeError as ex:
                    return self._enviar(503, {"error": str(ex)})
                except urllib.error.URLError as ex:
                    if isinstance(ex, urllib.error.HTTPError):
                        raise
                    donde = "el modelo local en " + (d.get("base") or LOCAL_BASE) if prov == "local" else "Groq"
                    return self._enviar(502, {"error": f"No pude conectar con {donde}: {ex.reason}"})
                return self._enviar(200, {"texto": texto, "modelo": modelo, "proveedor": prov, "ms": round((time.time() - t0) * 1000)})
            self._enviar(404, {"error": "no existe " + ruta})
        except urllib.error.HTTPError as ex:
            self._enviar(502, {"error": f"El proveedor respondió {ex.code}: {ex.read()[:300].decode('utf-8', 'replace')}"})
        except Exception as ex:                      # el servidor no se cae por una petición mala
            self._enviar(500, {"error": f"{type(ex).__name__}: {ex}"})


class LineasTCP(socketserver.StreamRequestHandler):
    def handle(self):
        for linea in self.rfile:
            self.server.estacion.senal(linea.decode("utf-8", "replace"))


def main():
    ap = argparse.ArgumentParser(description="Servidor mínimo del Monitor Aerospace Health")
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--puerto", type=int, default=8777)
    ap.add_argument("--tcp", type=int, default=0, help="puerto TCP para recibir señales (un JSON por línea); 0 = apagado")
    ap.add_argument("--sin-ensamble", action="store_true", help="usar solo la capa de reglas")
    a = ap.parse_args()
    print("Cargando el motor de alertas…", flush=True)
    est = Estacion(usar_ensamble=not a.sin_ensamble)
    e = est.estado()["motor"]
    print(f"  Motor {e['version']} · {e['catalogo']}")
    print(f"  Ensamble: {'sí · ' + str(e['modelo']) if e['ensamble'] else 'no (solo reglas)'}" + (f"\n  Aviso: {e['aviso']}" if e["aviso"] else ""))
    http = Servidor((a.host, a.puerto), Peticion)
    http.estacion = est
    if a.tcp:
        socketserver.ThreadingTCPServer.allow_reuse_address = True
        tcp = socketserver.ThreadingTCPServer((a.host, a.tcp), LineasTCP)
        tcp.daemon_threads = True
        tcp.estacion = est
        threading.Thread(target=tcp.serve_forever, daemon=True).start()
        print(f"  Señales por TCP: {a.host}:{a.tcp} (un JSON por línea)")
    print(f"\nMonitor listo en  http://{a.host}:{a.puerto}/   (Ctrl+C para salir)", flush=True)
    try:
        http.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")


if __name__ == "__main__":
    main()
