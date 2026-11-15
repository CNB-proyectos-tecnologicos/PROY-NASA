/* Aerospace Health · Monitor — núcleo: utilidades, almacenamiento, configuración, datos vivos y registro. */
"use strict";
const AH = window.AH = {};
(function () {
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fijar = (x, a, b) => Math.max(a, Math.min(b, x));
  const hora = t => new Date(t || Date.now()).toTimeString().slice(0, 8);
  const fecha = t => { const d = new Date(t || Date.now()); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const gauss = () => { let u = 0; for (let i = 0; i < 4; i++) u += Math.random(); return (u - 2) * 1.732; };
  const uid = () => Math.random().toString(36).slice(2, 9);

  // ---- almacenamiento por navegador (si no está disponible, queda en memoria)
  const mem = {}, PRE = "ah-monitor-v1:";
  function leer(k, def) { try { const s = localStorage.getItem(PRE + k); return s ? JSON.parse(s) : (k in mem ? mem[k] : def); } catch (e) { return k in mem ? mem[k] : def; } }
  function guardar(k, v) { mem[k] = v; try { localStorage.setItem(PRE + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: sigue en memoria */ } }
  function borrar(k) { delete mem[k]; try { localStorage.removeItem(PRE + k); } catch (e) { /* nada */ } }

  // ---- bus de eventos interno
  const oyentes = {};
  const on = (ev, fn) => { (oyentes[ev] = oyentes[ev] || []).push(fn); };
  const emit = (ev, d) => (oyentes[ev] || []).forEach(fn => { try { fn(d); } catch (e) { console.error(ev, e); } });

  // ---- configuración
  const DEF = {
    v: 2, modo: "estandar", demo: true, escenario: "normal",
    fuente: { tipo: "servidor", ws: "ws://127.0.0.1:8770", baud: 115200 }, servidor: "http://127.0.0.1:8777",
    idioma: "es", motor: { activo: true, origen: "servidor", acelerado: true, factor: 120, modelo: true },
    audio: { modo: "todo", volPulso: 0.5, volAlarma: 0.7, tonoSpo2: true, voz: true },
    limites: { hr: [50, 120], spo2: [92, 100], fr: [8, 28], sbp: [90, 160], dbp: [50, 100], temp: [35.5, 37.9], cgm: [70, 180], co2: [0, 3], pcab: [60, 103], rad: [0, 150] },
    rad: { perfil: "leo", altitud: 408, blindaje: 1 },
    llm: { proveedor: "groq", modelo: "openai/gpt-oss-120b", base_local: "http://127.0.0.1:11434/v1", modelo_local: "llama3.1" },
    vista: { rejilla: true }
  };
  function mezclar(def, x) {
    const o = Array.isArray(def) ? def.slice() : Object.assign({}, def);
    if (x && typeof x === "object") for (const k in x) {
      if (!(k in def)) continue;
      o[k] = def[k] && typeof def[k] === "object" && !Array.isArray(def[k]) ? mezclar(def[k], x[k]) : x[k];
    }
    return o;
  }
  const guardada = leer("cfg", {});
  const cfg = mezclar(DEF, guardada && guardada.v === 2 ? guardada : {});            // opciones de una versión anterior: se descartan
  const secretos = { clave: "" };                       // la clave de Groq no se guarda: vive solo mientras la página está abierta
  function guardarCfg(silencio) { guardar("cfg", cfg); if (!silencio) emit("cfg", cfg); }

  // ---- registro de actividad
  const registro = leer("log", []);
  let tGuardaLog = 0;
  function log(tipo, texto, nivel) {
    registro.push({ t: Date.now(), tipo, texto: String(texto), nivel: nivel || "info" });
    if (registro.length > 500) registro.splice(0, registro.length - 500);
    clearTimeout(tGuardaLog); tGuardaLog = setTimeout(() => guardar("log", registro), 800);
    emit("log");
  }

  // ---- datos vivos: valores numéricos, historia a 1 Hz y formas de onda
  const FS = 200;
  class Onda { constructor(seg) { this.b = new Float32Array(Math.round(seg * FS)); this.n = 0; this.viva = true; } push(v) { this.b[this.n % this.b.length] = v; this.n++; } get(i) { return this.b[((i % this.b.length) + this.b.length) % this.b.length]; } }
  const W = { ecg: new Onda(24), pleth: new Onda(24), art: new Onda(24), resp: new Onda(60) };
  const V = { hr: null, spo2: null, fr: null, sbp: null, dbp: null, map: null, temp: null, cgm: null, cgmTend: 0, co2: null, pcab: null, pio2: null, rad: null, alt: null, ritmo: "—", apnea_s: 0, paT: 0,
    calidad: { ecg: true, pleth: true }, tec: { ecg: false, pleth: false, artefacto: false }, actividad: false, dosisSesion: 0, fuenteHr: "ECG" };
  const HMAX = 1800, CLAVES_H = ["hr", "spo2", "fr", "sbp", "dbp", "temp", "cgm", "co2", "pcab", "rad", "alt"], H = { t: [] }, HPA = [];
  CLAVES_H.forEach(k => { H[k] = []; });
  function historiar() {
    H.t.push(Date.now()); CLAVES_H.forEach(k => H[k].push(V[k]));
    if (H.t.length > HMAX) Object.keys(H).forEach(k => H[k].shift());
  }
  // media de los últimos `seg` segundos; null si hay menos del 80 % de datos
  function media(k, seg) {
    const a = H[k], n = Math.min(a.length, Math.max(1, Math.round(seg))); let s = 0, c = 0;
    for (let i = a.length - n; i < a.length; i++) if (a[i] != null) { s += a[i]; c++; }
    return a.length >= n && c >= n * 0.8 ? s / c : null;
  }

  // ---- perfil (datos ficticios de demostración por defecto)
  const hoy = Date.now(), dia = 864e5;
  const PERFIL_DEMO = () => ({
    v: 2, demo: true, nombre: "Ana Rivas Molina", id: "CM-1", rol: "Comandante", nacimiento: "1982-03-14", sexo: "F", sangre: "O+", origen_etnico: "Mestiza (autodeclarado)",
    estatura_cm: 168, masa_kg: 63.4, masa_previa_kg: 65.1, temp_basal: 36.6,
    medidas: { cintura_cm: 74, cadera_cm: 97, cuello_cm: 32.5, brazo_cm: 27, muslo_cm: 54, pantorrilla_cm: 35.5, grasa_pct: 24 },
    ciclo: { aplica: true, fum: fecha(hoy - 9 * dia), duracion: 28, hormonal: false },
    mision: { nombre: "Expedición Órbita-1", dia: 87, duracion: 180 }, rad: { previa_mSv: 238.2, mision_mSv: 21.46 },
    antecedentes: [{ id: uid(), nombre: "Hipertensión arterial", estado: "En tratamiento", desde: "2019", nota: "Control con monoterapia" }, { id: uid(), nombre: "Litiasis renal", estado: "Antecedente", desde: "2016", nota: "Un episodio, sin recurrencia" }],
    medicacion: [{ id: uid(), nombre: "Losartán", pauta: "50 mg cada 24 h", para: "Hipertensión arterial" }],
    alergias: [{ id: uid(), sustancia: "Sulfonamidas", reaccion: "Exantema", severidad: "moderada" }],
    labs: {
      bh: [{ id: uid(), fecha: fecha(hoy - 100 * dia), nota: "Previa al vuelo", hb: 13.8, hto: 41.2, eri: 4.62, vcm: 89.2, hcm: 29.9, cmhc: 33.5, leu: 6.4, neu: 58, lin: 31, plaq: 248 },
        { id: uid(), fecha: fecha(hoy - 27 * dia), nota: "Día 60 de misión", hb: 12.4, hto: 37.1, eri: 4.18, vcm: 88.8, hcm: 29.7, cmhc: 33.4, leu: 5.9, neu: 61, lin: 28, plaq: 231 }],
      nut: [{ id: uid(), fecha: fecha(hoy - 100 * dia), nota: "Previa al vuelo", vitd: 34, ferritina: 62, hierro: 96, b12: 480, folato: 9.4, calcio: 9.4, albumina: 4.3, magnesio: 2.0, zinc: 88, sodio: 140, potasio: 4.2, creatinina: 0.78, hba1c: 5.2 },
        { id: uid(), fecha: fecha(hoy - 27 * dia), nota: "Día 60 de misión", vitd: 24, ferritina: 118, hierro: 82, b12: 455, folato: 8.1, calcio: 9.8, albumina: 4.1, magnesio: 1.9, zinc: 81, sodio: 139, potasio: 4.0, creatinina: 0.81, hba1c: 5.3 }],
      hor: [{ id: uid(), fecha: fecha(hoy - 27 * dia), nota: "Día 60 de misión", tsh: 2.1, t4l: 1.2, cortisol: 16.4, estradiol: 96, progesterona: 0.6, lh: 6.8, fsh: 5.9, testosterona: 31, insulina: 7.5 }]
    },
    manuales: [{ id: uid(), t: hoy - dia, masa_kg: 63.4, sbp: 118, dbp: 76, temp: 36.7, glucosa: 95, nota: "Glucosa capilar en ayuno" }],
    animo: [{ t: hoy - 3 * dia, prueba: "clima", datos: { cielo: 1, energia: 6 }, bandera: false }, { t: hoy - 2 * dia, prueba: "clima", datos: { cielo: 2, energia: 5 }, bandera: false },
      { t: hoy - 2 * dia + 3e6, prueba: "who5", datos: { who5: 64 }, bandera: false }, { t: hoy - dia, prueba: "clima", datos: { cielo: 1, energia: 7 }, bandera: false },
      { t: hoy - 2 * dia, prueba: "sueno", datos: { horas: 7.2, calidad: 3 }, bandera: false }, { t: hoy - dia, prueba: "sueno", datos: { horas: 6.8, calidad: 3 }, bandera: false }],
    consultas: [], notas: ""
  });
  let perfil = leer("perfil", null); if (!perfil || perfil.v !== 2) perfil = PERFIL_DEMO();   // un perfil de la versión anterior se sustituye
  const guardarPerfil = () => { guardar("perfil", perfil); emit("perfil"); };

  Object.assign(AH, { $, $$, esc, fijar, hora, fecha, gauss, uid, leer, guardar, borrar, on, emit, cfg, DEF, mezclar, secretos, guardarCfg, registro, log, FS, Onda, W, V, H, HPA, HMAX, historiar, media,
    PERFIL_DEMO, guardarPerfil });
  Object.defineProperty(AH, "perfil", { get: () => perfil, set: p => { perfil = p; } });

  // ---- puente con la página publicada en Claude (descargas, voz, dictado, modelo); fuera de ella todo esto es null
  AH.cap = {};
  AH.usar = nombre => { try { return window.claude && window.claude.use ? window.claude.use(nombre).catch(() => null) : Promise.resolve(null); } catch (e) { return Promise.resolve(null); } };
  ["downloads", "tts", "dictation", "sample"].forEach(n => AH.usar(n).then(x => { AH.cap[n] = x || null; emit("cap", n); }));

  // ---- descarga de archivos generados (o copia al portapapeles si el visor no deja descargar)
  AH.descargar = async function (nombre, texto) {
    const d = AH.cap.downloads;
    if (d) { try { await d.save({ filename: nombre, data: texto }); log("exportar", "Archivo guardado: " + nombre, "ok"); return true; } catch (e) { if (e && e.code === "declined") return false; } }
    try {
      const a = document.createElement("a"), url = URL.createObjectURL(new Blob([texto], { type: "application/octet-stream" }));
      a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
      log("exportar", "Archivo generado: " + nombre, "ok"); return true;
    } catch (e) { log("exportar", "No se pudo generar " + nombre + ": " + e.message, "precaucion"); return false; }
  };
  const csvCelda = x => { const s = x == null ? "" : String(x); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  AH.csv = (cab, filas) => [cab.join(",")].concat(filas.map(f => f.map(csvCelda).join(","))).join("\n");
})();
