/* Asistente (Groq o modelo local a través del servidor, Claude en la página publicada, reglas como respaldo), voz, apoyo inmediato y bienestar psicológico como entrada del motor de alertas. */
(function () {
  const { $, $$, esc, V, cfg, on, emit, log, hora, uid } = AH, M = AH.Motor;
  const CRISIS = /(no quiero (seguir )?(vivir|viviendo|existir|despertar)|ganas de morir|quiero morir(me)?|prefiero (estar )?muert|quitarme la vida|matarme|suicid|hacerme da[ñn]o|lastimarme|acabar con (todo|mi vida)|no (le )?veo sentido a (la vida|vivir)|o[ií]go voces|escucho voces|abrir la escotilla)/i;
  // El asistente es siempre un modelo de lenguaje real. Si no hay modelo disponible se dice, y no se inventa ninguna respuesta.
  const HEALER = "You are Astronaut Healer, the flight-medicine clinician AI that looks after the crew of a space mission. You reason like an experienced aerospace physician: you integrate vital signs, continuous arterial pressure, continuous glucose, oxygenation, respiration, temperature, cabin atmosphere, radiation exposure, laboratory panels, hormonal profile and cycle phase, sleep and psychological wellbeing, together with the findings of the onboard alert engine. " +
    "You account for spaceflight physiology: cephalad fluid shift, cardiovascular deconditioning and orthostatic intolerance, bone and muscle loss, renal stone risk, neuro-ocular syndrome, radiation, CO2 exposure, circadian disruption, isolation and workload. " +
    "Rules: use only the figures you are given and say plainly what is missing; never invent a value. Put what is measured and urgent first; if an alert of the highest level is active, start with its indicated action. Do not lower the level assigned by the alert engine. Do not give drug names or doses. " +
    "You speak directly to the astronaut, calm, precise and caring. You support decisions; the flight surgeon on the ground decides. If the person describes chest pain, shortness of breath or thoughts of self-harm, tell them to press HELP (AYUDA) and call the flight surgeon.";
  const SIS_CHAT = HEALER + " In conversation, answer in at most 5 sentences, in plain text without markdown.";
  const SIS_PAQUETE = HEALER + " You now receive a BIOMETRIC PACKAGE from the astronaut's monitor. Interpret it in plain text without markdown, with these five headed sections: 1) OVERALL STATUS (two sentences and the alert level). 2) FINDINGS BY SYSTEM, most urgent first, citing each value with its unit and its reference or threshold. " +
    "3) CHECK NOW: what to confirm or re-measure on board, in order. 4) WATCH: trends and values close to a threshold over the next hours. 5) CONTACT GROUND: when and for what to call the flight surgeon. Finish with the data that is missing and would change the interpretation.";
  const idioma = () => (cfg.idioma === "en" ? " Answer in English." : " Responde siempre en español.");
  const chat = [];
  let pruebasPend = 0;
  const DIA = 864e5;

  $("#rej-asistente").innerHTML =
    '<div class="col6"><div class="tarj" id="tj-chat"><h2>Asistente clínico <small id="llm-prov"></small></h2><div class="chat" id="chat" aria-live="polite" data-notr></div>' +
    '<div class="sugs" id="sugs"></div><form class="entrada" id="f-chat"><input type="text" id="in-chat" placeholder="Escribe o dicta tu consulta" autocomplete="off" aria-label="Mensaje al asistente">' +
    '<button type="button" class="btn btn-mic" id="btn-mic" title="Dictar" aria-label="Dictar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>' +
    '<button type="submit" class="btn pri">Enviar</button></form><p class="nota" id="nota-voz"></p>' +
    '<div class="fila-btn"><button type="button" class="btn" id="btn-paquete">Enviar paquete biométrico para interpretación</button><button type="button" class="btn" id="btn-ver-paquete">Ver el paquete</button></div>' +
    '<details id="det-paquete" hidden><summary>Paquete biométrico compacto</summary><pre class="paquete" id="pre-paquete" data-notr></pre></details></div>' +
    '<div class="tarj" id="tj-tierra"><h2>Médico en tierra <small id="tierra-estado"></small></h2><div class="chat" id="tierra-hilo" aria-live="polite" data-notr></div>' +
    '<form class="entrada" id="f-tierra"><input type="text" id="in-tierra" placeholder="Mensaje para el médico de vuelo en tierra" autocomplete="off" aria-label="Mensaje para el médico en tierra"><button type="submit" class="btn pri">Enviar</button></form></div></div>' +
    '<div class="tarj c6" id="tj-animo"><h2 style="color:var(--animo)">Bienestar psicológico <small>sus resultados entran al motor de alertas</small></h2><div class="pruebas" id="pruebas"></div><div id="zona-prueba"></div><p class="nota" id="bien-estado"></p>' +
    '<h3>Señales que recibe el motor</h3><div id="bien-motor"></div>' +
    '<h3>Clima interior de los últimos días</h3><div class="cielo-hist" id="cielo-hist"></div><div class="kpis" id="kpi-animo"></div></div>';

  // =============================== conversación
  function burbuja(rol, texto, clase, autor) {
    chat.push({ rol, texto, t: Date.now() }); if (chat.length > 60) chat.shift();
    const d = document.createElement("div"); d.className = "msg " + (rol === "yo" ? "yo" : "") + " " + (clase || "");
    d.innerHTML = "<small>" + esc(rol === "yo" ? (AH.perfil.nombre || "Tripulante") : (autor || "Asistente")) + " · " + hora() + "</small>" + esc(texto).replace(/\n/g, "<br>");
    const c = $("#chat"); c.appendChild(d); c.scrollTop = c.scrollHeight; return d;
  }
  function nota(texto) { const d = document.createElement("div"); d.className = "msg sis"; d.textContent = texto; const c = $("#chat"); c.appendChild(d); c.scrollTop = c.scrollHeight; return d; }
  const fuera = k => { const L = cfg.limites[k]; return V[k] != null && L && (V[k] < L[0] || V[k] > L[1]) ? (V[k] < L[0] ? "bajo" : "alto") : null; };
  function alterados() { return ["hr", "spo2", "fr", "sbp", "cgm", "temp"].filter(fuera).map(k => M.NOM[k] + " " + V[k] + " " + M.UN[k] + " (" + fuera(k) + ")"); }
  function contexto() {
    const pf = AH.perfil, b = AH.Bienestar.vars(), fs = AH.faseCiclo ? AH.faseCiclo() : null;
    return { signos: { fc_lpm: V.hr, spo2_pct: V.spo2, fr_rpm: V.fr, pa_mmHg: V.sbp == null ? null : V.sbp + "/" + V.dbp, glucosa_mg_dl: V.cgm, temp_c: V.temp, ritmo: V.ritmo, ppco2_cabina_mmHg: V.co2, presion_cabina_kPa: V.pcab, tasa_dosis_uSv_h: V.rad, dosis_carrera_mSv: +M.carrera().toFixed(1) },
      fuera_de_rango: alterados(), alertas_activas: M.lista().map(a => ({ nivel: a.nivel, nombre: a.nombre, valor: a.valorTxt, accion: a.accion, regla: a.regla || a.id })),
      tripulante: { rol: pf.rol, edad: AH.Perfil.edad(), sexo: pf.sexo, fase_del_ciclo: fs ? fs.fase : undefined, antecedentes: pf.antecedentes.map(a => a.nombre + " (" + a.estado + ")"), laboratorio_fuera_de_referencia: AH.Perfil.anomalos(), dia_mision: pf.mision.dia },
      bienestar: b, modo: cfg.demo ? "demostración con señales simuladas" : "señales reales" };
  }
  // ---- paquete biométrico compacto (formato AHBIO1): unas pocas líneas de texto con abreviaturas clínicas, no un JSON
  const LEYENDA = " The package uses the compact text format AHBIO1, one section per line. ID: id, sex, age, height, weight, BMI, Tb basal temperature, ETH self-reported ethnicity (context only), CYC cycle phase and day, HC hormonal contraception (0/1), BG blood group, MD mission day/total. " +
    "VS: current value followed by [session min-max]; HR bpm and ECG rhythm (SR sinus rhythm, AF atrial fibrillation, VT ventricular tachycardia, PVCs), SpO2 %, BP systolic/diastolic and MAP mmHg, RR breaths/min, T core temperature in C, GLU interstitial glucose mg/dL with its trend per minute. " +
    "ENV: cabin ppCO2 mmHg, cabin pressure kPa, inspired O2 mmHg, RAD dose rate, ALT altitude, CAR career dose/limit in mSv. ALR: active alerts as level (U urgent, P caution, A notice), rule id, name and value. LAB: only the out-of-range results of the latest panels, with a down or up arrow. " +
    "WB: sleep7d mean hours of sleep, pvt attention lapses, psy self-reported distress, team conflict, load work overload (+ present, - absent), who5 WHO-5 index 0-100. PAIN: anatomical region, pain type, NRS 0-10, onset, time since onset, course, rad radiation, + associated symptoms. HX history, RX medication, ALG allergies. EV: level and findings of the last full evaluation. SIM means simulated signals.";
  function paquete() {
    const pf = AH.perfil, H = AH.H, fs = AH.faseCiclo(), u = AH.Evaluacion && AH.Evaluacion.ultimo, C = AH.Cuerpo, b = AH.Bienestar.vars(), r1 = x => Math.round(x * 10) / 10, L = [];
    const rg = k => { const a = H[k].filter(x => x != null); return a.length ? "[" + r1(Math.min(...a)) + "-" + r1(Math.max(...a)) + "]" : ""; }, sg = (k, v) => v == null ? "" : " " + k + (v ? "+" : "-");
    L.push("AHBIO1 " + new Date().toISOString().slice(0, 16) + "Z " + (cfg.demo ? "SIM" : "REAL"));
    L.push("ID " + pf.id + " " + pf.sexo + " " + AH.Perfil.edad() + "y " + pf.estatura_cm + "cm " + pf.masa_kg + "kg BMI" + (pf.masa_kg && pf.estatura_cm ? r1(pf.masa_kg / Math.pow(pf.estatura_cm / 100, 2)) : "?") + " Tb" + (pf.temp_basal || "?") + " ETH:" + (pf.origen_etnico || "?").split(" ")[0] +
      (pf.sexo === "F" ? " CYC:" + (fs ? fs.fase.slice(0, 3) + " d" + fs.dia : "na") + " HC:" + (pf.ciclo.hormonal ? 1 : 0) : "") + " BG:" + (pf.sangre || "?") + " MD" + pf.mision.dia + "/" + pf.mision.duracion);
    L.push("VS HR" + V.hr + rg("hr") + " " + ({ sinusal: "SR", fa: "AF", tv: "VT", evs: "PVCs" }[V.ritmo] || V.ritmo) + " SpO2 " + V.spo2 + rg("spo2") + " BP" + V.sbp + "/" + V.dbp + " MAP" + V.map + " RR" + V.fr + " T" + V.temp + rg("temp") + " GLU" + V.cgm + rg("cgm") + "(" + (V.cgmTend >= 0 ? "+" : "") + r1(V.cgmTend || 0) + "/min)");
    L.push("ENV CO2 " + V.co2 + " P" + V.pcab + " PiO2 " + V.pio2 + " RAD" + V.rad + "uSv/h ALT" + V.alt + "km CAR" + r1(M.carrera()) + "/600");
    const al = M.lista(); L.push("ALR " + (al.length ? al.map(a => a.nivel[0].toUpperCase() + " " + (a.regla || a.id) + " " + AH.tr(a.nombre) + (a.valorTxt ? " " + a.valorTxt.replace(/ /g, "") : "")).join(" | ") : "none"));
    const an = AH.Perfil.anomalos(); L.push("LAB " + (an.length ? an.map(x => AH.tr(x)).join("; ") : "in range"));
    const wb = (b.sleep_hours_7d != null ? " sleep7d " + b.sleep_hours_7d + "h" : "") + sg("pvt", b.pvt_lapse_high_flag) + sg("psy", b.psych_selfreport_flag) + sg("team", b.team_conflict_flag) + sg("load", b.workload_alarm) + (b.who5 != null ? " who5 " + b.who5 : ""); L.push("WB" + (wb || " no records"));
    const dol = (pf.dolor || []).filter(d => d.activo); if (dol.length) dol.forEach(d => L.push("PAIN " + C.compacto(d)));
    const hx = pf.antecedentes.map(a => a.nombre + "(" + a.estado + ")").join("; "), rx = pf.medicacion.map(a => a.nombre + " " + a.pauta).join("; "), ag = pf.alergias.map(a => a.sustancia).join("; ");
    L.push("HX " + (hx || "none") + " | RX " + (rx || "none") + " | ALG " + (ag || "none"));
    if (u) L.push("EV " + u.r.nivel_final + " " + (u.r.alertas || []).map(a => a.id).join(",") + ((u.r["verificar_señal"] || []).length ? " verify:" + u.r["verificar_señal"].map(a => a.id).join(",") : ""));
    return L.join("\n");
  }
  // quién responde: Groq o un modelo local pasan por el servidor; la página publicada no puede conectarse a él y usa Claude
  function efectivo(p) {
    p = p || cfg.llm.proveedor; const E = AH.Enlace;
    if (p === "claude") return AH.cap.sample ? "claude" : "sin-servidor";
    if (!E.vinculado) return AH.cap.sample ? "claude" : "sin-servidor";
    if (p === "groq" && !(E.info.llm && E.info.llm.groq)) return "sin-clave";
    return p === "local" ? "local" : "groq";
  }
  async function pedir(sistema, mensajes, p, maxTokens) {
    const e = efectivo(p);
    if (e === "claude") { const r = await AH.cap.sample([{ role: "user", content: sistema + "\n\n" + mensajes.map(m => (m.role === "user" ? "Astronaut: " : "You: ") + m.content).join("\n") }], { modelTier: "quick", cache: false }); return { texto: r.text, origen: "Claude" }; }
    if (e === "groq" || e === "local") {
      const r = await AH.Enlace.llm({ proveedor: e, mensajes: [{ role: "system", content: sistema }].concat(mensajes), modelo: e === "groq" ? cfg.llm.modelo : cfg.llm.modelo_local, base: cfg.llm.base_local, max_tokens: maxTokens || 900 });
      return { texto: r.texto, origen: (e === "groq" ? "Groq · " : "modelo local · ") + r.modelo };
    }
    throw new Error(e === "sin-clave" ? "falta la clave de Groq en el servidor (Opciones › Asistente)" : "sin el servidor no hay acceso a Groq ni al modelo local");
  }
  AH.LLM = { pedir, efectivo, HEALER, LEYENDA, idioma, paquete };
  let ocupadoChat = false;
  async function enviar(texto) {
    texto = String(texto || "").trim(); if (!texto || ocupadoChat) return;
    burbuja("yo", texto); log("chat", "Tripulante: " + texto);
    if (CRISIS.test(texto)) return crisis("frase de riesgo en la conversación");
    const hist = chat.slice(-9, -1).map(m => ({ role: m.rol === "yo" ? "user" : "assistant", content: m.texto }));
    ocupadoChat = true; const espera = nota("Consultando al modelo…");
    try {
      const o = await pedir(SIS_CHAT + idioma() + "\nCONTEXT (JSON, live from the monitor): " + JSON.stringify(contexto()), hist.concat([{ role: "user", content: texto }]));
      espera.remove(); const t = String(o.texto || "").trim();
      if (!t) nota("El modelo devolvió una respuesta vacía. No se genera ninguna respuesta automática."); else { burbuja("asistente", t, "", "Astronaut Healer · " + o.origen); log("asistente", "[" + o.origen + "] " + t); AH.Audio.decir(t); }
    } catch (e) { espera.remove(); nota("Sin respuesta del modelo: " + (e.message || e) + ". No se genera ninguna respuesta automática."); log("asistente", "Sin respuesta del modelo: " + (e.message || e), "precaucion"); }
    ocupadoChat = false;
  }
  // una consulta al modelo: lo que envía la persona aparece como suyo y la respuesta, si llega, como del modelo
  async function consulta(rotulo, sistema, contenido, maxTokens, espera0) {
    if (ocupadoChat) return false; burbuja("yo", rotulo); ocupadoChat = true; const espera = nota(espera0 || "Consultando al modelo…"); let ok = false;
    try {
      const o = await pedir(sistema + idioma(), [{ role: "user", content: contenido }], undefined, maxTokens || 1200);
      espera.remove(); const t = String(o.texto || "").trim();
      if (!t) nota("El modelo devolvió una respuesta vacía."); else { burbuja("asistente", t, "", "Astronaut Healer · " + o.origen); log("asistente", "[" + o.origen + "] " + t.slice(0, 300), "ok"); ok = true; }
    } catch (e) { espera.remove(); nota("Sin respuesta del modelo: " + (e.message || e) + ". No se genera ninguna respuesta automática."); log("asistente", "Sin respuesta del modelo: " + (e.message || e), "precaucion"); }
    ocupadoChat = false; $("#tj-chat").scrollIntoView({ block: "nearest" }); return ok;
  }
  function interpretar() {
    const p = paquete(); $("#pre-paquete").textContent = p; $("#det-paquete").hidden = false; log("chat", "Paquete biométrico enviado al modelo (" + p.length + " caracteres)");
    return consulta("Paquete biométrico enviado para interpretación (" + p.length + " caracteres).", SIS_PAQUETE + LEYENDA, "BIOMETRIC PACKAGE\n" + p, 1800, "El modelo está interpretando el paquete…");
  }
  $("#btn-paquete").addEventListener("click", interpretar);
  $("#btn-ver-paquete").addEventListener("click", () => { const d = $("#det-paquete"); $("#pre-paquete").textContent = paquete(); d.hidden = false; d.open = true; });
  function proveedor() {
    const e = efectivo(), n = { claude: "Claude (página publicada)", groq: "Groq · " + cfg.llm.modelo, local: "modelo local · " + cfg.llm.modelo_local, "sin-clave": "sin modelo: falta la clave de Groq en el servidor", "sin-servidor": "sin modelo: Groq y el modelo local requieren el servidor" };
    $("#llm-prov").textContent = n[e] || e;
  }
  $("#sugs").innerHTML = ["¿Cómo están mis signos?", "¿Cómo va mi glucosa?", "Me duele la cabeza", "¿Cuánta radiación llevo?", "Dormí poco"].map(s => '<button type="button">' + s + "</button>").join("");
  $("#sugs").addEventListener("click", e => { if (e.target.tagName === "BUTTON") enviar(e.target.textContent); });
  $("#f-chat").addEventListener("submit", e => { e.preventDefault(); const i = $("#in-chat"); enviar(i.value); i.value = ""; });

  // ---- voz: dictado de la página publicada o reconocimiento del navegador
  let rec = null, dictando = false;
  function micro(onOff, nota) { dictando = onOff; $("#btn-mic").classList.toggle("on", onOff); if (nota != null) $("#nota-voz").textContent = nota; }
  $("#btn-mic").addEventListener("click", () => {
    const d = AH.cap.dictation, i = $("#in-chat");
    if (d) {
      if (dictando) { d.stop().catch(() => {}); return; }
      if (!d._lig) { d._lig = true; d.onPartial(({ text }) => { i.value = text; }); d.onFinal(({ text }) => { i.value = ""; enviar(text); }); d.onState(({ state }) => micro(state === "listening", state === "listening" ? "Escuchando" : "")); }
      d.start().catch(e => micro(false, e && e.code === "not_granted" ? "El dictado no está permitido; puedes escribir." : "No pude iniciar el dictado; puedes escribir.")); return;
    }
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) return micro(false, "Este navegador no ofrece dictado; puedes escribir.");
    if (dictando && rec) { rec.stop(); return; }
    rec = new R(); rec.lang = cfg.idioma === "en" ? "en-US" : "es-MX"; rec.interimResults = true;
    rec.onresult = e => { const r = e.results[e.results.length - 1]; i.value = r[0].transcript; if (r.isFinal) { const t = i.value; i.value = ""; enviar(t); } };
    rec.onend = () => micro(false, ""); rec.onerror = e => micro(false, "No pude usar el micrófono (" + e.error + "); puedes escribir.");
    try { rec.start(); micro(true, "Escuchando"); } catch (e) { micro(false, "No pude usar el micrófono; puedes escribir."); }
  });

  // =============================== apoyo inmediato (AYUDA / SOS)
  function crisis(motivo) {
    log("apoyo", "Apoyo solicitado: " + motivo, "urgencia");
    M.manual({ id: "APOYO", nombre: "Apoyo solicitado por el tripulante", nivel: "urgencia", valorTxt: "", criterio: motivo, accion: "Acompañar y avisar al médico de vuelo", cat: "bienestar" });
    const c = $("#capa"); c.hidden = false;
    c.innerHTML = '<div class="dialogo s-animo" role="dialog" aria-label="Apoyo"><h2>Estoy contigo.</h2><p>Tu petición de ayuda quedó registrada y la alerta está activa en el monitor. Respira con el círculo: inhala cuando crece, exhala cuando se encoge.</p>' +
      '<div class="circulo" id="circ-apoyo">respira</div><p class="nota">Esta página no envía mensajes fuera del dispositivo: avisa también por el canal de voz de la misión o a la persona que tengas más cerca.</p>' +
      '<div class="fila-btn"><button type="button" class="btn vio" id="apoyo-ok">Ya hablé con alguien</button></div></div>';
    const ci = $("#circ-apoyo"); let dentro = false; const lat = setInterval(() => { dentro = !dentro; ci.className = "circulo " + (dentro ? "in" : "out"); ci.textContent = dentro ? "inhala" : "exhala"; }, 5000);
    setTimeout(() => { ci.className = "circulo in"; ci.textContent = "inhala"; dentro = true; }, 60);
    $("#apoyo-ok").addEventListener("click", () => { clearInterval(lat); c.hidden = true; c.innerHTML = ""; M.cerrar("APOYO", "el tripulante confirma que habló con alguien"); });
    AH.Audio.decir(AH.tr("Estoy contigo. Tu petición de ayuda quedó registrada. Respira conmigo"));
  }

  // =============================== ánimo: pruebas ligeras
  const CIELOS = [["Despejado", 1], ["Algo nublado", 0.5], ["Nublado", 0], ["Lluvia", -0.5], ["Tormenta", -1]];
  function cielo(k) {      // nubecitas dibujadas, no emoji: funcionan igual en los dos modos de color
    const sol = '<circle cx="15" cy="13" r="7" fill="var(--precaucion)"/>', nube = (x, y, c) => '<path d="M' + x + " " + (y + 12) + "a6 6 0 0 1 1-12a8 8 0 0 1 15-1a6.500 6.500 0 0 1 2 13z" + '" fill="' + c + '"/>';
    const gotas = '<path d="M17 30l-2 5M25 30l-2 5M33 30l-2 5" stroke="var(--onda)" stroke-width="2" stroke-linecap="round"/>', rayo = '<path d="M26 27l-5 7h5l-3 6" fill="none" stroke="var(--precaucion)" stroke-width="2" stroke-linejoin="round"/>';
    const p = [sol, sol + nube(18, 12, "var(--texto)"), nube(12, 9, "var(--texto)"), nube(12, 5, "var(--tenue)") + gotas, nube(12, 3, "var(--tenue)") + rayo + '<path d="M15 29l-2 5M36 29l-2 5" stroke="var(--onda)" stroke-width="2" stroke-linecap="round"/>'][k];
    return '<svg viewBox="5 1 38 38" aria-hidden="true">' + p + "</svg>";
  }
  const PRUEBAS = { clima: ["Clima interior", "el cielo que se parece a tu día · 10 s"], lastre: ["Termómetro de malestar", "de 0 a 10 y de dónde viene · 10 s"], who5: ["Índice OMS-5", "cinco frases sobre dos semanas · 40 s"], sueno: ["Sueño", "horas y calidad de anoche · 10 s"], reflejos: ["Vigilancia psicomotora", "cinco reacciones cronometradas · 30 s"], respira: ["Respiración guiada", "un minuto con el círculo"] };
  $("#pruebas").innerHTML = Object.keys(PRUEBAS).map(k => '<button type="button" data-p="' + k + '"><b>' + PRUEBAS[k][0] + "</b><small>" + PRUEBAS[k][1] + "</small></button>").join("");
  $("#pruebas").addEventListener("click", e => { const b = e.target.closest("[data-p]"); if (b) prueba(b.dataset.p); });
  function resaltar(k) { const b = $('#pruebas [data-p="' + k + '"]'); if (b) { b.style.borderColor = "var(--animo)"; setTimeout(() => { b.style.borderColor = ""; }, 6000); } pruebasPend = 1; punto(); }
  function punto() { const p = $("#punto-animo"), n = pruebasPend + ((AH.Tierra && AH.Tierra.sinLeer) || 0); p.hidden = !n; p.textContent = n || ""; }
  AH.punto = punto;
  const zona = () => $("#zona-prueba");
  const cerrarZona = () => { zona().innerHTML = ""; };
  function guardarAnimo(k, datos, bandera, motivo) {
    AH.perfil.animo.push({ t: Date.now(), prueba: k, datos, bandera, motivo: motivo || "" }); if (AH.perfil.animo.length > 300) AH.perfil.animo.shift();
    AH.guardarPerfil(); log("animo", PRUEBAS[k][0] + ": " + texto({ prueba: k, datos }) + (bandera ? " · señal al motor (" + motivo + ")" : ""), bandera ? "animo" : "info");
    pruebasPend = 0; punto(); cerrarZona(); historia();
    $("#bien-estado").textContent = PRUEBAS[k][0] + " · " + texto({ prueba: k, datos }) + " · guardado " + hora().slice(0, 5) + (bandera ? " · enviado al motor como señal (" + motivo + ")" : " · sin señal para el motor");
    if (bandera && k !== "respira") resaltar("respira");
  }
  const botones = (n, clase) => '<div class="escala ' + (clase || "") + '">' + Array.from({ length: n }, (_, i) => '<button type="button" data-n="' + i + '" aria-pressed="false">' + i + "</button>").join("") + "</div>";
  function elegir(cont, alElegir) { cont.addEventListener("click", e => { const b = e.target.closest("button[data-n]"); if (!b) return; $$("button[data-n]", cont).forEach(x => x.setAttribute("aria-pressed", String(x === b))); alElegir(+b.dataset.n); }); }
  function prueba(k) {
    const z = zona(), pie = '<div class="fila-btn"><button type="button" class="btn vio" data-ok disabled>Guardar</button><button type="button" class="btn" data-no>Ahora no</button></div>';
    const cab = t => '<div class="zona"><b style="color:var(--animo);font:600 15px var(--f-ui)">' + PRUEBAS[k][0] + "</b><span>" + t + "</span>";
    const listo = fn => { const ok = $("[data-ok]", z); ok.disabled = false; ok.onclick = fn; };
    if (k === "clima") {
      let c = null;
      z.innerHTML = cab("¿Qué cielo se parece más a tu día?") + '<div class="cielos">' + CIELOS.map((x, i) => '<button type="button" data-n="' + i + '" aria-pressed="false">' + cielo(i) + x[0] + "</button>").join("") + '</div><label class="desl"><span>Energía</span><input type="range" id="an-en" min="0" max="10" value="5"><output id="an-en-o">5</output></label>' + pie + "</div>";
      $("#an-en").oninput = e => { $("#an-en-o").textContent = e.target.value; };
      elegir($(".cielos", z), n => { c = n; listo(() => guardarAnimo("clima", { cielo: c, energia: +$("#an-en").value }, CIELOS[c][1] <= -0.5, "cielo de " + CIELOS[c][0].toLowerCase())); });
    } else if (k === "lastre") {
      let m = null; const causas = ["sueño", "ruido", "convivencia", "carga de trabajo", "familia", "salud"], sel = new Set();
      z.innerHTML = cab("¿Cuánto malestar cargas ahora? 0 es nada, 10 es el máximo.") + botones(11) + '<span>¿De dónde viene? Opcional.</span><div class="fichas">' + causas.map(c => '<button type="button" data-c="' + c + '" aria-pressed="false">' + c + "</button>").join("") + "</div>" + pie + "</div>";
      $(".fichas", z).addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (!b) return; const c = b.dataset.c; sel.has(c) ? sel.delete(c) : sel.add(c); b.setAttribute("aria-pressed", String(sel.has(c))); });
      elegir($(".escala", z), n => { m = n; listo(() => guardarAnimo("lastre", { malestar: m, causas: [...sel] }, m >= 4, "malestar " + m + "/10")); });
    } else if (k === "who5") {
      const items = ["Me he sentido alegre y de buen ánimo", "Me he sentido tranquilo y relajado", "Me he sentido activo y con energía", "Me he despertado fresco y descansado", "Mi vida cotidiana ha estado llena de cosas que me interesan"], r = [null, null, null, null, null];
      z.innerHTML = cab("En las últimas dos semanas… 0 = en ningún momento, 5 = todo el tiempo.") + items.map((t, i) => '<div data-i="' + i + '"><span>' + (i + 1) + ". " + t + "</span>" + botones(6, "e6") + "</div>").join("") + pie + "</div>";
      $$("[data-i]", z).forEach(d => elegir(d, n => { r[+d.dataset.i] = n; if (r.every(x => x != null)) listo(() => { const s = r.reduce((a, b) => a + b, 0) * 4; guardarAnimo("who5", { who5: s, respuestas: r.slice() }, s <= 50, "OMS-5 " + s + "/100"); }); }));
    } else if (k === "sueno") {
      let c = null;
      z.innerHTML = cab("¿Cuántas horas dormiste anoche y cómo fue el descanso? 1 = muy malo, 5 = muy bueno.") + '<label class="desl"><span>Horas</span><input type="range" id="an-h" min="0" max="12" step="0.5" value="7"><output id="an-h-o">7.0 h</output></label>' + botones(6, "e6") + pie + "</div>";
      $$(".escala button", z)[0].remove(); $("#an-h").oninput = e => { $("#an-h-o").textContent = (+e.target.value).toFixed(1) + " h"; };
      elegir($(".escala", z), n => { c = n; listo(() => { const h = +$("#an-h").value; guardarAnimo("sueno", { horas: h, calidad: c }, h < 6, h.toFixed(1) + " h de sueño"); }); });
    } else if (k === "reflejos") {
      const ts = []; let t0 = 0, tm = 0, falsos = 0;
      z.innerHTML = cab("Toca el recuadro en cuanto se encienda. Son cinco intentos.") + '<div class="diana" id="diana" tabindex="0" role="button" data-ini="1">Toca para empezar</div>' + pie + "</div>";
      const d = $("#diana"), ronda = () => { d.className = "diana"; d.textContent = "espera…"; t0 = 0; tm = setTimeout(() => { d.className = "diana ya"; d.textContent = "Ahora"; t0 = performance.now(); }, 1500 + Math.random() * 2600); };
      const toque = () => {
        if (d.dataset.fin) return;
        if (d.dataset.ini || d.dataset.sig) { delete d.dataset.ini; delete d.dataset.sig; return ronda(); }
        if (!t0) { clearTimeout(tm); falsos++; d.textContent = "Antes de tiempo. Toca para repetir."; d.dataset.sig = 1; return; }
        const ms = Math.round(performance.now() - t0); ts.push(ms); t0 = 0;
        if (ts.length < 5) { d.className = "diana"; d.textContent = ms + " ms · toca para el siguiente (" + ts.length + "/5)"; d.dataset.sig = 1; return; }
        const media = Math.round(ts.reduce((a, b) => a + b, 0) / 5), lapsos = ts.filter(x => x >= 355).length;
        d.className = "diana"; d.dataset.fin = 1; d.textContent = "Media " + media + " ms · " + lapsos + " lapsos de 355 ms o más";
        listo(() => guardarAnimo("reflejos", { media_ms: media, lapsos, salidas_en_falso: falsos, tiempos: ts }, lapsos >= 2, lapsos + " lapsos ≥ 355 ms"));
      };
      d.addEventListener("pointerdown", toque); d.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toque(); } });
    } else if (k === "respira") {
      let antes = null, despues = null; const fc0 = V.hr;
      z.innerHTML = cab("Marca tu tensión ahora, de 0 a 10.") + botones(11) + '<div id="resp-zona"></div>' + pie + "</div>";
      elegir($(".escala", z), n => {
        if (antes == null) {
          antes = n; $(".escala", z).remove(); const rz = $("#resp-zona");
          rz.innerHTML = '<div class="circulo" id="circ">inhala</div><p class="nota" style="text-align:center" id="resp-cta">Inhala 4 s mientras crece, exhala 6 s mientras se encoge. Tres ciclos.</p>';
          const c = $("#circ"); let paso = 0; const sig = () => { if (!document.body.contains(c)) return; if (paso >= 6) { rz.innerHTML = "<span>¿Y tu tensión ahora?</span>" + botones(11); elegir(rz, m => { despues = m; listo(() => guardarAnimo("respira", { antes, despues, fc_antes: fc0, fc_despues: V.hr }, false)); }); return; }
            const dentro = paso % 2 === 0; c.className = "circulo " + (dentro ? "in" : "out"); c.textContent = dentro ? "inhala" : "exhala"; paso++; setTimeout(sig, dentro ? 4000 : 6000); };
          setTimeout(sig, 60);
        }
      });
    }
    const no = $("[data-no]", z); if (no) no.onclick = () => { cerrarZona(); log("animo", PRUEBAS[k][0] + ": pospuesta por el tripulante"); pruebasPend = 0; punto(); };
    z.scrollIntoView({ block: "nearest" });
  }
  // ---- lo que el bienestar aporta al motor de alertas, con las variables de su catálogo
  const ult = (k, dias) => { const a = AH.perfil.animo.filter(x => x.prueba === k && Date.now() - x.t < dias * DIA); return a.length ? a[a.length - 1] : null; };
  function vars() {
    const x = {}, l = ult("lastre", 7), c = ult("clima", 3), w = ult("who5", 14), r = ult("reflejos", 1), sue = AH.perfil.animo.filter(a => a.prueba === "sueno" && Date.now() - a.t < 7 * DIA);
    if (l || c || w) x.psych_selfreport_flag = (l && l.datos.malestar >= 4) || (c && c.datos.cielo >= 3) || (w && w.datos.who5 <= 50) ? 1 : 0;
    if (w) x.who5 = w.datos.who5;
    if (r) x.pvt_lapse_high_flag = r.datos.lapsos >= 2 ? 1 : 0;
    if (sue.length) x.sleep_hours_7d = Math.round(10 * sue.reduce((p, q) => p + q.datos.horas, 0) / sue.length) / 10;
    if (l) { const ca = l.datos.causas || []; x.team_conflict_flag = ca.includes("convivencia") && l.datos.malestar >= 4 ? 1 : 0; x.workload_alarm = ca.includes("carga de trabajo") && l.datos.malestar >= 7 ? 1 : 0; }
    return x;
  }
  function texto(a) {
    const d = a.datos || {};
    return a.prueba === "clima" ? CIELOS[d.cielo][0].toLowerCase() + ", energía " + d.energia + "/10" : a.prueba === "lastre" ? "malestar " + d.malestar + "/10" + (d.causas && d.causas.length ? " (" + d.causas.join(", ") + ")" : "") : a.prueba === "who5" ? "OMS-5 " + d.who5 + "/100"
      : a.prueba === "sueno" ? d.horas + " h, calidad " + d.calidad + "/5" : a.prueba === "reflejos" ? "media " + d.media_ms + " ms, " + d.lapsos + " lapsos" : a.prueba === "respira" ? "tensión " + d.antes + " → " + d.despues : JSON.stringify(d);
  }
  const SENALES = [["psych_selfreport_flag", "Malestar psicológico autoinformado", "PSI-01", v => v ? "presente" : "ausente", "termómetro ≥ 4, cielo de lluvia o tormenta, u OMS-5 ≤ 50"], ["who5", "Índice de bienestar OMS-5", "PSI-02", v => v + "/100", "≤ 50 bienestar bajo; ≤ 28 cribado de depresión"],
    ["sleep_hours_7d", "Sueño medio de la semana", "SP-0141 · SP-0142", v => v.toFixed(1) + " h", "< 7 h seguimiento; < 6 h consulta"], ["pvt_lapse_high_flag", "Lapsos de atención (vigilancia psicomotora)", "SP-0145", v => v ? "elevados" : "normales", "2 o más lapsos ≥ 355 ms en 5 intentos"],
    ["team_conflict_flag", "Conflicto de equipo informado", "PSI-03", v => v ? "sí" : "no", "malestar ≥ 4 atribuido a la convivencia"], ["workload_alarm", "Sobrecarga de trabajo", "SP-0146", v => v ? "sí" : "no", "malestar ≥ 7 atribuido a la carga de trabajo"]];
  function historia() {
    const a = AH.perfil.animo, climas = a.filter(x => x.prueba === "clima").slice(-14), f = t => { const d = new Date(t); return d.getDate() + "/" + (d.getMonth() + 1); }, x = vars();
    const act = id => M.lista().some(al => id.split(" · ").includes(al.regla || al.id));
    $("#bien-motor").innerHTML = '<div class="tabla"><table><thead><tr><th>Señal</th><th>Valor</th><th>Regla</th><th>Criterio</th><th>Estado</th></tr></thead><tbody>' + SENALES.map(s => "<tr><td>" + s[1] + "</td><td>" + (x[s[0]] == null ? "sin registro" : s[3](x[s[0]])) + "</td><td>" + s[2] + "</td><td>" + s[4] + "</td>" +
      (x[s[0]] == null ? "<td>—</td>" : act(s[2]) ? '<td class="a">alerta activa</td>' : "<td>sin alerta</td>") + "</tr>").join("") + '</tbody></table></div><p class="nota">Una alerta de bienestar nunca se muestra por delante de una alerta física. Las reglas PSI se evalúan en este monitor porque sus equivalentes del catálogo (SP-0148 y SP-0150) están apagadas a la espera de validación.</p>';
    $("#cielo-hist").innerHTML = climas.length ? climas.map(c => "<div>" + cielo(c.datos.cielo) + "<span>" + f(c.t) + "</span></div>").join("") : '<span class="nota">Aún no hay registros.</span>';
    const u = k => a.filter(y => y.prueba === k).slice(-1)[0], w = u("who5"), l = u("lastre"), r = u("reflejos"), band = a.filter(y => y.bandera && Date.now() - y.t < 7 * DIA).length;
    $("#kpi-animo").innerHTML = [["Índice OMS-5", w ? w.datos.who5 + "<small>/100</small>" : "—", w ? (w.datos.who5 <= 28 ? "muy bajo: 28 o menos" : w.bandera ? "bajo: 50 o menos" : "en rango") : "sin registro", w && w.bandera], ["Malestar", l ? l.datos.malestar + "<small>/10</small>" : "—", l ? f(l.t) : "sin registro", l && l.bandera],
      ["Sueño medio", x.sleep_hours_7d == null ? "—" : x.sleep_hours_7d.toFixed(1) + "<small> h</small>", x.sleep_hours_7d == null ? "sin registro" : "noches registradas en 7 días", x.sleep_hours_7d != null && x.sleep_hours_7d < 7], ["Reacción", r ? r.datos.media_ms + "<small> ms</small>" : "—", r ? r.datos.lapsos + " lapsos" : "sin registro", r && r.bandera],
      ["Señales en 7 días", band, band ? "revisar con el médico de vuelo" : "ninguna", band > 0]].map(k => '<div class="kpi ' + (k[3] ? "s-animo" : "") + '"><span>' + k[0] + "</span><b>" + k[1] + "</b><em>" + k[2] + "</em></div>").join("");
  }
  AH.Bienestar = { vars, texto, nombre: k => (PRUEBAS[k] || [k])[0], PRUEBAS, SENALES };

  // avisos del motor en la conversación
  on("alerta", e => { if (e.accion === "abre" && e.alerta.nivel === "urgencia" && e.alerta.id !== "APOYO") AH.Audio.decir(AH.tr("Alerta") + ". " + AH.tr(e.alerta.nombre) + ". " + AH.tr(e.alerta.accion)); });
  on("panel", t => { if (t === "asistente") { historia(); proveedor(); } });
  on("cfg", proveedor); on("enlace", proveedor); on("cap", proveedor); on("perfil", historia); on("alerta", () => { if ($("#p-asistente").classList.contains("on")) historia(); });
  AH.Asistente = { prueba, crisis, enviar, interpretar, consulta, cielo, CIELOS, PRUEBAS, iniciar() { proveedor(); historia(); } };
})();
