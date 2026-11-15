"""Formulas de ingeniería e índices espaciales (no cálculo automático de riesgo médico individual).
Autor: prototipo de investigación 2026-11. Unidad y contexto son obligatorios.
"""
from __future__ import annotations
from dataclasses import dataclass
from math import log, exp, sqrt
from typing import Optional


def oxygen_inspired_mmHg(total_pressure_mmHg:float, oxygen_fraction:float, water_vapor_mmHg:float=47.0)->float:
    """PIO2=(PB-PH2O)*FiO2; PH2O=47 mmHg SOLO gas inspirado a ~37 °C y saturado de vapor.
    No equivale a PaO2 ni SaO2; la referencia NASA puede basarse en otra convención.
    """
    if total_pressure_mmHg<=water_vapor_mmHg or not (0<oxygen_fraction<=1):raise ValueError('PB/FiO2 fuera de rango')
    return round((total_pressure_mmHg-water_vapor_mmHg)*oxygen_fraction,3)


def mmHg_from_kPa(pressure_kPa:float)->float:
    return pressure_kPa*7.50061683


def acoustic_dose_24h_percent(exposures:list[tuple[float,float]])->float:
    """NASA-STD-3001 V2 [V2 6073] launch/entry/abort, NON-impulse sound.
    input=(dBA al oído, minutos) por segmento en ventana 24 h.
    D =100 sum(Cn/Tn); Tn =480/2^((Ln-85)/3).
    No aplicar directamente a ruido impulsivo ni sonido ambiente si se conoce atenuación real del casco.
    """
    total=0.
    for dba,minutes in exposures:
        if minutes<0 or not (0<=dba<=200):raise ValueError('segmento acústico inválido')
        T=480/(2**((dba-85)/3))
        total+=minutes/T
    return 100*total


def nasa_operational_limits(measures:dict, mission:dict|None=None)->dict:
    """Compara límites normativos con datos; missing=NO_CALCULABLE.
    No infiere diagnóstico, incapacidad ni decisiones de vuelo por sí solo.
    """
    mission=mission or {}
    cfg=[
        ('cabina_CO2_1h','cabin_ppco2_1h_mmHg','<=',3.0,'NASA V2 6004'),
        ('cabina_presion_superior','cabin_pressure_kPa','<=',103.,'NASA V2 6006'),
        ('cabina_presion_inferior','cabin_pressure_kPa','>',34.5,'NASA V2 6006'),
        ('cabina_diluyente','cabin_diluent_percent','>=',30.,'NASA V2 6002'),
        ('radiacion_carrera','career_effective_mSv','<',600.,'NASA V1 4030'),
        ('musculo','strength_ratio','>=',0.80,'NASA V1 4024'),
        ('hueso_hip','hip_bmd_ratio','>=',0.95,'NASA V1 4027'),
        ('hueso_cuello_femur','femneck_bmd_ratio','>=',0.90,'NASA V1 4027'),
    ]
    if mission.get('microgravity_eva'):
        cfg.append(('vo2_eva_micro','vo2max_ml_min_kg','>=',32.9,'NASA V1 4001'))
    if mission.get('surface_eva'):
        cfg.append(('vo2_eva_surface','vo2max_ml_min_kg','>=',36.5,'NASA V1 4002'))
    out={}
    for name,key,op,threshold,source in cfg:
        val=measures.get(key)
        if val is None:
            out[name]={'state':'NO_CALCULABLE','source':source,'missing':[key]}
            continue
        funcs={'>':lambda a,b:a>b,'>=':lambda a,b:a>=b,'<':lambda a,b:a<b,'<=':lambda a,b:a<=b}
        out[name]={'state':'CUMPLE' if funcs[op](val,threshold) else 'INCUMPLE','measure':val,'criterion':f'{op}{threshold}','source':source,'risk_percent':None}
    return out


@dataclass(frozen=True)
class SpaceVTEScoreInput:
    """Variables propuestas por NASA 2026. No sustituir no medido por ausencia.
    family_vte: none, one_early, multiple_early
    thrombophilia: none, fvl_hetero, fvl_homo, fvl_plus, protein_c,
                   protein_s, antithrombin_iii, prothrombin_hetero.
    hormonal_therapy: none, low, some, moderate.
    """
    age:int
    family_vte:str
    thrombophilia:str
    non_o_blood_group:bool
    hormonal_therapy:str
    ijv_stasis:bool
    d_dimer_change_pct:float


def nasa_vte_2026_proposal_score(x:SpaceVTEScoreInput)->dict:
    """Transcripción ingenieril del sistema de puntos propuesto NASA/SP-20260005258.
    Verificar tabla PDF antes del uso; familia y trombofilias son categorías mutuamente excluyentes.
    Dos o más condiciones trombofílicas sin categoría publicada => ABSTENER.
    4-6 pts propuesta de profilaxis farmacológica: **no prescribir ni recomendar automáticamente**.
    """
    if not 18<=x.age<=100:raise ValueError('edad fuera de rango investigado')
    family={'none':0,'one_early':1,'multiple_early':2}
    thromb={'none':0,'fvl_hetero':2,'fvl_homo':8,'fvl_plus':10,'protein_c':3,'protein_s':3,'antithrombin_iii':10,'prothrombin_hetero':2}
    hormonal={'none':0,'low':1,'some':2,'moderate':2}
    if x.family_vte not in family or x.thrombophilia not in thromb or x.hormonal_therapy not in hormonal:raise ValueError('categoría no documentada')
    if x.d_dimer_change_pct < -100:raise ValueError('error delta D-dimero')
    terms={'age':2 if x.age>50 else (1 if x.age>40 else 0),
           'family':family[x.family_vte],
           'thrombophilia':thromb[x.thrombophilia],
           'non_o':1 if x.non_o_blood_group else 0,
           'hormonal':hormonal[x.hormonal_therapy],
           'jugular_stasis':4 if x.ijv_stasis else 0,
           'd_dimer':2 if x.d_dimer_change_pct>60 else 0}
    total=sum(terms.values())
    cat=('BAJA' if total<=1 else 'MONITORIZACION_AUMENTADA' if total<=3 else 'VALORACION_MEDICA_DE_VUELO')
    return {'score':total,'components':terms,'triage':cat,'probability_absolute':None,
            'validacion':'propuesta NASA 2026; sin validación predictiva externa',
            'acciones':['Revisión por médico de vuelo', 'No dispensación automática de anticoagulantes']}


def sans_oct_category(delta_peripapillary_trt_um:float, frisen_grade:Optional[int]=None)->dict:
    """Criterios de consenso 2026: dependen del equipo OCT Spectralis y protocolo.
    No es probabilidad individual y no se calcula sin exploración ocular.
    """
    if delta_peripapillary_trt_um>=55 or (frisen_grade is not None and frisen_grade>=1):cat='B'
    elif delta_peripapillary_trt_um>=20:cat='A'
    else:cat='SIN_CRITERIO_OCT_TRATADO'
    return {'category':cat,'delta_um':delta_peripapillary_trt_um,'probability_absolute':None,
            'source':'Gew et al. 2026 SANS consenso DOI 10.1038/s41433-026-04651-6','requires':['OCT validado','interpretación neurooftalmológica']}


def nasa_bone_strength_exposure(hip_ratio=None, femoral_neck_ratio=None, strength_ratio=None)->dict:
    out={}
    for k,v,target in [('hip',hip_ratio,.95),('femoral_neck',femoral_neck_ratio,.90),('strength',strength_ratio,.80)]:
        if v is not None:
            out[k]={'fraction_of_premission':v,'percent_loss':round((1-v)*100,3),'meets_target':v>=target,'target':target}
        else:out[k]={'state':'NO_CALCULABLE'}
    return out


def wilson_binomial_interval(successes:int,n:int,z:float=1.96):
    """IC para proporción binomial observada; NO transporte automático a otro astronauta/misión."""
    if not 0<=successes<=n or n==0:raise ValueError('n/k inválidos')
    p=successes/n
    center=(p+z*z/(2*n))/(1+z*z/n)
    half=z*sqrt((p*(1-p)+z*z/(4*n))/n)/(1+z*z/n)
    return {'observed_fraction':p,'lower':center-half,'upper':center+half,'is_individual_prediction':False}


def alert_if_observed(v, op, threshold, evidence_valid=True):
    """Comparador sin eval; no medición => abstenerse; calidad degradada => revisar."""
    if v is None:return 'NO_CALCULABLE'
    if not evidence_valid:return 'VERIFICAR_SENSOR'
    f={'>':lambda a,b:a>b,'>=':lambda a,b:a>=b,'<':lambda a,b:a<b,'<=':lambda a,b:a<=b,
       '==':lambda a,b:a==b,'!=':lambda a,b:a!=b}
    if op not in f:raise ValueError('operador')
    return 'ACTIVADA' if f[op](v,threshold) else 'INACTIVA'

if __name__=='__main__':
    import json
    sample={'limits':nasa_operational_limits({'cabin_ppco2_1h_mmHg':3.2,'career_effective_mSv':200}, {'microgravity_eva':True}),
            'vte':nasa_vte_2026_proposal_score(SpaceVTEScoreInput(48,'none','none',False,'none',True,65)),
            'sans':sans_oct_category(56),
            'acoustics':acoustic_dose_24h_percent([(85,480)]),
            'wilson_52_64':wilson_binomial_interval(52,64)}
    print(json.dumps(sample,ensure_ascii=False,indent=2))
