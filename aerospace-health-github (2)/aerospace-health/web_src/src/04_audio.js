/* Sonido tipo monitor de cabecera (Web Audio).
   · Pitido de pulso en cada latido; su tono baja cuando baja la SpO₂, como en los pulsioxímetros.
   · Alarmas por prioridad con el patrón de ráfagas de la norma IEC 60601-1-8: alta = 3 + 2 pulsos repetidos, media = 3 pulsos, baja = 2 tonos.
   Modos: todo · solo alertas · solo urgencias · silencio. Además, pausa temporal de alarmas (2 min). */
(function () {
  const { cfg, V, on, emit, log } = AH;
  let ctx = null, maestro = null, proxRafaga = 0, pausaHasta = 0, ultNivel = "";
  const A = AH.Audio = {
    get activo() { return !!ctx && ctx.state === "running"; },
    get pausado() { return Date.now() < pausaHasta; },
    get restoPausa() { return Math.max(0, Math.round((pausaHasta - Date.now()) / 1000)); },
    async activar() {
      try {
        if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; ctx = new C(); maestro = ctx.createDynamicsCompressor(); maestro.connect(ctx.destination); }
        if (ctx.state !== "running") await ctx.resume();
        log("audio", "Audio activado"); emit("audio");
      } catch (e) { log("audio", "No se pudo activar el audio: " + e.message, "precaucion"); }
    },
    pausar(seg) { pausaHasta = seg ? Date.now() + seg * 1000 : 0; log("audio", seg ? "Alarmas sonoras en pausa " + seg + " s" : "Fin de la pausa de alarmas"); emit("audio"); },
    // un tono con armónicos (la norma pide al menos cuatro) y envolvente suave
    tono(f, t0, dur, vol, armonicos) {
      if (!A.activo || vol <= 0) return;
      const g = ctx.createGain(), t = ctx.currentTime + t0;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.setValueAtTime(vol, t + dur - 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      g.connect(maestro);
      (armonicos || [1]).forEach((a, i) => { const o = ctx.createOscillator(), ga = ctx.createGain(); o.type = "sine"; o.frequency.value = f * (i + 1); ga.gain.value = a; o.connect(ga); ga.connect(g); o.start(t); o.stop(t + dur + 0.02); });
    },
    pulso() {
      if (cfg.audio.modo !== "todo") return;
      const sat = V.spo2 == null ? 98 : Math.max(70, Math.min(100, V.spo2));
      const f = cfg.audio.tonoSpo2 ? 660 * Math.pow(2, (sat - 100) / 30) : 620;
      A.tono(f, 0, 0.085, 0.22 * cfg.audio.volPulso, [1, 0.25]);
    },
    rafaga(nivel) {
      const v = 0.3 * cfg.audio.volAlarma, H = [1, 0.55, 0.38, 0.26, 0.16];
      if (nivel === "urgencia") { const f = 740, p = [0, 0.22, 0.44, 0.84, 1.06]; p.concat(p.map(x => x + 1.9)).forEach(x => A.tono(f, x, 0.15, v, H)); return 9; }
      if (nivel === "precaucion") { [0, 0.42, 0.84].forEach(x => A.tono(523, x, 0.24, v * 0.85, H)); return 16; }
      A.tono(659, 0, 0.3, v * 0.6, H); A.tono(523, 0.36, 0.42, v * 0.6, H); return 30;
    },
    probar(nivel) { A.activar().then(() => nivel === "pulso" ? A.tono(660, 0, 0.085, 0.22 * cfg.audio.volPulso, [1, 0.25]) : A.rafaga(nivel)); },
    // lo que se debe oír ahora: la alerta de mayor prioridad que no esté reconocida
    ciclo() {
      if (!A.activo) return;
      const m = cfg.audio.modo; if (m === "silencio" || A.pausado) { ultNivel = ""; return; }
      const pend = AH.Motor.lista().filter(a => !a.reconocida && (m !== "urgentes" || a.nivel === "urgencia"));
      if (!pend.length) { ultNivel = ""; return; }
      const nivel = pend[0].nivel, ahora = ctx.currentTime;
      if (nivel !== ultNivel || ahora >= proxRafaga) { ultNivel = nivel; proxRafaga = ahora + A.rafaga(nivel); }
    },
    // ---- voz del asistente
    async decir(texto) {
      if (!cfg.audio.voz || cfg.audio.modo === "silencio" || !texto) return;
      const t = AH.cap.tts;
      if (t) { try { await t.speak(String(texto).slice(0, 1800), { language: cfg.idioma === "en" ? "en" : "es" }); return; } catch (e) { /* cae a la voz del navegador */ } }
      try {
        if (!window.speechSynthesis) return;
        speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(texto);
        const vs = speechSynthesis.getVoices(); u.voice = cfg.idioma === "en" ? (vs.find(x => /^en[-_]US/i.test(x.lang)) || vs.find(x => /^en/i.test(x.lang)) || null) : (vs.find(x => /es[-_](MX|US|419)/i.test(x.lang)) || vs.find(x => /^es/i.test(x.lang)) || null); u.lang = u.voice ? u.voice.lang : (cfg.idioma === "en" ? "en-US" : "es-MX"); u.rate = 1.02;
        speechSynthesis.speak(u);
      } catch (e) { /* sin voz disponible */ }
    },
    callar() { try { if (AH.cap.tts) AH.cap.tts.stop(); if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* nada */ } }
  };
  on("latido", () => A.pulso());
  setInterval(() => A.ciclo(), 250);
})();
