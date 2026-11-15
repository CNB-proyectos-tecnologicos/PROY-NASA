/* Enlace con el servidor mínimo (motor de alertas real en Python) y fuentes de señales reales.
   · Motor: cada segundo se envían las lecturas a /api/ingerir y los eventos que devuelve el monitor continuo abren y cierran alertas aquí.
     En modo demo con ventanas aceleradas el reloj que ve el motor corre 60× (configurable) (sus ventanas de 2, 5 y 10 min se llenan en segundos).
   · Señales reales (modo demo apagado): flujo del servidor (/api/flujo), puerto serie (Web Serial) o WebSocket. */
(function () {
  const { V, W, cfg, emit, log, on, gauss } = AH;
  const NIV = { INMEDIATA: "urgencia", PRIORITARIA: "precaucion", CONSULTA: "aviso", SEGUIMIENTO: "aviso" };
  const VAR = { spo2_2min: "spo2", spo2_5min: "spo2", rest_hr_10min: "hr", rest_hr_5min: "hr", awake_hr_5min: "hr", core_temp_c: "temp", sbp_confirmed: "sbp", dbp_confirmed: "dbp",
    career_effective_mSv: "rad", career_plus_projected_mSv: "rad", solar_particle_alert: "rad", ecg_arrhythmia_flag: "hr", cgm_mg_dl: "cgm", cabin_ppco2_1h: "co2", cabin_pressure_kpa: "pcab" };
  const BIENESTAR = new Set(["Sueño / cronobiología", "Psicosocial / conducta"]);
  const UNV = { spo2: "%", hr: "lpm", temp: "°C", sbp: "mmHg", dbp: "mmHg", cgm: "mg/dL", co2: "mmHg", pcab: "kPa" };
  const SOLO_REGISTRO = new Set(["CONTEXTO", "CALIDAD"]);
  let tm = 0, cont = 0, ocupado = false, pend = [], sondeo = 0, vinculando = false, ctxEnviado = "", fallos = 0;
  const pausa = ms => new Promise(r => setTimeout(r, ms));
  const factor = () => cfg.demo && cfg.motor.acelerado ? (cfg.motor.factor || 120) : 1;
  const enPaginaPublicada = () => !!(window.claude && window.claude.use);

  const E = AH.Enlace = {
    base: null, vinculado: false, info: null, error: "", catalogo: null, vars: {},
    candidatos() {
      const c = [];
      if (enPaginaPublicada()) return c;                    // la página publicada en Claude no puede hablar con otros servidores
      if (/^https?:/.test(location.protocol)) c.push(location.origin);
      if (cfg.servidor) c.push(cfg.servidor.replace(/\/+$/, ""));
      return [...new Set(c)];
    },
    async pedir(ruta, cuerpo, ms) {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms || 6000);
      try {
        const r = await fetch(E.base + ruta, cuerpo === undefined ? { signal: ctl.signal } : { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(cuerpo), signal: ctl.signal });
        const d = await r.json(); if (!r.ok) throw new Error(d.error || "HTTP " + r.status); return d;
      } finally { clearTimeout(t); }
    },
    async vincular() {
      if (vinculando) return E.vinculado; vinculando = true;
      try { return await E._vincular(); } finally { vinculando = false; }
    },
    async _vincular() {
      const estaba = E.vinculado; E.vinculado = false;                 // mientras se reinicia no se envían lecturas
      for (let i = 0; ocupado && i < 60; i++) await pausa(50);
      for (const b of E.candidatos()) {
        try {
          E.base = b; const d = await E.pedir("/api/estado", undefined, 4000);
          if (!d || !d.motor) continue;
          E.info = d; await E.pedir("/api/reiniciar", {});
          if (!E.catalogo) { E.catalogo = await E.pedir("/api/catalogo", undefined, 8000); E.vars = {}; E.catalogo.dominios.forEach(dm => dm.variables.forEach(x => { E.vars[x.variable] = E.vars[x.variable] || { unidad: x.unidad, indicador: x.indicador, dominio: dm.nombre }; })); }
          ctxEnviado = "";
          tm = Math.max(tm + 1, Date.now() / 1000); cont = 0; pend = [];
          for (let i = 0; cfg.demo && (V.hr == null || V.sbp == null || V.cgm == null) && i < 50; i++) await pausa(100);
          if (cfg.demo && factor() > 1 && V.hr != null) {                // demo: el motor recibe la hora previa de señales basales, para que sus ventanas de 15 min y 1 h puedan evaluarse desde el principio
            const suj = AH.perfil.id || "CM-1", pre = [], p = (t, canal, valor, mas) => pre.push(Object.assign({ t, sujeto: suj, canal, valor }, mas)), r = () => gauss();
            pre.push({ tipo: "contexto", t: tm, sujeto: suj, datos: AH.contexto ? AH.contexto() : { mission_phase: "INFLIGHT" } }); ctxEnviado = JSON.stringify(AH.contexto ? AH.contexto() : {});
            for (let i = 1; i <= 3600; i++) { const t = tm + i;
              if (i > 2900) { p(t, "hr", Math.round(V.hr + 0.6 * r()), { etiquetas: { reposo: true, despierto: true } }); p(t, "spo2", Math.min(100, Math.round((V.spo2 + 0.2 * r()) * 10) / 10), { valido: true }); }
              if (i % 60 === 0) { if (V.co2 != null) p(t, "cabin_ppco2", Math.round((V.co2 + 0.03 * r()) * 10) / 10); if (V.pcab != null) p(t, "cabin_pressure_kpa", V.pcab);
                if (i > 2600) { if (V.temp != null) p(t, "temp", V.temp); if (V.sbp != null) { p(t, "sbp", V.sbp + Math.round(r())); p(t, "dbp", V.dbp + Math.round(r())); } if (V.cgm != null) p(t, "cgm", V.cgm + Math.round(r())); } } }
            tm += 3600; const d0 = await E.pedir("/api/ingerir", { mensajes: pre }, 90000), rech = (d0.eventos || []).filter(x => x.evento === "MENSAJE_RECHAZADO").length;
            log("motor", "Demo: enviada al motor la hora previa de señales basales (" + pre.length + " lecturas" + (rech ? ", " + rech + " rechazadas" : "") + ")");
          }
          E.vinculado = true; E.error = "";
          AH.Motor.vaciar("pasa al motor de Python");
          log("motor", "Vinculado al motor de Python " + d.motor.version + " · " + d.motor.reglas + " reglas · ensamble " + (d.motor.ensamble ? "activo" : "no disponible") + " · " + b, "ok");
          emit("enlace"); return true;
        } catch (e) { E.error = e.name === "AbortError" ? "sin respuesta" : e.message; }
      }
      E.base = null; if (estaba) { E.vinculado = true; E.desvincular("servidor no disponible"); } emit("enlace"); return false;
    },
    desvincular(motivo) {
      if (!E.vinculado) return; E.vinculado = false;
      AH.Motor.vaciar(motivo || "motor de Python desvinculado"); log("motor", "Motor de Python desvinculado" + (motivo ? ": " + motivo : "") + ". Sigue el motor integrado.", "precaucion"); emit("enlace");
    },
    reiniciar() { return E.vinculado ? E.vincular() : Promise.resolve(false); },
    // ---- lecturas -> mensajes del protocolo del motor ({t, sujeto, canal, valor, valido, etiquetas})
    lecturas() {
      const suj = AH.perfil.id || "CM-1", f = factor(), m = [];
      const ctx = AH.contexto ? AH.contexto() : { mission_phase: "INFLIGHT" }, firma = JSON.stringify(ctx);
      if (firma !== ctxEnviado) { ctxEnviado = firma; m.push({ tipo: "contexto", t: tm + 0.5, sujeto: suj, datos: ctx }); }      // datos estables del perfil
      for (let i = 0; i < f; i++) {
        tm += 1; cont++;
        const r = f > 1 ? 0.3 * gauss() : 0, p = (canal, valor, mas) => m.push(Object.assign({ t: tm, sujeto: suj, canal, valor }, mas));
        if (V.hr != null) p("hr", Math.round(V.hr + r), { etiquetas: { reposo: !V.actividad, despierto: true } });
        if (V.spo2 != null) p("spo2", Math.min(100, Math.round((V.spo2 + r) * 10) / 10), { valido: V.calidad.pleth });
        if (cont % 60 === 1) {
          if (V.temp != null) p("temp", V.temp);
          if (V.sbp != null) { p("sbp", V.sbp); p("dbp", V.dbp); }
          if (V.co2 != null) p("cabin_ppco2", V.co2);
          if (V.pcab != null) p("cabin_pressure_kpa", V.pcab);
          p("career_effective_mSv", Math.round(AH.Motor.carrera() * 100) / 100);
        }
        if (cont % 60 === 1 && V.cgm != null) p("cgm", V.cgm);
        if (cont % 30 === 1) {
          if (V.rad != null) p("solar_particle_alert", V.rad >= 1000 ? 1 : 0);
          if (V.ritmo !== "—") p("ecg_arrhythmia_flag", V.ritmo === "tv" || V.ritmo === "fa" ? 1 : 0);
          const x = AH.extra ? AH.extra() : {};                       // laboratorio, hormonas y bienestar como valores puntuales del catálogo
          Object.keys(x).forEach(k => { if (E.vars[k] && typeof x[k] === "number" && isFinite(x[k])) p(k, x[k]); });
        }
      }
      return m;
    },
    async tic() {
      if (!E.vinculado || !cfg.motor.activo || cfg.motor.origen !== "servidor") return;
      pend = pend.concat(E.lecturas()); if (ocupado) { if (pend.length > 4000) pend = pend.slice(-4000); return; }
      ocupado = true; const lote = pend; pend = [];
      try { const d = await E.pedir("/api/ingerir", { mensajes: lote }, 30000); fallos = 0; (d.eventos || []).forEach(E.evento); }
      catch (e) { E.error = e.name === "AbortError" ? "sin respuesta" : e.message; if (++fallos >= 3) { fallos = 0; E.desvincular("se perdió la conexión con el servidor"); } }   // un lote lento no rompe el enlace: solo tres fallos seguidos
      ocupado = false;
    },
    evento(ev) {
      const tipo = ev.evento || "", i = tipo.lastIndexOf("_"), fam = tipo.slice(0, i), fase = tipo.slice(i + 1), clave = "ep" + ev.episodio;
      const M = AH.Motor;
      if (tipo === "MENSAJE_RECHAZADO") { log("motor", "Mensaje rechazado (" + ev.motivo + "): " + ev.detalle, "precaucion"); return; }
      if (tipo === "NIVEL_CAMBIA") { log("motor", "Nivel " + ev.nivel_anterior + " → " + ev.nivel + (ev.sugerido_por_ensamble ? " (sugerido por el ensamble)" : "")); return; }
      if (tipo === "TELEMETRIA_PERDIDA") return M.externa("abre", { id: "tel-" + ev.canal, regla: "TELEMETRÍA", nombre: "Sin muestras del canal " + ev.canal, nivel: "aviso", variable: ev.canal, valorTxt: "", criterio: ev.segundos_sin_dato + " s sin dato", accion: "Revisar el sensor: sin dato no hay evaluación", nota: "", desde: Date.now(), reconocida: false, fuente: "motor" });
      if (tipo === "TELEMETRIA_RECUPERADA") return M.externa("cierra", { id: "tel-" + ev.canal });
      if (SOLO_REGISTRO.has(fam)) { if (fase === "INICIO") log("motor", fam.toLowerCase() + ": " + (ev.nombre || "") + " [" + (ev.id_regla || "") + "]"); return; }
      if (fase === "INICIO" || fase === "ESCALA") {
        const cv = (ev.criterio || "").split(" ")[0], v = VAR[cv] || "", info = E.vars[cv] || {}, sug = fam === "SUGERENCIA", ver = fam === "VERIFICAR";
        const a = { id: clave, regla: sug ? "ENSAMBLE" : ev.id_regla, nombre: ver ? "Lectura en duda: " + ev.nombre : ev.nombre, nivel: ver ? "aviso" : (NIV[ev.nivel] || "aviso"), variable: v, valor: ev.valor,
          valorTxt: ev.valor == null || (ev.criterio || "").includes("==") ? "" : (sug ? Math.round(ev.valor * 100) + " %" : (v === "temp" ? ev.valor.toFixed(1) : Math.round(ev.valor * 10) / 10) + " " + (UNV[v] || info.unidad || "")),
          criterio: AH.humano(ev.criterio || ""), accion: ver ? "Verificar el sensor antes de actuar" : (ev.accion_propuesta || ""), nota: sug ? "sugerido por el ensamble, a confirmar" : (ev.confirmacion ? "Confirmación: " + ev.confirmacion : ""), cat: BIENESTAR.has(info.dominio) ? "bienestar" : "", dominio: info.dominio || "", desde: Date.now(), reconocida: false, fuente: "motor" };
        if (fase === "ESCALA") M.cerrar(clave, "escala a " + ev.nombre);
        return M.externa("abre", a);
      }
      if (fase === "FIN") return M.externa("cierra", { id: clave });
      if (tipo === "ALERTA_RECORDATORIO") { const a = M.activas.get(clave); if (a) { a.reconocida = false; log("motor", "Recordatorio: " + ev.nombre + " sigue activa (" + Math.round(ev.duracion_s / 60) + " min)", a.nivel); emit("alerta", { accion: "recuerda", alerta: a }); } return; }
      if (tipo === "ALERTA_SIN_SEGUIMIENTO") { log("motor", "Sin seguimiento: " + ev.nombre + ". " + (ev.detalle || ""), "precaucion"); return; }
      log("motor", tipo + " " + (ev.nombre || ev.detalle || ""));
    },
    evaluar: (datos, explicar) => E.pedir("/api/evaluar", { datos, explicar: !!explicar }, 15000),
    llm: (cuerpo) => E.pedir("/api/llm", cuerpo, 130000)
  };
  on("segundo", () => {
    E.tic();
    if (!E.vinculado && cfg.motor.activo && cfg.motor.origen === "servidor" && !enPaginaPublicada() && ++sondeo % 15 === 0) E.vincular();
  });

  // ================= señales reales
  const ALIAS = { fc: "hr", pulso: "hr", bpm: "hr", heart_rate: "hr", sat: "spo2", spo2_pct: "spo2", rr: "fr", resp_rate: "fr", sis: "sbp", sys: "sbp", dia: "dbp", t: "temp", temperatura: "temp", temp_c: "temp",
    glucosa: "cgm", glu: "cgm", glucose: "cgm", cgm_mg_dl: "cgm", cabin_ppco2: "co2", ppco2: "co2", cabin_pressure_kpa: "pcab", presion_cabina: "pcab",
    rad_dosis_usv_h: "rad", dosis: "rad", altitud: "alt", altitud_km: "alt", ppg: "pleth" };
  const ult = {};                                        // última llegada por canal (para marcar «sin dato»)
  function poner(canal, valor) {
    canal = String(canal || "").toLowerCase(); canal = ALIAS[canal] || canal;
    if (canal === "ecg" || canal === "pleth" || canal === "resp" || canal === "art") { const o = W[canal]; o.viva = true; ult["w-" + canal] = Date.now(); (Array.isArray(valor) ? valor : [valor]).forEach(x => { if (isFinite(x)) o.push(+x); }); return true; }
    if (!["hr", "spo2", "fr", "sbp", "dbp", "temp", "cgm", "co2", "pcab", "rad", "alt"].includes(canal) || typeof valor !== "number" || !isFinite(valor)) return false;
    V[canal] = ["temp", "rad", "alt", "co2", "pcab"].includes(canal) ? Math.round(valor * 10) / 10 : Math.round(valor); ult[canal] = Date.now();
    if (canal === "pcab") V.pio2 = Math.round(AH.Sim.pio2(V.pcab));
    if (canal === "dbp" && V.sbp != null) { V.map = Math.round(V.dbp + (V.sbp - V.dbp) / 3); V.paT = Date.now(); }
    return true;
  }
  const F = AH.Fuente = {
    estado: "desconectado", detalle: "", recibidos: 0, _cerrar: null,
    // acepta {"canal":"hr","valor":72}, {"hr":72,"spo2":98,"ecg":[...]} o texto «hr=72,spo2=98»
    ingerir(m) {
      let n = 0;
      if (typeof m === "string") { const t = m.trim(); if (!t) return 0; try { m = JSON.parse(t); } catch (e) { m = { texto: t }; } }
      if (Array.isArray(m)) { m.forEach(x => { n += F.ingerir(x); }); return n; }
      if (!m || typeof m !== "object") return 0;
      if (typeof m.texto === "string") { m.texto.split(/[,;\s]+/).forEach(p => { const q = p.split(/[=:]/); if (q.length === 2 && poner(q[0], parseFloat(q[1]))) n++; }); }
      else if ("canal" in m && "valor" in m) { if (poner(m.canal, m.valor)) n++; if ("valido" in m && (ALIAS[m.canal] || m.canal) === "spo2") V.calidad.pleth = m.valido !== false; }
      else Object.keys(m).forEach(k => { if (poner(k, m[k])) n++; });
      F.recibidos += n; return n;
    },
    fijar(estado, detalle) { F.estado = estado; F.detalle = detalle || ""; log("fuente", "Señales: " + estado.toUpperCase() + (detalle ? " · " + detalle : ""), estado === "conectado" ? "ok" : estado === "error" ? "precaucion" : "info"); emit("fuente"); },
    desconectar() { if (F._cerrar) { try { F._cerrar(); } catch (e) { /* nada */ } F._cerrar = null; } if (F.estado !== "desconectado") F.fijar("desconectado"); },
    async conectar() {
      F.desconectar(); const tipo = cfg.fuente.tipo;
      try {
        if (tipo === "servidor") {
          if (!AH.Enlace.vinculado && !(await AH.Enlace.vincular())) throw new Error("no encuentro el servidor (" + (AH.Enlace.candidatos().join(", ") || "sin dirección") + ")");
          const es = new EventSource(AH.Enlace.base + "/api/flujo");
          es.onopen = () => F.fijar("conectado", "flujo del servidor " + AH.Enlace.base); es.onmessage = e => F.ingerir(e.data);
          es.onerror = () => { if (F.estado === "conectado") F.fijar("error", "se cortó el flujo del servidor; reintentando"); };
          F._cerrar = () => es.close(); F.fijar("conectando", "flujo del servidor");
        } else if (tipo === "ws") {
          const ws = new WebSocket(cfg.fuente.ws);
          ws.onopen = () => F.fijar("conectado", cfg.fuente.ws); ws.onmessage = e => F.ingerir(e.data);
          ws.onclose = () => { if (F._cerrar) { F._cerrar = null; F.fijar("desconectado", "el WebSocket se cerró"); } }; ws.onerror = () => F.fijar("error", "no pude abrir " + cfg.fuente.ws);
          F._cerrar = () => { F._cerrar = null; ws.close(); }; F.fijar("conectando", cfg.fuente.ws);
        } else if (tipo === "serie") {
          if (!navigator.serial) throw new Error("este navegador no ofrece puerto serie (usa Chrome o Edge y abre la página desde el servidor o como archivo)");
          const puerto = await navigator.serial.requestPort(); await puerto.open({ baudRate: +cfg.fuente.baud || 115200 });
          let vivo = true; const lector = puerto.readable.pipeThrough(new TextDecoderStream()).getReader();
          F._cerrar = () => { vivo = false; lector.cancel().catch(() => {}).then(() => puerto.close()).catch(() => {}); };
          F.fijar("conectado", "puerto serie a " + cfg.fuente.baud + " baudios");
          (async () => { let resto = ""; try { while (vivo) { const { value, done } = await lector.read(); if (done) break; const l = (resto + value).split(/\r?\n/); resto = l.pop(); l.forEach(F.ingerir); } } catch (e) { if (vivo) F.fijar("error", "lectura del puerto serie: " + e.message); } })();
        }
      } catch (e) { F._cerrar = null; F.fijar("error", e.message); }
    },
    // una vez por segundo en modo real: caducar canales callados y marcar las ondas sin muestras
    vigilar() {
      const ahora = Date.now();
      ["hr", "spo2", "fr", "temp", "rad", "alt", "co2", "pcab"].forEach(k => { if (V[k] != null && ahora - (ult[k] || 0) > 12000) V[k] = null; });
      if (V.sbp != null && ahora - (ult.dbp || 0) > 60000) { V.sbp = V.dbp = V.map = null; }
      if (V.cgm != null && ahora - (ult.cgm || 0) > 16 * 60000) V.cgm = null;                // un sensor de glucosa informa cada 1 a 5 min
      ["ecg", "pleth", "art", "resp"].forEach(k => { W[k].viva = ahora - (ult["w-" + k] || 0) < 3000; });
      V.ritmo = "—"; V.apnea_s = 0; V.actividad = false; V.tec.ecg = V.tec.pleth = V.tec.artefacto = false; V.calidad.ecg = true; V.fuenteHr = "fuente";
    },
    limpiar() { ["hr", "spo2", "fr", "sbp", "dbp", "map", "temp", "cgm", "co2", "pcab", "pio2", "rad", "alt"].forEach(k => { V[k] = null; }); V.cgmTend = 0; Object.keys(ult).forEach(k => delete ult[k]); V.calidad.pleth = true; ["ecg", "pleth", "art", "resp"].forEach(k => { W[k].viva = false; }); }
  };
})();
