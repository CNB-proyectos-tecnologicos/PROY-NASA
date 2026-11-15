/* Panel principal: barrido de ondas, números grandes, franja de alertas y barra superior. */
(function () {
  const { $, $$, esc, V, H, W, FS, cfg, on, emit, log, hora } = AH, M = AH.Motor;
  let COL = {};
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function colores() { COL = { onda: css("--onda"), texto: css("--texto"), tenue: css("--tenue"), linea: css("--linea"), estable: css("--estable"), precaucion: css("--precaucion"), urgencia: css("--urgencia"), animo: css("--animo"), acc: cfg.modo === "accesible" }; }
  const dpr = () => Math.min(2.5, window.devicePixelRatio || 1);
  function lienzo(cv) {
    const r = cv.getBoundingClientRect(), d = dpr(), w = Math.max(20, Math.round(r.width * d)), h = Math.max(20, Math.round(r.height * d));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    return { ctx: cv.getContext("2d"), w, h, d };
  }

  // ---- gráfica de línea genérica (tendencias, tablero del perfil)
  // series: [{datos:[n|null...], color, relleno, guion}] · opciones: {min, max, etiquetas:[izq, der], bandas:[[a,b]]}
  AH.grafica = function (cv, series, op) {
    if (!cv || cv.offsetParent === null) return;
    op = op || {}; const { ctx, w, h, d } = lienzo(cv), m = { l: (op.eje === false ? 4 : 34) * d, r: 6 * d, t: (op.sup || 14) * d, b: (op.etiquetas ? 14 : 4) * d };
    ctx.clearRect(0, 0, w, h);
    let lo = op.min, hi = op.max;
    if (lo == null || hi == null) {
      let a = Infinity, b = -Infinity; series.forEach(s => s.datos.forEach(x => { if (x != null) { a = Math.min(a, x); b = Math.max(b, x); } }));
      if (!isFinite(a)) { a = 0; b = 1; } const p = Math.max((b - a) * 0.15, op.margen || 0.5); if (lo == null) lo = a - p; if (hi == null) hi = b + p;
    }
    const n = Math.max(2, ...series.map(s => s.datos.length)), X = i => m.l + (w - m.l - m.r) * i / (n - 1), Y = v => m.t + (h - m.t - m.b) * (1 - (v - lo) / (hi - lo || 1));
    ctx.font = 10 * d + "px sans-serif"; ctx.fillStyle = COL.tenue; ctx.strokeStyle = COL.linea; ctx.lineWidth = d;
    if (op.eje !== false) [lo, (lo + hi) / 2, hi].forEach(v => { const y = Y(v); ctx.beginPath(); ctx.moveTo(m.l, y); ctx.lineTo(w - m.r, y); ctx.stroke(); ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillText(Math.abs(v) >= 100 ? Math.round(v) : v.toFixed(1), m.l - 4 * d, y); });
    (op.bandas || []).forEach(b => { ctx.setLineDash([4 * d, 4 * d]); ctx.strokeStyle = COL.precaucion; b.forEach(v => { if (v != null && v > lo && v < hi) { ctx.beginPath(); ctx.moveTo(m.l, Y(v)); ctx.lineTo(w - m.r, Y(v)); ctx.stroke(); } }); ctx.setLineDash([]); });
    if (op.etiquetas) { ctx.textBaseline = "bottom"; ctx.fillStyle = COL.tenue; ctx.textAlign = "left"; ctx.fillText(op.etiquetas[0], m.l, h); ctx.textAlign = "right"; ctx.fillText(op.etiquetas[1], w - m.r, h); }
    series.forEach(s => {
      const c = s.color || COL.onda; let ini = false, ux = 0, uy = 0, x0 = null, hueco = false;
      ctx.beginPath(); ctx.lineWidth = (COL.acc ? 2.2 : 1.6) * d; ctx.strokeStyle = c; ctx.setLineDash(s.guion && COL.acc ? s.guion.map(z => z * d) : []);
      s.datos.forEach((v, i) => { if (v == null) { if (x0 != null) hueco = true; ini = false; return; } const x = X(i), y = Y(v); if (!ini) { ctx.moveTo(x, y); ini = true; if (x0 == null) x0 = x; } else ctx.lineTo(x, y); ux = x; uy = y; });
      ctx.stroke(); ctx.setLineDash([]);
      if (s.relleno && x0 != null && !hueco) { ctx.lineTo(ux, h - m.b); ctx.lineTo(x0, h - m.b); ctx.closePath(); ctx.globalAlpha = 0.12; ctx.fillStyle = c; ctx.fill(); ctx.globalAlpha = 1; }
      if (x0 != null) { ctx.beginPath(); ctx.arc(ux, uy, 3 * d, 0, 7); ctx.fillStyle = c; ctx.fill(); }
    });
  };

  // ---- barrido de una forma de onda, con barra de borrado como en el equipo
  class Barrido {
    constructor(id, clave, seg, min, max, patron, serie, auto) { this.cv = $(id); this.onda = W[clave]; this.seg = seg; this.min = min; this.max = max; this.patron = patron; this.serie = serie; this.auto = !!auto; this.ult = null; this.xy = null; this.modo = ""; }
    reiniciar() { this.ult = null; this.xy = null; }
    rango() {
      if (cfg.demo && !this.auto) return [this.min, this.max];
      const tot = this.seg * FS, n = this.onda.n; let a = Infinity, b = -Infinity;
      for (let i = Math.max(0, n - tot); i < n; i += 2) { const v = this.onda.get(i); if (v < a) a = v; if (v > b) b = v; }
      if (!isFinite(a) || a === b) return [this.min, this.max]; const p = Math.max((b - a) * 0.18, this.auto ? 6 : 0); return [a - p, b + (this.auto ? 2.2 * p : p)];
    }
    dibujar() {
      const cv = this.cv; if (cv.offsetParent === null) return;
      const modo = this.onda.viva ? "onda" : "tendencia"; if (modo !== this.modo) { this.modo = modo; this.reiniciar(); }
      if (modo === "tendencia") return;
      const { ctx, w, h, d } = lienzo(cv), tot = this.seg * FS, pps = w / tot, n = this.onda.n;
      if (this.w !== w || this.h !== h) { this.w = w; this.h = h; this.reiniciar(); }
      if (this.ult == null || n - this.ult > tot || n < this.ult) { ctx.clearRect(0, 0, w, h); this.ult = Math.max(0, n - 1); this.xy = null; this.r = this.rango(); this.tr = n; }
      if (n - 1 <= this.ult) return;
      if (n - this.tr > FS) { this.r = this.rango(); this.tr = n; }
      const [lo, hi] = this.r, Y = v => h * (0.06 + 0.88 * (1 - (v - lo) / (hi - lo))), hueco = Math.max(12 * d, w * 0.02), pat = COL.acc ? this.patron : null;
      const vis = x => !pat || ((x / d) % pat[0]) < pat[1];
      let prev = this.xy; const tramos = [];
      for (let i = this.ult + 1; i < n; i++) {
        const x = (i % tot) * pps, y = Y(this.onda.get(i));
        if (!prev || x < prev[0]) { ctx.clearRect(0, 0, x + hueco, h); tramos.push(["m", x, y]); }
        else { ctx.clearRect(prev[0] + d, 0, x - prev[0] + hueco, h); if (!tramos.length) tramos.push(["m", prev[0], prev[1]]); tramos.push([vis(x) ? "l" : "m", x, y]); }
        prev = [x, y];
      }
      ctx.beginPath(); tramos.forEach(t => t[0] === "m" ? ctx.moveTo(t[1], t[2]) : ctx.lineTo(t[1], t[2]));
      ctx.lineWidth = (COL.acc ? 2.4 : 1.5) * d; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.strokeStyle = COL.onda;
      ctx.stroke();
      ctx.fillStyle = COL.texto; ctx.fillRect(prev[0] + 3 * d, h * 0.1, 3 * d, h * 0.8);
      this.xy = prev; this.ult = n - 1;
    }
    // sin forma de onda (fuente real que solo manda números): se dibuja la tendencia del valor
    tendencia() {
      if (this.onda.viva || this.cv.offsetParent === null) return;
      const datos = H[this.serie].slice(-120);
      AH.grafica(this.cv, [{ datos, relleno: true }], { etiquetas: ["hace 2 min · tendencia del valor (la fuente no envía forma de onda)", "ahora"], margen: 2, sup: 26 });
    }
  }
  const barridos = [new Barrido("#cv-ecg", "ecg", 6, -0.5, 1.35, null, "hr"), new Barrido("#cv-pleth", "pleth", 6, -0.18, 1.32, [5, 2.2], "spo2"), new Barrido("#cv-art", "art", 6, 40, 160, [9, 5], "sbp", true), new Barrido("#cv-resp", "resp", 24, -0.25, 1.3, [14, 9], "fr")];

  // ---- números
  const RITMO = { sinusal: "ritmo sinusal", fa: "fibrilación auricular", evs: "extrasístoles ventriculares", tv: "taquicardia ventricular", "—": "" };
  function caja(id, estado, valor) {
    const t = $("#t-" + id), nulo = valor == null, e = nulo ? "nd" : estado;
    t.className = t.className.replace(/s-\w+/, "s-" + e);
    $("#e-" + id).textContent = nulo ? "– SIN DATO" : e === "nd" ? "– SIN VIGILANCIA" : M.ICONO[e] + " " + M.TEXTO[e];
  }
  const mmss = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  function numeros() {
    $("#v-hr").textContent = V.hr == null ? "--" : V.hr; caja("hr", M.estadoVar("hr"), V.hr);
    $("#s-hr").textContent = [RITMO[V.ritmo] || "", V.fuenteHr === "pulso" ? "desde el pulso" : ""].filter(Boolean).join(" · ");
    $("#v-spo2").textContent = V.spo2 == null ? "--" : V.spo2 + (V.calidad.pleth ? "" : "?"); caja("spo2", V.spo2 != null && !V.calidad.pleth && cfg.motor.activo ? "precaucion" : M.estadoVar("spo2"), V.spo2);
    $("#s-spo2").textContent = V.spo2 == null ? "" : V.calidad.pleth ? "pulso " + (V.hr == null ? "--" : V.hr) : "señal en duda";
    $("#v-fr").textContent = V.fr == null ? "--" : V.fr; caja("fr", M.estadoVar("fr"), V.fr);
    $("#s-fr").textContent = V.apnea_s >= 10 ? "apnea " + V.apnea_s + " s" : "";
    $("#v-pa").textContent = V.sbp == null ? "--/--" : V.sbp + "/" + V.dbp; $("#v-map").textContent = V.map == null ? "" : "(" + V.map + ")"; caja("pa", M.estadoVar("pa"), V.sbp);
    $("#s-pa").textContent = V.sbp == null ? "" : "media " + V.map + " · latido a latido";
    const tg = V.cgmTend || 0, flecha = tg > 3 ? "↑↑" : tg > 2 ? "↑" : tg > 1 ? "↗" : tg < -3 ? "↓↓" : tg < -2 ? "↓" : tg < -1 ? "↘" : "→";
    $("#v-glu").textContent = V.cgm == null ? "--" : V.cgm; $("#v-glu-t").textContent = V.cgm == null ? "" : flecha; caja("glu", M.estadoVar("glu"), V.cgm);
    $("#s-glu").textContent = V.cgm == null || !cfg.demo ? "" : (tg >= 0 ? "+" : "−") + Math.abs(tg).toFixed(1) + " mg/dL/min";
    $("#v-co2").textContent = V.co2 == null ? "--" : V.co2.toFixed(1); $("#v-pcab").textContent = V.pcab == null ? "--" : V.pcab.toFixed(1); $("#v-pio2").textContent = V.pio2 == null ? "--" : V.pio2;
    caja("cab", M.estadoVar("cab"), V.co2 == null ? V.pcab : V.co2);
    $("#v-temp").textContent = V.temp == null ? "--.-" : V.temp.toFixed(1); caja("temp", M.estadoVar("temp"), V.temp);
    const r = AH.perfil.rad, car = M.carrera();
    $("#v-rad").textContent = V.rad == null ? "--" : V.rad >= 100 ? Math.round(V.rad) : V.rad.toFixed(1); caja("rad", M.estadoVar("rad"), V.rad);
    $("#v-alt").textContent = V.alt == null ? "--" : V.alt > 9999 ? Math.round(V.alt).toLocaleString("es") : V.alt.toFixed(1);
    $("#v-mis").textContent = r.mision_mSv.toFixed(3); $("#v-ses").textContent = V.dosisSesion.toFixed(2); $("#v-car").textContent = car.toFixed(1);
    $("#b-dosis").style.width = Math.min(100, car / 6).toFixed(1) + "%"; $("#s-rad").textContent = (car / 6).toFixed(1) + " % del límite de carrera";
    // mensajes sobre las ondas
    const sinFuente = !cfg.demo && AH.Fuente.estado !== "conectado";
    $("#msj-ecg").textContent = sinFuente ? "SIN SEÑAL" : V.tec.ecg ? "ELECTRODO SUELTO" : V.tec.artefacto ? "ARTEFACTO POR MOVIMIENTO" : "";
    $("#msj-pleth").textContent = sinFuente ? "SIN SEÑAL" : V.tec.pleth ? "SENSOR SIN SEÑAL" : "";
    $("#msj-art").textContent = sinFuente ? "SIN SEÑAL" : "";
    $("#msj-resp").textContent = sinFuente ? "SIN SEÑAL" : V.apnea_s >= 10 ? "APNEA " + V.apnea_s + " s" : "";
    // gráficas pequeñas
    barridos.forEach(b => b.tendencia());
    AH.grafica($("#sp-temp"), [{ datos: H.temp.slice(-600), relleno: true }], { margen: 0.3, bandas: [[cfg.limites.temp[1]]] });
    AH.grafica($("#sp-glu"), [{ datos: H.cgm.slice(-600), relleno: true }], { margen: 8, bandas: [cfg.limites.cgm] });
    graficaRad();
  }
  function limites() {
    const L = cfg.limites, f = k => L[k][0] + "–" + L[k][1];
    $("#lim-hr").textContent = f("hr"); $("#lim-spo2").textContent = "≥ " + L.spo2[0]; $("#lim-fr").textContent = f("fr"); $("#lim-pa").textContent = "sist. " + f("sbp"); $("#lim-temp").textContent = f("temp"); $("#lim-glu").textContent = f("cgm"); $("#lim-cab").textContent = "ppCO₂ ≤ " + L.co2[1]; $("#lim-rad").textContent = "< " + L.rad[1];
  }
  function graficaPA() {
    const cv = $("#sp-pa"); if (cv.offsetParent === null) return;
    const { ctx, w, h, d } = lienzo(cv), a = AH.HPA.slice(-8); ctx.clearRect(0, 0, w, h); if (!a.length) return;
    const lo = 40, hi = 210, Y = v => h * (0.16 + 0.78 * (1 - (v - lo) / (hi - lo)));
    ctx.strokeStyle = COL.linea; ctx.lineWidth = d; ctx.fillStyle = COL.tenue; ctx.font = 9 * d + "px sans-serif"; ctx.textBaseline = "middle";
    [90, 140, 180].forEach(v => { ctx.beginPath(); ctx.moveTo(18 * d, Y(v)); ctx.lineTo(w, Y(v)); ctx.stroke(); ctx.fillText(v, 0, Y(v)); });
    a.forEach((p, i) => {
      const x = 22 * d + (i + 0.5) * (w - 24 * d) / Math.max(a.length, 5), alto = p.sbp >= 180 || p.dbp >= 120, bajo = p.sbp < 90;
      ctx.strokeStyle = alto ? COL.urgencia : bajo || p.sbp > cfg.limites.sbp[1] ? COL.precaucion : COL.onda; ctx.lineWidth = (COL.acc ? 4 : 3) * d; ctx.lineCap = "butt";
      ctx.beginPath(); ctx.moveTo(x, Y(p.sbp)); ctx.lineTo(x, Y(p.dbp)); ctx.stroke();
      ctx.lineWidth = 1.5 * d; ctx.beginPath(); ctx.moveTo(x - 4 * d, Y(p.sbp)); ctx.lineTo(x + 4 * d, Y(p.sbp)); ctx.moveTo(x - 4 * d, Y(p.dbp)); ctx.lineTo(x + 4 * d, Y(p.dbp)); ctx.stroke();
    });
  }
  function graficaRad() {
    const cv = $("#cv-alt"); if (cv.offsetParent === null) return;
    const p = AH.Sim.PERFILES[cfg.rad.perfil] || AH.Sim.PERFILES.leo;
    if (!cfg.demo || !p.orbita) { $("#rot-alt").textContent = "Tasa · 10 min"; AH.grafica(cv, [{ datos: H.rad.slice(-600), relleno: true }], { margen: 2 }); return; }
    $("#rot-alt").textContent = "Tasa según altitud";
    const { ctx, w, h, d } = lienzo(cv), a0 = 200, a1 = 1000, lo = Math.log(8), hi = Math.log(400), ml = 6 * d, mb = 13 * d, mt = 13 * d;
    const X = km => ml + (w - ml - 6 * d) * (km - a0) / (a1 - a0), Y = t => mt + (h - mt - mb) * (1 - (Math.log(Math.max(8, Math.min(400, t))) - lo) / (hi - lo));
    ctx.clearRect(0, 0, w, h); ctx.beginPath();
    for (let km = a0; km <= a1; km += 10) { const y = Y(AH.Sim.tasaPorAltitud(km)); km === a0 ? ctx.moveTo(X(km), y) : ctx.lineTo(X(km), y); }
    ctx.strokeStyle = COL.onda; ctx.lineWidth = (COL.acc ? 2.2 : 1.6) * d; ctx.stroke();
    ctx.lineTo(X(a1), h - mb); ctx.lineTo(X(a0), h - mb); ctx.closePath(); ctx.globalAlpha = 0.1; ctx.fillStyle = COL.onda; ctx.fill(); ctx.globalAlpha = 1;
    ctx.font = 9 * d + "px sans-serif"; ctx.fillStyle = COL.tenue; ctx.textBaseline = "bottom"; ctx.textAlign = "left"; ctx.fillText("200 km", ml, h); ctx.textAlign = "right"; ctx.fillText("1000 km", w - 6 * d, h);
    const km = Math.max(a0, Math.min(a1, V.alt || cfg.rad.altitud)), x = X(km), y = Y(V.rad == null ? AH.Sim.tasaPorAltitud(km) : V.rad);
    ctx.strokeStyle = COL.texto; ctx.lineWidth = d; ctx.setLineDash([3 * d, 3 * d]); ctx.beginPath(); ctx.moveTo(x, mt); ctx.lineTo(x, h - mb); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(x, y, 4 * d, 0, 7); ctx.fillStyle = COL.texto; ctx.fill();
    ctx.textAlign = x > w * 0.6 ? "right" : "left"; ctx.textBaseline = "middle"; ctx.fillStyle = COL.texto; ctx.fillText(Math.round(km) + " km", x + (x > w * 0.6 ? -8 : 8) * d, Math.max(mt + 6 * d, y - 10 * d));
  }

  // ---- franja de alertas, visible en todos los paneles
  let abierta = false;
  function franja() {
    const f = $("#franja"), l = M.lista();
    if (!cfg.motor.activo) {
      f.className = "franja s-precaucion";
      f.innerHTML = '<span class="ico">⚠</span><span class="niv">MOTOR DE ALERTAS DESCONECTADO</span><span class="txt">Los valores se muestran sin vigilancia automática.</span><button type="button" class="btn" data-a="motor">CONECTAR</button>'; return;
    }
    if (!l.length) {
      const e = AH.Enlace;
      f.className = "franja s-estable";
      f.innerHTML = '<span class="ico">✓</span><span class="niv">SIN ALERTAS ACTIVAS</span><span class="txt"><span>Vigilancia: ' + (e.vinculado && cfg.motor.origen === "servidor" ? "motor de Python " + esc(e.info.motor.version) + (e.info.motor.ensamble ? " con ensamble" : " (solo reglas)") + " + alarmas del monitor" : "motor integrado en la página") + '</span></span>'; return;
    }
    const a = l[0], pend = l.some(x => !x.reconocida), A = AH.Audio;
    f.className = "franja s-" + a.nivel;
    f.innerHTML = '<span class="ico">' + M.ICONO[a.nivel] + '</span><span class="niv">' + M.TEXTO[a.nivel] + '</span><span class="txt"><b>' + esc(a.nombre) + (a.valorTxt ? " · " + esc(a.valorTxt) : "") + '</b> <span>' + esc(a.accion) + '</span></span>' +
      '<button type="button" class="mas" data-a="lista">' + (abierta ? "ocultar" : l.length > 1 ? "+" + (l.length - 1) + " más" : "detalle") + '</button>' +
      (pend ? '<button type="button" class="btn" data-a="reconocer">RECONOCER</button>' : '<span class="etq">RECONOCIDA</span>') +
      '<button type="button" class="btn" data-a="pausa">' + (A.pausado ? "REANUDAR AUDIO · " + mmss(A.restoPausa) : "PAUSAR AUDIO 2 MIN") + '</button>' +
      (abierta ? '<div class="lista-alertas">' + l.map(x => '<div class="al s-' + x.nivel + '"><span class="i">' + M.ICONO[x.nivel] + '</span><span class="n">' + M.TEXTO[x.nivel] + '</span><span><b>' + esc(x.nombre) + '</b>' + (x.valorTxt ? " · " + esc(x.valorTxt) : "") +
        '<small>' + esc([x.regla || x.id, x.criterio, x.accion, x.nota].filter(Boolean).join(" · ")) + '</small></span><span>' + hora(x.desde) + (x.reconocida ? " · reconocida" : "") + '</span></div>').join("") + '</div>' : "");
  }
  $("#franja").addEventListener("click", e => {
    const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a;
    if (a === "lista") abierta = !abierta; else if (a === "reconocer") M.reconocer(); else if (a === "pausa") AH.Audio.pausar(AH.Audio.pausado ? 0 : 120);
    else if (a === "motor") { cfg.motor.activo = true; AH.guardarCfg(); log("motor", "Motor de alertas conectado"); }
    franja();
  });

  // ---- barra superior
  const TXT_AUDIO = { todo: "Audio: todo", alertas: "Audio: solo alertas", urgentes: "Audio: solo urgencias", silencio: "Audio: silencio" };
  function barra() {
    const b = $("#btn-audio"), A = AH.Audio;
    b.classList.toggle("pide", !A.activo); b.classList.toggle("mudo", A.activo && cfg.audio.modo === "silencio");
    $("#txt-audio").textContent = !A.activo ? "Activar audio" : TXT_AUDIO[cfg.audio.modo]; $("#tachado").toggleAttribute("hidden", !(A.activo && cfg.audio.modo === "silencio"));
    const cf = $("#ch-fuente"), F = AH.Fuente, ef = cfg.demo ? ["s-nd", "Simulación"] : F.estado === "conectado" ? ["s-estable", "Conectado"] : F.estado === "conectando" ? ["s-precaucion", "Conectando"] : ["s-urgencia", "Desconectado"];
    cf.className = "chip " + ef[0]; cf.querySelector("em").textContent = ef[1];
    const cm = $("#ch-motor"), py = AH.Enlace.vinculado && cfg.motor.origen === "servidor";
    cm.className = "chip " + (cfg.motor.activo ? "s-estable" : "s-urgencia"); cm.querySelector("em").textContent = cfg.motor.activo ? "Conectado · " + (py ? "Python" : "integrado") : "Desconectado";
    $$("#sel-modo button").forEach(x => x.classList.toggle("on", x.dataset.modo === cfg.modo));
    $("#caja-esc").hidden = !cfg.demo; $("#sel-esc").value = cfg.escenario;
    document.documentElement.dataset.modo = cfg.modo; document.documentElement.dataset.rejilla = cfg.vista.rejilla ? "si" : "no";
  }
  function irA(tab) {
    $$(".panel").forEach(p => p.classList.toggle("on", p.id === "p-" + tab)); $$("[data-tab]").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
    barridos.forEach(b => b.reiniciar()); emit("panel", tab);
  }
  AH.irA = irA;
  document.addEventListener("click", e => { const t = e.target.closest("[data-tab]"); if (t) irA(t.dataset.tab); });
  $("#sel-modo").addEventListener("click", e => { const b = e.target.closest("[data-modo]"); if (!b) return; cfg.modo = b.dataset.modo; AH.guardarCfg(); log("vista", "Visualización: " + (cfg.modo === "accesible" ? "Accesible" : "Estándar")); });
  $("#btn-audio").addEventListener("click", async () => {
    const A = AH.Audio, orden = ["todo", "alertas", "urgentes", "silencio"];
    if (!A.activo) await A.activar(); else { cfg.audio.modo = orden[(orden.indexOf(cfg.audio.modo) + 1) % 4]; AH.guardarCfg(); log("audio", TXT_AUDIO[cfg.audio.modo]); }
    barra();
  });
  { const S = AH.Sim.SITUACIONES, grupos = [...new Set(Object.keys(S).map(k => S[k][0]))];
    $("#sel-esc").innerHTML = grupos.map(g => '<optgroup label="' + esc(g) + '">' + Object.keys(S).filter(k => S[k][0] === g).map(k => '<option value="' + k + '">' + esc(S[k][1]) + "</option>").join("") + "</optgroup>").join(""); }
  $("#sel-esc").addEventListener("change", e => AH.Sim.escenario(e.target.value));
  $("#btn-animo").addEventListener("click", () => { irA("asistente"); AH.Asistente.prueba("clima"); });
  $("#btn-sos").addEventListener("click", () => AH.Asistente.crisis("botón SOS del monitor"));

  // ---- ciclo principal
  let ult = performance.now(), acumReal = 0, proxLatido = 0, tGuarda = 0;
  function segundo() {
    if (V.rad != null) { AH.perfil.rad.mision_mSv += V.rad / 3600 / 1000; V.dosisSesion += V.rad / 3600; }
    AH.historiar(); emit("segundo");
    if (++tGuarda % 30 === 0) AH.guardar("perfil", AH.perfil);
    $("#reloj").textContent = hora(); numeros(); franja();
  }
  function ciclo() {
    const ahora = performance.now(), dt = Math.min((ahora - ult) / 1000, 1.2); ult = ahora;
    if (cfg.demo) { if (AH.Sim.paso(dt)) segundo(); }
    else {
      acumReal += dt; if (acumReal >= 1) { acumReal = 0; AH.Fuente.vigilar(); segundo(); }
      if (V.hr != null && ahora >= proxLatido) { proxLatido = ahora + 60000 / Math.max(25, V.hr); emit("latido", { tipo: "N" }); }   // sin ECG propio: el pitido sigue la FC recibida
    }
    barridos.forEach(b => b.dibujar());
  }
  on("latido", () => { const l = $("#lat"); l.classList.add("on"); setTimeout(() => l.classList.remove("on"), 130); });
  on("alerta", franja); on("audio", () => { barra(); franja(); }); on("enlace", () => { barra(); franja(); }); on("fuente", barra); on("escenario", barra);
  on("cfg", () => { colores(); barra(); limites(); franja(); barridos.forEach(b => b.reiniciar()); });
  window.addEventListener("resize", () => barridos.forEach(b => b.reiniciar()));
  AH.Monitor = { iniciar() { colores(); barra(); limites(); franja(); setInterval(ciclo, 33);
    // Con la pestaña en segundo plano el navegador frena los temporizadores de la página (hasta uno por minuto). Un trabajador
    // mantiene el ciclo a 4 Hz para que el motor y la consola del médico en tierra sigan recibiendo datos.
    try { const w = new Worker(URL.createObjectURL(new Blob(["setInterval(function () { postMessage(0); }, 250);"], { type: "text/javascript" }))); w.onmessage = () => { if (document.hidden) ciclo(); }; w.onerror = e => e.preventDefault(); } catch (e) { /* sin trabajadores: sigue el temporizador normal */ }
  }, numeros };
})();
