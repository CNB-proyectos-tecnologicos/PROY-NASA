"""Adaptadores de entrada y salida para el monitor continuo.

El monitor no sabe de protocolos: consume cualquier iterable de mensajes
(diccionarios). Aquí hay tres fuentes listas y la interfaz para escribir otra
(MQTT, puerto serie, cola de mensajes, API del fabricante…): basta un
generador que produzca los diccionarios descritos en ``flujo.py``.

Todas las fuentes son de SÓLO LECTURA: nunca escriben en el sistema de origen.

* ``FuenteIterable``  lista o generador en memoria (pruebas, integración directa)
* ``FuenteJSONL``     archivo o entrada estándar con un JSON por línea; puede
                      seguir el archivo mientras crece
* ``FuenteTCP``       cliente TCP de un servidor que emite un JSON por línea,
                      con vigilancia de silencio y reconexión con espera creciente

Si el enlace calla o se corta, la fuente lo dice con mensajes
``{"tipo": "conexion", "estado": "PERDIDA" | "RESTABLECIDA"}`` y mantiene el
reloj del monitor en marcha con ``{"tipo": "latido"}``. En vivo, las marcas de
tiempo de la telemetría deben estar en el mismo reloj (segundos Unix, UTC).
"""
from __future__ import annotations

import json
import socket
import sys
import time
from typing import Iterable, Iterator


def _linea(txt: str):
    txt = txt.strip()
    if not txt:
        return None
    try:
        m = json.loads(txt)
        return m if isinstance(m, dict) else {"tipo": "error_formato", "detalle": "la línea no es un objeto JSON"}
    except json.JSONDecodeError as e:
        return {"tipo": "error_formato", "detalle": f"JSON inválido: {e.msg}"}


class FuenteIterable:
    def __init__(self, mensajes: Iterable[dict]):
        self.mensajes = mensajes

    def __iter__(self) -> Iterator[dict]:
        yield from self.mensajes


class FuenteJSONL:
    """Un JSON por línea desde un archivo o '-' (entrada estándar).

    Con ``seguir=True`` espera nuevas líneas (como ``tail -f``) y emite latidos
    de reloj de pared cada ``latido_s`` segundos sin datos.
    """

    def __init__(self, ruta: str, seguir: bool = False, latido_s: float = 5.0):
        self.ruta, self.seguir, self.latido_s = ruta, seguir, latido_s

    def __iter__(self):
        fh = sys.stdin if self.ruta == "-" else open(self.ruta, encoding="utf-8")
        try:
            ultimo = time.time()
            while True:
                linea = fh.readline()
                if linea:
                    ultimo = time.time()
                    m = _linea(linea)
                    if m is not None:
                        yield m
                elif not self.seguir or self.ruta == "-":
                    return
                else:
                    time.sleep(0.2)
                    if time.time() - ultimo >= self.latido_s:
                        ultimo = time.time()
                        yield {"tipo": "latido", "t": ultimo}
        finally:
            if fh is not sys.stdin:
                fh.close()


class FuenteTCP:
    """Cliente TCP de sólo lectura: un JSON por línea, terminado en salto de línea.

    * ``silencio_s`` sin recibir nada  -> avisa CONEXION PERDIDA y sigue escuchando
    * conexión cerrada o rechazada      -> avisa y reintenta con espera creciente
    * ``max_reintentos=None``           -> reintenta indefinidamente
    """

    def __init__(self, host: str, puerto: int, silencio_s: float = 15.0, espera_inicial_s: float = 1.0,
                 espera_max_s: float = 30.0, max_reintentos: int | None = None, reloj=time.time):
        self.host, self.puerto = host, int(puerto)
        self.silencio_s, self.espera0, self.espera_max = silencio_s, espera_inicial_s, espera_max_s
        self.max_reintentos, self.reloj = max_reintentos, reloj

    def __iter__(self):
        intentos, espera, caido = 0, self.espera0, False
        while True:
            try:
                with socket.create_connection((self.host, self.puerto), timeout=self.silencio_s) as s:
                    s.shutdown(socket.SHUT_WR)                  # sólo lectura: no se envía nada al origen
                    if caido:
                        yield {"tipo": "conexion", "estado": "RESTABLECIDA", "t": self.reloj()}
                    intentos, espera, caido, resto = 0, self.espera0, False, b""
                    while True:
                        try:
                            trozo = s.recv(65536)
                        except socket.timeout:
                            caido = True                        # el servidor sigue ahí pero no manda nada
                            yield {"tipo": "conexion", "estado": "PERDIDA", "t": self.reloj()}
                            yield {"tipo": "latido", "t": self.reloj()}
                            continue
                        if not trozo:
                            break                               # el servidor cerró
                        if caido:
                            caido = False
                            yield {"tipo": "conexion", "estado": "RESTABLECIDA", "t": self.reloj()}
                        resto += trozo
                        *lineas, resto = resto.split(b"\n")
                        for ln in lineas:
                            m = _linea(ln.decode("utf-8", errors="replace"))
                            if m is not None:
                                yield m
            except OSError:
                pass
            caido = True
            yield {"tipo": "conexion", "estado": "PERDIDA", "t": self.reloj()}
            intentos += 1
            if self.max_reintentos is not None and intentos > self.max_reintentos:
                return
            time.sleep(espera)
            yield {"tipo": "latido", "t": self.reloj()}
            espera = min(self.espera_max, espera * 2)


def abrir_fuente(destino: str, seguir: bool = False, **kw):
    """'tcp://host:puerto', ruta de archivo .jsonl o '-' para la entrada estándar."""
    if destino.startswith("tcp://"):
        host, _, puerto = destino[6:].rpartition(":")
        return FuenteTCP(host, int(puerto), **kw)
    return FuenteJSONL(destino, seguir=seguir)


class SalidaJSONL:
    """Escribe cada evento como una línea JSON (archivo en modo añadir, o '-' = salida estándar)."""

    def __init__(self, ruta: str = "-"):
        self.fh = sys.stdout if ruta == "-" else open(ruta, "a", encoding="utf-8")

    def __call__(self, evento: dict):
        self.fh.write(json.dumps(evento, ensure_ascii=False) + "\n")
        self.fh.flush()

    def cerrar(self):
        if self.fh is not sys.stdout:
            self.fh.close()


def ejecutar(monitor, fuente: Iterable[dict], *salidas, max_mensajes: int | None = None) -> int:
    """Bucle principal: lee de la fuente, alimenta el monitor y reparte los eventos."""
    n = 0
    for m in fuente:
        for ev in monitor.ingerir(m):
            for s in salidas:
                s(ev)
        n += 1
        if max_mensajes is not None and n >= max_mensajes:
            break
    return n
