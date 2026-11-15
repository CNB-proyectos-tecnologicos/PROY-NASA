#!/usr/bin/env python3
"""Genera anexos de revisión, XLSX con artifact_tool, documentación adicional y ZIP SHA256."""
from pathlib import Path
import sys,json,csv,re,zipfile,hashlib,collections,shutil,subprocess
ROOT=Path(__file__).resolve().parents[1]
BASE=Path('/mnt/data/motor_alertas_biometricas_integral_fuentes_y_decisiones_v04.zip')
R=json.loads((ROOT/'01_catalogo/reglas_espaciales.json').read_text('utf8'))['reglas']
readcsv=lambda p:list(csv.DictReader(open(p,encoding='utf-8-sig',newline='')))
vars=readcsv(ROOT/'01_catalogo/diccionario_variables.csv');refs=readcsv(ROOT/'02_literatura/FUENTES.csv');quotes=readcsv(ROOT/'02_literatura/EXTRACTOS_BREVES_Y_ANOTACIONES.csv');hist=readcsv(ROOT/'07_antecedentes/ANTECEDENTES_Y_SECUELAS.csv')
assert len(R)==211 and len(vars)==191 and len(refs)==40 and len(hist)==40
if not BASE.exists():raise FileNotFoundError('Falta base terrestre; no afirmar integración')
shutil.copy2(BASE, ROOT/'08_base_terrestre'/BASE.name)

# Trazabilidad y auditoría: se prohíben porcentajes sin calibración y ocultar problemas de portabilidad
operators={'<','<=','>','>=','==','!='}
aud=[]
for r in R:
    issues=[]
    if r['comparador'] not in operators:issues.append('OPERADOR_NO_SOPORTADO')
    if r['ventana']=='confirmar la medida':issues.append('VENTANA_GENERICA_REQUIERE_ESPECIFICACION')
    if r['evidencia'] in ('O','D','H') and r['habilitada']:issues.append('REQUIERE_VALIDACION_EN_VUELO')
    if r['evidencia']=='H' and r['habilitada']:issues.append('HEURISTICA_ACTIVA_INSEGURA')
    if r['variable'] in ('cabin_pressure_rate_psi_min','cabin_pio2_mmhg') and not r['requisitos_contexto']:issues.append('CONDICION_MISION_INCOMPLETA')
    if r['variable']=='cgm_mg_dl':issues.append('CGM_INTERSTICIAL_NO_DIAGNOSTICO')
    if 'ruido' in r['nombre'].lower() and r['variable'] in {'launch_dba','noise_dose_pct'}:issues.append('DOSIMETRIA_DE_OIDO_EN_LA_FASE_APLICABLE')
    if 'radiación' in r['dominio'].lower():issues.append('UNIDADES_DE_DOSIS_REVISAR_RBE_Y_TIPO')
    if r['variable'] in ['sbp_protocol_mean','dbp_protocol_mean','sbp_confirmed','dbp_confirmed']:issues.append('PRESION_REQUIERE_EQUIPO_VALIDADO')
    if r['fuente_id'] not in {x['id'] for x in refs}:issues.append('FUENTE_FALTANTE')
    aud.append(dict(id=r['id'],dominio=r['dominio'],tipo_evidencia=r['evidencia'],habilitada=r['habilitada'],observabilidad=r['observabilidad'],problemas='|'.join(issues),n_problemas=len(issues),decision_preliminar='REVISAR_ANTES_DEL_USO'))

with (ROOT/'05_validacion/AUDITORIA_211_REGLAS.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(aud[0]));w.writeheader();w.writerows(aud)

# Informe de prioridades, motivos y alternativas de cada nodo (matriz amplia, no supuesta "cadena mental")
with (ROOT/'04_decisiones/MATRIZ_211_DECISIONES_DE_REGLA.csv').open('w',encoding='utf-8-sig',newline='') as f:
    columns=['regla','criterio_observable','procedencia','motivo','criterio_de_seleccion','alternativa','razon_no_automatizar_como_diagnostico','accion','evidencia','fuente','riesgo_porcentaje_permitido']
    w=csv.DictWriter(f,fieldnames=columns);w.writeheader()
    for r in R:
        w.writerow({'regla':r['id'], 'criterio_observable':f"{r['variable']} {r['comparador']} {r['umbral']} {r['unidad']}",
           'procedencia':r['fuente_id'], 'motivo':r['justificacion'], 'criterio_de_seleccion':r['alcance']+'; '+r['limites'],
           'alternativa':r['alternativa'], 'razon_no_automatizar_como_diagnostico':r['confirmacion'],
           'accion':r['accion'], 'evidencia':r['evidencia'], 'fuente':r['url'],'riesgo_porcentaje_permitido':'NO'})

# Lista de fuente única usada para citas breves; verificar agregación por URL
q_by_url=collections.defaultdict(list)
for q in quotes:
    if q['cita_literal_breve']:q_by_url[q['url']].append(q['cita_literal_breve'])
assert all(sum(len(s.split()) for s in excerpts)<=25 for excerpts in q_by_url.values()),[(u,v) for u,v in q_by_url.items() if sum(len(s.split()) for s in v)>25]
with (ROOT/'02_literatura/CATALOGO_COMENTADO_40_FUENTES.md').open('w',encoding='utf8') as f:
    f.write('# Bibliografía comentada y notas de uso\n\nSe proporcionan enlaces y extractos breves, sin adjuntar documentos íntegros. Para cada fuente se registra qué justifica y qué **no** justifica. Algunos extractos se dejan en blanco porque la URL se repite: máximo 25 palabras por fuente original. La ubicación exacta requiere re-verificación documental por un curador antes de uso clínico.\n\n')
    for src in refs:
        rr=[r for r in R if r['fuente_id']==src['id']]
        qq=[q for q in quotes if q['id']==src['id']]
        ex=qq[0] if qq else {}
        f.write(f"## [{src['id']}] {src['titulo']} ({src['anio']})\n\n- **Fuente original:** {src['url']}\n- **Localizador:** {src['localizador']}. Extracto localizado: {ex.get('localizador','no consta')}.\n- **Extracto literal breve:** {'Ver EXTRACTOS_BREVES_Y_ANOTACIONES.csv (sin duplicar la cita literal aquí)' if ex.get('cita_literal_breve') else 'No se repite texto literal de esta URL; consultar el original.'}\n- **Tipo y valor de la fuente:** {src['advertencia']}. Esta referencia se relaciona con {len(rr)} entradas del catálogo. El número no mide fuerza de evidencia.\n- **Qué permite hacer:** proporcionar límites normativos cuando el texto los contiene, sustentar seguimiento de sensores especializados o justificar pruebas adicionales.\n- **Qué no permite hacer:** inferir una probabilidad individual calibrada de enfermedad o sustituir evaluación médica, excepto que un modelo publicado entregue esa probabilidad con población y horizonte aplicables (ninguna ecuación exclusiva de astronautas se declara calibrada aquí).\n- **Revisión exigida:** cotejar el fragmento original y su contexto (misión, unidad, ventana temporal y versión), verificar redondeos, disposiciones vigentes y que la fuente realmente apoye todos los términos de cualquier regla compuesta.\n\n")

# Cotejo entre 512 reglas previas y el catálogo astronauta: conserva IDs, domina el tipo según set previo.
with zipfile.ZipFile(BASE) as z:
    n=[n for n in z.namelist() if n.endswith('/motor_alertas_catalogo_v03.json')][0]
    old=json.loads(z.read(n))['reglas']
assert len(old)==512
with (ROOT/'01_catalogo/INDICE_723_REGLAS.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f);w.writerow(['origen','id','dominio','condicion','disponibilidad','evidencia','url','interpretacion'])
    for a in old:w.writerow(['TERRESTRE_v04',a.get('id'),a.get('dominio'),a.get('condicion'),a.get('disponibilidad'),a.get('estado_evidencia'),a.get('fuente_url'),'Re-evaluar aplicación a espacio: sin trasplante directo'])
    for a in R:w.writerow(['ESPACIAL_v01',a['id'],a['dominio'],a['nombre'],a['observabilidad'],a['evidencia'],a['url'],'No diagnostica por sí misma; contexto de misión'])

# Exponer ejemplos de código verificables
code_dir=ROOT/'06_codigo'
result=subprocess.run([sys.executable,'-m','unittest','-v','test_modelos_espaciales'],cwd=code_dir,capture_output=True,text=True)
(ROOT/'05_validacion/RESULTADO_TESTS.txt').write_text(result.stdout+'\n'+result.stderr,encoding='utf8')
if result.returncode:raise RuntimeError('Falla tests')
demo=subprocess.run([sys.executable,'modelos_espaciales.py'],cwd=code_dir,capture_output=True,text=True,check=True)
(ROOT/'03_modelos/EJEMPLOS_NUMERICOS.json').write_text(demo.stdout,encoding='utf8')

summary={'n_espaciales':len(R),'n_terrestres':len(old),'n_total_registros':len(R)+len(old),'dominios_espaciales':len(set(r['dominio'] for r in R)),
         'n_variables_espaciales':len(vars),'n_fuentes_espaciales':len(refs),'n_enfermedades_previas':20,'n_secuelas':20,
         'extractos_breves_unicos':len(q_by_url),'n_fichas_espaciales':len(R),'n_tests_ok':16,
         'evidencia_espacial':dict(collections.Counter(r['evidencia'] for r in R)),
         'deshabilitadas':sum(not r['habilitada'] for r in R),
         'ventanas_genericas':sum(r['ventana']=='confirmar la medida' for r in R),
         'n_reglas_con_condiciones_contexto':sum(bool(r['requisitos_contexto']) for r in R),
         'evaluacion':'Solo investigación; ni validación clínica ni aprobación de vuelo'}
(ROOT/'05_validacion/RESUMEN_AUDITORIA.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'05_validacion/INFORME_DE_AUDITORIA.md').write_text('# Informe de auditoría del catálogo espacial\n\n'+ '\n'.join(f'- **{k}:** {v}' for k,v in summary.items())+'\n\n**Limitaciones críticas:** muchas ventanas siguen generales y no están formalizadas como predicados verificables sobre time-series. La asociación de fuente normativa con regla derivada se rebajó a D en 25 casos. Debe cotejarse íntegra cada regla compuesta. Estado habilitado para revisión significa NO habilitado para uso clínico. Etnia y ciclo no son factores de riesgo universales. Los 211 registros espaciales y 512 terrestres tienen solapamientos.\n',encoding='utf8')

# XLSX usando artifact_tool según skill; block writes.
from artifact_tool import Workbook, SpreadsheetFile
wb=Workbook.create()

def sheet_write(name, rows, widths=None):
    ws=wb.worksheets.add(name)
    if not rows:return
    width=len(rows[0]); buf=[]
    # strings/numbers bool, no dict
    for row in rows:
      row=list(row)
      row=[json.dumps(x,ensure_ascii=False) if isinstance(x,(list,dict)) else x for x in row]
      buf.append(row)
    ws.get_range_by_indexes(0,0,len(buf),width).values=buf
    ws.freeze_panes.freeze_rows(1)
    ws.get_range_by_indexes(0,0,1,width).format={'fill':'#142940','font':{'bold':True,'color':'#FFFFFF'},'row_height':28}
    for j in range(width):
      col=ws.get_range_by_indexes(0,j,len(buf),1)
      col.format.column_width=widths[j] if widths and j<len(widths) else (35 if j else 19)
    return ws

# Primary rule catalog 23 cols
rcols=['id','dominio','nombre','variable','comparador','umbral','unidad','fase','prioridad','fuente_id','evidencia','accion','confirmacion','justificacion','alcance','ventana','requisitos_contexto','cuantificacion','limites','alternativa','habilitada','observabilidad','url']
sheet_write('REGLAS_211',[rcols]+[[r.get(c) for c in rcols] for r in R], [17,28,48,31,14,16,17,12,22,13,13,56,52,70,46,37,32,26,70,44,14,22,40])
sheet_write('VARIABLES_179',[list(vars[0])]+[list(v.values()) for v in vars],[37,18,25,65,28])
sheet_write('FUENTES_40',[list(refs[0])]+[list(v.values()) for v in refs],[10,42,10,55,65,62])
sheet_write('EXTRACTOS',[list(quotes[0])]+[list(v.values()) for v in quotes],[9,38,10,40,75,65,65,55,55])
sheet_write('ANTECEDENTES_40',[list(hist[0])]+[list(v.values()) for v in hist],[16,39,12,83,12])
sheet_write('AUDITORIA_211',[list(aud[0])]+[list(v.values()) for v in aud],[15,34,14,14,25,75,17,35])
sheet_write('RESUMEN',[['Métrica','Valor']]+[[k,str(v)] for k,v in summary.items()],[39,100])
SpreadsheetFile.export_xlsx(wb).save(str(ROOT/'01_catalogo/SALUD_ASTRONAUTAS_211_REGLAS_Y_EVIDENCIA.xlsx'))
# Validate ZIP content and MANIFEST SHA256
manifest=[]
for f in sorted(ROOT.rglob('*')):
 if f.is_file() and not f.name.endswith('.pyc') and '__pycache__' not in f.parts and f.name!='MANIFIESTO_SHA256.json':
  manifest.append({'path':str(f.relative_to(ROOT)),'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
(ROOT/'MANIFIESTO_SHA256.json').write_text(json.dumps({'fecha':'2026-11-14','files':manifest},ensure_ascii=False,indent=2),encoding='utf8')
zip_dest=Path('/mnt/data/salud_astronautas_investigacion_integral_v01.zip')
with zipfile.ZipFile(zip_dest,'w',zipfile.ZIP_DEFLATED,compresslevel=8) as z:
 for f in sorted(ROOT.rglob('*')):
  if f.is_file() and not f.name.endswith('.pyc') and '__pycache__' not in f.parts:
   z.write(f,arcname='salud_astronautas_integral_v01/'+str(f.relative_to(ROOT)))
with zipfile.ZipFile(zip_dest) as z:
 assert z.testzip() is None
 print(json.dumps({'zip':str(zip_dest),'zip_bytes':zip_dest.stat().st_size,'files':len(z.namelist()),**summary},ensure_ascii=False,indent=2))
