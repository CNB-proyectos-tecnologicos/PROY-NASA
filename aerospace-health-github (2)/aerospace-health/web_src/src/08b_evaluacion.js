/* Evaluación completa: todas las reglas del catálogo del motor sobre el caso actual (monitor + perfil + bienestar + datos manuales).
   Con el servidor, la hace el motor de Python con su ensamble. Sin él, se aplican aquí las mismas reglas con la misma lógica de tres valores, sin el ensamble completo ni el plan por antecedentes. */
(function () {
  const { $, $$, esc, V, cfg, on, log, fecha, hora, uid } = AH, M = AH.Motor, etq = AH.etq;
  const NIV = ["SIN_ALERTA", "SEGUIMIENTO", "CONSULTA", "PRIORITARIA", "INMEDIATA"];
  const NTXT = { SIN_ALERTA: "Sin alerta", SEGUIMIENTO: "Seguimiento", CONSULTA: "Consulta", PRIORITARIA: "Prioritaria", INMEDIATA: "Inmediata" };
  const NCLS = { SIN_ALERTA: "estable", SEGUIMIENTO: "aviso", CONSULTA: "aviso", PRIORITARIA: "precaucion", INMEDIATA: "urgencia" };
  const FASES = [["PREFLIGHT", "Prevuelo"], ["INFLIGHT", "En vuelo"], ["POSTFLIGHT", "Postvuelo"]];
  const CTX = [["microgravity_eva", "i"], ["surface_eva", "i"], ["launch_entry_phase", "i"], ["orthostatic_test_performed", "i"], ["habitat_duration_days", "días"], ["cabin_pressure_delta_psi", "psi"], ["cgm_days", "días"], ["cgm_coverage_pct", "%"], ["cabin_ppco2_1h_coverage_pct", "%"]];
  const OPS = { "<": (a, b) => a < b, "<=": (a, b) => a <= b, ">": (a, b) => a > b, ">=": (a, b) => a >= b, "==": (a, b) => a === b, "!=": (a, b) => a !== b };
  const OPT = { "<": "<", "<=": "≤", ">": ">", ">=": "≥", "==": "=", "!=": "≠" };
  const cat = () => AH.Enlace.catalogo || window.AH_CATALOGO;
  let manual = AH.leer("eval-manual", {}), ult = null, ocupado = false, filtro = "", orient = null;
  const nivel = n => '<span class="etq s-' + (NCLS[n] || "nd") + '">' + (NTXT[n] || "Sin nivel") + "</span>";
  const r1 = x => Math.round(x * 10) / 10;

  // ---- valores que se toman solos: ventanas del monitor, perfil y bienestar
  function automaticos() {
    const o = {}, f = {}, pon = (k, v, de) => { if (v != null && typeof v === "number" && isFinite(v)) { o[k] = v; f[k] = de; } }, m = (k, s) => { const x = AH.media(k, s); return x == null ? null : r1(x); };
    pon("spo2_2min", m("spo2", 120), "monitor"); pon("spo2_5min", m("spo2", 300), "monitor"); pon("awake_hr_5min", m("hr", 300), "monitor");
    if (!V.actividad) { pon("rest_hr_10min", m("hr", 600), "monitor"); pon("rest_hr_5min", m("hr", 300), "monitor"); }
    pon("core_temp_c", V.temp, "monitor"); pon("sbp_confirmed", m("sbp", 900), "monitor"); pon("dbp_confirmed", m("dbp", 900), "monitor"); pon("cgm_mg_dl", V.cgm, "monitor");
    pon("cabin_ppco2_1h", m("co2", 3600), "monitor"); pon("cabin_pressure_kpa", V.pcab, "monitor");
    pon("career_effective_mSv", r1(M.carrera()), "monitor"); if (V.rad != null) pon("solar_particle_alert", V.rad >= 1000 ? 1 : 0, "monitor");
    if (V.ritmo && V.ritmo !== "—") pon("ecg_arrhythmia_flag", V.ritmo === "tv" || V.ritmo === "fa" ? 1 : 0, "monitor");
    if (V.spo2 != null) { pon("spo2_quality_bad", V.tec.pleth ? 1 : 0, "monitor"); pon("spo2_artifact", V.tec.artefacto ? 1 : 0, "monitor"); }
    const b = AH.Bienestar.vars(), x = AH.extra(), c = AH.contexto();
    Object.keys(x).forEach(k => pon(k, x[k], k in b ? "bienestar" : "perfil"));
    ["age_years", "estatura_cm", "mass_kg", "waist_cm", "serum_creatinine_mg_dl"].forEach(k => pon(k, c[k], "perfil"));
    return { o, f, sexo: c.sex_for_formula };
  }
  function entradas() {
    const a = automaticos(), d = Object.assign({}, a.o), p = AH.perfil, fs = AH.faseCiclo();
    Object.keys(manual).forEach(k => { if (manual[k] != null && manual[k] !== "") d[k] = manual[k]; });
    d.mission_phase = manual.mission_phase || "INFLIGHT"; if (a.sexo) d.sex_for_formula = a.sexo;
    delete d.who5;
    return { datos: d, fuentes: a.f, extra: { antecedentes: p.antecedentes.map(x => x.nombre), origen_etnico: p.origen_etnico || undefined, fase_ciclo: fs ? fs.fase : undefined } };
  }

  // ---- respaldo sin servidor: reglas de umbral del catálogo incrustado
  function ckdEpi(edad, cr, sexo) { const k = sexo === "F" ? 0.7 : 0.9, a = sexo === "F" ? -0.241 : -0.302; return 142 * Math.pow(Math.min(cr / k, 1), a) * Math.pow(Math.max(cr / k, 1), -1.2) * Math.pow(0.9938, edad) * (sexo === "F" ? 1.012 : 1); }
  function local(d) {
    // Misma lógica de tres valores que motor/reglas.py: ACTIVADA, INACTIVA, NO_CALCULABLE, NO_APLICA y VERIFICAR.
    const C = cat(), QC = C.calidad_por_variable || {}, LIM = Object.assign({}, C.contexto || {}), v = {}, rechazados = [];
    C.dominios.forEach(dm => dm.variables.forEach(x => { LIM[x.variable] = x.limites; }));
    const bruto = Object.assign({}, d), fase = { PREFLIGHT: 0, INFLIGHT: 1, POSTFLIGHT: 2 }[d.mission_phase];
    if (fase == null) { delete bruto.mission_phase; bruto.mission_phase_unknown = 1; } else bruto.mission_phase = fase;
    if (bruto.egfr == null && bruto.age_years != null && bruto.serum_creatinine_mg_dl != null && (d.sex_for_formula === "F" || d.sex_for_formula === "M")) bruto.egfr = r1(ckdEpi(bruto.age_years, bruto.serum_creatinine_mg_dl, d.sex_for_formula));
    if (bruto.urine_ml_day == null && bruto.urine_l_24h != null) bruto.urine_ml_day = bruto.urine_l_24h * 1000;
    else if (bruto.urine_l_24h == null && bruto.urine_ml_day != null) bruto.urine_l_24h = bruto.urine_ml_day / 1000;
    Object.keys(bruto).forEach(k => { const x = bruto[k], L = LIM[k]; if (typeof x !== "number" || !isFinite(x) || !L) return; if (x < L[0] || x > L[1]) rechazados.push({ campo: k, motivo: "DATO_INVALIDO: " + x + " fuera de [" + L.join(", ") + "]" }); else v[k] = x; });
    const tern = (k, op, u) => v[k] == null ? -1 : OPS[op](v[k], u) ? 1 : 0, ni = n => NIV.indexOf(n);
    const act = [], verificar = [], contexto = [], calidad = [], porDom = {}, cob = { reglas_con_nivel_habilitadas: 0, evaluadas: 0, no_calculables: 0, no_aplican_por_contexto: 0 };
    const ficha = (dm, x, r, mas) => Object.assign({ id: r.id, nombre: r.nombre, dominio: dm.nombre, nivel: r.nivel, criterio: x.variable + " " + r.op + " " + r.umbral + " " + x.unidad, valor: v[x.variable], accion_propuesta: r.accion, confirmacion: r.confirmacion, limites: "", fuente: r.url, evidencia: r.evidencia }, mas);
    C.dominios.forEach(dm => dm.variables.forEach(x => x.reglas.forEach(r => {
      if (!r.habilitada) return; if (r.nivel) cob.reglas_con_nivel_habilitadas++;
      const p = tern(x.variable, r.op, r.umbral), gs = (r.gates || []).map(g => tern(g[0], g[1], g[2])), g = gs.includes(0) ? 0 : gs.includes(-1) ? -1 : 1;
      const opc = (r.gates_opc || []).some(o => tern(o[0], o[1], o[2]) === 0), flags = (QC[x.variable] || []).filter(f => v[f] === 1), q = flags.length > 0, grave = ni(r.nivel) >= 3, esCal = r.canal === "CALIDAD_ABSTENCION";
      let c = p === -1 ? "NC" : p === 0 ? (q ? "NC" : "IN") : (g === 1 && !q ? "AC" : grave ? "VE" : "NC");
      if (opc && p !== -1) c = "NC"; if (g === 0) c = "NA";
      if (c === "AC") { if (r.nivel) cob.evaluadas++; if (esCal) calidad.push(ficha(dm, x, r)); else act.push({ r, x, f: ficha(dm, x, r) }); }
      else if (c === "IN") { if (r.nivel) cob.evaluadas++; }
      else if (c === "VE") { if (q) verificar.push(ficha(dm, x, r, { estado: "SEÑAL_NO_CONFIRMADA", motivo: "calidad de sensor en duda (" + flags.join(", ") + ")", que_hacer: "Verificar ya con una medida independiente; no descartar el valor ni tratarlo como confirmado." }));
        const des = (r.gates || []).filter(z => v[z[0]] == null).map(z => z[0]); if (des.length) contexto.push(ficha(dm, x, r, { estado: "CONTEXTO_INCOMPLETO", motivo: "falta un dato de contexto (" + des.join(", ") + ")", que_hacer: "El valor cumple el criterio, pero la regla depende de un dato de contexto no informado. Completarlo para poder evaluarla." })); }
      else if (c === "NC") { if (r.nivel) cob.no_calculables++; if (esCal) return; const e = porDom[dm.nombre] = porDom[dm.nombre] || { reglas_sin_evaluar: 0, faltan: [], como_completar: [] }; e.reglas_sin_evaluar++;
        [x.variable].concat((r.gates || []).map(z => z[0])).forEach(k => { if (v[k] == null && !e.faltan.includes(k)) e.faltan.push(k); }); if (r.confirmacion && !e.como_completar.includes(r.confirmacion)) e.como_completar.push(r.confirmacion); }
      else if (r.nivel) cob.no_aplican_por_contexto++;
    })));
    // una alerta por variable y sentido: la más grave
    const grupos = {}; act.forEach(a => { const s = a.r.op === "<" || a.r.op === "<=" ? "bajo" : a.r.op === ">" || a.r.op === ">=" ? "alto" : a.r.id, k = a.x.variable + "|" + s; (grupos[k] = grupos[k] || { s, l: [] }).l.push(a); });
    const alertas = Object.keys(grupos).map(k => { const G = grupos[k]; G.l.sort((a, b) => ni(b.r.nivel) - ni(a.r.nivel) || (G.s === "bajo" ? a.r.umbral - b.r.umbral : b.r.umbral - a.r.umbral)); if (G.l.length > 1) G.l[0].f.subsume = G.l.slice(1).map(z => z.r.id); return G.l[0].f; })
      .sort((a, b) => ni(b.nivel) - ni(a.nivel) || (a.id < b.id ? -1 : 1));
    const nf = alertas.length ? alertas[0].nivel : "SIN_ALERTA", pend = verificar.concat(contexto).reduce((m, a) => m == null || ni(a.nivel) > ni(m) ? a.nivel : m, null); let ens = { disponible: false };
    if (AH.Modelo.listo && ["spo2_5min", "rest_hr_10min", "core_temp_c", "sbp_confirmed", "dbp_confirmed"].every(k => v[k] != null)) {
      const f = AH.Modelo.fusion({ spo2: v.spo2_5min, hr: v.rest_hr_10min, temp: v.core_temp_c, sbp: v.sbp_confirmed, dbp: v.dbp_confirmed });
      if (f.p) ens = { disponible: true, destilado: true, nivel_mas_probable: NIV.reduce((a, n) => f.p[n] > f.p[a] ? n : a, "SIN_ALERTA"), nivel_conservador: f.modelo, puntuacion_acumulada: { ">=CONSULTA": f.acum[2], ">=PRIORITARIA": f.acum[1], ">=INMEDIATA": f.acum[0] } };
    }
    return { estado: alertas.length ? "ALERTA" : "SIN_ALERTA", nivel_final: nf, origen_del_nivel: alertas.length ? "REGLAS" : "NINGUNO", alertas, verificar_señal: verificar, completar_contexto: contexto, avisos_de_calidad_y_abstencion: calidad, lecturas_cercanas_a_umbral: [],
      no_evaluable: { aviso: "Lo no medido no se considera normal. Sin estos datos el motor no puede pronunciarse.", por_dominio: porDom }, cobertura: cob, niveles: { reglas: nf, ensamble: ens.disponible ? ens.nivel_conservador : null, mayor_nivel_pendiente_de_verificar: pend }, ensamble: ens,
      notas_de_fusion: [], plan_por_antecedentes: [], avisos: fase == null ? ["Fase de misión no informada: las reglas dependientes de fase no se evalúan."] : [], datos_rechazados: rechazados, campos_no_reconocidos: [],
      auditoria: { version_motor: "reglas del catálogo evaluadas en la página", catalogo: "reglas_espaciales.json v" + C.version + " (" + C.n_reglas + " reglas)", fecha_evaluacion_utc: new Date().toISOString(), entradas_usadas: v } };
  }
  async function evaluar() {
    if (ocupado) return; ocupado = true; pintarCab();
    const e = entradas(); let r, modo = "servidor", nota = "";
    try {
      if (AH.Enlace.vinculado) r = await AH.Enlace.evaluar(Object.assign({}, e.datos, e.extra), true);
      else { modo = "local"; r = local(e.datos); }
    } catch (err) { modo = "local"; nota = "No pude consultar al motor de Python (" + (err.message || err) + "); se aplican las reglas del catálogo en la página."; r = local(e.datos); }
    ult = { r, modo, nota, t: Date.now(), datos: e.datos, fuentes: e.fuentes }; orient = null; ocupado = false;
    log("evaluacion", "Evaluación completa: nivel " + NTXT[r.nivel_final] + " · " + (r.alertas || []).length + " hallazgos · " + r.cobertura.evaluadas + " reglas evaluadas (" + (modo === "servidor" ? "motor de Python" : "reglas en la página") + ")", r.nivel_final === "INMEDIATA" ? "urgencia" : r.nivel_final === "PRIORITARIA" ? "precaucion" : "info");
    pintar();
  }

  // ---- formulario de datos
  function campo(x, e, primera) {
    const k = x.variable, v = e.datos[k], man = manual[k] != null && manual[k] !== "", de = man ? "manual" : e.fuentes[k] || "", u = AH.unidad(x.unidad);
    const um = x.reglas.filter(r => r.habilitada && !x.indicador).map(r => OPT[r.op] + " " + r.umbral).filter((t, i, a) => a.indexOf(t) === i).join(" · ");
    const ctl = !primera ? '<span class="ev-rep">' + (v == null ? "—" : x.indicador ? (v ? "Sí" : "No") : v) + "</span>"
      : x.indicador ? '<select data-v="' + k + '"><option value="">—</option><option value="0"' + (v === 0 ? " selected" : "") + '>No</option><option value="1"' + (v === 1 ? " selected" : "") + ">Sí</option></select>"
      : '<input type="number" step="any" data-v="' + k + '" value="' + (v == null ? "" : v) + '"' + (x.limites ? ' min="' + x.limites[0] + '" max="' + x.limites[1] + '" title="Valores admitidos: ' + x.limites[0] + " a " + x.limites[1] + '"' : "") + ">";
    return '<div class="ev-f" data-n="' + esc(etq(k).toLowerCase()) + '"><span>' + esc(etq(k)) + (um ? "<small>umbrales: " + esc(um) + "</small>" : "") + "</span>" + ctl + "<em>" + esc(u) + '</em><i class="ev-o' + (man ? " man" : "") + '">' + (man && primera ? '<button type="button" data-q="' + k + '" title="Volver al valor automático">' + de + " ×</button>" : de) + "</i></div>";
  }
  function formulario() {
    const C = cat(), e = entradas(), vistos = new Set(), abiertos = new Set($$("#ev-form details[open]").map(d => d.dataset.d)), nuevo = !$("#ev-form").firstChild; let n = 0;
    const ab = k => filtro || abiertos.has(k) || (nuevo && k === "ctx") ? " open" : "";
    const doms = C.dominios.map(d0 => ({ nombre: d0.nombre, variables: d0.variables.filter(x => x.reglas.some(r => r.habilitada)) })).filter(dm => dm.variables.length).map(dm => { const c = dm.variables.filter(x => e.datos[x.variable] != null).length; n += dm.variables.filter(x => !vistos.has(x.variable) && e.datos[x.variable] != null).length;
      const filas = dm.variables.map(x => { const p = !vistos.has(x.variable); vistos.add(x.variable); return campo(x, e, p); }).join("");
      return '<details class="ev-dom" data-d="' + esc(dm.nombre) + '"' + ab(dm.nombre) + "><summary>" + esc(dm.nombre) + " <small>" + c + " de " + dm.variables.length + " datos · " + dm.variables.reduce((s, x) => s + x.reglas.filter(r => r.habilitada).length, 0) + " reglas</small></summary>" + filas + "</details>"; }).join("");
    const ctx = '<div class="ev-f"><span>Fase de misión</span><select data-v="mission_phase">' + FASES.map(f => '<option value="' + f[0] + '"' + ((manual.mission_phase || "INFLIGHT") === f[0] ? " selected" : "") + ">" + f[1] + "</option>").join("") + "</select><em></em><i class=\"ev-o\"></i></div>" +
      CTX.map(c => campo({ variable: c[0], unidad: c[1] === "i" ? "indicador" : c[1], indicador: c[1] === "i", limites: null, reglas: [] }, e, true)).join("");
    $("#ev-form").innerHTML = '<details class="ev-dom" data-d="ctx"' + ab("ctx") + '><summary>Contexto de la misión <small>decide qué reglas aplican</small></summary>' + ctx + "</details>" + doms;
    $("#ev-ndatos").textContent = n + " de " + vistos.size + " datos disponibles";
    filtrar();
  }
  function filtrar() { const q = filtro.trim().toLowerCase(); $$("#ev-form .ev-f").forEach(f => { f.hidden = !!q && !(f.dataset.n || "").includes(q); }); $$("#ev-form details").forEach(d => { if (q) { d.open = true; d.hidden = !$$(".ev-f", d).some(f => !f.hidden); } else d.hidden = false; }); }

  // ---- informe
  const tabla = (cab, filas) => '<div class="tabla"><table><thead><tr>' + cab.map(c => "<th>" + c + "</th>").join("") + "</tr></thead><tbody>" + filas.map(f => "<tr>" + f.map(c => "<td>" + c + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>";
  const valor = a => a.valor == null ? "" : /==\s*1/.test(a.criterio) ? "" : " · medido " + a.valor;
  const fila = a => [nivel(a.nivel), "<b>" + esc(a.nombre) + "</b><small>" + esc(a.id) + " · " + esc(a.dominio) + (a.dentro_del_margen_de_error ? " · dentro del margen de error del sensor" : "") + (a.subsume && a.subsume.length ? " · incluye " + esc(a.subsume.join(", ")) : "") + "</small>", esc(AH.humano(a.criterio)) + esc(valor(a)), esc(a.accion_propuesta || ""), esc(a.confirmacion || "")];
  function informe() {
    if (!ult) return '<div class="tarj c12"><p class="nota">Aún no hay una evaluación. Pulsa «Evaluar ahora».</p></div>';
    const r = ult.r, c = r.cobertura, e = r.ensamble || {}, au = r.auditoria || {}, pd = (r.no_evaluable || {}).por_dominio || {}, pend = (r.niveles || {}).mayor_nivel_pendiente_de_verificar, S = [];
    S.push('<div class="tarj c12 ev-res s-' + NCLS[r.nivel_final] + '"><div class="ev-nivel"><span>Nivel de la evaluación</span><b>' + NTXT[r.nivel_final] + "</b><em>" + ({ REGLAS: "determinado por las reglas", ENSAMBLE: "sugerido por el ensamble, a confirmar", REGLAS_Y_ENSAMBLE: "reglas y ensamble coinciden", NINGUNO: "ninguna regla activada" }[r.origen_del_nivel] || esc(String(r.origen_del_nivel || "").toLowerCase().replace(/_/g, " "))) + "</em></div>" +
      '<div class="kpis">' + [["Hallazgos", (r.alertas || []).length, "reglas activadas"], ["Por verificar", (r.verificar_señal || []).length, pend ? "hasta nivel " + NTXT[pend].toLowerCase() : "señales en duda"], ["Reglas evaluadas", c.evaluadas + "<small> de " + c.reglas_con_nivel_habilitadas + "</small>", c.no_calculables + " sin datos · " + c.no_aplican_por_contexto + " no aplican en esta fase"]]
        .map(k => '<div class="kpi"><span>' + k[0] + "</span><b>" + k[1] + "</b><em>" + k[2] + "</em></div>").join("") + "</div>" +
      '<p class="nota">' + (ult.modo === "servidor" ? "Evaluado por el motor de Python " + esc(au.version_motor || "") + " a las " + hora(ult.t) + "." : "Evaluado en la página con las reglas del catálogo, a las " + hora(ult.t) + ". Sin el servidor no hay ensamble completo, lecturas próximas a un umbral ni plan por antecedentes.") + (ult.nota ? " " + esc(ult.nota) : "") + " Lo no medido no se considera normal.</p></div>");
    S.push('<div class="tarj c12"><h2>Hallazgos <small>ordenados por nivel</small></h2>' + ((r.alertas || []).length ? tabla(["Nivel", "Hallazgo", "Criterio y valor", "Acción propuesta", "Confirmación"], r.alertas.map(fila)) : '<p class="s-estable" style="color:var(--c)">✓ Ninguna regla se activa con los datos disponibles.</p>') + "</div>");
    if ((r.verificar_señal || []).length) S.push('<div class="tarj c12"><h2>Señales por verificar <small>el valor cruza un umbral pero la calidad del sensor está en duda</small></h2>' + tabla(["Nivel si se confirma", "Hallazgo", "Criterio y valor", "Motivo", "Qué hacer"], r.verificar_señal.map(a => { const f = fila(a); return [f[0], f[1], f[2], esc(AH.motivo(a.motivo)), esc(a.que_hacer || a.confirmacion || "")]; })) + "</div>");
    if ((r.completar_contexto || []).length) S.push('<div class="tarj c12"><h2>Contexto por completar</h2>' + tabla(["Nivel", "Hallazgo", "Criterio y valor", "Motivo", "Qué hacer"], r.completar_contexto.map(a => { const f = fila(a); return [f[0], f[1], f[2], esc(AH.motivo(a.motivo)), esc(a.que_hacer || "")]; })) + "</div>");
    if ((r.lecturas_cercanas_a_umbral || []).length) S.push('<div class="tarj c6"><h2>Lecturas próximas a un umbral</h2>' + tabla(["Medida", "Valor", "Umbral", "Si lo cruzara", "Distancia"], r.lecturas_cercanas_a_umbral.map(l => [esc(etq(l.variable)) + "<small>" + esc(l.regla) + "</small>", l.valor, esc(String(l.umbral).replace(">=", "≥").replace("<=", "≤")), nivel(l.nivel_si_cruzara), l.distancia_en_dt_sensor == null ? "—" : l.distancia_en_dt_sensor + " DE del sensor"])) + '<p class="nota">Distancia al umbral en desviaciones típicas del error del sensor: por debajo de 1, una repetición de la medida podría cruzarlo.</p></div>');
    if (e.disponible) {
      const pa = e.puntuacion_acumulada || {}, pc = x => x == null ? "—" : (x * 100).toFixed(1) + " %";
      S.push('<div class="tarj c6"><h2>' + (e.destilado ? "Modelo destilado" : "Ensamble de modelos") + " <small>" + esc(e.destilado ? "aproximación en la página, con 5 signos vitales" : au.modelo || "") + "</small></h2>" +
        tabla(["Resultado", "Valor"], [["Nivel más probable", nivel(e.nivel_mas_probable)], ["Nivel conservador", nivel(e.nivel_conservador)], ["Puntuación de consulta o superior", pc(pa[">=CONSULTA"])], ["Puntuación de prioritaria o superior", pc(pa[">=PRIORITARIA"])], ["Puntuación de inmediata", pc(pa[">=INMEDIATA"])]]
          .concat(e.acuerdo_entre_modelos == null ? [] : [["Acuerdo entre los modelos", pc(e.acuerdo_entre_modelos)], ["Confianza", esc(String(e.confianza || "").toLowerCase())], ["Respaldo al nivel de las reglas", pc(e.respaldo_al_nivel_de_reglas)]])) +
        ((e.datos_que_mas_pesan || []).length ? "<h3>Datos que más pesan</h3>" + tabla(["Dato", "Valor", "Cambio en la puntuación"], e.datos_que_mas_pesan.map(d => { const k = Object.keys(d).find(z => z.startsWith("cambio")); return [esc(etq(d.dato)), d.dato === "mission_phase" ? (FASES[d.valor] || ["", d.valor])[1] : d.valor, (d[k] >= 0 ? "+" : "−") + Math.abs(d[k] * 100).toFixed(1) + " puntos"]; })) : "") +
        '<p class="nota">Puntuación sobre el nivel de triaje, calibrada solo en un banco sintético. No es probabilidad de enfermedad. El ensamble solo puede elevar el nivel, como sugerencia a confirmar.</p></div>');
    }
    const cal = r.avisos_de_calidad_y_abstencion || [], av = (r.avisos || []).concat(r.notas_de_fusion || []), re = r.datos_rechazados || [];
    if (cal.length || av.length || re.length) S.push('<div class="tarj c6"><h2>Calidad de los datos y abstenciones</h2>' + (cal.length ? tabla(["Aviso", "Qué hacer"], cal.map(a => ["<b>" + esc(a.nombre) + "</b><small>" + esc(a.id) + " · " + esc(a.dominio) + "</small>", esc(a.accion_propuesta || "")])) : "") +
      (re.length ? "<h3>Datos rechazados</h3><ul>" + re.map(x => "<li>" + esc(etq(x.campo)) + ": " + esc(String(x.motivo).replace("DATO_INVALIDO: ", "valor no plausible, ")) + "</li>").join("") + "</ul>" : "") + (av.length ? "<h3>Notas del motor</h3><ul>" + av.map(x => "<li>" + esc(x) + "</li>").join("") + "</ul>" : "") + "</div>");
    if ((r.plan_por_antecedentes || []).length) S.push('<div class="tarj c6"><h2>Plan de vigilancia por antecedentes</h2>' + tabla(["Antecedente", "Modificación del plan"], r.plan_por_antecedentes.map(p => [esc(p.antecedente), esc(p.modificacion_del_plan)])) + "</div>");
    if (r.puntuacion_vte_nasa_2026) { const v = r.puntuacion_vte_nasa_2026; S.push('<div class="tarj c6"><h2>Riesgo tromboembólico <small>propuesta NASA 2026</small></h2><p>' + (v.estado === "CALCULADO" ? v.puntos + " puntos." : "No calculable: faltan " + esc((v.faltan || []).join(", ")) + ".") + ' <span class="nota">Son puntos, no una probabilidad.</span></p></div>'); }
    const dn = Object.keys(pd);
    if (dn.length) S.push('<div class="tarj c12"><h2>Cobertura por dominio <small>' + dn.length + " dominios con reglas sin evaluar</small></h2><details><summary>Qué falta medir y cómo completarlo</summary>" + tabla(["Dominio", "Reglas sin evaluar", "Datos que faltan", "Cómo completarlos"], dn.map(k => [esc(k), pd[k].reglas_sin_evaluar, esc(pd[k].faltan.map(etq).join("; ")), esc((pd[k].como_completar || []).join("; "))])) + "</details></div>");
    S.push(resolucion(r));
    S.push('<div class="tarj c12"><h2>Auditoría</h2><dl class="ev-aud">' + [["Motor", au.version_motor], ["Catálogo", au.catalogo], ["Modelo", au.modelo], ["Huella del catálogo (SHA-256)", au.sha256_catalogo], ["Huella de las reglas", au.huella_reglas], ["Fecha de la evaluación (UTC)", au.fecha_evaluacion_utc], ["Datos usados", Object.keys(au.entradas_usadas || {}).length]].filter(x => x[1] != null && x[1] !== "").map(x => "<dt>" + x[0] + "</dt><dd>" + esc(x[1]) + "</dd>").join("") +
      '</dl><p class="nota">Prototipo de investigación: no es un dispositivo médico. No diagnostica ni prescribe; toda decisión requiere revisión del médico de vuelo.</p></div>');
    return S.join("");
  }
  AH.motivo = t => String(t || "").replace(/\(([^)]*)\)/, (m, a) => "(" + a.split(",").map(x => etq(x.trim())).join("; ") + ")");

  // ---- resolución del caso: orientación de un modelo o consulta a tierra (esta última, solo preparada)
  function resolucion(r) {
    const con = (AH.perfil.consultas || []).slice().reverse(), ef = AH.LLM.efectivo, dis = p => { const e = ef(p); return e === p || (p !== "local" && e === "claude"); };
    return '<div class="tarj c12"><h2>Resolución del caso</h2><div class="ev-vias">' +
      '<div><b>Modelo local</b><p class="nota">Orientación redactada por un modelo que corre a bordo, sin depender del enlace con tierra. ' + (dis("local") ? "Configurado: " + esc(cfg.llm.modelo_local) + "." : "Requiere el servidor y un modelo local en marcha (Opciones › Asistente).") + '</p><button type="button" class="btn" data-o="local"' + (dis("local") ? "" : " disabled") + ">Pedir orientación al modelo local</button></div>" +
      '<div><b>Modelo en la nube</b><p class="nota">' + (ef("groq") === "claude" ? "En la página publicada responde Claude." : "Groq · " + esc(cfg.llm.modelo) + ". " + (dis("groq") ? "Necesita enlace de datos." : "Requiere el servidor con la clave de Groq (Opciones › Asistente).")) + '</p><button type="button" class="btn" data-o="groq"' + (dis("groq") ? "" : " disabled") + ">Pedir orientación al modelo en la nube</button></div>" +
      '<div><b>Médico en tierra</b><p class="nota">Envía el resumen del caso a la consola del médico de vuelo en tierra. ' + (AH.Tierra.activo ? "Enlace activo." : "Sin enlace ahora: la consulta queda guardada en el expediente.") + '</p><button type="button" class="btn pri" data-o="tierra">' + (AH.Tierra.activo ? "Enviar consulta a tierra" : "Preparar consulta a tierra") + "</button></div></div>" +
      (orient ? '<div class="ev-orient"><h3>' + esc(orient.titulo) + "</h3><p>" + esc(orient.texto).replace(/\n/g, "<br>") + '</p><p class="nota">' + esc(orient.pie) + "</p></div>" : "") +
      (con.length ? "<h3>Consultas preparadas</h3>" + tabla(["Fecha", "Motivo", "Estado"], con.slice(0, 5).map(c => [fecha(c.t) + " " + hora(c.t).slice(0, 5), esc(c.motivo), esc(c.estado)])) : "") + "</div>";
  }
  function resumenCaso() {
    const r = ult.r, p = AH.perfil, L = [];
    L.push("Tripulante " + p.id + " · " + (AH.Perfil.edad() == null ? "" : AH.Perfil.edad() + " años · ") + (p.sexo === "M" ? "hombre" : "mujer") + " · día " + p.mision.dia + " de misión", "Nivel de la evaluación: " + NTXT[r.nivel_final] + " (" + String(r.origen_del_nivel).toLowerCase().replace(/_/g, " ") + ")");
    L.push("Hallazgos:"); (r.alertas || []).forEach(a => L.push("- [" + NTXT[a.nivel] + "] " + a.nombre + " (" + a.id + "): " + AH.humano(a.criterio) + valor(a) + ". Acción: " + a.accion_propuesta + ". Confirmación: " + a.confirmacion)); if (!(r.alertas || []).length) L.push("- Ninguno");
    if ((r.verificar_señal || []).length) { L.push("Señales por verificar:"); r.verificar_señal.forEach(a => L.push("- " + a.nombre + " (" + a.id + "): " + AH.humano(a.criterio) + valor(a) + ". " + AH.motivo(a.motivo))); }
    if ((r.lecturas_cercanas_a_umbral || []).length) { L.push("Lecturas próximas a un umbral:"); r.lecturas_cercanas_a_umbral.forEach(l => L.push("- " + etq(l.variable) + " " + l.valor + " (umbral " + l.umbral + ", " + NTXT[l.nivel_si_cruzara].toLowerCase() + " si lo cruzara)")); }
    L.push("Signos actuales: FC " + V.hr + " lpm, SpO₂ " + V.spo2 + " %, PA " + V.sbp + "/" + V.dbp + " mmHg, FR " + V.fr + " rpm, temperatura " + V.temp + " °C, glucosa " + V.cgm + " mg/dL");
    if (p.antecedentes.length) L.push("Antecedentes: " + p.antecedentes.map(a => a.nombre + " (" + a.estado + ")").join("; ")); if (p.medicacion.length) L.push("Medicación: " + p.medicacion.map(a => a.nombre + " " + a.pauta).join("; ")); if (p.alergias.length) L.push("Alergias: " + p.alergias.map(a => a.sustancia).join("; "));
    const an = AH.Perfil.anomalos(); if (an.length) L.push("Laboratorio fuera de referencia: " + an.join("; "));
    L.push("Cobertura: " + r.cobertura.evaluadas + " de " + r.cobertura.reglas_con_nivel_habilitadas + " reglas evaluadas; " + r.cobertura.no_calculables + " sin datos.");
    return L.map(x => AH.tr(x)).join("\n");
  }
  const SIS = AH.LLM.HEALER + " You now receive the REPORT of the onboard alert engine for the crew medical officer. Write in plain text without markdown three short headed sections: SUMMARY (2 sentences), CONFIRM FIRST (the confirmations the engine asks for, in order of level) and WATCH (readings close to a threshold and missing data). End by recalling that the decision belongs to the flight surgeon.";
  async function orientar(via) {
    if (!ult) return;
    if (via === "tierra") {
      const r = ult.r, p = AH.perfil, pr = (r.alertas || [])[0]; p.consultas = p.consultas || [];
      const motivo = AH.tr("Nivel") + " " + AH.tr(NTXT[r.nivel_final]).toLowerCase() + " · " + AH.tr(pr ? pr.nombre : "sin hallazgos"), c = { id: uid(), t: Date.now(), motivo, estado: "Preparada · sin enlace con tierra", resumen: resumenCaso() };
      p.consultas.push(c); if (p.consultas.length > 40) p.consultas.shift();
      const fin = (ok, err) => { c.estado = ok ? "Enviada a tierra · " + hora().slice(0, 5) : "Preparada · sin enlace con tierra"; AH.guardarPerfil(); log("evaluacion", ok ? "Consulta enviada al médico en tierra" : "Consulta preparada; no se pudo enviar" + (err ? ": " + err : ""), ok ? "ok" : "precaucion");
        orient = { titulo: ok ? "Consulta enviada al médico en tierra" : "Consulta preparada · sin enlace con tierra", texto: c.resumen, pie: ok ? "El médico la ve en la consola de tierra y su respuesta llega a Asistente › Médico en tierra." : "Quedó guardada en el expediente. Se envía cuando haya enlace con el servidor." }; pintarInforme(); };
      if (AH.Tierra.activo) AH.Tierra.enviar(AH.tr("Consulta") + ": " + motivo + "\n" + c.resumen, "consulta", { evaluacion: { nivel: r.nivel_final, hallazgos: (r.alertas || []).map(a => a.id) } }).then(() => fin(true)).catch(e => fin(false, e.message)); else fin(false);
      return;
    }
    orient = { titulo: "Orientación del modelo", texto: "Consultando al modelo…", pie: "" }; pintarInforme();
    try { const o = await AH.LLM.pedir(SIS + AH.LLM.idioma(), [{ role: "user", content: "REPORT\n" + resumenCaso() }], via); orient = { titulo: "Orientación · " + o.origen, texto: String(o.texto || "").trim(), pie: "Texto generado por un modelo de lenguaje a partir del informe del motor. No es una indicación médica: la decisión es del médico de vuelo." }; log("evaluacion", "Orientación recibida de " + o.origen); }
    catch (e) { orient = { titulo: "Orientación no disponible", texto: "No pude obtener respuesta: " + (e.message || e) + ".", pie: "El informe del motor de arriba no depende de este paso." }; log("evaluacion", "Orientación no disponible: " + (e.message || e), "precaucion"); }
    pintarInforme();
  }

  // ---- exportación
  function markdown() {
    const r = ult.r, L = ["# Evaluación completa · " + AH.perfil.nombre, "", fecha(ult.t) + " " + hora(ult.t) + " · " + (ult.modo === "servidor" ? "motor de Python " + (r.auditoria.version_motor || "") : "reglas del catálogo evaluadas en la página"), "", "```", resumenCaso(), "```", "", "## Cobertura por dominio"], pd = (r.no_evaluable || {}).por_dominio || {};
    Object.keys(pd).forEach(k => L.push("- " + k + ": " + pd[k].reglas_sin_evaluar + " reglas sin evaluar; faltan " + pd[k].faltan.map(etq).join(", ")));
    if (orient) L.push("", "## " + orient.titulo, orient.texto);
    L.push("", "Prototipo de investigación. No diagnostica ni prescribe; requiere revisión del médico de vuelo."); return L.join("\n");
  }

  // ---- pantalla
  $("#rej-evaluacion").innerHTML = '<div class="tarj c12" id="ev-cab"></div><div class="tarj ev-izq"><h2>Datos del caso <small id="ev-ndatos"></small></h2><input type="search" id="ev-buscar" placeholder="Buscar una medida" aria-label="Buscar una medida">' +
    '<p class="nota">Los valores marcados «monitor», «perfil» y «bienestar» se toman solos. Lo que escribas a mano queda como «manual» y tiene prioridad.</p><div id="ev-form"></div></div><div class="rej ev-der" id="ev-inf"></div>';
  function pintarCab() {
    const C = cat(), E = AH.Enlace, nr = C.dominios.reduce((s, d) => s + d.variables.reduce((t, x) => t + x.reglas.filter(r => r.habilitada).length, 0), 0);
    $("#ev-cab").innerHTML = "<h2>Evaluación completa <small>" + C.n_reglas + " reglas en " + C.dominios.length + " dominios · " + nr + " habilitadas · catálogo v" + esc(C.version) + " · " + (E.vinculado ? "motor de Python " + esc(E.info.motor.version) + (E.info.motor.ensamble ? " con ensamble" : " sin ensamble") : "sin servidor: reglas del catálogo evaluadas en la página") + "</small></h2>" +
      '<div class="fila-btn"><button type="button" class="btn pri" data-e="evaluar"' + (ocupado ? " disabled" : "") + ">" + (ocupado ? "Evaluando…" : "Evaluar ahora") + '</button><button type="button" class="btn" data-e="md"' + (ult ? "" : " disabled") + '>Exportar informe · Markdown</button><button type="button" class="btn" data-e="json"' + (ult ? "" : " disabled") + '>Exportar · JSON</button><button type="button" class="btn" data-e="limpiar"' + (Object.keys(manual).length ? "" : " disabled") + ">Quitar datos manuales</button></div>";
  }
  function pintarInforme() { $("#ev-inf").innerHTML = informe(); }
  function pintar() { pintarCab(); formulario(); pintarInforme(); }
  $("#rej-evaluacion").addEventListener("click", e => {
    const b = e.target.closest("[data-e]"), o = e.target.closest("[data-o]"), q = e.target.closest("[data-q]");
    if (q) { delete manual[q.dataset.q]; AH.guardar("eval-manual", manual); return evaluar(); }
    if (o) return orientar(o.dataset.o);
    if (!b) return; const a = b.dataset.e, sello = fecha() + "_" + hora().replace(/:/g, "");
    if (a === "evaluar") evaluar();
    else if (a === "md") AH.descargar("evaluacion_" + AH.perfil.id + "_" + sello + ".md", markdown());
    else if (a === "json") AH.descargar("evaluacion_" + AH.perfil.id + "_" + sello + ".json", JSON.stringify({ generado: new Date(ult.t).toISOString(), origen: ult.modo === "servidor" ? "motor de Python" : "reglas del catálogo evaluadas en la página", entradas: ult.datos, fuente_de_cada_dato: ult.fuentes, resultado: ult.r, orientacion: orient }, null, 1));
    else if (a === "limpiar") { manual = {}; AH.guardar("eval-manual", manual); evaluar(); }
  });
  $("#rej-evaluacion").addEventListener("change", e => {
    const t = e.target, k = t.dataset.v; if (!k) return;
    if (k === "mission_phase") manual[k] = t.value; else if (t.value === "") delete manual[k]; else manual[k] = +t.value;
    AH.guardar("eval-manual", manual); evaluar();
  });
  $("#rej-evaluacion").addEventListener("input", e => { if (e.target.id === "ev-buscar") { filtro = e.target.value; filtrar(); } });
  on("panel", t => { if (t === "evaluacion") { pintar(); evaluar(); } });
  on("enlace", () => { if ($("#p-evaluacion").classList.contains("on")) { pintarCab(); } });
  AH.Evaluacion = { evaluar, local, entradas, get ultimo() { return ult; }, NTXT };
})();
