"""Arma la interfaz: une estilos, guiones, modelo destilado y catálogo en web/index.html y web/medico.html.

Uso:  python web_src/armar.py      (desde la raíz del repositorio; antes, si cambian los textos: python web_src/armar_idioma.py)
"""
import json, pathlib, sys, tempfile

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent
S = AQUI / "src"
html = (S / "index.html").read_text(encoding="utf-8")
js = "\n".join((S / f.name).read_text(encoding="utf-8") for f in sorted(S.glob("[0-9]*.js")))
mod = "window.AH_MODELO = " + (AQUI / "modelo.json").read_text() + ";"
# catálogo de reglas tal como lo carga el motor (para el formulario de evaluación y el respaldo sin servidor)
sys.path.insert(0, str(RAIZ))
import servidor  # noqa: E402
servidor.DATOS = pathlib.Path(tempfile.mkdtemp())
cat = servidor.Estacion(usar_ensamble=False).catalogo()
mod += "\nwindow.AH_CATALOGO = " + json.dumps(cat, ensure_ascii=False, separators=(",", ":")) + ";"
assert "</script" not in js and "</script" not in mod
css = (S / "estilos.css").read_text(encoding="utf-8")
for k, v in (("%%CSS%%", css), ("%%MODELO%%", mod), ("%%JS%%", js)):
    assert html.count(k) == 1
    html = html.replace(k, v)
out = RAIZ / "web" / "index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(out, len(html.encode()) // 1024, "KB")

# consola médica de tierra: mismas hojas de estilo, nombres clínicos, traductor y mapa corporal; su propio guion
med = (S / "medico.html").read_text(encoding="utf-8")
jsm = "window.AH = window.AH || {};\n" + "\n".join((S / n).read_text(encoding="utf-8") for n in ("02a_etiquetas.js", "02b_idioma.js", "02c_cuerpo.js", "medico.js"))
assert "</script" not in jsm
for k, v in (("%%CSS%%", css), ("%%JS%%", jsm)):
    assert med.count(k) == 1
    med = med.replace(k, v)
out = RAIZ / "web" / "medico.html"
out.write_text(med, encoding="utf-8")
print(out, len(med.encode()) // 1024, "KB")
