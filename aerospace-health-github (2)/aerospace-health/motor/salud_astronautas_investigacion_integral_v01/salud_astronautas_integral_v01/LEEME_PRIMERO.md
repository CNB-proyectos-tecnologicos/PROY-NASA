# Medicina espacial: investigación integral de indicadores, alertas y riesgo (V01)

**Fecha de corte**: 14-nov-2026. **Propósito**: base de investigación para ingeniería de un motor de alertas de salud de astronautas, no equipo médico y no sistema de control certificado para vuelo.

## Qué contiene

- `01_catalogo/`: **211 reglas espaciales** en JSON y CSV; **191 variables** (11 variables de origen, múltiples variables contextuales, analíticas y derivaciones), hojas XLSX de revisión; 28 dominios.
- `02_literatura/`: 40 referencias rastreables, extractos breves con localizador/anotación y **211 fichas individuales**; la cita literal está limitada intencionalmente a menos de 25 palabras por **fuente original única**. Una referencia repetida recibe localizador sin re-citar para evitar reproducción extensa.
- `03_modelos/`: fórmulas exactas de límites NASA, alternativas, distribuciones/propuestas estadísticas y restricciones epistemológicas.
- `04_decisiones/`: 35 decisiones de diseño argumentadas y matriz de trazabilidad de elecciones.
- `05_validacion/`: protocolo, casos adversariales, métricas, auditoría de nomenclatura.
- `06_codigo/`: Python estándar sin dependencias para NASA VTE 2026, cumplimiento de límites, dosimetría acústica, PIO2, OCT, IC Wilson y 16 tests; script generador.
- `07_antecedentes/`: 20 enfermedades previas y 20 secuelas/estados permanentes, cada una con repercusiones.
- `08_base_terrestre/`: ZIP original V04 de biometría terrestre, con 512 reglas, **sin alterar**. No sumar mecánicamente reglas: hay solapamientos y umbrales terrestres que no se trasladan a vuelo.

**Alcance agregado**: 512 reglas terrestres conservadas + 211 reglas espaciales = 723 registros; **NO** son 723 enfermedades distintas, ni 723 predictores clínicamente validados. Hay solapamientos y hay reglas de calidad de sensor y alarmas del vehículo.

## Cómo leer

1. `04_decisiones/INFORME_DE_JUSTIFICACIONES.md` para comprender por qué se eligen límites y qué alternativas se rechazaron.
2. `02_literatura/EXTRACTOS_BREVES_Y_ANOTACIONES.csv` y `FUENTES.csv` para consultar fuentes NASA, artículos y guías.
3. `02_literatura/FICHAS_TRAZABILIDAD_TODAS_REGLAS.md`: una ficha por regla espacial, con motivo, pruebas, alcance y abstención.
4. `03_modelos/METODOS_FORMULAS_Y_DISTRIBUCIONES.md`: fórmulas, escenarios y distinción probabilidad/% normativo.
5. `05_validacion/PROTOCOLO_VALIDACION_CLINICO_OPERATIVA.md` para plan de evaluación y seguridad.
6. `06_codigo/modelos_espaciales.py` (ejecutable Python 3.10+), `python -m unittest -v test_modelos_espaciales`.

## Advertencia indispensable

Si sólo existen edad, talla, masa, temperatura, mediciones corporales, HR, PA, CGM, SpO2, etnia y fase ovulatoria condicional, el software **no puede diagnosticar** SANS, trombosis yugular, daño por radiación, pérdida de BMD, cáncer, litiasis renal o deterioro cognitivo de causa espacial. Necesita OCT, Doppler, dosimetría, DXA, analíticas y pruebas especializadas según el desenlace. Un cero por dato faltante NO es normalidad.

Los datos continuos de glucosa son intersticiales; los tensiómetros cuffless y SpO₂ pueden requerir verificación. Etnia es contexto y dimensión de auditoría, no multiplicador universal de riesgo. La fase menstrual puede no ser aplicable por supresión hormonal.

**Fuentes rectoras**: NASA-STD-3001 V1 y V2, NASA OCHMO VTE 2026, consenso SANS 2026, NASA Standard Measures, ADA 2026 y KDIGO 2024. Se adjuntan URL/localizadores, no copias integrales protegidas de publicaciones. Algunas citas de fuentes secundarias deben cotejarse manualmente antes de publicación o uso normativo; se listan para orientar comprobación, no como prueba de una regla compuesta.

## Significado de códigos

`N` literal/normativa NASA y equivalente operativo; `C` consenso o guía clínica; `D` derivación de criterio general o umbral terrestre; `O` observación publicada (sin causalidad individual); `H` heurística **apagada**; `Q` validación de calidad y abstención. Aun un `N` requiere comprobar vigencia y aplicabilidad al perfil real de misión. 

`HABILITADA PARA REVISIÓN` significa visible en un ambiente de investigación; NO autoriza despliegue en vuelo ni decisiones clínicas autónomas.
