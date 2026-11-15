/* Mapa corporal del dolor: la persona señala dónde duele y cómo; se guarda con su región anatómica y su término médico,
   entra al paquete biométrico y puede enviarse al modelo o al médico en tierra. Un dolor torácico activo llega al motor. */
(function () {
  const { $, $$, esc, cfg, on, log, hora, fecha, uid } = AH, C = AH.Cuerpo, L = C.L;
  const nuevo = () => ({ region: null, irradia: [], tipo: null, nrs: null, inicio: null, tiempo: null, curso: null, asociados: [], nota: "" });
  let d = nuevo(), modoIrr = false;
  const lista = () => { const p = AH.perfil; p.dolor = p.dolor || []; return p.dolor; };
  AH.Dolor = { activos: () => lista().filter(x => x.activo), toracico: () => lista().some(x => x.activo && C.TORAX.includes(x.region)) };
  const ops = (o, sel, at) => Object.keys(o).map(k => '<button type="button" data-' + at + '="' + k + '" aria-pressed="' + (sel === k || (Array.isArray(sel) && sel.includes(k))) + '">' + esc(L(o[k])) + "</button>").join("");
  $("#rej-asistente").insertAdjacentHTML("beforeend", '<div class="tarj c12" id="tj-dolor"><h2>Mapa corporal del dolor <small>cada zona es una región anatómica; cada descripción, un término médico</small></h2><div class="dolor">' +
    '<div class="dolor-mapa"><figure><div id="dl-ant"></div><figcaption>Vista anterior</figcaption></figure><figure><div id="dl-post"></div><figcaption>Vista posterior</figcaption></figure></div>' +
    '<div class="dolor-form"><p class="dolor-reg" id="dl-reg"></p><div class="fila-btn"><button type="button" class="btn" id="dl-irr" aria-pressed="false">Marcar hacia dónde se irradia</button><button type="button" class="btn" id="dl-limpiar">Empezar de nuevo</button></div>' +
    '<h3>Cómo es el dolor</h3><div class="dolor-tipos" id="dl-tipos"></div><p class="nota" id="dl-termino"></p>' +
    '<h3>Intensidad de 0 a 10</h3><div class="escala" id="dl-nrs">' + Array.from({ length: 11 }, (_, i) => '<button type="button" data-n="' + i + '" aria-pressed="false">' + i + "</button>").join("") + "</div>" +
    '<div class="dolor-ops"><div><h3>Inicio</h3><div class="fichas" id="dl-inicio"></div></div><div><h3>Desde hace</h3><div class="fichas" id="dl-tiempo"></div></div><div><h3>Curso</h3><div class="fichas" id="dl-curso"></div></div><div><h3>Se acompaña de</h3><div class="fichas" id="dl-asoc"></div></div></div>' +
    '<label class="campo">Nota<input type="text" id="dl-nota" autocomplete="off" data-notr></label>' +
    '<h3>Descripción clínica</h3><p class="dolor-frase" id="dl-frase" data-notr></p>' +
    '<div class="fila-btn"><button type="button" class="btn pri" data-d="guardar">Guardar</button><button type="button" class="btn" data-d="modelo">Guardar y enviar al modelo</button><button type="button" class="btn" data-d="tierra">Guardar y enviar al médico en tierra</button></div><p class="nota" id="dl-estado"></p></div></div>' +
    '<h3>Dolores registrados</h3><div id="dl-lista"></div></div>');
  const completo = () => d.region && d.tipo && d.nrs != null;
  function pintar() {
    const m = {}; lista().filter(x => x.activo).forEach(x => { m[x.region] = "act"; }); d.irradia.forEach(i => { m[i] = "irr"; }); if (d.region) m[d.region] = "sel";
    $("#dl-ant").innerHTML = C.svg("a", m, true); $("#dl-post").innerHTML = C.svg("p", m, true);
    $("#dl-reg").innerHTML = d.region ? '<b data-notr>' + esc(C.termino(d.region)) + "</b>" + (d.irradia.length ? '<span data-notr> → ' + esc(d.irradia.map(C.termino).join("; ")) + "</span>" : "") : "Toca en el dibujo la zona donde duele.";
    $("#dl-irr").setAttribute("aria-pressed", String(modoIrr)); $("#dl-irr").disabled = !d.region;
    $("#dl-tipos").innerHTML = Object.keys(C.TIPOS).map(k => '<button type="button" data-tipo="' + k + '" aria-pressed="' + (d.tipo === k) + '">' + esc(L(C.TIPOS[k])) + "</button>").join("");
    $("#dl-termino").innerHTML = d.tipo ? 'Término médico: <b data-notr>' + esc(C.tipo(d.tipo)) + "</b>" : "";
    $$("#dl-nrs button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.n === d.nrs)));
    $("#dl-inicio").innerHTML = ops(C.INICIO, d.inicio, "inicio"); $("#dl-tiempo").innerHTML = ops(C.TIEMPO, d.tiempo, "tiempo"); $("#dl-curso").innerHTML = ops(C.CURSO, d.curso, "curso"); $("#dl-asoc").innerHTML = ops(C.ASOC, d.asociados, "asoc");
    $("#dl-frase").textContent = completo() ? C.frase(d) : ""; if (!completo()) $("#dl-frase").innerHTML = '<span class="nota">' + AH.tr("Señala la zona, el tipo de dolor y la intensidad.") + "</span>";
    $$("#tj-dolor [data-d]").forEach(b => { b.disabled = !completo(); });
    const a = lista().slice().reverse();
    $("#dl-lista").innerHTML = a.length ? '<div class="tabla"><table><thead><tr><th>Fecha</th><th>Descripción clínica</th><th>Estado</th><th></th></tr></thead><tbody>' + a.map(x => "<tr><td>" + fecha(x.t).slice(5) + " " + hora(x.t).slice(0, 5) + '</td><td data-notr style="white-space:normal">' + esc(C.frase(x)) + "</td><td>" + (x.activo ? "activo" : "resuelto " + hora(x.fin).slice(0, 5)) + "</td><td>" +
      (x.activo ? '<button type="button" class="btn" data-res="' + x.id + '">Marcar resuelto</button>' : "") + "</td></tr>").join("") + "</tbody></table></div>" : '<p class="nota">Sin registros.</p>';
  }
  function guardar() { const r = Object.assign({ id: uid(), t: Date.now(), activo: true }, d, { nota: $("#dl-nota").value.trim() }); lista().push(r); if (lista().length > 60) lista().shift(); AH.guardarPerfil();
    log("dolor", "Dolor registrado: " + C.frase(r), C.TORAX.includes(r.region) || r.nrs >= 7 ? "precaucion" : "info"); d = nuevo(); modoIrr = false; $("#dl-nota").value = ""; return r; }
  const SIS = () => AH.LLM.HEALER + " The astronaut reports PAIN, described with its anatomical region and its medical descriptor, followed by the current BIOMETRIC PACKAGE." + AH.LLM.LEYENDA +
    " Answer in plain text without markdown with these headed sections: 1) WHAT THIS PAIN SUGGESTS in the spaceflight context, relating it to the measured values. 2) RED FLAGS to rule out now. 3) CHECK NOW on board, in order. 4) WHEN TO CALL the flight surgeon. Do not give a definitive diagnosis.";
  $("#tj-dolor").addEventListener("click", async e => {
    const t = e.target, z = t.closest("[data-reg]"), bt = t.closest("button"); if (z) { const id = z.dataset.reg; if (modoIrr && d.region) { if (id !== d.region) d.irradia = d.irradia.includes(id) ? d.irradia.filter(x => x !== id) : d.irradia.concat(id).slice(-3); } else { d.region = id; d.irradia = d.irradia.filter(x => x !== id); } return pintar(); }
    if (!bt) return; const ds = bt.dataset;
    if (bt.id === "dl-irr") modoIrr = !modoIrr; else if (bt.id === "dl-limpiar") { d = nuevo(); modoIrr = false; $("#dl-nota").value = ""; $("#dl-estado").textContent = ""; }
    else if (ds.tipo) d.tipo = ds.tipo; else if (ds.n != null && bt.closest("#dl-nrs")) d.nrs = +ds.n; else if (ds.inicio) d.inicio = ds.inicio; else if (ds.tiempo) d.tiempo = ds.tiempo; else if (ds.curso) d.curso = ds.curso;
    else if (ds.asoc) d.asociados = d.asociados.includes(ds.asoc) ? d.asociados.filter(x => x !== ds.asoc) : d.asociados.concat(ds.asoc);
    else if (ds.res) { const x = lista().find(y => y.id === ds.res); if (x) { x.activo = false; x.fin = Date.now(); AH.guardarPerfil(); log("dolor", "Dolor marcado como resuelto: " + C.termino(x.region)); } }
    else if (ds.d && completo()) {
      const r = guardar(), f = C.frase(r), est = $("#dl-estado"); pintar();
      if (ds.d === "guardar") est.textContent = AH.tr("Guardado. Entra al paquete biométrico") + (C.TORAX.includes(r.region) ? AH.tr(" y, por ser torácico, al motor de alertas") : "") + ".";
      else if (ds.d === "modelo") { est.textContent = AH.tr("Guardado. Enviado al modelo: la respuesta aparece en el asistente."); await AH.Asistente.consulta(AH.tr("Dolor") + ": " + f, SIS(), "PAIN\n" + C.compacto(r) + (r.nota ? "\nNOTE " + r.nota : "") + "\n\nBIOMETRIC PACKAGE\n" + AH.LLM.paquete(), 1500); }
      else if (ds.d === "tierra") { try { await AH.Tierra.enviar(AH.tr("Dolor") + ": " + f + "\n" + AH.LLM.paquete(), "dolor", { dolor: r }); est.textContent = AH.tr("Guardado y enviado al médico en tierra."); } catch (err) { est.textContent = AH.tr("Guardado. No se pudo enviar a tierra") + ": " + (err.message || err); } }
      return;
    }
    pintar();
  });
  $("#tj-dolor").addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("[data-reg]")) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
  on("panel", t => { if (t === "asistente") pintar(); }); on("perfil", pintar);
  AH.Dolor.abrir = () => { AH.irA("asistente"); pintar(); $("#tj-dolor").scrollIntoView({ block: "start" }); };
  $("#btn-dolor").addEventListener("click", AH.Dolor.abrir);
  pintar();
})();
