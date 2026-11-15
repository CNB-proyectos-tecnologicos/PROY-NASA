/* Opciones: fuente de señales, motor de alertas, audio, visualización, radiación, asistente, registro de actividad y restablecer. */
(function () {
  const { $, $$, esc, cfg, on, log, hora, fecha, V, W } = AH, M = AH.Motor;
  let filtro = "", estLlm = "";
  const sw = (ruta, v) => '<input type="checkbox" class="sw" data-c="' + ruta + '"' + (v ? " checked" : "") + ' id="o-' + ruta.replace(/\./g, "-") + '">';
  const sel = (ruta, v, ops) => '<select data-c="' + ruta + '" id="o-' + ruta.replace(/\./g, "-") + '">' + ops.map(o => '<option value="' + o[0] + '"' + (String(o[0]) === String(v) ? " selected" : "") + ">" + esc(o[1]) + "</option>").join("") + "</select>";
  const op = (t, d, ctl) => '<div class="op"><b>' + t + "</b>" + ctl + "<small>" + d + "</small></div>";
  const rng = (ruta, v, a, b, p) => '<input type="range" data-c="' + ruta + '" id="o-' + ruta.replace(/\./g, "-") + '" min="' + a + '" max="' + b + '" step="' + p + '" value="' + v + '" style="width:150px">';
  const num = (ruta, v, p) => '<input type="number" data-c="' + ruta + '" id="o-' + ruta.replace(/\./g, "-") + '" value="' + v + '" step="' + (p || 1) + '" style="width:78px">';

  function pintar() {
    const E = AH.Enlace, F = AH.Fuente, L = cfg.limites, perfilRad = AH.Sim.PERFILES[cfg.rad.perfil] || AH.Sim.PERFILES.leo;
    const estE = E.vinculado ? "Vinculado a " + esc(E.base) + " · motor " + esc(E.info.motor.version) + " · " + E.info.motor.reglas + " reglas · ensamble " + (E.info.motor.ensamble ? "activo" : "no disponible") : (window.claude && window.claude.use ? "La página publicada no puede conectarse a un servidor: trabaja el motor integrado. Para el motor de Python, abre la página desde servidor.py." : "Sin servidor" + (E.error ? " (" + esc(E.error) + ")" : "") + ": trabaja el motor integrado.");
    $("#rej-opciones").innerHTML =
      '<div class="tarj c6"><h2>Señales</h2>' +
      op("Modo demo", "Datos simulados en la página. Apágalo para recibir señales reales.", sw("demo", cfg.demo)) +
      (cfg.demo ? op("Situación simulada", "El simulador solo altera las señales. Las alertas las produce el motor al recibirlas, igual que con señales reales.", sel("escenario", cfg.escenario, Object.keys(AH.Sim.SITUACIONES).map(k => [k, AH.Sim.SITUACIONES[k][0] + " · " + AH.Sim.SITUACIONES[k][1]])))
        : op("Origen", "De dónde llegan las señales.", sel("fuente.tipo", cfg.fuente.tipo, [["servidor", "Servidor del monitor (HTTP o TCP)"], ["serie", "Puerto serie (Arduino por USB)"], ["ws", "WebSocket"]])) +
          (cfg.fuente.tipo === "ws" ? op("Dirección WebSocket", "Un JSON por mensaje.", '<input type="text" data-c="fuente.ws" id="o-fuente-ws" value="' + esc(cfg.fuente.ws) + '" style="width:210px">') : "") +
          (cfg.fuente.tipo === "serie" ? op("Baudios", "Velocidad del puerto serie.", sel("fuente.baud", cfg.fuente.baud, [9600, 57600, 115200, 230400].map(b => [b, b]))) : "") +
          '<div class="fila-btn"><button type="button" class="btn pri" data-a="conectar">' + (F.estado === "conectado" || F.estado === "conectando" ? "Reconectar" : "Conectar") + '</button><button type="button" class="btn" data-a="desconectar">Desconectar</button><span class="etq s-' + (F.estado === "conectado" ? "estable" : F.estado === "conectando" ? "precaucion" : "urgencia") + '">' + F.estado.toUpperCase() + "</span><span class=\"nota\">" + esc(F.detalle) + " · " + F.recibidos + " lecturas</span></div>" +
          '<p class="nota">Formato: una línea JSON por lectura, <code>{"canal":"hr","valor":72}</code> o varias a la vez <code>{"hr":72,"spo2":98,"fr":15,"sbp":118,"dbp":76,"temp":36.7,"cgm":96,"co2":2.1,"pcab":101.3,"rad":24,"alt":408}</code>; también texto <code>hr=72,spo2=98</code>. Formas de onda opcionales: <code>{"ecg":[…]}</code>, <code>pleth</code>, <code>art</code>, <code>resp</code> a 200 muestras por segundo. Al servidor se envían con <code>POST /api/senal</code> o por TCP.</p>') +
      "</div>" +
      '<div class="tarj c6"><h2>Motor de alertas</h2>' +
      op("Conexión con el motor", "Apagado, el monitor solo muestra valores: no hay alertas ni alarmas.", sw("motor.activo", cfg.motor.activo)) +
      op("Origen", "El motor de Python evalúa las reglas SP del catálogo con sus ventanas y el ensamble. Las alarmas propias del monitor (ritmo, respiración, sensores) y las reglas de bienestar PSI siempre se evalúan aquí.", sel("motor.origen", cfg.motor.origen, [["servidor", "Motor de Python (servidor)"], ["integrado", "Integrado en la página"]])) +
      op("Servidor", estE, '<span class="fila-btn"><input type="text" data-c="servidor" id="o-servidor" value="' + esc(cfg.servidor) + '" style="width:190px"><button type="button" class="btn" data-a="vincular">Vincular</button></span>') +
      op("Reloj acelerado en demo", "El reloj del motor corre más deprisa para que una alteración se confirme en segundos. Con señales reales no se aplica.", sw("motor.acelerado", cfg.motor.acelerado)) +
      (cfg.motor.acelerado ? op("Aceleración", "A 120×, la media de 15 min de presión o glucosa se confirma en menos de 10 s.", sel("motor.factor", cfg.motor.factor, [[20, "20×"], [60, "60×"], [120, "120×"], [240, "240×"]])) : "") +
      op("Sugerencias del modelo", "Solo con el motor integrado: el modelo destilado puede proponer nivel prioritario en casos intermedios, a confirmar.", sw("motor.modelo", cfg.motor.modelo)) +
      '<h3>Límites de los indicadores</h3><div class="campos">' + [["FC mín", "limites.hr.0", L.hr[0]], ["FC máx", "limites.hr.1", L.hr[1]], ["SpO₂ mín", "limites.spo2.0", L.spo2[0]], ["FR mín", "limites.fr.0", L.fr[0]], ["FR máx", "limites.fr.1", L.fr[1]], ["PA sist. mín", "limites.sbp.0", L.sbp[0]], ["PA sist. máx", "limites.sbp.1", L.sbp[1]], ["Temp máx", "limites.temp.1", L.temp[1]], ["Glucosa mín", "limites.cgm.0", L.cgm[0]], ["Glucosa máx", "limites.cgm.1", L.cgm[1]], ["ppCO₂ máx", "limites.co2.1", L.co2[1]], ["Dosis máx µSv/h", "limites.rad.1", L.rad[1]]]
        .map(c => '<label class="campo">' + c[0] + '<input type="number" step="any" data-c="' + c[1] + '" id="o-' + c[1].replace(/\./g, "-") + '" value="' + c[2] + '"></label>').join("") + "</div>" +
      '<div class="fila-btn"><button type="button" class="btn" data-a="motor-reiniciar">Reiniciar motor</button><span class="nota">' + M.activas.size + " alertas activas · " + M.historial.length + " en la sesión</span></div></div>" +
      '<div class="tarj"><h2>Audio</h2>' +
      op("Qué suena", "El pitido de pulso baja de tono cuando baja la SpO₂.", sel("audio.modo", cfg.audio.modo, [["todo", "Todo: pulso y alertas"], ["alertas", "Solo alertas (sin pitido de pulso)"], ["urgentes", "Solo urgencias"], ["silencio", "Silencio total"]])) +
      op("Volumen del pulso", "", rng("audio.volPulso", cfg.audio.volPulso, 0, 1, 0.05)) + op("Volumen de alarmas", "", rng("audio.volAlarma", cfg.audio.volAlarma, 0, 1, 0.05)) +
      op("Tono según SpO₂", "Apagado, el pitido tiene tono fijo.", sw("audio.tonoSpo2", cfg.audio.tonoSpo2)) + op("Voz del asistente", "Lee en voz alta las respuestas y las urgencias.", sw("audio.voz", cfg.audio.voz)) +
      '<div class="fila-btn"><button type="button" class="btn" data-a="son-pulso">Probar pulso</button><button type="button" class="btn" data-a="son-urgencia">Urgencia</button><button type="button" class="btn" data-a="son-precaucion">Precaución</button><button type="button" class="btn" data-a="son-aviso">Aviso</button></div></div>' +
      '<div class="tarj"><h2>Visualización y radiación</h2>' +
      op("Idioma", "Español o inglés para toda la interfaz y para las respuestas del modelo.", sel("idioma", cfg.idioma, [["es", "Español"], ["en", "English"]])) +
      op("Modo", "Accesible: más contraste, azul/ámbar/magenta y líneas con trazo distinto.", sel("modo", cfg.modo, [["estandar", "Estándar"], ["accesible", "Accesible"]])) + op("Rejilla en las ondas", "", sw("vista.rejilla", cfg.vista.rejilla)) +
      op("Perfil de misión", "Define la tasa de dosis simulada.", sel("rad.perfil", cfg.rad.perfil, Object.keys(AH.Sim.PERFILES).map(k => [k, AH.Sim.PERFILES[k].n]))) +
      (perfilRad.orbita ? op("Altitud de la órbita", '<output id="o-alt-txt">' + cfg.rad.altitud + " km · " + AH.Sim.tasaPorAltitud(cfg.rad.altitud).toFixed(1) + " µSv/h sin blindaje adicional</output>", rng("rad.altitud", cfg.rad.altitud, 200, 1000, 1)) : "") +
      op("Factor de blindaje", "1 = cabina estándar; menos de 1 = zona más protegida.", rng("rad.blindaje", cfg.rad.blindaje, 0.3, 1, 0.05)) +
      '<p class="nota">Modelo simplificado para demostración, con valores de referencia aproximados por perfil de misión.</p></div>' +
      '<div class="tarj"><h2>Asistente</h2>' +
      op("Quién responde", "Siempre un modelo de lenguaje real, consultado a través del servidor. Si no está disponible, el asistente lo dice y no responde.", sel("llm.proveedor", cfg.llm.proveedor, [["groq", "Groq (API en la nube)"], ["local", "Modelo local (a bordo)"]].concat(AH.cap.sample ? [["claude", "Claude (página publicada)"]] : []))) +
      (cfg.llm.proveedor === "groq" ? op("Modelo de Groq", "GPT-OSS de OpenAI servido por Groq.", sel("llm.modelo", cfg.llm.modelo, [["openai/gpt-oss-120b", "openai/gpt-oss-120b"], ["openai/gpt-oss-20b", "openai/gpt-oss-20b"]].concat(["openai/gpt-oss-120b", "openai/gpt-oss-20b"].includes(cfg.llm.modelo) ? [] : [[cfg.llm.modelo, cfg.llm.modelo]]))) +
        op("Clave de Groq", E.vinculado ? (E.info.llm && E.info.llm.groq ? "El servidor ya tiene una clave. Puedes sustituirla." : "El servidor no tiene clave. Se guarda en su archivo .env, no en el navegador.") : "Hace falta el servidor en marcha.", '<span class="fila-btn"><input type="password" id="o-clave" placeholder="gsk_…" style="width:170px" autocomplete="off"><button type="button" class="btn" data-a="llm-clave"' + (E.vinculado ? "" : " disabled") + ">Guardar</button></span>") : "") +
      (cfg.llm.proveedor === "local" ? op("Dirección del modelo local", "Cualquier servidor compatible con la API de OpenAI: Ollama, llama.cpp, LM Studio.", '<input type="text" data-c="llm.base_local" id="o-llm-base_local" value="' + esc(cfg.llm.base_local) + '" style="width:210px">') +
        op("Nombre del modelo", "Tal como lo conoce ese servidor.", '<input type="text" data-c="llm.modelo_local" id="o-llm-modelo_local" value="' + esc(cfg.llm.modelo_local) + '" style="width:210px">') : "") +
      '<div class="fila-btn"><button type="button" class="btn" data-a="llm-probar">Probar conexión</button><span class="nota">' + esc(estLlm || ({ "sin-servidor": "Sin servidor no hay modelo.", "sin-clave": "Falta la clave de Groq." }[AH.LLM.efectivo()] || "")) + "</span></div>" +
      '<p class="nota">La consola del médico en tierra se abre en <a href="/medico" target="_blank" rel="noopener">/medico</a>, servida por el mismo servidor.</p></div>' +
      '<div class="tarj c8"><h2>Registro de actividad <small id="o-nlog"></small></h2><div class="fila-btn">' + sel("_filtro", filtro, [["", "Todo"], ["alerta", "Alertas"], ["motor", "Motor"], ["evaluacion", "Evaluación"], ["animo", "Bienestar"], ["asistente", "Asistente"], ["chat", "Conversación"], ["fuente", "Señales"], ["audio", "Audio"], ["perfil", "Perfil"], ["demo", "Demo"]]) +
      '<button type="button" class="btn" data-a="log-csv">Exportar · CSV</button><button type="button" class="btn" data-a="log-vaciar">Vaciar</button></div><div class="registro" id="o-log"></div></div>' +
      '<div class="tarj"><h2>Restablecer</h2><p class="nota">Los datos viven en este navegador. Exporta antes si quieres conservarlos.</p><div class="fila-btn"><button type="button" class="btn" data-a="r-animo">Borrar registros de bienestar</button><button type="button" class="btn" data-a="r-perfil">Volver al perfil de demostración</button><button type="button" class="btn" data-a="r-cfg">Opciones de fábrica</button><button type="button" class="btn peligro" data-a="r-todo">Borrar todo</button></div></div>';
    registro();
  }
  function registro() {
    const c = $("#o-log"); if (!c) return;
    const a = AH.registro.filter(r => !filtro || r.tipo === filtro).slice(-250).reverse();
    $("#o-nlog").textContent = a.length + " entradas, la más reciente arriba";
    c.innerHTML = a.map(r => '<div class="' + esc(r.nivel) + '">' + fecha(r.t).slice(5) + " " + hora(r.t) + "  " + esc(r.tipo.toUpperCase().padEnd(9)) + " " + esc(r.texto) + "</div>").join("") || "Sin entradas.";
  }
  function fijar(ruta, valor) { const p = ruta.split("."); let o = cfg; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = valor; }
  function confirmar(texto, hacer) {
    const c = $("#capa"); c.hidden = false;
    c.innerHTML = '<div class="dialogo s-precaucion"><h2>¿Seguro?</h2><p>' + esc(texto) + '</p><div class="fila-btn"><button type="button" class="btn peligro" id="cf-si">Sí, borrar</button><button type="button" class="btn" id="cf-no">Cancelar</button></div></div>';
    const cerrar = () => { c.hidden = true; c.innerHTML = ""; }; $("#cf-no").onclick = cerrar; $("#cf-si").onclick = () => { cerrar(); hacer(); pintar(); };
  }
  function cambioFuente() {
    AH.Fuente.desconectar(); M.vaciar("cambio de fuente de señales");
    if (cfg.demo) { ["ecg", "pleth", "art", "resp"].forEach(k => { W[k].viva = true; }); log("fuente", "Modo demo activado: señales simuladas"); }
    else { AH.Fuente.limpiar(); log("fuente", "Modo demo apagado: a la espera de señales reales", "precaucion"); }
    AH.Enlace.reiniciar().then(() => { if (!cfg.demo && cfg.fuente.tipo !== "serie") AH.Fuente.conectar(); });
  }
  $("#rej-opciones").addEventListener("change", e => {
    const t = e.target, ruta = t.dataset.c; if (t.id === "o-clave") return;
    if (!ruta) return;
    if (ruta === "_filtro") { filtro = t.value; return registro(); }
    const v = t.type === "checkbox" ? t.checked : t.type === "number" || t.type === "range" || ruta === "fuente.baud" || ruta === "motor.factor" ? +t.value : t.value;
    if ((t.type === "number" || t.type === "range") && isNaN(v)) return;
    if (ruta === "escenario") { AH.Sim.escenario(v); return; }
    fijar(ruta, v); log("opciones", ruta + " = " + v);
    if (ruta === "demo") cambioFuente();
    if (ruta === "motor.acelerado" || ruta === "motor.factor") { M.vaciar("cambio de ventanas"); AH.Enlace.reiniciar(); }
    if (ruta === "motor.origen") { if (v === "servidor") AH.Enlace.vincular(); else AH.Enlace.desvincular("se eligió el motor integrado"); }
    if (ruta === "motor.activo" && v && cfg.motor.origen === "servidor") AH.Enlace.vincular();
    AH.guardarCfg(); if (ruta === "idioma") return location.reload(); pintar();
  });
  $("#rej-opciones").addEventListener("input", e => { if (e.target.dataset.c === "rad.altitud") { const o = $("#o-alt-txt"); if (o) o.textContent = e.target.value + " km · " + AH.Sim.tasaPorAltitud(+e.target.value).toFixed(1) + " µSv/h sin blindaje adicional"; } });
  $("#rej-opciones").addEventListener("click", e => {
    const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a;
    if (a === "conectar") AH.Fuente.conectar().then(pintar); else if (a === "desconectar") { AH.Fuente.desconectar(); pintar(); }
    else if (a === "vincular") { cfg.servidor = $("#o-servidor").value.trim(); cfg.motor.origen = "servidor"; AH.guardarCfg(true); AH.Enlace.vincular().then(ok => { if (!ok) log("motor", "No encuentro el servidor en " + (AH.Enlace.candidatos().join(", ") || "ninguna dirección") + (AH.Enlace.error ? ": " + AH.Enlace.error : ""), "precaucion"); pintar(); }); }
    else if (a === "motor-reiniciar") { M.vaciar("reinicio manual"); AH.Enlace.reiniciar(); log("motor", "Motor reiniciado: alertas y ventanas en cero"); pintar(); }
    else if (a === "llm-clave") { const c = $("#o-clave").value.trim(); if (!c) return; estLlm = "Guardando la clave…"; pintar(); AH.Enlace.pedir("/api/llm/clave", { clave: c }, 8000).then(() => AH.Enlace.pedir("/api/estado", undefined, 4000)).then(d => { AH.Enlace.info = d; estLlm = "Clave guardada en el archivo .env del servidor."; log("asistente", "Clave de Groq guardada en el servidor", "ok"); AH.emit("enlace"); pintar(); }).catch(err => { estLlm = "No pude guardar la clave: " + (err.message || err); pintar(); }); }
    else if (a === "llm-probar") { const p = cfg.llm.proveedor; estLlm = "Probando…"; pintar(); const t0 = Date.now(); AH.LLM.pedir("Responde solo con la palabra: conectado.", [{ role: "user", content: "Prueba de conexión." }], p).then(o => { estLlm = "✓ Responde " + o.origen + " en " + ((Date.now() - t0) / 1000).toFixed(1) + " s: «" + String(o.texto).trim().slice(0, 80) + "»"; log("asistente", "Prueba del modelo correcta: " + o.origen, "ok"); pintar(); }).catch(err => { estLlm = "Sin respuesta: " + (err.message || err); log("asistente", "Prueba del modelo fallida: " + (err.message || err), "precaucion"); pintar(); }); }
    else if (a.startsWith("son-")) AH.Audio.probar(a.slice(4))
    else if (a === "log-csv") AH.descargar("registro_" + fecha() + ".csv", AH.csv(["hora", "tipo", "nivel", "texto"], AH.registro.map(r => [new Date(r.t).toISOString(), r.tipo, r.nivel, r.texto])));
    else if (a === "log-vaciar") confirmar("Se vacía el registro de actividad de este navegador.", () => { AH.registro.length = 0; AH.guardar("log", []); });
    else if (a === "r-animo") confirmar("Se borran todos los registros de ánimo y bienestar.", () => { AH.perfil.animo = []; AH.guardarPerfil(); log("perfil", "Registros de ánimo borrados"); });
    else if (a === "r-perfil") confirmar("El perfil vuelve a los datos ficticios de demostración.", () => { AH.perfil = AH.PERFIL_DEMO(); AH.guardarPerfil(); log("perfil", "Perfil de demostración restaurado"); });
    else if (a === "r-cfg") confirmar("Todas las opciones vuelven a su valor inicial.", () => { const d = AH.mezclar(AH.DEF, {}); Object.keys(d).forEach(k => { cfg[k] = d[k]; }); cambioFuente(); AH.guardarCfg(); });
    else if (a === "r-todo") confirmar("Se borran perfil, registros, opciones y el registro de actividad de este navegador.", () => { ["cfg", "perfil", "log"].forEach(AH.borrar); AH.perfil = AH.PERFIL_DEMO(); AH.registro.length = 0; const d = AH.mezclar(AH.DEF, {}); Object.keys(d).forEach(k => { cfg[k] = d[k]; }); V.dosisSesion = 0; cambioFuente(); AH.guardarCfg(); log("opciones", "Todos los datos borrados"); });
  });
  const visible = () => $("#p-opciones").classList.contains("on");
  let tLog = 0; on("log", () => { if (visible()) { clearTimeout(tLog); tLog = setTimeout(registro, 300); } });
  on("panel", t => { if (t === "opciones") pintar(); }); on("enlace", () => { if (visible()) pintar(); }); on("fuente", () => { if (visible()) pintar(); }); on("cap", () => { if (visible()) pintar(); });
  AH.Opciones = { pintar };
})();
