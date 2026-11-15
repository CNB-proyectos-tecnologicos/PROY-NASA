# Informe de diseño: valoración crítica y alternativas

Este documento expone decisiones reproducibles de ingeniería y sus argumentos públicos y verificables; no constituye una transcripción de razonamientos internos. Separa evidencia publicada, interpretaciones y opciones aún por validar. **Fecha de corte 2026-11-14.**

## D1. Definir la tarea como detección de riesgo, no diagnóstico automático

La biometría continua genera correlaciones fisiológicas fuertes pero poco específicas. En microgravedad, HR cambia por desplazamiento cefálico de líquidos, ciclo sueño, ejercicio y adaptación, y un índice que predice enfermedad en tierra puede no conservar calibración. El resultado debe etiquetar `observación`, `riesgo`, `sospecha`, `criterio clínico` y `recomendación operacional` por separado. Alternativa rechazada: mapa directo de cada anormalidad a una enfermedad concreta. Riesgo evitado: sobrediagnóstico y acciones inadecuadas.

## D2. No asignar porcentaje artificial a las 211 reglas

La escasez de eventos, el fuerte sesgo de selección de astronautas y la heterogeneidad de duración/misión impiden calibrar cientos de probabilidades. Un límite de 600mSv no es una predicción individual de 3% de cáncer. Alternativa: reportar cumplimiento normativo, puntuación, magnitud, persistencia y un porcentaje únicamente donde haya un modelo calibrado en una cohorte pertinente. Evidencia: NASA-STD-3001 V1 4030 y VTE NASA 2026.

## D3. Mantener un grafo causal y operacional, no un gran árbol de decisión monolítico

Los factores latentes gravedad, entorno, actividad, equipo y tratamientos influyen simultáneamente en HR, BP, SpO₂, CGM, función renal y capacidad aeróbica. Un árbol que explote todas las combinaciones produce miles de reglas inconsistentes. Opción propuesta: motor en capas: validación dato → entorno/ECLSS → signos críticos → síndromes → pruebas adicionales → decisión médica. Variables contextuales de misión se transportan como precondiciones explícitas. Alternativa: árbol global if/elif irreversible, descartado por mantenibilidad y dificultad de evaluación.

## D4. Distinguir tres periodos

Premisión, intramisión y posmisión no son intercambiables. En ausencia de gravedad, prueba ortostática de pie no procede; al regreso es esencial. NASA V1 fija requisitos de capacidad intravuelo y postflight retorno a basal. Alternativa: aplicar sólo umbrales terrestres a toda la misión; descartar.

## D5. La exposición ambiental requiere su propia cadena de medición

CO₂, O₂ inspirado, presión, partículas, dosimetría y ruido no están en el set biométrico humano obligado; deben llegar del vehículo. El sistema **no puede asegurar ausencia de riesgo ambiental** cuando faltan sensores ambientales. Puede generar `RIESGO_NO_EVALUABLE` y petición de instrumentación, no `RIESGO_BAJO`. NASA V2 rev F.

## D6. Glucosa CGM y diabetes

La glucosa intersticial es seguimiento y no prueba plasmática diagnóstica. Metas TIR/TBR/TAR ADA 2026 pertenecen a población con diabetes y deben segmentarse por tipo/edad/riesgo hipoglucemia y calidad de datos. No diagnosticar diabetes por CGM ni aplicar TIR 70–180 como objetivo universal a todos los astronautas. Alternativa: usar CGM para marcar contexto endocrino y solicitar plasma venoso/HbA1c certificada, si procede.

## D7. PA continua debe venir de tecnología validada

Muchos monitores cuffless obtienen estimación indirecta sin precisión aceptable. Las categorías AHA 2025 de hipertensión se refieren a protocolos de medición validados, no a puntos aislados de reloj. Priorizar protocolo y calibración sobre exactitud aparente de serie. Si la calidad es dudosa, abstención y confirmación con manguito o línea validada.

## D8. Oxígeno medido no es oxígeno inspirado

SpO₂ periférica está afectada por movimiento, perfusión y pigmentación, y no representa concentración de O₂ ni presiones parciales de cabina. Nunca inferir escape atmosférico o CO₂ alto exclusivamente por SpO₂; medir entorno y evaluar humano por separado.

## D9. CO₂: seleccionar ventana precisa

El límite NASA V2 6004 es **media de una hora** ≤3mmHg. Calcular con timestamps, unidad y completitud ≥parámetro operativo por definir; si faltan bloques relevantes, abstenerse. La observación NASA de cefaleas sobre 49 personas se usa como soporte poblacional, no para inferir que un tripulante con 2.5mmHg tiene x% de cefalea.

## D10. Oxígeno inspirado: no usar 127mmHg como mínimo universal

NASA V2 incluye tablas por duración y composición. El número 127 aparece como exposición histórica/argumentación, no condición obligatoria global. Por tanto SP-0007 se deshabilita expresamente, sustituyendo la comprobación por perfil atmosférico autorizado e intervalos de exposición de la misión.

## D11. Radiación: separar cuatro escalas incompatibles

Dosis efectiva carrera en mSv, dosis órganos en mGy-Eq/mGy, tasa GCR de diseño mSv/día y SPE de diseño mSv. El error de unidad es crítico. Límites de ingeniería no se trasplantan a riesgo oncológico individual. Alternativa de simplificar a un único número universal descartada. Requiere modelos NASA Q/RBE y dosimetría validada.

## D12. SANS requiere examen ocular específico

SANS es detectado por OCT, refracción, fondo de ojo y cambios estructurales; HR/BP/SpO₂ no bastan. El consenso 2026 ofrece cortes objetivos para TRT, pero especifica equipo y protocolo. El software emite `solicitar OCT` cuando falta y **no** interpreta ausencia de hallazgo como ausencia de enfermedad.

## D13. Trombosis yugular: dos subproblemas diferentes

Una estasis en Doppler incrementa sospecha y puntaje, pero no equivale a trombo confirmado. La trombosis puede ser asintomática. Se registra Doppler y características del flujo yugular; el usuario sin ecografía no recibe estimación de probabilidad VTE. La escala NASA 2026 es propuesta, sin validación predictiva externa.

## D14. Medicación hormonal y VTE

No inferir que `fase ovulatoria` implique exposición hormonal ni riesgo VTE. El score NASA requiere terapia hormonal concreta y su clasificación. Se guarda `estado desconocido` cuando no se dispone del dato. Alternativa: asignar ceros a datos faltantes, descartada por subestimación sistemática.

## D15. Precisión de score VTE y tratamientos

Los puntos NASA no son riesgo %. La propuesta de profilaxis en ciertos puntos no convierte al motor en prescriptor; contraindicación, sangrado, interacción, acceso a rescate y complejidad misión hacen indispensable decisión del equipo de medicina espacial. El modelo de código sólo devuelve prioridad de revisión.

## D16. Fuerza: exigencia relativa vs absoluta

NASA distingue fuerza a baseline y pruebas específicas frente a masa. Ambas son útiles, pero una caída de masa no identifica una caída de fuerza. Las pruebas deben normalizarse por protocolo, equipo y fase, y los requisitos se condicionan a perfil EVA.

## D17. DMO: pérdida y osteoporosis no son lo mismo

La pérdida respecto a la DXA premisión tiene umbrales NASA; un T-score de osteoporosis pertenece a guías generales y exige población aplicable. Evitar mezclar un déficit de 5% con osteoporosis de 5% de probabilidad. También contemplar que la masa no equivale a densidad ósea.

## D18. Riñón: hiperexcreción de calcio vs deshidratación

La pérdida de hueso genera hipercalciuria y aumenta condiciones para litiasis; ninguna de ellas puede ser confirmada sólo con glucosa, FC y BP. Requerir ecografía, volumen de orina, análisis de solutos y antecedentes. Un umbral como volumen orina <2 L/día puede ser útil clínicamente, pero no está identificado como corte universal NASA para cualquier misión.

## D19. Anemia espacial: resultado de hemólisis no es límite Hb

El aumento promedio de 54% de eliminación de CO en 14 astronautas es un marcador estimado de destrucción eritrocitaria, NO un 54% de caída de Hb. Alerta de Hb requiere biometría hemática y contexto hemoconcentración/hemodilución posvuelo. No confundir asociación fisiológica y regla diagnóstica.

## D20. Sueño y neurocognición

Promedios <7h son recomendaciones generales y no identifican automáticamente insomnio ni trastorno psiquiátrico. Agregar actigrafía/PVT, planificación tareas críticas y autosatisfacción de sueño. HRV baja no diagnostica estrés clínico ni enfermedad mental; umbrales de tendencia quedan desactivados.

## D21. Calidad de sensores y datos faltantes

Datos del usuario “obligatorios” significa que hay un campo o serie, no que toda lectura sea exacta ni que exista en todas las fases. Establecer procedencia, firma de dispositivo, cobertura, sincronización, calibración, incertidumbre, movimiento, faltantes, pérdida de señal, fase EVA. Las reglas con `OPCIONAL` no se activan a partir de valor ausente; resultado `NO_CALCULABLE` y `prueba_recomendada`.

## D22. Comparabilidad temporal y baseline personal

El basal ideal es premisión en tierra con protocolo estándar. Las primeras semanas en órbita son fisiológicamente distintas y no deben sustituirlo silenciosamente. Para detección de cambio: medianas robustas por fase/ritmo circadiano, delta absoluto y relativo, ventanas consecutivas, hysteresis y periodicidad de reevaluación. Los cortes exploratorios (p.ej. +20% FC basal) quedan deshabilitados hasta validación.

## D23. Equidad y etnicidad

La etnia autodeclarada no es causa biológica unívoca. Puede emplearse para auditar error de sensor/calibración, y para referencias de DXA cuando una norma exige cohortes comparables. No usar como multiplicador empírico de riesgo en ausencia de validación. Separar ancestralidad genética si científicamente procede de identidad social.

## D24. Menstruación y ovulación

En vuelos largos son comunes opciones de supresión menstrual. Si hay supresión, embarazo, amenorrea u hormonas exógenas, la fase de ovulación puede ser no observable. No inferir por temperatura corporal sola. Los posibles riesgos de reproducción en espacio tienen base empírica insuficiente para pronóstico individual; el motor debe abstenerse o recomendar evaluación especializada.

## D25. Peso vs masa

Una balanza por peso gravitacional en microgravedad no estima masa sin un instrumento de inercia. Conservar indicador `masa_validada`. Los datos antropométricos cambian además por fluidos, por lo que circunferencias de cabeza y extremidades no identifican grasa ni masa muscular automáticamente.

## D26. Acoustic dose

El límite de dosis V2 6073 se expresa para 24h incluyendo componentes de exposición al oído. No aplicar a ruido impulsivo ni interpretar medición exterior al casco como exposición efectiva sin evaluar atenuación; usar trazabilidad temporal segmentada. `D=100` define límite operativo, no probabilidad de hipoacusia.

## D27. Restricciones de dominio y disponibilidad

No todos los NASA Standards aplican a todas las misiones; requisitos de EVA, GCR libre espacio y presión de traje dependen de configuración. La capa `requisitos_contexto` exige perfil de misión. El código demo NO reemplaza el motor de producción: una regla simple sin gating complejo puede inducir falsos positivos.

## D28. Escalamiento clínico y operación

Separar eventos de ECLSS (control de cabina), eventos fisiológicos de seguridad (telemedicina/Flight Surgeon), vigilancia programada (DXA/OCT) y investigación. No forzar mismo score a incidentes heterogéneos. Las reglas críticas deben tener rutas de acción local aun si enlace terrestre tarda y atender principios de aislamiento de fallos.

## D29. Validación e incertidumbre

Para cada regla: experto define evento objetivo y ventana, dataset de derivación, verificación independiente, tasas de alertas y eventos omitidos, errores por dispositivo y perfiles, calibration plot, Brier si hay probabilidades. Los indicadores de dispositivo no se asumen gold-standard. Diseñar validación prospectiva sin que la propia alerta cambie el outcome de etiqueta (intervención/exposición).

## D30. Control de versiones y auditoría

Guardar SHA-256 de catálogo, fuente, versión NASA, fórmula, fase y umbral. Cambios en requisitos para una misión se gestionan como configuración firmada, no como regla mutada silenciosamente. Cada emisión conserva snapshot de regla, observables, QC, fuente de los valores, límites y operador humano que decide.

## D31. Riesgo poblacional en astronautas no se transfiere automáticamente

Por ejemplo, 52/64 observaciones SANS positivas en una selección de astronautas históricos no significa que cualquier astronauta bajo cualquier misión tenga 81.25% riesgo de SANS. Heterogeneidad en duración, instrumentación, contramedidas y definición de desenlace es determinante. Cualquier estimador reporta población y cohorte.

## D32. Prevención cardiovascular general con PREVENT

El riesgo PREVENT a diez años puede ser relevante premisión para población adulta elegible si se dispone de lípidos, eGFR, tabaquismo y datos completos. Pero su calibración deriva de cohortes terrestres y selección de astronautas crea desplazamiento de dominio; **no** predice automáticamente eventos cardiovascular durante microgravedad. Reutilizar en módulo terrestre con identificación precisa de población/horizonte.

## D33. Etapas de dato y acto médico

Implementar tres salidas separadas: alerta sensor, alerta operacional, y sugerencia médica. La cadena de causalidad no se fuerza de una alerta operacional al diagnóstico de enfermedad. Toda medicación y cambios de plan EVA requieren autoridad humana y procedimientos de misión.

## D34. No asumir que CBC/nutrientes/hormonas son obligatorios

Si la lista original permite labs variables, cada regla debe depender de la presencia de medición válida con marca temporal. Una persona con `Hb desconocida` no es una persona con `Hb normal`. Las sugerencias deben priorizar la prueba más útil/viable y su logística en vuelo.

## D35. Diferencias entre astronautas profesionales, participantes comerciales y análogos terrestres

Poblaciones distintas, cribado previo distinto, duraciones y contramedidas distintas. No aplicar modelos NASA sin personalización misión, ni inferir que cohortes militares/análogos responden igual. Tratar transportabilidad y aceptación de riesgo como cuestiones explícitas.
