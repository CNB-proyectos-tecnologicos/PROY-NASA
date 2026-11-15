"""Generador de casos SINTÉTICOS para entrenar y probar el ensamble.

QUÉ ES Y QUÉ NO ES
------------------
Los paquetes de investigación no contienen datos de personas y prohíben
inventar prevalencias o distribuciones clínicas (D53, anexo de fórmulas
§5.1). Este módulo NO simula epidemiología. Es un banco de pruebas de
ingeniería (etapa E1 del protocolo):

1. Barre a propósito el espacio de valores a ambos lados de cada umbral del
   catálogo (muestreo de diseño, no frecuencias reales).
2. Calcula el nivel "verdadero" aplicando el catálogo a los valores LATENTES
   de las variables que sí se midieron.
3. Entrega al ensamble la versión OBSERVADA: con ruido de sensor, artefactos
   e indicadores de calidad, y con datos ausentes.

Así el ensamble aprende a reproducir el catálogo cuando la medida es
imperfecta. Las cifras de ruido son SUPUESTOS declarados (tabla abajo) y
deben sustituirse por la especificación real de cada dispositivo.

Lo que NO se aprende: nada sobre enfermedad real. Una variable no medida no
aporta nivel (ausencia de dato no es normalidad ni anormalidad).
"""
from __future__ import annotations

import numpy as np

from . import reglas as R

# ---------------------------------------------------------------------------
# Especificación de variables numéricas
# nombre: (unidad, (fis_lo, fis_hi), (nom_lo, nom_hi), (amp_lo, amp_hi), ruido, grupo)
#   fis    : límites de plausibilidad; fuera de ellos el dato se rechaza
#   nom    : intervalo "sin alerta" usado para el muestreo de diseño
#   amp    : intervalo amplio que cruza los umbrales del catálogo
#   ruido  : desviación típica del error de medida supuesto; número = absoluta,
#            ("rel", x) = proporcional al valor. SUPUESTO, no dato empírico.
# ---------------------------------------------------------------------------
_REL = "rel"
NUM_ESPACIO = {
    # cabina (telemetría del vehículo)
    "cabin_ppco2_1h": ("mmHg", (0, 60), (0.8, 2.6), (0.5, 6.0), 0.10, "cabina"),
    "cabin_pressure_kpa": ("kPa", (0, 200), (56, 102), (25, 110), 0.20, "cabina"),
    "cabin_diluent_pct": ("%", (0, 100), (35, 80), (15, 85), 0.5, "cabina"),
    "cabin_pressure_rate_psi_min": ("psi/min", (0, 100), (0, 2), (0, 25), 0.2, "cabina"),
    "water_available_L_day": ("L/día", (0, 50), (2.7, 4.5), (1.0, 5.0), 0.05, "cabina"),
    "noise_dose_pct": ("%", (0, 5000), (10, 85), (5, 220), 3.0, "acustica"),
    "launch_dba": ("dBA", (0, 200), (80, 102), (75, 115), 1.0, "acustica"),
    # dosimetría
    "career_effective_mSv": ("mSv", (0, 5000), (0, 400), (0, 800), 5, "radiacion"),
    "career_plus_projected_mSv": ("mSv", (0, 5000), (0, 450), (0, 850), 5, "radiacion"),
    "lens_30d_mGy_eq": ("mGy-Eq", (0, 1e5), (0, 400), (0, 1600), 10, "radiacion"),
    "lens_1y_mGy_eq": ("mGy-Eq", (0, 1e5), (0, 900), (0, 3000), 20, "radiacion"),
    "lens_career_mGy_eq": ("mGy-Eq", (0, 1e5), (0, 1800), (0, 6000), 40, "radiacion"),
    "bfo_30d_mGy_eq": ("mGy-Eq", (0, 1e5), (0, 120), (0, 450), 3, "radiacion"),
    "circ_1y_mGy_eq": ("mGy-Eq", (0, 1e5), (0, 220), (0, 800), 5, "radiacion"),
    "cns_career_mGy": ("mGy", (0, 1e5), (0, 700), (0, 2400), 15, "radiacion"),
    "cns_z10_career_mGy": ("mGy", (0, 1e5), (0, 110), (0, 400), 3, "radiacion"),
    "spe_reference_effective_mSv": ("mSv", (0, 1e5), (0, 150), (0, 400), 3, "radiacion2"),
    "nuclear_technology_mSv_year": ("mSv/año", (0, 1e4), (0, 10), (0, 40), 0.3, "radiacion2"),
    "gcr_free_space_mSv_day": ("mSv/día", (0, 100), (0.2, 1.0), (0.2, 2.0), 0.02, "radiacion2"),
    "gcr_surface_mSv_day": ("mSv/día", (0, 100), (0.1, 0.7), (0.1, 1.5), 0.02, "radiacion2"),
    "circ_30d_mGy_eq": ("mGy-Eq", (0, 1e5), (0, 120), (0, 450), 3, "radiacion2"),
    "circ_career_mGy_eq": ("mGy-Eq", (0, 1e5), (0, 450), (0, 1600), 10, "radiacion2"),
    "cns_30d_mGy": ("mGy", (0, 1e5), (0, 220), (0, 800), 5, "radiacion2"),
    "cns_1y_mGy": ("mGy", (0, 1e5), (0, 450), (0, 1600), 10, "radiacion2"),
    "cns_z10_1y_mGy": ("mGy", (0, 1e5), (0, 45), (0, 180), 1, "radiacion2"),
    "skin_30d_mGy_eq": ("mGy-Eq", (0, 1e5), (0, 700), (0, 2400), 15, "radiacion2"),
    "skin_1y_mGy_eq": ("mGy-Eq", (0, 1e5), (0, 1400), (0, 4800), 30, "radiacion2"),
    "skin_career_mGy_eq": ("mGy-Eq", (0, 1e5), (0, 2800), (0, 9500), 60, "radiacion2"),
    # sensores base
    "spo2_2min": ("%", (40, 100), (95, 100), (78, 100), 1.2, "oxigenacion"),
    "spo2_5min": ("%", (40, 100), (95, 100), (78, 100), 1.2, "oxigenacion"),
    "eva_spo2_2min": ("%", (40, 100), (94, 100), (78, 100), 1.5, "eva"),
    "sbp_confirmed": ("mmHg", (40, 330), (100, 135), (70, 210), 4.0, "hemodinamica"),
    "dbp_confirmed": ("mmHg", (20, 200), (60, 85), (40, 135), 3.0, "hemodinamica"),
    "rest_hr_10min": ("lpm", (20, 260), (50, 90), (35, 170), 2.0, "hemodinamica"),
    "rest_hr_5min": ("lpm", (20, 260), (50, 90), (35, 170), 2.0, "hemodinamica"),
    "awake_hr_5min": ("lpm", (20, 260), (50, 90), (32, 170), 2.0, "hemodinamica"),
    "core_temp_c": ("°C", (25, 45), (36.2, 37.5), (33.8, 41.0), 0.15, "temperatura"),
    "cgm_mg_dl": ("mg/dL", (20, 600), (75, 160), (38, 330), (_REL, 0.09), "glucosa"),
    # pruebas y analíticas opcionales
    "orth_sbp_drop_3min": ("mmHg", (-80, 150), (-5, 12), (-5, 45), 3.0, "ortostatismo"),
    "orth_dbp_drop_3min": ("mmHg", (-60, 100), (-4, 6), (-4, 25), 2.0, "ortostatismo"),
    "sbp_protocol_mean": ("mmHg", (40, 330), (100, 119), (95, 165), 3.0, "pa_prevuelo"),
    "dbp_protocol_mean": ("mmHg", (20, 200), (60, 79), (55, 105), 2.0, "pa_prevuelo"),
    "ijv_peak_velocity_cm_s": ("cm/s", (0, 300), (15, 60), (0, 70), 1.5, "vte"),
    "d_dimer_inflight_change_pct": ("%", (-100, 5000), (-20, 40), (-30, 150), 5.0, "vte"),
    "nasa_vte_score": ("puntos", (0, 40), (0, 1), (0, 12), 0, "vte"),
    "oct_trt_change_um": ("µm", (-200, 1000), (-5, 15), (-10, 90), 2.0, "sans"),
    "frisen_grade": ("grado", (0, 5), (0, 0), (0, 3), 0, "sans"),
    "hyperopic_shift_diopter": ("D", (-10, 10), (-0.25, 0.4), (-0.5, 1.5), 0.08, "sans"),
    "hip_bmd_ratio": ("ratio", (0.3, 1.5), (0.96, 1.03), (0.82, 1.05), 0.008, "hueso"),
    "spine_bmd_ratio": ("ratio", (0.3, 1.5), (0.96, 1.03), (0.82, 1.05), 0.008, "hueso"),
    "femneck_bmd_ratio": ("ratio", (0.3, 1.5), (0.92, 1.03), (0.78, 1.05), 0.010, "hueso"),
    "dxa_t_score": ("DE", (-8, 6), (-0.8, 1.5), (-3.8, 2.0), 0.10, "hueso"),
    "strength_ratio": ("ratio", (0.1, 2), (0.85, 1.05), (0.55, 1.10), 0.03, "musculo"),
    "lower_body_strength_ratio": ("ratio", (0.1, 2), (0.85, 1.05), (0.55, 1.10), 0.03, "musculo"),
    "upper_body_strength_ratio": ("ratio", (0.1, 2), (0.85, 1.05), (0.55, 1.10), 0.03, "musculo"),
    "deadlift_bodymass_ratio": ("ratio", (0, 5), (1.65, 2.3), (0.7, 2.4), 0.04, "musculo"),
    "bench_bodymass_ratio": ("ratio", (0, 4), (1.05, 1.5), (0.45, 1.6), 0.03, "musculo"),
    "vo2max_ml_kg_min": ("mL/kg/min", (5, 100), (38, 55), (24, 58), 1.5, "musculo"),
    "vo2max_ratio": ("ratio", (0.1, 2), (1.0, 1.1), (0.6, 1.12), 0.03, "musculo"),
    "urine_l_24h": ("L/día", (0, 20), (2.1, 3.2), (0.2, 3.5), 0.08, "renal"),
    "urine_ml_day": ("mL/día", (0, 20000), (2100, 3200), (200, 3500), 80, "renal"),
    "urine_ml_kg_h_6h": ("mL/kg/h", (0, 20), (0.7, 2.0), (0.1, 2.2), 0.05, "renal"),
    "creatinine_48h_delta": ("mg/dL", (-5, 20), (-0.1, 0.15), (-0.2, 1.2), 0.03, "renal"),
    "creatinine_7d_ratio": ("ratio", (0.1, 20), (0.85, 1.2), (0.8, 3.5), 0.04, "renal"),
    "egfr": ("mL/min/1.73 m2", (1, 200), (70, 120), (20, 125), 4.0, "renal"),
    "urine_acr_mg_g": ("mg/g", (0, 20000), (2, 25), (2, 600), (_REL, 0.08), "renal"),
    "energy_intake_ratio": ("ratio", (0, 3), (1.0, 1.2), (0.5, 1.25), 0.03, "nutricion"),
    "protein_intake_ratio": ("ratio", (0, 3), (1.0, 1.2), (0.5, 1.25), 0.03, "nutricion"),
    "vitd_25oh_ng_ml": ("ng/mL", (1, 200), (24, 55), (8, 60), 1.5, "nutricion"),
    "serum_calcium_corrected": ("mg/dL", (3, 20), (8.8, 10.2), (7.0, 12.5), 0.12, "nutricion"),
    "sodium_mmol_l": ("mmol/L", (90, 200), (136, 144), (112, 158), 1.0, "nutricion"),
    "potassium_mmol_l": ("mmol/L", (1, 10), (3.6, 5.0), (2.2, 7.2), 0.10, "nutricion"),
    "platelets_10e9_l": ("10^9/L", (0, 2000), (160, 380), (8, 420), (_REL, 0.04), "hematologia"),
    "anc_10e9_l": ("10^9/L", (0, 100), (1.8, 7.0), (0.1, 8.0), (_REL, 0.06), "hematologia"),
    "wbc_10e9_l": ("10^9/L", (0, 300), (4.5, 10.5), (1.5, 18), (_REL, 0.04), "hematologia"),
    "crp_mg_l": ("mg/L", (0, 600), (0.2, 8), (0.2, 220), (_REL, 0.08), "hematologia"),
    "cgm_tbr70_pct": ("%", (0, 100), (0, 3), (0, 15), 0.3, "glucosa"),
    "cgm_tbr54_pct": ("%", (0, 100), (0, 0.7), (0, 5), 0.1, "glucosa"),
    "cgm_tir_pct": ("%", (0, 100), (75, 99), (40, 99), 1.5, "glucosa"),
    "cgm_tar180_pct": ("%", (0, 100), (0, 20), (0, 55), 1.5, "glucosa"),
    "cgm_cv_pct": ("%", (0, 100), (14, 33), (12, 52), 1.0, "glucosa"),
    "hba1c_pct": ("%", (3, 20), (4.6, 5.9), (4.5, 9.0), 0.10, "glucosa"),
    "sleep_hours_7d": ("h/día", (0, 16), (7.1, 8.5), (3.5, 9.0), 0.2, "sueno"),
}

FLAGS_ESPACIO = {
    "cabina": ["cabin_voc_flag", "water_quality_bad", "cabin_o2_violation",
               "cabin_thermal_zone_violation", "cabin_ventilation_alarm"],
    "acustica": ["audiometric_shift_flag", "tinnitus_new_flag"],
    "radiacion": ["solar_particle_alert"],
    "eva": ["prebreathe_noncompliant", "dcs_symptom_flag", "eva_pressure_alarm",
            "eva_suit_integrity_alarm", "eva_o2_alarm", "eva_co2_alarm", "heat_stress_flag"],
    "oxigenacion": ["hypoxia_combined_flag"],
    "hemodinamica": ["hemodynamic_critical_flag", "ecg_arrhythmia_flag", "chest_pain_flag",
                     "stroke_symptom_flag", "anaphylaxis_symptom_flag"],
    "ortostatismo": ["syncope_event", "orthostatic_symptom_flag"],
    "vte": ["ijv_retrograde", "ijv_thrombus_confirmed", "facial_swelling_new", "high_risk_hormone_use"],
    "sans": ["choroidal_fold_flag", "globe_flattening_flag", "visual_field_loss_flag", "prior_sans_flag"],
    "hueso": ["urine_hypercalciuria_flag", "resistance_exercise_nonadherence"],
    "renal": ["urine_calcium_flag", "urine_caox_risk_flag", "kidney_stone_ultrasound"],
    "hematologia": ["reticulocyte_high_flag", "ldh_high_flag", "indirect_bili_high_flag",
                    "febrile_neutropenia_flag", "pcr_pathogen_positive"],
    "glucosa": ["ketone_high_flag"],
    "sueno": ["circadian_misalignment_flag", "pvt_lapse_high_flag", "workload_alarm",
              "sleep_critical_task_flag"],
    "reproductivo": ["pregnancy_test_positive", "amenorrhea_flag", "tsh_high_flag", "tsh_low_flag"],
    "sensorimotor": ["balance_test_abnormal", "gait_test_abnormal", "spatial_disorientation_flag",
                     "motion_sickness_flag", "fall_event", "coordination_deficit_flag"],
}
# Indicadores de calidad / abstención (evidencia Q): no aportan nivel
CALIDAD_ESPACIO = ["spo2_quality_bad", "spo2_artifact", "bp_cuffless_unvalidated", "cgm_quality_bad",
                   "microgravity_weight_invalid", "sensor_uncalibrated", "cabin_data_missing",
                   "dosimetry_missing", "vte_score_missing", "mission_phase_unknown",
                   "ijv_ultrasound_missing", "dxa_missing", "audiometry_missing",
                   "cognitive_test_missing", "balance_test_missing", "oct_unavailable_flag",
                   "vo2max_missing", "cycle_phase_unavailable", "prevent_missing_predictors"]
CONTEXTO_ESPACIO = ["mission_phase", "microgravity_eva", "surface_eva", "launch_entry_phase",
                    "habitat_duration_days", "cabin_pressure_delta_psi", "orthostatic_test_performed",
                    "cgm_days", "cgm_coverage_pct", "cabin_ppco2_1h_coverage_pct"]

NUM_TIERRA = {
    "age_years": ("años", (0, 120), (18, 85), (18, 85), 0, "demografia"),
    "bmi": ("kg/m2", (8, 90), (19, 24.9), (15, 48), 0.3, "antropometria"),
    "whtr": ("ratio", (0.2, 1.2), (0.40, 0.49), (0.36, 0.75), 0.01, "antropometria"),
    "weight_gain_3d_kg": ("kg", (-20, 20), (-0.8, 1.2), (-1.0, 4.5), 0.15, "antropometria"),
    "core_temp_c": ("°C", (25, 45), (36.2, 37.5), (33.8, 41.0), 0.15, "temperatura"),
    "sbp_confirmed": ("mmHg", (40, 330), (101, 135), (70, 210), 4.0, "hemodinamica"),
    "dbp_confirmed": ("mmHg", (20, 200), (60, 85), (40, 135), 3.0, "hemodinamica"),
    "rest_hr_10min": ("lpm", (20, 260), (50, 98), (32, 170), 2.0, "hemodinamica"),
    "spo2_5min": ("%", (40, 100), (95, 100), (78, 100), 1.2, "oxigenacion"),
    "sbp_protocol_mean": ("mmHg", (40, 330), (100, 119), (95, 165), 3.0, "pa_protocolo"),
    "dbp_protocol_mean": ("mmHg", (20, 200), (60, 79), (55, 105), 2.0, "pa_protocolo"),
    "cgm_mg_dl": ("mg/dL", (20, 600), (75, 160), (38, 330), (_REL, 0.09), "glucosa"),
    "cgm_tbr70_pct": ("%", (0, 100), (0, 3), (0, 15), 0.3, "glucosa"),
    "cgm_tbr54_pct": ("%", (0, 100), (0, 0.7), (0, 5), 0.1, "glucosa"),
    "hba1c_pct": ("%", (3, 20), (4.6, 5.6), (4.5, 9.0), 0.10, "glucosa_lab"),
    "fasting_plasma_glucose_mg_dl": ("mg/dL", (20, 900), (72, 99), (60, 220), (_REL, 0.03), "glucosa_lab"),
    "bhb_mmol_l": ("mmol/L", (0, 30), (0, 0.5), (0, 6), 0.1, "glucosa_lab"),
    "potassium_mmol_l": ("mmol/L", (1, 10), (3.6, 5.0), (2.0, 7.2), 0.10, "electrolitos"),
    "sodium_mmol_l": ("mmol/L", (90, 200), (136, 144), (112, 166), 1.0, "electrolitos"),
    "hemoglobin_g_dl": ("g/dL", (2, 25), (13.2, 16.5), (5.5, 17.5), 0.25, "hematologia"),
    "anc_10e9_l": ("10^9/L", (0, 100), (1.8, 7.0), (0.1, 8.0), (_REL, 0.06), "hematologia"),
    "platelets_10e9_l": ("10^9/L", (0, 2000), (160, 380), (4, 420), (_REL, 0.04), "hematologia"),
    "creatinine_48h_delta": ("mg/dL", (-5, 20), (-0.1, 0.15), (-0.2, 1.2), 0.03, "renal"),
    "creatinine_7d_ratio": ("ratio", (0.1, 20), (0.85, 1.2), (0.8, 4.5), 0.04, "renal"),
    "egfr": ("mL/min/1.73m2", (1, 200), (70, 120), (12, 125), 4.0, "renal"),
    "urine_acr_mg_g": ("mg/g", (0, 20000), (2, 25), (2, 600), (_REL, 0.08), "renal"),
    "urine_ml_kg_h_6h": ("mL/kg/h", (0, 20), (0.7, 2.0), (0.1, 2.2), 0.05, "renal"),
    "ldl_mg_dl": ("mg/dL", (5, 600), (60, 150), (50, 260), (_REL, 0.05), "lipidos"),
    "triglycerides_mg_dl": ("mg/dL", (10, 8000), (50, 145), (50, 1500), (_REL, 0.05), "lipidos"),
}
FLAGS_TIERRA = {"ritmo": ["ppg_irregular"]}
CALIDAD_TIERRA = ["spo2_quality_bad", "bp_cuffless_unvalidated", "cgm_quality_bad",
                  "sensor_uncalibrated", "sample_hemolyzed"]
CONTEXTO_TIERRA = ["sex_for_reference", "pregnancy_status", "not_pregnant", "gestational_weeks",
                   "known_diabetes", "known_heart_failure", "infection_suspected",
                   "egfr_persistent_3m", "acr_persistent_3m", "ppg_quality_ok",
                   "cgm_days", "cgm_coverage_pct"]

BASE = {"oxigenacion", "hemodinamica", "temperatura", "glucosa", "antropometria", "demografia"}


def especificacion(entorno: str) -> dict:
    if entorno == "ESPACIO":
        return {"num": NUM_ESPACIO, "flags": FLAGS_ESPACIO, "calidad": CALIDAD_ESPACIO,
                "contexto": CONTEXTO_ESPACIO}
    if entorno == "TIERRA":
        return {"num": NUM_TIERRA, "flags": FLAGS_TIERRA, "calidad": CALIDAD_TIERRA,
                "contexto": CONTEXTO_TIERRA}
    raise ValueError("entorno debe ser ESPACIO o TIERRA")


def columnas_modelo(entorno: str) -> list[str]:
    """Entradas del ensamble. Se EXCLUYEN a propósito etnia y fase del ciclo
    (D5/D23/D24: contexto y auditoría, no predictores)."""
    e = especificacion(entorno)
    flags = [f for fs in e["flags"].values() for f in fs]
    return list(e["num"]) + flags + e["calidad"] + e["contexto"]


def _umbrales(reglas, var):
    return sorted({r.umbral for r in reglas if r.habilitada and r.variable == var and r.op != "=="})


def generar(entorno: str, n: int, semilla: int = 0, reglas=None,
            p_grupo: float = 0.07, p_opcional: float = 0.45, factor_ruido: float = 1.0,
            sujetos: int | None = None, p_refuerzo: float = 0.25, artefactos: bool = True):
    """Devuelve (obs, y, grupos, extra).

    obs    : dict columna -> vector observado (NaN = no medido)
    y      : nivel verdadero 0..4 (catálogo sobre valores latentes medidos)
    grupos : id de sujeto simulado (para particiones sin fuga entre sujetos)
    extra  : latentes y máscaras, para auditoría
    """
    rng = np.random.default_rng(semilla)
    e = especificacion(entorno)
    if reglas is None:
        reglas = R.cargar_reglas_espacio() if entorno == "ESPACIO" else R.cargar_reglas_tierra()
    num, flags = e["num"], e["flags"]
    grupos_var = sorted({v[5] for v in num.values()} | set(flags))
    sujetos = sujetos or max(50, n // 12)
    gid = rng.integers(0, sujetos, n)
    centro = {k: rng.uniform(0.25, 0.75, sujetos) for k in num}      # basal propio de cada sujeto

    pert = {g: rng.random(n) < p_grupo for g in grupos_var}
    lat: dict[str, np.ndarray] = {}
    for k, (_, fis, nom, amp, _ruido, g) in num.items():
        pos = np.clip(centro[k][gid] + rng.normal(0, 0.18, n), 0, 1)
        x = nom[0] + pos * (nom[1] - nom[0])
        sel = pert[g] & (rng.random(n) < 0.6)
        m = int(sel.sum())
        if m:
            w = rng.uniform(amp[0], amp[1], m)
            thr = _umbrales(reglas, k)
            if thr:                       # la mitad, concentrada junto a un umbral
                cerca = rng.random(m) < 0.5
                sd = _sd(k, num, np.array(thr).mean())
                ancho = max(6 * sd, 0.04 * (amp[1] - amp[0]))
                w[cerca] = rng.choice(thr, cerca.sum()) + rng.normal(0, ancho, cerca.sum())
            x[sel] = np.clip(w, amp[0], amp[1])
        lat[k] = x
    if "nasa_vte_score" in lat:
        lat["nasa_vte_score"] = np.round(lat["nasa_vte_score"])
        lat["frisen_grade"] = np.round(lat["frisen_grade"])
    # coherencias entre variables que miden lo mismo
    if entorno == "ESPACIO":
        lat["spo2_5min"] = np.clip(lat["spo2_2min"] + rng.normal(0, 0.6, n), 40, 100)
        lat["rest_hr_5min"] = lat["rest_hr_10min"] + rng.normal(0, 3, n)
        lat["awake_hr_5min"] = lat["rest_hr_10min"] + rng.normal(0, 3, n)
        lat["urine_ml_day"] = lat["urine_l_24h"] * 1000
        lat["career_plus_projected_mSv"] = np.maximum(lat["career_plus_projected_mSv"], lat["career_effective_mSv"])

    for g, fs in flags.items():
        for f in fs:
            lat[f] = (pert[g] & (rng.random(n) < 0.45)).astype(float)

    # ---------------- contexto ----------------
    ctx: dict[str, np.ndarray] = {}
    if entorno == "ESPACIO":
        fase = rng.choice([0.0, 1.0, 2.0], n, p=[0.22, 0.56, 0.22])
        ctx["mission_phase"] = fase
        ctx["microgravity_eva"] = (rng.random(n) < 0.5).astype(float)
        ctx["surface_eva"] = (rng.random(n) < 0.25).astype(float)
        ctx["launch_entry_phase"] = (rng.random(n) < 0.15).astype(float)
        ctx["habitat_duration_days"] = np.round(rng.uniform(10, 400, n))
        ctx["cabin_pressure_delta_psi"] = np.round(rng.uniform(0, 3, n), 2)
        ctx["orthostatic_test_performed"] = (rng.random(n) < 0.7).astype(float)
        ctx["cabin_ppco2_1h_coverage_pct"] = np.where(rng.random(n) < 0.9, 100.0, np.round(rng.uniform(3, 99, n)))
    else:
        ctx["sex_for_reference"] = (rng.random(sujetos) < 0.5).astype(float)[gid]
        emb = (ctx["sex_for_reference"] == 0) & (rng.random(n) < 0.12)
        ctx["pregnancy_status"] = emb.astype(float)
        ctx["gestational_weeks"] = np.where(emb, np.round(rng.uniform(5, 40, n)), np.nan)
        ctx["known_diabetes"] = (rng.random(sujetos) < 0.35).astype(float)[gid]
        ctx["known_heart_failure"] = (rng.random(sujetos) < 0.2).astype(float)[gid]
        ctx["infection_suspected"] = (rng.random(n) < 0.15).astype(float)
        ctx["egfr_persistent_3m"] = (rng.random(n) < 0.5).astype(float)
        ctx["acr_persistent_3m"] = (rng.random(n) < 0.5).astype(float)
        ctx["ppg_quality_ok"] = (rng.random(n) < 0.8).astype(float)
        lat["age_years"] = np.round(rng.uniform(18, 85, sujetos))[gid]
    ctx["cgm_days"] = np.round(rng.uniform(3, 30, n))
    ctx["cgm_coverage_pct"] = np.round(rng.uniform(40, 100, n))

    # ---------------- disponibilidad ----------------
    disp_g = {g: rng.random(n) < (0.93 if g in BASE else p_opcional) for g in grupos_var}
    mask = {k: disp_g[num[k][5]] & (rng.random(n) < 0.95) for k in num}
    for g, fs in flags.items():
        for f in fs:
            mask[f] = disp_g[g] & (rng.random(n) < 0.9)
    for c in ctx:
        mask[c] = np.ones(n, dtype=bool)
    if entorno == "ESPACIO":
        desconocida = rng.random(n) < 0.02
        mask["mission_phase"] = ~desconocida
    else:
        desc = (ctx["sex_for_reference"] == 0) & (rng.random(n) < 0.08)   # embarazo no documentado
        mask["pregnancy_status"] = ~desc
        mask["gestational_weeks"] = ~desc & ~np.isnan(ctx["gestational_weeks"])
        mask["age_years"] = np.ones(n, dtype=bool)
        pm = np.where(ctx["sex_for_reference"] == 1, 1.0, 1.0 - ctx["pregnancy_status"])
        ctx["not_pregnant"] = pm
        mask["not_pregnant"] = (ctx["sex_for_reference"] == 1) | mask["pregnancy_status"]

    # ---------------- refuerzo dirigido por regla ----------------
    # Garantiza que cada regla con nivel (incluidas las compuestas, que casi
    # nunca coinciden por azar) aparezca a ambos lados de su umbral.
    con_nivel = [r for r in reglas if r.habilitada and r.nivel]
    ref = rng.random(n) < p_refuerzo
    cual = rng.integers(0, len(con_nivel), n)
    familia = {"spo2_2min": ["spo2_5min"], "spo2_5min": ["spo2_2min"],
               "rest_hr_10min": ["rest_hr_5min", "awake_hr_5min"], "rest_hr_5min": ["rest_hr_10min", "awake_hr_5min"],
               "awake_hr_5min": ["rest_hr_10min", "rest_hr_5min"]}

    def fijar(var, sel, valores):
        destino = lat if var in lat else ctx
        if var not in destino:
            destino[var] = np.full(n, np.nan)
        destino[var] = np.where(sel, valores, destino[var])
        mask[var] = np.where(sel, True, mask.get(var, np.zeros(n, dtype=bool)))

    def cumplir(var, op, val, sel, margen):
        if op == "==":
            v = np.full(n, float(val))
        else:
            d = np.abs(rng.normal(0, margen, n)) + 1e-6
            if var in num:
                amp = num[var][3]
            else:
                amp = {"cgm_days": (3, 30), "cgm_coverage_pct": (40, 100), "habitat_duration_days": (10, 400),
                       "cabin_pressure_delta_psi": (0, 3), "gestational_weeks": (5, 40)}.get(var, (-1e9, 1e9))
                d = rng.uniform(0, 0.4, n) * (amp[1] - amp[0])
            v = val + d if op in (">", ">=") else val - d
            v = np.clip(v, amp[0], amp[1])
            if var in ("cgm_days", "habitat_duration_days", "gestational_weeks", "nasa_vte_score", "frisen_grade"):
                v = np.ceil(v) if op in (">", ">=") else np.floor(v)
                if op == ">":
                    v = np.maximum(v, np.floor(val) + 1)
                if op == "<":
                    v = np.minimum(v, np.ceil(val) - 1)
        return v

    for j, r in enumerate(con_nivel):
        sel = ref & (cual == j)
        if not sel.any():
            continue
        if r.op == "==":
            fijar(r.variable, sel, np.where(rng.random(n) < 0.7, r.umbral, 0.0))
        else:
            amp = num[r.variable][3]
            margen = max(5 * float(np.mean(_sd(r.variable, num, r.umbral))), 0.05 * (amp[1] - amp[0]))
            dentro = cumplir(r.variable, r.op, r.umbral, sel, margen)
            contrario = {"<": ">=", "<=": ">", ">": "<=", ">=": "<"}[r.op]
            fuera = cumplir(r.variable, contrario, r.umbral, sel, margen)
            v = np.where(rng.random(n) < 0.65, dentro, fuera)
            fijar(r.variable, sel, v)
            for otro in familia.get(r.variable, []):
                if otro in lat:
                    lat[otro] = np.where(sel, v + rng.normal(0, 0.5, n), lat[otro])
            if r.variable == "urine_l_24h":
                lat["urine_ml_day"] = np.where(sel, v * 1000, lat["urine_ml_day"])
            if r.variable == "urine_ml_day":
                lat["urine_l_24h"] = np.where(sel, v / 1000, lat["urine_l_24h"])
        for (gv, gop, gval) in r.gates:
            if gv == "age_years":
                continue
            if gv == "not_pregnant":
                fijar("pregnancy_status", sel, np.zeros(n))
                continue
            margen = 0.5 if gv in num else 1.0
            fijar(gv, sel, cumplir(gv, gop, gval, sel, margen))
            if gv == "pregnancy_status" and gval == 1.0:
                fijar("sex_for_reference", sel, np.zeros(n))
                gw = ctx["gestational_weeks"]
                fijar("gestational_weeks", sel, np.where(np.isnan(gw), np.round(rng.uniform(5, 40, n)), gw))
            if gv == "sex_for_reference" and gval == 1.0:
                fijar("pregnancy_status", sel, np.zeros(n))
    if entorno == "TIERRA":
        ctx["pregnancy_status"] = np.where(ctx["sex_for_reference"] == 1, 0.0, ctx["pregnancy_status"])
        ctx["gestational_weeks"] = np.where(ctx["pregnancy_status"] == 1, ctx["gestational_weeks"], np.nan)
        mask["gestational_weeks"] = mask["pregnancy_status"] & ~np.isnan(ctx["gestational_weeks"])
        ctx["not_pregnant"] = np.where(ctx["sex_for_reference"] == 1, 1.0, 1.0 - ctx["pregnancy_status"])
        mask["not_pregnant"] = (ctx["sex_for_reference"] == 1) | mask["pregnancy_status"]
    for a, b in (("sbp_confirmed", "dbp_confirmed"), ("sbp_protocol_mean", "dbp_protocol_mean")):
        lat[a] = np.maximum(lat[a], lat[b] + 15)

    # ---------------- verdad: catálogo sobre latentes medidos ----------------
    verdad = {k: np.where(mask[k], v, np.nan) for k, v in {**lat, **ctx}.items()}
    cod = R.evaluar(reglas, verdad, n, aplicar_qc=False)
    y = R.nivel_maximo(reglas, cod).astype(int)

    # ---------------- observación: ruido, artefactos, calidad ----------------
    obs = {k: v.copy() for k, v in verdad.items()}
    q: dict[str, np.ndarray] = {c: np.zeros(n) for c in e["calidad"]}
    escala = {k: np.ones(n) for k in num}

    pa = 1.0 if artefactos else 0.0

    def marcar(vars_, prob, mult, flag, p_detecta=1.0):
        ev = rng.random(n) < prob * pa
        for v in vars_:
            if v in escala:
                escala[v] = np.where(ev, mult, escala[v])
        if flag in q:
            q[flag] = np.maximum(q[flag], (ev & (rng.random(n) < p_detecta)).astype(float))
        return ev

    marcar(["sbp_confirmed", "dbp_confirmed", "sbp_protocol_mean", "dbp_protocol_mean"], 0.08, 3.0,
           "bp_cuffless_unvalidated")
    marcar(["core_temp_c", "rest_hr_10min", "rest_hr_5min", "awake_hr_5min"], 0.03, 3.0, "sensor_uncalibrated")
    art_cgm = marcar(["cgm_mg_dl"], 0.05, 2.5, "cgm_quality_bad", 0.8)
    art_spo2 = rng.random(n) < 0.05 * pa
    q["spo2_quality_bad"] = (art_spo2 & (rng.random(n) < 0.8)).astype(float)
    if "spo2_artifact" in q:
        q["spo2_artifact"] = (art_spo2 & (rng.random(n) < 0.3)).astype(float)
    if "sample_hemolyzed" in q:
        hemol = rng.random(n) < 0.06 * pa
        q["sample_hemolyzed"] = hemol.astype(float)
        obs["potassium_mmol_l"] = obs["potassium_mmol_l"] + np.where(hemol, rng.uniform(0.5, 2.0, n), 0)

    for k in num:
        sd = _sd(k, num, np.nan_to_num(obs[k])) * escala[k] * factor_ruido
        obs[k] = obs[k] + rng.normal(0, 1, n) * sd
    caida = rng.uniform(4, 15, n)
    for v in ("spo2_2min", "spo2_5min", "eva_spo2_2min"):
        if v in obs:
            obs[v] = obs[v] - np.where(art_spo2, caida, 0)          # artefacto por movimiento/perfusión
    obs["cgm_mg_dl"] = obs["cgm_mg_dl"] - np.where(art_cgm, rng.uniform(15, 40, n), 0)   # compresión
    for k in ("nasa_vte_score", "frisen_grade", "age_years"):
        if k in obs:
            obs[k] = np.round(obs[k])
    for k, (_, fis, *_r) in num.items():
        obs[k] = np.clip(obs[k], fis[0], fis[1])
    for c in e["calidad"]:
        obs[c] = q[c] if c in q else np.zeros(n)
    if entorno == "ESPACIO":
        obs["mission_phase_unknown"] = (~mask["mission_phase"]).astype(float)
    extra = {"latente": verdad, "mask": mask, "codigos_verdad": cod}
    return obs, y, gid, extra


def _sd(k, num, valor):
    r = num[k][4]
    if isinstance(r, tuple):
        return r[1] * np.abs(valor)
    return r


def a_matriz(obs: dict, columnas: list[str], n: int | None = None) -> np.ndarray:
    if n is None:
        n = len(next(iter(obs.values())))
    return np.column_stack([np.asarray(obs.get(c, np.full(n, np.nan)), dtype=float) for c in columnas])
