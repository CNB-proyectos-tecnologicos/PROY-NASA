/* Arranque. */
(function () {
  const { cfg, log } = AH;
  if (!cfg.demo) { ["ecg", "pleth", "art", "resp"].forEach(k => { AH.W[k].viva = false; }); }
  AH.Monitor.iniciar(); AH.Asistente.iniciar(); AH.Opciones.pintar();
  log("sesion", "Sesión iniciada · " + (cfg.demo ? "modo demo" : "señales reales") + " · visualización " + cfg.modo);
  if (cfg.motor.activo && cfg.motor.origen === "servidor") AH.Enlace.vincular().then(ok => { if (!ok) log("motor", "Sin servidor: las alertas las evalúa el motor integrado en la página", "info"); if (!cfg.demo) AH.Fuente.conectar(); });
  else if (!cfg.demo) AH.Fuente.conectar();
  window.addEventListener("error", e => log("error", (e.message || "error") + " · " + (e.filename || "").split("/").pop() + ":" + e.lineno, "urgencia"));
  window.addEventListener("unhandledrejection", e => log("error", "promesa: " + ((e.reason && (e.reason.message || e.reason.code)) || e.reason), "precaucion"));
})();
