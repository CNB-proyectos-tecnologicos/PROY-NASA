/* Consola del médico de vuelo en tierra: directorio de tripulación, tablero y perfil completos de cada tripulante e intercomunicación directa.
   Todo lo que muestra llega del monitor del tripulante a través del servidor; nada se simula aquí. */
(function () {
  const $ = (q, r) => (r || document).querySelector(q), $$ = (q, r) => [...(r || document).querySelectorAll(q)];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const p2 = n => String(n).padStart(2, "0"), hora = t => { const d = t ? new Date(t) : new Date(); return p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds()); };
  const fecha = t => { const d = t ? new Date(t) : new Date(); return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); };
  const leer = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const NIVT = { estable: "Estable", aviso: "Aviso", precaucion: "Precaución", urgencia: "Urgencia", nd: "Sin dato" }, ICO = { estable: "✓", aviso: "ⓘ", precaucion: "⚠", urgencia: "‼" };
  const NIV = { SIN_ALERTA: ["Sin alerta", "estable"], SEGUIMIENTO: ["Seguimiento", "aviso"], CONSULTA: ["Consulta", "aviso"], PRIORITARIA: ["Prioritaria", "precaucion"], INMEDIATA: ["Inmediata", "urgencia"] };
  const TABS = [["tablero", "Tablero"], ["perfil", "Perfil"], ["laboratorio", "Laboratorio"], ["bienestar", "Bienestar"], ["evaluacion", "Evaluación"], ["alertas", "Alertas"], ["interpretacion", "Interpretación"]];
  const cfgMon = leer("ah-monitor-v1:cfg", {}) || {};
  let idioma = leer("ah-medico:idioma", cfgMon.idioma || "es"), autor = leer("ah-medico:autor", "Médico de vuelo");
  AH.idioma = idioma; if (cfgMon.modo === "accesible") document.documentElement.dataset.modo = "accesible";
  let dir = [], sel = leer("ah-medico:sel", null), est = null, tab = "tablero", msgs = [], ult = 0, enlace = false, evalua = null, interp = null, ocupado = false;
  const api = async (ruta, cuerpo) => { const ctl = new AbortController(), tt = setTimeout(() => ctl.abort(), /^\/api\/(llm|evaluar)/.test(ruta) ? 180000 : 10000); let r, d;
    try { r = await fetch(ruta, cuerpo === undefined ? { signal: ctl.signal } : { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(cuerpo), signal: ctl.signal }); d = await r.json(); } finally { clearTimeout(tt); } if (!r.ok) throw new Error(d.error || "HTTP " + r.status); return d; };
  const etiqueta = (t, c) => '<span class="etq s-' + c + '">' + t + "</span>";
  const tabla = (cab, filas, vacio) => filas.length ? '<div class="tabla"><table><thead><tr>' + cab.map(c => "<th>" + c + "</th>").join("") + "</tr></thead><tbody>" + filas.map(f => "<tr>" + f.map(c => Array.isArray(c) ? '<td class="' + c[1] + '">' + c[0] + "</td>" : "<td>" + c + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>" : '<p class="nota">' + (vacio || "Sin registros.") + "</p>";
  const dl = pares => "<dl>" + pares.filter(x => x[1] != null && x[1] !== "").map(x => "<dt>" + x[0] + "</dt><dd>" + x[1] + "</dd>").join("") + "</dl>";
  const hace = s => s < 5 ? "ahora" : s < 90 ? "hace " + Math.round(s) + " s" : s < 5400 ? "hace " + Math.round(s / 60) + " min" : "hace " + Math.round(s / 3600) + " h";

  // ---- gráfica de tendencia
  function linea(cv, series, op) {
    if (!cv || cv.offsetParent === null) return; op = op || {};
    const d = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight; cv.width = w * d; cv.height = h * d; const x = cv.getContext("2d"); x.scale(d, d); x.clearRect(0, 0, w, h);
    const css = k => getComputedStyle(document.body).getPropertyValue(k).trim(), todos = series.flatMap(s => s.datos).filter(v => v != null); if (!todos.length) return;
    let a = op.min != null ? Math.min(op.min, ...todos) : Math.min(...todos), b = op.max != null ? Math.max(op.max, ...todos) : Math.max(...todos); if (a === b) { a -= 1; b += 1; } const m = (b - a) * 0.08; if (op.min == null) a -= m; if (op.max == null) b += m;
    const L = 36, R = 6, T = 6, B = 16, X = (i, n) => L + (w - L - R) * (n < 2 ? 1 : i / (n - 1)), Y = v => T + (h - T - B) * (1 - (v - a) / (b - a));
    x.font = "11px " + css("--f-ui"); x.fillStyle = css("--tenue"); x.strokeStyle = css("--linea"); x.lineWidth = 1; x.textBaseline = "middle";
    [a, (a + b) / 2, b].forEach(v => { x.beginPath(); x.moveTo(L, Y(v)); x.lineTo(w - R, Y(v)); x.stroke(); x.fillText(Math.abs(v) >= 100 ? Math.round(v) : v.toFixed(1), 2, Y(v)); });
    (op.bandas || []).forEach(v => { if (v == null || v < a || v > b) return; x.save(); x.setLineDash([4, 4]); x.strokeStyle = css("--precaucion"); x.beginPath(); x.moveTo(L, Y(v)); x.lineTo(w - R, Y(v)); x.stroke(); x.restore(); });
    series.forEach(s => { x.save(); x.strokeStyle = s.color || css("--onda"); x.lineWidth = 1.6; if (s.guion) x.setLineDash(s.guion); x.beginPath(); let abierto = false; const n = s.datos.length;
      s.datos.forEach((v, i) => { if (v == null) { abierto = false; return; } if (abierto) x.lineTo(X(i, n), Y(v)); else { x.moveTo(X(i, n), Y(v)); abierto = true; } }); x.stroke(); x.restore(); });
    if (op.t && op.t.length) { x.textBaseline = "alphabetic"; x.fillText(hora(op.t[0]).slice(0, 5), L, h - 3); const f = hora(op.t[op.t.length - 1]).slice(0, 5); x.fillText(f, w - R - x.measureText(f).width, h - 3); }
  }

  // ---- directorio
  function pintarDir() {
    $("#m-dir").innerHTML = dir.length ? dir.map(a => '<button type="button" class="med-trip s-' + (a.en_linea ? (a.nivel || "estable") : "nd") + (a.sujeto === sel ? " on" : "") + '" data-s="' + esc(a.sujeto) + '"><b data-notr>' + esc(a.nombre || a.sujeto) + "</b><span><span data-notr>" + esc(a.sujeto) + "</span> · " + esc(a.rol || "") + "</span>" +
      "<span>" + (a.en_linea ? ICO[a.nivel || "estable"] + " " + NIVT[a.nivel || "estable"] + (a.alertas ? " · " + a.alertas + " alertas activas" : "") : "Sin contacto · " + hace(a.hace_s)) + "</span>" + (a.sin_leer ? '<i class="punto">' + a.sin_leer + "</i>" : "") + "</button>").join("") : "";
    $("#m-dir-nota").textContent = dir.length ? "Aparecen los tripulantes cuyo monitor ha informado a este servidor." : enlace ? "Ningún monitor de tripulante ha informado todavía. Abre el monitor en la dirección principal del servidor." : "Sin conexión con el servidor.";
  }
  $("#m-dir").addEventListener("click", e => { const b = e.target.closest("[data-s]"); if (!b) return; sel = b.dataset.s; guardar("ah-medico:sel", sel); est = null; msgs = []; ult = 0; evalua = null; interp = null; pintarDir(); pintar(); ciclo(); });

  // ---- cabecera del tripulante y pestañas
  function cabecera() {
    if (!est) { $("#m-cab").innerHTML = '<div class="med-cab"><h1>' + (sel ? "Esperando datos del tripulante" : "Selecciona un tripulante del directorio") + "</h1></div>"; $("#m-tabs").innerHTML = ""; return; }
    const e = est.estado, p = e.perfil, r = e.resumen, viva = est.hace_s < 15, nv = viva ? r.nivel : "nd";
    $("#m-cab").innerHTML = '<div class="med-cab s-' + nv + '"><div><h1 data-notr>' + esc(p.nombre) + "</h1><p><span data-notr>" + esc(p.id) + "</span> · " + esc(p.rol) + " · " + (e.edad == null ? "" : e.edad + " años · ") + (p.sexo === "M" ? "hombre" : "mujer") + " · " + esc(r.mision) + "</p></div>" +
      '<div class="med-niv"><span>Estado del monitor</span><b>' + (viva ? NIVT[r.nivel] : "Sin contacto") + "</b><em>" + (viva ? "telemetría recibida " + hace(est.hace_s) + " · " + esc(e.motor) : "último contacto " + hace(est.hace_s)) + "</em></div></div>" +
      (r.demo ? '<p class="nota med-aviso">El monitor de este tripulante está en modo demo: las señales son simuladas' + (r.situacion ? " (situación: " + esc(r.situacion) + ")" : "") + ".</p>" : "");
    $("#m-tabs").innerHTML = TABS.map(t => '<button type="button" data-t="' + t[0] + '"' + (t[0] === tab ? ' class="on"' : "") + ">" + t[1] + "</button>").join("");
  }
  $("#m-tabs").addEventListener("click", e => { const b = e.target.closest("[data-t]"); if (b) { tab = b.dataset.t; pintar(); } });

  // ---- pestañas
  const kp = (t, v, s, c) => '<div class="kpi s-' + (c || "nd") + '"><span>' + t + "</span><b>" + v + "</b><em>" + s + "</em></div>", nd = v => v == null ? "—" : v;
  function tablero() {
    const e = est.estado, v = e.vivo, L = e.limites, s = v.est, tg = v.cgmTend || 0;
    return '<div class="tarj c12"><h2>Signos en tiempo real <small>' + (est.hace_s < 15 ? "actualizado " + hace(est.hace_s) : "sin telemetría: últimos valores recibidos") + '</small></h2><div class="kpis med-kpis">' +
      kp("Frecuencia cardiaca", nd(v.hr) + "<small> lpm</small>", "ritmo " + esc(v.ritmo || "—") + " · límites " + L.hr.join("–"), s.hr) + kp("SpO₂", nd(v.spo2) + "<small> %</small>", "mínimo " + L.spo2[0], s.spo2) +
      kp("Presión arterial", v.sbp == null ? "—" : v.sbp + "/" + v.dbp + "<small> mmHg</small>", "media " + nd(v.map) + " · continua", s.pa) + kp("Frecuencia respiratoria", nd(v.fr) + "<small> rpm</small>", "límites " + L.fr.join("–"), s.fr) +
      kp("Temperatura", (v.temp == null ? "—" : v.temp.toFixed(1)) + "<small> °C</small>", "basal " + nd(e.perfil.temp_basal), s.temp) + kp("Glucosa intersticial", nd(v.cgm) + "<small> mg/dL</small>", (tg >= 0 ? "+" : "−") + Math.abs(tg).toFixed(1) + " mg/dL/min · límites " + L.cgm.join("–"), s.glu) +
      kp("Cabina", (v.co2 == null ? "—" : v.co2.toFixed(1)) + "<small> mmHg CO₂</small>", "presión " + nd(v.pcab) + " kPa · O₂ inspirado " + nd(v.pio2) + " mmHg", s.cab) + kp("Radiación", nd(v.rad) + "<small> µSv/h</small>", "carrera " + e.carrera_mSv.toFixed(1) + " de 600 mSv · altitud " + nd(v.alt) + " km", s.rad) + "</div></div>" +
      '<div class="tarj c12"><h2>Alertas activas <small>' + e.alertas.length + "</small></h2>" + tabla(["Nivel", "Alerta", "Valor", "Criterio", "Acción indicada", "Desde"], e.alertas.map(a => [etiqueta(NIVT[a.nivel], a.nivel), "<b>" + esc(a.nombre) + "</b><small>" + esc(a.regla) + " · " + esc(a.origen) + (a.cat ? " · bienestar" : "") + "</small>", esc(a.valor), esc(a.criterio), esc(a.accion), hora(a.desde) + (a.reconocida ? " · reconocida" : "")]), "Ninguna alerta activa.") + "</div>" +
      dolor() +
      [["g-hr", "Frecuencia cardiaca y SpO₂", "lpm · %"], ["g-pa", "Presión arterial", "sistólica y diastólica · mmHg"], ["g-glu", "Glucosa intersticial", "mg/dL"], ["g-temp", "Temperatura", "°C"], ["g-co2", "ppCO₂ de cabina", "mmHg"], ["g-rad", "Tasa de dosis", "µSv/h"]]
        .map(g => '<div class="tarj c6"><h2>' + g[1] + " <small>" + g[2] + '</small></h2><canvas class="lienzo" id="' + g[0] + '"></canvas></div>').join("");
  }
  function dolor() {
    const a = (est.estado.dolor || []), act = a.filter(x => x.activo), C = AH.Cuerpo, m = {}; if (!a.length) return ""; act.forEach(x => { (x.irradia || []).forEach(i => { m[i] = "irr"; }); }); act.forEach(x => { m[x.region] = "sel"; });
    return '<div class="tarj c12"><h2>Dolor referido por el tripulante <small>' + act.length + ' activos</small></h2><div class="dolor"><div class="dolor-mapa chico"><figure>' + C.svg("a", m) + "<figcaption>Vista anterior</figcaption></figure><figure>" + C.svg("p", m) + "<figcaption>Vista posterior</figcaption></figure></div><div>" +
      tabla(["Fecha", "Descripción clínica", "Estado"], a.slice().reverse().map(x => [fecha(x.t).slice(5) + " " + hora(x.t).slice(0, 5), '<span data-notr>' + esc(C.frase(x)) + "</span>", x.activo ? ["activo", "a"] : "resuelto"])) + '<p class="nota">Zona marcada: región del dolor. Contorno discontinuo: irradiación.</p></div></div></div>';
  }
  function graficas() {
    if (tab !== "tablero" || !est) return; const t = est.estado.tendencias, L = est.estado.limites, css = k => getComputedStyle(document.body).getPropertyValue(k).trim();
    linea($("#g-hr"), [{ datos: t.hr }, { datos: t.spo2, color: css("--estable"), guion: [2, 3] }], { t: t.t, bandas: [L.hr[1], L.spo2[0]] }); linea($("#g-pa"), [{ datos: t.sbp }, { datos: t.dbp, color: css("--tenue"), guion: [6, 4] }], { t: t.t, bandas: [L.sbp[1], L.sbp[0]] });
    linea($("#g-glu"), [{ datos: t.cgm }], { t: t.t, bandas: L.cgm }); linea($("#g-temp"), [{ datos: t.temp }], { t: t.t, bandas: [L.temp[1]] }); linea($("#g-co2"), [{ datos: t.co2 }], { t: t.t, bandas: [L.co2[1]] }); linea($("#g-rad"), [{ datos: t.rad }], { t: t.t, bandas: [L.rad[1]] });
  }
  function perfil() {
    const e = est.estado, p = e.perfil, m = p.medidas || {}, c = p.ciclo || {}, imc = p.masa_kg && p.estatura_cm ? (p.masa_kg / Math.pow(p.estatura_cm / 100, 2)).toFixed(1) : null, FA = { menstrual: "menstrual", folicular: "folicular", ovulatoria: "ovulatoria", lutea: "lútea" };
    const lista = (t, cab, filas) => '<div class="tarj"><h2>' + t + " <small>" + filas.length + "</small></h2>" + tabla(cab, filas) + "</div>";
    return '<div class="tarj c6"><h2>Datos obligatorios <small>' + (e.faltan.length ? e.faltan.length + " pendientes" : "completos") + "</small></h2>" + (e.faltan.length ? '<p class="s-precaucion" style="color:var(--c)">⚠ Falta: ' + esc(e.faltan.join("; ")) + ".</p>" : "") +
      dl([["Edad", e.edad == null ? null : e.edad + " años"], ["Sexo", p.sexo === "M" ? "hombre" : "mujer"], ["Origen étnico", '<span data-notr>' + esc(p.origen_etnico || "—") + "</span>"], ["Grupo sanguíneo", esc(p.sangre)], ["Estatura", p.estatura_cm + " cm"], ["Peso", p.masa_kg + " kg · previo al vuelo " + nd(p.masa_previa_kg) + " kg"], ["IMC", imc && imc + " kg/m²"], ["Temperatura basal", nd(p.temp_basal) + " °C"],
        ["Fase del ciclo", p.sexo === "F" ? (e.fase ? FA[e.fase.fase] + " · día " + e.fase.dia + " (estimada por calendario)" : c.aplica ? "no disponible" : "no aplica") : null], ["Anticoncepción hormonal combinada", p.sexo === "F" ? (c.hormonal ? "sí" : "no") : null]]) + "</div>" +
      '<div class="tarj c6"><h2>Medidas corporales y misión</h2>' + dl([["Cintura / cadera", nd(m.cintura_cm) + " / " + nd(m.cadera_cm) + " cm"], ["Cuello", nd(m.cuello_cm) + " cm"], ["Brazo / muslo / pantorrilla", nd(m.brazo_cm) + " / " + nd(m.muslo_cm) + " / " + nd(m.pantorrilla_cm) + " cm"], ["Grasa corporal", nd(m.grasa_pct) + " %"],
        ["Misión", '<span data-notr>' + esc(p.mision.nombre) + "</span> · día " + p.mision.dia + " de " + p.mision.duracion], ["Dosis de carrera", e.carrera_mSv.toFixed(1) + " mSv · " + (e.carrera_mSv / 6).toFixed(1) + " % del límite"], ["Dosis de la misión", p.rad.mision_mSv.toFixed(2) + " mSv"]]) + (p.demo ? '<p class="nota">Perfil de demostración con datos ficticios.</p>' : "") + "</div>" +
      '<div data-notr style="display:contents">' + lista("Antecedentes", ["Condición", "Estado", "Desde", "Nota"], p.antecedentes.map(a => [esc(a.nombre), esc(a.estado), esc(a.desde), esc(a.nota)])) + lista("Medicación", ["Medicamento", "Pauta", "Indicación"], p.medicacion.map(a => [esc(a.nombre), esc(a.pauta), esc(a.para)])) +
      lista("Alergias", ["Sustancia", "Reacción", "Severidad"], p.alergias.map(a => [esc(a.sustancia), esc(a.reaccion), esc(a.severidad)])) + "</div>" + (p.notas ? '<div class="tarj c12"><h2>Notas del expediente</h2><p data-notr>' + esc(p.notas) + "</p></div>" : "");
  }
  function laboratorio() {
    const L = est.estado.laboratorio, fl = m => m === "b" ? " ↓" : m === "a" ? " ↑" : "";
    return Object.keys(L).map(k => '<div class="tarj c12"><h2>' + L[k].titulo + " <small>" + L[k].filas.length + " estudios</small></h2>" + tabla(["Fecha"].concat(L[k].campos.map(c => c.nombre + "<br>" + c.unidad), ["Nota"]),
      (L[k].filas.length ? [["Referencia"].concat(L[k].campos.map(c => c.ref), [""])] : []).concat(L[k].filas.slice().reverse().map(r => [esc(r.fecha)].concat(L[k].campos.map(c => { const x = r.v[c.k]; return [x[0] == null ? "—" : x[0] + fl(x[1]), x[1]]; }), ['<span data-notr>' + esc(r.nota) + "</span>"])))) + "</div>").join("") +
      '<div class="tarj c12"><p class="nota">Intervalos de referencia orientativos de adulto. Las hormonas sexuales se comparan con el intervalo de la fase del ciclo en la fecha del estudio. ↓ por debajo y ↑ por encima del intervalo.</p></div>';
  }
  function bienestar() {
    const b = est.estado.bienestar, act = id => est.estado.alertas.some(a => id.split(" · ").includes(a.regla));
    return '<div class="tarj c12"><h2>Señales de bienestar que recibe el motor</h2>' + tabla(["Señal", "Valor", "Regla", "Criterio", "Estado"], b.senales.map(s => [s.nombre, s.valor == null ? "sin registro" : esc(s.valor), s.regla, s.criterio, s.valor == null ? "—" : act(s.regla) ? ["alerta activa", "a"] : "sin alerta"])) + "</div>" +
      '<div class="tarj c12"><h2>Registros recientes</h2>' + tabla(["Fecha", "Registro", "Resultado", "Señal al motor"], b.registros.slice().reverse().map(r => [fecha(r.t) + " " + hora(r.t).slice(0, 5), r.registro, esc(r.resultado), r.senal ? "sí" : "no"])) + "</div>";
  }
  function evaluacion() {
    let h = '<div class="tarj c12"><h2>Evaluación completa con el motor <small>todas las reglas del catálogo sobre los datos actuales del tripulante</small></h2><div class="fila-btn"><button type="button" class="btn pri" data-a="evaluar"' + (ocupado ? " disabled" : "") + ">" + (ocupado ? "Evaluando…" : "Evaluar ahora") + "</button>" +
      (est.estado.evaluacion ? '<span class="nota">Última evaluación hecha a bordo: ' + hora(est.estado.evaluacion.t) + " · nivel " + NIV[est.estado.evaluacion.nivel][0].toLowerCase() + " · " + est.estado.evaluacion.hallazgos + " hallazgos</span>" : "") + "</div>" + (evalua && evalua.error ? '<p class="s-precaucion" style="color:var(--c)">No se pudo evaluar: ' + esc(evalua.error) + "</p>" : "") + "</div>";
    if (!evalua || !evalua.r) return h;
    const r = evalua.r, c = r.cobertura, e = r.ensamble || {}, n = NIV[r.nivel_final], pd = (r.no_evaluable || {}).por_dominio || {}, fila = a => [etiqueta((NIV[a.nivel] || ["Sin nivel"])[0], (NIV[a.nivel] || [0, "nd"])[1]), "<b>" + esc(a.nombre) + "</b><small>" + esc(a.id) + " · " + esc(a.dominio) + "</small>", esc(AH.humano(a.criterio)) + (a.valor == null || /==\s*1/.test(a.criterio) ? "" : " · medido " + a.valor), esc(a.accion_propuesta || ""), esc(a.que_hacer || a.confirmacion || "")];
    h += '<div class="tarj c12 ev-res s-' + n[1] + '"><div class="ev-nivel"><span>Nivel de la evaluación</span><b>' + n[0] + "</b><em>" + hora(evalua.t) + '</em></div><div class="kpis">' + kp("Hallazgos", (r.alertas || []).length, "reglas activadas") + kp("Por verificar", (r["verificar_señal"] || []).length, "señales en duda") + kp("Reglas evaluadas", c.evaluadas + "<small> de " + c.reglas_con_nivel_habilitadas + "</small>", c.no_calculables + " sin datos · " + c.no_aplican_por_contexto + " no aplican en esta fase") + "</div></div>";
    h += '<div class="tarj c12"><h2>Hallazgos</h2>' + tabla(["Nivel", "Hallazgo", "Criterio y valor", "Acción propuesta", "Confirmación"], (r.alertas || []).map(fila), "Ninguna regla se activa con los datos disponibles.") + "</div>";
    if ((r["verificar_señal"] || []).length) h += '<div class="tarj c12"><h2>Señales por verificar</h2>' + tabla(["Nivel si se confirma", "Hallazgo", "Criterio y valor", "Acción propuesta", "Qué hacer"], r["verificar_señal"].map(fila)) + "</div>";
    if ((r.lecturas_cercanas_a_umbral || []).length) h += '<div class="tarj c6"><h2>Lecturas próximas a un umbral</h2>' + tabla(["Medida", "Valor", "Umbral", "Si lo cruzara"], r.lecturas_cercanas_a_umbral.map(l => [esc(AH.etq(l.variable)), l.valor, esc(String(l.umbral).replace(">=", "≥").replace("<=", "≤")), etiqueta(NIV[l.nivel_si_cruzara][0], NIV[l.nivel_si_cruzara][1])])) + "</div>";
    if (e.disponible) h += '<div class="tarj c6"><h2>Ensamble de modelos</h2>' + tabla(["Resultado", "Valor"], [["Nivel más probable", etiqueta(NIV[e.nivel_mas_probable][0], NIV[e.nivel_mas_probable][1])], ["Nivel conservador", etiqueta(NIV[e.nivel_conservador][0], NIV[e.nivel_conservador][1])], ["Puntuación de prioritaria o superior", ((e.puntuacion_acumulada || {})[">=PRIORITARIA"] * 100).toFixed(1) + " %"], ["Acuerdo entre los modelos", (e.acuerdo_entre_modelos * 100).toFixed(0) + " %"]]) + '<p class="nota">Puntuación sobre el nivel de triaje, calibrada solo en un banco sintético. No es probabilidad de enfermedad.</p></div>';
    if ((r.plan_por_antecedentes || []).length) h += '<div class="tarj c12"><h2>Plan de vigilancia por antecedentes</h2>' + tabla(["Antecedente", "Modificación del plan"], r.plan_por_antecedentes.map(p => [esc(p.antecedente), esc(p.modificacion_del_plan)])) + "</div>";
    const dn = Object.keys(pd); if (dn.length) h += '<div class="tarj c12"><h2>Cobertura por dominio <small>' + dn.length + " dominios con reglas sin evaluar</small></h2><details><summary>Qué falta medir y cómo completarlo</summary>" + tabla(["Dominio", "Reglas sin evaluar", "Datos que faltan", "Cómo completarlos"], dn.map(k => [esc(k), pd[k].reglas_sin_evaluar, esc(pd[k].faltan.map(AH.etq).join("; ")), esc((pd[k].como_completar || []).join("; "))])) + "</details></div>";
    return h;
  }
  function alertas() {
    return '<div class="tarj c12"><h2>Alertas de la sesión del tripulante <small>las más recientes arriba</small></h2>' + tabla(["Inicio", "Fin", "Nivel", "Alerta", "Valor", "Regla", "Origen"], est.estado.historial.slice().reverse().map(a => [hora(a.desde), a.hasta ? hora(a.hasta) : "activa", etiqueta(NIVT[a.nivel], a.nivel), esc(a.nombre), esc(a.valor), esc(a.regla), esc(a.origen)]), "Sin alertas en la sesión.") + "</div>";
  }
  function interpretacion() {
    return '<div class="tarj c12"><h2>Interpretación del paquete biométrico <small>modelo de lenguaje con el papel de Astronaut Healer</small></h2><p class="nota">Envía al modelo el paquete biométrico actual del tripulante: mediciones continuas, cabina, radiación, laboratorio, bienestar, alertas e historial.</p>' +
      '<div class="fila-btn"><button type="button" class="btn pri" data-a="interpretar"' + (ocupado ? " disabled" : "") + ">" + (ocupado ? "Consultando al modelo…" : "Pedir interpretación") + '</button><button type="button" class="btn" data-a="enviar-interp"' + (interp && interp.texto ? "" : " disabled") + ">Enviar la interpretación al tripulante</button></div>" +
      (interp ? (interp.error ? '<p class="s-precaucion" style="color:var(--c)">Sin respuesta del modelo: ' + esc(interp.error) + "</p>" : '<div class="ev-orient"><h3>' + esc(interp.origen) + " · " + hora(interp.t) + '</h3><p data-notr>' + esc(interp.texto).replace(/\n/g, "<br>") + '</p><p class="nota">Texto generado por un modelo de lenguaje. No sustituye el criterio del médico de vuelo.</p></div>') : "") +
      '<h3>Paquete biométrico compacto <small>' + String(est.estado.paquete).length + ' caracteres</small></h3><pre class="paquete" data-notr>' + esc(est.estado.paquete) + "</pre></div>";
  }
  const VISTAS = { tablero, perfil, laboratorio, bienestar, evaluacion, alertas, interpretacion };
  function pintar() { cabecera(); $("#m-cuerpo").innerHTML = est ? VISTAS[tab]() : ""; graficas(); $("#m-com-quien").textContent = est ? est.estado.perfil.nombre + " · " + sel : ""; $("#m-texto").disabled = !sel; pintarHilo(); }
  const HEALER = "You are Astronaut Healer, the flight-medicine clinician AI supporting the ground flight surgeon of a space mission. You reason like an experienced aerospace physician and account for spaceflight physiology: fluid shift, cardiovascular deconditioning, bone and muscle loss, renal stone risk, neuro-ocular syndrome, radiation, CO2 exposure, circadian disruption, isolation and workload. " +
    "You receive the BIOMETRIC PACKAGE of one astronaut, sent by the onboard monitor, in the compact text format AHBIO1 (one section per line: ID identity and anthropometry, VS vital signs with session range, ENV cabin and radiation, ALR active alerts with level U urgent / P caution / A notice, LAB out-of-range results, WB wellbeing flags, PAIN anatomical region, descriptor, NRS, onset, course, radiation and associated symptoms, HX/RX/ALG history, medication and allergies, EV last full evaluation). Interpret it for the flight surgeon in plain text without markdown, with these headed sections: 1) OVERALL STATUS. 2) FINDINGS BY SYSTEM, most urgent first, citing each value with its unit and its reference or threshold. 3) DIFFERENTIAL CONSIDERATIONS in the spaceflight context. 4) RECOMMENDED CHECKS on board, in order. 5) WHAT TO WATCH and data that is missing. " +
    "Use only the figures in the package; never invent a value. Do not lower the level assigned by the alert engine. The flight surgeon decides.";
  $("#m-cuerpo").addEventListener("click", async e => {
    const b = e.target.closest("[data-a]"); if (!b || ocupado || !est) return; const a = b.dataset.a;
    if (a === "evaluar") { ocupado = true; pintar(); try { evalua = { r: await api("/api/evaluar", { datos: est.estado.entradas, explicar: true }), t: Date.now() }; } catch (err) { evalua = { error: err.message }; } ocupado = false; pintar(); }
    else if (a === "interpretar") { ocupado = true; pintar(); try { const r = await api("/api/llm", { proveedor: (cfgMon.llm && cfgMon.llm.proveedor === "local") ? "local" : "groq", modelo: cfgMon.llm && (cfgMon.llm.proveedor === "local" ? cfgMon.llm.modelo_local : cfgMon.llm.modelo), base: cfgMon.llm && cfgMon.llm.base_local, max_tokens: 1800,
        mensajes: [{ role: "system", content: HEALER + (idioma === "en" ? " Answer in English." : " Responde siempre en español.") }, { role: "user", content: "BIOMETRIC PACKAGE\n" + est.estado.paquete }] }); interp = { texto: String(r.texto || "").trim(), origen: "Astronaut Healer · " + r.proveedor + " · " + r.modelo, t: Date.now() }; } catch (err) { interp = { error: err.message }; } ocupado = false; pintar(); }
    else if (a === "enviar-interp" && interp && interp.texto) { await enviar("Interpretación del paquete biométrico (" + interp.origen + ", revisada por " + autor + "):\n" + interp.texto); }
  });

  // ---- intercomunicación
  function pintarHilo() {
    const c = $("#m-hilo"), abajo = c.scrollHeight - c.scrollTop - c.clientHeight < 40;
    c.innerHTML = msgs.length ? msgs.map(m => '<div class="msg ' + (m.de === "tierra" ? "yo" : "tierra") + '"><small>' + esc(m.de === "tierra" ? (m.autor || "Médico en tierra") : (m.autor || "Tripulante")) + " · " + fecha(m.t * 1000).slice(5) + " " + hora(m.t * 1000).slice(0, 5) + (m.tipo === "consulta" ? " · " + AH.tr("consulta") : "") + "</small>" +
      (m.tipo === "consulta" || m.tipo === "dolor" ? "<details open><summary>" + esc(m.texto.split("\n")[0]) + "</summary>" + esc(m.texto.split("\n").slice(1).join("\n")).replace(/\n/g, "<br>") + "</details>" : esc(m.texto).replace(/\n/g, "<br>")) + "</div>").join("") : '<div class="msg sis">' + (sel ? "Sin mensajes con este tripulante." : "") + "</div>";
    if (abajo) c.scrollTop = c.scrollHeight;
  }
  async function enviar(texto) { texto = String(texto || "").trim(); if (!texto || !sel) return; const m = await api("/api/mensajes", { sujeto: sel, de: "tierra", autor, texto }); msgs.push(m); ult = Math.max(ult, m.id); pintarHilo(); $("#m-hilo").scrollTop = 1e9; }
  $("#m-form").addEventListener("submit", e => { e.preventDefault(); const i = $("#m-texto"), t = i.value; i.value = ""; enviar(t).catch(err => { i.value = t; alertar("No se pudo enviar: " + err.message); }); });
  function alertar(t) { $("#m-dir-nota").textContent = t; }

  // ---- ciclo de lectura
  let enCurso = false;
  async function ciclo() {
    if (enCurso) return; enCurso = true;
    try {
      dir = (await api("/api/tripulacion")).tripulacion; enlace = true; if (!sel && dir.length) { sel = dir[0].sujeto; guardar("ah-medico:sel", sel); } if (sel && !dir.some(d => d.sujeto === sel) && dir.length) sel = dir[0].sujeto;
      if (sel && dir.some(d => d.sujeto === sel)) {
        est = await api("/api/tripulacion/estado?sujeto=" + encodeURIComponent(sel));
        const d = await api("/api/mensajes?sujeto=" + encodeURIComponent(sel) + "&desde=" + ult + "&lector=tierra"), nuevos = d.mensajes.filter(m => m.id > ult);
        nuevos.forEach(m => { msgs.push(m); ult = Math.max(ult, m.id); }); if (nuevos.length) pintarHilo();
      }
    } catch (e) { enlace = false; }
    enCurso = false;
    const ch = $("#m-enlace"); ch.className = "chip s-" + (enlace ? "estable" : "urgencia"); $("em", ch).textContent = enlace ? "Conectado" : "Desconectado";
    pintarDir(); const foco = document.activeElement && $("#m-cuerpo").contains(document.activeElement), abierto = $$("#m-cuerpo details[open]").length;
    if (est && !ocupado && !foco && !abierto && ["tablero", "bienestar", "alertas"].includes(tab)) pintar(); else cabecera();
  }
  $("#m-autor").value = autor; $("#m-autor").addEventListener("change", e => { autor = e.target.value.trim() || "Médico de vuelo"; guardar("ah-medico:autor", autor); });
  $$("#m-idioma button").forEach(b => { b.classList.toggle("on", b.dataset.id === idioma); b.addEventListener("click", () => { guardar("ah-medico:idioma", b.dataset.id); location.reload(); }); });
  setInterval(() => { $("#m-reloj").textContent = hora(); }, 1000); setInterval(ciclo, 2000);
  if (location.protocol === "file:") { $("#m-cab").innerHTML = '<div class="med-cab"><h1>Abre esta consola desde el servidor del monitor</h1><p>Por ejemplo: http://127.0.0.1:8777/medico</p></div>'; } else { pintar(); ciclo(); }
})();
