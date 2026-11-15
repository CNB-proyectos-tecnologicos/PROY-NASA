/* Perfil: datos obligatorios, mediciones continuas, laboratorio (biometría hemática, nutrientes, hormonas), historial y expediente.
   Todo lo que el catálogo del motor sabe interpretar se traduce a sus variables en AH.extra() y AH.contexto(). */
(function () {
  const { $, $$, esc, V, H, cfg, on, log, uid, fecha, hora } = AH, M = AH.Motor;
  const TABS = [["resumen", "Resumen"], ["obligatorios", "Datos obligatorios"], ["mediciones", "Mediciones"], ["laboratorio", "Laboratorio"], ["historial", "Historial"], ["expediente", "Expediente"]];
  let tab = "resumen";
  const P = () => AH.perfil, DIA = 864e5;
  // Intervalos de referencia orientativos de adulto; cada laboratorio define los suyos. Las hormonas sexuales dependen de la fase del ciclo.
  const LABS = {
    bh: ["Biometría hemática", [["hb", "Hemoglobina", "g/dL", { F: [12.0, 15.5], M: [13.5, 17.5] }], ["hto", "Hematocrito", "%", { F: [36, 46], M: [41, 53] }], ["eri", "Eritrocitos", "×10⁶/µL", { F: [4.1, 5.1], M: [4.5, 5.9] }],
      ["vcm", "VCM", "fL", [80, 100]], ["hcm", "HCM", "pg", [27, 33]], ["cmhc", "CMHC", "g/dL", [32, 36]], ["leu", "Leucocitos", "×10³/µL", [4.5, 11.0]], ["neu", "Neutrófilos", "%", [40, 70]], ["lin", "Linfocitos", "%", [20, 40]], ["plaq", "Plaquetas", "×10³/µL", [150, 450]]]],
    nut: ["Nutrientes y química sanguínea", [["vitd", "Vitamina D 25-OH", "ng/mL", [30, 100]], ["ferritina", "Ferritina", "ng/mL", { F: [15, 150], M: [30, 400] }], ["hierro", "Hierro sérico", "µg/dL", [60, 170]], ["b12", "Vitamina B12", "pg/mL", [200, 900]],
      ["folato", "Folato sérico", "ng/mL", [3, 17]], ["calcio", "Calcio total", "mg/dL", [8.5, 10.5]], ["albumina", "Albúmina", "g/dL", [3.5, 5.0]], ["magnesio", "Magnesio", "mg/dL", [1.7, 2.2]], ["zinc", "Zinc", "µg/dL", [60, 120]],
      ["sodio", "Sodio", "mmol/L", [135, 145]], ["potasio", "Potasio", "mmol/L", [3.5, 5.0]], ["creatinina", "Creatinina", "mg/dL", { F: [0.5, 1.1], M: [0.7, 1.3] }], ["hba1c", "HbA1c", "%", [4.0, 5.6]]]],
    hor: ["Perfil hormonal", [["tsh", "TSH", "mUI/L", [0.4, 4.0]], ["t4l", "T4 libre", "ng/dL", [0.8, 1.8]], ["cortisol", "Cortisol matutino", "µg/dL", [5, 25]],
      ["estradiol", "Estradiol", "pg/mL", { M: [10, 40], fase: { folicular: [12.5, 166], ovulatoria: [85.8, 498], lutea: [43.8, 211] } }],
      ["progesterona", "Progesterona", "ng/mL", { M: [0.2, 1.4], fase: { folicular: [0.2, 1.5], ovulatoria: [0.8, 3.0], lutea: [1.7, 27] } }],
      ["lh", "LH", "mUI/mL", { M: [1.7, 8.6], fase: { folicular: [2.4, 12.6], ovulatoria: [14, 95.6], lutea: [1.0, 11.4] } }],
      ["fsh", "FSH", "mUI/mL", { M: [1.5, 12.4], fase: { folicular: [3.5, 12.5], ovulatoria: [4.7, 21.5], lutea: [1.7, 7.7] } }],
      ["testosterona", "Testosterona total", "ng/dL", { F: [15, 70], M: [300, 1000] }], ["insulina", "Insulina en ayuno", "µUI/mL", [2, 20]]]]
  };
  const MEDIDAS = [["cintura_cm", "Cintura cm"], ["cadera_cm", "Cadera cm"], ["cuello_cm", "Cuello cm"], ["brazo_cm", "Brazo cm"], ["muslo_cm", "Muslo cm"], ["pantorrilla_cm", "Pantorrilla cm"], ["grasa_pct", "Grasa corporal %"]];
  const MAN = [["masa_kg", "Masa kg", 0.1], ["sbp", "PA sistólica", 1], ["dbp", "PA diastólica", 1], ["temp", "Temperatura °C", 0.1], ["glucosa", "Glucosa capilar mg/dL", 1]];
  const FASES = { menstrual: "Menstrual", folicular: "Folicular", ovulatoria: "Ovulatoria", lutea: "Lútea" };
  const edad = () => { const n = new Date(P().nacimiento); if (isNaN(n)) return null; const h = new Date(); let e = h.getFullYear() - n.getFullYear(); if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--; return e; };
  // fase del ciclo estimada por calendario: ovulación 14 días antes de la siguiente menstruación
  function fase(t) {
    const p = P(), c = p.ciclo || {}; if (p.sexo !== "F" || !c.aplica || !c.fum || !(c.duracion >= 21 && c.duracion <= 40)) return null;
    const d0 = new Date(c.fum).getTime(), d = Math.floor(((t ? new Date(t).getTime() : Date.now()) - d0) / DIA); if (isNaN(d) || d < 0 || d > 90) return null;
    const dia = d % c.duracion + 1, ov = c.duracion - 14;
    return { dia, fase: dia <= 5 ? "menstrual" : dia < ov - 1 ? "folicular" : dia <= ov + 1 ? "ovulatoria" : "lutea" };
  }
  function rango(campo, fechaMuestra) {
    const r = campo[3]; if (Array.isArray(r)) return r;
    if (r.fase) { if (P().sexo === "M") return r.M; const f = fase(fechaMuestra); return f ? r.fase[f.fase === "menstrual" ? "folicular" : f.fase] : null; }
    return r[P().sexo === "M" ? "M" : "F"];
  }
  const marca = (campo, v, f) => { const r = rango(campo, f); return v == null || !r ? "" : v < r[0] ? "b" : v > r[1] ? "a" : ""; };
  const flecha = c => c === "b" ? " ↓" : c === "a" ? " ↑" : "";
  const ultimo = k => { const a = P().labs[k]; return a.length ? a[a.length - 1] : null; };
  const est = a => { const x = a.filter(v => v != null); return x.length ? { min: Math.min(...x), max: Math.max(...x), med: x.reduce((p, q) => p + q, 0) / x.length } : null; };
  const r2 = x => Math.round(x * 100) / 100;

  // ---- lo que el motor recibe del perfil
  AH.contexto = function () {
    const p = P(), c = { mission_phase: "INFLIGHT" }, e = edad(), n = ultimo("nut");
    if (e != null) c.age_years = e; if (p.estatura_cm) c.estatura_cm = p.estatura_cm; if (p.masa_kg) c.mass_kg = p.masa_kg; if (p.medidas.cintura_cm) c.waist_cm = p.medidas.cintura_cm;
    if (p.sexo === "F" || p.sexo === "M") c.sex_for_formula = p.sexo; if (n && n.creatinina != null) c.serum_creatinine_mg_dl = n.creatinina;
    return c;
  };
  AH.extra = function () {
    const p = P(), x = {}, b = ultimo("bh"), b0 = p.labs.bh[0], n = ultimo("nut"), h = ultimo("hor");
    if (b) { if (b.plaq != null) x.platelets_10e9_l = b.plaq; if (b.leu != null) x.wbc_10e9_l = b.leu; if (b.leu != null && b.neu != null) x.anc_10e9_l = r2(b.leu * b.neu / 100);
      if (b0 && b0 !== b && b.hb && b0.hb) x.hemoglobin_ratio_baseline = r2(b.hb / b0.hb); if (b0 && b0 !== b && b.hto && b0.hto) x.hematocrit_ratio_baseline = r2(b.hto / b0.hto); }
    if (n) { if (n.vitd != null) x.vitd_25oh_ng_ml = n.vitd; if (n.calcio != null) x.serum_calcium_corrected = r2(n.albumina != null ? n.calcio + 0.8 * (4 - n.albumina) : n.calcio);     // corrección por albúmina
      if (n.sodio != null) x.sodium_mmol_l = n.sodio; if (n.potasio != null) x.potassium_mmol_l = n.potasio; if (n.hba1c != null) x.hba1c_pct = n.hba1c; }
    if (h) { if (h.tsh != null) { x.tsh_high_flag = h.tsh > 4.0 ? 1 : 0; x.tsh_low_flag = h.tsh < 0.4 ? 1 : 0; }
      if (h.progesterona != null && p.sexo === "F") { const m = marca(LABS.hor[1][4], h.progesterona, h.fecha); if (rango(LABS.hor[1][4], h.fecha)) x.progesterone_phase_abnormal_flag = m ? 1 : 0; } }
    if (p.masa_kg && p.masa_previa_kg) x.mass_ratio_preflight = r2(p.masa_kg / p.masa_previa_kg);
    if (p.sexo === "F") { const c = p.ciclo || {}; x.cycle_phase_unavailable = fase() ? 0 : 1; x.high_risk_hormone_use = c.hormonal ? 1 : 0;
      if (c.aplica && c.fum) x.amenorrhea_flag = (Date.now() - new Date(c.fum).getTime()) / DIA > 90 ? 1 : 0; }
    if (AH.Dolor && (p.dolor || []).some(d => AH.Cuerpo.TORAX.includes(d.region))) x.chest_pain_flag = AH.Dolor.toracico() ? 1 : 0;      // dolor torácico señalado en el mapa corporal
    return Object.assign(x, AH.Bienestar ? AH.Bienestar.vars() : {});
  };
  // datos obligatorios: qué falta
  function faltantes() {
    const p = P(), f = [], m = p.medidas || {};
    if (!p.estatura_cm) f.push("estatura"); if (!p.masa_kg) f.push("peso"); if (edad() == null) f.push("fecha de nacimiento (edad)"); if (!p.temp_basal) f.push("temperatura basal"); if (!p.origen_etnico) f.push("origen étnico");
    if (p.sexo === "F" && p.ciclo && p.ciclo.aplica && !fase()) f.push("fase del ciclo (fecha de la última menstruación)");
    if (!m.cintura_cm || !m.cadera_cm) f.push("medidas corporales (cintura y cadera)");
    [["hr", "medición cardiaca continua"], ["sbp", "presión arterial continua"], ["cgm", "medición de glucosa"], ["spo2", "medición de oxígeno"]].forEach(c => { if (V[c[0]] == null) f.push(c[1] + " (sin señal)"); });
    return f;
  }
  AH.faseCiclo = fase;

  $("#tabs-perfil").innerHTML = TABS.map(t => '<button type="button" data-pt="' + t[0] + '">' + t[1] + "</button>").join("");
  $("#tabs-perfil").addEventListener("click", e => { const b = e.target.closest("[data-pt]"); if (b) { tab = b.dataset.pt; pintar(); } });
  const kp = (t, v, s, c) => '<div class="kpi ' + (c || "") + '"><span>' + t + "</span><b>" + v + "</b><em>" + s + "</em></div>";
  const tabla = (cab, filas) => filas.length ? '<div class="tabla"><table><thead><tr>' + cab.map(c => "<th>" + c + "</th>").join("") + "</tr></thead><tbody>" + filas.map(f => "<tr>" + f.map(c => typeof c === "object" ? '<td class="' + c[1] + '">' + c[0] + "</td>" : "<td>" + c + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>" : '<p class="nota">Sin registros.</p>';
  const inp = (id, et, val, tipo, paso, attr) => '<label class="campo">' + et + '<input type="' + (tipo || "number") + '" id="' + id + '" ' + (attr || "") + (paso ? ' step="' + paso + '"' : "") + ' value="' + esc(val == null ? "" : val) + '"></label>';
  const anomalos = () => { const o = []; Object.keys(LABS).forEach(k => { const u = ultimo(k); if (u) LABS[k][1].forEach(c => { const m = marca(c, u[c[0]], u.fecha); if (m) o.push(c[1] + " " + u[c[0]] + " " + c[2] + flecha(m)); }); }); return o; };

  function resumen() {
    const p = P(), car = M.carrera(), f = faltantes(), fs = fase(), an = anomalos(), al = M.historial, n = k => al.filter(a => a.nivel === k).length, imc = p.masa_kg && p.estatura_cm ? p.masa_kg / Math.pow(p.estatura_cm / 100, 2) : null;
    const s = k => { const e = est(H[k]); return e ? (k === "temp" ? e.min.toFixed(1) + "–" + e.max.toFixed(1) : Math.round(e.min) + "–" + Math.round(e.max)) : "sin datos"; };
    return '<div class="tarj c12"><h2>' + esc(p.nombre) + " <small>" + esc(p.id) + " · " + esc(p.rol) + " · " + (edad() == null ? "edad sin registrar" : edad() + " años") + " · " + esc(p.sangre || "") + (p.demo ? " · perfil de demostración con datos ficticios" : "") + "</small></h2>" +
      '<div class="kpis">' + kp("FC", (V.hr == null ? "—" : V.hr) + "<small> lpm</small>", "sesión " + s("hr"), "s-" + M.estadoVar("hr")) + kp("SpO₂", (V.spo2 == null ? "—" : V.spo2) + "<small> %</small>", "sesión " + s("spo2"), "s-" + M.estadoVar("spo2")) +
      kp("PA", V.sbp == null ? "—" : V.sbp + "/" + V.dbp, "sistólica " + s("sbp"), "s-" + M.estadoVar("pa")) + kp("Glucosa", (V.cgm == null ? "—" : V.cgm) + "<small> mg/dL</small>", "sesión " + s("cgm"), "s-" + M.estadoVar("glu")) +
      kp("Temperatura", (V.temp == null ? "—" : V.temp.toFixed(1)) + "<small> °C</small>", "basal " + (p.temp_basal || "—"), "s-" + M.estadoVar("temp")) + kp("IMC", imc ? imc.toFixed(1) : "—", p.masa_kg + " kg · " + p.estatura_cm + " cm") +
      kp("Dosis de carrera", car.toFixed(1) + "<small> mSv</small>", (car / 6).toFixed(1) + " % de 600 mSv", "s-" + (car >= 600 ? "urgencia" : car >= 480 ? "precaucion" : "estable")) + kp("Alertas en la sesión", al.length, n("urgencia") + " urgencias · " + n("precaucion") + " precauciones", al.length ? "s-precaucion" : "s-estable") + "</div>" +
      '<div class="fila-btn"><button type="button" class="btn pri" data-x="todo">Exportar todo · JSON</button><button type="button" class="btn" data-x="signos">Signos de la sesión · CSV</button><button type="button" class="btn" data-x="alertas">Alertas · CSV</button><button type="button" class="btn" data-x="importar">Importar perfil · JSON</button></div></div>' +
      '<div class="tarj c6"><h2>Datos obligatorios <small>' + (f.length ? f.length + " pendientes" : "completos") + "</small></h2>" + (f.length ? '<p class="s-precaucion" style="color:var(--c)">⚠ Falta: ' + esc(f.join("; ")) + ".</p>" : '<p class="s-estable" style="color:var(--c)">✓ Estatura, peso, edad, temperatura, origen étnico, medidas corporales y las cuatro mediciones continuas están presentes.</p>') +
      "<dl><dt>Origen étnico</dt><dd>" + esc(p.origen_etnico || "—") + "</dd>" + (p.sexo === "F" ? "<dt>Fase del ciclo</dt><dd>" + (fs ? FASES[fs.fase] + " · día " + fs.dia + " (estimada por calendario)" : p.ciclo && p.ciclo.aplica ? "no disponible" : "no aplica") + "</dd>" : "") +
      "<dt>Cintura / cadera</dt><dd>" + (p.medidas.cintura_cm || "—") + " / " + (p.medidas.cadera_cm || "—") + " cm</dd><dt>Masa respecto al prevuelo</dt><dd>" + (p.masa_previa_kg ? (100 * p.masa_kg / p.masa_previa_kg - 100).toFixed(1) + " %" : "—") + "</dd></dl></div>" +
      '<div class="tarj c6"><h2>Laboratorio <small>últimos estudios</small></h2>' + (an.length ? '<p class="s-precaucion" style="color:var(--c)">⚠ Fuera del intervalo de referencia: ' + esc(an.join("; ")) + ".</p>" : '<p class="s-estable" style="color:var(--c)">✓ Sin valores fuera del intervalo de referencia en los últimos estudios.</p>') +
      "<dl>" + Object.keys(LABS).map(k => { const u = ultimo(k); return "<dt>" + LABS[k][0] + "</dt><dd>" + (u ? esc(u.fecha) + (u.nota ? " · " + esc(u.nota) : "") : "sin estudios") + "</dd>"; }).join("") + "</dl></div>" +
      '<div class="tarj c6"><h2>Frecuencia cardiaca y SpO₂ <small>sesión</small></h2><canvas class="lienzo" id="g-hr"></canvas></div><div class="tarj c6"><h2>Presión arterial <small>sistólica y diastólica · mmHg</small></h2><canvas class="lienzo" id="g-pa"></canvas></div>' +
      '<div class="tarj c6"><h2>Glucosa intersticial <small>mg/dL</small></h2><canvas class="lienzo" id="g-glu"></canvas></div><div class="tarj c6"><h2>Radiación <small>tasa de dosis · µSv/h</small></h2><canvas class="lienzo" id="g-rad"></canvas></div>';
  }
  function graficas() {
    const C = k => getComputedStyle(document.documentElement).getPropertyValue(k).trim(), et = ["inicio de la sesión", "ahora"];
    if (tab === "resumen" || tab === "mediciones") {
      AH.grafica($("#g-hr"), [{ datos: H.hr.slice(), relleno: true }, { datos: H.spo2.slice(), color: C("--estable"), guion: [2, 4] }], { min: 30, max: 190, etiquetas: et, bandas: [[cfg.limites.hr[1]]] });
      AH.grafica($("#g-pa"), [{ datos: H.sbp.slice() }, { datos: H.dbp.slice(), color: C("--tenue"), guion: [8, 5] }], { min: 40, max: 200, etiquetas: et, bandas: [[cfg.limites.sbp[0], cfg.limites.sbp[1]]] });
      AH.grafica($("#g-glu"), [{ datos: H.cgm.slice(), relleno: true }], { min: 40, max: 300, etiquetas: et, bandas: [cfg.limites.cgm] });
    }
    if (tab === "resumen") AH.grafica($("#g-rad"), [{ datos: H.rad.slice(), relleno: true }], { margen: 3, etiquetas: et });
    if (tab === "mediciones") AH.grafica($("#g-temp"), [{ datos: H.temp.slice(), relleno: true }], { min: 34, max: 41, etiquetas: et, bandas: [[cfg.limites.temp[1]]] });
  }
  function obligatorios() {
    const p = P(), m = p.medidas, c = p.ciclo, fs = fase(), f = faltantes(), e = edad(), imc = p.masa_kg && p.estatura_cm ? p.masa_kg / Math.pow(p.estatura_cm / 100, 2) : null;
    return '<div class="tarj c12"><h2>Datos obligatorios <small>' + (f.length ? "pendiente: " + esc(f.join("; ")) : "completos") + '</small></h2><div class="campos">' +
      inp("ob-nombre", "Nombre", p.nombre, "text", 0, 'data-k="nombre"') + inp("ob-id", "Identificador", p.id, "text", 0, 'data-k="id"') + inp("ob-rol", "Rol", p.rol, "text", 0, 'data-k="rol"') +
      inp("ob-nac", "Fecha de nacimiento" + (e != null ? " · " + e + " años" : ""), p.nacimiento, "date", 0, 'data-k="nacimiento"') +
      '<label class="campo">Sexo<select id="ob-sexo" data-k="sexo"><option value="F"' + (p.sexo === "F" ? " selected" : "") + '>Mujer</option><option value="M"' + (p.sexo === "M" ? " selected" : "") + ">Hombre</option></select></label>" +
      inp("ob-sangre", "Grupo sanguíneo", p.sangre, "text", 0, 'data-k="sangre"') + inp("ob-etnia", "Origen étnico (autodeclarado)", p.origen_etnico, "text", 0, 'data-k="origen_etnico"') +
      inp("ob-est", "Estatura cm", p.estatura_cm, "number", 0.1, 'data-k="estatura_cm"') + inp("ob-masa", "Peso actual kg", p.masa_kg, "number", 0.1, 'data-k="masa_kg"') + inp("ob-masa0", "Peso previo al vuelo kg", p.masa_previa_kg, "number", 0.1, 'data-k="masa_previa_kg"') +
      inp("ob-temp", "Temperatura basal °C", p.temp_basal, "number", 0.1, 'data-k="temp_basal"') + inp("ob-previa", "Dosis previa de carrera mSv", p.rad.previa_mSv, "number", 0.1, 'data-rad="previa_mSv"') + inp("ob-dia", "Día de misión", p.mision.dia, "number", 1, 'data-mis="dia"') + "</div>" +
      '<p class="nota">El origen étnico y la fase del ciclo se envían al motor solo como contexto y auditoría: no modifican ninguna alerta ni entran al ensamble.' + (imc ? " IMC " + imc.toFixed(1) + " kg/m²." : "") + "</p></div>" +
      '<div class="tarj c6"><h2>Medidas corporales</h2><div class="campos">' + MEDIDAS.map(d => inp("me-" + d[0], d[1], m[d[0]], "number", 0.1, 'data-med="' + d[0] + '"')).join("") + '</div><p class="nota">' +
      (m.cintura_cm && m.cadera_cm ? "Índice cintura/cadera " + (m.cintura_cm / m.cadera_cm).toFixed(2) + ". " : "") + (m.cintura_cm && p.estatura_cm ? "Índice cintura/estatura " + (m.cintura_cm / p.estatura_cm).toFixed(2) + "." : "") + " En microgravedad el peso se mide con dispositivo de masa corporal, no con báscula.</p></div>" +
      (p.sexo === "F" ? '<div class="tarj c6"><h2>Ciclo menstrual <small>' + (fs ? "fase " + FASES[fs.fase].toLowerCase() + " · día " + fs.dia : c.aplica ? "fase no disponible" : "no aplica") + '</small></h2><div class="campos">' +
        '<label class="campo">Ciclos menstruales<select id="ci-aplica" data-cic="aplica"><option value="1"' + (c.aplica ? " selected" : "") + '>Presentes</option><option value="0"' + (!c.aplica ? " selected" : "") + ">No aplica (supresión, menopausia u otra causa)</option></select></label>" +
        inp("ci-fum", "Primer día de la última menstruación", c.fum, "date", 0, 'data-cic="fum"') + inp("ci-dur", "Duración habitual del ciclo (días)", c.duracion, "number", 1, 'data-cic="duracion"') +
        '<label class="campo">Anticoncepción hormonal combinada<select id="ci-hor" data-cic="hormonal"><option value="0"' + (!c.hormonal ? " selected" : "") + '>No</option><option value="1"' + (c.hormonal ? " selected" : "") + ">Sí</option></select></label></div>" +
        '<p class="nota">Fase estimada por calendario: ovulación unos 14 días antes de la siguiente menstruación. Sirve para interpretar estradiol, progesterona, LH y FSH con el intervalo de su fase. La anticoncepción combinada cuenta para la puntuación de riesgo trombótico.</p></div>' : "");
  }
  function mediciones() {
    const F = [["hr", "Cardiaca continua (ECG)", "lpm", 0], ["sbp", "Presión arterial continua · sistólica", "mmHg", 0], ["dbp", "Presión arterial continua · diastólica", "mmHg", 0], ["cgm", "Glucosa intersticial", "mg/dL", 0], ["spo2", "Oxígeno (SpO₂)", "%", 0], ["fr", "Respiración", "rpm", 0], ["temp", "Temperatura", "°C", 1]];
    const a = P().manuales.slice().reverse();
    return '<div class="tarj c12"><h2>Mediciones continuas <small>las cuatro primeras son obligatorias</small></h2>' + tabla(["Medición", "Señal", "Ahora", "Mínimo", "Media", "Máximo", "Unidad"], F.map(f => { const e = est(H[f[0]]), d = f[3];
      return [f[1], V[f[0]] == null ? ["– sin señal", "b"] : "✓ recibiendo", V[f[0]] == null ? "—" : V[f[0]].toFixed(d), e ? e.min.toFixed(d) : "—", e ? e.med.toFixed(1) : "—", e ? e.max.toFixed(d) : "—", f[2]]; })) +
      '<div class="fila-btn"><button type="button" class="btn" data-x="signos">Exportar la sesión · CSV</button></div></div>' +
      '<div class="tarj c6"><h2>Frecuencia cardiaca y SpO₂</h2><canvas class="lienzo" id="g-hr"></canvas></div><div class="tarj c6"><h2>Presión arterial <small>mmHg</small></h2><canvas class="lienzo" id="g-pa"></canvas></div>' +
      '<div class="tarj c6"><h2>Glucosa intersticial <small>mg/dL</small></h2><canvas class="lienzo" id="g-glu"></canvas></div><div class="tarj c6"><h2>Temperatura <small>°C</small></h2><canvas class="lienzo" id="g-temp"></canvas></div>' +
      '<div class="tarj c12"><h2>Registro manual <small>medidas tomadas a mano</small></h2><div class="campos">' + MAN.map(d => inp("in-" + d[0], d[1], "", "number", d[2])).join("") + inp("in-nota", "Nota", "", "text") + '</div><div class="fila-btn"><button type="button" class="btn pri" data-g="man">Guardar registro</button></div>' +
      tabla(["Fecha"].concat(MAN.map(d => d[1]), ["Nota", ""]), a.map(r => [fecha(r.t) + " " + hora(r.t).slice(0, 5)].concat(MAN.map(d => r[d[0]] == null ? "—" : r[d[0]]), [esc(r.nota || ""), '<button type="button" class="btn" data-del="manuales:' + r.id + '">Borrar</button>']))) + "</div>";
  }
  function laboratorio() {
    return Object.keys(LABS).map(k => { const L = LABS[k], a = P().labs[k].slice().reverse();
      return '<div class="tarj c12"><h2>' + L[0] + " <small>" + a.length + " estudios</small></h2><div class=\"campos\">" + inp("lb-" + k + "-fecha", "Fecha", fecha(), "date") + L[1].map(c => { const r = rango(c); return inp("lb-" + k + "-" + c[0], c[1] + " (" + c[2] + ")", "", "number", "any", 'placeholder="' + (r ? r.join("–") : "según fase") + '"'); }).join("") + inp("lb-" + k + "-nota", "Nota", "", "text") + "</div>" +
        '<div class="fila-btn"><button type="button" class="btn pri" data-g="lab:' + k + '">Guardar estudio</button><button type="button" class="btn" data-g="csv:' + k + '">Cargar CSV</button><span class="nota">Columnas del CSV: <code>fecha, ' + L[1].map(c => c[0]).join(", ") + "</code></span></div>" +
        tabla(["Fecha"].concat(L[1].map(c => c[1] + "<br>" + c[2]), ["Nota", ""]), (a.length ? [["Referencia"].concat(L[1].map(c => { const r = rango(c); return r ? r.join("–") : "por fase"; }), ["", ""])] : []).concat(a.map(r => [esc(r.fecha)].concat(L[1].map(c => { const m = marca(c, r[c[0]], r.fecha); return [r[c[0]] == null ? "—" : r[c[0]] + flecha(m), m]; }), [esc(r.nota || "") + (k === "hor" && fase(r.fecha) ? " · fase " + FASES[fase(r.fecha).fase].toLowerCase() : ""), '<button type="button" class="btn" data-del="lab:' + k + ":" + r.id + '">Borrar</button>'])))) +
        (k === "hor" ? '<p class="nota">Estradiol, progesterona, LH y FSH se comparan con el intervalo de la fase del ciclo en la fecha del estudio.</p>' : k === "nut" ? '<p class="nota">El motor recibe el calcio corregido por albúmina: calcio + 0.8 × (4 − albúmina). Vitamina D: suficiencia a partir de 30 ng/mL; el catálogo avisa por debajo de 20.</p>' : '<p class="nota">En vuelo es habitual un descenso moderado de hemoglobina.</p>') + "</div>"; }).join("") +
      '<div class="tarj c12"><p class="nota">Intervalos de referencia orientativos de adulto; cada laboratorio define los suyos. ↓ por debajo y ↑ por encima del intervalo.</p></div>';
  }
  const LISTAS = { antecedentes: ["Antecedentes", [["nombre", "Condición"], ["estado", "Estado"], ["desde", "Desde"], ["nota", "Nota"]]], medicacion: ["Medicación", [["nombre", "Medicamento"], ["pauta", "Pauta"], ["para", "Indicación"]]], alergias: ["Alergias", [["sustancia", "Sustancia"], ["reaccion", "Reacción"], ["severidad", "Severidad"]]] };
  function historial() {
    const p = P();
    return Object.keys(LISTAS).map(k => { const L = LISTAS[k]; return '<div class="tarj"><h2>' + L[0] + " <small>" + p[k].length + "</small></h2>" + tabla(L[1].map(c => c[1]).concat([""]), p[k].map(r => L[1].map(c => esc(r[c[0]] || "")).concat(['<button type="button" class="btn" data-del="' + k + ":" + r.id + '">Borrar</button>']))) +
      '<div class="campos">' + L[1].map(c => inp("l-" + k + "-" + c[0], c[1], "", "text")).join("") + '</div><div class="fila-btn"><button type="button" class="btn pri" data-g="lista:' + k + '">Añadir</button></div></div>'; }).join("") +
      '<div class="tarj c12"><p class="nota">Los antecedentes se envían al motor, que añade las modificaciones del plan de vigilancia que su catálogo prevé para cada uno.</p></div>';
  }
  function expediente() {
    const p = P(), car = M.carrera(), fs = fase(), m = p.medidas, dl = pares => "<dl>" + pares.map(x => "<dt>" + x[0] + "</dt><dd>" + x[1] + "</dd>").join("") + "</dl>";
    const ses = ["hr", "spo2", "sbp", "dbp", "cgm", "fr", "temp", "rad"].map(k => { const e = est(H[k]); return [M.NOM[k], e ? e.min.toFixed(1) : "—", e ? e.med.toFixed(1) : "—", e ? e.max.toFixed(1) : "—", M.UN[k]]; });
    const sec = (t, cuerpo, abierta) => "<details" + (abierta ? " open" : "") + "><summary>" + t + "</summary>" + cuerpo + "</details>";
    const lab = k => tabla(["Fecha"].concat(LABS[k][1].map(c => c[1])), p.labs[k].map(r => [esc(r.fecha)].concat(LABS[k][1].map(c => (r[c[0]] == null ? "—" : r[c[0]]) + flecha(marca(c, r[c[0]], r.fecha))))));
    return '<div class="tarj c12"><h2>Expediente médico <small>' + esc(p.nombre) + " · generado " + fecha() + " " + hora().slice(0, 5) + (p.demo ? " · datos ficticios de demostración" : "") + '</small></h2>' +
      '<div class="fila-btn"><button type="button" class="btn pri" data-x="exp-md">Exportar expediente · Markdown</button><button type="button" class="btn" data-x="todo">Exportar datos · JSON</button></div>' +
      sec("1 · Identificación y datos obligatorios", dl([["Nombre", esc(p.nombre)], ["Identificador y rol", esc(p.id) + " · " + esc(p.rol)], ["Edad y sexo", (edad() == null ? "—" : edad() + " años") + " · " + (p.sexo === "M" ? "hombre" : "mujer")], ["Origen étnico", esc(p.origen_etnico || "—")], ["Grupo sanguíneo", esc(p.sangre || "—")],
        ["Estatura y peso", p.estatura_cm + " cm · " + p.masa_kg + " kg · IMC " + (p.masa_kg / Math.pow(p.estatura_cm / 100, 2)).toFixed(1) + " · previo al vuelo " + (p.masa_previa_kg || "—") + " kg"], ["Temperatura basal", (p.temp_basal || "—") + " °C"],
        ["Medidas corporales", MEDIDAS.map(d => d[1].replace(/ (cm|%)$/, "") + " " + (m[d[0]] == null ? "—" : m[d[0]])).join(" · ")]].concat(p.sexo === "F" ? [["Ciclo menstrual", fs ? "fase " + FASES[fs.fase].toLowerCase() + ", día " + fs.dia + " de " + p.ciclo.duracion + " (estimada por calendario)" : p.ciclo.aplica ? "fase no disponible" : "no aplica"], ["Anticoncepción hormonal combinada", p.ciclo.hormonal ? "sí" : "no"]] : [])), true) +
      sec("2 · Misión y exposición a radiación", dl([["Misión", esc(p.mision.nombre) + " · día " + p.mision.dia + " de " + p.mision.duracion], ["Dosis previa de carrera", p.rad.previa_mSv.toFixed(1) + " mSv"], ["Dosis de la misión", p.rad.mision_mSv.toFixed(3) + " mSv"], ["Dosis de carrera", car.toFixed(1) + " mSv · " + (car / 6).toFixed(1) + " % del límite de 600 mSv"], ["Tasa actual", (V.rad == null ? "—" : V.rad) + " µSv/h a " + (V.alt == null ? "—" : V.alt) + " km"]]), true) +
      sec("3 · Historial: antecedentes, medicación y alergias", tabla(["Condición", "Estado", "Desde", "Nota"], p.antecedentes.map(a => [esc(a.nombre), esc(a.estado), esc(a.desde), esc(a.nota)])) + tabla(["Medicamento", "Pauta", "Indicación"], p.medicacion.map(a => [esc(a.nombre), esc(a.pauta), esc(a.para)])) + tabla(["Alergia", "Reacción", "Severidad"], p.alergias.map(a => [esc(a.sustancia), esc(a.reaccion), esc(a.severidad)])), true) +
      sec("4 · Biometría hemática", lab("bh")) + sec("5 · Nutrientes y química sanguínea", lab("nut")) + sec("6 · Perfil hormonal", lab("hor")) +
      sec("7 · Mediciones continuas: resumen de la sesión", tabla(["Indicador", "Mínimo", "Media", "Máximo", "Unidad"], ses)) +
      sec("8 · Registros manuales", tabla(["Fecha"].concat(MAN.map(d => d[1]), ["Nota"]), p.manuales.map(r => [fecha(r.t)].concat(MAN.map(d => r[d[0]] == null ? "—" : r[d[0]]), [esc(r.nota || "")])))) +
      sec("9 · Alertas de la sesión", tabla(["Inicio", "Fin", "Nivel", "Alerta", "Valor", "Regla", "Origen"], M.historial.map(a => [hora(a.desde), a.hasta ? hora(a.hasta) : "activa", M.TEXTO[a.nivel], esc(a.nombre), esc(a.valorTxt || ""), esc(a.regla || a.id), esc(a.fuente)]))) +
      sec("10 · Bienestar psicológico y sueño", tabla(["Fecha", "Registro", "Resultado", "Señal al motor"], p.animo.map(a => [fecha(a.t), esc(AH.Bienestar.nombre(a.prueba)), esc(AH.Bienestar.texto(a)), a.bandera ? "sí · " + esc(a.motivo || "") : "no"]))) +
      sec("11 · Consultas a médico en tierra", tabla(["Fecha", "Motivo", "Estado"], (p.consultas || []).map(c => [fecha(c.t) + " " + hora(c.t).slice(0, 5), esc(c.motivo), esc(c.estado)]))) +
      sec("12 · Notas", '<textarea id="exp-notas" rows="4" style="width:100%" placeholder="Notas del tripulante o del médico de vuelo">' + esc(p.notas || "") + '</textarea><div class="fila-btn" style="margin-top:8px"><button type="button" class="btn" data-g="notas">Guardar notas</button></div>') +
      sec("13 · Dolor referido en el mapa corporal", '<div data-notr>' + tabla(["Fecha", "Descripción clínica", "Estado"], (p.dolor || []).map(x => [fecha(x.t) + " " + hora(x.t).slice(0, 5), esc(AH.Cuerpo.frase(x)), AH.tr(x.activo ? "activo" : "resuelto")])) + "</div>") +
      '<p class="nota">Prototipo de investigación. No sustituye a la historia clínica oficial ni al médico de vuelo.</p></div>';
  }
  function pintar() {
    $$("#tabs-perfil button").forEach(b => b.classList.toggle("on", b.dataset.pt === tab));
    $("#rej-perfil").innerHTML = { resumen, obligatorios, mediciones, laboratorio, historial, expediente }[tab](); graficas();
  }

  // ---- exportación e importación
  function todo() { return { generado: new Date().toISOString(), aplicacion: "Monitor Aerospace Health", aviso: P().demo ? "Perfil de demostración con datos ficticios" : "", perfil: P(), variables_para_el_motor: Object.assign({}, AH.contexto(), AH.extra()),
    sesion: { t: H.t, hr: H.hr, spo2: H.spo2, fr: H.fr, sbp: H.sbp, dbp: H.dbp, glucosa_mg_dl: H.cgm, temp: H.temp, ppco2_mmHg: H.co2, presion_cabina_kPa: H.pcab, rad_uSv_h: H.rad, alt_km: H.alt }, alertas: M.historial, registro: AH.registro }; }
  function markdown() {
    const p = P(), car = M.carrera(), L = [], fs = fase();
    L.push("# Expediente médico · " + p.nombre, "", "Generado: " + fecha() + " " + hora() + (p.demo ? " · datos ficticios de demostración" : ""), "", "## Identificación y datos obligatorios", "- " + p.id + " · " + p.rol + " · " + edad() + " años · " + (p.sexo === "M" ? "hombre" : "mujer") + " · " + (p.sangre || ""),
      "- Origen étnico: " + (p.origen_etnico || "—"), "- " + p.estatura_cm + " cm · " + p.masa_kg + " kg · temperatura basal " + (p.temp_basal || "—") + " °C", "- Medidas: " + MEDIDAS.map(d => d[1] + " " + (p.medidas[d[0]] == null ? "—" : p.medidas[d[0]])).join(", "));
    if (p.sexo === "F") L.push("- Ciclo: " + (fs ? "fase " + FASES[fs.fase].toLowerCase() + ", día " + fs.dia : "no disponible o no aplica"));
    L.push("", "## Misión y radiación", "- " + p.mision.nombre + ", día " + p.mision.dia + " de " + p.mision.duracion, "- Dosis de carrera: " + car.toFixed(1) + " mSv (" + (car / 6).toFixed(1) + " % de 600 mSv); misión " + p.rad.mision_mSv.toFixed(3) + " mSv", "", "## Antecedentes");
    p.antecedentes.forEach(a => L.push("- " + a.nombre + " · " + a.estado + (a.desde ? " · desde " + a.desde : "") + (a.nota ? " · " + a.nota : "")));
    L.push("", "## Medicación"); p.medicacion.forEach(a => L.push("- " + a.nombre + " · " + a.pauta + " · " + a.para));
    L.push("", "## Alergias"); p.alergias.forEach(a => L.push("- " + a.sustancia + " · " + a.reaccion + " · " + a.severidad));
    Object.keys(LABS).forEach(k => { const c = LABS[k][1]; L.push("", "## " + LABS[k][0], "| Fecha | " + c.map(b => b[1]).join(" | ") + " |", "|" + " --- |".repeat(c.length + 1)); p.labs[k].forEach(r => L.push("| " + r.fecha + " | " + c.map(b => (r[b[0]] == null ? "—" : r[b[0]]) + flecha(marca(b, r[b[0]], r.fecha))).join(" | ") + " |")); });
    L.push("", "## Alertas de la sesión"); M.historial.forEach(a => L.push("- " + hora(a.desde) + " · " + M.TEXTO[a.nivel] + " · " + a.nombre + (a.valorTxt ? " · " + a.valorTxt : "") + " [" + (a.regla || a.id) + "]")); if (!M.historial.length) L.push("- Ninguna");
    L.push("", "## Bienestar psicológico y sueño"); p.animo.slice(-20).forEach(a => L.push("- " + fecha(a.t) + " · " + AH.Bienestar.nombre(a.prueba) + " · " + AH.Bienestar.texto(a) + (a.bandera ? " · señal al motor" : "")));
    L.push("", "## Notas", p.notas || "—", "", "Prototipo de investigación. No sustituye a la historia clínica oficial ni al médico de vuelo."); return L.join("\n");
  }
  function exportar(q) {
    const sello = fecha() + "_" + hora().replace(/:/g, "");
    if (q === "todo") AH.descargar("aerospace_health_" + P().id + "_" + sello + ".json", JSON.stringify(todo(), null, 1));
    else if (q === "signos") AH.descargar("signos_" + sello + ".csv", AH.csv(["hora", "fc_lpm", "spo2_pct", "fr_rpm", "pa_sis_mmHg", "pa_dia_mmHg", "glucosa_mg_dl", "temp_c", "ppco2_mmHg", "presion_cabina_kPa", "rad_uSv_h", "alt_km"], H.t.map((t, i) => [new Date(t).toISOString(), H.hr[i], H.spo2[i], H.fr[i], H.sbp[i], H.dbp[i], H.cgm[i], H.temp[i], H.co2[i], H.pcab[i], H.rad[i], H.alt[i]])));
    else if (q === "alertas") AH.descargar("alertas_" + sello + ".csv", AH.csv(["inicio", "fin", "nivel", "alerta", "valor", "criterio", "regla", "origen"], M.historial.map(a => [new Date(a.desde).toISOString(), a.hasta ? new Date(a.hasta).toISOString() : "", a.nivel, a.nombre, a.valorTxt, a.criterio, a.regla || a.id, a.fuente])));
    else if (q === "exp-md") AH.descargar("expediente_" + P().id + "_" + sello + ".md", markdown());
    else if (q === "importar") pedirArchivo(".json", t => { const d = JSON.parse(t), p = d.perfil || d; if (!p || !p.nombre || !p.labs) throw new Error("el archivo no contiene un perfil de este monitor"); AH.perfil = AH.mezclar(AH.PERFIL_DEMO(), p); AH.perfil.demo = !!p.demo; AH.guardarPerfil(); log("perfil", "Perfil importado: " + p.nombre, "ok"); });
  }
  function pedirArchivo(tipos, usar) {
    const f = $("#archivo"); f.accept = tipos; f.value = "";
    f.onchange = () => { const a = f.files[0]; if (!a) return; a.text().then(t => { usar(t); pintar(); }).catch(e => { log("perfil", "No pude leer " + a.name + ": " + e.message, "precaucion"); aviso("No pude leer el archivo: " + e.message); }); };
    f.click();
  }
  function aviso(t) { const c = $("#capa"); c.hidden = false; c.innerHTML = '<div class="dialogo"><p>' + esc(t) + '</p><div class="fila-btn"><button type="button" class="btn pri" id="av-ok">Entendido</button></div></div>'; $("#av-ok").onclick = () => { c.hidden = true; c.innerHTML = ""; }; }
  AH.aviso = aviso;
  const num = id => { const e = $(id); if (!e) return null; const v = e.value.trim(); return v === "" || isNaN(+v) ? null : +v; };
  $("#rej-perfil").addEventListener("click", e => {
    const x = e.target.closest("[data-x]"), g = e.target.closest("[data-g]"), d = e.target.closest("[data-del]"), p = P();
    if (x) return exportar(x.dataset.x);
    if (d) { const q = d.dataset.del.split(":"); if (q[0] === "lab") p.labs[q[1]] = p.labs[q[1]].filter(r => r.id !== q[2]); else p[q[0]] = p[q[0]].filter(r => r.id !== q[1]); p.demo = false; AH.guardarPerfil(); return pintar(); }
    if (!g) return; const q = g.dataset.g;
    if (q === "man") { const r = { id: uid(), t: Date.now(), nota: $("#in-nota").value.trim() }; MAN.forEach(c => { r[c[0]] = num("#in-" + c[0]); }); if (MAN.every(c => r[c[0]] == null)) return aviso("Escribe al menos una medida."); if (r.masa_kg) p.masa_kg = r.masa_kg; p.manuales.push(r); log("perfil", "Registro manual guardado"); }
    else if (q.startsWith("lab:")) { const k = q.slice(4), c = LABS[k][1], r = { id: uid(), fecha: $("#lb-" + k + "-fecha").value || fecha(), nota: $("#lb-" + k + "-nota").value.trim() }; c.forEach(b => { r[b[0]] = num("#lb-" + k + "-" + b[0]); });
      if (c.every(b => r[b[0]] == null)) return aviso("Escribe al menos un valor del estudio."); p.labs[k].push(r); p.labs[k].sort((a, b) => a.fecha < b.fecha ? -1 : 1); log("perfil", LABS[k][0] + " guardada: " + r.fecha); }
    else if (q.startsWith("csv:")) { const k = q.slice(4), c = LABS[k][1]; return pedirArchivo(".csv,.txt", t => { const l = t.trim().split(/\r?\n/).map(f => f.split(/[,;\t]/).map(z => z.trim())), cab = l.shift().map(z => z.toLowerCase()); let n = 0;
      l.forEach(f => { const r = { id: uid(), nota: "importado" }; cab.forEach((z, i) => { if (z === "fecha") r.fecha = f[i]; else if (c.some(b => b[0] === z) && f[i] !== "" && !isNaN(+f[i])) r[z] = +f[i]; }); if (r.fecha && c.some(b => r[b[0]] != null)) { p.labs[k].push(r); n++; } });
      if (!n) throw new Error("no encontré filas con 'fecha' y al menos un valor"); p.labs[k].sort((a, b) => a.fecha < b.fecha ? -1 : 1); p.demo = false; AH.guardarPerfil(); log("perfil", n + " estudios importados de CSV: " + LABS[k][0], "ok"); }); }
    else if (q.startsWith("lista:")) { const k = q.slice(6), r = { id: uid() }; LISTAS[k][1].forEach(c => { r[c[0]] = $("#l-" + k + "-" + c[0]).value.trim(); }); if (!r[LISTAS[k][1][0][0]]) return aviso("Falta el primer campo."); p[k].push(r); log("perfil", LISTAS[k][0] + ": añadido " + r[LISTAS[k][1][0][0]]); }
    else if (q === "notas") { p.notas = $("#exp-notas").value; log("perfil", "Notas del expediente guardadas"); }
    p.demo = false; AH.guardarPerfil(); pintar();
  });
  $("#rej-perfil").addEventListener("change", e => {
    const t = e.target, p = P(), d = t.dataset, v = t.type === "number" ? (t.value === "" ? null : +t.value) : t.value;
    if (d.k) p[d.k] = v; else if (d.rad) p.rad[d.rad] = +t.value || 0; else if (d.mis) p.mision[d.mis] = +t.value || 0; else if (d.med) p.medidas[d.med] = v;
    else if (d.cic) p.ciclo[d.cic] = d.cic === "aplica" || d.cic === "hormonal" ? t.value === "1" : v; else return;
    p.demo = false; AH.guardarPerfil(); log("perfil", "Dato del perfil actualizado: " + (d.k || d.med || d.cic || d.rad || d.mis)); pintar();
  });
  let n = 0; on("segundo", () => { if ($("#p-perfil").classList.contains("on") && (tab === "resumen" || tab === "mediciones") && ++n % 5 === 0 && !$("#rej-perfil").contains(document.activeElement)) pintar(); });
  on("panel", t => { if (t === "perfil") pintar(); });
  // tablas de laboratorio ya interpretadas (valor y marca ↓/↑), para la consola de tierra
  function tablasLab() { const o = {}; Object.keys(LABS).forEach(k => { o[k] = { titulo: LABS[k][0], campos: LABS[k][1].map(c => { const r = rango(c); return { k: c[0], nombre: c[1], unidad: c[2], ref: r ? r.join("–") : "por fase" }; }),
    filas: P().labs[k].map(r => ({ fecha: r.fecha, nota: r.nota || "", v: LABS[k][1].reduce((a, c) => { a[c[0]] = [r[c[0]] == null ? null : r[c[0]], marca(c, r[c[0]], r.fecha)]; return a; }, {}) })) }; }); return o; }
  AH.Perfil = { pintar, exportar, todo, faltantes, LABS, edad, fase, FASES, anomalos, tablasLab };
})();
