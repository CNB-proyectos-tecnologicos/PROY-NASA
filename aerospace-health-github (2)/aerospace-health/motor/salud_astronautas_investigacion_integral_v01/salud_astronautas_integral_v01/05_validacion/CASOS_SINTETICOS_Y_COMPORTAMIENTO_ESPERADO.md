# Escenarios sintéticos para pruebas del motor y decisión médica

Los ejemplos ilustran comportamiento lógico esperado, **no** órdenes clínicas ni estimaciones individuales reales. Cada caso debe procesarse con fecha, fase, instrumentación, calidad y respaldo.

### A. Alarma CO₂ válida

Misión larga, 60 muestras válidas de ppCO₂ en cabina durante la última hora con media 3.25 mmHg. Se supera límite nominal NASA V2 6004. Debe emitirse alerta operacional ECLSS; no diagnosticar hipercapnia del astronauta. Si la persona simultáneamente tiene cefalea, esta es una hipótesis etiológica, no prueba.

### B. Lectura espuria de CO₂

Sólo hay 2 minutos de datos >3, el resto faltan. La media 1h no es calculable; respuesta `NO_CALCULABLE`, alarma de integridad de telemetría, petición de fuente redundante. No interpolar 58 minutos sin justificar.

### C. Hipoxemia aparente por reloj

SpO₂=86% con movimiento intenso y baja perfusión, sin trazado de calidad. El motor puede activar verificación urgente por gravedad potencial, pero etiquetar `SEÑAL_NO_CONFIRMADA` y pedir sensor redundante. No inferir por ello que presión cabina o FiO₂ cambió.

### D. Presión total cabina

Presión total =34.50 kPa. La norma `34.5 kPa < P` usa desigualdad estricta y no se cumple. A 103.00kPa sí está en el límite superior permitido; 103.01 no.

### E. Riesgo VTE con Doppler

Astronauta 48 años, sin familia afectada, sin trombofilias, grupo O, sin hormonas, Doppler yugular estasis, dímero D cambio +65% de basal en vuelo: score NASA propuesta `1+4+2=7`. No corresponde a 7% de probabilidad. Exige evaluación médica del contexto de trombosis, sin prescripción por algoritmo. Ejemplo reproducible en `EJEMPLOS_NUMERICOS.json`.

### F. Trombosis sin Doppler

Mismo astronauta, pero no se realizó ecografía. No poner componente Doppler=0, es `DESCONOCIDO`. Emitir alerta de falta de evaluación y declarar `score_total_NO_CALCULABLE`, o intervalo de valores posibles con cautela metodológica, nunca presentar `3 puntos` como total válido.

### G. SANS OCT

Delta TRT peripapilar 19µm no alcanza 20; 20µm sí categoría A, 55µm categoría B. Debe verificarse equipo Spectralis y protocolo comparable. Sin OCT no emitir `sin SANS` desde presión arterial normal.

### H. Pérdida ósea

DXA cadera 94% del basal: contramedidas bajo meta NASA V1 4027. Requiere técnica DXA comparable e interpretación en seguimiento, no clasificación de osteoporosis ni 6% de riesgo de fractura.

### I. Dosis radiológica

Career NASA effective dose 599.9 mSv aún bajo límite <600. Con 600.0 mSv deja de cumplir. Dosis al SNC en mGy no puede sumarse a mSv de carrera. Una exposición de 500 mGy en cerebro no significa cáncer con probabilidad 50%.

### J. Tolerancia EVA y capacidad aeróbica

VO₂max=33.8 mL/kg/min cumple mínimo microgravedad EVA 32.9, pero no superficie EVA 36.5. La comparación no autoriza por sí sola una tarea; falta fuerza, entrenamiento, traje y factores médicos.

### K. Sueño crítico

Dormir 5h por noche 5 días consecutivos puede activar aviso de fatiga y reprogramar una tarea crítica con supervisor; no equivale a diagnosticar depresión, trastorno sueño ni deterioro psiquiátrico.

### L. Cambio glóbulo rojo

Comparar hemoglobina y biomarcadores de hemólisis con basal; no utilizar el incremento promedio de destrucción eritrocitaria publicado por Nat Med como 54% de caída de Hb. Diferenciar hemoconcentración, anemia y variación analítica.

### M. Fase ovulatoria bajo supresión

Fase ovulación declarada=indeterminada porque se administra supresión menstrual: conservar `NO_APLICA` o `DESCONOCIDA` según origen, no reconstruir fase desde temperatura o HRV. En VTE registrar terapia hormonal exacta, no convertir fase en factor.

### N. Dosimetría ruido

8h a 85dBA al oído →100% dosis bajo fórmula NASA V2 6073. 4h a 88dBA →100%. La ecuación aplica exposición no impulsiva en launch/entry/abort; no extrapolar hipoacusia con riesgo 100%.

### O. Falsas alarmas

Detector experimental con 1% falsos avisos por astronauta-día, durante 180 días, bajo independencia `1-(.99)^180≈83.6%` probabilidad de al menos una falsa alerta. El supuesto de independencia y homogeneidad es poco realista, pero ejemplifica por qué minimizar tasa diaria es indispensable.
