/* Enlace con el médico en tierra: el monitor informa su estado al servidor y ambos intercambian mensajes.
   Los mensajes los escriben personas (tripulante aquí, médico en /medico). Sin servidor no hay enlace y se dice. */
(function () {
  const { $, esc, V, H, cfg, on, log, hora, fecha } = AH, M = AH.Motor, E = AH.Enlace;
  const T = AH.Tierra = { activo: false, mensajes: [], sinLeer: 0, ultimo: 0 };
  let ocupado = false, n = 0, espera = 0;
  // El enlace con tierra solo necesita el servidor: sigue aunque las alertas las evalúe el motor integrado en la página.
  const base = () => E.base || E.candidatos()[0] || null;
  async function pedirT(ruta, cuerpo, ms) {
    const b = base(); if (!b) throw new Error("sin servidor");
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms || 8000);
    try {
      const r = await fetch(b + ruta, cuerpo === undefined ? { signal: ctl.signal } : { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(cuerpo), signal: ctl.signal });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "HTTP " + r.status); return d;
    } finally { clearTimeout(t); }
  }
  const visible = () => $("#p-asistente").classList.contains("on");
  function muestreo(max) {                                   // tendencias de la sesión, como mucho `max` puntos por serie
    const N = H.t.length, paso = Math.max(1, Math.ceil(N / max)), o = { t: [] }, ks = ["hr", "spo2", "fr", "sbp", "dbp", "temp", "cgm", "co2", "pcab", "rad"];
    ks.forEach(k => { o[k] = []; }); for (let i = N - 1 - ((N - 1) % paso); i >= 0 && i < N; i += paso) { o.t.push(H.t[i]); ks.forEach(k => o[k].push(H[k][i])); }
    return o;
  }
  T.estado = function () {
    const p = AH.perfil, fs = AH.faseCiclo(), u = AH.Evaluacion.ultimo, al = a => ({ id: a.id, regla: a.regla || a.id, nivel: a.nivel, nombre: a.nombre, valor: a.valorTxt || "", criterio: a.criterio || "", accion: a.accion || "", nota: a.nota || "", cat: a.cat || "", origen: a.fuente, desde: a.desde, hasta: a.hasta || null, reconocida: !!a.reconocida });
    const e = AH.Evaluacion.entradas();
    return { resumen: { nombre: p.nombre, rol: p.rol, nivel: M.nivel(), alertas: M.lista().length, mision: p.mision.nombre + " · día " + p.mision.dia + " de " + p.mision.duracion, demo: cfg.demo, situacion: cfg.demo ? AH.Sim.SITUACIONES[cfg.escenario][1] : "" },
      perfil: p, edad: AH.Perfil.edad(), fase: fs, faltan: AH.Perfil.faltantes(), carrera_mSv: +M.carrera().toFixed(2),
      vivo: { hr: V.hr, spo2: V.spo2, fr: V.fr, sbp: V.sbp, dbp: V.dbp, map: V.map, temp: V.temp, cgm: V.cgm, cgmTend: V.cgmTend, co2: V.co2, pcab: V.pcab, pio2: V.pio2, rad: V.rad, alt: V.alt, ritmo: V.ritmo,
        est: { hr: M.estadoVar("hr"), spo2: M.estadoVar("spo2"), pa: M.estadoVar("pa"), fr: M.estadoVar("fr"), temp: M.estadoVar("temp"), glu: M.estadoVar("glu"), cab: M.estadoVar("cab"), rad: M.estadoVar("rad") } },
      limites: cfg.limites, tendencias: muestreo(240), alertas: M.lista().map(al), historial: M.historial.slice(-40).map(al),
      motor: E.vinculado ? "motor de Python " + E.info.motor.version : "motor integrado en la página",
      laboratorio: AH.Perfil.tablasLab(), bienestar: { vars: AH.Bienestar.vars(), senales: AH.Bienestar.SENALES.map(s => ({ nombre: s[1], regla: s[2], criterio: s[4], valor: AH.Bienestar.vars()[s[0]] == null ? null : s[3](AH.Bienestar.vars()[s[0]]) })),
        registros: p.animo.slice(-20).map(a => ({ t: a.t, registro: AH.Bienestar.nombre(a.prueba), resultado: AH.Bienestar.texto(a), senal: !!a.bandera })) },
      entradas: Object.assign({}, e.datos, e.extra), evaluacion: u ? { t: u.t, nivel: u.r.nivel_final, hallazgos: (u.r.alertas || []).length } : null, paquete: AH.LLM.paquete(), dolor: (p.dolor || []).slice(-15) };
  };
  function pintar() {
    const c = $("#tierra-hilo"); if (!c) return;
    $("#tierra-estado").textContent = T.activo ? "enlace activo · los mensajes llegan a la consola de tierra" : "sin enlace: requiere el servidor del monitor";
    $("#in-tierra").disabled = !T.activo; $("#f-tierra button").disabled = !T.activo;
    c.innerHTML = T.mensajes.length ? T.mensajes.map(m => '<div class="msg ' + (m.de === "tripulante" ? "yo" : "tierra") + '"><small>' + esc(m.de === "tripulante" ? (AH.perfil.nombre || "Tripulante") : (m.autor || "Médico en tierra")) + " · " + fecha(m.t * 1000).slice(5) + " " + hora(m.t * 1000).slice(0, 5) + (m.tipo === "consulta" ? " · " + AH.tr("consulta") : "") + "</small>" +
      (m.tipo === "consulta" || m.tipo === "dolor" ? "<details><summary>" + esc(m.texto.split("\n")[0]) + "</summary>" + esc(m.texto).replace(/\n/g, "<br>") + "</details>" : esc(m.texto).replace(/\n/g, "<br>")) + "</div>").join("") : '<div class="msg sis">' + (T.activo ? "Sin mensajes todavía." : "No hay enlace con tierra en este momento.") + "</div>";
    c.scrollTop = c.scrollHeight;
  }
  T.enviar = async function (texto, tipo, adjunto) {
    texto = String(texto || "").trim(); if (!texto) return false; if (!T.activo) throw new Error("no hay enlace con tierra: requiere el servidor");
    const m = await pedirT("/api/mensajes", { sujeto: AH.perfil.id || "CM-1", de: "tripulante", autor: AH.perfil.nombre, tipo: tipo || "mensaje", texto, adjunto }, 8000);
    T.mensajes.push(m); T.ultimo = Math.max(T.ultimo, m.id); log("tierra", (tipo === "consulta" ? "Consulta enviada a tierra: " : tipo === "dolor" ? "Dolor enviado a tierra: " : "Mensaje enviado a tierra: ") + texto.split("\n")[0].slice(0, 120)); pintar(); return true;
  };
  async function ciclo() {
    if (ocupado) return; const estaba = T.activo;
    if (!base()) { if (estaba) { T.activo = false; pintar(); } return; }
    if (espera > 0) { espera--; return; }
    ocupado = true;
    try {
      const suj = AH.perfil.id || "CM-1";
      if (n++ % 2 === 0) await pedirT("/api/tripulacion/estado", { sujeto: suj, estado: T.estado() }, 8000);
      const d = await pedirT("/api/mensajes?sujeto=" + encodeURIComponent(suj) + "&desde=" + T.ultimo + (visible() ? "&lector=tripulante" : ""));
      const nuevos = (d.mensajes || []).filter(m => m.id > T.ultimo); T.activo = true;
      if (nuevos.length) { nuevos.forEach(m => { T.mensajes.push(m); T.ultimo = Math.max(T.ultimo, m.id); if (m.de === "tierra" && estaba) { log("tierra", "Mensaje de tierra (" + (m.autor || "médico") + "): " + m.texto.slice(0, 140), "ok"); if (!visible()) T.sinLeer++; if (AH.Audio.activo) AH.Audio.tono(880, 0, 0.12, 0.2); } });
        if (T.mensajes.length > 300) T.mensajes = T.mensajes.slice(-300); }
      if (nuevos.length || estaba !== T.activo) { pintar(); AH.punto(); }
    } catch (e) { espera = 4; if (T.activo) { T.activo = false; pintar(); } }
    ocupado = false;
  }
  $("#f-tierra").addEventListener("submit", e => { e.preventDefault(); const i = $("#in-tierra"), t = i.value; i.value = ""; T.enviar(t).catch(err => { i.value = t; AH.aviso("No se pudo enviar: " + (err.message || err)); }); });
  on("segundo", ciclo);
  on("panel", t => { if (t === "asistente") { T.sinLeer = 0; AH.punto(); pintar(); } });
  pintar();
})();
