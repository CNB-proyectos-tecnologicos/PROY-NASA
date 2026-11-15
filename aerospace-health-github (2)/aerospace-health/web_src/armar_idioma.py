# Genera src/02b_idioma.js: diccionario español -> inglés y traductor del DOM. Requiere Node.js.
# Uso: python web_src/armar_idioma.py   (y después python web_src/armar.py)
import json, pathlib, subprocess
AQUI = pathlib.Path(__file__).resolve().parent; I = AQUI / "i18n"; S = AQUI / "src"
D = {}
def pon(es, en):
    es, en = es.strip(), en.strip()
    if not es or not en or en == "=" or es == en: return
    D.setdefault(es, en)
ui = json.loads((I / "ui_es.json").read_text(encoding="utf-8")); en = []
for f in sorted(I.glob("ui_en_*.txt")): en += f.read_text(encoding="utf-8").rstrip("\n").split("\n")
assert len(ui) == len(en), (len(ui), len(en))
cat = json.loads((I / "cat_es.json").read_text(encoding="utf-8"))
for k, f in (("dominios", "cat_dom_en.txt"), ("nombre", "cat_nombre_en.txt"), ("accion", "cat_accion_en.txt"), ("confirmacion", "cat_confirmacion_en.txt")):
    e = (I / f).read_text(encoding="utf-8").rstrip("\n").split("\n"); assert len(e) == len(cat[k]), (k, len(e), len(cat[k]))
    for a, b in zip(cat[k], e): pon(a, b)
for a, b in json.loads((I / "extras.json").read_text(encoding="utf-8")).items(): pon(a, b)
etq = json.loads(subprocess.run(["node", "-e", "global.AH={}; require(process.argv[1]); const en=require(process.argv[2]); console.log(JSON.stringify(Object.keys(AH.ETQ).map(k=>[AH.ETQ[k], en[k]])))", str(S / "02a_etiquetas.js"), str(I / "etq_en.js")], capture_output=True, text=True, check=True).stdout)
for a, b in etq: pon(a, b)
for a, b in zip(ui, en): pon(a, b)
mas = {}
for a, b in D.items():                                   # variantes de mayúscula inicial
    for fa, fb in ((a[0].upper() + a[1:], b[0].upper() + b[1:]), (a[0].lower() + a[1:], b[0].lower() + b[1:])):
        if fa != a and fa not in D and not a[:2].isupper(): mas[fa] = fb
D.update(mas)
js = (I / "traductor.js").read_text(encoding="utf-8").replace("%%DICC%%", json.dumps(D, ensure_ascii=False, separators=(",", ":")))
(S / "02b_idioma.js").write_text(js, encoding="utf-8"); print("entradas", len(D), "·", len(js) // 1024, "KB")
