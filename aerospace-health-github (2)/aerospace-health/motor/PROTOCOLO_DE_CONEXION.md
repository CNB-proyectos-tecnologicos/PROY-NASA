# Conexión con el sistema continuo de control y signos vitales

Versión `0.2.0-investigacion`. Prototipo de investigación: sólo lectura, no actúa sobre equipos ni tratamientos.

## 1. Qué hay que entregar al monitor

Un flujo de mensajes, **un objeto JSON por línea** (UTF-8, terminado en `\n`), en orden temporal aproximado.

### Muestra de un canal continuo

```json
{"t": 1794300000.0, "sujeto": "CM-1", "canal": "spo2", "valor": 97.0, "valido": true, "unidad": "%"}
{"t": 1794300000.0, "sujeto": "CM-1", "canal": "hr", "valor": 64, "etiquetas": {"reposo": true, "despierto": true}}
{"t": 1794300000.0, "sujeto": "CABINA", "canal": "cabin_ppco2", "valor": 2.31, "unidad": "mmHg"}
```

| Campo | Obligatorio | Significado |
|---|---|---|
| `t` | sí | Segundos Unix (UTC) o ISO-8601. Todos los emisores deben compartir reloj. |
| `sujeto` | sí | Identificador del tripulante; `CABINA` para telemetría del vehículo. |
| `canal` | sí | Canal continuo de la tabla siguiente, o una variable del catálogo (apartado «valor puntual»). |
| `valor` | sí | Número finito. |
| `valido` | no (por defecto `true`) | `false` si el dispositivo marca la muestra como no fiable (movimiento, baja perfusión, compresión…). |
| `unidad` | no | Si llega y no coincide con la esperada, la muestra se rechaza. No hay conversiones implícitas. |
| `etiquetas` | no | `reposo` y `despierto`. Sin `reposo: true` la FC no cuenta como FC en reposo. |

### Canales continuos por defecto

| Canal | Unidad | Periodo supuesto | Variables del catálogo que produce | Regla de ventana |
|---|---|---|---|---|
| `spo2` | % | 1 s | `spo2_2min`, `spo2_5min` | media de 2 y 5 min, ≥80 % de la ventana con señal válida |
| `eva_spo2` | % | 1 s | `eva_spo2_2min` | igual |
| `hr` | lpm | 1 s | `rest_hr_10min`, `rest_hr_5min`, `awake_hr_5min` | sólo muestras con la etiqueta correspondiente |
| `temp` | °C | 60 s | `core_temp_c` | media de 5 min, ≥60 % |
| `sbp`, `dbp` | mmHg | 300 s | `sbp_confirmed`, `dbp_confirmed` | media de ≥2 lecturas válidas en 15 min |
| `cgm` | mg/dL | 300 s | `cgm_mg_dl` y, con 14 días de datos, TBR/TIR/TAR/CV | media de ≥2 lecturas en 15 min |
| `cabin_ppco2` | mmHg | 60 s | `cabin_ppco2_1h` + cobertura | media de 1 h; exige la hora completa |
| `cabin_pressure_kpa` | kPa | 60 s | `cabin_pressure_kpa` | media de 2 min |

Periodos, ventanas y coberturas son **supuestos** editables en `motor/flujo.py` (`CANALES`) o pasando otro `ConfigMonitor(canales=...)`.

### Valor puntual (analíticas, pruebas, síntomas, alarmas del vehículo)

Cualquier variable del catálogo puede enviarse como canal. Se conserva hasta caducar (24 h los valores, 1 h los indicadores 0/1; configurable).

```json
{"t": 1794300500.0, "sujeto": "CM-2", "canal": "potassium_mmol_l", "valor": 6.2}
{"t": 1794300600.0, "sujeto": "CM-1", "canal": "chest_pain_flag", "valor": 1}
{"t": 1794300700.0, "sujeto": "CABINA", "canal": "eva_suit_integrity_alarm", "valor": 1}
```

### Contexto (persistente hasta que se cambie)

```json
{"t": 1794300000.0, "tipo": "contexto", "sujeto": "*", "datos": {"mission_phase": "INFLIGHT"}}
{"t": 1794300000.0, "tipo": "contexto", "sujeto": "CM-1", "datos": {"age_years": 44, "microgravity_eva": 1, "antecedentes": ["Hipertensión"]}}
```

`"*"` aplica a todos. Sin `mission_phase` las reglas dependientes de fase no se activan: el monitor emite `CONTEXTO_INICIO`.

### Mensajes de servicio (los generan los adaptadores)

```json
{"tipo": "latido", "t": 1794300930.0}
{"tipo": "conexion", "estado": "PERDIDA", "t": 1794300930.0}
```

## 2. Cómo conectarlo

| Vía | Uso |
|---|---|
| TCP | `python -m motor.monitor --fuente tcp://host:puerto --salida eventos.jsonl`. El monitor es cliente, no envía nada, vigila el silencio del enlace y reconecta con espera creciente. |
| Archivo | `python -m motor.monitor --fuente telemetria.jsonl --seguir` (lee mientras el archivo crece). |
| Tubería | `emisor | python -m motor.monitor --fuente -` |
| En proceso | `MonitorContinuo.ingerir(mensaje)` devuelve la lista de eventos; sirve para MQTT, colas, puerto serie o una función en la nube. |

```python
from motor.flujo import MonitorContinuo
monitor = MonitorContinuo("ESPACIO")
for mensaje in mi_fuente():                 # cualquier generador de diccionarios
    for evento in monitor.ingerir(mensaje):
        publicar(evento)                    # panel, registro, notificación…
monitor.estado_actual()                     # fotografía para un panel
monitor.ultimo["CM-1"]                      # última salida completa del motor para ese tripulante
```

El estado vive en memoria del proceso. En un servicio sin estado hay que mantener vivo el objeto o reconstruirlo reinyectando la telemetría reciente (hasta 1 h para el CO₂, 14 días para las métricas de CGM).

## 3. Qué devuelve

Un evento JSON por línea. Campos comunes: `t`, `hora_utc`, `evento`, `ambito` (tripulante, `CABINA` o `SISTEMA`).

| Evento | Cuándo |
|---|---|
| `ALERTA_INICIO` | Un criterio del catálogo empieza a cumplirse. Incluye regla, nivel, valor, criterio, acción propuesta y confirmación. |
| `ALERTA_ESCALA` | El mismo problema pasa a un nivel mayor. |
| `ALERTA_RECORDATORIO` | Sigue activo. Primer recordatorio a los 5 min (INMEDIATA) o 15 min (PRIORITARIA); el intervalo se duplica hasta 1 h. |
| `ALERTA_FIN` | Deja de cumplirse durante 2 min **con dato fiable**. |
| `ALERTA_SIN_SEGUIMIENTO` | Dejó de poder evaluarse (canal en silencio, dato caducado, sensor en duda). La alerta sigue abierta. |
| `VERIFICAR_INICIO` / `_FIN` | Valor grave con sensor en duda: pedir medida independiente. |
| `CONTEXTO_INICIO` / `_FIN` | El valor cumple un criterio pero falta un dato de contexto. |
| `CALIDAD_INICIO` / `_FIN` | Avisos de calidad y abstención del catálogo. |
| `SUGERENCIA_INICIO` / `_FIN` | El ensamble sugiere un nivel mayor que las reglas; a confirmar. |
| `NIVEL_CAMBIA` | Cambia el nivel global de un tripulante o de la cabina. |
| `TELEMETRIA_PERDIDA` / `_RECUPERADA` | Un canal deja de emitir (por defecto 5 periodos, mínimo 30 s). |
| `CONEXION_PERDIDA` / `_RESTABLECIDA` | Enlace caído o en silencio. |
| `MENSAJE_RECHAZADO` | Primer mensaje defectuoso de cada tipo (fuera de orden, unidad, valor imposible, formato, reloj). Los demás se cuentan en `estadisticas()`. |

Las alarmas del vehículo (`canal_aviso: OPERATIVO_VEHICULO`) se emiten una sola vez con `ambito: CABINA`.

## 4. Reglas de seguridad del diseño

- **Sin dato no hay «todo bien».** Silencio de un canal o del enlace produce un evento propio y deja abiertas las alertas.
- **Una lectura suelta no dispara.** Se evalúan medias de ventana con cobertura mínima; los huecos no se rellenan.
- **Sólo lectura.** El monitor no envía órdenes al sistema de control. Las acciones propuestas son texto para personas.
- **Relojes.** Una muestra más de 5 s anterior a la última de su canal se rechaza; un salto de más de 6 h hacia el futuro también.

## 5. Probado y sin probar

Probado con 21 pruebas automáticas contra un sistema simulado (`motor/demo_flujo.py`), incluidas TCP real en `localhost`, silencio y corte del enlace, archivo con líneas rotas y 3,5 h de telemetría de dos tripulantes y cabina (51 098 mensajes, unos 35 s de proceso con el ensamble).

**No probado:** el sistema real. Faltan su protocolo, los nombres y unidades de sus canales, los periodos de muestreo, cómo marca la calidad de señal y el reposo, y su reloj. Con eso se ajusta `CANALES` o se escribe un adaptador.
