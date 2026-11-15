/* Simulador de señales fisiológicas (modo simulación).
   ECG: suma de gaussianas por onda (P, Q, R, S, T) con el QT ajustado a la frecuencia, arritmia sinusal respiratoria, deriva de base y ruido.
   Pletismografía y presión arterial: un pulso por latido con su retardo de tránsito; la presión se da latido a latido.
   Respiración: impedancia torácica. Glucosa intersticial, CO₂ y presión de cabina: variables lentas.
   La SpO₂ depende también de la presión de cabina: PiO₂ = (P − 47 mmHg) × 0.2095 y saturación por la ecuación de Severinghaus.
   Los números (FC, FR, PA) se calculan de los latidos y respiraciones generados. Una situación solo cambia las señales:
   lo que el motor de alertas concluya depende de lo que mida. */
(function () {
  const { FS, W, V, cfg, gauss, fijar, emit, log } = AH;
  const BASE = { hr: 68, spo2: 98, fr: 14, sbp: 118, dbp: 76, temp: 36.7, glu: 96, co2: 2.3, pcab: 101.3, ritmo: "sinusal", perf: 1, radx: 1 };
  // cada situación: grupo, nombre y fases [segundo de inicio, cambios respecto al reposo]
  const SITUACIONES = {
    normal: ["Fisiológico", "Reposo, sin alteración", [[0, {}]]],
    ejercicio: ["Fisiológico", "Ejercicio en cicloergómetro", [[0, { hr: 116, fr: 24, sbp: 142, actividad: true }], [25, { hr: 146, fr: 32, sbp: 164, dbp: 80, temp: 37.5, glu: 88, actividad: true }]]],
    taquicardia: ["Cardiovascular", "Taquicardia sinusal sostenida en reposo", [[0, { hr: 140, fr: 18 }]]],
    bradicardia: ["Cardiovascular", "Bradicardia sinusal marcada", [[0, { hr: 37, sbp: 104, dbp: 64 }]]],
    fa: ["Cardiovascular", "Fibrilación auricular de inicio reciente", [[0, { hr: 118, ritmo: "fa", sbp: 112, dbp: 74 }]]],
    evs: ["Cardiovascular", "Extrasistolia ventricular frecuente", [[0, { hr: 74, ritmo: "evs" }]]],
    tv: ["Cardiovascular", "Taquicardia ventricular sostenida", [[0, { hr: 184, ritmo: "tv", sbp: 84, dbp: 52, perf: 0.3 }], [20, { hr: 188, ritmo: "tv", sbp: 76, dbp: 46, spo2: 89, perf: 0.25 }]]],
    hipertension: ["Cardiovascular", "Crisis hipertensiva", [[0, { sbp: 188, dbp: 118, hr: 86 }], [12, { sbp: 204, dbp: 130, hr: 92 }]]],
    hipovolemia: ["Cardiovascular", "Hipovolemia: hipotensión con taquicardia", [[0, { sbp: 100, dbp: 62, hr: 104 }], [25, { sbp: 84, dbp: 50, hr: 124, fr: 22, perf: 0.5 }]]],
    hipoxemia: ["Respiratorio", "Hipoxemia progresiva", [[0, { spo2: 93, fr: 20, hr: 88 }], [20, { spo2: 88, fr: 24, hr: 102 }], [50, { spo2: 84, fr: 28, hr: 112 }]]],
    tep: ["Respiratorio", "Embolia pulmonar: patrón de señales", [[0, { spo2: 89, hr: 122, fr: 28, sbp: 102, dbp: 64 }], [35, { spo2: 86, hr: 128, fr: 30, sbp: 92, dbp: 58, perf: 0.6 }]]],
    apnea: ["Respiratorio", "Pausas de apnea", [[0, { apnea: true, spo2: 90, fr: 12 }]]],
    taquipnea: ["Respiratorio", "Taquipnea en reposo", [[0, { fr: 34, hr: 98, spo2: 95 }]]],
    hipoglucemia: ["Metabólico", "Hipoglucemia progresiva", [[0, { glu: 60, hr: 86 }], [20, { glu: 44, hr: 100, temblor: true }]]],
    hiperglucemia: ["Metabólico", "Hiperglucemia sostenida", [[0, { glu: 210 }], [35, { glu: 275, hr: 86, fr: 18 }]]],
    fiebre: ["Infeccioso y térmico", "Síndrome febril", [[0, { temp: 38.9, hr: 102, fr: 19 }]]],
    sepsis: ["Infeccioso y térmico", "Sepsis en evolución", [[0, { temp: 38.5, hr: 104, fr: 21 }], [30, { temp: 39.3, hr: 122, fr: 26, sbp: 100, dbp: 58, spo2: 94 }], [70, { temp: 39.5, hr: 132, fr: 30, sbp: 84, dbp: 46, spo2: 91, perf: 0.5 }]]],
    calor: ["Infeccioso y térmico", "Sobrecarga térmica durante el esfuerzo", [[0, { temp: 38.4, hr: 150, fr: 30, actividad: true }], [40, { temp: 40.1, hr: 164, fr: 34, sbp: 104, dbp: 60, actividad: true }]]],
    hipotermia: ["Infeccioso y térmico", "Enfriamiento corporal", [[0, { temp: 35.6, hr: 58 }], [40, { temp: 34.7, hr: 50, fr: 11 }]]],
    co2: ["Ambiente de cabina", "Acumulación de CO₂ (fallo del depurador)", [[0, { co2: 6.4, fr: 18 }], [30, { co2: 8.4, fr: 22, hr: 82 }]]],
    despresurizacion: ["Ambiente de cabina", "Despresurización lenta de cabina", [[0, { pcab: 72, fr: 18, hr: 82 }], [35, { pcab: 52, fr: 24, hr: 104 }], [80, { pcab: 33, fr: 30, hr: 122 }]]],
    saa: ["Radiación", "Paso por la Anomalía del Atlántico Sur", [[0, { radx: 9 }]]],
    spe: ["Radiación", "Evento de partículas solares", [[0, { radx: 40 }], [20, { radx: 150 }]]],
    artefacto: ["Sensores", "Artefacto por movimiento", [[0, { artefacto: true }]]],
    sensor: ["Sensores", "Sensor de SpO₂ desconectado", [[0, { sinPleth: true }]]],
    electrodo: ["Sensores", "Electrodo de ECG suelto", [[0, { sinEcg: true }]]]
  };
  let tIni = 0;
  function objetivo() {
    const sit = SITUACIONES[cfg.escenario] || SITUACIONES.normal, dt = s.t - tIni; let fase = sit[2][0][1];
    for (const f of sit[2]) if (dt >= f[0] * 0.4) fase = f[1];      // las fases se suceden deprisa: la demo no debe hacer esperar
    return Object.assign({}, BASE, fase);
  }
  // ---- oxigenación y cabina
  const pio2 = kPa => Math.max(0, (kPa * 7.50062 - 47) * 0.2095);                     // mmHg de O₂ inspirado con aire al 20.95 %
  const severinghaus = po2 => po2 <= 0 ? 0 : 100 / (1 + 23400 / (po2 * po2 * po2 + 150 * po2));
  const spo2PorCabina = kPa => severinghaus(pio2(kPa) - 38);                           // 38 mmHg: caída alveolar y gradiente alvéolo-arterial

  // ---- radiación: tasa de dosis según altitud (modelo simplificado con valores de referencia aproximados)
  const CURVA = [[0, 0.06], [11, 5], [20, 12], [100, 9], [300, 14], [400, 22], [500, 33], [600, 50], [800, 115], [1000, 270], [1500, 1300], [2000, 4200]];
  const PERFILES = {
    leo: { n: "Órbita terrestre baja (según altitud)", orbita: true },
    avion: { n: "Vuelo comercial · 11 km", fija: 5, alt: 11 },
    cislunar: { n: "Espacio profundo / tránsito cislunar", fija: 77, alt: 384400 },
    luna: { n: "Superficie lunar", fija: 57, alt: 384400 },
    marte: { n: "Superficie de Marte", fija: 27, alt: 0 }
  };
  function tasaPorAltitud(km) {
    km = fijar(km, 0, 2000);
    for (let i = 1; i < CURVA.length; i++) if (km <= CURVA[i][0]) {
      const a = CURVA[i - 1], b = CURVA[i], f = (km - a[0]) / (b[0] - a[0]);
      return Math.exp(Math.log(a[1]) + f * (Math.log(b[1]) - Math.log(a[1])));
    }
    return CURVA[CURVA.length - 1][1];
  }

  // ---- estado fisiológico interno
  const s = Object.assign({ t: 0, faseResp: 0, resps: [], ultResp: 0, pausa: 0, ciclosApnea: 0, latidos: [], sig: null, rrs: [], pulsos: [], evsEn: 4, tras: null, env: 0, resto: 0, tSeg: 0, ultLatido: 0, gluHist: [] }, BASE);
  const g = (x, c, w, a) => { const d = (x - c) / w; return d > 5 || d < -5 ? 0 : a * Math.exp(-0.5 * d * d); };
  function ondaLatido(tau, b) {
    if (b.tipo === "V") return g(tau, -0.012, 0.034, 1.3) + g(tau, 0.085, 0.046, -0.78) + g(tau, 0.33, 0.08, -0.4);
    if (b.tipo === "T") return g(tau, 0, 0.046, 1.05) + g(tau, 0.135, 0.056, -0.9);
    const k = b.k;
    let v = g(tau, -0.024, 0.0075, -0.085) + g(tau, 0, 0.0095, 1.05) + g(tau, 0.025, 0.0095, -0.23) + g(tau, 0.245 * k, 0.052 * k, 0.24) + g(tau, 0.305 * k, 0.034 * k, 0.11);
    if (b.tipo === "N") v += g(tau, -0.165, 0.022, 0.115);
    return v;
  }
  const pulsoPleth = tau => g(tau, 0.13, 0.058, 1) + g(tau, 0.37, 0.09, 0.36);
  // presión arterial: ascenso sistólico rápido, caída exponencial e incisura dícrota
  const pulsoArt = tau => tau < -0.05 ? 0 : (g(tau, 0.09, 0.045, 0.55) + (tau > 0.05 ? 0.55 * (1 - Math.exp(-(tau - 0.05) / 0.03)) * Math.exp(-(tau - 0.05) / 0.38) : 0) + g(tau, 0.36, 0.035, 0.08)) / 0.93;
  function programar(desde, o) {
    const base = 60 / Math.max(20, s.hr); let rr, tipo = "N";
    if (o.ritmo === "fa") { rr = base * (0.62 + 0.85 * Math.random()); tipo = "A"; }
    else if (o.ritmo === "tv") { rr = base * (1 + 0.01 * gauss()); tipo = "T"; }
    else if (o.ritmo === "evs" && s.tras === "V") { rr = base * 1.38; s.tras = null; }
    else if (o.ritmo === "evs" && --s.evsEn <= 0) { rr = base * 0.62; tipo = "V"; s.tras = "V"; s.evsEn = 3 + Math.floor(Math.random() * 4); }
    else rr = base * (1 + 0.04 * Math.sin(2 * Math.PI * s.faseResp) + 0.014 * gauss());
    rr = fijar(rr, 0.24, 2.4);
    return { t: desde + rr, rr, tipo, k: fijar(Math.sqrt(rr / 0.85), 0.72, 1.18) };
  }
  function latido(b) {
    s.latidos.push(b); if (s.latidos.length > 4) s.latidos.shift();
    s.rrs.push(b.rr); if (s.rrs.length > 8) s.rrs.shift();
    const lleno = fijar(Math.sqrt(b.rr / 0.8), 0.45, 1.08), f = (b.tipo === "V" ? 0.45 : b.tipo === "T" ? 0.7 : 1) * lleno;
    const resp = 2.2 * Math.sin(2 * Math.PI * s.faseResp), dia = s.dbp + 0.4 * resp + 0.8 * gauss(), pp = Math.max(6, (s.sbp - s.dbp + resp + 1.2 * gauss()) * f);
    s.pulsos.push({ t: b.t, a: s.perf * f, dia, pp }); if (s.pulsos.length > 8) s.pulsos.shift();
    s.ultLatido = s.t;
    emit("latido", { tipo: b.tipo, rr: b.rr });
  }
  function muestra(o) {
    const dt = 1 / FS, t = (s.t += dt), k = c => 1 - Math.exp(-dt / c);
    const spo2Obj = Math.min(o.spo2, spo2PorCabina(s.pcab) - 0.3);
    s.hr += (o.hr - s.hr) * k(3); s.spo2 += (spo2Obj - s.spo2) * k(spo2Obj < s.spo2 ? 4 : 9); s.fr += (o.fr - s.fr) * k(3);
    s.sbp += (o.sbp - s.sbp) * k(3.5); s.dbp += (o.dbp - s.dbp) * k(3.5); s.temp += (o.temp - s.temp) * k(5); s.perf += (o.perf - s.perf) * k(3); s.radx += (o.radx - s.radx) * k(4);
    s.glu += (o.glu - s.glu) * k(4); s.co2 += (o.co2 - s.co2) * k(5); s.pcab += (o.pcab - s.pcab) * k(7);
    // respiración
    if (s.pausa > 0) s.pausa -= dt;
    else {
      const antes = Math.floor(s.faseResp); s.faseResp += s.fr / 60 * dt;
      if (Math.floor(s.faseResp) > antes) {
        s.resps.push(t - s.ultResp); if (s.resps.length > 4) s.resps.shift(); s.ultResp = t;
        if (o.apnea && ++s.ciclosApnea >= 3) { s.ciclosApnea = 0; s.pausa = 24 + 4 * Math.random(); }
      }
    }
    const ph = s.faseResp % 1, cardio = 0.025 * Math.sin(2 * Math.PI * t * s.hr / 60);
    const resp = s.pausa > 0 ? cardio : (ph < 0.38 ? 0.5 - 0.5 * Math.cos(Math.PI * ph / 0.38) : Math.exp(-(ph - 0.38) / 0.19)) + cardio;
    // latidos
    if (!s.sig) s.sig = programar(t, o);
    if (t >= s.sig.t) { const b = s.sig; latido(b); s.sig = programar(b.t, o); }
    // ECG
    s.env += (Math.abs(gauss()) - s.env) * 0.004;
    const mov = o.artefacto ? 1 : o.temblor ? 0.25 : 0;
    let ecg = 0.03 * Math.sin(2 * Math.PI * s.faseResp) + 0.011 * gauss();
    if (o.sinEcg) ecg = 0.02 * gauss() + 0.03 * Math.sin(2 * Math.PI * 60 * t);
    else {
      for (let i = s.latidos.length - 1; i >= 0 && t - s.latidos[i].t < 0.75; i--) ecg += ondaLatido(t - s.latidos[i].t, s.latidos[i]);
      if (s.sig.t - t < 0.3) ecg += ondaLatido(t - s.sig.t, s.sig);
      if (o.ritmo === "fa") ecg += 0.035 * Math.sin(2 * Math.PI * 6.1 * t) + 0.022 * Math.sin(2 * Math.PI * 8.3 * t + 1);
      if (mov) ecg += mov * (s.env * (0.55 * Math.sin(2 * Math.PI * 2.3 * t) + 0.3 * Math.sin(2 * Math.PI * 5.1 * t + 2)) + 0.07 * gauss());
    }
    // pletismografía y presión arterial
    let pl = 0.004 * gauss(), art = s.dbp + 0.25 * gauss();
    for (let i = s.pulsos.length - 1; i >= 0; i--) {
      const p = s.pulsos[i], ta = t - p.t - 0.09, tp = t - p.t - 0.21;
      if (ta > 1.6) break;
      if (tp > -0.2 && tp < 1.3) pl += p.a * pulsoPleth(tp);
      if (ta > -0.05) art += p.pp * pulsoArt(ta);
    }
    if (o.sinPleth) pl = 0.012 * gauss();
    else { pl *= 1 + 0.05 * Math.sin(2 * Math.PI * s.faseResp); if (mov) pl += mov * (s.env * (0.5 * Math.sin(2 * Math.PI * 1.9 * t) + 0.25 * Math.sin(2 * Math.PI * 3.7 * t)) + 0.03 * gauss()); }
    if (mov === 1) art += s.env * 9 * Math.sin(2 * Math.PI * 1.9 * t);
    W.ecg.push(ecg); W.pleth.push(pl); W.art.push(art); W.resp.push(resp + (mov === 1 ? 0.12 * s.env * Math.sin(2 * Math.PI * 1.1 * t) : 0));
  }
  const prom = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);
  function numericos(o) {
    const t = s.t, rr = s.rrs.slice(-6), hayLatidos = rr.length >= 2 && t - s.ultLatido < 4;
    V.hr = hayLatidos ? Math.round(60 / prom(rr)) : null;
    V.fuenteHr = o.sinEcg ? "pulso" : "ECG";
    V.ritmo = o.sinEcg ? "—" : (o.ritmo || "sinusal");
    V.calidad.ecg = !o.sinEcg && !o.artefacto; V.calidad.pleth = !o.sinPleth && !o.artefacto;
    V.tec.ecg = !!o.sinEcg; V.tec.pleth = !!o.sinPleth; V.tec.artefacto = !!o.artefacto;
    V.spo2 = o.sinPleth ? null : Math.round(fijar(s.spo2 + 0.25 * gauss() - (o.artefacto ? Math.abs(gauss()) * 4 : 0), 50, 100));
    V.apnea_s = Math.max(0, Math.round(t - s.ultResp));
    const ri = s.resps.slice(-3);
    V.fr = V.apnea_s > 15 ? 0 : (ri.length ? Math.round(60 / prom(ri)) : null);
    V.temp = Math.round((s.temp + 0.02 * gauss()) * 10) / 10;
    V.actividad = !!o.actividad;
    // presión arterial continua: media de los últimos latidos
    const p = s.pulsos.slice(-6);
    if (hayLatidos && p.length >= 2) { V.dbp = Math.round(prom(p.map(x => x.dia))); V.sbp = Math.round(prom(p.map(x => x.dia + x.pp))); V.map = Math.round(V.dbp + (V.sbp - V.dbp) / 3); V.paT = Date.now(); }
    else { V.sbp = V.dbp = V.map = null; }
    if (V.sbp != null && Math.round(t) % 30 === 0) { AH.HPA.push({ t: Date.now(), sbp: V.sbp, dbp: V.dbp }); if (AH.HPA.length > 60) AH.HPA.shift(); }
    // glucosa intersticial y su tendencia (mg/dL por minuto)
    V.cgm = Math.round(s.glu + 0.8 * gauss()); s.gluHist.push(s.glu); if (s.gluHist.length > 61) s.gluHist.shift();
    V.cgmTend = s.gluHist.length > 20 ? (s.glu - s.gluHist[0]) / (s.gluHist.length - 1) * 60 : 0;
    // cabina
    V.co2 = Math.round((s.co2 + 0.03 * gauss()) * 10) / 10; V.pcab = Math.round((s.pcab + 0.05 * gauss()) * 10) / 10; V.pio2 = Math.round(pio2(V.pcab));
    // radiación
    const pr = PERFILES[cfg.rad.perfil] || PERFILES.leo;
    V.alt = pr.orbita ? Math.round((cfg.rad.altitud + 4.5 * Math.sin(2 * Math.PI * t / 5560)) * 10) / 10 : pr.alt;
    V.rad = Math.round((pr.orbita ? tasaPorAltitud(V.alt) : pr.fija) * cfg.rad.blindaje * s.radx * (1 + 0.05 * gauss()) * 10) / 10;
  }
  AH.Sim = {
    SITUACIONES, ESCENARIOS: SITUACIONES, PERFILES, CURVA, tasaPorAltitud, pio2, spo2PorCabina, estado: s,
    paso(dt) {
      const o = objetivo(); s.resto += dt * FS; let n = Math.floor(s.resto); s.resto -= n; n = Math.min(n, FS * 1.5);
      for (let i = 0; i < n; i++) muestra(o);
      if (s.t - s.tSeg >= 1) { s.tSeg = s.t; numericos(o); return true; }
      return false;
    },
    escenario(k) {
      if (!SITUACIONES[k]) return;
      cfg.escenario = k; AH.guardarCfg(true); tIni = s.t; s.ciclosApnea = 0;
      log("demo", "Situación simulada: " + SITUACIONES[k][1]); emit("escenario", k);
    }
  };
})();
