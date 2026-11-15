#!/usr/bin/env python3
"""Generador de catálogo espacial: reglas trazables, NO dispositivo médico."""
from __future__ import annotations
import json,csv,re,collections,math,hashlib,zipfile,shutil,os,sys
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'01_catalogo'; LIT=ROOT/'02_literatura'; MOD=ROOT/'03_modelos'; DEC=ROOT/'04_decisiones'; VAL=ROOT/'05_validacion'; ANT=ROOT/'07_antecedentes'
for d in [OUT,LIT,MOD,DEC,VAL,ANT]:d.mkdir(exist_ok=True,parents=True)
S={
'N01':('NASA-STD-3001 Vol 1 Rev C','2023','Norma de salud tripulación, capítulos 3-4','https://www.nasa.gov/reference/4-0-human-performance/','Norma técnica, aplicabilidad según misión'),
'N02':('NASA-STD-3001 Vol 2 Rev F','2026','6.2 atmósfera 6.3 agua 6.6 acústica','https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/','Norma técnica de sistemas; NO diagnóstico individual'),
'N03':('NASA OCHMO VTE Risk Score','2026','Figura/tabla VTE risk score p. 4; NASA/SP-20260005258','https://www.nasa.gov/wp-content/uploads/2026/06/risk-venous-thromboembolism-assessment-sp20260005258.pdf','Consenso NASA; no validación externa, puntos NO probabilidades'),
'N04':('SANS international expert consensus (Gew et al.)','2026','Tabla 2 y monitoring, DOI 10.1038/s41433-026-04651-6','https://www.nature.com/articles/s41433-026-04651-6','Consenso 2026; OCT Spectralis, intervalos y cambio basal'),
'N05':('NASA Spaceflight Venous Thrombosis Working Group','2025','Contexto y ecografía yugular','https://www.nasa.gov/organizations/ochmo/risk-of-venous-thromboembolism-during-spaceflight/','Riesgo real; asintomático y no detectado por wearables'),
'N06':('JAMA Network Open, internal jugular venous stasis (11 crew)','2019','Resultados y ultrasonido','https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2755307','Cohorte de 11, insuficiente para riesgo individual'),
'N07':('NASA OCHMO CO2 Technical Brief','2025','CO2 associated headaches 7-day analysis','https://www.nasa.gov/ochmo-tb-004-carbon-dioxide-2/','Modelo de cefalea sobre 49 astronautas, no aplicar como riesgo individual'),
'N08':('NASA Urinary Health Technical Brief','2026','Sección cálculos renales, líquidos, orina y ecografía','https://www.nasa.gov/ochmo-mtb-003-urinary-health-2/','El volumen de agua disponible NO es ingesta medida'),
'N09':('NASA Five Hazards','2025','Riesgos y marcos de exposición','https://www.nasa.gov/hrp/hazards/','Marco conceptual'),
'N10':('NASA Human System Risks','2025','Taxonomía de riesgos','https://www.nasa.gov/hhp/human-system-risks/','Inventario, no thresholds de enfermedad'),
'N11':('NASA Standard Measures','2025','Protocolo multidimensional','https://www.nasa.gov/reference/standard-measures/','Necesidad de instrumentos adicionales'),
'N12':('Orthostatic intolerance spaceflight meta-analysis','2026','Meta-análisis Acta Astronautica; 221 astronautas','https://www.sciencedirect.com/science/article/pii/S0094576526003346','Incidencia 30% (IC95% 24-38); poblacional'),
'N13':('Orthostatic hypotension: practical approach AAFP','2022','Definición postura y descenso PA','https://www.aafp.org/afp/2022/0100/p39','Diagnóstico con procedimiento postural'),
'N14':('Spaceflight anemia: hemolysis Nat Med','2022','14 astronautas hemólisis','https://www.nature.com/articles/s41591-021-01637-7','54% aumento hemólisis promedio; NO umbral Hb'),
'N15':('NASA Space radiation policy','2023','Vol 1 V1 4029/4030','https://www.nasa.gov/reference/4-0-human-performance/','600 mSv efectivo carrera y límites órganos; no riesgo absoluto personal'),
'N16':('NASA muscle/bone countermeasures','2023','Monitorización músculo y hueso','https://www.nasa.gov/humans-in-space/counteracting-bone-and-muscle-loss-in-microgravity/','Dato ~1%/mes sin contramedidas, no pronóstico individual'),
'N17':('ADA Standards 2026 glycemic goals','2026','Tabla 6.2 CGM, TIR/TBR/TAR','https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic','Metas CGM para personas con diabetes, no diagnóstico'),
'N18':('AHA/ACC BP Guidelines','2025','Clasificación PA y precisión cuffless','https://www.jacc.org/doi/10.1016/j.jacc.2025.05.007','PA confirmada con método validado y protocolo'),
'N19':('KDIGO CKD guideline 2024','2024','Crónica ≥3 meses, eGFR y ACR','https://kdigo.org/guidelines/ckd-evaluation-and-management/','Confirmar función renal; eGFR depende de creatinina'),
'N20':('Reproductive health in space systematic review','2024','Eje reproductivo, 16 estudios','https://www.nature.com/articles/s41526-024-00351-1','Evidencia escasa, suprimir inferencias fase ciclo'),
'N21':('NASA Health Standards and mission tailoring','2026','Vols 1 y 2, perfiles de misión','https://www.nasa.gov/ochmo/human-spaceflight-and-aviation-standards/','Ajustes dependientes de programa'),
'N22':('Spaceflight endocrine metabolic kidney review','2025','Bioimpedancia, calcio, volumen','https://link.springer.com/article/10.1186/s12915-025-02471-w','Metabolismo espacial no completamente caracterizado'),
'N23':('NASA cardiovascular vision fluid shift','2023','Adaptación volumen y ortostatismo','https://www.nasa.gov/directorates/esdmd/hhp/cardiovascular-and-vision/','Heterogeneidad según contramedidas'),
'N24':('NASA sleep/cognitive hazards','2025','Riesgo de sueño, disincronía, sobrecarga','https://www.nasa.gov/hrp/risks/','Actividad/HRV no diagnostican psiquiatría'),
'N25':('NASA decompression/hypoxia risks','2025','EVA DCS e hipoxia','https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/','No sustituye protocolo EVA'),
'N26':('NASA hearing risk','2025','Acoustic hazards','https://www.nasa.gov/directorates/esdmd/hhp/risk-of-hearing-loss-and-performance-decrements-due-to-acoustics-issues-in-space/','Sensores acústicos/audiometría no garantizados'),
'N27':('NASA OCHMO water and atmospheric requirements','2026','V2 6026/6046/6109','https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/','No equiparar suministro a ingesta'),
'N28':('NASA human system risk board','2025','Marcos de fallos y dependencias','https://www.nasa.gov/directorates/esdmd/hhp/human-system-risk-board/','DAGs y causalidad, no probabilidad clínica'),
'N29':('Spaceflight VTE evaluation NASA July','2026','Resumen de puntuación de riesgo y manejo','https://www.nasa.gov/organizations/ochmo/establishing-a-vte-risk-score-for-astronauts-algorithm/','Apixabán no debe recomendarse por sistema automático'),
'N30':('CDC/AHA Sleep at least 7 hours','2026','Datos población general 2024','https://www.cdc.gov/sleep/about/index.html','Duración recomendada general, no corte NASA'),
'N31':('NASA postflight reconditioning','2023','Vol 1 4.1-4.7','https://www.nasa.gov/reference/4-0-human-performance/','Evaluación del rendimiento, no enfermedad'),
'N32':('NASA Career Spaceflight 600 mSv policy','2023','V1 4030 límites de dosis por órgano','https://www.nasa.gov/reference/4-0-human-performance/','mGy-Eq vs mSv no intercambiables'),
'N33':('Spaceflight human reproductive health 2025','2025','Menstrual suppression and knowledge gaps','https://www.nature.com/articles/s44294-025-00112-9','Fase ovulatoria puede ser no aplicable'),
'N34':('NASA renal stone modelling','2025','NASA Glenn incidence quantification','https://www.nasa.gov/glenn/glenn-expertise-space-exploration/human-health-performance/computational-modeling/renal-stone-incidence-rate-quantification/','Sin datos completos no asignar probabilidad'),
'N35':('NASA astronauts health standard measures','2025','Sueño, luz, fluidos, cognición, equilibrio','https://www.nasa.gov/reference/standard-measures/','Fuente métodos; no valores umbral'),
'N36':('WHO Hemoglobin assessment anemia','2024','Guía WHO anemia y límites por grupos','https://www.who.int/publications/i/item/9789240088542','Referencia según población, embarazo y altitud'),
'N37':('NASA spacecraft environment and health','2026','Tabla NASA V2 6.2 6.3, atmósfera','https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/','Usar pp parcial y estado cabina; no convertir a SpO2'),
'N38':('FDA pulse oximeter accuracy considerations','2025','Limitaciones precisión por pigmentación','https://www.fda.gov/medical-devices/products-and-medical-procedures/pulse-oximeters','SpO2 estimada no siempre coincide con SaO2'),
'N39':('NASA acoustic noise formula V2 Rev F','2026','6.6.1 ruido 24h, V2 6073','https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/','Tolerancia ocupacional; medición dBA necesaria'),
'N40':('NASA 2026 VTE report June','2026','Tabla p4 escala 1/2-3/4-6/>6','https://www.nasa.gov/wp-content/uploads/2026/06/risk-venous-thromboembolism-assessment-sp20260005258.pdf','Herramienta reciente no validada externamente'),
}
SOURCE_FIELDS=['id','titulo','anio','localizador','url','advertencia']; allsources=[dict(zip(SOURCE_FIELDS,[k,*v])) for k,v in S.items()]
RULES=[]
# Evidence: N=norma NASA, C=consenso/guía, D=derivación o umbral terrestre, O=observacional, H=hipótesis investigación, Q=calidad/datos
# rule fields: clinical assessment risk NOT probability. Conditions encoded in JSON and evaluated without arbitrary eval.
def add(domain,label,field,op,value,unit,phase,priority,source,ev,action,confirm,why='',scope='',window='instante verificado',gate=None,quant='DESVIACION_UMBRAL',caveat='',alt='',enabled=True):
    assert source in S,(domain,label,source)
    r={'id':f'SP-{len(RULES)+1:04d}','dominio':domain,'nombre':label,'variable':field,'comparador':op,'umbral':value,'unidad':unit,'fase':phase,'prioridad':priority,'fuente_id':source,'url':S[source][3],'evidencia':ev,'accion':action,'confirmacion':confirm,'justificacion':why or f'Rastreo a {S[source][0]}: {S[source][2]}.','alcance':scope or 'Tripulación adulta; verificar misión, configuración, equipo y contexto antes de emitir alerta.','ventana':window,'requisitos_contexto':gate or {},'cuantificacion':quant,'limites':caveat or 'No inferir causalidad ni probabilidad de enfermedad; revisión médico de vuelo.','alternativa':alt or 'Abstención cuando faltan predictores/validez; reevaluación protocolizada.','habilitada':enabled,'regla':f'{field} {op} {value} {unit} [{phase}, {window}] => {action}'}
    RULES.append(r)
    return r
# use compact pipe text columns: label|field|op|value|unit|phase|prio|action|confirm|context
# values >= etc; IF existence context not infer zeros.
def group(domain,src,ev,rows,why='',scope='',window='confirmar la medida',alt='',enabled=True):
 for line in rows.strip().splitlines():
  if not line.strip() or line.strip().startswith('#'):continue
  x=[p.strip() for p in line.split('|')]
  if len(x)>10:x=x[:9]+["; ".join(x[9:])]
  if len(x)!=10:raise ValueError((domain,len(x),line))
  label,field,op,v,unit,phase,prio,action,confirm,context=x
  if re.fullmatch(r'-?\d+(?:\.\d+)?',v):v=float(v) if '.' in v else int(v)
  add(domain,label,field,op,v,unit,phase,prio,src,ev,action,confirm,why,scope,window,{},'DESVIACION_UMBRAL',context,alt,enabled)

# 01 — ingeniería atmosférica y fisiológica
# Gate metric names distinguish CABIN versus HUMAN; O2 partial pressure vs peripheral oxygen.
group('Cabina / CO2','N02','N', '''
CO2 horario por encima del límite nominal|cabin_ppco2_1h|>|3|mmHg|F|CRITICA_OPERATIVA|Verificar scrubber, ventilación y alertar control ambiental|Confirmación sensor ambiental redundante|V2 6004; NO diagnosticar hipercapnia con ppCO2 cabina
CO2 horario en límite nominal|cabin_ppco2_1h|>=|3|mmHg|F|ALTA_OPERATIVA|Revisar tendencia y margen de seguridad|Sensor ambiental calibrado|Inclusión conservadora del límite 3 mmHg
Presión total cabina inferior zona indefinida|cabin_pressure_kpa|<=|34.5|kPa|F|CRITICA_OPERATIVA|Activar protocolo de atmósfera de cabina|Sensor presión certificado|V2 6006: 34.5 kPa < p
Presión total cabina por encima zona indefinida|cabin_pressure_kpa|>|103|kPa|F|CRITICA_OPERATIVA|Aplicar protocolo de presión ambiental|Sensor presión certificado|V2 6006: p ≤103 kPa
Fracción diluyente insuficiente|cabin_diluent_pct|<|30|%|F|ALTA_OPERATIVA|Verificar composición y riesgos asociados|Analizador gas y equipo ECLSS|V2 6002; solo atmósfera nominal
Caída rápida presión (>1 psi) |cabin_pressure_rate_psi_min|>|13.5|psi/min|F|CRITICA_OPERATIVA|Evaluación de despresurización y barotrauma|Instrumentos, fase operativa, delta>1 psi|V2 6007 condicionado a cambio >1 psi
O2 inspirado de cabina baja como referencia histórica|cabin_pio2_mmhg|<|127|mmHg|F|ALTA_OPERATIVA|Comparar con tabla por duración/atmósfera y activar ECLSS|Analizador O2 y cálculo PIO2|127 es referencia en argumento V2, NO mínimo universal
CO2 media 7 días elevada para modelo cefalea|cabin_ppco2_7d|>=|2.5|mmHg|F|INVESTIGACION|Revisar cefaleas y ventilación, sin estimar riesgo individual|Confirmar serie CO2 cabina|Observación CO2-HA ~49 tripulantes; no es límite regulatorio
''','Control medioambiental; múltiples estaciones, media temporal correcta.','La atmosfera requiere medidas del vehículo además de las obligatorias.','ventana reglamentaria NASA (1 h para CO2)','No usar SpO2 como sustituto de PIO2')
group('Cabina / calidad del hábitat','N02','N','''
Contaminación VOC por encima límite de misión|cabin_voc_flag|==|1|indicador|F|CRITICA_OPERATIVA|Aislar fuente y activar protocolo químico|Analizador VOC y límite misión|V2 6023; umbral depende sustancia
Alarma de calidad agua potable|water_quality_bad|==|1|indicador|F|CRITICA_OPERATIVA|Suspender suministro implicado y activar protocolo|Análisis microbiológico/químico|V2 6026/6046
Oxígeno ambiental fuera de perfil aprobado|cabin_o2_violation|==|1|indicador|F|CRITICA_OPERATIVA|Respuesta ECLSS|Composición atmósfera y fase|Precalculado respecto tabla 6.2-1, no límite universal
Temperatura y humedad fuera de zona aprobada|cabin_thermal_zone_violation|==|1|indicador|F|ALTA_OPERATIVA|Corregir control térmico|Medir T, RH y región poligonal|V2 figura 6.2-2; NO caja rectangular simple
Caudal de ventilación bajo estándar|cabin_ventilation_alarm|==|1|indicador|F|ALTA_OPERATIVA|Verificar zonas estancadas CO2 y sistemas|Instrumento ventilación|Límite propio del programa
Ruido diario supera dosis permitida NASA|noise_dose_pct|>|100|%|A|ALTA_OPERATIVA|Revisión de protección auditiva y fuente sonora|Dosímetro y fórmula NASA V2 6073|D=100 sum Cn/Tn, Tn=480/2^((Ln-85)/3)
Nivel lanzamiento/entrada supera techo ruido|launch_dba|>|105|dBA|A|CRITICA_OPERATIVA|Reducir exposición según protocolo acústico|Dosímetro de oído|V2 6074; no aplica exposiciones impulsivas
Agua potable suministrada por tripulante insuficiente|water_available_L_day|<|2.5|L/día|F|ALTA_OPERATIVA|Corregir provisión y planificación|Inventario de disponibilidad|V2 6109; NO es volumen bebido
''','Seguridad de hábitat; indicadores del vehículo no forman parte del mínimo biométrico.','Condiciones de ingeniería, no enfermedad individual.')
# radiation
group('Radiación / dosimetría','N15','N','''
Exposición efectiva carrera NASA límite|career_effective_mSv|>=|600|mSv|A|CRITICA_OPERATIVA|Escalar al responsable de protección radiológica|Dosimetría NASA Q y exposición acumulada|V1 4030; no interpretar como 3% de cáncer individual
Proyección misión supera carrera 600|career_plus_projected_mSv|>=|600|mSv|P|CRITICA_OPERATIVA|Replanificar exposición prevista|Modelo dosimétrico de misión|Incluir historial de vuelos
Evento partícula solar relevante|solar_particle_alert|==|1|indicador|F|CRITICA_OPERATIVA|Protocolo refugio radiológico|Detector espacial y alarma misión|Sin dosímetro no detectarse por frecuencia cardiaca
Dosis lente 30 días supera límite|lens_30d_mGy_eq|>|1000|mGy-Eq|F|CRITICA_OPERATIVA|Evaluar dosis a órgano con especialista|Dosímetro órgano ponderación RBE|V1 4.8.1 lens 30d
Dosis lente anual supera límite|lens_1y_mGy_eq|>|2000|mGy-Eq|A|CRITICA_OPERATIVA|Reevaluación dosimétrica|Dosímetro órgano|V1 4.8.1 lens 1y
Dosis lente carrera supera límite|lens_career_mGy_eq|>|4000|mGy-Eq|A|CRITICA_OPERATIVA|Replanificar carrera y examen oftalmológico|Dosimetría órgano|V1 4.8.1 lens career
Dosis órganos hematopoyéticos 30 días supera límite|bfo_30d_mGy_eq|>|250|mGy-Eq|F|CRITICA_OPERATIVA|Activar protocolo radiobiológico|Dosimetría específica BFO|V1 4.8.1 BFO
Dosis circulatorio anual supera límite|circ_1y_mGy_eq|>|500|mGy-Eq|A|CRITICA_OPERATIVA|Evaluación cardiocirculatoria de radiación|Dosimetría órgano|V1 4.8.1 circulatorio
Dosis sistema nervioso central carrera supera límite|cns_career_mGy|>|1500|mGy|A|CRITICA_OPERATIVA|Revisión radiológica especializada|Dosimetría tejido; NO mSv|V1 4.8.1 CNS
Dosis CNS alto Z carrera supera límite|cns_z10_career_mGy|>|250|mGy|A|CRITICA_OPERATIVA|Revisar contribución de partículas Z≥10|Detector especializado|V1 4.8.1 CNS Z≥10
''','Los límites protegen tejidos o carrera, no son ecuaciones directas de probabilidad cáncer.','Sólo con dosimetría y condiciones NASA aplicables.')
# EVA / acute
# source N25 for symptom-based experimental, most turned off

group('EVA / descompresión','N25','C','''
Procedimiento prebreathe incumplido|prebreathe_noncompliant|==|1|indicador|F|CRITICA_OPERATIVA|Suspender/protocolizar EVA según controlador|Registro gases, tiempo y procedimiento|No inventar tiempos; DCS requiere proceso EVA
Síntomas compatibles con enfermedad descompresiva|dcs_symptom_flag|==|1|indicador|F|URGENTE|Activar atención por médico de vuelo y protocolo EVA|Examen clínico y evaluación de presiones|No detectable exclusivamente con sensores biométricos
Cambio presión EVA no planificado|eva_pressure_alarm|==|1|indicador|F|CRITICA_OPERATIVA|Abortar operación según procedimiento|Telemetría traje|Seguridad del traje domina triage biométrico
Pérdida integridad traje|eva_suit_integrity_alarm|==|1|indicador|F|CRITICA_OPERATIVA|Procedimiento de emergencia EVA|Diagnóstico sistema de soporte vital|No sustituir ECLSS con SpO2
Exposición O2 EVA no aprobada|eva_o2_alarm|==|1|indicador|F|CRITICA_OPERATIVA|Activar checklist EVA y monitorizar signos|Sensor ppO2 traje|Umbral específico traje/operación
Aumento FC con alarma CO2 traje|eva_co2_alarm|==|1|indicador|F|CRITICA_OPERATIVA|Respuesta sistema CO2 traje|Telemetría traje|Cefalea/taquicardia inespecíficas
''','El protocolo técnico es la fuente principal; señales de desgaste no sustituyen supervisión EVA.','Solo con flag certificado del procedimiento de misión.')
# Human SpO2 and circulation
group('Oxigenación tripulación','N25','C','''
SpO2 crítica sostenida|spo2_2min|<|90|%|A|URGENTE|Verificar oxímetro, oxigenación y condiciones de cabina|Repetir SpO2 validada, explorar PaO2|90% es umbral clínico terrestre orientativo; altitud/atmosfera cambian interpretación
SpO2 moderadamente baja|spo2_5min|<|92|%|A|ALTA|Evaluación clínica y ambiente de cabina|Oxímetro validado y correlación clínica|92% es señal de revisión, no criterio NASA universal
Caída individual SpO2 marcada|spo2_delta_baseline|<=|-4|puntos porcentuales|A|INVESTIGACION|Confirmación instrumental y revisión de cabina|Repetir con sensor validado|Heurística no validada para astronautas
SpO2 baja durante EVA|eva_spo2_2min|<|90|%|F|URGENTE|Activar evaluación de soporte vital y médico de vuelo|Comparar con ppO2 traje y datos presión|Sujeto a curvas y limitaciones oximetría
Hipoxemia clínica concordante cabina|hypoxia_combined_flag|==|1|indicador|F|URGENTE|Evaluar riesgo hipoxia por sistema y fisiología|Medición independiente cabin PIO2 + SpO2|Flag de regla multivar validada por misión
SpO2 sin señal útil|spo2_quality_bad|==|1|indicador|A|CALIDAD|No reportar hipoxemia sin datos; cambiar sensor|Chequeo perfusión y movimiento|La ausencia de medición NO indica normalidad
''','SpO2 no es presión parcial O2 inhalado y puede ocultar hipoxemia.','Cortes 90/92 orientativos clínicos no normativos espaciales.',enabled=True)
# Orthostat
group('Adaptación cardiovascular / ortostatismo','N13','C','''
Ortostatismo clásico descenso sistólica|orth_sbp_drop_3min|>=|20|mmHg|R|ALTA|Evaluar intolerancia ortostática y riesgo de caída|Decúbito 5 min y ortostatismo 3 min|Solo prueba postural controlada
Ortostatismo clásico descenso diastólica|orth_dbp_drop_3min|>=|10|mmHg|R|ALTA|Evaluar intolerancia ortostática y riesgo de caída|Prueba postural según protocolo|No extrapolar variaciones sin registro postura
Presión sistólica muy baja|sbp_confirmed|<|90|mmHg|A|URGENTE|Evaluar perfusión y causas médicas|Tensiómetro validado|En microgravedad cambiar interpretación de postura
Frecuencia elevada en reposo|rest_hr_10min|>|120|lpm|A|ALTA|Evaluar taquicardia sostenida y causas|ECG o sensor validado, contexto ejercicio|FC aislada no identifica arritmia
Frecuencia extremadamente elevada|rest_hr_5min|>|150|lpm|A|URGENTE|Evaluación inmediata clínica/ECG|ECG y verificación artefactos|Alarma de deterioro, no etiqueta FA
Bradicardia marcada en vigilia|awake_hr_5min|<|40|lpm|A|ALTA|Confirmar y evaluar perfusión|ECG, comparar con atleta entrenado|Vigilancia individualizada
Descenso de presión con síncope|syncope_event|==|1|indicador|R|URGENTE|Asegurar protección, evaluación médica inmediata|Observación clínica, ECG y pruebas|Síncope no deducible de FC únicamente
Hipotensión postaterrizaje prolongada|orthostatic_symptom_flag|==|1|indicador|R|ALTA|Intervención rehabilitación/medicina de vuelo|Entrevista + test ortostático|Población espacial con incidencia elevada, no prob individual
''','Reglas de cribado/urgencia; postvuelo requiere supervisión de prueba.','Despegue/aterrizaje g puede afectar lecturas.',window='medición protocolizada')
# BP general

group('Presión y prevención cardiovascular','N18','C','''
Presión elevada categoría AHA|sbp_protocol_mean|>=|120|mmHg|P|SEGUIMIENTO|Revisar factores cardiovasculares y promedios|2 visitas y mediciones válidas|Valorar diastólica, contexto de prevención
Hipertensión estadio 1 por sistólica|sbp_protocol_mean|>=|130|mmHg|P|CONSULTA|Evaluar hipertensión y riesgo cardiovascular|PA validada≥2 ocasiones|Se necesita límite superior 139 para categoría exclusiva
Hipertensión estadio 2 por sistólica|sbp_protocol_mean|>=|140|mmHg|P|CONSULTA|Revisar selección/recertificación médica|PA confirmada|Límite AHA general, no automáticamente descalificación
Hipertensión estadio 1 por diastólica|dbp_protocol_mean|>=|80|mmHg|P|CONSULTA|Evaluar hipertensión|Medición confirmada|Puede ser estadio 2 si ≥90
Hipertensión estadio 2 por diastólica|dbp_protocol_mean|>=|90|mmHg|P|CONSULTA|Control de riesgo cardiovascular|Medición confirmada|Valor AHA, no hipertensión por smartwatch
Hipertensión severa sistólica|sbp_confirmed|>=|180|mmHg|A|URGENTE|Medir daño de órgano, evaluación urgente|Repetir y valorar síntomas/órganos|No clasificar automáticamente emergencia hipertensiva
Hipertensión severa diastólica|dbp_confirmed|>=|120|mmHg|A|URGENTE|Valorar daño agudo de órgano|Repetir con dispositivo clínico|Urgencia depende del daño, no número solo
Riesgo cardiovascular PREVENT faltan predictores|prevent_missing_predictors|==|1|indicador|P|NO_CALCULABLE|Abstenerse y solicitar lípidos/antecedentes|Predictores requeridos|No reemplazar por etnia ni CGM
''','La presión cuffless sin validación no satisface clasificación clínica.','Prevención pre misión y seguimiento, no etiqueta de aptitud automática.')
# NASA VTE documented 2026, points via score engine separate

group('Trombosis yugular / VTE','N03','C','''
Ecografía yugular estasis velocidad|ijv_peak_velocity_cm_s|<|10|cm/s|F|ALTA|Revisión riesgo VTE por médico de vuelo|Ultrasonido yugular protocolizado|NASA 2026 +4 puntos, pero no probabilidad
Ecografía flujo retrógrado|ijv_retrograde|==|1|indicador|F|ALTA|Evaluar estasis VTE con cirugía/hematología espacial|Doppler ecografía bilateral|NASA 2026 +4, NO doble contar estasis
Dímero D aumento respecto basal en vuelo|d_dimer_inflight_change_pct|>|60|%|F|ALTA|Valorar algoritmo VTE y causas del cambio|Dos ensayos comparables|NASA 2026 +2; no usar nivel terrestre sin basal
Puntuación VTE NASA ≥2|nasa_vte_score|>=|2|puntos|A|CONSULTA|Derivar a evaluación y monitorización intensificada|Score calculado con campos suficientes|No asignar categoría si faltan factores
Puntuación VTE NASA ≥4|nasa_vte_score|>=|4|puntos|A|ALTA|Valoración inmediata por médico de vuelo|Recalcular y confirmar ecografía|NASA propone profilaxis para 4-6: software NO prescribe
Puntuación VTE NASA >6|nasa_vte_score|>|6|puntos|A|URGENTE|Valoración clínica especializada VTE|Ecografía, equipo médico y riesgos hemorrágicos|Evitar decisiones automáticas anticoagulantes
Trombo yugular demostrado por ecografía|ijv_thrombus_confirmed|==|1|indicador|F|URGENTE|Aplicar protocolo VTE y protección operativo|Especialista/ultrasonido interpretado|No inferir por frecuencia cardiaca o SpO2
Edema facial asimétrico nuevo|facial_swelling_new|==|1|indicador|F|ALTA|Priorizar evaluación vascular si síntomas|Exploración y ultrasonido|No discriminar edema fisiológico por microgravedad
''','Propuesta NASA julio 2026; puntos no equivalen a proporción de VTE.','Requiere factores hematológicos opcionales y ecografía.',window='ecografía protocolizada o score validado')
# SANS

group('Neuro-ocular SANS','N04','C','''
OCT edema subclínico clase A|oct_trt_change_um|>=|20|µm|F|ALTA|Evaluación neuro-oftalmológica SANS|OCT mismo instrumento y protocolo|Consenso 2026 clase A; no detectar por FC/PA
OCT edema clase B|oct_trt_change_um|>=|55|µm|F|URGENTE|Evaluación oftalmológica reforzada|OCT y examen; considerar plan postvuelo|Clase B; no hacer punción lumbar por software
Frisén ≥1|frisen_grade|>=|1|grado|F|ALTA|Evaluación SANS y seguimiento|Fondo ojo por especialista|Tabla 2 2026 clase B
Cambio hipermetrópico refractivo|hyperopic_shift_diopter|>|0.5|dioptrías|F|CONSULTA|Considerar revisión refractiva y OCT|Refracción pre/post calibrada|SANS clase A, si no usa lentes tipo compatible
Pliegues coroideos|choroidal_fold_flag|==|1|indicador|F|ALTA|Evaluar deformación retiniana|OCT/fundoscopia|No detectables con sensor corporal
Aplanamiento globo ocular|globe_flattening_flag|==|1|indicador|F|ALTA|Valoración SANS y MRI|MRI u otra imagen validada|Manifestación anatómica, no biometría común
Campo visual alterado|visual_field_loss_flag|==|1|indicador|F|URGENTE|Evaluación ocular urgente|Campimetría formal|No suponer SANS único diferencial
Antecedente SANS previo|prior_sans_flag|==|1|indicador|P|CONSULTA|Planificar vigilancia ocular individual|Historia y examenes previos|Consenso 2026 vigilancia de recurrencia
OCT ausente en vuelo prolongado|oct_unavailable_flag|==|1|indicador|F|NO_CALCULABLE|Reportar imposibilidad monitorizar SANS|Verificar equipamiento/agenda|Datos obligatorios NO detectan SANS
''','OCT complementario imprescindible; los marcadores vitales no identifican SANS.','Criterios de tabla 2 para equipo OCT especificado.',window='respecto basal pre-vuelo, mismo protocolo')
# skeletal muscle, bone

group('Hueso / densitometría','N01','N','''
BMD cadera bajo 95% basal|hip_bmd_ratio|<|0.95|ratio|A|CONSULTA|Revisar contramedidas óseas|DXA comparable en dos momentos|V1 4027 cadera
BMD columna bajo 95% basal|spine_bmd_ratio|<|0.95|ratio|A|CONSULTA|Revisar contramedidas óseas|DXA mismo protocolo|V1 4027 columna
BMD cuello femoral bajo 90% basal|femneck_bmd_ratio|<|0.9|ratio|A|ALTA|Evaluar pérdida ósea relevante|DXA|V1 4027 cuello femoral
T-score DXA osteoporosis|dxa_t_score|<=|-2.5|DE|P|CONSULTA|Evaluar metabolismo óseo|DXA e interpretación por edad/sexo|Corte terrestre solo poblaciones apropiadas
T-score DXA osteopenia|dxa_t_score|<|-1|DE|P|SEGUIMIENTO|Evaluación de salud ósea|DXA y edad aplicable|Evitar T-score osteoporosis en premenopáusicas sin contexto
Marca hipercalciuria por laboratorio|urine_hypercalciuria_flag|==|1|indicador|F|CONSULTA|Evaluar pérdida ósea y riesgo litiasis|Calcio urinario 24 h|Corte depende de referencia de laboratorio
Interrupción prolongada programa resistencia|resistance_exercise_nonadherence|==|1|indicador|F|SEGUIMIENTO|Revisión contramedidas físicas|Registro ejercicio|Riesgo no cuantificado sin DXA
''','BMD no inferible desde peso ni cintura; % cambio exige DXA pre/post.','95% /90% son parámetros desempeño NASA, no diagnósticos osteopenia.')
group('Músculo / fuerza','N01','N','''
Fuerza global bajo 80% basal|strength_ratio|<|0.8|ratio|F|CONSULTA|Revisar entrenamiento fuerza|Dinamometría protocolizada|V1 4024
Fuerza tren inferior bajo 80% basal|lower_body_strength_ratio|<|0.8|ratio|F|CONSULTA|Evaluar contramedidas piernas|Prueba funcional validada|V1 4024 aplicado a región (derivación)
Fuerza tren superior bajo 80% basal|upper_body_strength_ratio|<|0.8|ratio|F|CONSULTA|Ajustar resistencia|Prueba estandarizada|V1 4024 derivación regional
Prevuelo deadlift bajo mínimo 1.0 masa|deadlift_bodymass_ratio|<|1|ratio|P|CONSULTA|Revisar preparación funcional|1RM estimado/medido aprobado|V1 4023 mínimo dependiendo operación
EVA microgravedad deadlift bajo 1.3 masa|deadlift_bodymass_ratio|<|1.3|ratio|P|CONSULTA|Revisar entrenamiento EVA|Técnica certificada|Tabla 4.6-1; no decisión aptitud automática
EVA superficie deadlift bajo 1.6 masa|deadlift_bodymass_ratio|<|1.6|ratio|P|CONSULTA|Revisar capacidad EVA superficial|Prueba protocolizada|Tabla 4.6-1
Prevuelo bench press bajo 0.7 masa|bench_bodymass_ratio|<|0.7|ratio|P|CONSULTA|Revisar fuerza tren superior|Medición estandarizada|Tabla 4.6-1 mínimo
EVA superficie bench press bajo 1.0 masa|bench_bodymass_ratio|<|1|ratio|P|CONSULTA|Revisar función EVA|Prueba protocolizada|Tabla 4.6-1 EVA superficial
''','Las fuerzas requieren pruebas específicas; datos antropométricos no miden fuerza.','Ratios de masa no son % riesgo fractura.')
group('Capacidad aeróbica','N01','N','''
VO2max por debajo estándar EVA microgravedad|vo2max_ml_kg_min|<|32.9|mL/kg/min|F|ALTA|Evaluar capacidad física para EVA|Ergoespirometría o modelo autorizado|V1 4001
VO2max por debajo estándar EVA superficial|vo2max_ml_kg_min|<|36.5|mL/kg/min|F|ALTA|Evaluar demanda operativa EVA superficial|Prueba adecuada al tipo de EVA|V1 4002
VO2max menor 80% basal|vo2max_ratio|<|0.8|ratio|F|CONSULTA|Revisar entrenamiento aeróbico|Medidas comparables|V1 4003
VO2max no recuperado postvuelo|vo2max_ratio|<|1|ratio|R|SEGUIMIENTO|Plan reacondicionamiento aeróbico|Prueba longitudinal|V1 4004 objetivo basal, no incapacidad individual
Omisión de evaluación aeróbica|vo2max_missing|==|1|indicador|F|NO_CALCULABLE|Informar falta métrica crítica EVA|Calendario examen|VO2 no inferible fiablemente a partir de HR aislada
''','Estas reglas monitorizan desempeño, no pronostican enfermedad cardiovascular.','VO2max derivado de wearable no equivale sin validación.')
# renal fluid

group('Riñón / litiasis / hidratación','N08','C','''
Diuresis 24h muy baja|urine_ml_day|<|500|mL/día|A|URGENTE|Evaluar oliguria y función renal|Medición orina y consulta clínica|Corte orientativo extremo; no personalización automática
Diuresis baja peso ajustado|urine_ml_kg_h_6h|<|0.5|mL/kg/h|A|ALTA|Revisar hidratación y lesión renal aguda|Balance y creatinina seriada|KDIGO AKI criterio duración 6h, regla derivada
Volumen orina insuficiente prevención litiasis|urine_l_24h|<|2|L/día|A|SEGUIMIENTO|Evaluar hidratación y química urinaria|Balance 24 h|Objetivo terrestre orientativo; no NASA universal
Hipercalciuria laboratorio|urine_calcium_flag|==|1|indicador|A|CONSULTA|Valoración química orina y pérdida ósea|Química orina 24h|Interpretación laboratorio|No traducir a probabilidad directa
Sobresaturación oxalato cálcico alta|urine_caox_risk_flag|==|1|indicador|A|CONSULTA|Revisar riesgo formación litiasis|Química urinaria certificada|No asignar incidencia personalizada
Piedra detectada ecografía|kidney_stone_ultrasound|==|1|indicador|A|ALTA|Evaluación de litiasis espacial|Ecografía o imagen|Si obstrucción/infección elevar emergencia
Creatinina ascenso agudo significativo|creatinine_48h_delta|>=|0.3|mg/dL|A|ALTA|Evaluar lesión renal aguda|Analítica repetida, balance|Criterio KDIGO AKI temporal
Creatinina ≥1.5 basal 7d|creatinine_7d_ratio|>=|1.5|ratio|A|ALTA|Evaluar lesión renal aguda|Creatinina basal verificable|Criterio AKI y duración
ERC eGFR bajo|egfr|<|60|mL/min/1.73 m2|A|CONSULTA|Verificar persistencia y albuminuria|Analítica >3 meses para ERC|No diagnosticar ERC con medida única
Albuminuria ACR A2|urine_acr_mg_g|>=|30|mg/g|A|CONSULTA|Seguimiento renal|ACR repetido|No interpretar sin persistencia
Albuminuria ACR A3|urine_acr_mg_g|>=|300|mg/g|A|ALTA|Evaluación renal prioritaria|ACR validado|Control de causa y riesgo
''','No confundir ingesta disponible con balance hídrico ni diuresis, riesgo calculi no derivable de peso.','En microgravedad cambian compartimentos de líquidos.',window='rango indicado en nombre / confirmación temporal')
# nutrition

group('Nutrición / metabolismo','N01','N','''
Ingesta energética por debajo requerimiento individual|energy_intake_ratio|<|1|ratio|F|SEGUIMIENTO|Revisar ración, balance y carga de trabajo|Diario alimentario + necesidad individual|V1 4020 debe proveer 100% requerimiento
Ingesta proteína por debajo requerimiento|protein_intake_ratio|<|1|ratio|F|SEGUIMIENTO|Revisión nutricionista|Necesidad individual y registro|No usar 0.8g/kg universal como objetivo astronauta
Masa corporal reducción 5% basal|mass_ratio_preflight|<|0.95|ratio|F|CONSULTA|Evaluar balance energético y líquidos|Medición de masa calibrada; revisar agua|Heurística umbral derivado, NO fuente V1 literal
Masa corporal reducción 10% basal|mass_ratio_preflight|<|0.9|ratio|F|ALTA|Evaluación de pérdida de masa|Balance y composición corporal|Umbral exploratorio; condicionada a fluidos
Vitamina D 25OH baja laboratorio|vitd_25oh_ng_ml|<|20|ng/mL|A|CONSULTA|Interpretar metabolismo óseo y nutrición|Laboratorio y guía especialista|Umbral terrestre frecuente, variaciones guías
Calcio sérico alto|serum_calcium_corrected|>|10.5|mg/dL|A|CONSULTA|Evaluar hipercalcemia/riñón|Calcio corregido albúmina o ionizado|Referencias locales distintas
Calcio sérico bajo|serum_calcium_corrected|<|8.5|mg/dL|A|CONSULTA|Evaluar calcio/PTH/vit D|Albúmina y calcio iónico|Valores laboratorio dependientes
Sodio sérico bajo|sodium_mmol_l|<|135|mmol/L|A|ALTA|Evaluar disnatremia y balance hídrico|Analítica confirmada|Contexto síntomas/velocidad cambio
Sodio sérico críticamente bajo|sodium_mmol_l|<|120|mmol/L|A|URGENTE|Evaluación clínica urgente|Repetir y valoración sintomática|Corte general, no corrección automática
Sodio sérico alto|sodium_mmol_l|>|145|mmol/L|A|ALTA|Evaluación de agua libre y pérdidas|Analítica válida|No atribuir automáticamente a deshidratación
Potasio alto|potassium_mmol_l|>=|6|mmol/L|A|URGENTE|Revisar ECG y causas|Descartar hemólisis muestra|Arritmia potencialmente grave
Potasio bajo|potassium_mmol_l|<|3|mmol/L|A|ALTA|Evaluar electrolitos y ECG|Repetir laboratorio|Riesgo neuromuscular/cardiaco
''','Solo los índices ratio de ingesta a necesidad tienen interpretación NASA directa; resto clínica general y exploratorio.','Valores de laboratorio dependen métodos; no indicar dosis/suplementos automáticos.')
# hematic

group('Hematología / hemólisis','N14','O','''
Hb disminución >10% basal|hemoglobin_ratio_baseline|<|0.9|ratio|A|CONSULTA|Estudiar anemia y efecto fluidos|Hemograma seriado y reticulocitos|Heurística, 54% hemólisis NASA NO 54% Hb
Hematocrito reducción >10% basal|hematocrit_ratio_baseline|<|0.9|ratio|A|SEGUIMIENTO|Evaluar anemia vs hemodilución|Hemograma y líquidos|Heurística analítica no diagnóstica
Reticulocitos elevados laboratorio|reticulocyte_high_flag|==|1|indicador|A|CONSULTA|Explorar hemólisis/recuperación hematopoyética|Reticulocitos, LDH, bilirrubina, haptoglobina|No cuantifica hemólisis espacial
LDH elevada laboratorio|ldh_high_flag|==|1|indicador|A|CONSULTA|Complementar estudio de hemólisis|Hemograma y frotis|Inespecífico (ejercicio/tejido)
Bilirrubina indirecta elevada|indirect_bili_high_flag|==|1|indicador|A|CONSULTA|Evaluar hemólisis/hígado|Panel hepático, haptoglobina|No concluyente sin más pruebas
Plaquetas muy bajas|platelets_10e9_l|<|50|10^9/L|A|URGENTE|Evaluar sangrado/citopenia|Hemograma confirmatorio|Corte clínico general
Neutropenia grave|anc_10e9_l|<|0.5|10^9/L|A|URGENTE|Protección frente a infección y evaluación|Hemograma diferencial|Específico si medición hematológica disponible
Fiebre con neutropenia grave|febrile_neutropenia_flag|==|1|indicador|A|URGENTE|Emergencia infecciosa y protocolo clínico|Temperatura y ANC|Requiere variables múltiples verificadas
''','Hemólisis 54% es promedio CO endógeno en 14 astronautas no factor individual constante.','Riesgo basal y el cambio dependen adaptación y tratamientos.',enabled=True)
group('Inmunidad / infección','N10','C','''
Fiebre corporal confirmada|core_temp_c|>=|38|°C|A|CONSULTA|Evaluar infección/exposición térmica|Termómetro clínico y contexto|No sepsis sin signos clínicos
Hipotermia corporal|core_temp_c|<|35|°C|A|URGENTE|Evaluación de hipotermia|Termómetro fiable core|Puede ser fallo sensor
Fiebre alta|core_temp_c|>=|39|°C|A|ALTA|Evaluación médica prioritaria|Confirmar temperatura y otros signos|No hay pathogen identification
Patógeno PCR positivo|pcr_pathogen_positive|==|1|indicador|F|CONSULTA|Distinguir excreción asintomática de enfermedad|PCR y clínica|Reactivación EBV/VZV no implica enfermedad
CRP notablemente elevada|crp_mg_l|>=|100|mg/L|A|ALTA|Valoración de inflamación/infección|Analítica, clínica y otros biomarcadores|Umbral orientativo, no identifica agente
Leucocitosis|wbc_10e9_l|>|11|10^9/L|A|CONSULTA|Correlación clínico-laboratorial|Hemograma|Puede elevar por estrés ejercicio
Leucopenia|wbc_10e9_l|<|4|10^9/L|A|CONSULTA|Evaluar médula/infección|Hemograma diferencial|No inferir inmunodeficiencia
Neutropenia moderada|anc_10e9_l|<|1|10^9/L|A|ALTA|Revisar riesgo infeccioso|Repetir hemograma|Contexto del individuo
''','Los indicadores vitales no revelan agentes infecciosos ni disfunción inmune completa.','Sepsis requiere evaluación clínica; no use qSOFA de sustituto validado.')
# glucose
group('Glucosa / CGM','N17','C','''
Hipoglucemia intersticial leve|cgm_mg_dl|<|70|mg/dL|A|ALTA|Confirmar y seguir protocolo de glucosa baja|Sensor CGM más glucosa capilar si discordancia|No diagnosticar hipoglucemia con sensor defectuoso
Hipoglucemia intersticial profunda|cgm_mg_dl|<|54|mg/dL|A|URGENTE|Revisión inmediata de glucosa y asistencia|Confirmar si es posible sin retrasar atención|ADA nivel 2
Hiperglucemia intersticial|cgm_mg_dl|>|180|mg/dL|A|SEGUIMIENTO|Revisar exposición glucémica y comida/estrés|CGM calidad, contexto|CGM aislado NO diagnostica diabetes
Hiperglucemia intersticial notable|cgm_mg_dl|>|250|mg/dL|A|ALTA|Evaluar estado metabólico y causas|Glucosa clínica, cetonas cuando indicada|Corte TAR2, no diagnostica DKA
Tiempo bajo 70 sobre meta|cgm_tbr70_pct|>=|4|%|A|CONSULTA|Revisar manejo glucémico en persona con diabetes|CGM ≥14 días y 70% activo|Meta en diabetes, NO general para población sana
Tiempo bajo 54 sobre meta|cgm_tbr54_pct|>=|1|%|A|CONSULTA|Revisar hipoglucemia grave repetida|CGM con duración válida|No predice probabilidad de evento
Tiempo 70-180 bajo objetivo|cgm_tir_pct|<|70|%|A|CONSULTA|Revisar control en diabetes|CGM 14 días/70% cobertura|No diagnosticar diabetes por TIR
Tiempo alto 180 elevado|cgm_tar180_pct|>=|25|%|A|CONSULTA|Evaluar hiperglucemia en diabetes|CGM validado|Meta ADA general en diabetes
CV glucosa alto|cgm_cv_pct|>|36|%|A|CONSULTA|Evaluar alta variabilidad y seguridad|CGM duracion calidad|Objetivo ADA CV≤36% diabetes
HbA1c clínica diagnóstica|hba1c_pct|>=|6.5|%|P|CONSULTA|Solicitar confirmación de diabetes|HbA1c laboratorio y repetición según contexto|No aplicar a CGM ni anemia sin considerarla
''','ADA 2026 CGM métricas aplican a personas con diabetes; clasificación para astronautas sin diabetes es investigación.','Separar sensores intersticial y plasma.',window='CGM ≥14 días y ≥70% datos para métricas agregadas')
# sleep, psych cognition

group('Sueño / cronobiología','N24','C','''
Sueño promedio muy corto|sleep_hours_7d|<|6|h/día|F|CONSULTA|Revisión fatiga y cronograma|Actigrafía o registro sueño calibrado|Umbral de seguridad propuesto; no corte específico NASA
Sueño promedio <7 horas|sleep_hours_7d|<|7|h/día|F|SEGUIMIENTO|Revisar oportunidad de sueño|Diario y actigrafía|Duración recomendada terrestre; no diagnose insomnio
Desfase circadiano elevado|circadian_misalignment_flag|==|1|indicador|F|SEGUIMIENTO|Evaluación de luz y turnos|Actigrafía + luz + horarios|Sin datos luz no inferir desfase
Periodos sueño irregulares|sleep_variability_flag|==|1|indicador|F|INVESTIGACION|Revisar diario y cronograma|Registro continuo|Regla cualitativa precomputada por investigación
PVT lapsos mayores basal|pvt_lapse_high_flag|==|1|indicador|F|ALTA|Revisar desempeño y fatiga|Psychomotor Vigilance Test|Sin test PVT, frecuencia cardiaca no equivalente
Sobrecarga trabajo crítico|workload_alarm|==|1|indicador|F|ALTA|Replanificar turno/descanso|Registro fatiga certificado|Señal operacional, no trastorno mental
Sueño insuficiente con tarea crítica|sleep_critical_task_flag|==|1|indicador|F|ALTA|Evaluación fatiga antes operación|Regla de seguridad con tarea y sueño|No suspensión automática sin protocolo
''','Sueño y fatiga deben medirse con actigrafía, diarios o pruebas, no deducirse de FC/HRV.','7 horas referencia terrestre.',window='promedios 7 días cuando indica')
group('Psicosocial / conducta','N24','H','''
Autorreporte deterioro psicológico|psych_selfreport_flag|==|1|indicador|F|CONSULTA|Ofrecer evaluación confidencial profesional|Entrevista individual validada|NO diagnóstico psiquiátrico desde biometría
Cambio rendimiento cognitivo|cognitive_change_flag|==|1|indicador|F|CONSULTA|Evaluar atención, sueño, estrés y otros factores|Prueba cognitiva estandarizada|No inferir enfermedad mental con HRV
Riesgo equipo por conflicto informado|team_conflict_flag|==|1|indicador|F|CONSULTA|Mediación y soporte del programa|Registro voluntario y contextual|No inferir condición individual sin autorización
HRV baja respecto basal|hrv_low_flag|==|1|indicador|F|INVESTIGACION|Analizar sueño/estrés/actividad sin diagnóstico|Control condiciones HRV y respiración|Señal inespecífica experimental
''','Evaluación psicosocial voluntaria protegida, nunca criterio automatizado sancionador.','No asignar riesgo de suicidio basado en biometría.',enabled=False)
# reproduc

group('Reproducción / hormonas','N20','O','''
Fase ovulatoria no aplicable o inobservable|cycle_phase_unavailable|==|1|indicador|A|NO_CALCULABLE|Marcar no aplicable sin inferir enfermedad|Confirmar contexto ciclo/supresión|Uso anticoncepción, menopausia o desconocido
Embarazo confirmado en contexto misión|pregnancy_test_positive|==|1|indicador|A|ALTA|Evaluación obstétrica confidencial y plan de exposición|Prueba confirmatoria médica|Riesgo radiación/operación, no inferir por ciclo
Terapia hormonal con riesgo trombótico relevante|high_risk_hormone_use|==|1|indicador|A|CONSULTA|Incluir en NASA VTE score|Historia medicamentos voluntaria|No asignar riesgo por fase menstrual
Amenorrea no explicada|amenorrhea_flag|==|1|indicador|A|CONSULTA|Evaluación endocrino-reproductiva|Historia ciclo/medicación/embarazo|No obligar prueba indiscriminada
Disfunción tiroidea TSH elevada|tsh_high_flag|==|1|indicador|A|CONSULTA|Solicitar T4 libre y valoración|Perfil hormonal|No interpretar solo fase ciclo
TSH baja laboratorio|tsh_low_flag|==|1|indicador|A|CONSULTA|Valorar T4L/T3, medicación|Perfil hormonal|No diagnosticar hipertiroidismo sin T4L
Alteración progesterona según fase|progesterone_phase_abnormal_flag|==|1|indicador|A|INVESTIGACION|Verificar día/ovulación y tratamiento hormonal|Ensayo hormonal con fase real|Investigación reproductiva espacial limitada
''','Los estudios humanos son pocos; la fase no determina diagnósticos ni aumenta automáticamente score VTE.','Consentimiento/privacidad reforzados.',enabled=True)
# sensorimotor

group('Sensorimotor / retorno','N11','O','''
Prueba equilibrio fuera basal|balance_test_abnormal|==|1|indicador|R|CONSULTA|Programa rehabilitación vestibular|Prueba de equilibrio objetiva|No estimable con HR aislada
Marcha anormal tras aterrizaje|gait_test_abnormal|==|1|indicador|R|ALTA|Prevenir caídas y rehabilitación|Prueba marcha y observación clínica|Riesgo frecuente tras microgravedad
Desorientación espacial notificada|spatial_disorientation_flag|==|1|indicador|F|ALTA|Suspender tareas sensibles hasta evaluación|Examen sensorimotor|Moción espacial no identificada solo por vitales
Náuseas/mareo movimiento|motion_sickness_flag|==|1|indicador|F|CONSULTA|Valoración por médico de vuelo|Síntomas y signos|No inventar probabilidad de cinetosis
Caída registrada|fall_event|==|1|indicador|R|URGENTE|Explorar lesión y supervisión|Registro de caída|Prevenir fractura por pérdida mineral ósea
Test coordinación mano-ojo alterado|coordination_deficit_flag|==|1|indicador|F|CONSULTA|Evaluar tareas y entrenamiento|Prueba función manual|Datos biométricos no sustituyen prueba funcional
''','Los tests sensorimotores son opcionales adicionales; ausencia obliga abstención.','No se inferirá de frecuencia cardíaca.')
# emergency miscellanies

group('Temperatura / fisiología térmica','N02','C','''
Temperatura corporal muy alta|core_temp_c|>=|40|°C|A|URGENTE|Evaluación inmediata por posible hipertermia|Termómetro core y contexto|No diagnóstico golpe calor sin signos
Temperatura alta con exposición termal|heat_stress_flag|==|1|indicador|F|ALTA|Revisar carga térmica y humedad|Índice térmico medido por misión|No inferir ambiente con T corporal
Descenso temperatura corporal|core_temp_c|<|36|°C|A|SEGUIMIENTO|Verificar patrón y sensores|Medición fiable|Puede ser variación basal si no clínica
Pérdida de fluidos durante EVA|eva_dehydration_flag|==|1|indicador|F|ALTA|Revisar refrigeración e hidratación|Balance/masa y dispositivo EVA|Heurística dependiente equipo
''','Normas atmósfera no establecen un único corte temperatura corporal.','Sensores térmicos cutáneos no equivalen a centrales.')
# anatomy and procedural

group('Controles de calidad y abstención','N21','Q','''
Presión sin manguito no validada|bp_cuffless_unvalidated|==|1|indicador|A|NO_CALCULABLE|No emitir clasificación hipertensión|Validación calibración vs manguito|Regla de seguridad de datos
CGM sensor con calidad insuficiente|cgm_quality_bad|==|1|indicador|A|NO_CALCULABLE|No calcular CGM clínico|Integridad serie y tiempo activo|No imputar cero
Masa medida como peso gravitacional sin corrección|microgravity_weight_invalid|==|1|indicador|F|NO_CALCULABLE|No calcular cambio masa|Equipo masa inercial calibrado|Peso en N no masa kg
SpO2 posible artefacto|spo2_artifact|==|1|indicador|A|NO_CALCULABLE|No usar SpO2 para diagnóstico|Movimiento, perfusión, pigmentación y sensor|Oximetría sesgada
Faltan datos de ambiente cabina|cabin_data_missing|==|1|indicador|F|NO_CALCULABLE|No estimar hipoxia/CO2 exposición con vitales|Telemetría ECLSS|Un astronauta con SpO2 normal puede estar expuesto a CO2
Faltan datos OCT|oct_unavailable_flag|==|1|indicador|F|NO_CALCULABLE|No descartar SANS|OCT y examen oftalmológico|No sustituir con HR
Faltan datos radiación dosimetría|dosimetry_missing|==|1|indicador|F|NO_CALCULABLE|No calcular dosis ionizante|Dosimetría validada|FC/PA no detectan radiación
Faltan predictores VTE score|vte_score_missing|==|1|indicador|A|NO_CALCULABLE|No presentar puntos como completos|Historia/US/dímero-D|No sumar ceros en factores desconocidos
Fase misión indefinida|mission_phase_unknown|==|1|indicador|A|NO_CALCULABLE|No activar reglas específicas fase|Control de misión|Fases P/F/R son distintas
Sensor sin calibración|sensor_uncalibrated|==|1|indicador|A|NO_CALCULABLE|Inhabilitar criterio dependiente del sensor|Control metrológico|La señal fuera de rango puede ser falla
''','La abstención explícita es requisito de seguridad y validez científica.','No convertir NA en lectura normal.')
# additional rare / various

group('Riesgos raros / no identificables','N10','Q','''
Falta ecografía para trombosis yugular|ijv_ultrasound_missing|==|1|indicador|F|NO_CALCULABLE|No descartar trombosis venosa|Solicitar ultrasonido cuando clínicamente indicado|Trombosis puede ser asintomática
Falta DXA para remodelación ósea|dxa_missing|==|1|indicador|R|NO_CALCULABLE|No cuantificar pérdida ósea|DXA pre/post|Cintura y masa no miden BMD
Falta audiometría para ototoxicidad acústica|audiometry_missing|==|1|indicador|R|NO_CALCULABLE|No descartar pérdida auditiva|Audiometría|FC/SpO2 no identifican daño auditivo
Falta evaluación neurocognitiva|cognitive_test_missing|==|1|indicador|F|NO_CALCULABLE|No diagnosticar cambios cognitivos|Pruebas específicas|HRV inespecífica
Falta evaluación de equilibrio|balance_test_missing|==|1|indicador|R|NO_CALCULABLE|No puntuar deterioro vestibular|Sensorimotor validado|Microrgavidad altera equilibrio
''','Separa riesgos no observables de ausencia de enfermedad; ninguna lectura los descarta.','Estado NOT_OBSERVABLE no es falso.')
# More critical variants explicit microgravity and mission

group('Monitorización de tendencias','N11','H','''
FC reposo aumento relativo ≥20% de basal|rest_hr_baseline_ratio|>=|1.2|ratio|F|INVESTIGACION|Revisar estrés fisiológico, ejercicio y sueño|Basal representativo en fase comparable|Heurística exploratoria no diagnóstico
HRV caída relativa ≥30%|hrv_baseline_ratio|<=|0.7|ratio|F|INVESTIGACION|Verificar medidas autonómicas y sueño|Mismo algoritmo HRV y hora circadiana|No interpretarse como enfermedad
PA media aumento relativo≥10%|map_baseline_ratio|>=|1.1|ratio|F|INVESTIGACION|Verificar PA, hidratación y fase|Dispositivo de PA validado|No norma NASA
SpO2 caída 3 puntos basal|spo2_delta_baseline|<=|-3|puntos|F|INVESTIGACION|Validar sensor y ambiente|Calidad oxímetro|Cambio clínico requiere contexto
Masa corporal caida ≥3% basal|mass_ratio_preflight|<|0.97|ratio|F|INVESTIGACION|Revisar líquidos/ingesta|Medición masa inercial|Heurística con elevada confusión
Coeficiente variación HR reposo anómalo|hr_cv_high_flag|==|1|indicador|F|INVESTIGACION|Evaluar artefactos y variabilidad|Ventana 7 días y control actividad|Sin umbral validado
Cambio presión basal postvuelo|postflight_map_change_flag|==|1|indicador|R|INVESTIGACION|Reevaluar compensación ortostática|Medidas posición|No convertir a diagnóstico de hipotensión
''','Solo investigación; todas las reglas con porcentajes arbitrarios se deshabilitan y no tienen riesgo probabilístico.','Requerir pruebas prospectivas.',enabled=False)
# Prevent air vs human event more derived NASA norms
group('Riesgos clínicos habituales con impacto espacial','N21','C','''
Compromiso hemodinámico compuesto|hemodynamic_critical_flag|==|1|indicador|A|URGENTE|Aplicar evaluación ABC y perfusión|Regla multivariada clínica evaluada|Fiebre + hipotensión etc no identifican sepsis
Taquiarritmia ECG confirmada|ecg_arrhythmia_flag|==|1|indicador|A|ALTA|Interpretación ECG y telemedicina|ECG 1+ derivaciones|PPG no diagnostica FA
Dolor torácico informado|chest_pain_flag|==|1|indicador|A|URGENTE|Evaluación cardiopulmonar|Historia ECG troponina si disponible|Wearable no descarta síndrome coronario
Signos neurológicos focales|stroke_symptom_flag|==|1|indicador|A|URGENTE|Activar protocolo neurológico|Exploración FAST/neuro; imagen si posible|No detectables solo por tensión
Sospecha reacción anafiláctica|anaphylaxis_symptom_flag|==|1|indicador|A|URGENTE|Activar protocolos de emergencia|Evaluación síntomas y soporte vital|SpO2 FC no hacen diagnóstico
Glucosa con cetonemia elevada|ketone_high_flag|==|1|indicador|A|URGENTE|Evaluación acidosis y metabolismo|Cetonas, pH/electrolitos|No diagnosticar DKA solo con CGM
''','Emergencias de alta severidad con datos adicionales/síntomas; no suponer que son obligatorios.','Estandar médico general adaptado por Flight Surgeon.')
# more domain sound, heart, sleep, cognition optional
group('Exposición acústica / audición','N26','C','''
Audiometría cambio umbral clínico|audiometric_shift_flag|==|1|indicador|R|CONSULTA|Evaluación audiológica|Audiometría pre/post estándar|No infiere de HR
Acúfeno nuevo|tinnitus_new_flag|==|1|indicador|F|CONSULTA|Evaluar exposición sonora y oído|Entrevista y audiometría|Síntoma no presente en datos obligatorios
Dosímetro acústico alto|noise_dose_pct|>=|100|%|F|ALTA_OPERATIVA|Mitigar exposición según misión|Dosimetría dBA|V2 Rev F 6073|Ruido protegido de casco debe evaluarse en oído
''','Requiere dosímetro/audiometría externos.','Riesgo ambiental no probabilidad de hipoacusia.')
# Spaceflight radiation standards not observable through standard biomedical wearables.
group('Radiación / límites complementarios','N01','N','''
SPE dosis de referencia de diseño excede máximo|spe_reference_effective_mSv|>=|250|mSv|P|CRITICA_OPERATIVA|Reevaluar refugio y blindaje de diseño|Simulación SPE NASA V1 4031|Requisito DE DISEÑO, no dosis persona
Aporte de tecnología nuclear anual sobre límite|nuclear_technology_mSv_year|>=|20|mSv/año|F|CRITICA_OPERATIVA|Reconfigurar blindaje nuclear|Dosimetría atribuible reactor V1 4032|No mezclar con radiación espacial natural
GCR espacio libre tasa arriba límite diseño|gcr_free_space_mSv_day|>=|1.3|mSv/día|P|CRITICA_OPERATIVA|Revisar blindaje GCR de hábitat|Modelo GCR NASA 4033|Solo diseño hábitat misiones >60 días
GCR superficie planetaria tasa arriba límite diseño|gcr_surface_mSv_day|>=|0.9|mSv/día|P|CRITICA_OPERATIVA|Revisar blindaje hábitat en superficie|Modelo GCR V1 4033|Solo misiones >60 días
Dosis circulatoria 30 días sobre límite|circ_30d_mGy_eq|>|250|mGy-Eq|F|CRITICA_OPERATIVA|Revisar protección tejido circulatorio|Dosimetría en arterias y miocardio|V1 Tabla 4.8-1
Dosis circulatoria carrera sobre límite|circ_career_mGy_eq|>|1000|mGy-Eq|P|CRITICA_OPERATIVA|Reevaluar exposición ocupacional acumulada|Dosimetría tejido|V1 Tabla 4.8-1
Dosis CNS 30 días sobre límite|cns_30d_mGy|>|500|mGy|F|CRITICA_OPERATIVA|Protocolo radiológico SNC|Dosimetría hipocampo|V1 Tabla 4.8-1
Dosis CNS anual sobre límite|cns_1y_mGy|>|1000|mGy|F|CRITICA_OPERATIVA|Revisar dosis SNC|Dosimetría hipocampo|V1 Tabla 4.8-1
Dosis CNS partículas Z>=10 anual|cns_z10_1y_mGy|>|100|mGy|F|CRITICA_OPERATIVA|Reevaluación blindaje contra alta Z|Dosimetría específica partículas|V1 Tabla 4.8-1
Dosis piel 30 días supera máximo|skin_30d_mGy_eq|>|1500|mGy-Eq|F|CRITICA_OPERATIVA|Revisar dosimetría cutánea|Dosímetro y RBE piel|V1 Tabla 4.8-1
Dosis piel un año supera máximo|skin_1y_mGy_eq|>|3000|mGy-Eq|F|CRITICA_OPERATIVA|Revisar dosimetría cutánea anual|Dosímetro y RBE|V1 Tabla 4.8-1
Dosis piel carrera supera máximo|skin_career_mGy_eq|>|6000|mGy-Eq|P|CRITICA_OPERATIVA|Reevaluar exposición de carrera|Dosimetría piel|V1 Tabla 4.8-1
''','Separar límites de DISEÑO, efectos no cáncer y límite de carrera; unidades mSv/mGy/mGy-Eq no son intercambiables.','Requiere dosimetría, modelo de blindaje y escenario definido. Valor normativo NASA, no diagnóstico.')
# Source classification: an association with NASA pages does NOT make an invented terrestrial threshold a NASA standard.
for r in RULES:
 if r['id'] in {'SP-0007','SP-0075','SP-0076','SP-0077','SP-0078','SP-0103','SP-0104','SP-0105','SP-0106','SP-0107','SP-0108','SP-0109','SP-0110','SP-0111','SP-0112','SP-0113','SP-0114'}:
  r['evidencia']='D'
  r['limites'] += ' ADVERTENCIA: umbral terrestre/operativo derivado, NO norma NASA directa.'
  if r['id'] in {'SP-0007','SP-0105','SP-0106'}:r['habilitada']=False
 if r['variable'] in {'rest_hr_10min','rest_hr_5min','awake_hr_5min','spo2_2min','spo2_5min','eva_spo2_2min','crp_mg_l','serum_calcium_corrected','sodium_mmol_l','potassium_mmol_l','urine_l_24h'}:
  r['evidencia']='D'
  r['limites'] += ' Uso orientativo de clínica terrestre: no umbral NASA específico y requiere contexto.'
 if r['variable'] in {'launch_dba'}:
  r['requisitos_contexto']={'fase_mision':['launch','entry'],'unidad':'dBA al oído'}
 if r['variable']=='cabin_pressure_rate_psi_min':r['requisitos_contexto']={'delta_presion_psi':'>1'}
 if r['variable'] in {'gcr_free_space_mSv_day','gcr_surface_mSv_day'}:r['requisitos_contexto']={'duracion_habitat_dias':'>60','tipo':'verificacion_diseño'}
 if r['variable'] in {'vo2max_ml_kg_min'}:r['requisitos_contexto']={'requiere_perfil_eva':True}
 if r['variable'] in {'dxa_t_score','kidney_stone_ultrasound'}:r['requisitos_contexto']={'evaluacion_medica_individual':True}
 if r['dominio'].startswith('Radiación'):r['cuantificacion']='CUMPLIMIENTO_NORMA_NO_RIESGO_%'

# filter/triage special clinical recommendations
# IMPORTANT: reclass empirical arbitrary threshold rule by known source; this modifies audit flags not metadata primary.
for r in RULES:
 r['observabilidad']='OBLIGATORIA' if r['variable'] in {'core_temp_c','spo2_2min','spo2_5min','cgm_mg_dl','rest_hr_10min','rest_hr_5min','awake_hr_5min','sbp_confirmed','dbp_confirmed','spo2_delta_baseline','rest_hr_baseline_ratio','hrv_baseline_ratio','map_baseline_ratio','mass_ratio_preflight','weight_kg','height_m','age_years'} else 'DERIVADA_U_OPCIONAL'
 if r['variable'].endswith('_flag') or r['variable'].endswith('_alarm') or r['variable'].endswith('_missing') or r['variable'].endswith('_bad') or r['variable'].endswith('_invalid') or r['variable'].endswith('_positive'):r['observabilidad']='OPCIONAL_FLAG_VALIDADO' if r['evidencia']!='H' else 'INVESTIGACION'
 if r['evidencia']=='H':r['habilitada']=False
 if r['prioridad']=='INVESTIGACION':r['habilitada']=False
 if 'heurístic' in r['limites'].lower() or 'explorator' in r['limites'].lower():r['habilitada']=False
 if r['prioridad'] in ['NO_CALCULABLE','CALIDAD']:r['cuantificacion']='ABSTENCION'
 if r['evidencia']=='N':r['cuantificacion']='CUMPLIMIENTO_NORMA' if r['prioridad'].endswith('OPERATIVA') or r['dominio'].startswith(('Radiación','Hueso','Músculo','Capacidad')) else 'CRITERIO'
 if r['dominio'].startswith('Trombosis'):r['cuantificacion']='SCORE_NO_PROBABILIDAD'
 if r['dominio'].startswith('Neuro-ocular'):r['cuantificacion']='CAMBIO_ANATOMICO_NO_PROBABILIDAD'
 if r['dominio'].startswith('Cabina'):r['cuantificacion']='EXPOSICION_NO_PROBABILIDAD'

# Machine-readable mission phase is required for every phase-limited space rule.
# "A" applies at any phase; pre/in/post are mutually exclusive unless mission explicitly marks a transition.
for r in RULES:
 if r['fase'] in {'P','F','R'}:
  r['requisitos_contexto']['mission_phase']={'P':'PREFLIGHT','F':'INFLIGHT','R':'POSTFLIGHT'}[r['fase']]
 r['requisitos_contexto']['must_have_valid_measurement']=r['variable']
 r['requisitos_contexto']['abort_if_missing']=True

# Optional extras for time windows; quality and requirements
INVENTORY=[
('age_years','años','OBLIGATORIA','estatura no define edad','Prevuelo'),('height_m','m','OBLIGATORIA','Adulto medir tierra','Prevuelo'),('mass_kg','kg','OBLIGATORIA','En órbita usar instrumento masa inercial, no peso','Prevuelo/órbita'),('core_temp_c','°C','OBLIGATORIA','Central vs cutánea deben distinguirse','Continua o periódica'),('ethnic_background_self_report','categoría','OBLIGATORIA','No usar como proxy causal ni predictor a ciegas','Declarativa'),('cycle_phase','categoría/no aplica','CONDICIONAL','No forzar a quien no menstrúa ni usar si se suprime','Declarativa'),('body_measurements','cm','OBLIGATORIA','Cambios cefálicos fluidos afectan cinturas','Semanal'),('hr_series','lpm','OBLIGATORIA','ECG o PPG según hardware; comprobar movimiento','Continua'),('bp_series','mmHg','OBLIGATORIA','Solo usable si presión clínicamente validada','Continua'),('cgm_series','mg/dL','OBLIGATORIA','Intersticial no diagnóstica','Continua'),('spo2_series','%','OBLIGATORIA','Perfusión/pigmentación/calibración','Continua')]
EXTRAS=[('mission_phase','P/F/R','ESENCIAL_MISION','Preflight/inflight/postflight'),('mission_day','día','ESENCIAL_MISION','Inicio 1'),('mission_duration_days','días','ESENCIAL_MISION','Prevista vs real'),('gravity_g','g','ESENCIAL_MISION','micro/1/6/0.38/1'),('eva_phase','fase','ESENCIAL_MISION','EVA preparación/salida/retorno'),('cabin_pressure_kpa','kPa','AMBIENTAL_OPCIONAL','NASA 6.2'),('cabin_ppco2_1h','mmHg','AMBIENTAL_OPCIONAL','Media móvil 1h'),('cabin_ppco2_7d','mmHg','AMBIENTAL_OPCIONAL','Media 7d'),('cabin_pio2_mmhg','mmHg','AMBIENTAL_OPCIONAL','Oxígeno inspirado no SpO2'),('cabin_diluent_pct','%','AMBIENTAL_OPCIONAL','Fracción gas inerte'),('noise_dose_pct','%','AMBIENTAL_OPCIONAL','Fórmula NASA/NIOSH'),('career_effective_mSv','mSv','DOSIMETRIA','Riesgo a largo plazo'),('lens_30d_mGy_eq','mGy-Eq','DOSIMETRIA','Lente'),('cns_z10_career_mGy','mGy','DOSIMETRIA','Partículas Z≥10'),('ijv_peak_velocity_cm_s','cm/s','ECOGRAFIA','Doppler yugular'),('ijv_retrograde','0/1','ECOGRAFIA','Dirección flujo'),('ijv_thrombus_confirmed','0/1','ECOGRAFIA','Diagnóstico ecográfico'),('d_dimer_inflight_change_pct','%','ANALITICA','Comparar con basal en vuelo'),('oct_trt_change_um','µm','OFTALMOLOGIA','Spectralis, mismo protocolo'),('frisen_grade','grado','OFTALMOLOGIA','Fondo ojo'),('hyperopic_shift_diopter','D','OFTALMOLOGIA','Refracción'),('hip_bmd_ratio','ratio','DXA','Pre/post misión'),('femneck_bmd_ratio','ratio','DXA','No inferible de masa'),('vo2max_ml_kg_min','mL/kg/min','FITNESS','Ergoespirometría'),('strength_ratio','ratio','FITNESS','Prueba fuerza'),('urine_l_24h','L','ORINA','Volumen total'),('urine_acr_mg_g','mg/g','ORINA','Alb/creatinina'),('egfr','mL/min/1.73m2','ANALITICA','Requiere creatinina/cistatina'),('hemoglobin_ratio_baseline','ratio','HEMOGRAMA','Hb pre-in/post'),('anc_10e9_l','10^9/L','HEMOGRAMA','Neutrófilos'),('sleep_hours_7d','h/día','SUEÑO','Actigrafía'),('pvt_lapse_high_flag','0/1','COGNICION','Test PVT'),('balance_test_abnormal','0/1','SENSORIMOTOR','Equilibrio'),('prevent_missing_predictors','0/1','MODELO','Controles de modelo'),('nasa_vte_score','puntos','MODELO','Score por NASA 2026'),('pregnancy_test_positive','0/1','REPRODUCTIVO','Consentimiento y pruebas'),('high_risk_hormone_use','0/1','ANTECEDENTE','Hormona y VTE')]
seen={x[0] for x in INVENTORY}
for name,unit,typ,desc in EXTRAS:
 if name not in seen: INVENTORY.append((name,unit,typ,desc,'Según indicación'))
 seen.add(name)
for r in RULES:
 if r['variable'] not in seen:
  INVENTORY.append((r['variable'],r['unidad'],'DERIVADA_U_OPCIONAL','Revisar fuente primaria y calibración; no asumir disponible','Según regla'))
  seen.add(r['variable'])
# Source quotes (one <= 25 words per source; avoid large literal copyrighted paragraphs)
QUOTES={
'N01':('4.6.2 [V1 4024]','Countermeasures shall maintain in-mission skeletal muscle strength at or above 80% of baseline values.'),
'N02':('6.2.1.3 [V2 6004]','The system shall limit the average one-hour CO2 partial pressure (ppCO2) in the habitable volume to no more than 3 mmHg.'),
'N03':('Tabla VTE NASA 2026 p.4','1 point = no additional action'),
'N04':('Tabla 2 SANS','≥20 µm average increase in peripapillary total retinal thickness'),
'N05':('Spaceflight VTE','Spaceflight Venous Thrombosis (SVT) refers to a phenomenon experienced during spaceflight'),
'N06':('Estudio JAMA resultados','Stagnant or reverse flow in the IJV was observed in 6 crew members'),
'N07':('CO2 Induced Headaches','19 of the 49 astronauts reported experiencing headaches'),
'N08':('Executive summary','Spaceflight is associated with many factors which may promote kidney stone formation'),
'N09':('Five Hazards','space radiation, isolation and confinement, distance from Earth, gravity'),
'N10':('Listado NASA de riesgos','Concern of Venous Thromboembolism'),
'N11':('Standard Measures','a standardized set of measurements across multiple body systems'),
'N12':('Highlights','Post-spaceflight orthostatic intolerance affects approximately 30% of astronauts.'),
'N13':('Definition','20 mm Hg or more systolic or 10 mm Hg or more diastolic within three minutes'),
'N14':('Results','CO elimination in space over 6 months (average of 46 measures) was increased 54%'),
'N15':('V1 4030','An individual crewmember’s total career effective radiation dose due to spaceflight radiation exposure shall be less than 600 mSv.'),
'N16':('Bone','roughly 1% less dense'),
'N17':('Table 6.2','TIR 70–180 mg/dL'),
'N18':('classification','stage 1 hypertension as 130 to 139 mm Hg systolic or 80 to 89 mm Hg diastolic'),
'N19':('KDIGO chronicity','duration of a minimum of 3 months'),
'N20':('Review','only 16 studies were found during the literature search'),
'N21':('NASA standards','Applicability and tailoring of Standards are determined based on each program’s mission profile'),
'N22':('Review hypercalciuria','Hypercalciuria, that is the increase in urinary calcium, is a well-established feature'),
'N23':('Cardiovascular and vision','approximately 2 liters of fluid move from the lower to the upper body'),
'N24':('Risk sleep NASA','Risk of Inadequate Sleep and Irregular Schedules'),
'N25':('NASA DCS','risk of mild hypoxia'),
'N26':('Risk of hearing loss','Noise exposure in spaceflight can negatively impact hearing'),
'N27':('V2 water','provide the capability to monitor water quality'),
'N28':('Human Risk Board','the starting point for causal diagramming of spaceflight-related risk issues'),
'N29':('Conclusions','stasis in the left internal jugular vein (IJV)'),
'N30':('Sleep','Adults need 7 or more hours of sleep per night.'),
'N31':('Post Mission','Post-mission reconditioning shall be aimed at returning to baseline muscle strength.'),
'N32':('V1 4029','All crewmember radiation exposures shall be minimized using the ALARA principle.'),
'N33':('Menstruation','hormonal menstrual suppression has become the preferred method'),
'N34':('NASA Glenn','Astronauts are at an increased risk of developing a renal stone'),
'N35':('NASA Standard Measures','sleep reports, fluid samples to examine diet and nutrition'),
'N36':('WHO anemia','Haemoglobin cutoffs to define anaemia in individuals and populations'),
'N37':('NASA V2','The system shall alert the crew locally and remotely when atmospheric parameters'),
'N38':('FDA','Pulse oximeters have limitations and a risk of inaccuracy under certain circumstances.'),
'N39':('NASA acoustic formula','a 3 dB exchange rate'),
'N40':('NASA VTE score','2-3 points = increased monitoring'),
}
# labels for quote literal+ editorial note, exact if known, can remove if uncertainty.
for sid,(loc,quote) in QUOTES.items():
 assert len(quote.split())<=24,(sid,quote)

# 20 preexisting conditions and 20 permanent sequelae, NOT automatic risk multipliers
history=[('Hipertensión','P/A','Validar PA, tratamientos y contraindicaciones; no cambiar umbral NASA','N18'),('Diabetes','P/A','Priorizar hipoglucemia y CGM; acceso a insulina; confirmar por plasma','N17'),('Enfermedad renal crónica','P/A','eGFR y ACR, litiasis; riesgos por hidratación y fármacos','N19'),('Litiasis renal previa','P/F','Evaluar 24h orina, ecografía y balance; recurrencia potencial','N08'),('Osteoporosis / baja DMO','P/R','DXA y fractura; contramedidas microgravedad','N01'),('Enfermedad cardiovascular','P/A','ECG/ECO y fitness; evaluación Flight Surgeon','N23'),('Arritmia documentada','P/A','ECG, frecuencia y antiarrítmicos con protocolo','N21'),('TEV / trombosis previa','P/A','Riesgo VTE; investigar familia, ecografía, anticoagulantes','N03'),('Trombofilia hereditaria','P/A','Score VTE NASA 2026; confirmación diagnóstico','N03'),('Migraña recurrente','F','Diferencial de cefalea por CO2, SANS, presión','N07'),('Glaucoma','P/F','Oftalmo reforzada SANS; sensibilidad a cambios visuales','N04'),('Apnea sueño','P/F','Actigrafía no diagnostica; polisomnografía si indicada','N24'),('Asma','P/F','Revisar oxigenación, exposición partículas y plan','N25'),('Anemia crónica','P/R','Serie Hb/reticulocitos, hemólisis y fierro','N14'),('Trastorno tiroideo','P/F','TSH/T4L según clínica, medicamentos y fase','N20'),('Trastorno autoinmune','P/F','Inflamación y terapia; evaluación inmunológica','N10'),('Infecciones recurrentes','P/F','Exposiciones, cultivo y estado inmune','N10'),('Trastornos equilibrio vestibular','P/R','Mayor vigilancia sensorimotora','N11'),('Depresión/ansiedad conocida','P/F','Apoyo confidencial, no clasificación desde HRV','N24'),('Trastorno reproductivo/hormonal','P/F','Ciclo contextual y riesgos trombóticos si hormonas','N20')]
sequela=[('Trombosis yugular residual','F','Ultrasonido detallado y seguimiento por Flight Surgeon','N03'),('Disminución permanente agudeza visual','P/F','OCT/campos visuales y comparabilidad SANS','N04'),('Lesión irreversible retina','P/F','Modificación del plan neuro-oftálmico','N04'),('Catarata previa','P/R','Considerar dosimetría lente y oftalmo','N15'),('Fractura fragilidad consolidada','P/F','DXA y prevención de nuevas fracturas','N01'),('Pérdida masa ósea postmisión previa','P/F','Comparar DXA longitudinal y ejercicio','N16'),('Debilidad muscular residual','P/R','Fuerza funcional y desempeño misión','N01'),('Limitación cardiorrespiratoria persistente','P/R','VO2max y umbrales EVA','N01'),('Déficit vestibular permanente','P/R','Pruebas equilibrio y plan de reacondicionamiento','N11'),('Hipoacusia permanente','P/F','Audiometría pre/post y comunicaciones','N26'),('Insuficiencia renal crónica residual','P/F','eGFR/ACR y nefrotoxicidad','N19'),('Riñón único','P/F','Balance riñón y riesgos litiasis','N08'),('Prótesis articular','P/F','Fuerza, estabilidad y tareas EVA','N01'),('Secuela neurológica focal','P/F','Prueba neurológica y coordinación','N11'),('Secuela tromboembólica pulmonar','P/F','Función pulmonar y oxigenación validada','N03'),('Disautonomía ortostática crónica','P/R','Protocolo ortostático, caídas','N13'),('Daño hepático crónico','P/F','Laboratorio, medicaciones y nutrición','N22'),('Cicatrices extensas quemaduras','P/F','Control térmico y ajuste traje','N02'),('Inmunodeficiencia persistente','P/F','Prevención infecciones y respuesta inmune','N10'),('Esterilidad o falla gonadal documentada','P/F','Evitar inferencias ovulación; hormonas según tratamiento','N20')]

# write files
with (OUT/'reglas_espaciales.json').open('w',encoding='utf8') as f:json.dump({'version':'1.0','actualizado':'2026-11-14','n_reglas':len(RULES),'disclaimer':'Investigación, no dispositivo clínico; norma NASA no es probabilidad enfermedad.','reglas':RULES,'fuentes':allsources},f,ensure_ascii=False,indent=2)
fields=list(RULES[0]);
with (OUT/'reglas_espaciales.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows([{k:json.dumps(v,ensure_ascii=False) if isinstance(v,(dict,list)) else v for k,v in r.items()} for r in RULES])
with (OUT/'diccionario_variables.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.writer(f);w.writerow(['variable','unidad','disponibilidad','notas_de_calidad','periodicidad']);w.writerows(INVENTORY)
with (LIT/'FUENTES.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.DictWriter(f,fieldnames=SOURCE_FIELDS);w.writeheader();w.writerows(allsources)
with (LIT/'EXTRACTOS_BREVES_Y_ANOTACIONES.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.writer(f);w.writerow(['id','titulo','año','localizador','cita_literal_breve','url','valoracion','uso_en_motor','limitacion']);
 used_source_url=set()
 for sid,(loc,quote) in QUOTES.items():
  title,yr,loc0,url,cav=S[sid]
  if url in used_source_url:quote=''
  used_source_url.add(url); n=sum(r['fuente_id']==sid for r in RULES)
  w.writerow([sid,title,yr,loc,quote,url,f'Fuente {sid}: {cav}',f'{n} reglas relacionadas; consultar cada ficha','Frase <25 palabras de fuente; el criterio completo requiere revisión fuente original'])
with (ANT/'ANTECEDENTES_Y_SECUELAS.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.writer(f);w.writerow(['tipo','antecedente','fases','modificacion_plan','fuente']);w.writerows([('ENFERMEDAD',*x) for x in history]);w.writerows([('SECUELA',*x) for x in sequela])
# Extended markdown notes/fiches
with (LIT/'FICHAS_TRAZABILIDAD_TODAS_REGLAS.md').open('w',encoding='utf8') as f:
 f.write('# Fichas anotadas del catálogo espacial\n\n**No equivalen a reglas diagnósticas validadas.** Para un mismo umbral se distingue norma NASA, criterio terrestre, observación y heurística.\n\n')
 for r in RULES:
  f.write(f"## {r['id']} · {r['nombre']}\n\n- **Dominio / fase:** {r['dominio']} / {r['fase']}. **Evidencia:** {r['evidencia']}. **Estado:** {'HABILITADA PARA REVISIÓN, NO CLÍNICA' if r['habilitada'] else 'DESACTIVADA / EXPERIMENTAL'}.\n- **Disparador medible:** `{r['variable']} {r['comparador']} {r['umbral']}` {r['unidad']}; **ventana:** {r['ventana']}.\n- **Acción propuesta:** {r['accion']} ({r['prioridad']}).\n- **Confirmación:** {r['confirmacion']}.\n- **Razonamiento:** {r['justificacion']}\n- **Alcance y límites:** {r['alcance']} {r['limites']}\n- **Alternativa o abstención:** {r['alternativa']}\n- **Cantidad de riesgo:** {r['cuantificacion']}. No es probabilidad clínica salvo modelo calibrado explícito.\n- **Referencia:** {r['fuente_id']} — [{S[r['fuente_id']][0]}]({r['url']}); localizador: {S[r['fuente_id']][2]}.\n\n")

stats={'reglas':len(RULES),'dominios':dict(collections.Counter(r['dominio'] for r in RULES)),'evidencia':dict(collections.Counter(r['evidencia'] for r in RULES)),'activas':sum(r['habilitada'] for r in RULES),'inactivas':sum(not r['habilitada'] for r in RULES),'fuentes':len(S),'extractos':len(QUOTES),'variables':len(INVENTORY),'antecedentes_enfermedades':len(history),'secuelas':len(sequela),'cuantificaciones':dict(collections.Counter(r['cuantificacion'] for r in RULES))}
(VAL/'METRICAS_INVENTARIO.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(stats,ensure_ascii=False,indent=2))
