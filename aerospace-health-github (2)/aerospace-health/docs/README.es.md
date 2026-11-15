# Monitor Aerospace Health: documentación en español

Monitoreo constante de la salud de un tripulante con herramientas reales (monitor en pantalla, TFT táctil, interfaces
de interconexión y sensores que se pueden incorporar), evaluado en tiempo real. Lo complementan el contacto con el equipo
médico en tierra, un asistente con modelo de lenguaje (Groq o un modelo local) y un motor de alertas a bordo, con las 211
reglas del catálogo, para cuando no hay médico ni modelo al alcance. Incluye bienestar psicológico, mapa del dolor y
perfil clínico. Prototipo de investigación: no diagnostica ni sustituye al médico de vuelo.

## Arranque

```bash
./iniciar.sh              # primera vez: crea .venv e instala requirements.txt
./iniciar.sh --tcp 9100   # además escucha señales por TCP
```

Abre http://127.0.0.1:8777/ en Chrome o Edge (monitor del tripulante) y http://127.0.0.1:8777/medico (consola del médico
en tierra). En Windows: `iniciar.bat`.
Sin scikit-learn el servidor arranca igual y trabaja solo con las reglas (`--sin-ensamble` lo fuerza).

## Qué hay

| Ruta | Qué es |
| --- | --- |
| `servidor.py` | Servidor mínimo, solo biblioteca estándar: sirve la página, expone el motor y hace de puente con el modelo de lenguaje. |
| `motor/` | El motor de alertas del proyecto, sin cambios (catálogo de 211 reglas, ventanas, ensamble, fusión). |
| `modelos/` | El ensamble entrenado. |
| `web/index.html` | El monitor del tripulante, en un solo archivo. También abre sin servidor, con un motor integrado más simple. |
| `web/medico.html` | La consola del médico en tierra. Solo funciona servida por el servidor. |
| `datos/eventos.jsonl` | Bitácora de los eventos que emite el motor (se crea al usarlo). |
| `datos/mensajes.jsonl` | Mensajes entre el tripulante y el médico en tierra. |
| `.env` | Clave de Groq. No está en el repositorio: se crea a partir de `.env.example` o desde Opciones › Asistente. |

## Pantallas

- **Monitor**: ECG, pletismografía, presión arterial continua y respiración, con FC, SpO₂, PA, FR, temperatura,
  glucosa intersticial, radiación (tasa según altitud y dosis acumulada) y ambiente de cabina.
- **Evaluación**: el caso completo contra todo el catálogo. Toma solo lo que ya se mide (ventanas del monitor,
  laboratorio y datos del perfil, bienestar) y admite cualquier otra medida a mano. Devuelve nivel, hallazgos con su
  acción y confirmación, señales por verificar, lecturas próximas a un umbral, resultado del ensamble, cobertura por
  dominio y auditoría. Desde ahí se pide orientación a un modelo (local o en la nube) o se envía la consulta al
  médico en tierra.
- **Asistente**: conversación por texto o voz con un modelo de lenguaje real en el papel de *Astronaut Healer*; envío
  del paquete biométrico completo para que el modelo lo interprete; mensajes directos con el médico en tierra; y registros
  de bienestar psicológico. Si el modelo no está disponible, el asistente lo dice y no responde nada por su cuenta.
- **Mapa corporal del dolor** (en Asistente, o con el botón «Dolor» del monitor): vistas anterior y posterior con 70
  regiones; cada una es una región anatómica concreta (precordial, hipocondrio derecho, fosa poplítea izquierda…). La
  persona elige cómo es el dolor en lenguaje llano y el sistema lo registra con su término médico (opresivo, urente,
  cólico, pleurítico, alodinia…), intensidad 0–10, inicio, tiempo, curso, irradiación y síntomas asociados. La descripción
  clínica resultante se guarda, entra al paquete biométrico y se envía al modelo o al médico en tierra. Un dolor torácico
  activo se informa al motor como `chest_pain_flag` (regla SP-0193).
- **Perfil**: datos obligatorios, mediciones continuas, laboratorio (biometría hemática, nutrientes, hormonas),
  historial y expediente, con exportación.
- **Opciones** (engranaje): señales, motor, audio, visualización, asistente, registro de actividad y restablecer.

## Paquete biométrico compacto

Lo que se envía al modelo es un texto de unas diez líneas (formato `AHBIO1`, alrededor de 650 caracteres), no un JSON:
`ID` identidad y antropometría, `VS` signos con su rango de la sesión, `ENV` cabina y radiación, `ALR` alertas activas,
`LAB` solo resultados fuera de referencia, `WB` bienestar, `PAIN` dolor, `HX | RX | ALG` historial, `EV` última evaluación.
El modelo recibe la leyenda del formato en sus instrucciones.

## Consola del médico en tierra (`/medico`)

Un sitio aparte para el médico de vuelo, con tema claro en turquesa y blanco. El tablero incluye el dolor referido por
el tripulante sobre el mapa corporal. Muestra el directorio de tripulación (los tripulantes cuyo monitor ha informado
al servidor) y, de cada uno: tablero con signos en tiempo real, alertas y tendencias; perfil; laboratorio; bienestar;
evaluación completa con el motor; historial de alertas; e interpretación del paquete biométrico por el modelo.
A la derecha, la intercomunicación directa con el tripulante: lo que escribe el médico aparece en el monitor
(Asistente › Médico en tierra) y al revés. Las consultas enviadas desde Evaluación llegan aquí con su resumen.
Nada de esto se simula: son mensajes entre dos personas a través del servidor.

| Petición | Hace |
| --- | --- |
| `POST /api/tripulacion/estado` `{"sujeto":"CM-1","estado":{…}}` | El monitor informa su estado (cada 2 s). |
| `GET /api/tripulacion` · `GET /api/tripulacion/estado?sujeto=CM-1` | Directorio y estado completo de un tripulante. |
| `POST /api/mensajes` `{"sujeto":"CM-1","de":"tierra"\|"tripulante","texto":"…"}` · `GET /api/mensajes?sujeto=CM-1&desde=0` | Mensajería. |

## Idioma

Español por defecto. En Opciones › Visualización se elige inglés: cambia toda la interfaz y el idioma en que responde el
modelo. La consola de tierra tiene su propio selector. Los textos libres que escribe el propio motor (notas, planes por
antecedentes) y lo que escriben las personas no se traducen.

## El motor como herramienta

| Petición | Hace |
| --- | --- |
| `POST /api/ingerir` `{"mensajes":[{"t":…,"sujeto":"CM-1","canal":"spo2","valor":97}]}` | Alimenta el monitor continuo y devuelve los eventos (ALERTA_INICIO, ALERTA_FIN, VERIFICAR…, SUGERENCIA… del ensamble). |
| `POST /api/evaluar` `{"datos":{…},"explicar":true}` | Evaluación caso a caso con todo el catálogo. |
| `GET /api/catalogo` | Dominios, variables y reglas tal como las carga el motor, con sus compuertas de contexto. |
| `POST /api/reiniciar` | Ventanas y episodios en cero. |
| `GET /api/estado` | Versión, catálogo, modelo, episodios abiertos y estado del modelo de lenguaje. |

La página envía cada segundo FC y SpO₂; cada minuto temperatura, presión arterial, glucosa, ppCO₂ y presión de
cabina; y cada medio minuto los valores puntuales del perfil y del bienestar que el catálogo conoce (plaquetas,
leucocitos, neutrófilos, vitamina D, calcio corregido, sodio, potasio, HbA1c, TSH, horas de sueño, lapsos de
atención, sobrecarga de trabajo…). Edad, estatura, masa, cintura, sexo y creatinina viajan como contexto.

En modo demo el reloj del motor corre 120× (configurable: 20×, 60×, 120×, 240×) y el motor recibe al vincularse la hora
previa de señales basales, para que sus ventanas de 15 min y 1 h puedan evaluarse enseguida. Una alteración se confirma
en unos 10 s. Con señales reales el reloj es el real.

### Qué se evalúa en la página y no en el motor

- `MON-` y `TEC-`: ritmo, respiración, apnea, tasa de dosis y sensores. El catálogo no las cubre.
- `PSI-01` malestar psicológico autoinformado, `PSI-02` índice OMS-5 de 28 o menos, `PSI-03` conflicto de equipo.
  Las reglas equivalentes del catálogo (SP-0148 y SP-0150) están apagadas a la espera de validación, así que estas
  tres son un criterio de este monitor, no del motor. El resto del bienestar (sueño SP-0141/0142, lapsos de atención
  SP-0145, sobrecarga SP-0146) lo decide el motor. Una alerta de bienestar nunca se muestra por delante de una física.

## Situaciones simuladas

El simulador solo altera las señales; ninguna alerta está precargada. Las produce el motor al recibirlas, igual que
con señales reales. Hay 26 situaciones: ejercicio, taquicardia, bradicardia, fibrilación auricular, extrasístoles,
taquicardia ventricular, crisis hipertensiva, hipovolemia, hipoxemia, tromboembolia pulmonar, apnea, taquipnea,
hipoglucemia, hiperglucemia, fiebre, sepsis, sobrecarga térmica, hipotermia, acumulación de CO₂, despresurización,
paso por la Anomalía del Atlántico Sur, evento de partículas solares y tres fallos de sensor.

## Señales reales

Apaga «Modo demo» en Opciones. Tres orígenes:

- **Servidor**: cualquier dispositivo o script envía lecturas con `POST /api/senal` o por TCP (`--tcp 9100`), una por línea.
- **Puerto serie**: un Arduino por USB (Web Serial, Chrome o Edge).
- **WebSocket**: un JSON por mensaje.

Formato: `{"canal":"hr","valor":72}`, varias a la vez
`{"hr":72,"spo2":98,"fr":15,"sbp":118,"dbp":76,"temp":36.7,"cgm":96,"co2":2.1,"pcab":101.3,"rad":24,"alt":408}`
o texto `hr=72,spo2=98`. Formas de onda opcionales: `{"ecg":[…]}`, `pleth`, `art`, `resp` a 200 muestras por segundo.
Si la fuente solo manda números, el monitor dibuja la tendencia del valor en lugar de una onda.

```bash
curl -X POST http://127.0.0.1:8777/api/senal -d '{"hr":72,"spo2":98,"sbp":118,"dbp":76,"cgm":96,"temp":36.7}'
```

## Asistente y orientación con modelo de lenguaje

| Proveedor | Cómo |
| --- | --- |
| **Groq** (por defecto) | API real de Groq, `https://api.groq.com/openai/v1/chat/completions`, modelo `openai/gpt-oss-120b` (o `openai/gpt-oss-20b`). Pon la clave en Opciones › Asistente, o crea `.env` con `GROQ_API_KEY=gsk_…`. La clave vive en el servidor, no en el navegador. |
| **Modelo local** | Cualquier servidor compatible con la API de OpenAI (Ollama, llama.cpp, LM Studio). Por defecto `http://127.0.0.1:11434/v1` y modelo `llama3.1`. |

`POST /api/llm {"proveedor":"groq"|"local","mensajes":[…]}` es el puente; `POST /api/llm/clave` guarda la clave.
No hay respuestas automáticas: si el modelo no contesta, el asistente lo dice. En la página publicada (sin servidor) responde Claude.

## Qué es simulado o aproximado

- Las señales del modo demo se generan en la página.
- La radiación usa un modelo simplificado de tasa de dosis según altitud, con valores de referencia aproximados.
- El perfil inicial es ficticio. Los intervalos de referencia del laboratorio son orientativos de adulto.
- La fase del ciclo se estima por calendario.
- Sin servidor, la evaluación aplica en la página las reglas de umbral del mismo catálogo, sin controles de calidad
  de señal ni plan por antecedentes, y el ensamble se sustituye por un modelo destilado de cinco signos vitales
  (un bosque pequeño ajustado a 20 600 evaluaciones del ensamble real).

## Cómo se arma la interfaz

Las fuentes de la página están en `web_src/`. `python web_src/armar.py` une estilos, guiones, modelo destilado y catálogo en
`web/index.html` y `web/medico.html`. Si cambian los textos, `python web_src/armar_idioma.py` regenera antes el diccionario
español-inglés (necesita Node.js). El repositorio ya incluye la interfaz armada.
