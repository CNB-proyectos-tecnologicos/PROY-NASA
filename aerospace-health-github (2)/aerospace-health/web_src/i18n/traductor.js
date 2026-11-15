/* Idioma: la interfaz se escribe en español y, si se elige inglés, se traduce en el DOM con un diccionario de frases.
   No se traduce lo que escriben las personas o el modelo (zonas marcadas data-notr). Generado por i18n/armar_idioma.py. */
(function () {
  const D = %%DICC%%;
  const en = () => (AH.cfg ? AH.cfg.idioma : AH.idioma) === "en";
  const claves = Object.keys(D).sort((a, b) => b.length - a.length), escr = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const RE = new RegExp("(?<![\\p{L}\\p{N}_])(" + claves.map(escr).join("|") + ")(?![\\p{L}\\p{N}_])", "gu");
  const PATS = [[/hace (\d+) (s|min|h)\b/g, "$1 $2 ago"], [/(\d+) de (\d+)/g, "$1 of $2"], [/\bdía (\d+)/g, "day $1"], [/(\d) años\b/g, "$1 years"], [/ a las (\d\d:)/g, " at $1"], [/\bmín\b/g, "min"], [/\bmáx\b/g, "max"], [/(\d) y (\d)/g, "$1 and $2"], [/^(\s*)de (\d)/, "$1of $2"], [/ de (\d+) (mSv|reglas|rules)/g, " of $1 $2"]];
  const cache = new Map();
  function tr(s) {
    if (!en() || typeof s !== "string" || !/[A-Za-zÀ-ÿ]/.test(s)) return s;
    const lim = s.trim(); if (!lim) return s;
    if (D[lim] != null) return s.replace(lim, D[lim]);
    let o = cache.get(s); if (o != null) return o;
    o = s.replace(RE, m => D[m]); PATS.forEach(p => { o = o.replace(p[0], p[1]); });
    if (cache.size > 4000) cache.clear(); cache.set(s, o); return o;
  }
  AH.tr = tr; AH.I18N = { D, en };
  if (typeof document === "undefined") return;
  const hechos = new WeakMap(), ATR = ["placeholder", "title", "aria-label"];
  const fuera = n => { const e = n.nodeType === 1 ? n : n.parentElement; return !e || e.closest("[data-notr], script, style, textarea, pre, code"); };
  function texto(n) { if (hechos.get(n) === n.nodeValue || fuera(n)) return; const t = tr(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; hechos.set(n, n.nodeValue); }
  function atributos(e) { if (e.closest("[data-notr]")) return; ATR.forEach(a => { const v = e.getAttribute(a); if (v) { const t = tr(v); if (t !== v) e.setAttribute(a, t); } }); }
  function pase(r) {
    if (!en()) return;
    if (r.nodeType === 3) return texto(r); if (r.nodeType !== 1) return;
    atributos(r); const w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT); let n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) texto(n); else atributos(n); }
  }
  AH.I18N.pase = pase;
  function iniciar() {
    if (!en()) return;
    document.documentElement.lang = "en"; document.title = tr(document.title); pase(document.body);
    new MutationObserver(ms => { for (const m of ms) { if (m.type === "characterData") texto(m.target); else if (m.type === "attributes") atributos(m.target); else m.addedNodes.forEach(pase); } })
      .observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATR });
    const ft = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (t) { arguments[0] = tr(t); return ft.apply(this, arguments); };
    if (AH.descargar) { const d = AH.descargar; AH.descargar = (nombre, t) => d(nombre, /\.md$/.test(nombre) ? t.split("\n").map(tr).join("\n") : t); }
  }
  setTimeout(iniciar, 0);
})();
