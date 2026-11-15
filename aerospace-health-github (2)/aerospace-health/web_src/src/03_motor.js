/* Motor de alertas integrado y modelo para casos intermedios.
   Reglas SP-xxxx: umbrales y textos del catálogo espacial del proyecto. Reglas MON-/TEC-: propias de este monitor (ritmo, respiración, sensores).
   Cada regla mira la media de una ventana; en modo demo las ventanas se acortan 20× para que la alteración se vea en segundos. */
(function () {
  const { V, H, cfg, media, emit, log, on } = AH;
  const ORDEN = { estable: 0, aviso: 1, precaucion: 2, urgencia: 3 };
  const ICONO = { estable: "✓", aviso: "ⓘ", precaucion: "⚠", urgencia: "‼", nd: "–", animo: "✦" };
  const TEXTO = { estable: "ESTABLE", aviso: "AVISO", precaucion: "PRECAUCIÓN", urgencia: "URGENCIA", nd: "SIN DATO" };
  const UN = { hr: "lpm", spo2: "%", fr: "rpm", sbp: "mmHg", dbp: "mmHg", temp: "°C", cgm: "mg/dL", co2: "mmHg", pcab: "kPa", rad: "µSv/h", carrera: "mSv", apnea_s: "s" };
  const NOM = { hr: "FC", spo2: "SpO₂", fr: "FR", sbp: "PA sistólica", dbp: "PA diastólica", temp: "Temperatura", cgm: "Glucosa", co2: "ppCO₂ de cabina", pcab: "Presión de cabina", rad: "Tasa de dosis", carrera: "Dosis de carrera", apnea_s: "Apnea" };
  // v: lectura del monitor (con ventana) · x: variable del catálogo que llega del perfil o del bienestar (valor puntual)
  const REGLAS = [
    { id: "SP-0033", n: "SpO₂ crítica sostenida", v: "spo2", op: "<", u: 90, win: 120, niv: "urgencia", acc: "Verificar oxímetro, oxigenación y condiciones de cabina", fiable: "pleth" },
    { id: "SP-0034", n: "SpO₂ moderadamente baja", v: "spo2", op: "<", u: 92, win: 300, niv: "precaucion", acc: "Evaluación clínica y ambiente de cabina", fiable: "pleth" },
    { id: "SP-0042", n: "Frecuencia elevada en reposo", v: "hr", op: ">", u: 120, win: 600, niv: "precaucion", acc: "Evaluar taquicardia sostenida y causas", reposo: true },
    { id: "SP-0043", n: "Frecuencia extremadamente elevada", v: "hr", op: ">", u: 150, win: 300, niv: "urgencia", acc: "Evaluación inmediata clínica y ECG", reposo: true },
    { id: "SP-0044", n: "Bradicardia marcada en vigilia", v: "hr", op: "<", u: 40, win: 300, niv: "precaucion", acc: "Confirmar y evaluar perfusión" },
    { id: "SP-0041", n: "Presión sistólica muy baja", v: "sbp", op: "<", u: 90, win: 900, niv: "urgencia", acc: "Evaluar perfusión y causas médicas" },
    { id: "SP-0052", n: "Hipertensión severa sistólica", v: "sbp", op: ">=", u: 180, win: 900, niv: "urgencia", acc: "Medir daño de órgano, evaluación urgente" },
    { id: "SP-0053", n: "Hipertensión severa diastólica", v: "dbp", op: ">=", u: 120, win: 900, niv: "urgencia", acc: "Valorar daño agudo de órgano" },
    { id: "SP-0123", n: "Fiebre corporal confirmada", v: "temp", op: ">=", u: 38, win: 300, niv: "aviso", acc: "Evaluar infección o exposición térmica" },
    { id: "SP-0125", n: "Fiebre alta", v: "temp", op: ">=", u: 39, win: 300, niv: "precaucion", acc: "Evaluación médica prioritaria" },
    { id: "SP-0165", n: "Temperatura corporal muy alta", v: "temp", op: ">=", u: 40, win: 300, niv: "urgencia", acc: "Evaluación inmediata por posible hipertermia" },
    { id: "SP-0124", n: "Hipotermia corporal", v: "temp", op: "<", u: 35, win: 300, niv: "urgencia", acc: "Evaluación de hipotermia" },
    { id: "SP-0167", n: "Descenso de la temperatura corporal", v: "temp", op: "<", u: 36, win: 300, niv: "aviso", acc: "Verificar patrón y sensores" },
    { id: "SP-0131", n: "Hipoglucemia intersticial leve", v: "cgm", op: "<", u: 70, win: 900, niv: "precaucion", acc: "Confirmar y seguir protocolo de glucosa baja" },
    { id: "SP-0132", n: "Hipoglucemia intersticial profunda", v: "cgm", op: "<", u: 54, win: 900, niv: "urgencia", acc: "Revisión inmediata de glucosa y asistencia" },
    { id: "SP-0133", n: "Hiperglucemia intersticial", v: "cgm", op: ">", u: 180, win: 900, niv: "aviso", acc: "Revisar exposición glucémica, comida y estrés" },
    { id: "SP-0134", n: "Hiperglucemia intersticial notable", v: "cgm", op: ">", u: 250, win: 900, niv: "precaucion", acc: "Evaluar estado metabólico y causas" },
    { id: "SP-0001", n: "CO₂ horario por encima del límite nominal", v: "co2", op: ">", u: 3, win: 3600, niv: "urgencia", acc: "Verificar depurador y ventilación; avisar a control ambiental" },
    { id: "SP-0003", n: "Presión total de cabina por debajo de la zona definida", v: "pcab", op: "<=", u: 34.5, win: 120, niv: "urgencia", acc: "Activar protocolo de atmósfera de cabina" },
    { id: "SP-0017", n: "Dosis de carrera en el límite NASA", v: "carrera", op: ">=", u: 600, win: 0, niv: "urgencia", acc: "Escalar al responsable de protección radiológica" },
    { id: "SP-0019", n: "Evento de partículas solares relevante", v: "rad", op: ">=", u: 1000, win: 60, niv: "urgencia", acc: "Protocolo de refugio radiológico", nota: "indicador derivado aquí de la tasa de dosis" },
    { id: "SP-0145", n: "Lapsos de atención por encima de la basal (PVT)", x: "pvt_lapse_high_flag", op: "==", u: 1, niv: "precaucion", acc: "Revisar desempeño y fatiga", cat: "bienestar" },
    { id: "SP-0141", n: "Sueño promedio muy corto", x: "sleep_hours_7d", op: "<", u: 6, niv: "aviso", acc: "Revisión de fatiga y cronograma", cat: "bienestar" },
    { id: "SP-0146", n: "Sobrecarga de trabajo crítico", x: "workload_alarm", op: "==", u: 1, niv: "precaucion", acc: "Replanificar turno y descanso", cat: "bienestar" },
    { id: "SP-0107", n: "Vitamina D 25-OH baja", x: "vitd_25oh_ng_ml", op: "<", u: 20, niv: "aviso", acc: "Interpretar metabolismo óseo y nutrición" },
    { id: "SP-0110", n: "Sodio sérico bajo", x: "sodium_mmol_l", op: "<", u: 135, niv: "precaucion", acc: "Evaluar disnatremia y balance hídrico" },
    { id: "SP-0112", n: "Sodio sérico alto", x: "sodium_mmol_l", op: ">", u: 145, niv: "precaucion", acc: "Evaluación de agua libre y pérdidas" },
    { id: "SP-0113", n: "Potasio alto", x: "potassium_mmol_l", op: ">=", u: 6, niv: "urgencia", acc: "Revisar ECG y causas" },
    { id: "SP-0114", n: "Potasio bajo", x: "potassium_mmol_l", op: "<", u: 3, niv: "precaucion", acc: "Evaluar electrolitos y ECG" },
    { id: "SP-0120", n: "Plaquetas muy bajas", x: "platelets_10e9_l", op: "<", u: 50, niv: "urgencia", acc: "Evaluar sangrado y citopenia" },
    { id: "SP-0121", n: "Neutropenia grave", x: "anc_10e9_l", op: "<", u: 0.5, niv: "urgencia", acc: "Protección frente a infección y evaluación" },
    { id: "SP-0128", n: "Leucocitosis", x: "wbc_10e9_l", op: ">", u: 11, niv: "aviso", acc: "Correlación clínica y de laboratorio" },
    { id: "SP-0129", n: "Leucopenia", x: "wbc_10e9_l", op: "<", u: 4, niv: "aviso", acc: "Evaluar médula e infección" },
    { id: "SP-0156", n: "TSH elevada", x: "tsh_high_flag", op: "==", u: 1, niv: "aviso", acc: "Solicitar T4 libre y valoración" },
    { id: "SP-0157", n: "TSH baja", x: "tsh_low_flag", op: "==", u: 1, niv: "aviso", acc: "Valorar T4 libre, T3 y medicación" },
    { id: "SP-0193", n: "Dolor torácico informado", x: "chest_pain_flag", op: "==", u: 1, niv: "urgencia", acc: "Evaluación cardiopulmonar", nota: "señalado en el mapa corporal del dolor" },
    { id: "PSI-01", n: "Malestar psicológico autoinformado", x: "psych_selfreport_flag", op: "==", u: 1, niv: "aviso", acc: "Ofrecer evaluación confidencial con un profesional", nota: "corresponde a SP-0148, apagada en el catálogo", cat: "bienestar" },
    { id: "PSI-02", n: "Índice de bienestar OMS-5 muy bajo", x: "who5", op: "<=", u: 28, niv: "precaucion", acc: "Cribado de depresión con instrumento validado y valoración profesional", cat: "bienestar" },
    { id: "PSI-03", n: "Conflicto de equipo informado", x: "team_conflict_flag", op: "==", u: 1, niv: "aviso", acc: "Mediación y soporte del programa", nota: "corresponde a SP-0150, apagada en el catálogo", cat: "bienestar" },
    { id: "MON-03", n: "Taquicardia ventricular", ritmo: "tv", win: 100, niv: "urgencia", acc: "Comprobar pulso y consciencia; avisar al médico de vuelo" },
    { id: "MON-04", n: "Ritmo irregular sin onda P (posible fibrilación auricular)", ritmo: "fa", win: 300, niv: "precaucion", acc: "Registrar ECG de 12 derivaciones y consultar por telemedicina" },
    { id: "MON-05", n: "Extrasístoles ventriculares", ritmo: "evs", win: 300, niv: "aviso", acc: "Vigilar la frecuencia de las extrasístoles y los síntomas" },
    { id: "MON-06", n: "Apnea prolongada", v: "apnea_s", op: ">=", u: 20, win: 0, niv: "urgencia", acc: "Estimular y comprobar la vía aérea" },
    { id: "MON-07", n: "Frecuencia respiratoria baja", v: "fr", op: "<", u: 8, win: 120, niv: "precaucion", acc: "Valorar nivel de consciencia y ventilación" },
    { id: "MON-08", n: "Frecuencia respiratoria alta en reposo", v: "fr", op: ">", u: 28, win: 120, niv: "precaucion", acc: "Buscar causa: dolor, fiebre, hipoxemia", reposo: true },
    { id: "MON-11", n: "Tasa de dosis elevada", v: "rad", op: ">=", u: 150, win: 60, niv: "precaucion", acc: "Reducir exposición: zona más blindada de la cabina" },
    { id: "TEC-01", n: "Electrodo de ECG suelto", tec: "ecg", win: 60, niv: "aviso", acc: "Revisar la colocación de los electrodos" },
    { id: "TEC-02", n: "Sensor de SpO₂ sin señal", tec: "pleth", win: 60, niv: "aviso", acc: "Recolocar el sensor en el dedo" },
    { id: "TEC-03", n: "Lecturas en duda por movimiento", tec: "artefacto", win: 100, niv: "aviso", acc: "Quedarse quieto un minuto y revisar los sensores" }
  ];
  const OPS = { "<": (a, b) => a < b, "<=": (a, b) => a <= b, ">": (a, b) => a > b, ">=": (a, b) => a >= b, "==": (a, b) => a === b };
  const activas = new Map(), cuenta = {}, historial = [];
  const factor = () => cfg.demo && cfg.motor.acelerado ? (cfg.motor.factor || 120) : 1;
  const ventana = r => r.win ? Math.max(factor() > 1 ? 3 : 5, Math.round(r.win / factor())) : 0;
  const carrera = () => AH.perfil.rad.previa_mSv + AH.perfil.rad.mision_mSv;
  function valorDe(r) {
    if (r.v === "carrera") return carrera();
    if (r.v === "apnea_s") return V[r.v];
    return r.win ? media(r.v, ventana(r)) : V[r.v];
  }
  function criterio(r) {
    if (r.ritmo) return "ritmo detectado durante " + Math.max(3, Math.round(r.win / 20 / (factor() > 1 ? 2 : 1))) + " s";
    if (r.x) return "valor registrado " + r.op + " " + r.u;
    if (r.tec) return "calidad de señal";
    const w = ventana(r), dur = w >= 120 ? Math.round(w / 60) + " min" : w + " s";
    return (w ? "media de " + dur + " " : "") + r.op + " " + r.u + " " + UN[r.v];
  }
  function cumple(r) {
    if (r.reposo && V.actividad) return [false, null];
    if (r.fiable && !V.calidad[r.fiable]) return [null, null];          // con el sensor en duda no se afirma ni se descarta
    if (r.ritmo) return [V.ritmo === r.ritmo, null];
    if (r.tec) return [!!V.tec[r.tec], null];
    if (r.x) { const e = AH.extra ? AH.extra()[r.x] : null; return e == null ? [null, null] : [OPS[r.op](e, r.u), e]; }
    const x = valorDe(r);
    return x == null ? [null, null] : [OPS[r.op](x, r.u), x];
  }
  function abrir(a) {
    activas.set(a.id, a); historial.push(a); if (historial.length > 200) historial.shift();
    log("alerta", ICONO[a.nivel] + " " + TEXTO[a.nivel] + " · " + a.nombre + (a.valorTxt ? " · " + a.valorTxt : "") + " [" + (a.regla || a.id) + "]", a.nivel);
    emit("alerta", { accion: "abre", alerta: a });
  }
  function cerrar(id, motivo) {
    const a = activas.get(id); if (!a) return;
    activas.delete(id); a.hasta = Date.now();
    log("alerta", (motivo ? "Cerrada · " : "✓ Normalizado · ") + a.nombre + " [" + (a.regla || a.id) + "]" + (motivo ? " · " + motivo : ""), "ok");
    emit("alerta", { accion: "cierra", alerta: a });
  }
  const fmt = (v, x) => x == null ? "" : (["temp", "rad", "carrera", "co2", "pcab"].includes(v) ? x.toFixed(1) : Math.round(x)) + " " + UN[v];
  const sentido = r => r.op === "<" || r.op === "<=" ? -1 : r.op === ">" || r.op === ">=" ? 1 : 0;
  const dominada = r => r.id.startsWith("SP-") && sentido(r) !== 0 && REGLAS.some(o => o !== r && o.id.startsWith("SP-") && (o.v || o.x) === (r.v || r.x) && sentido(o) === sentido(r) && ORDEN[o.niv] > ORDEN[r.niv] && activas.has(o.id));
  function evaluar() {
    if (!cfg.motor.activo) return;
    const remoto = AH.Enlace && AH.Enlace.vinculado && cfg.motor.origen === "servidor";   // las reglas SP-xxxx las evalúa entonces el motor de Python
    for (const r of REGLAS) {
      if (remoto && r.id.startsWith("SP-")) { if (activas.has(r.id)) cerrar(r.id, "pasa al motor de Python"); continue; }
      const [c, x] = cumple(r), n = cuenta[r.id] = cuenta[r.id] || { si: 0, no: 0 };
      if (c === true) { n.si++; n.no = 0; } else if (c === false) { n.no++; n.si = 0; }
      const esperaAbrir = r.ritmo || r.tec ? Math.max(3, Math.round(r.win / 20 / (factor() > 1 ? 2 : 1))) : 1, esperaCerrar = cfg.demo && cfg.motor.acelerado ? 5 : 60;
      const a = activas.get(r.id);
      if (dominada(r)) { if (a) cerrar(r.id, "incluida en una alerta de mayor nivel"); continue; }     // una alerta por variable y sentido: la más grave, como en el motor
      if (!a && c === true && n.si >= esperaAbrir) abrir({ id: r.id, nombre: r.n, nivel: r.niv, variable: r.v || (r.x ? "" : r.ritmo ? "hr" : r.tec === "pleth" ? "spo2" : "hr"), valor: x, valorTxt: r.x ? (r.op === "==" ? "" : String(x)) : fmt(r.v, x), criterio: criterio(r), accion: r.acc, nota: r.nota || "", cat: r.cat || "", desde: Date.now(), reconocida: false, fuente: "integrado" });
      else if (a && c === true) { a.valor = x; if (!r.x) a.valorTxt = fmt(r.v, x); }
      else if (a && c === false && n.no >= esperaCerrar) cerrar(r.id);
    }
    // el modelo solo puede SUBIR el nivel, y lo hace como sugerencia a confirmar
    if (cfg.motor.modelo && Modelo.listo && !remoto) {
      const p = Modelo.predecir(V), id = "MOD-01", a = activas.get(id), q = p ? p.PRIORITARIA + p.INMEDIATA : 0;
      const yaHay = [...activas.values()].some(z => z.id !== id && ORDEN[z.nivel] >= ORDEN.precaucion);
      if (!a && p && q >= 0.55 && !yaHay && !V.actividad && V.calidad.pleth) abrir({ id, nombre: "Sugerencia del modelo: caso intermedio con riesgo de nivel prioritario", nivel: "precaucion", variable: "", valor: q,
        valorTxt: Math.round(q * 100) + " %", criterio: "puntuación del modelo ≥ 55 % sin regla activada", accion: "Confirmar las medidas: hay lecturas cerca de un umbral", nota: "sugerido por el modelo", desde: Date.now(), reconocida: false, fuente: "modelo" });
      else if (a && p) { a.valor = q; a.valorTxt = Math.round(q * 100) + " %"; if (q < 0.4 || yaHay) cerrar(id, yaHay ? "ya hay una regla activada" : ""); }
    }
  }
  // una alerta de bienestar nunca se muestra por delante de una alerta física de precaución o urgencia
  const lista = () => { const l = [...activas.values()], fis = l.some(a => a.cat !== "bienestar" && ORDEN[a.nivel] >= ORDEN.precaucion), b = a => fis && a.cat === "bienestar" ? 1 : 0;
    return l.sort((x, y) => b(x) - b(y) || ORDEN[y.nivel] - ORDEN[x.nivel] || x.desde - y.desde); };
  const Motor = AH.Motor = {
    REGLAS, ORDEN, ICONO, TEXTO, UN, NOM, activas, historial, lista, evaluar, criterio, carrera,
    nivel() { const l = lista(); return l.length ? l[0].nivel : "estable"; },
    // estado de un indicador para colorear su número: alerta activa > fuera de límites > estable
    estadoVar(v) {
      if (!cfg.motor.activo) return "nd";
      const vars = v === "pa" ? ["sbp", "dbp"] : v === "glu" ? ["cgm"] : v === "cab" ? ["co2", "pcab"] : [v]; let niv = "estable";
      for (const a of activas.values()) if (vars.includes(a.variable) && ORDEN[a.nivel] > ORDEN[niv]) niv = a.nivel;
      if (vars.every(k => V[k] == null)) return "nd";
      if (niv === "estable") for (const k of vars) { const L = cfg.limites[k]; if (L && V[k] != null && (V[k] < L[0] || V[k] > L[1])) niv = "precaucion"; }
      return niv === "aviso" ? "precaucion" : niv;
    },
    reconocer(id) { for (const a of activas.values()) if (!id || a.id === id) a.reconocida = true; log("alerta", "Alertas reconocidas por el usuario"); emit("alerta", { accion: "reconoce" }); },
    manual(a) { if (!activas.has(a.id)) abrir(Object.assign({ desde: Date.now(), reconocida: false, fuente: "manual", variable: "", criterio: "", accion: "", nota: "" }, a)); },
    cerrar, externa(accion, a) { if (accion === "abre") { if (!activas.has(a.id)) abrir(a); } else cerrar(a.id); },
    vaciar(motivo) { [...activas.keys()].forEach(id => cerrar(id, motivo)); Object.keys(cuenta).forEach(k => delete cuenta[k]); }
  };

  // ---- modelo destilado del ensamble del proyecto (bosque pequeño que imita sus puntuaciones por nivel)
  const M = window.AH_MODELO || null;
  const NIV_REGLA = { urgencia: "INMEDIATA", precaucion: "PRIORITARIA", aviso: "CONSULTA", estable: "SIN_ALERTA" };
  const Modelo = AH.Modelo = {
    listo: !!(M && M.arboles), meta: M ? { nombre: M.nombre, origen: M.origen, n: M.n_muestras, arboles: M.arboles.length } : null,
    NIVELES: ["SIN_ALERTA", "SEGUIMIENTO", "CONSULTA", "PRIORITARIA", "INMEDIATA"],
    predecir(x) {
      if (!this.listo || [x.spo2, x.hr, x.temp, x.sbp, x.dbp].some(z => z == null || isNaN(z))) return null;
      const e = [x.spo2, x.hr, x.temp, x.sbp, x.dbp], acc = [0, 0, 0, 0, 0];
      for (const a of M.arboles) { let k = 0; while (a.i[k] !== -1) k = e[a.f[k]] <= a.u[k] ? a.i[k] : a.d[k]; for (let j = 0; j < 5; j++) acc[j] += a.v[k][j]; }
      const s = acc.reduce((p, q) => p + q, 0) || 1, o = {}; this.NIVELES.forEach((n, j) => { o[n] = acc[j] / s; }); return o;
    },
    // lo que dirían solo las reglas del catálogo con estas lecturas (sin ventanas: lectura ya confirmada)
    reglas(x) {
      let niv = "estable"; const disparadas = [];
      for (const r of REGLAS) if (r.id.startsWith("SP-") && r.v && r.v in x && x[r.v] != null && OPS[r.op](x[r.v], r.u)) { disparadas.push(r); if (ORDEN[r.niv] > ORDEN[niv]) niv = r.niv; }
      return { nivel: NIV_REGLA[niv], disparadas };
    },
    fusion(x) {
      const p = this.predecir(x), r = this.reglas(x); if (!p) return { reglas: r, p: null, final: r.nivel, origen: "reglas" };
      const acum = [p.INMEDIATA, p.INMEDIATA + p.PRIORITARIA, p.INMEDIATA + p.PRIORITARIA + p.CONSULTA];
      const modelo = acum[0] >= 0.5 ? "INMEDIATA" : acum[1] >= 0.5 ? "PRIORITARIA" : acum[2] >= 0.5 ? "CONSULTA" : "SIN_ALERTA";
      const io = n => this.NIVELES.indexOf(n), sube = io(modelo) > io(r.nivel);
      return { reglas: r, p, modelo, final: sube ? modelo : r.nivel, origen: sube ? "modelo (sugerencia a confirmar)" : (r.disparadas.length ? "reglas" : "ninguno"), acum };
    }
  };

  on("segundo", evaluar);
  on("cfg", () => { if (!cfg.motor.activo && activas.size) Motor.vaciar("motor desconectado"); });
})();
