# Fichas anotadas del catálogo espacial

**No equivalen a reglas diagnósticas validadas.** Para un mismo umbral se distingue norma NASA, criterio terrestre, observación y heurística.

## SP-0001 · CO2 horario por encima del límite nominal

- **Dominio / fase:** Cabina / CO2 / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cabin_ppco2_1h > 3` mmHg; **ventana:** ventana reglamentaria NASA (1 h para CO2).
- **Acción propuesta:** Verificar scrubber, ventilación y alertar control ambiental (CRITICA_OPERATIVA).
- **Confirmación:** Confirmación sensor ambiental redundante.
- **Razonamiento:** Control medioambiental; múltiples estaciones, media temporal correcta.
- **Alcance y límites:** La atmosfera requiere medidas del vehículo además de las obligatorias. V2 6004; NO diagnosticar hipercapnia con ppCO2 cabina
- **Alternativa o abstención:** No usar SpO2 como sustituto de PIO2
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0002 · CO2 horario en límite nominal

- **Dominio / fase:** Cabina / CO2 / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cabin_ppco2_1h >= 3` mmHg; **ventana:** ventana reglamentaria NASA (1 h para CO2).
- **Acción propuesta:** Revisar tendencia y margen de seguridad (ALTA_OPERATIVA).
- **Confirmación:** Sensor ambiental calibrado.
- **Razonamiento:** Control medioambiental; múltiples estaciones, media temporal correcta.
- **Alcance y límites:** La atmosfera requiere medidas del vehículo además de las obligatorias. Inclusión conservadora del límite 3 mmHg
- **Alternativa o abstención:** No usar SpO2 como sustituto de PIO2
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0003 · Presión total cabina inferior zona indefinida

- **Dominio / fase:** Cabina / CO2 / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cabin_pressure_kpa <= 34.5` kPa; **ventana:** ventana reglamentaria NASA (1 h para CO2).
- **Acción propuesta:** Activar protocolo de atmósfera de cabina (CRITICA_OPERATIVA).
- **Confirmación:** Sensor presión certificado.
- **Razonamiento:** Control medioambiental; múltiples estaciones, media temporal correcta.
- **Alcance y límites:** La atmosfera requiere medidas del vehículo además de las obligatorias. V2 6006: 34.5 kPa < p
- **Alternativa o abstención:** No usar SpO2 como sustituto de PIO2
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0004 · Presión total cabina por encima zona indefinida

- **Dominio / fase:** Cabina / CO2 / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cabin_pressure_kpa > 103` kPa; **ventana:** ventana reglamentaria NASA (1 h para CO2).
- **Acción propuesta:** Aplicar protocolo de presión ambiental (CRITICA_OPERATIVA).
- **Confirmación:** Sensor presión certificado.
- **Razonamiento:** Control medioambiental; múltiples estaciones, media temporal correcta.
- **Alcance y límites:** La atmosfera requiere medidas del vehículo además de las obligatorias. V2 6006: p ≤103 kPa
- **Alternativa o abstención:** No usar SpO2 como sustituto de PIO2
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0005 · Fracción diluyente insuficiente

- **Dominio / fase:** Cabina / CO2 / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cabin_diluent_pct < 30` %; **ventana:** ventana reglamentaria NASA (1 h para CO2).
- **Acción propuesta:** Verificar composición y riesgos asociados (ALTA_OPERATIVA).
- **Confirmación:** Analizador gas y equipo ECLSS.
- **Razonamiento:** Control medioambiental; múltiples estaciones, media temporal correcta.
- **Alcance y límites:** La atmosfera requiere medidas del vehículo además de las obligatorias. V2 6002; solo atmósfera nominal
- **Alternativa o abstención:** No usar SpO2 como sustituto de PIO2
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0006 · Caída rápida presión (>1 psi)

- **Dominio / fase:** Cabina / CO2 / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cabin_pressure_rate_psi_min > 13.5` psi/min; **ventana:** ventana reglamentaria NASA (1 h para CO2).
- **Acción propuesta:** Evaluación de despresurización y barotrauma (CRITICA_OPERATIVA).
- **Confirmación:** Instrumentos, fase operativa, delta>1 psi.
- **Razonamiento:** Control medioambiental; múltiples estaciones, media temporal correcta.
- **Alcance y límites:** La atmosfera requiere medidas del vehículo además de las obligatorias. V2 6007 condicionado a cambio >1 psi
- **Alternativa o abstención:** No usar SpO2 como sustituto de PIO2
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0007 · O2 inspirado de cabina baja como referencia histórica

- **Dominio / fase:** Cabina / CO2 / F. **Evidencia:** D. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `cabin_pio2_mmhg < 127` mmHg; **ventana:** ventana reglamentaria NASA (1 h para CO2).
- **Acción propuesta:** Comparar con tabla por duración/atmósfera y activar ECLSS (ALTA_OPERATIVA).
- **Confirmación:** Analizador O2 y cálculo PIO2.
- **Razonamiento:** Control medioambiental; múltiples estaciones, media temporal correcta.
- **Alcance y límites:** La atmosfera requiere medidas del vehículo además de las obligatorias. 127 es referencia en argumento V2, NO mínimo universal ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa.
- **Alternativa o abstención:** No usar SpO2 como sustituto de PIO2
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0008 · CO2 media 7 días elevada para modelo cefalea

- **Dominio / fase:** Cabina / CO2 / F. **Evidencia:** N. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `cabin_ppco2_7d >= 2.5` mmHg; **ventana:** ventana reglamentaria NASA (1 h para CO2).
- **Acción propuesta:** Revisar cefaleas y ventilación, sin estimar riesgo individual (INVESTIGACION).
- **Confirmación:** Confirmar serie CO2 cabina.
- **Razonamiento:** Control medioambiental; múltiples estaciones, media temporal correcta.
- **Alcance y límites:** La atmosfera requiere medidas del vehículo además de las obligatorias. Observación CO2-HA ~49 tripulantes; no es límite regulatorio
- **Alternativa o abstención:** No usar SpO2 como sustituto de PIO2
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0009 · Contaminación VOC por encima límite de misión

- **Dominio / fase:** Cabina / calidad del hábitat / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cabin_voc_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Aislar fuente y activar protocolo químico (CRITICA_OPERATIVA).
- **Confirmación:** Analizador VOC y límite misión.
- **Razonamiento:** Seguridad de hábitat; indicadores del vehículo no forman parte del mínimo biométrico.
- **Alcance y límites:** Condiciones de ingeniería, no enfermedad individual. V2 6023; umbral depende sustancia
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0010 · Alarma de calidad agua potable

- **Dominio / fase:** Cabina / calidad del hábitat / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `water_quality_bad == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Suspender suministro implicado y activar protocolo (CRITICA_OPERATIVA).
- **Confirmación:** Análisis microbiológico/químico.
- **Razonamiento:** Seguridad de hábitat; indicadores del vehículo no forman parte del mínimo biométrico.
- **Alcance y límites:** Condiciones de ingeniería, no enfermedad individual. V2 6026/6046
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0011 · Oxígeno ambiental fuera de perfil aprobado

- **Dominio / fase:** Cabina / calidad del hábitat / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cabin_o2_violation == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Respuesta ECLSS (CRITICA_OPERATIVA).
- **Confirmación:** Composición atmósfera y fase.
- **Razonamiento:** Seguridad de hábitat; indicadores del vehículo no forman parte del mínimo biométrico.
- **Alcance y límites:** Condiciones de ingeniería, no enfermedad individual. Precalculado respecto tabla 6.2-1, no límite universal
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0012 · Temperatura y humedad fuera de zona aprobada

- **Dominio / fase:** Cabina / calidad del hábitat / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cabin_thermal_zone_violation == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Corregir control térmico (ALTA_OPERATIVA).
- **Confirmación:** Medir T, RH y región poligonal.
- **Razonamiento:** Seguridad de hábitat; indicadores del vehículo no forman parte del mínimo biométrico.
- **Alcance y límites:** Condiciones de ingeniería, no enfermedad individual. V2 figura 6.2-2; NO caja rectangular simple
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0013 · Caudal de ventilación bajo estándar

- **Dominio / fase:** Cabina / calidad del hábitat / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cabin_ventilation_alarm == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Verificar zonas estancadas CO2 y sistemas (ALTA_OPERATIVA).
- **Confirmación:** Instrumento ventilación.
- **Razonamiento:** Seguridad de hábitat; indicadores del vehículo no forman parte del mínimo biométrico.
- **Alcance y límites:** Condiciones de ingeniería, no enfermedad individual. Límite propio del programa
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0014 · Ruido diario supera dosis permitida NASA

- **Dominio / fase:** Cabina / calidad del hábitat / A. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `noise_dose_pct > 100` %; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisión de protección auditiva y fuente sonora (ALTA_OPERATIVA).
- **Confirmación:** Dosímetro y fórmula NASA V2 6073.
- **Razonamiento:** Seguridad de hábitat; indicadores del vehículo no forman parte del mínimo biométrico.
- **Alcance y límites:** Condiciones de ingeniería, no enfermedad individual. D=100 sum Cn/Tn, Tn=480/2^((Ln-85)/3)
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0015 · Nivel lanzamiento/entrada supera techo ruido

- **Dominio / fase:** Cabina / calidad del hábitat / A. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `launch_dba > 105` dBA; **ventana:** confirmar la medida.
- **Acción propuesta:** Reducir exposición según protocolo acústico (CRITICA_OPERATIVA).
- **Confirmación:** Dosímetro de oído.
- **Razonamiento:** Seguridad de hábitat; indicadores del vehículo no forman parte del mínimo biométrico.
- **Alcance y límites:** Condiciones de ingeniería, no enfermedad individual. V2 6074; no aplica exposiciones impulsivas
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0016 · Agua potable suministrada por tripulante insuficiente

- **Dominio / fase:** Cabina / calidad del hábitat / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `water_available_L_day < 2.5` L/día; **ventana:** confirmar la medida.
- **Acción propuesta:** Corregir provisión y planificación (ALTA_OPERATIVA).
- **Confirmación:** Inventario de disponibilidad.
- **Razonamiento:** Seguridad de hábitat; indicadores del vehículo no forman parte del mínimo biométrico.
- **Alcance y límites:** Condiciones de ingeniería, no enfermedad individual. V2 6109; NO es volumen bebido
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** EXPOSICION_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0017 · Exposición efectiva carrera NASA límite

- **Dominio / fase:** Radiación / dosimetría / A. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `career_effective_mSv >= 600` mSv; **ventana:** confirmar la medida.
- **Acción propuesta:** Escalar al responsable de protección radiológica (CRITICA_OPERATIVA).
- **Confirmación:** Dosimetría NASA Q y exposición acumulada.
- **Razonamiento:** Los límites protegen tejidos o carrera, no son ecuaciones directas de probabilidad cáncer.
- **Alcance y límites:** Sólo con dosimetría y condiciones NASA aplicables. V1 4030; no interpretar como 3% de cáncer individual
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N15 — [NASA Space radiation policy](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Vol 1 V1 4029/4030.

## SP-0018 · Proyección misión supera carrera 600

- **Dominio / fase:** Radiación / dosimetría / P. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `career_plus_projected_mSv >= 600` mSv; **ventana:** confirmar la medida.
- **Acción propuesta:** Replanificar exposición prevista (CRITICA_OPERATIVA).
- **Confirmación:** Modelo dosimétrico de misión.
- **Razonamiento:** Los límites protegen tejidos o carrera, no son ecuaciones directas de probabilidad cáncer.
- **Alcance y límites:** Sólo con dosimetría y condiciones NASA aplicables. Incluir historial de vuelos
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N15 — [NASA Space radiation policy](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Vol 1 V1 4029/4030.

## SP-0019 · Evento partícula solar relevante

- **Dominio / fase:** Radiación / dosimetría / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `solar_particle_alert == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Protocolo refugio radiológico (CRITICA_OPERATIVA).
- **Confirmación:** Detector espacial y alarma misión.
- **Razonamiento:** Los límites protegen tejidos o carrera, no son ecuaciones directas de probabilidad cáncer.
- **Alcance y límites:** Sólo con dosimetría y condiciones NASA aplicables. Sin dosímetro no detectarse por frecuencia cardiaca
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N15 — [NASA Space radiation policy](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Vol 1 V1 4029/4030.

## SP-0020 · Dosis lente 30 días supera límite

- **Dominio / fase:** Radiación / dosimetría / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `lens_30d_mGy_eq > 1000` mGy-Eq; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar dosis a órgano con especialista (CRITICA_OPERATIVA).
- **Confirmación:** Dosímetro órgano ponderación RBE.
- **Razonamiento:** Los límites protegen tejidos o carrera, no son ecuaciones directas de probabilidad cáncer.
- **Alcance y límites:** Sólo con dosimetría y condiciones NASA aplicables. V1 4.8.1 lens 30d
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N15 — [NASA Space radiation policy](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Vol 1 V1 4029/4030.

## SP-0021 · Dosis lente anual supera límite

- **Dominio / fase:** Radiación / dosimetría / A. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `lens_1y_mGy_eq > 2000` mGy-Eq; **ventana:** confirmar la medida.
- **Acción propuesta:** Reevaluación dosimétrica (CRITICA_OPERATIVA).
- **Confirmación:** Dosímetro órgano.
- **Razonamiento:** Los límites protegen tejidos o carrera, no son ecuaciones directas de probabilidad cáncer.
- **Alcance y límites:** Sólo con dosimetría y condiciones NASA aplicables. V1 4.8.1 lens 1y
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N15 — [NASA Space radiation policy](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Vol 1 V1 4029/4030.

## SP-0022 · Dosis lente carrera supera límite

- **Dominio / fase:** Radiación / dosimetría / A. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `lens_career_mGy_eq > 4000` mGy-Eq; **ventana:** confirmar la medida.
- **Acción propuesta:** Replanificar carrera y examen oftalmológico (CRITICA_OPERATIVA).
- **Confirmación:** Dosimetría órgano.
- **Razonamiento:** Los límites protegen tejidos o carrera, no son ecuaciones directas de probabilidad cáncer.
- **Alcance y límites:** Sólo con dosimetría y condiciones NASA aplicables. V1 4.8.1 lens career
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N15 — [NASA Space radiation policy](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Vol 1 V1 4029/4030.

## SP-0023 · Dosis órganos hematopoyéticos 30 días supera límite

- **Dominio / fase:** Radiación / dosimetría / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `bfo_30d_mGy_eq > 250` mGy-Eq; **ventana:** confirmar la medida.
- **Acción propuesta:** Activar protocolo radiobiológico (CRITICA_OPERATIVA).
- **Confirmación:** Dosimetría específica BFO.
- **Razonamiento:** Los límites protegen tejidos o carrera, no son ecuaciones directas de probabilidad cáncer.
- **Alcance y límites:** Sólo con dosimetría y condiciones NASA aplicables. V1 4.8.1 BFO
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N15 — [NASA Space radiation policy](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Vol 1 V1 4029/4030.

## SP-0024 · Dosis circulatorio anual supera límite

- **Dominio / fase:** Radiación / dosimetría / A. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `circ_1y_mGy_eq > 500` mGy-Eq; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación cardiocirculatoria de radiación (CRITICA_OPERATIVA).
- **Confirmación:** Dosimetría órgano.
- **Razonamiento:** Los límites protegen tejidos o carrera, no son ecuaciones directas de probabilidad cáncer.
- **Alcance y límites:** Sólo con dosimetría y condiciones NASA aplicables. V1 4.8.1 circulatorio
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N15 — [NASA Space radiation policy](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Vol 1 V1 4029/4030.

## SP-0025 · Dosis sistema nervioso central carrera supera límite

- **Dominio / fase:** Radiación / dosimetría / A. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cns_career_mGy > 1500` mGy; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisión radiológica especializada (CRITICA_OPERATIVA).
- **Confirmación:** Dosimetría tejido; NO mSv.
- **Razonamiento:** Los límites protegen tejidos o carrera, no son ecuaciones directas de probabilidad cáncer.
- **Alcance y límites:** Sólo con dosimetría y condiciones NASA aplicables. V1 4.8.1 CNS
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N15 — [NASA Space radiation policy](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Vol 1 V1 4029/4030.

## SP-0026 · Dosis CNS alto Z carrera supera límite

- **Dominio / fase:** Radiación / dosimetría / A. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cns_z10_career_mGy > 250` mGy; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar contribución de partículas Z≥10 (CRITICA_OPERATIVA).
- **Confirmación:** Detector especializado.
- **Razonamiento:** Los límites protegen tejidos o carrera, no son ecuaciones directas de probabilidad cáncer.
- **Alcance y límites:** Sólo con dosimetría y condiciones NASA aplicables. V1 4.8.1 CNS Z≥10
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N15 — [NASA Space radiation policy](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Vol 1 V1 4029/4030.

## SP-0027 · Procedimiento prebreathe incumplido

- **Dominio / fase:** EVA / descompresión / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `prebreathe_noncompliant == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Suspender/protocolizar EVA según controlador (CRITICA_OPERATIVA).
- **Confirmación:** Registro gases, tiempo y procedimiento.
- **Razonamiento:** El protocolo técnico es la fuente principal; señales de desgaste no sustituyen supervisión EVA.
- **Alcance y límites:** Solo con flag certificado del procedimiento de misión. No inventar tiempos; DCS requiere proceso EVA
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N25 — [NASA decompression/hypoxia risks](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/); localizador: EVA DCS e hipoxia.

## SP-0028 · Síntomas compatibles con enfermedad descompresiva

- **Dominio / fase:** EVA / descompresión / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `dcs_symptom_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Activar atención por médico de vuelo y protocolo EVA (URGENTE).
- **Confirmación:** Examen clínico y evaluación de presiones.
- **Razonamiento:** El protocolo técnico es la fuente principal; señales de desgaste no sustituyen supervisión EVA.
- **Alcance y límites:** Solo con flag certificado del procedimiento de misión. No detectable exclusivamente con sensores biométricos
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N25 — [NASA decompression/hypoxia risks](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/); localizador: EVA DCS e hipoxia.

## SP-0029 · Cambio presión EVA no planificado

- **Dominio / fase:** EVA / descompresión / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `eva_pressure_alarm == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Abortar operación según procedimiento (CRITICA_OPERATIVA).
- **Confirmación:** Telemetría traje.
- **Razonamiento:** El protocolo técnico es la fuente principal; señales de desgaste no sustituyen supervisión EVA.
- **Alcance y límites:** Solo con flag certificado del procedimiento de misión. Seguridad del traje domina triage biométrico
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N25 — [NASA decompression/hypoxia risks](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/); localizador: EVA DCS e hipoxia.

## SP-0030 · Pérdida integridad traje

- **Dominio / fase:** EVA / descompresión / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `eva_suit_integrity_alarm == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Procedimiento de emergencia EVA (CRITICA_OPERATIVA).
- **Confirmación:** Diagnóstico sistema de soporte vital.
- **Razonamiento:** El protocolo técnico es la fuente principal; señales de desgaste no sustituyen supervisión EVA.
- **Alcance y límites:** Solo con flag certificado del procedimiento de misión. No sustituir ECLSS con SpO2
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N25 — [NASA decompression/hypoxia risks](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/); localizador: EVA DCS e hipoxia.

## SP-0031 · Exposición O2 EVA no aprobada

- **Dominio / fase:** EVA / descompresión / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `eva_o2_alarm == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Activar checklist EVA y monitorizar signos (CRITICA_OPERATIVA).
- **Confirmación:** Sensor ppO2 traje.
- **Razonamiento:** El protocolo técnico es la fuente principal; señales de desgaste no sustituyen supervisión EVA.
- **Alcance y límites:** Solo con flag certificado del procedimiento de misión. Umbral específico traje/operación
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N25 — [NASA decompression/hypoxia risks](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/); localizador: EVA DCS e hipoxia.

## SP-0032 · Aumento FC con alarma CO2 traje

- **Dominio / fase:** EVA / descompresión / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `eva_co2_alarm == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Respuesta sistema CO2 traje (CRITICA_OPERATIVA).
- **Confirmación:** Telemetría traje.
- **Razonamiento:** El protocolo técnico es la fuente principal; señales de desgaste no sustituyen supervisión EVA.
- **Alcance y límites:** Solo con flag certificado del procedimiento de misión. Cefalea/taquicardia inespecíficas
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N25 — [NASA decompression/hypoxia risks](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/); localizador: EVA DCS e hipoxia.

## SP-0033 · SpO2 crítica sostenida

- **Dominio / fase:** Oxigenación tripulación / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `spo2_2min < 90` %; **ventana:** confirmar la medida.
- **Acción propuesta:** Verificar oxímetro, oxigenación y condiciones de cabina (URGENTE).
- **Confirmación:** Repetir SpO2 validada, explorar PaO2.
- **Razonamiento:** SpO2 no es presión parcial O2 inhalado y puede ocultar hipoxemia.
- **Alcance y límites:** Cortes 90/92 orientativos clínicos no normativos espaciales. 90% es umbral clínico terrestre orientativo; altitud/atmosfera cambian interpretación Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N25 — [NASA decompression/hypoxia risks](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/); localizador: EVA DCS e hipoxia.

## SP-0034 · SpO2 moderadamente baja

- **Dominio / fase:** Oxigenación tripulación / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `spo2_5min < 92` %; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación clínica y ambiente de cabina (ALTA).
- **Confirmación:** Oxímetro validado y correlación clínica.
- **Razonamiento:** SpO2 no es presión parcial O2 inhalado y puede ocultar hipoxemia.
- **Alcance y límites:** Cortes 90/92 orientativos clínicos no normativos espaciales. 92% es señal de revisión, no criterio NASA universal Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N25 — [NASA decompression/hypoxia risks](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/); localizador: EVA DCS e hipoxia.

## SP-0035 · Caída individual SpO2 marcada

- **Dominio / fase:** Oxigenación tripulación / A. **Evidencia:** C. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `spo2_delta_baseline <= -4` puntos porcentuales; **ventana:** confirmar la medida.
- **Acción propuesta:** Confirmación instrumental y revisión de cabina (INVESTIGACION).
- **Confirmación:** Repetir con sensor validado.
- **Razonamiento:** SpO2 no es presión parcial O2 inhalado y puede ocultar hipoxemia.
- **Alcance y límites:** Cortes 90/92 orientativos clínicos no normativos espaciales. Heurística no validada para astronautas
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N25 — [NASA decompression/hypoxia risks](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/); localizador: EVA DCS e hipoxia.

## SP-0036 · SpO2 baja durante EVA

- **Dominio / fase:** Oxigenación tripulación / F. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `eva_spo2_2min < 90` %; **ventana:** confirmar la medida.
- **Acción propuesta:** Activar evaluación de soporte vital y médico de vuelo (URGENTE).
- **Confirmación:** Comparar con ppO2 traje y datos presión.
- **Razonamiento:** SpO2 no es presión parcial O2 inhalado y puede ocultar hipoxemia.
- **Alcance y límites:** Cortes 90/92 orientativos clínicos no normativos espaciales. Sujeto a curvas y limitaciones oximetría Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N25 — [NASA decompression/hypoxia risks](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/); localizador: EVA DCS e hipoxia.

## SP-0037 · Hipoxemia clínica concordante cabina

- **Dominio / fase:** Oxigenación tripulación / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `hypoxia_combined_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar riesgo hipoxia por sistema y fisiología (URGENTE).
- **Confirmación:** Medición independiente cabin PIO2 + SpO2.
- **Razonamiento:** SpO2 no es presión parcial O2 inhalado y puede ocultar hipoxemia.
- **Alcance y límites:** Cortes 90/92 orientativos clínicos no normativos espaciales. Flag de regla multivar validada por misión
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N25 — [NASA decompression/hypoxia risks](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/); localizador: EVA DCS e hipoxia.

## SP-0038 · SpO2 sin señal útil

- **Dominio / fase:** Oxigenación tripulación / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `spo2_quality_bad == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No reportar hipoxemia sin datos; cambiar sensor (CALIDAD).
- **Confirmación:** Chequeo perfusión y movimiento.
- **Razonamiento:** SpO2 no es presión parcial O2 inhalado y puede ocultar hipoxemia.
- **Alcance y límites:** Cortes 90/92 orientativos clínicos no normativos espaciales. La ausencia de medición NO indica normalidad
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N25 — [NASA decompression/hypoxia risks](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/); localizador: EVA DCS e hipoxia.

## SP-0039 · Ortostatismo clásico descenso sistólica

- **Dominio / fase:** Adaptación cardiovascular / ortostatismo / R. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `orth_sbp_drop_3min >= 20` mmHg; **ventana:** medición protocolizada.
- **Acción propuesta:** Evaluar intolerancia ortostática y riesgo de caída (ALTA).
- **Confirmación:** Decúbito 5 min y ortostatismo 3 min.
- **Razonamiento:** Reglas de cribado/urgencia; postvuelo requiere supervisión de prueba.
- **Alcance y límites:** Despegue/aterrizaje g puede afectar lecturas. Solo prueba postural controlada
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N13 — [Orthostatic hypotension: practical approach AAFP](https://www.aafp.org/afp/2022/0100/p39); localizador: Definición postura y descenso PA.

## SP-0040 · Ortostatismo clásico descenso diastólica

- **Dominio / fase:** Adaptación cardiovascular / ortostatismo / R. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `orth_dbp_drop_3min >= 10` mmHg; **ventana:** medición protocolizada.
- **Acción propuesta:** Evaluar intolerancia ortostática y riesgo de caída (ALTA).
- **Confirmación:** Prueba postural según protocolo.
- **Razonamiento:** Reglas de cribado/urgencia; postvuelo requiere supervisión de prueba.
- **Alcance y límites:** Despegue/aterrizaje g puede afectar lecturas. No extrapolar variaciones sin registro postura
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N13 — [Orthostatic hypotension: practical approach AAFP](https://www.aafp.org/afp/2022/0100/p39); localizador: Definición postura y descenso PA.

## SP-0041 · Presión sistólica muy baja

- **Dominio / fase:** Adaptación cardiovascular / ortostatismo / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `sbp_confirmed < 90` mmHg; **ventana:** medición protocolizada.
- **Acción propuesta:** Evaluar perfusión y causas médicas (URGENTE).
- **Confirmación:** Tensiómetro validado.
- **Razonamiento:** Reglas de cribado/urgencia; postvuelo requiere supervisión de prueba.
- **Alcance y límites:** Despegue/aterrizaje g puede afectar lecturas. En microgravedad cambiar interpretación de postura
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N13 — [Orthostatic hypotension: practical approach AAFP](https://www.aafp.org/afp/2022/0100/p39); localizador: Definición postura y descenso PA.

## SP-0042 · Frecuencia elevada en reposo

- **Dominio / fase:** Adaptación cardiovascular / ortostatismo / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `rest_hr_10min > 120` lpm; **ventana:** medición protocolizada.
- **Acción propuesta:** Evaluar taquicardia sostenida y causas (ALTA).
- **Confirmación:** ECG o sensor validado, contexto ejercicio.
- **Razonamiento:** Reglas de cribado/urgencia; postvuelo requiere supervisión de prueba.
- **Alcance y límites:** Despegue/aterrizaje g puede afectar lecturas. FC aislada no identifica arritmia Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N13 — [Orthostatic hypotension: practical approach AAFP](https://www.aafp.org/afp/2022/0100/p39); localizador: Definición postura y descenso PA.

## SP-0043 · Frecuencia extremadamente elevada

- **Dominio / fase:** Adaptación cardiovascular / ortostatismo / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `rest_hr_5min > 150` lpm; **ventana:** medición protocolizada.
- **Acción propuesta:** Evaluación inmediata clínica/ECG (URGENTE).
- **Confirmación:** ECG y verificación artefactos.
- **Razonamiento:** Reglas de cribado/urgencia; postvuelo requiere supervisión de prueba.
- **Alcance y límites:** Despegue/aterrizaje g puede afectar lecturas. Alarma de deterioro, no etiqueta FA Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N13 — [Orthostatic hypotension: practical approach AAFP](https://www.aafp.org/afp/2022/0100/p39); localizador: Definición postura y descenso PA.

## SP-0044 · Bradicardia marcada en vigilia

- **Dominio / fase:** Adaptación cardiovascular / ortostatismo / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `awake_hr_5min < 40` lpm; **ventana:** medición protocolizada.
- **Acción propuesta:** Confirmar y evaluar perfusión (ALTA).
- **Confirmación:** ECG, comparar con atleta entrenado.
- **Razonamiento:** Reglas de cribado/urgencia; postvuelo requiere supervisión de prueba.
- **Alcance y límites:** Despegue/aterrizaje g puede afectar lecturas. Vigilancia individualizada Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N13 — [Orthostatic hypotension: practical approach AAFP](https://www.aafp.org/afp/2022/0100/p39); localizador: Definición postura y descenso PA.

## SP-0045 · Descenso de presión con síncope

- **Dominio / fase:** Adaptación cardiovascular / ortostatismo / R. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `syncope_event == 1` indicador; **ventana:** medición protocolizada.
- **Acción propuesta:** Asegurar protección, evaluación médica inmediata (URGENTE).
- **Confirmación:** Observación clínica, ECG y pruebas.
- **Razonamiento:** Reglas de cribado/urgencia; postvuelo requiere supervisión de prueba.
- **Alcance y límites:** Despegue/aterrizaje g puede afectar lecturas. Síncope no deducible de FC únicamente
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N13 — [Orthostatic hypotension: practical approach AAFP](https://www.aafp.org/afp/2022/0100/p39); localizador: Definición postura y descenso PA.

## SP-0046 · Hipotensión postaterrizaje prolongada

- **Dominio / fase:** Adaptación cardiovascular / ortostatismo / R. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `orthostatic_symptom_flag == 1` indicador; **ventana:** medición protocolizada.
- **Acción propuesta:** Intervención rehabilitación/medicina de vuelo (ALTA).
- **Confirmación:** Entrevista + test ortostático.
- **Razonamiento:** Reglas de cribado/urgencia; postvuelo requiere supervisión de prueba.
- **Alcance y límites:** Despegue/aterrizaje g puede afectar lecturas. Población espacial con incidencia elevada, no prob individual
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N13 — [Orthostatic hypotension: practical approach AAFP](https://www.aafp.org/afp/2022/0100/p39); localizador: Definición postura y descenso PA.

## SP-0047 · Presión elevada categoría AHA

- **Dominio / fase:** Presión y prevención cardiovascular / P. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `sbp_protocol_mean >= 120` mmHg; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar factores cardiovasculares y promedios (SEGUIMIENTO).
- **Confirmación:** 2 visitas y mediciones válidas.
- **Razonamiento:** La presión cuffless sin validación no satisface clasificación clínica.
- **Alcance y límites:** Prevención pre misión y seguimiento, no etiqueta de aptitud automática. Valorar diastólica, contexto de prevención
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N18 — [AHA/ACC BP Guidelines](https://www.jacc.org/doi/10.1016/j.jacc.2025.05.007); localizador: Clasificación PA y precisión cuffless.

## SP-0048 · Hipertensión estadio 1 por sistólica

- **Dominio / fase:** Presión y prevención cardiovascular / P. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `sbp_protocol_mean >= 130` mmHg; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar hipertensión y riesgo cardiovascular (CONSULTA).
- **Confirmación:** PA validada≥2 ocasiones.
- **Razonamiento:** La presión cuffless sin validación no satisface clasificación clínica.
- **Alcance y límites:** Prevención pre misión y seguimiento, no etiqueta de aptitud automática. Se necesita límite superior 139 para categoría exclusiva
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N18 — [AHA/ACC BP Guidelines](https://www.jacc.org/doi/10.1016/j.jacc.2025.05.007); localizador: Clasificación PA y precisión cuffless.

## SP-0049 · Hipertensión estadio 2 por sistólica

- **Dominio / fase:** Presión y prevención cardiovascular / P. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `sbp_protocol_mean >= 140` mmHg; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar selección/recertificación médica (CONSULTA).
- **Confirmación:** PA confirmada.
- **Razonamiento:** La presión cuffless sin validación no satisface clasificación clínica.
- **Alcance y límites:** Prevención pre misión y seguimiento, no etiqueta de aptitud automática. Límite AHA general, no automáticamente descalificación
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N18 — [AHA/ACC BP Guidelines](https://www.jacc.org/doi/10.1016/j.jacc.2025.05.007); localizador: Clasificación PA y precisión cuffless.

## SP-0050 · Hipertensión estadio 1 por diastólica

- **Dominio / fase:** Presión y prevención cardiovascular / P. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `dbp_protocol_mean >= 80` mmHg; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar hipertensión (CONSULTA).
- **Confirmación:** Medición confirmada.
- **Razonamiento:** La presión cuffless sin validación no satisface clasificación clínica.
- **Alcance y límites:** Prevención pre misión y seguimiento, no etiqueta de aptitud automática. Puede ser estadio 2 si ≥90
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N18 — [AHA/ACC BP Guidelines](https://www.jacc.org/doi/10.1016/j.jacc.2025.05.007); localizador: Clasificación PA y precisión cuffless.

## SP-0051 · Hipertensión estadio 2 por diastólica

- **Dominio / fase:** Presión y prevención cardiovascular / P. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `dbp_protocol_mean >= 90` mmHg; **ventana:** confirmar la medida.
- **Acción propuesta:** Control de riesgo cardiovascular (CONSULTA).
- **Confirmación:** Medición confirmada.
- **Razonamiento:** La presión cuffless sin validación no satisface clasificación clínica.
- **Alcance y límites:** Prevención pre misión y seguimiento, no etiqueta de aptitud automática. Valor AHA, no hipertensión por smartwatch
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N18 — [AHA/ACC BP Guidelines](https://www.jacc.org/doi/10.1016/j.jacc.2025.05.007); localizador: Clasificación PA y precisión cuffless.

## SP-0052 · Hipertensión severa sistólica

- **Dominio / fase:** Presión y prevención cardiovascular / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `sbp_confirmed >= 180` mmHg; **ventana:** confirmar la medida.
- **Acción propuesta:** Medir daño de órgano, evaluación urgente (URGENTE).
- **Confirmación:** Repetir y valorar síntomas/órganos.
- **Razonamiento:** La presión cuffless sin validación no satisface clasificación clínica.
- **Alcance y límites:** Prevención pre misión y seguimiento, no etiqueta de aptitud automática. No clasificar automáticamente emergencia hipertensiva
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N18 — [AHA/ACC BP Guidelines](https://www.jacc.org/doi/10.1016/j.jacc.2025.05.007); localizador: Clasificación PA y precisión cuffless.

## SP-0053 · Hipertensión severa diastólica

- **Dominio / fase:** Presión y prevención cardiovascular / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `dbp_confirmed >= 120` mmHg; **ventana:** confirmar la medida.
- **Acción propuesta:** Valorar daño agudo de órgano (URGENTE).
- **Confirmación:** Repetir con dispositivo clínico.
- **Razonamiento:** La presión cuffless sin validación no satisface clasificación clínica.
- **Alcance y límites:** Prevención pre misión y seguimiento, no etiqueta de aptitud automática. Urgencia depende del daño, no número solo
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N18 — [AHA/ACC BP Guidelines](https://www.jacc.org/doi/10.1016/j.jacc.2025.05.007); localizador: Clasificación PA y precisión cuffless.

## SP-0054 · Riesgo cardiovascular PREVENT faltan predictores

- **Dominio / fase:** Presión y prevención cardiovascular / P. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `prevent_missing_predictors == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Abstenerse y solicitar lípidos/antecedentes (NO_CALCULABLE).
- **Confirmación:** Predictores requeridos.
- **Razonamiento:** La presión cuffless sin validación no satisface clasificación clínica.
- **Alcance y límites:** Prevención pre misión y seguimiento, no etiqueta de aptitud automática. No reemplazar por etnia ni CGM
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N18 — [AHA/ACC BP Guidelines](https://www.jacc.org/doi/10.1016/j.jacc.2025.05.007); localizador: Clasificación PA y precisión cuffless.

## SP-0055 · Ecografía yugular estasis velocidad

- **Dominio / fase:** Trombosis yugular / VTE / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `ijv_peak_velocity_cm_s < 10` cm/s; **ventana:** ecografía protocolizada o score validado.
- **Acción propuesta:** Revisión riesgo VTE por médico de vuelo (ALTA).
- **Confirmación:** Ultrasonido yugular protocolizado.
- **Razonamiento:** Propuesta NASA julio 2026; puntos no equivalen a proporción de VTE.
- **Alcance y límites:** Requiere factores hematológicos opcionales y ecografía. NASA 2026 +4 puntos, pero no probabilidad
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** SCORE_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N03 — [NASA OCHMO VTE Risk Score](https://www.nasa.gov/wp-content/uploads/2026/06/risk-venous-thromboembolism-assessment-sp20260005258.pdf); localizador: Figura/tabla VTE risk score p. 4; NASA/SP-20260005258.

## SP-0056 · Ecografía flujo retrógrado

- **Dominio / fase:** Trombosis yugular / VTE / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `ijv_retrograde == 1` indicador; **ventana:** ecografía protocolizada o score validado.
- **Acción propuesta:** Evaluar estasis VTE con cirugía/hematología espacial (ALTA).
- **Confirmación:** Doppler ecografía bilateral.
- **Razonamiento:** Propuesta NASA julio 2026; puntos no equivalen a proporción de VTE.
- **Alcance y límites:** Requiere factores hematológicos opcionales y ecografía. NASA 2026 +4, NO doble contar estasis
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** SCORE_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N03 — [NASA OCHMO VTE Risk Score](https://www.nasa.gov/wp-content/uploads/2026/06/risk-venous-thromboembolism-assessment-sp20260005258.pdf); localizador: Figura/tabla VTE risk score p. 4; NASA/SP-20260005258.

## SP-0057 · Dímero D aumento respecto basal en vuelo

- **Dominio / fase:** Trombosis yugular / VTE / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `d_dimer_inflight_change_pct > 60` %; **ventana:** ecografía protocolizada o score validado.
- **Acción propuesta:** Valorar algoritmo VTE y causas del cambio (ALTA).
- **Confirmación:** Dos ensayos comparables.
- **Razonamiento:** Propuesta NASA julio 2026; puntos no equivalen a proporción de VTE.
- **Alcance y límites:** Requiere factores hematológicos opcionales y ecografía. NASA 2026 +2; no usar nivel terrestre sin basal
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** SCORE_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N03 — [NASA OCHMO VTE Risk Score](https://www.nasa.gov/wp-content/uploads/2026/06/risk-venous-thromboembolism-assessment-sp20260005258.pdf); localizador: Figura/tabla VTE risk score p. 4; NASA/SP-20260005258.

## SP-0058 · Puntuación VTE NASA ≥2

- **Dominio / fase:** Trombosis yugular / VTE / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `nasa_vte_score >= 2` puntos; **ventana:** ecografía protocolizada o score validado.
- **Acción propuesta:** Derivar a evaluación y monitorización intensificada (CONSULTA).
- **Confirmación:** Score calculado con campos suficientes.
- **Razonamiento:** Propuesta NASA julio 2026; puntos no equivalen a proporción de VTE.
- **Alcance y límites:** Requiere factores hematológicos opcionales y ecografía. No asignar categoría si faltan factores
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** SCORE_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N03 — [NASA OCHMO VTE Risk Score](https://www.nasa.gov/wp-content/uploads/2026/06/risk-venous-thromboembolism-assessment-sp20260005258.pdf); localizador: Figura/tabla VTE risk score p. 4; NASA/SP-20260005258.

## SP-0059 · Puntuación VTE NASA ≥4

- **Dominio / fase:** Trombosis yugular / VTE / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `nasa_vte_score >= 4` puntos; **ventana:** ecografía protocolizada o score validado.
- **Acción propuesta:** Valoración inmediata por médico de vuelo (ALTA).
- **Confirmación:** Recalcular y confirmar ecografía.
- **Razonamiento:** Propuesta NASA julio 2026; puntos no equivalen a proporción de VTE.
- **Alcance y límites:** Requiere factores hematológicos opcionales y ecografía. NASA propone profilaxis para 4-6: software NO prescribe
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** SCORE_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N03 — [NASA OCHMO VTE Risk Score](https://www.nasa.gov/wp-content/uploads/2026/06/risk-venous-thromboembolism-assessment-sp20260005258.pdf); localizador: Figura/tabla VTE risk score p. 4; NASA/SP-20260005258.

## SP-0060 · Puntuación VTE NASA >6

- **Dominio / fase:** Trombosis yugular / VTE / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `nasa_vte_score > 6` puntos; **ventana:** ecografía protocolizada o score validado.
- **Acción propuesta:** Valoración clínica especializada VTE (URGENTE).
- **Confirmación:** Ecografía, equipo médico y riesgos hemorrágicos.
- **Razonamiento:** Propuesta NASA julio 2026; puntos no equivalen a proporción de VTE.
- **Alcance y límites:** Requiere factores hematológicos opcionales y ecografía. Evitar decisiones automáticas anticoagulantes
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** SCORE_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N03 — [NASA OCHMO VTE Risk Score](https://www.nasa.gov/wp-content/uploads/2026/06/risk-venous-thromboembolism-assessment-sp20260005258.pdf); localizador: Figura/tabla VTE risk score p. 4; NASA/SP-20260005258.

## SP-0061 · Trombo yugular demostrado por ecografía

- **Dominio / fase:** Trombosis yugular / VTE / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `ijv_thrombus_confirmed == 1` indicador; **ventana:** ecografía protocolizada o score validado.
- **Acción propuesta:** Aplicar protocolo VTE y protección operativo (URGENTE).
- **Confirmación:** Especialista/ultrasonido interpretado.
- **Razonamiento:** Propuesta NASA julio 2026; puntos no equivalen a proporción de VTE.
- **Alcance y límites:** Requiere factores hematológicos opcionales y ecografía. No inferir por frecuencia cardiaca o SpO2
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** SCORE_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N03 — [NASA OCHMO VTE Risk Score](https://www.nasa.gov/wp-content/uploads/2026/06/risk-venous-thromboembolism-assessment-sp20260005258.pdf); localizador: Figura/tabla VTE risk score p. 4; NASA/SP-20260005258.

## SP-0062 · Edema facial asimétrico nuevo

- **Dominio / fase:** Trombosis yugular / VTE / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `facial_swelling_new == 1` indicador; **ventana:** ecografía protocolizada o score validado.
- **Acción propuesta:** Priorizar evaluación vascular si síntomas (ALTA).
- **Confirmación:** Exploración y ultrasonido.
- **Razonamiento:** Propuesta NASA julio 2026; puntos no equivalen a proporción de VTE.
- **Alcance y límites:** Requiere factores hematológicos opcionales y ecografía. No discriminar edema fisiológico por microgravedad
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** SCORE_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N03 — [NASA OCHMO VTE Risk Score](https://www.nasa.gov/wp-content/uploads/2026/06/risk-venous-thromboembolism-assessment-sp20260005258.pdf); localizador: Figura/tabla VTE risk score p. 4; NASA/SP-20260005258.

## SP-0063 · OCT edema subclínico clase A

- **Dominio / fase:** Neuro-ocular SANS / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `oct_trt_change_um >= 20` µm; **ventana:** respecto basal pre-vuelo, mismo protocolo.
- **Acción propuesta:** Evaluación neuro-oftalmológica SANS (ALTA).
- **Confirmación:** OCT mismo instrumento y protocolo.
- **Razonamiento:** OCT complementario imprescindible; los marcadores vitales no identifican SANS.
- **Alcance y límites:** Criterios de tabla 2 para equipo OCT especificado. Consenso 2026 clase A; no detectar por FC/PA
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CAMBIO_ANATOMICO_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N04 — [SANS international expert consensus (Gew et al.)](https://www.nature.com/articles/s41433-026-04651-6); localizador: Tabla 2 y monitoring, DOI 10.1038/s41433-026-04651-6.

## SP-0064 · OCT edema clase B

- **Dominio / fase:** Neuro-ocular SANS / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `oct_trt_change_um >= 55` µm; **ventana:** respecto basal pre-vuelo, mismo protocolo.
- **Acción propuesta:** Evaluación oftalmológica reforzada (URGENTE).
- **Confirmación:** OCT y examen; considerar plan postvuelo.
- **Razonamiento:** OCT complementario imprescindible; los marcadores vitales no identifican SANS.
- **Alcance y límites:** Criterios de tabla 2 para equipo OCT especificado. Clase B; no hacer punción lumbar por software
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CAMBIO_ANATOMICO_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N04 — [SANS international expert consensus (Gew et al.)](https://www.nature.com/articles/s41433-026-04651-6); localizador: Tabla 2 y monitoring, DOI 10.1038/s41433-026-04651-6.

## SP-0065 · Frisén ≥1

- **Dominio / fase:** Neuro-ocular SANS / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `frisen_grade >= 1` grado; **ventana:** respecto basal pre-vuelo, mismo protocolo.
- **Acción propuesta:** Evaluación SANS y seguimiento (ALTA).
- **Confirmación:** Fondo ojo por especialista.
- **Razonamiento:** OCT complementario imprescindible; los marcadores vitales no identifican SANS.
- **Alcance y límites:** Criterios de tabla 2 para equipo OCT especificado. Tabla 2 2026 clase B
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CAMBIO_ANATOMICO_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N04 — [SANS international expert consensus (Gew et al.)](https://www.nature.com/articles/s41433-026-04651-6); localizador: Tabla 2 y monitoring, DOI 10.1038/s41433-026-04651-6.

## SP-0066 · Cambio hipermetrópico refractivo

- **Dominio / fase:** Neuro-ocular SANS / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `hyperopic_shift_diopter > 0.5` dioptrías; **ventana:** respecto basal pre-vuelo, mismo protocolo.
- **Acción propuesta:** Considerar revisión refractiva y OCT (CONSULTA).
- **Confirmación:** Refracción pre/post calibrada.
- **Razonamiento:** OCT complementario imprescindible; los marcadores vitales no identifican SANS.
- **Alcance y límites:** Criterios de tabla 2 para equipo OCT especificado. SANS clase A, si no usa lentes tipo compatible
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CAMBIO_ANATOMICO_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N04 — [SANS international expert consensus (Gew et al.)](https://www.nature.com/articles/s41433-026-04651-6); localizador: Tabla 2 y monitoring, DOI 10.1038/s41433-026-04651-6.

## SP-0067 · Pliegues coroideos

- **Dominio / fase:** Neuro-ocular SANS / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `choroidal_fold_flag == 1` indicador; **ventana:** respecto basal pre-vuelo, mismo protocolo.
- **Acción propuesta:** Evaluar deformación retiniana (ALTA).
- **Confirmación:** OCT/fundoscopia.
- **Razonamiento:** OCT complementario imprescindible; los marcadores vitales no identifican SANS.
- **Alcance y límites:** Criterios de tabla 2 para equipo OCT especificado. No detectables con sensor corporal
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CAMBIO_ANATOMICO_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N04 — [SANS international expert consensus (Gew et al.)](https://www.nature.com/articles/s41433-026-04651-6); localizador: Tabla 2 y monitoring, DOI 10.1038/s41433-026-04651-6.

## SP-0068 · Aplanamiento globo ocular

- **Dominio / fase:** Neuro-ocular SANS / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `globe_flattening_flag == 1` indicador; **ventana:** respecto basal pre-vuelo, mismo protocolo.
- **Acción propuesta:** Valoración SANS y MRI (ALTA).
- **Confirmación:** MRI u otra imagen validada.
- **Razonamiento:** OCT complementario imprescindible; los marcadores vitales no identifican SANS.
- **Alcance y límites:** Criterios de tabla 2 para equipo OCT especificado. Manifestación anatómica, no biometría común
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CAMBIO_ANATOMICO_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N04 — [SANS international expert consensus (Gew et al.)](https://www.nature.com/articles/s41433-026-04651-6); localizador: Tabla 2 y monitoring, DOI 10.1038/s41433-026-04651-6.

## SP-0069 · Campo visual alterado

- **Dominio / fase:** Neuro-ocular SANS / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `visual_field_loss_flag == 1` indicador; **ventana:** respecto basal pre-vuelo, mismo protocolo.
- **Acción propuesta:** Evaluación ocular urgente (URGENTE).
- **Confirmación:** Campimetría formal.
- **Razonamiento:** OCT complementario imprescindible; los marcadores vitales no identifican SANS.
- **Alcance y límites:** Criterios de tabla 2 para equipo OCT especificado. No suponer SANS único diferencial
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CAMBIO_ANATOMICO_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N04 — [SANS international expert consensus (Gew et al.)](https://www.nature.com/articles/s41433-026-04651-6); localizador: Tabla 2 y monitoring, DOI 10.1038/s41433-026-04651-6.

## SP-0070 · Antecedente SANS previo

- **Dominio / fase:** Neuro-ocular SANS / P. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `prior_sans_flag == 1` indicador; **ventana:** respecto basal pre-vuelo, mismo protocolo.
- **Acción propuesta:** Planificar vigilancia ocular individual (CONSULTA).
- **Confirmación:** Historia y examenes previos.
- **Razonamiento:** OCT complementario imprescindible; los marcadores vitales no identifican SANS.
- **Alcance y límites:** Criterios de tabla 2 para equipo OCT especificado. Consenso 2026 vigilancia de recurrencia
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CAMBIO_ANATOMICO_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N04 — [SANS international expert consensus (Gew et al.)](https://www.nature.com/articles/s41433-026-04651-6); localizador: Tabla 2 y monitoring, DOI 10.1038/s41433-026-04651-6.

## SP-0071 · OCT ausente en vuelo prolongado

- **Dominio / fase:** Neuro-ocular SANS / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `oct_unavailable_flag == 1` indicador; **ventana:** respecto basal pre-vuelo, mismo protocolo.
- **Acción propuesta:** Reportar imposibilidad monitorizar SANS (NO_CALCULABLE).
- **Confirmación:** Verificar equipamiento/agenda.
- **Razonamiento:** OCT complementario imprescindible; los marcadores vitales no identifican SANS.
- **Alcance y límites:** Criterios de tabla 2 para equipo OCT especificado. Datos obligatorios NO detectan SANS
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CAMBIO_ANATOMICO_NO_PROBABILIDAD. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N04 — [SANS international expert consensus (Gew et al.)](https://www.nature.com/articles/s41433-026-04651-6); localizador: Tabla 2 y monitoring, DOI 10.1038/s41433-026-04651-6.

## SP-0072 · BMD cadera bajo 95% basal

- **Dominio / fase:** Hueso / densitometría / A. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `hip_bmd_ratio < 0.95` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar contramedidas óseas (CONSULTA).
- **Confirmación:** DXA comparable en dos momentos.
- **Razonamiento:** BMD no inferible desde peso ni cintura; % cambio exige DXA pre/post.
- **Alcance y límites:** 95% /90% son parámetros desempeño NASA, no diagnósticos osteopenia. V1 4027 cadera
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0073 · BMD columna bajo 95% basal

- **Dominio / fase:** Hueso / densitometría / A. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `spine_bmd_ratio < 0.95` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar contramedidas óseas (CONSULTA).
- **Confirmación:** DXA mismo protocolo.
- **Razonamiento:** BMD no inferible desde peso ni cintura; % cambio exige DXA pre/post.
- **Alcance y límites:** 95% /90% son parámetros desempeño NASA, no diagnósticos osteopenia. V1 4027 columna
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0074 · BMD cuello femoral bajo 90% basal

- **Dominio / fase:** Hueso / densitometría / A. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `femneck_bmd_ratio < 0.9` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar pérdida ósea relevante (ALTA).
- **Confirmación:** DXA.
- **Razonamiento:** BMD no inferible desde peso ni cintura; % cambio exige DXA pre/post.
- **Alcance y límites:** 95% /90% son parámetros desempeño NASA, no diagnósticos osteopenia. V1 4027 cuello femoral
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0075 · T-score DXA osteoporosis

- **Dominio / fase:** Hueso / densitometría / P. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `dxa_t_score <= -2.5` DE; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar metabolismo óseo (CONSULTA).
- **Confirmación:** DXA e interpretación por edad/sexo.
- **Razonamiento:** BMD no inferible desde peso ni cintura; % cambio exige DXA pre/post.
- **Alcance y límites:** 95% /90% son parámetros desempeño NASA, no diagnósticos osteopenia. Corte terrestre solo poblaciones apropiadas ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0076 · T-score DXA osteopenia

- **Dominio / fase:** Hueso / densitometría / P. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `dxa_t_score < -1` DE; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación de salud ósea (SEGUIMIENTO).
- **Confirmación:** DXA y edad aplicable.
- **Razonamiento:** BMD no inferible desde peso ni cintura; % cambio exige DXA pre/post.
- **Alcance y límites:** 95% /90% son parámetros desempeño NASA, no diagnósticos osteopenia. Evitar T-score osteoporosis en premenopáusicas sin contexto ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0077 · Marca hipercalciuria por laboratorio

- **Dominio / fase:** Hueso / densitometría / F. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `urine_hypercalciuria_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar pérdida ósea y riesgo litiasis (CONSULTA).
- **Confirmación:** Calcio urinario 24 h.
- **Razonamiento:** BMD no inferible desde peso ni cintura; % cambio exige DXA pre/post.
- **Alcance y límites:** 95% /90% son parámetros desempeño NASA, no diagnósticos osteopenia. Corte depende de referencia de laboratorio ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0078 · Interrupción prolongada programa resistencia

- **Dominio / fase:** Hueso / densitometría / F. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `resistance_exercise_nonadherence == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisión contramedidas físicas (SEGUIMIENTO).
- **Confirmación:** Registro ejercicio.
- **Razonamiento:** BMD no inferible desde peso ni cintura; % cambio exige DXA pre/post.
- **Alcance y límites:** 95% /90% son parámetros desempeño NASA, no diagnósticos osteopenia. Riesgo no cuantificado sin DXA ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0079 · Fuerza global bajo 80% basal

- **Dominio / fase:** Músculo / fuerza / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `strength_ratio < 0.8` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar entrenamiento fuerza (CONSULTA).
- **Confirmación:** Dinamometría protocolizada.
- **Razonamiento:** Las fuerzas requieren pruebas específicas; datos antropométricos no miden fuerza.
- **Alcance y límites:** Ratios de masa no son % riesgo fractura. V1 4024
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0080 · Fuerza tren inferior bajo 80% basal

- **Dominio / fase:** Músculo / fuerza / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `lower_body_strength_ratio < 0.8` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar contramedidas piernas (CONSULTA).
- **Confirmación:** Prueba funcional validada.
- **Razonamiento:** Las fuerzas requieren pruebas específicas; datos antropométricos no miden fuerza.
- **Alcance y límites:** Ratios de masa no son % riesgo fractura. V1 4024 aplicado a región (derivación)
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0081 · Fuerza tren superior bajo 80% basal

- **Dominio / fase:** Músculo / fuerza / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `upper_body_strength_ratio < 0.8` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Ajustar resistencia (CONSULTA).
- **Confirmación:** Prueba estandarizada.
- **Razonamiento:** Las fuerzas requieren pruebas específicas; datos antropométricos no miden fuerza.
- **Alcance y límites:** Ratios de masa no son % riesgo fractura. V1 4024 derivación regional
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0082 · Prevuelo deadlift bajo mínimo 1.0 masa

- **Dominio / fase:** Músculo / fuerza / P. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `deadlift_bodymass_ratio < 1` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar preparación funcional (CONSULTA).
- **Confirmación:** 1RM estimado/medido aprobado.
- **Razonamiento:** Las fuerzas requieren pruebas específicas; datos antropométricos no miden fuerza.
- **Alcance y límites:** Ratios de masa no son % riesgo fractura. V1 4023 mínimo dependiendo operación
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0083 · EVA microgravedad deadlift bajo 1.3 masa

- **Dominio / fase:** Músculo / fuerza / P. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `deadlift_bodymass_ratio < 1.3` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar entrenamiento EVA (CONSULTA).
- **Confirmación:** Técnica certificada.
- **Razonamiento:** Las fuerzas requieren pruebas específicas; datos antropométricos no miden fuerza.
- **Alcance y límites:** Ratios de masa no son % riesgo fractura. Tabla 4.6-1; no decisión aptitud automática
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0084 · EVA superficie deadlift bajo 1.6 masa

- **Dominio / fase:** Músculo / fuerza / P. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `deadlift_bodymass_ratio < 1.6` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar capacidad EVA superficial (CONSULTA).
- **Confirmación:** Prueba protocolizada.
- **Razonamiento:** Las fuerzas requieren pruebas específicas; datos antropométricos no miden fuerza.
- **Alcance y límites:** Ratios de masa no son % riesgo fractura. Tabla 4.6-1
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0085 · Prevuelo bench press bajo 0.7 masa

- **Dominio / fase:** Músculo / fuerza / P. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `bench_bodymass_ratio < 0.7` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar fuerza tren superior (CONSULTA).
- **Confirmación:** Medición estandarizada.
- **Razonamiento:** Las fuerzas requieren pruebas específicas; datos antropométricos no miden fuerza.
- **Alcance y límites:** Ratios de masa no son % riesgo fractura. Tabla 4.6-1 mínimo
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0086 · EVA superficie bench press bajo 1.0 masa

- **Dominio / fase:** Músculo / fuerza / P. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `bench_bodymass_ratio < 1` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar función EVA (CONSULTA).
- **Confirmación:** Prueba protocolizada.
- **Razonamiento:** Las fuerzas requieren pruebas específicas; datos antropométricos no miden fuerza.
- **Alcance y límites:** Ratios de masa no son % riesgo fractura. Tabla 4.6-1 EVA superficial
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0087 · VO2max por debajo estándar EVA microgravedad

- **Dominio / fase:** Capacidad aeróbica / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `vo2max_ml_kg_min < 32.9` mL/kg/min; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar capacidad física para EVA (ALTA).
- **Confirmación:** Ergoespirometría o modelo autorizado.
- **Razonamiento:** Estas reglas monitorizan desempeño, no pronostican enfermedad cardiovascular.
- **Alcance y límites:** VO2max derivado de wearable no equivale sin validación. V1 4001
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0088 · VO2max por debajo estándar EVA superficial

- **Dominio / fase:** Capacidad aeróbica / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `vo2max_ml_kg_min < 36.5` mL/kg/min; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar demanda operativa EVA superficial (ALTA).
- **Confirmación:** Prueba adecuada al tipo de EVA.
- **Razonamiento:** Estas reglas monitorizan desempeño, no pronostican enfermedad cardiovascular.
- **Alcance y límites:** VO2max derivado de wearable no equivale sin validación. V1 4002
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0089 · VO2max menor 80% basal

- **Dominio / fase:** Capacidad aeróbica / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `vo2max_ratio < 0.8` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar entrenamiento aeróbico (CONSULTA).
- **Confirmación:** Medidas comparables.
- **Razonamiento:** Estas reglas monitorizan desempeño, no pronostican enfermedad cardiovascular.
- **Alcance y límites:** VO2max derivado de wearable no equivale sin validación. V1 4003
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0090 · VO2max no recuperado postvuelo

- **Dominio / fase:** Capacidad aeróbica / R. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `vo2max_ratio < 1` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Plan reacondicionamiento aeróbico (SEGUIMIENTO).
- **Confirmación:** Prueba longitudinal.
- **Razonamiento:** Estas reglas monitorizan desempeño, no pronostican enfermedad cardiovascular.
- **Alcance y límites:** VO2max derivado de wearable no equivale sin validación. V1 4004 objetivo basal, no incapacidad individual
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0091 · Omisión de evaluación aeróbica

- **Dominio / fase:** Capacidad aeróbica / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `vo2max_missing == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Informar falta métrica crítica EVA (NO_CALCULABLE).
- **Confirmación:** Calendario examen.
- **Razonamiento:** Estas reglas monitorizan desempeño, no pronostican enfermedad cardiovascular.
- **Alcance y límites:** VO2max derivado de wearable no equivale sin validación. VO2 no inferible fiablemente a partir de HR aislada
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0092 · Diuresis 24h muy baja

- **Dominio / fase:** Riñón / litiasis / hidratación / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `urine_ml_day < 500` mL/día; **ventana:** rango indicado en nombre / confirmación temporal.
- **Acción propuesta:** Evaluar oliguria y función renal (URGENTE).
- **Confirmación:** Medición orina y consulta clínica.
- **Razonamiento:** No confundir ingesta disponible con balance hídrico ni diuresis, riesgo calculi no derivable de peso.
- **Alcance y límites:** En microgravedad cambian compartimentos de líquidos. Corte orientativo extremo; no personalización automática
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N08 — [NASA Urinary Health Technical Brief](https://www.nasa.gov/ochmo-mtb-003-urinary-health-2/); localizador: Sección cálculos renales, líquidos, orina y ecografía.

## SP-0093 · Diuresis baja peso ajustado

- **Dominio / fase:** Riñón / litiasis / hidratación / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `urine_ml_kg_h_6h < 0.5` mL/kg/h; **ventana:** rango indicado en nombre / confirmación temporal.
- **Acción propuesta:** Revisar hidratación y lesión renal aguda (ALTA).
- **Confirmación:** Balance y creatinina seriada.
- **Razonamiento:** No confundir ingesta disponible con balance hídrico ni diuresis, riesgo calculi no derivable de peso.
- **Alcance y límites:** En microgravedad cambian compartimentos de líquidos. KDIGO AKI criterio duración 6h, regla derivada
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N08 — [NASA Urinary Health Technical Brief](https://www.nasa.gov/ochmo-mtb-003-urinary-health-2/); localizador: Sección cálculos renales, líquidos, orina y ecografía.

## SP-0094 · Volumen orina insuficiente prevención litiasis

- **Dominio / fase:** Riñón / litiasis / hidratación / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `urine_l_24h < 2` L/día; **ventana:** rango indicado en nombre / confirmación temporal.
- **Acción propuesta:** Evaluar hidratación y química urinaria (SEGUIMIENTO).
- **Confirmación:** Balance 24 h.
- **Razonamiento:** No confundir ingesta disponible con balance hídrico ni diuresis, riesgo calculi no derivable de peso.
- **Alcance y límites:** En microgravedad cambian compartimentos de líquidos. Objetivo terrestre orientativo; no NASA universal Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N08 — [NASA Urinary Health Technical Brief](https://www.nasa.gov/ochmo-mtb-003-urinary-health-2/); localizador: Sección cálculos renales, líquidos, orina y ecografía.

## SP-0095 · Hipercalciuria laboratorio

- **Dominio / fase:** Riñón / litiasis / hidratación / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `urine_calcium_flag == 1` indicador; **ventana:** rango indicado en nombre / confirmación temporal.
- **Acción propuesta:** Valoración química orina y pérdida ósea (CONSULTA).
- **Confirmación:** Química orina 24h.
- **Razonamiento:** No confundir ingesta disponible con balance hídrico ni diuresis, riesgo calculi no derivable de peso.
- **Alcance y límites:** En microgravedad cambian compartimentos de líquidos. Interpretación laboratorio; No traducir a probabilidad directa
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N08 — [NASA Urinary Health Technical Brief](https://www.nasa.gov/ochmo-mtb-003-urinary-health-2/); localizador: Sección cálculos renales, líquidos, orina y ecografía.

## SP-0096 · Sobresaturación oxalato cálcico alta

- **Dominio / fase:** Riñón / litiasis / hidratación / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `urine_caox_risk_flag == 1` indicador; **ventana:** rango indicado en nombre / confirmación temporal.
- **Acción propuesta:** Revisar riesgo formación litiasis (CONSULTA).
- **Confirmación:** Química urinaria certificada.
- **Razonamiento:** No confundir ingesta disponible con balance hídrico ni diuresis, riesgo calculi no derivable de peso.
- **Alcance y límites:** En microgravedad cambian compartimentos de líquidos. No asignar incidencia personalizada
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N08 — [NASA Urinary Health Technical Brief](https://www.nasa.gov/ochmo-mtb-003-urinary-health-2/); localizador: Sección cálculos renales, líquidos, orina y ecografía.

## SP-0097 · Piedra detectada ecografía

- **Dominio / fase:** Riñón / litiasis / hidratación / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `kidney_stone_ultrasound == 1` indicador; **ventana:** rango indicado en nombre / confirmación temporal.
- **Acción propuesta:** Evaluación de litiasis espacial (ALTA).
- **Confirmación:** Ecografía o imagen.
- **Razonamiento:** No confundir ingesta disponible con balance hídrico ni diuresis, riesgo calculi no derivable de peso.
- **Alcance y límites:** En microgravedad cambian compartimentos de líquidos. Si obstrucción/infección elevar emergencia
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N08 — [NASA Urinary Health Technical Brief](https://www.nasa.gov/ochmo-mtb-003-urinary-health-2/); localizador: Sección cálculos renales, líquidos, orina y ecografía.

## SP-0098 · Creatinina ascenso agudo significativo

- **Dominio / fase:** Riñón / litiasis / hidratación / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `creatinine_48h_delta >= 0.3` mg/dL; **ventana:** rango indicado en nombre / confirmación temporal.
- **Acción propuesta:** Evaluar lesión renal aguda (ALTA).
- **Confirmación:** Analítica repetida, balance.
- **Razonamiento:** No confundir ingesta disponible con balance hídrico ni diuresis, riesgo calculi no derivable de peso.
- **Alcance y límites:** En microgravedad cambian compartimentos de líquidos. Criterio KDIGO AKI temporal
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N08 — [NASA Urinary Health Technical Brief](https://www.nasa.gov/ochmo-mtb-003-urinary-health-2/); localizador: Sección cálculos renales, líquidos, orina y ecografía.

## SP-0099 · Creatinina ≥1.5 basal 7d

- **Dominio / fase:** Riñón / litiasis / hidratación / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `creatinine_7d_ratio >= 1.5` ratio; **ventana:** rango indicado en nombre / confirmación temporal.
- **Acción propuesta:** Evaluar lesión renal aguda (ALTA).
- **Confirmación:** Creatinina basal verificable.
- **Razonamiento:** No confundir ingesta disponible con balance hídrico ni diuresis, riesgo calculi no derivable de peso.
- **Alcance y límites:** En microgravedad cambian compartimentos de líquidos. Criterio AKI y duración
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N08 — [NASA Urinary Health Technical Brief](https://www.nasa.gov/ochmo-mtb-003-urinary-health-2/); localizador: Sección cálculos renales, líquidos, orina y ecografía.

## SP-0100 · ERC eGFR bajo

- **Dominio / fase:** Riñón / litiasis / hidratación / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `egfr < 60` mL/min/1.73 m2; **ventana:** rango indicado en nombre / confirmación temporal.
- **Acción propuesta:** Verificar persistencia y albuminuria (CONSULTA).
- **Confirmación:** Analítica >3 meses para ERC.
- **Razonamiento:** No confundir ingesta disponible con balance hídrico ni diuresis, riesgo calculi no derivable de peso.
- **Alcance y límites:** En microgravedad cambian compartimentos de líquidos. No diagnosticar ERC con medida única
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N08 — [NASA Urinary Health Technical Brief](https://www.nasa.gov/ochmo-mtb-003-urinary-health-2/); localizador: Sección cálculos renales, líquidos, orina y ecografía.

## SP-0101 · Albuminuria ACR A2

- **Dominio / fase:** Riñón / litiasis / hidratación / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `urine_acr_mg_g >= 30` mg/g; **ventana:** rango indicado en nombre / confirmación temporal.
- **Acción propuesta:** Seguimiento renal (CONSULTA).
- **Confirmación:** ACR repetido.
- **Razonamiento:** No confundir ingesta disponible con balance hídrico ni diuresis, riesgo calculi no derivable de peso.
- **Alcance y límites:** En microgravedad cambian compartimentos de líquidos. No interpretar sin persistencia
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N08 — [NASA Urinary Health Technical Brief](https://www.nasa.gov/ochmo-mtb-003-urinary-health-2/); localizador: Sección cálculos renales, líquidos, orina y ecografía.

## SP-0102 · Albuminuria ACR A3

- **Dominio / fase:** Riñón / litiasis / hidratación / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `urine_acr_mg_g >= 300` mg/g; **ventana:** rango indicado en nombre / confirmación temporal.
- **Acción propuesta:** Evaluación renal prioritaria (ALTA).
- **Confirmación:** ACR validado.
- **Razonamiento:** No confundir ingesta disponible con balance hídrico ni diuresis, riesgo calculi no derivable de peso.
- **Alcance y límites:** En microgravedad cambian compartimentos de líquidos. Control de causa y riesgo
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N08 — [NASA Urinary Health Technical Brief](https://www.nasa.gov/ochmo-mtb-003-urinary-health-2/); localizador: Sección cálculos renales, líquidos, orina y ecografía.

## SP-0103 · Ingesta energética por debajo requerimiento individual

- **Dominio / fase:** Nutrición / metabolismo / F. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `energy_intake_ratio < 1` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar ración, balance y carga de trabajo (SEGUIMIENTO).
- **Confirmación:** Diario alimentario + necesidad individual.
- **Razonamiento:** Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.
- **Alcance y límites:** Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos. V1 4020 debe proveer 100% requerimiento ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0104 · Ingesta proteína por debajo requerimiento

- **Dominio / fase:** Nutrición / metabolismo / F. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `protein_intake_ratio < 1` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisión nutricionista (SEGUIMIENTO).
- **Confirmación:** Necesidad individual y registro.
- **Razonamiento:** Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.
- **Alcance y límites:** Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos. No usar 0.8g/kg universal como objetivo astronauta ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0105 · Masa corporal reducción 5% basal

- **Dominio / fase:** Nutrición / metabolismo / F. **Evidencia:** D. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `mass_ratio_preflight < 0.95` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar balance energético y líquidos (CONSULTA).
- **Confirmación:** Medición de masa calibrada; revisar agua.
- **Razonamiento:** Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.
- **Alcance y límites:** Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos. Heurística umbral derivado, NO fuente V1 literal ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0106 · Masa corporal reducción 10% basal

- **Dominio / fase:** Nutrición / metabolismo / F. **Evidencia:** D. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `mass_ratio_preflight < 0.9` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación de pérdida de masa (ALTA).
- **Confirmación:** Balance y composición corporal.
- **Razonamiento:** Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.
- **Alcance y límites:** Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos. Umbral exploratorio; condicionada a fluidos ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0107 · Vitamina D 25OH baja laboratorio

- **Dominio / fase:** Nutrición / metabolismo / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `vitd_25oh_ng_ml < 20` ng/mL; **ventana:** confirmar la medida.
- **Acción propuesta:** Interpretar metabolismo óseo y nutrición (CONSULTA).
- **Confirmación:** Laboratorio y guía especialista.
- **Razonamiento:** Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.
- **Alcance y límites:** Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos. Umbral terrestre frecuente, variaciones guías ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0108 · Calcio sérico alto

- **Dominio / fase:** Nutrición / metabolismo / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `serum_calcium_corrected > 10.5` mg/dL; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar hipercalcemia/riñón (CONSULTA).
- **Confirmación:** Calcio corregido albúmina o ionizado.
- **Razonamiento:** Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.
- **Alcance y límites:** Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos. Referencias locales distintas ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa. Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0109 · Calcio sérico bajo

- **Dominio / fase:** Nutrición / metabolismo / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `serum_calcium_corrected < 8.5` mg/dL; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar calcio/PTH/vit D (CONSULTA).
- **Confirmación:** Albúmina y calcio iónico.
- **Razonamiento:** Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.
- **Alcance y límites:** Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos. Valores laboratorio dependientes ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa. Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0110 · Sodio sérico bajo

- **Dominio / fase:** Nutrición / metabolismo / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `sodium_mmol_l < 135` mmol/L; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar disnatremia y balance hídrico (ALTA).
- **Confirmación:** Analítica confirmada.
- **Razonamiento:** Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.
- **Alcance y límites:** Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos. Contexto síntomas/velocidad cambio ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa. Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0111 · Sodio sérico críticamente bajo

- **Dominio / fase:** Nutrición / metabolismo / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `sodium_mmol_l < 120` mmol/L; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación clínica urgente (URGENTE).
- **Confirmación:** Repetir y valoración sintomática.
- **Razonamiento:** Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.
- **Alcance y límites:** Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos. Corte general, no corrección automática ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa. Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0112 · Sodio sérico alto

- **Dominio / fase:** Nutrición / metabolismo / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `sodium_mmol_l > 145` mmol/L; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación de agua libre y pérdidas (ALTA).
- **Confirmación:** Analítica válida.
- **Razonamiento:** Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.
- **Alcance y límites:** Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos. No atribuir automáticamente a deshidratación ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa. Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0113 · Potasio alto

- **Dominio / fase:** Nutrición / metabolismo / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `potassium_mmol_l >= 6` mmol/L; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar ECG y causas (URGENTE).
- **Confirmación:** Descartar hemólisis muestra.
- **Razonamiento:** Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.
- **Alcance y límites:** Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos. Arritmia potencialmente grave ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa. Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0114 · Potasio bajo

- **Dominio / fase:** Nutrición / metabolismo / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `potassium_mmol_l < 3` mmol/L; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar electrolitos y ECG (ALTA).
- **Confirmación:** Repetir laboratorio.
- **Razonamiento:** Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.
- **Alcance y límites:** Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos. Riesgo neuromuscular/cardiaco ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa. Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0115 · Hb disminución >10% basal

- **Dominio / fase:** Hematología / hemólisis / A. **Evidencia:** O. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `hemoglobin_ratio_baseline < 0.9` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Estudiar anemia y efecto fluidos (CONSULTA).
- **Confirmación:** Hemograma seriado y reticulocitos.
- **Razonamiento:** Hemólisis 54% es promedio CO endógeno en 14 astronautas no factor individual constante.
- **Alcance y límites:** Riesgo basal y el cambio dependen adaptación y tratamientos. Heurística, 54% hemólisis NASA NO 54% Hb
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N14 — [Spaceflight anemia: hemolysis Nat Med](https://www.nature.com/articles/s41591-021-01637-7); localizador: 14 astronautas hemólisis.

## SP-0116 · Hematocrito reducción >10% basal

- **Dominio / fase:** Hematología / hemólisis / A. **Evidencia:** O. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `hematocrit_ratio_baseline < 0.9` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar anemia vs hemodilución (SEGUIMIENTO).
- **Confirmación:** Hemograma y líquidos.
- **Razonamiento:** Hemólisis 54% es promedio CO endógeno en 14 astronautas no factor individual constante.
- **Alcance y límites:** Riesgo basal y el cambio dependen adaptación y tratamientos. Heurística analítica no diagnóstica
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N14 — [Spaceflight anemia: hemolysis Nat Med](https://www.nature.com/articles/s41591-021-01637-7); localizador: 14 astronautas hemólisis.

## SP-0117 · Reticulocitos elevados laboratorio

- **Dominio / fase:** Hematología / hemólisis / A. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `reticulocyte_high_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Explorar hemólisis/recuperación hematopoyética (CONSULTA).
- **Confirmación:** Reticulocitos, LDH, bilirrubina, haptoglobina.
- **Razonamiento:** Hemólisis 54% es promedio CO endógeno en 14 astronautas no factor individual constante.
- **Alcance y límites:** Riesgo basal y el cambio dependen adaptación y tratamientos. No cuantifica hemólisis espacial
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N14 — [Spaceflight anemia: hemolysis Nat Med](https://www.nature.com/articles/s41591-021-01637-7); localizador: 14 astronautas hemólisis.

## SP-0118 · LDH elevada laboratorio

- **Dominio / fase:** Hematología / hemólisis / A. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `ldh_high_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Complementar estudio de hemólisis (CONSULTA).
- **Confirmación:** Hemograma y frotis.
- **Razonamiento:** Hemólisis 54% es promedio CO endógeno en 14 astronautas no factor individual constante.
- **Alcance y límites:** Riesgo basal y el cambio dependen adaptación y tratamientos. Inespecífico (ejercicio/tejido)
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N14 — [Spaceflight anemia: hemolysis Nat Med](https://www.nature.com/articles/s41591-021-01637-7); localizador: 14 astronautas hemólisis.

## SP-0119 · Bilirrubina indirecta elevada

- **Dominio / fase:** Hematología / hemólisis / A. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `indirect_bili_high_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar hemólisis/hígado (CONSULTA).
- **Confirmación:** Panel hepático, haptoglobina.
- **Razonamiento:** Hemólisis 54% es promedio CO endógeno en 14 astronautas no factor individual constante.
- **Alcance y límites:** Riesgo basal y el cambio dependen adaptación y tratamientos. No concluyente sin más pruebas
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N14 — [Spaceflight anemia: hemolysis Nat Med](https://www.nature.com/articles/s41591-021-01637-7); localizador: 14 astronautas hemólisis.

## SP-0120 · Plaquetas muy bajas

- **Dominio / fase:** Hematología / hemólisis / A. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `platelets_10e9_l < 50` 10^9/L; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar sangrado/citopenia (URGENTE).
- **Confirmación:** Hemograma confirmatorio.
- **Razonamiento:** Hemólisis 54% es promedio CO endógeno en 14 astronautas no factor individual constante.
- **Alcance y límites:** Riesgo basal y el cambio dependen adaptación y tratamientos. Corte clínico general
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N14 — [Spaceflight anemia: hemolysis Nat Med](https://www.nature.com/articles/s41591-021-01637-7); localizador: 14 astronautas hemólisis.

## SP-0121 · Neutropenia grave

- **Dominio / fase:** Hematología / hemólisis / A. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `anc_10e9_l < 0.5` 10^9/L; **ventana:** confirmar la medida.
- **Acción propuesta:** Protección frente a infección y evaluación (URGENTE).
- **Confirmación:** Hemograma diferencial.
- **Razonamiento:** Hemólisis 54% es promedio CO endógeno en 14 astronautas no factor individual constante.
- **Alcance y límites:** Riesgo basal y el cambio dependen adaptación y tratamientos. Específico si medición hematológica disponible
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N14 — [Spaceflight anemia: hemolysis Nat Med](https://www.nature.com/articles/s41591-021-01637-7); localizador: 14 astronautas hemólisis.

## SP-0122 · Fiebre con neutropenia grave

- **Dominio / fase:** Hematología / hemólisis / A. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `febrile_neutropenia_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Emergencia infecciosa y protocolo clínico (URGENTE).
- **Confirmación:** Temperatura y ANC.
- **Razonamiento:** Hemólisis 54% es promedio CO endógeno en 14 astronautas no factor individual constante.
- **Alcance y límites:** Riesgo basal y el cambio dependen adaptación y tratamientos. Requiere variables múltiples verificadas
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N14 — [Spaceflight anemia: hemolysis Nat Med](https://www.nature.com/articles/s41591-021-01637-7); localizador: 14 astronautas hemólisis.

## SP-0123 · Fiebre corporal confirmada

- **Dominio / fase:** Inmunidad / infección / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `core_temp_c >= 38` °C; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar infección/exposición térmica (CONSULTA).
- **Confirmación:** Termómetro clínico y contexto.
- **Razonamiento:** Los indicadores vitales no revelan agentes infecciosos ni disfunción inmune completa.
- **Alcance y límites:** Sepsis requiere evaluación clínica; no use qSOFA de sustituto validado. No sepsis sin signos clínicos
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0124 · Hipotermia corporal

- **Dominio / fase:** Inmunidad / infección / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `core_temp_c < 35` °C; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación de hipotermia (URGENTE).
- **Confirmación:** Termómetro fiable core.
- **Razonamiento:** Los indicadores vitales no revelan agentes infecciosos ni disfunción inmune completa.
- **Alcance y límites:** Sepsis requiere evaluación clínica; no use qSOFA de sustituto validado. Puede ser fallo sensor
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0125 · Fiebre alta

- **Dominio / fase:** Inmunidad / infección / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `core_temp_c >= 39` °C; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación médica prioritaria (ALTA).
- **Confirmación:** Confirmar temperatura y otros signos.
- **Razonamiento:** Los indicadores vitales no revelan agentes infecciosos ni disfunción inmune completa.
- **Alcance y límites:** Sepsis requiere evaluación clínica; no use qSOFA de sustituto validado. No hay pathogen identification
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0126 · Patógeno PCR positivo

- **Dominio / fase:** Inmunidad / infección / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `pcr_pathogen_positive == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Distinguir excreción asintomática de enfermedad (CONSULTA).
- **Confirmación:** PCR y clínica.
- **Razonamiento:** Los indicadores vitales no revelan agentes infecciosos ni disfunción inmune completa.
- **Alcance y límites:** Sepsis requiere evaluación clínica; no use qSOFA de sustituto validado. Reactivación EBV/VZV no implica enfermedad
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0127 · CRP notablemente elevada

- **Dominio / fase:** Inmunidad / infección / A. **Evidencia:** D. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `crp_mg_l >= 100` mg/L; **ventana:** confirmar la medida.
- **Acción propuesta:** Valoración de inflamación/infección (ALTA).
- **Confirmación:** Analítica, clínica y otros biomarcadores.
- **Razonamiento:** Los indicadores vitales no revelan agentes infecciosos ni disfunción inmune completa.
- **Alcance y límites:** Sepsis requiere evaluación clínica; no use qSOFA de sustituto validado. Umbral orientativo, no identifica agente Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0128 · Leucocitosis

- **Dominio / fase:** Inmunidad / infección / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `wbc_10e9_l > 11` 10^9/L; **ventana:** confirmar la medida.
- **Acción propuesta:** Correlación clínico-laboratorial (CONSULTA).
- **Confirmación:** Hemograma.
- **Razonamiento:** Los indicadores vitales no revelan agentes infecciosos ni disfunción inmune completa.
- **Alcance y límites:** Sepsis requiere evaluación clínica; no use qSOFA de sustituto validado. Puede elevar por estrés ejercicio
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0129 · Leucopenia

- **Dominio / fase:** Inmunidad / infección / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `wbc_10e9_l < 4` 10^9/L; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar médula/infección (CONSULTA).
- **Confirmación:** Hemograma diferencial.
- **Razonamiento:** Los indicadores vitales no revelan agentes infecciosos ni disfunción inmune completa.
- **Alcance y límites:** Sepsis requiere evaluación clínica; no use qSOFA de sustituto validado. No inferir inmunodeficiencia
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0130 · Neutropenia moderada

- **Dominio / fase:** Inmunidad / infección / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `anc_10e9_l < 1` 10^9/L; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar riesgo infeccioso (ALTA).
- **Confirmación:** Repetir hemograma.
- **Razonamiento:** Los indicadores vitales no revelan agentes infecciosos ni disfunción inmune completa.
- **Alcance y límites:** Sepsis requiere evaluación clínica; no use qSOFA de sustituto validado. Contexto del individuo
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0131 · Hipoglucemia intersticial leve

- **Dominio / fase:** Glucosa / CGM / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cgm_mg_dl < 70` mg/dL; **ventana:** CGM ≥14 días y ≥70% datos para métricas agregadas.
- **Acción propuesta:** Confirmar y seguir protocolo de glucosa baja (ALTA).
- **Confirmación:** Sensor CGM más glucosa capilar si discordancia.
- **Razonamiento:** ADA 2026 CGM métricas aplican a personas con diabetes; clasificación para astronautas sin diabetes es investigación.
- **Alcance y límites:** Separar sensores intersticial y plasma. No diagnosticar hipoglucemia con sensor defectuoso
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N17 — [ADA Standards 2026 glycemic goals](https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic); localizador: Tabla 6.2 CGM, TIR/TBR/TAR.

## SP-0132 · Hipoglucemia intersticial profunda

- **Dominio / fase:** Glucosa / CGM / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cgm_mg_dl < 54` mg/dL; **ventana:** CGM ≥14 días y ≥70% datos para métricas agregadas.
- **Acción propuesta:** Revisión inmediata de glucosa y asistencia (URGENTE).
- **Confirmación:** Confirmar si es posible sin retrasar atención.
- **Razonamiento:** ADA 2026 CGM métricas aplican a personas con diabetes; clasificación para astronautas sin diabetes es investigación.
- **Alcance y límites:** Separar sensores intersticial y plasma. ADA nivel 2
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N17 — [ADA Standards 2026 glycemic goals](https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic); localizador: Tabla 6.2 CGM, TIR/TBR/TAR.

## SP-0133 · Hiperglucemia intersticial

- **Dominio / fase:** Glucosa / CGM / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cgm_mg_dl > 180` mg/dL; **ventana:** CGM ≥14 días y ≥70% datos para métricas agregadas.
- **Acción propuesta:** Revisar exposición glucémica y comida/estrés (SEGUIMIENTO).
- **Confirmación:** CGM calidad, contexto.
- **Razonamiento:** ADA 2026 CGM métricas aplican a personas con diabetes; clasificación para astronautas sin diabetes es investigación.
- **Alcance y límites:** Separar sensores intersticial y plasma. CGM aislado NO diagnostica diabetes
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N17 — [ADA Standards 2026 glycemic goals](https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic); localizador: Tabla 6.2 CGM, TIR/TBR/TAR.

## SP-0134 · Hiperglucemia intersticial notable

- **Dominio / fase:** Glucosa / CGM / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cgm_mg_dl > 250` mg/dL; **ventana:** CGM ≥14 días y ≥70% datos para métricas agregadas.
- **Acción propuesta:** Evaluar estado metabólico y causas (ALTA).
- **Confirmación:** Glucosa clínica, cetonas cuando indicada.
- **Razonamiento:** ADA 2026 CGM métricas aplican a personas con diabetes; clasificación para astronautas sin diabetes es investigación.
- **Alcance y límites:** Separar sensores intersticial y plasma. Corte TAR2, no diagnostica DKA
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N17 — [ADA Standards 2026 glycemic goals](https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic); localizador: Tabla 6.2 CGM, TIR/TBR/TAR.

## SP-0135 · Tiempo bajo 70 sobre meta

- **Dominio / fase:** Glucosa / CGM / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cgm_tbr70_pct >= 4` %; **ventana:** CGM ≥14 días y ≥70% datos para métricas agregadas.
- **Acción propuesta:** Revisar manejo glucémico en persona con diabetes (CONSULTA).
- **Confirmación:** CGM ≥14 días y 70% activo.
- **Razonamiento:** ADA 2026 CGM métricas aplican a personas con diabetes; clasificación para astronautas sin diabetes es investigación.
- **Alcance y límites:** Separar sensores intersticial y plasma. Meta en diabetes, NO general para población sana
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N17 — [ADA Standards 2026 glycemic goals](https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic); localizador: Tabla 6.2 CGM, TIR/TBR/TAR.

## SP-0136 · Tiempo bajo 54 sobre meta

- **Dominio / fase:** Glucosa / CGM / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cgm_tbr54_pct >= 1` %; **ventana:** CGM ≥14 días y ≥70% datos para métricas agregadas.
- **Acción propuesta:** Revisar hipoglucemia grave repetida (CONSULTA).
- **Confirmación:** CGM con duración válida.
- **Razonamiento:** ADA 2026 CGM métricas aplican a personas con diabetes; clasificación para astronautas sin diabetes es investigación.
- **Alcance y límites:** Separar sensores intersticial y plasma. No predice probabilidad de evento
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N17 — [ADA Standards 2026 glycemic goals](https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic); localizador: Tabla 6.2 CGM, TIR/TBR/TAR.

## SP-0137 · Tiempo 70-180 bajo objetivo

- **Dominio / fase:** Glucosa / CGM / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cgm_tir_pct < 70` %; **ventana:** CGM ≥14 días y ≥70% datos para métricas agregadas.
- **Acción propuesta:** Revisar control en diabetes (CONSULTA).
- **Confirmación:** CGM 14 días/70% cobertura.
- **Razonamiento:** ADA 2026 CGM métricas aplican a personas con diabetes; clasificación para astronautas sin diabetes es investigación.
- **Alcance y límites:** Separar sensores intersticial y plasma. No diagnosticar diabetes por TIR
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N17 — [ADA Standards 2026 glycemic goals](https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic); localizador: Tabla 6.2 CGM, TIR/TBR/TAR.

## SP-0138 · Tiempo alto 180 elevado

- **Dominio / fase:** Glucosa / CGM / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cgm_tar180_pct >= 25` %; **ventana:** CGM ≥14 días y ≥70% datos para métricas agregadas.
- **Acción propuesta:** Evaluar hiperglucemia en diabetes (CONSULTA).
- **Confirmación:** CGM validado.
- **Razonamiento:** ADA 2026 CGM métricas aplican a personas con diabetes; clasificación para astronautas sin diabetes es investigación.
- **Alcance y límites:** Separar sensores intersticial y plasma. Meta ADA general en diabetes
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N17 — [ADA Standards 2026 glycemic goals](https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic); localizador: Tabla 6.2 CGM, TIR/TBR/TAR.

## SP-0139 · CV glucosa alto

- **Dominio / fase:** Glucosa / CGM / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cgm_cv_pct > 36` %; **ventana:** CGM ≥14 días y ≥70% datos para métricas agregadas.
- **Acción propuesta:** Evaluar alta variabilidad y seguridad (CONSULTA).
- **Confirmación:** CGM duracion calidad.
- **Razonamiento:** ADA 2026 CGM métricas aplican a personas con diabetes; clasificación para astronautas sin diabetes es investigación.
- **Alcance y límites:** Separar sensores intersticial y plasma. Objetivo ADA CV≤36% diabetes
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N17 — [ADA Standards 2026 glycemic goals](https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic); localizador: Tabla 6.2 CGM, TIR/TBR/TAR.

## SP-0140 · HbA1c clínica diagnóstica

- **Dominio / fase:** Glucosa / CGM / P. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `hba1c_pct >= 6.5` %; **ventana:** CGM ≥14 días y ≥70% datos para métricas agregadas.
- **Acción propuesta:** Solicitar confirmación de diabetes (CONSULTA).
- **Confirmación:** HbA1c laboratorio y repetición según contexto.
- **Razonamiento:** ADA 2026 CGM métricas aplican a personas con diabetes; clasificación para astronautas sin diabetes es investigación.
- **Alcance y límites:** Separar sensores intersticial y plasma. No aplicar a CGM ni anemia sin considerarla
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N17 — [ADA Standards 2026 glycemic goals](https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic); localizador: Tabla 6.2 CGM, TIR/TBR/TAR.

## SP-0141 · Sueño promedio muy corto

- **Dominio / fase:** Sueño / cronobiología / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `sleep_hours_7d < 6` h/día; **ventana:** promedios 7 días cuando indica.
- **Acción propuesta:** Revisión fatiga y cronograma (CONSULTA).
- **Confirmación:** Actigrafía o registro sueño calibrado.
- **Razonamiento:** Sueño y fatiga deben medirse con actigrafía, diarios o pruebas, no deducirse de FC/HRV.
- **Alcance y límites:** 7 horas referencia terrestre. Umbral de seguridad propuesto; no corte específico NASA
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N24 — [NASA sleep/cognitive hazards](https://www.nasa.gov/hrp/risks/); localizador: Riesgo de sueño, disincronía, sobrecarga.

## SP-0142 · Sueño promedio <7 horas

- **Dominio / fase:** Sueño / cronobiología / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `sleep_hours_7d < 7` h/día; **ventana:** promedios 7 días cuando indica.
- **Acción propuesta:** Revisar oportunidad de sueño (SEGUIMIENTO).
- **Confirmación:** Diario y actigrafía.
- **Razonamiento:** Sueño y fatiga deben medirse con actigrafía, diarios o pruebas, no deducirse de FC/HRV.
- **Alcance y límites:** 7 horas referencia terrestre. Duración recomendada terrestre; no diagnose insomnio
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N24 — [NASA sleep/cognitive hazards](https://www.nasa.gov/hrp/risks/); localizador: Riesgo de sueño, disincronía, sobrecarga.

## SP-0143 · Desfase circadiano elevado

- **Dominio / fase:** Sueño / cronobiología / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `circadian_misalignment_flag == 1` indicador; **ventana:** promedios 7 días cuando indica.
- **Acción propuesta:** Evaluación de luz y turnos (SEGUIMIENTO).
- **Confirmación:** Actigrafía + luz + horarios.
- **Razonamiento:** Sueño y fatiga deben medirse con actigrafía, diarios o pruebas, no deducirse de FC/HRV.
- **Alcance y límites:** 7 horas referencia terrestre. Sin datos luz no inferir desfase
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N24 — [NASA sleep/cognitive hazards](https://www.nasa.gov/hrp/risks/); localizador: Riesgo de sueño, disincronía, sobrecarga.

## SP-0144 · Periodos sueño irregulares

- **Dominio / fase:** Sueño / cronobiología / F. **Evidencia:** C. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `sleep_variability_flag == 1` indicador; **ventana:** promedios 7 días cuando indica.
- **Acción propuesta:** Revisar diario y cronograma (INVESTIGACION).
- **Confirmación:** Registro continuo.
- **Razonamiento:** Sueño y fatiga deben medirse con actigrafía, diarios o pruebas, no deducirse de FC/HRV.
- **Alcance y límites:** 7 horas referencia terrestre. Regla cualitativa precomputada por investigación
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N24 — [NASA sleep/cognitive hazards](https://www.nasa.gov/hrp/risks/); localizador: Riesgo de sueño, disincronía, sobrecarga.

## SP-0145 · PVT lapsos mayores basal

- **Dominio / fase:** Sueño / cronobiología / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `pvt_lapse_high_flag == 1` indicador; **ventana:** promedios 7 días cuando indica.
- **Acción propuesta:** Revisar desempeño y fatiga (ALTA).
- **Confirmación:** Psychomotor Vigilance Test.
- **Razonamiento:** Sueño y fatiga deben medirse con actigrafía, diarios o pruebas, no deducirse de FC/HRV.
- **Alcance y límites:** 7 horas referencia terrestre. Sin test PVT, frecuencia cardiaca no equivalente
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N24 — [NASA sleep/cognitive hazards](https://www.nasa.gov/hrp/risks/); localizador: Riesgo de sueño, disincronía, sobrecarga.

## SP-0146 · Sobrecarga trabajo crítico

- **Dominio / fase:** Sueño / cronobiología / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `workload_alarm == 1` indicador; **ventana:** promedios 7 días cuando indica.
- **Acción propuesta:** Replanificar turno/descanso (ALTA).
- **Confirmación:** Registro fatiga certificado.
- **Razonamiento:** Sueño y fatiga deben medirse con actigrafía, diarios o pruebas, no deducirse de FC/HRV.
- **Alcance y límites:** 7 horas referencia terrestre. Señal operacional, no trastorno mental
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N24 — [NASA sleep/cognitive hazards](https://www.nasa.gov/hrp/risks/); localizador: Riesgo de sueño, disincronía, sobrecarga.

## SP-0147 · Sueño insuficiente con tarea crítica

- **Dominio / fase:** Sueño / cronobiología / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `sleep_critical_task_flag == 1` indicador; **ventana:** promedios 7 días cuando indica.
- **Acción propuesta:** Evaluación fatiga antes operación (ALTA).
- **Confirmación:** Regla de seguridad con tarea y sueño.
- **Razonamiento:** Sueño y fatiga deben medirse con actigrafía, diarios o pruebas, no deducirse de FC/HRV.
- **Alcance y límites:** 7 horas referencia terrestre. No suspensión automática sin protocolo
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N24 — [NASA sleep/cognitive hazards](https://www.nasa.gov/hrp/risks/); localizador: Riesgo de sueño, disincronía, sobrecarga.

## SP-0148 · Autorreporte deterioro psicológico

- **Dominio / fase:** Psicosocial / conducta / F. **Evidencia:** H. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `psych_selfreport_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Ofrecer evaluación confidencial profesional (CONSULTA).
- **Confirmación:** Entrevista individual validada.
- **Razonamiento:** Evaluación psicosocial voluntaria protegida, nunca criterio automatizado sancionador.
- **Alcance y límites:** No asignar riesgo de suicidio basado en biometría. NO diagnóstico psiquiátrico desde biometría
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N24 — [NASA sleep/cognitive hazards](https://www.nasa.gov/hrp/risks/); localizador: Riesgo de sueño, disincronía, sobrecarga.

## SP-0149 · Cambio rendimiento cognitivo

- **Dominio / fase:** Psicosocial / conducta / F. **Evidencia:** H. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `cognitive_change_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar atención, sueño, estrés y otros factores (CONSULTA).
- **Confirmación:** Prueba cognitiva estandarizada.
- **Razonamiento:** Evaluación psicosocial voluntaria protegida, nunca criterio automatizado sancionador.
- **Alcance y límites:** No asignar riesgo de suicidio basado en biometría. No inferir enfermedad mental con HRV
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N24 — [NASA sleep/cognitive hazards](https://www.nasa.gov/hrp/risks/); localizador: Riesgo de sueño, disincronía, sobrecarga.

## SP-0150 · Riesgo equipo por conflicto informado

- **Dominio / fase:** Psicosocial / conducta / F. **Evidencia:** H. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `team_conflict_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Mediación y soporte del programa (CONSULTA).
- **Confirmación:** Registro voluntario y contextual.
- **Razonamiento:** Evaluación psicosocial voluntaria protegida, nunca criterio automatizado sancionador.
- **Alcance y límites:** No asignar riesgo de suicidio basado en biometría. No inferir condición individual sin autorización
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N24 — [NASA sleep/cognitive hazards](https://www.nasa.gov/hrp/risks/); localizador: Riesgo de sueño, disincronía, sobrecarga.

## SP-0151 · HRV baja respecto basal

- **Dominio / fase:** Psicosocial / conducta / F. **Evidencia:** H. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `hrv_low_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Analizar sueño/estrés/actividad sin diagnóstico (INVESTIGACION).
- **Confirmación:** Control condiciones HRV y respiración.
- **Razonamiento:** Evaluación psicosocial voluntaria protegida, nunca criterio automatizado sancionador.
- **Alcance y límites:** No asignar riesgo de suicidio basado en biometría. Señal inespecífica experimental
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N24 — [NASA sleep/cognitive hazards](https://www.nasa.gov/hrp/risks/); localizador: Riesgo de sueño, disincronía, sobrecarga.

## SP-0152 · Fase ovulatoria no aplicable o inobservable

- **Dominio / fase:** Reproducción / hormonas / A. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cycle_phase_unavailable == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Marcar no aplicable sin inferir enfermedad (NO_CALCULABLE).
- **Confirmación:** Confirmar contexto ciclo/supresión.
- **Razonamiento:** Los estudios humanos son pocos; la fase no determina diagnósticos ni aumenta automáticamente score VTE.
- **Alcance y límites:** Consentimiento/privacidad reforzados. Uso anticoncepción, menopausia o desconocido
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N20 — [Reproductive health in space systematic review](https://www.nature.com/articles/s41526-024-00351-1); localizador: Eje reproductivo, 16 estudios.

## SP-0153 · Embarazo confirmado en contexto misión

- **Dominio / fase:** Reproducción / hormonas / A. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `pregnancy_test_positive == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación obstétrica confidencial y plan de exposición (ALTA).
- **Confirmación:** Prueba confirmatoria médica.
- **Razonamiento:** Los estudios humanos son pocos; la fase no determina diagnósticos ni aumenta automáticamente score VTE.
- **Alcance y límites:** Consentimiento/privacidad reforzados. Riesgo radiación/operación, no inferir por ciclo
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N20 — [Reproductive health in space systematic review](https://www.nature.com/articles/s41526-024-00351-1); localizador: Eje reproductivo, 16 estudios.

## SP-0154 · Terapia hormonal con riesgo trombótico relevante

- **Dominio / fase:** Reproducción / hormonas / A. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `high_risk_hormone_use == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Incluir en NASA VTE score (CONSULTA).
- **Confirmación:** Historia medicamentos voluntaria.
- **Razonamiento:** Los estudios humanos son pocos; la fase no determina diagnósticos ni aumenta automáticamente score VTE.
- **Alcance y límites:** Consentimiento/privacidad reforzados. No asignar riesgo por fase menstrual
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N20 — [Reproductive health in space systematic review](https://www.nature.com/articles/s41526-024-00351-1); localizador: Eje reproductivo, 16 estudios.

## SP-0155 · Amenorrea no explicada

- **Dominio / fase:** Reproducción / hormonas / A. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `amenorrhea_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación endocrino-reproductiva (CONSULTA).
- **Confirmación:** Historia ciclo/medicación/embarazo.
- **Razonamiento:** Los estudios humanos son pocos; la fase no determina diagnósticos ni aumenta automáticamente score VTE.
- **Alcance y límites:** Consentimiento/privacidad reforzados. No obligar prueba indiscriminada
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N20 — [Reproductive health in space systematic review](https://www.nature.com/articles/s41526-024-00351-1); localizador: Eje reproductivo, 16 estudios.

## SP-0156 · Disfunción tiroidea TSH elevada

- **Dominio / fase:** Reproducción / hormonas / A. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `tsh_high_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Solicitar T4 libre y valoración (CONSULTA).
- **Confirmación:** Perfil hormonal.
- **Razonamiento:** Los estudios humanos son pocos; la fase no determina diagnósticos ni aumenta automáticamente score VTE.
- **Alcance y límites:** Consentimiento/privacidad reforzados. No interpretar solo fase ciclo
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N20 — [Reproductive health in space systematic review](https://www.nature.com/articles/s41526-024-00351-1); localizador: Eje reproductivo, 16 estudios.

## SP-0157 · TSH baja laboratorio

- **Dominio / fase:** Reproducción / hormonas / A. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `tsh_low_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Valorar T4L/T3, medicación (CONSULTA).
- **Confirmación:** Perfil hormonal.
- **Razonamiento:** Los estudios humanos son pocos; la fase no determina diagnósticos ni aumenta automáticamente score VTE.
- **Alcance y límites:** Consentimiento/privacidad reforzados. No diagnosticar hipertiroidismo sin T4L
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N20 — [Reproductive health in space systematic review](https://www.nature.com/articles/s41526-024-00351-1); localizador: Eje reproductivo, 16 estudios.

## SP-0158 · Alteración progesterona según fase

- **Dominio / fase:** Reproducción / hormonas / A. **Evidencia:** O. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `progesterone_phase_abnormal_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Verificar día/ovulación y tratamiento hormonal (INVESTIGACION).
- **Confirmación:** Ensayo hormonal con fase real.
- **Razonamiento:** Los estudios humanos son pocos; la fase no determina diagnósticos ni aumenta automáticamente score VTE.
- **Alcance y límites:** Consentimiento/privacidad reforzados. Investigación reproductiva espacial limitada
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N20 — [Reproductive health in space systematic review](https://www.nature.com/articles/s41526-024-00351-1); localizador: Eje reproductivo, 16 estudios.

## SP-0159 · Prueba equilibrio fuera basal

- **Dominio / fase:** Sensorimotor / retorno / R. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `balance_test_abnormal == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Programa rehabilitación vestibular (CONSULTA).
- **Confirmación:** Prueba de equilibrio objetiva.
- **Razonamiento:** Los tests sensorimotores son opcionales adicionales; ausencia obliga abstención.
- **Alcance y límites:** No se inferirá de frecuencia cardíaca. No estimable con HR aislada
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0160 · Marcha anormal tras aterrizaje

- **Dominio / fase:** Sensorimotor / retorno / R. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `gait_test_abnormal == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Prevenir caídas y rehabilitación (ALTA).
- **Confirmación:** Prueba marcha y observación clínica.
- **Razonamiento:** Los tests sensorimotores son opcionales adicionales; ausencia obliga abstención.
- **Alcance y límites:** No se inferirá de frecuencia cardíaca. Riesgo frecuente tras microgravedad
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0161 · Desorientación espacial notificada

- **Dominio / fase:** Sensorimotor / retorno / F. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `spatial_disorientation_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Suspender tareas sensibles hasta evaluación (ALTA).
- **Confirmación:** Examen sensorimotor.
- **Razonamiento:** Los tests sensorimotores son opcionales adicionales; ausencia obliga abstención.
- **Alcance y límites:** No se inferirá de frecuencia cardíaca. Moción espacial no identificada solo por vitales
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0162 · Náuseas/mareo movimiento

- **Dominio / fase:** Sensorimotor / retorno / F. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `motion_sickness_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Valoración por médico de vuelo (CONSULTA).
- **Confirmación:** Síntomas y signos.
- **Razonamiento:** Los tests sensorimotores son opcionales adicionales; ausencia obliga abstención.
- **Alcance y límites:** No se inferirá de frecuencia cardíaca. No inventar probabilidad de cinetosis
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0163 · Caída registrada

- **Dominio / fase:** Sensorimotor / retorno / R. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `fall_event == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Explorar lesión y supervisión (URGENTE).
- **Confirmación:** Registro de caída.
- **Razonamiento:** Los tests sensorimotores son opcionales adicionales; ausencia obliga abstención.
- **Alcance y límites:** No se inferirá de frecuencia cardíaca. Prevenir fractura por pérdida mineral ósea
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0164 · Test coordinación mano-ojo alterado

- **Dominio / fase:** Sensorimotor / retorno / F. **Evidencia:** O. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `coordination_deficit_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar tareas y entrenamiento (CONSULTA).
- **Confirmación:** Prueba función manual.
- **Razonamiento:** Los tests sensorimotores son opcionales adicionales; ausencia obliga abstención.
- **Alcance y límites:** No se inferirá de frecuencia cardíaca. Datos biométricos no sustituyen prueba funcional
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0165 · Temperatura corporal muy alta

- **Dominio / fase:** Temperatura / fisiología térmica / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `core_temp_c >= 40` °C; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación inmediata por posible hipertermia (URGENTE).
- **Confirmación:** Termómetro core y contexto.
- **Razonamiento:** Normas atmósfera no establecen un único corte temperatura corporal.
- **Alcance y límites:** Sensores térmicos cutáneos no equivalen a centrales. No diagnóstico golpe calor sin signos
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0166 · Temperatura alta con exposición termal

- **Dominio / fase:** Temperatura / fisiología térmica / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `heat_stress_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar carga térmica y humedad (ALTA).
- **Confirmación:** Índice térmico medido por misión.
- **Razonamiento:** Normas atmósfera no establecen un único corte temperatura corporal.
- **Alcance y límites:** Sensores térmicos cutáneos no equivalen a centrales. No inferir ambiente con T corporal
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0167 · Descenso temperatura corporal

- **Dominio / fase:** Temperatura / fisiología térmica / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `core_temp_c < 36` °C; **ventana:** confirmar la medida.
- **Acción propuesta:** Verificar patrón y sensores (SEGUIMIENTO).
- **Confirmación:** Medición fiable.
- **Razonamiento:** Normas atmósfera no establecen un único corte temperatura corporal.
- **Alcance y límites:** Sensores térmicos cutáneos no equivalen a centrales. Puede ser variación basal si no clínica
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0168 · Pérdida de fluidos durante EVA

- **Dominio / fase:** Temperatura / fisiología térmica / F. **Evidencia:** C. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `eva_dehydration_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar refrigeración e hidratación (ALTA).
- **Confirmación:** Balance/masa y dispositivo EVA.
- **Razonamiento:** Normas atmósfera no establecen un único corte temperatura corporal.
- **Alcance y límites:** Sensores térmicos cutáneos no equivalen a centrales. Heurística dependiente equipo
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N02 — [NASA-STD-3001 Vol 2 Rev F](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/); localizador: 6.2 atmósfera 6.3 agua 6.6 acústica.

## SP-0169 · Presión sin manguito no validada

- **Dominio / fase:** Controles de calidad y abstención / A. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `bp_cuffless_unvalidated == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No emitir clasificación hipertensión (NO_CALCULABLE).
- **Confirmación:** Validación calibración vs manguito.
- **Razonamiento:** La abstención explícita es requisito de seguridad y validez científica.
- **Alcance y límites:** No convertir NA en lectura normal. Regla de seguridad de datos
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0170 · CGM sensor con calidad insuficiente

- **Dominio / fase:** Controles de calidad y abstención / A. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cgm_quality_bad == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No calcular CGM clínico (NO_CALCULABLE).
- **Confirmación:** Integridad serie y tiempo activo.
- **Razonamiento:** La abstención explícita es requisito de seguridad y validez científica.
- **Alcance y límites:** No convertir NA en lectura normal. No imputar cero
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0171 · Masa medida como peso gravitacional sin corrección

- **Dominio / fase:** Controles de calidad y abstención / F. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `microgravity_weight_invalid == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No calcular cambio masa (NO_CALCULABLE).
- **Confirmación:** Equipo masa inercial calibrado.
- **Razonamiento:** La abstención explícita es requisito de seguridad y validez científica.
- **Alcance y límites:** No convertir NA en lectura normal. Peso en N no masa kg
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0172 · SpO2 posible artefacto

- **Dominio / fase:** Controles de calidad y abstención / A. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `spo2_artifact == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No usar SpO2 para diagnóstico (NO_CALCULABLE).
- **Confirmación:** Movimiento, perfusión, pigmentación y sensor.
- **Razonamiento:** La abstención explícita es requisito de seguridad y validez científica.
- **Alcance y límites:** No convertir NA en lectura normal. Oximetría sesgada
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0173 · Faltan datos de ambiente cabina

- **Dominio / fase:** Controles de calidad y abstención / F. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cabin_data_missing == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No estimar hipoxia/CO2 exposición con vitales (NO_CALCULABLE).
- **Confirmación:** Telemetría ECLSS.
- **Razonamiento:** La abstención explícita es requisito de seguridad y validez científica.
- **Alcance y límites:** No convertir NA en lectura normal. Un astronauta con SpO2 normal puede estar expuesto a CO2
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0174 · Faltan datos OCT

- **Dominio / fase:** Controles de calidad y abstención / F. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `oct_unavailable_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No descartar SANS (NO_CALCULABLE).
- **Confirmación:** OCT y examen oftalmológico.
- **Razonamiento:** La abstención explícita es requisito de seguridad y validez científica.
- **Alcance y límites:** No convertir NA en lectura normal. No sustituir con HR
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0175 · Faltan datos radiación dosimetría

- **Dominio / fase:** Controles de calidad y abstención / F. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `dosimetry_missing == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No calcular dosis ionizante (NO_CALCULABLE).
- **Confirmación:** Dosimetría validada.
- **Razonamiento:** La abstención explícita es requisito de seguridad y validez científica.
- **Alcance y límites:** No convertir NA en lectura normal. FC/PA no detectan radiación
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0176 · Faltan predictores VTE score

- **Dominio / fase:** Controles de calidad y abstención / A. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `vte_score_missing == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No presentar puntos como completos (NO_CALCULABLE).
- **Confirmación:** Historia/US/dímero-D.
- **Razonamiento:** La abstención explícita es requisito de seguridad y validez científica.
- **Alcance y límites:** No convertir NA en lectura normal. No sumar ceros en factores desconocidos
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0177 · Fase misión indefinida

- **Dominio / fase:** Controles de calidad y abstención / A. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `mission_phase_unknown == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No activar reglas específicas fase (NO_CALCULABLE).
- **Confirmación:** Control de misión.
- **Razonamiento:** La abstención explícita es requisito de seguridad y validez científica.
- **Alcance y límites:** No convertir NA en lectura normal. Fases P/F/R son distintas
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0178 · Sensor sin calibración

- **Dominio / fase:** Controles de calidad y abstención / A. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `sensor_uncalibrated == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Inhabilitar criterio dependiente del sensor (NO_CALCULABLE).
- **Confirmación:** Control metrológico.
- **Razonamiento:** La abstención explícita es requisito de seguridad y validez científica.
- **Alcance y límites:** No convertir NA en lectura normal. La señal fuera de rango puede ser falla
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0179 · Falta ecografía para trombosis yugular

- **Dominio / fase:** Riesgos raros / no identificables / F. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `ijv_ultrasound_missing == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No descartar trombosis venosa (NO_CALCULABLE).
- **Confirmación:** Solicitar ultrasonido cuando clínicamente indicado.
- **Razonamiento:** Separa riesgos no observables de ausencia de enfermedad; ninguna lectura los descarta.
- **Alcance y límites:** Estado NOT_OBSERVABLE no es falso. Trombosis puede ser asintomática
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0180 · Falta DXA para remodelación ósea

- **Dominio / fase:** Riesgos raros / no identificables / R. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `dxa_missing == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No cuantificar pérdida ósea (NO_CALCULABLE).
- **Confirmación:** DXA pre/post.
- **Razonamiento:** Separa riesgos no observables de ausencia de enfermedad; ninguna lectura los descarta.
- **Alcance y límites:** Estado NOT_OBSERVABLE no es falso. Cintura y masa no miden BMD
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0181 · Falta audiometría para ototoxicidad acústica

- **Dominio / fase:** Riesgos raros / no identificables / R. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `audiometry_missing == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No descartar pérdida auditiva (NO_CALCULABLE).
- **Confirmación:** Audiometría.
- **Razonamiento:** Separa riesgos no observables de ausencia de enfermedad; ninguna lectura los descarta.
- **Alcance y límites:** Estado NOT_OBSERVABLE no es falso. FC/SpO2 no identifican daño auditivo
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0182 · Falta evaluación neurocognitiva

- **Dominio / fase:** Riesgos raros / no identificables / F. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cognitive_test_missing == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No diagnosticar cambios cognitivos (NO_CALCULABLE).
- **Confirmación:** Pruebas específicas.
- **Razonamiento:** Separa riesgos no observables de ausencia de enfermedad; ninguna lectura los descarta.
- **Alcance y límites:** Estado NOT_OBSERVABLE no es falso. HRV inespecífica
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0183 · Falta evaluación de equilibrio

- **Dominio / fase:** Riesgos raros / no identificables / R. **Evidencia:** Q. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `balance_test_missing == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** No puntuar deterioro vestibular (NO_CALCULABLE).
- **Confirmación:** Sensorimotor validado.
- **Razonamiento:** Separa riesgos no observables de ausencia de enfermedad; ninguna lectura los descarta.
- **Alcance y límites:** Estado NOT_OBSERVABLE no es falso. Microrgavidad altera equilibrio
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** ABSTENCION. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N10 — [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/); localizador: Taxonomía de riesgos.

## SP-0184 · FC reposo aumento relativo ≥20% de basal

- **Dominio / fase:** Monitorización de tendencias / F. **Evidencia:** H. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `rest_hr_baseline_ratio >= 1.2` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar estrés fisiológico, ejercicio y sueño (INVESTIGACION).
- **Confirmación:** Basal representativo en fase comparable.
- **Razonamiento:** Solo investigación; todas las reglas con porcentajes arbitrarios se deshabilitan y no tienen riesgo probabilístico.
- **Alcance y límites:** Requerir pruebas prospectivas. Heurística exploratoria no diagnóstico
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0185 · HRV caída relativa ≥30%

- **Dominio / fase:** Monitorización de tendencias / F. **Evidencia:** H. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `hrv_baseline_ratio <= 0.7` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Verificar medidas autonómicas y sueño (INVESTIGACION).
- **Confirmación:** Mismo algoritmo HRV y hora circadiana.
- **Razonamiento:** Solo investigación; todas las reglas con porcentajes arbitrarios se deshabilitan y no tienen riesgo probabilístico.
- **Alcance y límites:** Requerir pruebas prospectivas. No interpretarse como enfermedad
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0186 · PA media aumento relativo≥10%

- **Dominio / fase:** Monitorización de tendencias / F. **Evidencia:** H. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `map_baseline_ratio >= 1.1` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Verificar PA, hidratación y fase (INVESTIGACION).
- **Confirmación:** Dispositivo de PA validado.
- **Razonamiento:** Solo investigación; todas las reglas con porcentajes arbitrarios se deshabilitan y no tienen riesgo probabilístico.
- **Alcance y límites:** Requerir pruebas prospectivas. No norma NASA
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0187 · SpO2 caída 3 puntos basal

- **Dominio / fase:** Monitorización de tendencias / F. **Evidencia:** H. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `spo2_delta_baseline <= -3` puntos; **ventana:** confirmar la medida.
- **Acción propuesta:** Validar sensor y ambiente (INVESTIGACION).
- **Confirmación:** Calidad oxímetro.
- **Razonamiento:** Solo investigación; todas las reglas con porcentajes arbitrarios se deshabilitan y no tienen riesgo probabilístico.
- **Alcance y límites:** Requerir pruebas prospectivas. Cambio clínico requiere contexto
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0188 · Masa corporal caida ≥3% basal

- **Dominio / fase:** Monitorización de tendencias / F. **Evidencia:** H. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `mass_ratio_preflight < 0.97` ratio; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar líquidos/ingesta (INVESTIGACION).
- **Confirmación:** Medición masa inercial.
- **Razonamiento:** Solo investigación; todas las reglas con porcentajes arbitrarios se deshabilitan y no tienen riesgo probabilístico.
- **Alcance y límites:** Requerir pruebas prospectivas. Heurística con elevada confusión
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0189 · Coeficiente variación HR reposo anómalo

- **Dominio / fase:** Monitorización de tendencias / F. **Evidencia:** H. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `hr_cv_high_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar artefactos y variabilidad (INVESTIGACION).
- **Confirmación:** Ventana 7 días y control actividad.
- **Razonamiento:** Solo investigación; todas las reglas con porcentajes arbitrarios se deshabilitan y no tienen riesgo probabilístico.
- **Alcance y límites:** Requerir pruebas prospectivas. Sin umbral validado
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0190 · Cambio presión basal postvuelo

- **Dominio / fase:** Monitorización de tendencias / R. **Evidencia:** H. **Estado:** DESACTIVADA / EXPERIMENTAL.
- **Disparador medible:** `postflight_map_change_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Reevaluar compensación ortostática (INVESTIGACION).
- **Confirmación:** Medidas posición.
- **Razonamiento:** Solo investigación; todas las reglas con porcentajes arbitrarios se deshabilitan y no tienen riesgo probabilístico.
- **Alcance y límites:** Requerir pruebas prospectivas. No convertir a diagnóstico de hipotensión
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N11 — [NASA Standard Measures](https://www.nasa.gov/reference/standard-measures/); localizador: Protocolo multidimensional.

## SP-0191 · Compromiso hemodinámico compuesto

- **Dominio / fase:** Riesgos clínicos habituales con impacto espacial / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `hemodynamic_critical_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Aplicar evaluación ABC y perfusión (URGENTE).
- **Confirmación:** Regla multivariada clínica evaluada.
- **Razonamiento:** Emergencias de alta severidad con datos adicionales/síntomas; no suponer que son obligatorios.
- **Alcance y límites:** Estandar médico general adaptado por Flight Surgeon. Fiebre + hipotensión etc no identifican sepsis
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0192 · Taquiarritmia ECG confirmada

- **Dominio / fase:** Riesgos clínicos habituales con impacto espacial / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `ecg_arrhythmia_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Interpretación ECG y telemedicina (ALTA).
- **Confirmación:** ECG 1+ derivaciones.
- **Razonamiento:** Emergencias de alta severidad con datos adicionales/síntomas; no suponer que son obligatorios.
- **Alcance y límites:** Estandar médico general adaptado por Flight Surgeon. PPG no diagnostica FA
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0193 · Dolor torácico informado

- **Dominio / fase:** Riesgos clínicos habituales con impacto espacial / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `chest_pain_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación cardiopulmonar (URGENTE).
- **Confirmación:** Historia ECG troponina si disponible.
- **Razonamiento:** Emergencias de alta severidad con datos adicionales/síntomas; no suponer que son obligatorios.
- **Alcance y límites:** Estandar médico general adaptado por Flight Surgeon. Wearable no descarta síndrome coronario
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0194 · Signos neurológicos focales

- **Dominio / fase:** Riesgos clínicos habituales con impacto espacial / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `stroke_symptom_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Activar protocolo neurológico (URGENTE).
- **Confirmación:** Exploración FAST/neuro; imagen si posible.
- **Razonamiento:** Emergencias de alta severidad con datos adicionales/síntomas; no suponer que son obligatorios.
- **Alcance y límites:** Estandar médico general adaptado por Flight Surgeon. No detectables solo por tensión
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0195 · Sospecha reacción anafiláctica

- **Dominio / fase:** Riesgos clínicos habituales con impacto espacial / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `anaphylaxis_symptom_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Activar protocolos de emergencia (URGENTE).
- **Confirmación:** Evaluación síntomas y soporte vital.
- **Razonamiento:** Emergencias de alta severidad con datos adicionales/síntomas; no suponer que son obligatorios.
- **Alcance y límites:** Estandar médico general adaptado por Flight Surgeon. SpO2 FC no hacen diagnóstico
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0196 · Glucosa con cetonemia elevada

- **Dominio / fase:** Riesgos clínicos habituales con impacto espacial / A. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `ketone_high_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación acidosis y metabolismo (URGENTE).
- **Confirmación:** Cetonas, pH/electrolitos.
- **Razonamiento:** Emergencias de alta severidad con datos adicionales/síntomas; no suponer que son obligatorios.
- **Alcance y límites:** Estandar médico general adaptado por Flight Surgeon. No diagnosticar DKA solo con CGM
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N21 — [NASA Health Standards and mission tailoring](https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/); localizador: Vols 1 y 2, perfiles de misión.

## SP-0197 · Audiometría cambio umbral clínico

- **Dominio / fase:** Exposición acústica / audición / R. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `audiometric_shift_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluación audiológica (CONSULTA).
- **Confirmación:** Audiometría pre/post estándar.
- **Razonamiento:** Requiere dosímetro/audiometría externos.
- **Alcance y límites:** Riesgo ambiental no probabilidad de hipoacusia. No infiere de HR
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N26 — [NASA hearing risk](https://www.nasa.gov/directorates/esdmd/hhp/risk-of-hearing-loss-and-performance-decrements-due-to-acoustics-issues-in-space/); localizador: Acoustic hazards.

## SP-0198 · Acúfeno nuevo

- **Dominio / fase:** Exposición acústica / audición / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `tinnitus_new_flag == 1` indicador; **ventana:** confirmar la medida.
- **Acción propuesta:** Evaluar exposición sonora y oído (CONSULTA).
- **Confirmación:** Entrevista y audiometría.
- **Razonamiento:** Requiere dosímetro/audiometría externos.
- **Alcance y límites:** Riesgo ambiental no probabilidad de hipoacusia. Síntoma no presente en datos obligatorios
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N26 — [NASA hearing risk](https://www.nasa.gov/directorates/esdmd/hhp/risk-of-hearing-loss-and-performance-decrements-due-to-acoustics-issues-in-space/); localizador: Acoustic hazards.

## SP-0199 · Dosímetro acústico alto

- **Dominio / fase:** Exposición acústica / audición / F. **Evidencia:** C. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `noise_dose_pct >= 100` %; **ventana:** confirmar la medida.
- **Acción propuesta:** Mitigar exposición según misión (ALTA_OPERATIVA).
- **Confirmación:** Dosimetría dBA.
- **Razonamiento:** Requiere dosímetro/audiometría externos.
- **Alcance y límites:** Riesgo ambiental no probabilidad de hipoacusia. V2 Rev F 6073; Ruido protegido de casco debe evaluarse en oído
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** DESVIACION_UMBRAL. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N26 — [NASA hearing risk](https://www.nasa.gov/directorates/esdmd/hhp/risk-of-hearing-loss-and-performance-decrements-due-to-acoustics-issues-in-space/); localizador: Acoustic hazards.

## SP-0200 · SPE dosis de referencia de diseño excede máximo

- **Dominio / fase:** Radiación / límites complementarios / P. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `spe_reference_effective_mSv >= 250` mSv; **ventana:** confirmar la medida.
- **Acción propuesta:** Reevaluar refugio y blindaje de diseño (CRITICA_OPERATIVA).
- **Confirmación:** Simulación SPE NASA V1 4031.
- **Razonamiento:** Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.
- **Alcance y límites:** Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico. Requisito DE DISEÑO, no dosis persona
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0201 · Aporte de tecnología nuclear anual sobre límite

- **Dominio / fase:** Radiación / límites complementarios / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `nuclear_technology_mSv_year >= 20` mSv/año; **ventana:** confirmar la medida.
- **Acción propuesta:** Reconfigurar blindaje nuclear (CRITICA_OPERATIVA).
- **Confirmación:** Dosimetría atribuible reactor V1 4032.
- **Razonamiento:** Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.
- **Alcance y límites:** Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico. No mezclar con radiación espacial natural
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0202 · GCR espacio libre tasa arriba límite diseño

- **Dominio / fase:** Radiación / límites complementarios / P. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `gcr_free_space_mSv_day >= 1.3` mSv/día; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar blindaje GCR de hábitat (CRITICA_OPERATIVA).
- **Confirmación:** Modelo GCR NASA 4033.
- **Razonamiento:** Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.
- **Alcance y límites:** Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico. Solo diseño hábitat misiones >60 días
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0203 · GCR superficie planetaria tasa arriba límite diseño

- **Dominio / fase:** Radiación / límites complementarios / P. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `gcr_surface_mSv_day >= 0.9` mSv/día; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar blindaje hábitat en superficie (CRITICA_OPERATIVA).
- **Confirmación:** Modelo GCR V1 4033.
- **Razonamiento:** Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.
- **Alcance y límites:** Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico. Solo misiones >60 días
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0204 · Dosis circulatoria 30 días sobre límite

- **Dominio / fase:** Radiación / límites complementarios / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `circ_30d_mGy_eq > 250` mGy-Eq; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar protección tejido circulatorio (CRITICA_OPERATIVA).
- **Confirmación:** Dosimetría en arterias y miocardio.
- **Razonamiento:** Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.
- **Alcance y límites:** Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico. V1 Tabla 4.8-1
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0205 · Dosis circulatoria carrera sobre límite

- **Dominio / fase:** Radiación / límites complementarios / P. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `circ_career_mGy_eq > 1000` mGy-Eq; **ventana:** confirmar la medida.
- **Acción propuesta:** Reevaluar exposición ocupacional acumulada (CRITICA_OPERATIVA).
- **Confirmación:** Dosimetría tejido.
- **Razonamiento:** Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.
- **Alcance y límites:** Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico. V1 Tabla 4.8-1
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0206 · Dosis CNS 30 días sobre límite

- **Dominio / fase:** Radiación / límites complementarios / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cns_30d_mGy > 500` mGy; **ventana:** confirmar la medida.
- **Acción propuesta:** Protocolo radiológico SNC (CRITICA_OPERATIVA).
- **Confirmación:** Dosimetría hipocampo.
- **Razonamiento:** Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.
- **Alcance y límites:** Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico. V1 Tabla 4.8-1
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0207 · Dosis CNS anual sobre límite

- **Dominio / fase:** Radiación / límites complementarios / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cns_1y_mGy > 1000` mGy; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar dosis SNC (CRITICA_OPERATIVA).
- **Confirmación:** Dosimetría hipocampo.
- **Razonamiento:** Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.
- **Alcance y límites:** Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico. V1 Tabla 4.8-1
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0208 · Dosis CNS partículas Z>=10 anual

- **Dominio / fase:** Radiación / límites complementarios / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `cns_z10_1y_mGy > 100` mGy; **ventana:** confirmar la medida.
- **Acción propuesta:** Reevaluación blindaje contra alta Z (CRITICA_OPERATIVA).
- **Confirmación:** Dosimetría específica partículas.
- **Razonamiento:** Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.
- **Alcance y límites:** Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico. V1 Tabla 4.8-1
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0209 · Dosis piel 30 días supera máximo

- **Dominio / fase:** Radiación / límites complementarios / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `skin_30d_mGy_eq > 1500` mGy-Eq; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar dosimetría cutánea (CRITICA_OPERATIVA).
- **Confirmación:** Dosímetro y RBE piel.
- **Razonamiento:** Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.
- **Alcance y límites:** Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico. V1 Tabla 4.8-1
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0210 · Dosis piel un año supera máximo

- **Dominio / fase:** Radiación / límites complementarios / F. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `skin_1y_mGy_eq > 3000` mGy-Eq; **ventana:** confirmar la medida.
- **Acción propuesta:** Revisar dosimetría cutánea anual (CRITICA_OPERATIVA).
- **Confirmación:** Dosímetro y RBE.
- **Razonamiento:** Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.
- **Alcance y límites:** Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico. V1 Tabla 4.8-1
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

## SP-0211 · Dosis piel carrera supera máximo

- **Dominio / fase:** Radiación / límites complementarios / P. **Evidencia:** N. **Estado:** HABILITADA PARA REVISIÓN, NO CLÍNICA.
- **Disparador medible:** `skin_career_mGy_eq > 6000` mGy-Eq; **ventana:** confirmar la medida.
- **Acción propuesta:** Reevaluar exposición de carrera (CRITICA_OPERATIVA).
- **Confirmación:** Dosimetría piel.
- **Razonamiento:** Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.
- **Alcance y límites:** Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico. V1 Tabla 4.8-1
- **Alternativa o abstención:** Abstención cuando faltan predictores/validez; reevaluación protocolizada.
- **Cantidad de riesgo:** CUMPLIMIENTO_NORMA. No es probabilidad clínica salvo modelo calibrado explícito.
- **Referencia:** N01 — [NASA-STD-3001 Vol 1 Rev C](https://www.nasa.gov/reference/4-0-human-performance/); localizador: Norma de salud tripulación, capítulos 3-4.

