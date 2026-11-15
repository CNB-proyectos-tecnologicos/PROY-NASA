"""Capa determinista: catálogo de reglas y evaluación en lógica de tres valores.

PROTOTIPO DE INVESTIGACIÓN. No es dispositivo médico ni sistema certificado de vuelo.

Fuentes de las reglas
---------------------
* ESPACIO: las 211 reglas de ``reglas_espaciales.json`` (paquete
  salud_astronautas_integral_v01) se cargan tal cual. Las 21 deshabilitadas
  en el catálogo permanecen apagadas.
* TIERRA: el catálogo terrestre v03 (512 reglas) está escrito en lenguaje
  natural y no es ejecutable. Aquí se transcribe A MANO un subconjunto a
  predicados tipados; cada regla cita los ``R0xxx`` de los que procede.

Principios tomados de los paquetes
----------------------------------
* Dato ausente => NO_CALCULABLE, nunca "normal" (D21/D34).
* Sensor dudoso => VERIFICAR, no diagnóstico; un valor grave sospechoso no
  se silencia (protocolo terrestre §7, caso C espacial).
* Ningún porcentaje de enfermedad (D2/D02).
* Las mismas funciones evalúan un caso real y generan las etiquetas del
  simulador: no hay dos implementaciones de la misma regla.
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

DATOS = Path(__file__).resolve().parent / "datos"

# Nivel ordinal común de triage (lo que predice el ensamble)
NIVELES = ["SIN_ALERTA", "SEGUIMIENTO", "CONSULTA", "PRIORITARIA", "INMEDIATA"]

# Correspondencia con las etiquetas de cada catálogo (decisión de diseño de
# este prototipo; debe revisarla el comité clínico).
PRIORIDAD_A_NIVEL_ESPACIO = {
    "SEGUIMIENTO": 1, "CONSULTA": 2, "ALTA": 3, "ALTA_OPERATIVA": 3,
    "URGENTE": 4, "CRITICA_OPERATIVA": 4,
}
SEVERIDAD_A_NIVEL_TIERRA = {
    "SEGUIMIENTO": 1, "CRIBADO": 1, "CONSULTA": 2, "URGENTE": 3, "CRITICA": 4,
}

FASES = {"PREFLIGHT": 0, "INFLIGHT": 1, "POSTFLIGHT": 2}
FASE_LETRA = {"P": 0, "F": 1, "R": 2}

# Códigos de resultado por regla
ACTIVADA, INACTIVA, NO_CALCULABLE, NO_APLICA, VERIFICAR = 1, 0, -1, -2, -3
ESTADO_TXT = {ACTIVADA: "ACTIVADA", INACTIVA: "INACTIVA", NO_CALCULABLE: "NO_CALCULABLE",
              NO_APLICA: "NO_APLICA", VERIFICAR: "VERIFICAR"}

_OPS = {
    "<": np.less, "<=": np.less_equal, ">": np.greater, ">=": np.greater_equal,
    "==": np.equal, "!=": np.not_equal,
}


@dataclass(frozen=True)
class Regla:
    id: str
    origen: str            # ESPACIO | TIERRA
    dominio: str
    nombre: str
    variable: str
    op: str
    umbral: float
    unidad: str
    nivel: int | None      # None => canal de calidad/abstención
    prioridad: str         # etiqueta original del catálogo
    canal: str             # CLINICO | OPERATIVO_VEHICULO | CALIDAD_ABSTENCION
    evidencia: str
    habilitada: bool
    accion: str = ""
    confirmacion: str = ""
    limites: str = ""
    fuente: str = ""
    ventana: str = ""
    gates: tuple = ()       # condiciones obligatorias (var, op, valor)
    gates_opc: tuple = ()   # sólo se exigen si el dato existe
    refs: tuple = ()        # ids de catálogo de origen (TIERRA)
    motivo_off: str = ""


# ---------------------------------------------------------------------------
# Catálogo ESPACIO
# ---------------------------------------------------------------------------
# Condiciones de contexto que el JSON expresa en texto o sólo en el nombre de
# la regla. Se hacen explícitas aquí (decisión documentada en el README).
_GATES_EXTRA_ESPACIO = {
    "SP-0006": (("cabin_pressure_delta_psi", ">", 1.0),),      # V2 6007: sólo si el cambio >1 psi
    "SP-0015": (("launch_entry_phase", "==", 1.0),),           # techo 105 dBA: lanzamiento/entrada
    "SP-0039": (("orthostatic_test_performed", "==", 1.0),),   # caída de PA sólo con prueba postural
    "SP-0040": (("orthostatic_test_performed", "==", 1.0),),
    "SP-0083": (("microgravity_eva", "==", 1.0),),             # mínimos de fuerza por perfil EVA
    "SP-0084": (("surface_eva", "==", 1.0),),
    "SP-0086": (("surface_eva", "==", 1.0),),
    "SP-0087": (("microgravity_eva", "==", 1.0),),             # V1 4001
    "SP-0088": (("surface_eva", "==", 1.0),),                  # V1 4002
    "SP-0202": (("habitat_duration_days", ">", 60.0),),        # V1 4033: sistemas >60 días
    "SP-0203": (("habitat_duration_days", ">", 60.0),),
}
_CGM_AGREGADAS = {"cgm_tbr70_pct", "cgm_tbr54_pct", "cgm_tir_pct", "cgm_tar180_pct", "cgm_cv_pct"}
_GATES_CGM = (("cgm_days", ">=", 14.0), ("cgm_coverage_pct", ">=", 70.0))
# Media horaria de CO2: si se informa la cobertura de la hora y no es completa
# la media no es calculable (caso B). Si no se informa, se evalúa y se avisa.
_GATES_OPC_ESPACIO = {"cabin_ppco2_1h": (("cabin_ppco2_1h_coverage_pct", ">=", 100.0),)}


def sha256_archivo(ruta: Path) -> str:
    return hashlib.sha256(Path(ruta).read_bytes()).hexdigest()


def huella(reglas: list) -> str:
    """Huella de las reglas tal como se ejecutan (umbrales, puertas, niveles, estado).

    Un ensamble guardado sólo se usa si la huella coincide con la del catálogo
    cargado: cambiar una regla obliga a reentrenar (D30).
    """
    txt = json.dumps([[r.id, r.variable, r.op, r.umbral, r.nivel, r.habilitada, list(map(list, r.gates)),
                       list(map(list, r.gates_opc))] for r in reglas], sort_keys=True)
    return hashlib.sha256((txt + json.dumps(QC, sort_keys=True)).encode()).hexdigest()


def cargar_reglas_espacio(ruta: Path | None = None) -> list[Regla]:
    ruta = ruta or DATOS / "reglas_espaciales.json"
    cat = json.loads(Path(ruta).read_text(encoding="utf-8"))
    reglas = []
    for r in cat["reglas"]:
        prio = r["prioridad"]
        if r["evidencia"] == "Q" or prio in ("NO_CALCULABLE", "CALIDAD"):
            canal, nivel = "CALIDAD_ABSTENCION", None
        elif prio.endswith("_OPERATIVA"):
            canal, nivel = "OPERATIVO_VEHICULO", PRIORIDAD_A_NIVEL_ESPACIO[prio]
        else:
            canal, nivel = "CLINICO", PRIORIDAD_A_NIVEL_ESPACIO.get(prio)
        gates = []
        if r["fase"] in FASE_LETRA:
            gates.append(("mission_phase", "==", float(FASE_LETRA[r["fase"]])))
        gates += list(_GATES_EXTRA_ESPACIO.get(r["id"], ()))
        if r["variable"] in _CGM_AGREGADAS:
            gates += list(_GATES_CGM)
        reglas.append(Regla(
            id=r["id"], origen="ESPACIO", dominio=r["dominio"], nombre=r["nombre"],
            variable=r["variable"], op=r["comparador"], umbral=float(r["umbral"]),
            unidad=r["unidad"], nivel=nivel, prioridad=prio, canal=canal,
            evidencia=r["evidencia"], habilitada=bool(r["habilitada"]),
            accion=r["accion"], confirmacion=r["confirmacion"],
            limites=f'{r["alcance"]} {r["limites"]}'.strip(), fuente=r["url"],
            ventana=r["ventana"], gates=tuple(gates),
            gates_opc=_GATES_OPC_ESPACIO.get(r["variable"], ()),
            motivo_off="" if r["habilitada"] else "deshabilitada en el catálogo (heurística / investigación)",
        ))
    return reglas


# ---------------------------------------------------------------------------
# Catálogo TIERRA (subconjunto ejecutable transcrito a mano del v03)
# ---------------------------------------------------------------------------
_AD = ("age_years", ">=", 18.0)          # R0150: reglas sólo de adultos
_NP = ("not_pregnant", "==", 1.0)        # R0126/R0141: excluir embarazo antes de aplicar
_DM = ("known_diabetes", "==", 1.0)      # D19: CGM sólo interpretable con diabetes conocida
_CGM14 = _GATES_CGM

# (id, refs, dominio, nombre, variable, op, umbral, unidad, severidad, evidencia, gates)
# evidencia: G = UMBRAL_GUIA, D = DERIVADA_NO_VALIDADA
_TIERRA = [
    ("T-001", ("R0001",), "Antropometría", "Bajo peso (IMC <18.5)", "bmi", "<", 18.5, "kg/m2", "CONSULTA", "G", (_AD, _NP)),
    ("T-002", ("R0002",), "Antropometría", "Sobrepeso (IMC 25–29.9)", "bmi", ">=", 25, "kg/m2", "SEGUIMIENTO", "G", (_AD, _NP)),
    ("T-003", ("R0003", "R0004", "R0005"), "Antropometría", "Obesidad (IMC ≥30)", "bmi", ">=", 30, "kg/m2", "CONSULTA", "G", (_AD, _NP)),
    ("T-004", ("R0006", "R0007"), "Antropometría", "Adiposidad central (cintura/talla ≥0.50, IMC <35)", "whtr", ">=", 0.5, "ratio", "CONSULTA", "G", (_AD, _NP, ("bmi", "<", 35.0))),
    ("T-005", ("R0011",), "Temperatura", "Fiebre medida clínicamente (≥38.0 °C)", "core_temp_c", ">=", 38.0, "°C", "CONSULTA", "G", (_AD,)),
    ("T-006", ("R0012", "R0458"), "Temperatura", "Temperatura muy elevada (≥40 °C)", "core_temp_c", ">=", 40.0, "°C", "URGENTE", "D", (_AD,)),
    ("T-007", ("R0013", "R0459"), "Temperatura", "Hipotermia (central <35 °C)", "core_temp_c", "<", 35.0, "°C", "CRITICA", "D", (_AD,)),
    ("T-008", ("R0014", "R0464"), "Infecciones", "Infección sospechada y T <36 °C", "core_temp_c", "<", 36.0, "°C", "URGENTE", "G", (_AD, ("infection_suspected", "==", 1.0))),
    ("T-009", ("R0015", "R0193"), "Cardiovascular agudo", "PAS ≤90 mmHg validada", "sbp_confirmed", "<=", 90, "mmHg", "URGENTE", "G", (_AD,)),
    ("T-010", ("R0195", "R0461"), "Infecciones", "Infección sospechada y PAS 91–100", "sbp_confirmed", "<=", 100, "mmHg", "URGENTE", "G", (_AD, ("infection_suspected", "==", 1.0))),
    ("T-011", ("R0017",), "Cardiovascular agudo", "FC >130 lpm en reposo, sostenida", "rest_hr_10min", ">", 130, "lpm", "URGENTE", "G", (_AD,)),
    ("T-012", ("R0018", "R0210"), "Cardiovascular agudo", "FC de reposo >100 lpm repetida", "rest_hr_10min", ">", 100, "lpm", "CONSULTA", "D", (_AD,)),
    ("T-013", ("R0020", "R0214"), "Cardiovascular agudo", "FC de reposo <40 lpm confirmada", "rest_hr_10min", "<", 40, "lpm", "URGENTE", "D", (_AD,)),
    ("T-014", ("R0021", "R0476"), "Respiratorio", "SpO2 ≤88 % en reposo, confirmada", "spo2_5min", "<=", 88, "%", "URGENTE", "G", (_AD,)),
    ("T-015", ("R0022", "R0475"), "Respiratorio", "SpO2 89–92 % nueva y repetida", "spo2_5min", "<=", 92, "%", "CONSULTA", "D", (_AD,)),
    ("T-016", ("R0181",), "Presión arterial", "PA elevada ACC/AHA (PAS 120–129)", "sbp_protocol_mean", ">=", 120, "mmHg", "SEGUIMIENTO", "G", (_AD, _NP)),
    ("T-017", ("R0027", "R0183"), "Presión arterial", "HTA estadio 1 ACC/AHA por sistólica (≥130)", "sbp_protocol_mean", ">=", 130, "mmHg", "CONSULTA", "G", (_AD, _NP)),
    ("T-018", ("R0028", "R0184"), "Presión arterial", "HTA estadio 2 ACC/AHA por sistólica (≥140)", "sbp_protocol_mean", ">=", 140, "mmHg", "CONSULTA", "G", (_AD, _NP)),
    ("T-019", ("R0027", "R0183"), "Presión arterial", "HTA estadio 1 ACC/AHA por diastólica (≥80)", "dbp_protocol_mean", ">=", 80, "mmHg", "CONSULTA", "G", (_AD, _NP)),
    ("T-020", ("R0028", "R0184"), "Presión arterial", "HTA estadio 2 ACC/AHA por diastólica (≥90)", "dbp_protocol_mean", ">=", 90, "mmHg", "CONSULTA", "G", (_AD, _NP)),
    ("T-021", ("R0033",), "Presión arterial", "PAS >180 mmHg confirmada", "sbp_confirmed", ">", 180, "mmHg", "URGENTE", "G", (_AD,)),
    ("T-022", ("R0033",), "Presión arterial", "PAD >120 mmHg confirmada", "dbp_confirmed", ">", 120, "mmHg", "URGENTE", "G", (_AD,)),
    ("T-023", ("R0116", "R0445"), "Embarazo", "Embarazo y PAS ≥160", "sbp_confirmed", ">=", 160, "mmHg", "CRITICA", "G", (("pregnancy_status", "==", 1.0),)),
    ("T-024", ("R0116", "R0446"), "Embarazo", "Embarazo y PAD ≥110", "dbp_confirmed", ">=", 110, "mmHg", "CRITICA", "G", (("pregnancy_status", "==", 1.0),)),
    ("T-025", ("R0115", "R0444"), "Embarazo", "Embarazo ≥20 sem y PAS ≥140", "sbp_confirmed", ">=", 140, "mmHg", "URGENTE", "G", (("pregnancy_status", "==", 1.0), ("gestational_weeks", ">=", 20.0))),
    ("T-026", ("R0115", "R0444"), "Embarazo", "Embarazo ≥20 sem y PAD ≥90", "dbp_confirmed", ">=", 90, "mmHg", "URGENTE", "G", (("pregnancy_status", "==", 1.0), ("gestational_weeks", ">=", 20.0))),
    ("T-027", ("R0053", "R0250"), "Glucosa", "CGM <54 mg/dL en diabetes", "cgm_mg_dl", "<", 54, "mg/dL", "CRITICA", "G", (_AD, _DM)),
    ("T-028", ("R0052",), "Glucosa", "CGM <70 mg/dL en diabetes tratada", "cgm_mg_dl", "<", 70, "mg/dL", "URGENTE", "G", (_AD, _DM)),
    ("T-029", ("R0054", "R0252"), "Glucosa", "TBR <70 mg/dL >4 % (14 d, cobertura ≥70 %)", "cgm_tbr70_pct", ">", 4, "%", "CONSULTA", "G", (_AD, _DM) + _CGM14),
    ("T-030", ("R0055",), "Glucosa", "TBR <54 mg/dL >1 % (14 d, cobertura ≥70 %)", "cgm_tbr54_pct", ">", 1, "%", "URGENTE", "G", (_AD, _DM) + _CGM14),
    ("T-031", ("R0044",), "Glucosa", "HbA1c 5.7–6.4 % (laboratorio)", "hba1c_pct", ">=", 5.7, "%", "CONSULTA", "G", (_AD, _NP)),
    ("T-032", ("R0047", "R0261"), "Glucosa", "HbA1c ≥6.5 % (laboratorio; requiere confirmación)", "hba1c_pct", ">=", 6.5, "%", "CONSULTA", "G", (_AD, _NP)),
    ("T-033", ("R0045", "R0263"), "Glucosa", "Glucosa plasmática en ayuno 100–125 mg/dL", "fasting_plasma_glucose_mg_dl", ">=", 100, "mg/dL", "CONSULTA", "G", (_AD, _NP)),
    ("T-034", ("R0048", "R0262"), "Glucosa", "Glucosa plasmática en ayuno ≥126 mg/dL", "fasting_plasma_glucose_mg_dl", ">=", 126, "mg/dL", "CONSULTA", "G", (_AD, _NP)),
    ("T-035", ("R0058",), "Glucosa", "Cetonemia BHB ≥3 mmol/L con diabetes", "bhb_mmol_l", ">=", 3.0, "mmol/L", "URGENTE", "G", (_AD, _DM)),
    ("T-036", ("R0103", "R0392"), "Electrolitos", "Potasio 5.5–5.9 mmol/L", "potassium_mmol_l", ">=", 5.5, "mmol/L", "CONSULTA", "G", (_AD,)),
    ("T-037", ("R0104", "R0393"), "Electrolitos", "Potasio 6.0–6.4 mmol/L", "potassium_mmol_l", ">=", 6.0, "mmol/L", "URGENTE", "G", (_AD,)),
    ("T-038", ("R0105", "R0394"), "Electrolitos", "Potasio ≥6.5 mmol/L", "potassium_mmol_l", ">=", 6.5, "mmol/L", "CRITICA", "G", (_AD,)),
    ("T-039", ("R0106", "R0397"), "Electrolitos", "Potasio <3.5 mmol/L", "potassium_mmol_l", "<", 3.5, "mmol/L", "CONSULTA", "D", (_AD,)),
    ("T-040", ("R0107", "R0399"), "Electrolitos", "Potasio <2.5 mmol/L", "potassium_mmol_l", "<", 2.5, "mmol/L", "CRITICA", "D", (_AD,)),
    ("T-041", ("R0100", "R0401"), "Electrolitos", "Sodio <135 mmol/L", "sodium_mmol_l", "<", 135, "mmol/L", "CONSULTA", "G", (_AD,)),
    ("T-042", ("R0101", "R0402"), "Electrolitos", "Sodio 125–129 mmol/L", "sodium_mmol_l", "<", 130, "mmol/L", "URGENTE", "G", (_AD,)),
    ("T-043", ("R0102", "R0403"), "Electrolitos", "Sodio <125 mmol/L", "sodium_mmol_l", "<", 125, "mmol/L", "URGENTE", "G", (_AD,)),
    ("T-044", ("R0405",), "Electrolitos", "Sodio ≥160 mmol/L", "sodium_mmol_l", ">=", 160, "mmol/L", "CRITICA", "D", (_AD,)),
    ("T-045", ("R0082", "R0358"), "Hematología", "Hb <13.0 g/dL (varón adulto)", "hemoglobin_g_dl", "<", 13.0, "g/dL", "CONSULTA", "G", (_AD, ("sex_for_reference", "==", 1.0))),
    ("T-046", ("R0083", "R0357"), "Hematología", "Hb <12.0 g/dL (mujer no embarazada)", "hemoglobin_g_dl", "<", 12.0, "g/dL", "CONSULTA", "G", (_AD, ("sex_for_reference", "==", 0.0), ("pregnancy_status", "==", 0.0))),
    ("T-047", ("R0084", "R0362"), "Hematología", "Hb <8.0 g/dL (adulto no embarazado)", "hemoglobin_g_dl", "<", 8.0, "g/dL", "URGENTE", "G", (_AD, _NP)),
    ("T-048", ("R0380",), "Hematología", "Neutrófilos <0.5 ×10⁹/L", "anc_10e9_l", "<", 0.5, "10^9/L", "URGENTE", "G", (_AD,)),
    ("T-049", ("R0092", "R0381", "R0465"), "Hematología", "Neutropenia febril (ANC <0.5 y T ≥38.3 °C)", "anc_10e9_l", "<", 0.5, "10^9/L", "CRITICA", "G", (_AD, ("core_temp_c", ">=", 38.3))),
    ("T-050", ("R0383",), "Hematología", "Plaquetas <50 ×10⁹/L", "platelets_10e9_l", "<", 50, "10^9/L", "URGENTE", "D", (_AD,)),
    ("T-051", ("R0094", "R0385"), "Hematología", "Plaquetas <10 ×10⁹/L", "platelets_10e9_l", "<", 10, "10^9/L", "CRITICA", "D", (_AD,)),
    ("T-052", ("R0078", "R0317"), "Riñón", "Creatinina +≥0.3 mg/dL en ≤48 h", "creatinine_48h_delta", ">=", 0.3, "mg/dL", "URGENTE", "G", (_AD,)),
    ("T-053", ("R0079", "R0318"), "Riñón", "Creatinina ≥1.5× basal en ≤7 d", "creatinine_7d_ratio", ">=", 1.5, "ratio", "URGENTE", "G", (_AD,)),
    ("T-054", ("R0320",), "Riñón", "Creatinina ≥3× basal (LRA estadio 3)", "creatinine_7d_ratio", ">=", 3.0, "ratio", "CRITICA", "G", (_AD,)),
    ("T-055", ("R0077",), "Riñón", "eGFR <30 en resultado nuevo", "egfr", "<", 30, "mL/min/1.73m2", "URGENTE", "G", (_AD,)),
    ("T-056", ("R0074",), "Riñón", "eGFR <60 persistente ≥3 meses", "egfr", "<", 60, "mL/min/1.73m2", "CONSULTA", "G", (_AD, ("egfr_persistent_3m", "==", 1.0))),
    ("T-057", ("R0075", "R0312"), "Riñón", "ACR ≥30 mg/g persistente ≥3 meses", "urine_acr_mg_g", ">=", 30, "mg/g", "CONSULTA", "G", (_AD, ("acr_persistent_3m", "==", 1.0))),
    ("T-058", ("R0076", "R0313"), "Riñón", "ACR >300 mg/g", "urine_acr_mg_g", ">", 300, "mg/g", "CONSULTA", "G", (_AD,)),
    ("T-059", ("R0080", "R0321"), "Riñón", "Diuresis <0.5 mL/kg/h durante ≥6 h", "urine_ml_kg_h_6h", "<", 0.5, "mL/kg/h", "URGENTE", "G", (_AD,)),
    ("T-060", ("R0062", "R0285"), "Lípidos", "LDL ≥190 mg/dL", "ldl_mg_dl", ">=", 190, "mg/dL", "CONSULTA", "G", (_AD,)),
    ("T-061", ("R0064", "R0288"), "Lípidos", "Triglicéridos 150–499 mg/dL", "triglycerides_mg_dl", ">=", 150, "mg/dL", "CONSULTA", "G", (_AD,)),
    ("T-062", ("R0065", "R0289"), "Lípidos", "Triglicéridos 500–999 mg/dL", "triglycerides_mg_dl", ">=", 500, "mg/dL", "URGENTE", "G", (_AD,)),
    ("T-063", ("R0066", "R0290"), "Lípidos", "Triglicéridos ≥1000 mg/dL", "triglycerides_mg_dl", ">=", 1000, "mg/dL", "URGENTE", "G", (_AD,)),
    ("T-064", ("R0009", "R0238"), "Cardiovascular", "IC conocida y +>2 kg en 3 días", "weight_gain_3d_kg", ">", 2.0, "kg", "CONSULTA", "G", (_AD, ("known_heart_failure", "==", 1.0))),
    ("T-065", ("R0036",), "Ritmo cardiaco", "Irregularidad PPG reproducible: solicitar ECG", "ppg_irregular", "==", 1, "indicador", "CRIBADO", "G", (_AD, ("ppg_quality_ok", "==", 1.0))),
]


def cargar_reglas_tierra(derivadas_desde_nivel: int = 3) -> list[Regla]:
    """Reglas terrestres ejecutables.

    Las ``UMBRAL_GUIA`` quedan habilitadas para revisión. Las
    ``DERIVADA_NO_VALIDADA`` sólo se habilitan si su nivel es
    >= ``derivadas_desde_nivel`` (precedencia de niveles graves, D12/D35); el
    resto queda apagado (D33). Las ``EXPERIMENTAL`` no se transcriben (D32).
    """
    meta = json.loads((DATOS / "reglas_tierra_v03_meta.json").read_text(encoding="utf-8"))
    out = []
    for (rid, refs, dom, nombre, var, op, umbral, unidad, sev, ev, gates) in _TIERRA:
        nivel = SEVERIDAD_A_NIVEL_TIERRA[sev]
        m = meta.get(refs[0], {})
        on = ev == "G" or nivel >= derivadas_desde_nivel
        out.append(Regla(
            id=rid, origen="TIERRA", dominio=dom, nombre=nombre, variable=var, op=op,
            umbral=float(umbral), unidad=unidad, nivel=nivel, prioridad=sev, canal="CLINICO",
            evidencia="UMBRAL_GUIA" if ev == "G" else "DERIVADA_NO_VALIDADA",
            habilitada=on, accion=m.get("resultado_ENTONCES", ""),
            confirmacion=m.get("prueba_confirmatoria", ""), limites=m.get("limitaciones", ""),
            fuente=m.get("fuente_url", ""), ventana="la indicada en el criterio; confirmar la medida",
            gates=tuple(gates), refs=tuple(refs),
            motivo_off="" if on else "derivada no validada de nivel bajo: apagada (D33)",
        ))
    return out


# ---------------------------------------------------------------------------
# Control de calidad: indicador de calidad -> variables que deja en duda
# ---------------------------------------------------------------------------
_SENSORES_BASE = ["spo2_2min", "spo2_5min", "eva_spo2_2min", "sbp_confirmed", "dbp_confirmed",
                  "rest_hr_10min", "rest_hr_5min", "awake_hr_5min", "core_temp_c", "cgm_mg_dl"]
QC = {
    "spo2_quality_bad": ["spo2_2min", "spo2_5min", "eva_spo2_2min"],
    "spo2_artifact": ["spo2_2min", "spo2_5min", "eva_spo2_2min"],
    "bp_cuffless_unvalidated": ["sbp_confirmed", "dbp_confirmed", "sbp_protocol_mean", "dbp_protocol_mean",
                                "orth_sbp_drop_3min", "orth_dbp_drop_3min"],
    "cgm_quality_bad": ["cgm_mg_dl"] + sorted(_CGM_AGREGADAS),
    "microgravity_weight_invalid": ["urine_ml_kg_h_6h"],
    "sensor_uncalibrated": _SENSORES_BASE,
    "sample_hemolyzed": ["potassium_mmol_l"],      # R0137/R0415: seudohiperpotasemia
}
QC_POR_VAR: dict[str, list[str]] = {}
for _flag, _vars in QC.items():
    for _v in _vars:
        QC_POR_VAR.setdefault(_v, []).append(_flag)


# ---------------------------------------------------------------------------
# Evaluación vectorizada en tres valores
# ---------------------------------------------------------------------------
def _col(D: dict, nombre: str, n: int) -> np.ndarray:
    v = D.get(nombre)
    if v is None:
        return np.full(n, np.nan)
    return np.asarray(v, dtype=float)


def _tern(D, n, var, op, valor):
    """1 cierto, 0 falso, -1 desconocido."""
    x = _col(D, var, n)
    out = np.full(n, -1, dtype=np.int8)
    ok = ~np.isnan(x)
    out[ok] = _OPS[op](x[ok], valor).astype(np.int8)
    return out


def evaluar(reglas: list[Regla], D: dict, n: int, aplicar_qc: bool = True) -> np.ndarray:
    """Devuelve matriz (n_reglas, n) con códigos de estado.

    ``D`` es un dict nombre -> vector float (NaN = dato ausente).
    Las reglas deshabilitadas devuelven NO_APLICA.
    """
    res = np.full((len(reglas), n), NO_APLICA, dtype=np.int8)
    cache_qc: dict[str, np.ndarray] = {}
    for i, r in enumerate(reglas):
        if not r.habilitada:
            continue
        p = _tern(D, n, r.variable, r.op, r.umbral)
        g = np.ones(n, dtype=np.int8)
        for (gv, gop, gval) in r.gates:
            t = _tern(D, n, gv, gop, gval)
            g = np.where((g == 0) | (t == 0), 0, np.where((g == -1) | (t == -1), -1, 1)).astype(np.int8)
        opc_falla = np.zeros(n, dtype=bool)            # sólo cuentan si el dato existe
        for (gv, gop, gval) in r.gates_opc:
            opc_falla |= _tern(D, n, gv, gop, gval) == 0
        grave = (r.nivel or 0) >= 3
        if aplicar_qc and r.variable in QC_POR_VAR:
            if r.variable not in cache_qc:
                q = np.zeros(n, dtype=bool)
                for fl in QC_POR_VAR[r.variable]:
                    q |= _col(D, fl, n) == 1
                cache_qc[r.variable] = q
            q = cache_qc[r.variable]
        else:
            q = np.zeros(n, dtype=bool)

        out = np.full(n, INACTIVA, dtype=np.int8)
        out[p == -1] = NO_CALCULABLE
        # lectura "normal" de un sensor en duda no tranquiliza
        out[(p == 0) & q] = NO_CALCULABLE
        cierto = p == 1
        dudoso = cierto & ((g == -1) | q)
        out[cierto & (g == 1) & ~q] = ACTIVADA
        out[dudoso] = VERIFICAR if grave else NO_CALCULABLE
        out[opc_falla & (p != -1)] = NO_CALCULABLE     # p. ej. hora de CO2 incompleta (caso B)
        out[g == 0] = NO_APLICA
        res[i] = out
    return res


def nivel_maximo(reglas: list[Regla], codigos: np.ndarray) -> np.ndarray:
    """Nivel ordinal más alto entre las reglas ACTIVADAS de cada caso."""
    niv = np.array([r.nivel or 0 for r in reglas], dtype=np.int8)[:, None]
    return np.where(codigos == ACTIVADA, niv, 0).max(axis=0)


# ---------------------------------------------------------------------------
# Cálculos auxiliares transcritos de los paquetes
# ---------------------------------------------------------------------------
def dosis_acustica_24h_pct(exposiciones: list[tuple[float, float]]) -> float:
    """NASA-STD-3001 V2 [V2 6073]: D = 100·Σ C/T, T = 480 / 2^((L-85)/3) min.

    Sólo ruido no impulsivo al oído. No es probabilidad de hipoacusia.
    """
    total = 0.0
    for dba, minutos in exposiciones:
        if minutos < 0 or not 0 <= dba <= 200:
            raise ValueError("segmento acústico inválido")
        total += minutos / (480.0 / 2 ** ((dba - 85.0) / 3.0))
    return 100.0 * total


_VTE_FAMILIA = {"none": 0, "one_early": 1, "multiple_early": 2}
_VTE_TROMBOFILIA = {"none": 0, "fvl_hetero": 2, "fvl_homo": 8, "fvl_plus": 10, "protein_c": 3,
                    "protein_s": 3, "antithrombin_iii": 10, "prothrombin_hetero": 2}
_VTE_HORMONAL = {"none": 0, "low": 1, "some": 2, "moderate": 2}


def puntuacion_vte_nasa_2026(c: dict) -> dict:
    """Puntos de la propuesta NASA/SP-20260005258 (transcripción del paquete).

    Son PUNTOS, no probabilidad. Si falta cualquier componente el total es
    NO_CALCULABLE (caso F): se devuelve sólo el mínimo ya acumulado.
    Estasis y flujo retrógrado son la misma categoría (+4 una sola vez).
    """
    comp, faltan = {}, []

    def tomar(clave, fn):
        v = c.get(clave)
        if v is None:
            faltan.append(clave)
        else:
            comp[clave] = fn(v)

    tomar("age", lambda a: 2 if a > 50 else (1 if a > 40 else 0))
    tomar("family_vte", lambda v: _VTE_FAMILIA[v])
    tomar("thrombophilia", lambda v: _VTE_TROMBOFILIA[v])
    tomar("non_o_blood_group", lambda v: 1 if v else 0)
    tomar("hormonal_therapy", lambda v: _VTE_HORMONAL[v])
    tomar("ijv_stasis", lambda v: 4 if v else 0)
    tomar("d_dimer_change_pct", lambda v: 2 if v > 60 else 0)
    parcial = sum(comp.values())
    if faltan:
        return {"estado": "NO_CALCULABLE", "puntos": None, "minimo_con_lo_conocido": parcial,
                "componentes": comp, "faltan": faltan, "probabilidad": None}
    return {"estado": "CALCULADO", "puntos": parcial, "componentes": comp, "faltan": [],
            "probabilidad": None, "nota": "propuesta NASA 2026 sin validación predictiva externa"}


def ckd_epi_2021(edad: float, creatinina_mg_dl: float, sexo_modelo: str) -> float:
    """eGFR CKD-EPI 2021 (creatinina). ``sexo_modelo`` es la categoría de la ecuación (F/M)."""
    if sexo_modelo not in ("F", "M"):
        raise ValueError("sexo_modelo debe ser F o M (categoría de la ecuación); no se infiere")
    k, a = (0.7, -0.241) if sexo_modelo == "F" else (0.9, -0.302)
    s = creatinina_mg_dl / k
    return 142 * min(s, 1) ** a * max(s, 1) ** -1.2 * 0.9938 ** edad * (1.012 if sexo_modelo == "F" else 1)


def media_ventana(muestras: list[tuple[float, float, bool]], duracion_s: float,
                  cobertura_min: float = 1.0) -> dict:
    """Media ponderada por tiempo de los últimos ``duracion_s`` segundos.

    ``muestras`` = [(t_segundos, valor, valido)], cada muestra vale hasta la
    siguiente. No interpola huecos: si la cobertura válida es menor que
    ``cobertura_min`` devuelve valor None (NO_CALCULABLE).
    """
    if len(muestras) < 2:
        return {"valor": None, "cobertura": 0.0}
    m = sorted(muestras)
    fin = m[-1][0]
    ini = fin - duracion_s
    acum = tiempo = 0.0
    for (t0, v, ok), (t1, _, _) in zip(m, m[1:]):
        a, b = max(t0, ini), min(t1, fin)
        if b <= a or not ok:
            continue
        acum += v * (b - a)
        tiempo += b - a
    cob = tiempo / duracion_s
    return {"valor": (acum / tiempo) if tiempo > 0 and cob >= cobertura_min else None,
            "cobertura": cob}
