/* Nombre clínico de cada variable del catálogo del motor. En pantalla nunca aparece el identificador interno. */
(function () {
  const E = {
    // cabina y hábitat
    cabin_ppco2_1h: "ppCO₂ de cabina, media de 1 h", cabin_pressure_kpa: "Presión total de cabina", cabin_diluent_pct: "Gas diluyente en la atmósfera de cabina", cabin_pressure_rate_psi_min: "Velocidad de cambio de la presión de cabina",
    cabin_pio2_mmhg: "Presión inspirada de O₂ en cabina", cabin_ppco2_7d: "ppCO₂ de cabina, media de 7 días", cabin_voc_flag: "Compuestos orgánicos volátiles por encima del límite", water_quality_bad: "Alarma de calidad del agua potable",
    cabin_o2_violation: "Oxígeno ambiental fuera del perfil aprobado", cabin_thermal_zone_violation: "Temperatura y humedad fuera de la zona aprobada", cabin_ventilation_alarm: "Caudal de ventilación por debajo del estándar",
    noise_dose_pct: "Dosis diaria de ruido", launch_dba: "Nivel sonoro en lanzamiento o entrada", water_available_L_day: "Agua potable disponible por tripulante",
    // radiación
    career_effective_mSv: "Dosis efectiva de carrera", career_plus_projected_mSv: "Dosis de carrera más la proyectada de la misión", solar_particle_alert: "Evento de partículas solares relevante",
    lens_30d_mGy_eq: "Dosis en cristalino, 30 días", lens_1y_mGy_eq: "Dosis en cristalino, 1 año", lens_career_mGy_eq: "Dosis en cristalino, carrera", bfo_30d_mGy_eq: "Dosis en órganos hematopoyéticos, 30 días",
    circ_1y_mGy_eq: "Dosis en sistema circulatorio, 1 año", circ_30d_mGy_eq: "Dosis en sistema circulatorio, 30 días", circ_career_mGy_eq: "Dosis en sistema circulatorio, carrera",
    cns_career_mGy: "Dosis en sistema nervioso central, carrera", cns_30d_mGy: "Dosis en sistema nervioso central, 30 días", cns_1y_mGy: "Dosis en sistema nervioso central, 1 año",
    cns_z10_career_mGy: "Dosis en SNC por partículas Z ≥ 10, carrera", cns_z10_1y_mGy: "Dosis en SNC por partículas Z ≥ 10, 1 año", skin_30d_mGy_eq: "Dosis en piel, 30 días", skin_1y_mGy_eq: "Dosis en piel, 1 año", skin_career_mGy_eq: "Dosis en piel, carrera",
    spe_reference_effective_mSv: "Dosis efectiva del evento solar de referencia", nuclear_technology_mSv_year: "Dosis anual por tecnología nuclear a bordo", gcr_free_space_mSv_day: "Tasa de rayos cósmicos galácticos en espacio libre", gcr_surface_mSv_day: "Tasa de rayos cósmicos galácticos en superficie",
    // EVA y descompresión
    prebreathe_noncompliant: "Protocolo de prerrespiración incumplido", dcs_symptom_flag: "Síntomas compatibles con enfermedad descompresiva", eva_pressure_alarm: "Cambio de presión no planificado durante EVA",
    eva_suit_integrity_alarm: "Pérdida de integridad del traje", eva_o2_alarm: "Exposición a O₂ no aprobada durante EVA", eva_co2_alarm: "Alarma de CO₂ del traje",
    // oxigenación y cardiovascular
    spo2_2min: "SpO₂, media de 2 min", spo2_5min: "SpO₂, media de 5 min", spo2_delta_baseline: "Cambio de SpO₂ respecto a la basal", eva_spo2_2min: "SpO₂ durante EVA, media de 2 min",
    hypoxia_combined_flag: "Hipoxemia concordante con el ambiente de cabina", spo2_quality_bad: "Señal de SpO₂ sin calidad útil",
    orth_sbp_drop_3min: "Descenso de PA sistólica a los 3 min de bipedestación", orth_dbp_drop_3min: "Descenso de PA diastólica a los 3 min de bipedestación", sbp_confirmed: "PA sistólica confirmada", dbp_confirmed: "PA diastólica confirmada",
    rest_hr_10min: "FC en reposo, media de 10 min", rest_hr_5min: "FC en reposo, media de 5 min", awake_hr_5min: "FC en vigilia, media de 5 min", syncope_event: "Síncope", orthostatic_symptom_flag: "Síntomas ortostáticos tras el aterrizaje",
    sbp_protocol_mean: "PA sistólica, media por protocolo", dbp_protocol_mean: "PA diastólica, media por protocolo", prevent_missing_predictors: "Faltan predictores del riesgo cardiovascular PREVENT",
    // trombosis
    ijv_peak_velocity_cm_s: "Velocidad máxima en la vena yugular interna", ijv_retrograde: "Flujo retrógrado en la vena yugular interna", d_dimer_inflight_change_pct: "Cambio del dímero D respecto a la basal",
    nasa_vte_score: "Puntuación de riesgo tromboembólico NASA", ijv_thrombus_confirmed: "Trombo yugular confirmado por ecografía", facial_swelling_new: "Edema facial asimétrico de nueva aparición",
    // neuro-ocular
    oct_trt_change_um: "Cambio del grosor retiniano total por OCT", frisen_grade: "Edema de papila, grado de Frisén", hyperopic_shift_diopter: "Cambio refractivo hipermetrópico", choroidal_fold_flag: "Pliegues coroideos",
    globe_flattening_flag: "Aplanamiento del globo ocular", visual_field_loss_flag: "Alteración del campo visual", prior_sans_flag: "Antecedente de síndrome neuro-ocular (SANS)", oct_unavailable_flag: "OCT no disponible",
    // hueso, músculo y capacidad aeróbica
    hip_bmd_ratio: "Densidad mineral ósea de cadera respecto a la basal", spine_bmd_ratio: "Densidad mineral ósea de columna respecto a la basal", femneck_bmd_ratio: "Densidad mineral ósea de cuello femoral respecto a la basal",
    dxa_t_score: "T-score por DXA", urine_hypercalciuria_flag: "Hipercalciuria por laboratorio", resistance_exercise_nonadherence: "Interrupción prolongada del ejercicio de resistencia",
    strength_ratio: "Fuerza global respecto a la basal", lower_body_strength_ratio: "Fuerza de tren inferior respecto a la basal", upper_body_strength_ratio: "Fuerza de tren superior respecto a la basal",
    deadlift_bodymass_ratio: "Peso muerto respecto a la masa corporal", bench_bodymass_ratio: "Press de banca respecto a la masa corporal", vo2max_ml_kg_min: "VO₂ máx", vo2max_ratio: "VO₂ máx respecto a la basal", vo2max_missing: "Evaluación aeróbica omitida",
    // riñón
    urine_ml_day: "Diuresis de 24 h", urine_ml_kg_h_6h: "Diuresis ajustada al peso, 6 h", urine_l_24h: "Volumen urinario de 24 h", urine_calcium_flag: "Calcio urinario elevado", urine_caox_risk_flag: "Sobresaturación de oxalato cálcico",
    kidney_stone_ultrasound: "Litiasis renal en ecografía", creatinine_48h_delta: "Aumento de creatinina en 48 h", creatinine_7d_ratio: "Creatinina respecto a la basal, 7 días", egfr: "Filtrado glomerular estimado (CKD-EPI 2021)", urine_acr_mg_g: "Cociente albúmina/creatinina en orina",
    // nutrición, hematología, infección
    energy_intake_ratio: "Ingesta energética respecto al requerimiento", protein_intake_ratio: "Ingesta proteica respecto al requerimiento", mass_ratio_preflight: "Masa corporal respecto al prevuelo", vitd_25oh_ng_ml: "Vitamina D 25-OH",
    serum_calcium_corrected: "Calcio sérico corregido por albúmina", sodium_mmol_l: "Sodio sérico", potassium_mmol_l: "Potasio sérico", hemoglobin_ratio_baseline: "Hemoglobina respecto a la basal", hematocrit_ratio_baseline: "Hematocrito respecto al basal",
    reticulocyte_high_flag: "Reticulocitos elevados", ldh_high_flag: "LDH elevada", indirect_bili_high_flag: "Bilirrubina indirecta elevada", platelets_10e9_l: "Plaquetas", anc_10e9_l: "Neutrófilos absolutos", febrile_neutropenia_flag: "Fiebre con neutropenia grave",
    core_temp_c: "Temperatura corporal central", pcr_pathogen_positive: "PCR positiva para patógeno", crp_mg_l: "Proteína C reactiva", wbc_10e9_l: "Leucocitos",
    // glucosa
    cgm_mg_dl: "Glucosa intersticial", cgm_tbr70_pct: "Tiempo por debajo de 70 mg/dL", cgm_tbr54_pct: "Tiempo por debajo de 54 mg/dL", cgm_tir_pct: "Tiempo en rango 70–180 mg/dL", cgm_tar180_pct: "Tiempo por encima de 180 mg/dL",
    cgm_cv_pct: "Coeficiente de variación de la glucosa", hba1c_pct: "Hemoglobina glucada (HbA1c)",
    // sueño y psicosocial
    sleep_hours_7d: "Sueño medio de 7 días", circadian_misalignment_flag: "Desfase circadiano elevado", sleep_variability_flag: "Horarios de sueño irregulares", pvt_lapse_high_flag: "Lapsos de atención por encima de la basal (PVT)",
    workload_alarm: "Sobrecarga de trabajo crítico", sleep_critical_task_flag: "Sueño insuficiente antes de una tarea crítica", psych_selfreport_flag: "Malestar psicológico autoinformado", cognitive_change_flag: "Cambio del rendimiento cognitivo",
    team_conflict_flag: "Conflicto de equipo informado", hrv_low_flag: "Variabilidad de la FC baja respecto a la basal",
    // reproducción y hormonas
    cycle_phase_unavailable: "Fase del ciclo no disponible o no aplicable", pregnancy_test_positive: "Prueba de embarazo positiva", high_risk_hormone_use: "Terapia hormonal con riesgo trombótico", amenorrhea_flag: "Amenorrea no explicada",
    tsh_high_flag: "TSH elevada", tsh_low_flag: "TSH baja", progesterone_phase_abnormal_flag: "Progesterona fuera del intervalo de su fase",
    // sensorimotor y térmico
    balance_test_abnormal: "Prueba de equilibrio fuera de la basal", gait_test_abnormal: "Marcha anormal tras el aterrizaje", spatial_disorientation_flag: "Desorientación espacial", motion_sickness_flag: "Cinetosis (náuseas o mareo por movimiento)",
    fall_event: "Caída registrada", coordination_deficit_flag: "Coordinación ojo-mano alterada", heat_stress_flag: "Estrés térmico por exposición", eva_dehydration_flag: "Pérdida de líquidos durante EVA",
    // calidad del dato y datos ausentes
    bp_cuffless_unvalidated: "PA sin manguito no validada", cgm_quality_bad: "Sensor de glucosa con calidad insuficiente", microgravity_weight_invalid: "Masa medida como peso gravitacional", spo2_artifact: "Posible artefacto en la SpO₂",
    cabin_data_missing: "Faltan datos del ambiente de cabina", dosimetry_missing: "Faltan datos de dosimetría", vte_score_missing: "Faltan predictores de la puntuación tromboembólica", mission_phase_unknown: "Fase de misión sin definir",
    sensor_uncalibrated: "Sensor sin calibrar", ijv_ultrasound_missing: "Falta la ecografía yugular", dxa_missing: "Falta la densitometría (DXA)", audiometry_missing: "Falta la audiometría", cognitive_test_missing: "Falta la evaluación neurocognitiva",
    balance_test_missing: "Falta la evaluación del equilibrio",
    // tendencias y clínica general
    rest_hr_baseline_ratio: "FC en reposo respecto a la basal", hrv_baseline_ratio: "Variabilidad de la FC respecto a la basal", map_baseline_ratio: "PA media respecto a la basal", hr_cv_high_flag: "Variación anómala de la FC en reposo",
    postflight_map_change_flag: "Cambio de la PA basal tras el vuelo", hemodynamic_critical_flag: "Compromiso hemodinámico", ecg_arrhythmia_flag: "Taquiarritmia confirmada por ECG", chest_pain_flag: "Dolor torácico",
    stroke_symptom_flag: "Signos neurológicos focales", anaphylaxis_symptom_flag: "Sospecha de anafilaxia", ketone_high_flag: "Cetonemia elevada con hiperglucemia", audiometric_shift_flag: "Cambio del umbral auditivo", tinnitus_new_flag: "Acúfeno de nueva aparición",
    // contexto
    mission_phase: "Fase de misión", microgravity_eva: "EVA en microgravedad", surface_eva: "EVA en superficie", launch_entry_phase: "Fase de lanzamiento o entrada", habitat_duration_days: "Días en el hábitat",
    cabin_pressure_delta_psi: "Cambio de la presión de cabina", orthostatic_test_performed: "Prueba ortostática realizada", cgm_days: "Días de registro del sensor de glucosa", cgm_coverage_pct: "Cobertura del sensor de glucosa",
    cabin_ppco2_1h_coverage_pct: "Cobertura de la hora de CO₂", age_years: "Edad", mass_kg: "Masa corporal", estatura_cm: "Estatura", waist_cm: "Cintura", serum_creatinine_mg_dl: "Creatinina sérica", sex_for_formula: "Sexo para las fórmulas",
    bmi: "Índice de masa corporal", whtr: "Índice cintura/estatura", who5: "Índice de bienestar OMS-5"
  };
  const U = { indicador: "", ratio: "× basal", "10^9/L": "×10⁹/L", "mL/min/1.73 m2": "mL/min/1,73 m²", puntos: "puntos", "puntos porcentuales": "puntos", DE: "DE" };
  AH.ETQ = E;
  AH.etq = v => E[v] || String(v).replace(/_/g, " ");
  AH.unidad = u => (u in U ? U[u] : u || "");
  // "spo2_5min < 92 %" -> "SpO₂, media de 5 min < 92 %"; los indicadores "x == 1" se leen "presente"
  AH.humano = function (criterio) {
    const t = String(criterio || ""), i = t.indexOf(" "); if (i < 0) return E[t] || t;
    const v = t.slice(0, i), resto = t.slice(i + 1).replace(/\s*indicador\s*$/, "").replace(/^==\s*1(\.0)?\s*$/, "presente").replace(/^==\s*0(\.0)?\s*$/, "ausente").replace(">=", "≥").replace("<=", "≤").replace(/\s(ratio)$/, "");
    return (E[v] || v.replace(/_/g, " ")) + " " + resto;
  };
})();
