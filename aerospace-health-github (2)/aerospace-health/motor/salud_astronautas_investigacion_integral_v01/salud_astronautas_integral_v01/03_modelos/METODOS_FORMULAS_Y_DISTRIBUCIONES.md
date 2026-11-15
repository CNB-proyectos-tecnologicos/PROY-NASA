# Cuantificación matemática en medicina espacial: posibilidades y límites

**Fecha:** 14 noviembre 2026. **Ámbito:** investigación de ingeniería, no dispositivo médico. Se enumeran cantidades calculables, modelos candidatos y qué parámetros de validación hacen falta. La cifra mostrada por un cálculo no es automáticamente una probabilidad de enfermedad.

## 1. Tres magnitudes incompatibles

**Intensidad de exposición:** por ejemplo, presión parcial media de CO₂ 3.4 mmHg en una hora, o dosis acumulada 310 mSv. Son cantidades físicas. La NASA fija límites operativos; la presión de cabina no determina por sí sola PaCO₂ sanguínea.

**Puntuación de estratificación:** NASA/SP-20260005258 (2026) propone un índice venoso compuesto con edad, familia, trombofilia, grupo no-O, hormonas, Doppler yugular y cambio de dímero D. Da **puntos**, no P(TEV). No usar como probabilidad porcentual, ni prescribir automáticamente anticoagulación; consultar tabla completa y médico de vuelo.

**Probabilidad de un desenlace:** `P(evento hasta t | x, perfil de misión, población, protocolo)`. Requiere cohortes representativas, validación y calibración externa. La mayoría de riesgos espaciales no tienen estimador publicable con los datos obligatorios. El valor correcto es `NO_ESTIMABLE`.

## 2. Capacidad aeróbica y pérdida de fuerza

`R_VO2 = VO2max(t)/VO2max_prevuelo`; pérdida `% = 100(1-R)`.

NASA-STD-3001 V1 4001 establece ≥32.9 mL·kg⁻¹·min⁻¹ durante misión con **EVA en microgravedad**; V1 4002 ≥36.5 para **EVA en superficie extraterrestre**; V1 4003 ≥80% de VO2max premisión. Especificar qué EVA y si se mide directo o indirectamente. Si la persona no está asignada a EVA, la comparación de 32.9/36.5 no equivale automáticamente a inapto para misión.

`R_fuerza=F_t/F_0` con objetivo V1 4024 de ≥0.80. Usar pruebas y protocolos repetidos comparables. No inferir pérdida de fuerza desde frecuencia cardiaca o masa corporal. La fuerza de levantamiento respecto a masa preflight exige registro de ejercicio y tarea.

## 3. Densidad mineral ósea

`R_DXA = BMD_t/BMD_pre`, `Δ%=100(R_DXA-1)`.

NASA V1 4027: ≥0.95 cadera total y columna, ≥0.90 cuello femoral. Son objetivos de contramedidas, **no** probabilidades de fractura. Se requiere DXA comparable. Un T-score ≤−2.5 es una noción clínica terrestre para osteoporosis en población aplicable; no es un límite NASA y tiene restricciones por edad/sexo/menopausia.

## 4. Atmósfera: presión inspirada de O₂

Para un gas humidificado a 37 °C, `PIO2 ≈ FiO2(PB-PH2O)` con `PH2O ≈47 mmHg`, `PB` presión barométrica. Ojo: para presiones ambientales no terrestres se debe determinar la composición exacta y la convención de la norma. `PIO2` NO equivale a `PaO2`, `SaO2` ni `SpO2`; no imponer la cifra de 127 mmHg como suelo universal. NASA V2 6003 usa intervalos según duración de exposición.

`Pco2_1h(t)= (1/3600)∫_t-3600^t Pco2(s)ds` cuando el muestreo realmente cubre el periodo, unidades mmHg. NASA V2 6004: media 1h ≤3 mmHg. No aplicar umbral a una lectura puntual ni a una serie con 70% de lagunas.

## 5. Límite de presión y velocidad

NASA V2 6006: `34.5 kPa < Ptotal ≤ 103 kPa` para exposición indefinida; V2 6007 exige límite `|dP/dt|≤13.5 psi/min` sólo si cambio >1 psi. La tasa es medida del vehículo, no biometría. Las atmósferas de traje EVA siguen requisitos específicos; no aplicarles indiscriminadamente los de cabina.

## 6. Radiación: límites, no pronóstico individual de cáncer

NASA V1 4030 establece `D_eff, carrera < 600 mSv` (modelo NASA Q); la justificación considera 3% de REID medio adicional a largo plazo para límite de carrera, **no equivale a afirmar que 600mSv implica exactamente 3% individual**. Una predicción REID necesita dosimetría, espectro energético, edad, sexo y modelo de respuesta/latencia, con incertidumbres importantes. Para efectos orgánicos se usan **mGy-Eq** o **mGy**: no convertirlos informalmente a mSv.

V1 4031 dosis de evento solar de referencia de diseño <250 mSv; V1 4032 radiación atribuible a tecnología nuclear <20mSv/año misión; V1 4033 diseño GCR para sistemas >60 días: <1.3 mSv/día en espacio libre, <0.9 mSv/día superficie planetaria. Son **requisitos de diseño y blindaje**. V1 4029 ALARA obliga minimizar exposición aun por debajo del límite. Fuente: NASA V1 capítulos 4.8, tablas 4.8-1 a 4.8-4.

La función `D_cum=∑D_i` es válida sólo con dosis homogéneas, misma magnitud y factor de calidad apropiado, calibración y protección de errores de unidad. Para modelar cáncer, supervivencia competidora y corrección de latencia usar modelos REID NASA oficiales; no extrapolar linealmente a población general.

## 7. Exposición acústica

NASA V2 6073 para lanzamiento, entrada o aborto, ruido no impulsivo oído del tripulante, 24h:

`D(%)=100*Σ_i C_i/T_i`, `T_i(min)=480/2^((L_i(dBA)-85)/3)`.

Ejemplo: 480min a 85dBA → D=100%; 240min a 88dBA → D=100%. V2 6074 techo combinado 105dBA (no impulsivo). Si casco/audio atenúan, medir nivel efectivo al oído; si norma prescribe oído sin atenuación no cambiarlo. No convertir una dosis del 100% en 100% de probabilidad de hipoacusia.

## 8. SANS: clasificación por cambios anatómicos

Consenso 2026: cambio espesor total retina peripapilar OCT (`ΔTRT`) ≥20 µm señal de clase A y ≥55 µm clase B; otros signos incluyen Frisén ≥1, desplazamiento hipermetrópico >+0.50 D. Valores específicos de protocolo **OCT Spectralis**. La clasificación de SANS requiere conjunto de signos y valoración neuro-oftalmológica: el demo implementa una subclasificación de **una señal**, no sustituye la clasificación consenso completa. Se requiere línea basal pre-vuelo, equipo y QC idénticos.

## 9. TVE: puntuación NASA 2026

`S= S_edad + S_familia + S_trombofilia + S_grupo + S_hormonas + S_yugular + S_Ddímero` con tabla original NASA SP-20260005258. Componentes no aditivos arbitrariamente: variantes de trombofilia, edad y familia son categorías, no banderas independientes. No dar `0` a dato no medido. Doppler IJV estasis <10cm/s o retrógrado corresponde a la misma categoría +4 y no se suma dos veces. Cambio dímero D >60% respecto a línea basal intravuelo +2. El score propuesto 2–3 demanda mayor vigilancia; 4 o más requiere revisión médica de vuelo. No indicar farmacoterapia automática.

Una función `P(TVE|S)` necesita estimar empíricamente `P` en una cohorte de astronautas/análogos, con incertidumbre por N escaso y sesgos de selección.

## 10. Proporciones observadas y Wilson

Para `k` eventos entre `n` individuos, `p_hat=k/n`. Intervalo Wilson con `z=1.96`:

`center=(p_hat+z²/(2n))/(1+z²/n)`;

`half=z*sqrt(p_hat(1-p_hat)/n + z²/(4n²))/(1+z²/n)`.

`[center-half, center+half]` es incertidumbre muestreo bajo supuestos binomiales, **no** incertidumbre causal ni aplicable directamente a otra misión. El estudio SANS de 64 crewmembers, el estudio yugular de 11, y la evidencia de hemólisis de 14 NO bastan para identificar un predictor multivariante confiable.

## 11. Propuestas estadístico-probabilísticas, no modelos ya validados

- **Bernoulli/binomial** para evento dentro de ventana fija; evitar ignorar censura de misión.
- **Kaplan–Meier y Cox** para tiempo a incidente con censura y covariables; comprobar riesgos proporcionales.
- **Riesgos competitivos Fine–Gray** en cohortes grandes si el desenlace puede ser impedido por retorno/otra causa.
- **Jerárquico Bayesiano multinivel** `(misión, individuo, instrumento)` para muestras pequeñas, con priors informativos externos si justificables y análisis de sensibilidad. Separar variación entre personas de mediciones replicadas (pseudorreplicación).
- **Negativo binomial/Poisson** para eventos recurrentes (cefaleas) con offset por días de exposición; sobredispersión habitual.
- **Mixtura lognormal/gamma** para exposición CO2, tasas/ dosis; comprobar cola y censura.
- **Modelos de estado o gaussian processes** para series de HR/SpO₂ y cambios de régimen; nunca interpretar una anomalía estadística como diagnóstico.
- **Predicción multivariable calibrada** `p_i=σ(β0+βᵀx)` o supervivencia `S(t|x)=S0(t)^exp(βᵀx)` sólo si se entrenan y validan adecuadamente; no inventar coeficientes ni porcentajes.
- **Calibración**: intercepto/slope, plot de calibración, Brier, ECE con intervalos por bootstrap y calibración por misión/dispositivo/sexo/edad; validación leave-one-mission-out para evitar leakage.
- **Confusión por indicación**: ejercicio, hormonas, farmacoterapia y retorno temprano se adoptan por riesgo previo, así que la asociación observacional puede invertirse. Para causalidad se requiere DAG y estimando bien definido.

## 12. Tasas de falsas alertas y priorización

Si una heurística genera una alarma por persona por día con probabilidad `α`, probabilidad de ≥1 falsa alarma en T días bajo independencia: `1-(1-α)^T`. Para α=0.01, T=180, ≈83.6%. En datos seriados correlacionados ese supuesto suele fallar; estimar empiricamente `alertas/100 tripulante-días`, PPV por misión, duración de episodios, carga de revisión, tiempo a detección, FNR y eventos omitidos.

Sensibilidad/specificidad y PPV dependen de definiciones de outcome, prevalencia y verificación. En vuelo espacial N es pequeño y existe sesgo de verificación (sólo quien recibe OCT/ECO tiene etiqueta). Separar regímenes: prevención, alerta de seguridad ambiental, aviso individual y auditoría.

## 13. Origen étnico y fase menstrual

Origen étnico autodeclarado sólo para analizar equidad, referencia anatómica DXA donde norma exige población comparable, o predictores validados. No inferir biología ni asignar penalización por etnia. Fase del ciclo fisiológico puede estar suprimida por anticonceptivos; no asumir regularidad ni capacidad de inferir fase por temperatura. Diferenciar sex/gender, tratamiento hormonal, embarazo (requiere prueba y consentimiento), y estado de supresión. Sin analítica/diagnóstico, no inferir ovulación fiable.

## 14. Transparencia epistémica

Etiquetas del catálogo: N normativa NASA, C guía/consenso clínico, D derivado/umbral terrestre, O observacional, H heurístico deshabilitado, Q calidad/abstención. Las etiquetas representan procedencia estimada, NO equivalen a certeza clínica GRADE. Una referencia NASA de contexto NO demuestra precisión del criterio derivado. La columna `limites` incluye excepciones y advertencias. Exigir revisión manual antes de desplegar, y actualización cada nueva revisión NASA/consenso.
