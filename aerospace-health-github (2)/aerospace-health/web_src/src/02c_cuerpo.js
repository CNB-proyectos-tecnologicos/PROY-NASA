/* Mapa corporal del dolor: cada zona del dibujo corresponde a una región anatómica concreta y cada descripción
   del dolor a un término médico. Lo usan el monitor (para registrar) y la consola de tierra (para mostrar). */
(function () {
  const en = () => (AH.cfg ? AH.cfg.idioma : AH.idioma) === "en", L = p => p[en() ? 1 : 0];
  // id: [vista, forma, término ES, término EN, lateralidad]; forma: [x, y, ancho, alto] o ["e", cx, cy, rx, ry]. Lado "d" = derecho del paciente.
  const R = {}, lado = (id, v, f, es, enT) => { const esp = f[0] === "e" ? ["e", 200 - f[1], f[2], f[3], f[4]] : [200 - f[0] - f[2], f[1], f[2], f[3]];
    // en la vista anterior el lado derecho del paciente queda a la izquierda del dibujo; en la posterior, al revés
    const m = /^(Carpo|Dorso del pie)/.test(es), D = m ? " derecho" : " derecha", I = m ? " izquierdo" : " izquierda";
    R[id + "-" + (v === "a" ? "d" : "i")] = [v, f, es + (v === "a" ? D : I), (v === "a" ? "Right " : "Left ") + enT]; R[id + "-" + (v === "a" ? "i" : "d")] = [v, esp, es + (v === "a" ? I : D), (v === "a" ? "Left " : "Right ") + enT]; };
  const uno = (id, v, f, es, enT) => { R[id] = [v, f, es, enT]; };
  // ---- vista anterior
  uno("a-facial", "a", [76, 24, 48, 32], "Región facial", "Facial region"); uno("a-frontal", "a", [76, 4, 48, 20], "Región frontal", "Frontal region"); lado("a-temporal", "a", [76, 23, 11, 15], "Región temporal", "temporal region"); uno("a-cervical", "a", [90, 54, 20, 14], "Región cervical anterior", "Anterior cervical region");
  lado("a-deltoidea", "a", [52, 68, 20, 24], "Región deltoidea (hombro)", "deltoid region (shoulder)");
  R["a-pectoral-d"] = ["a", [72, 68, 21, 38], "Región pectoral derecha", "Right pectoral region"]; uno("a-esternal", "a", [93, 68, 14, 38], "Región esternal (retroesternal)", "Sternal (retrosternal) region");
  uno("a-precordial", "a", [107, 68, 21, 38], "Región precordial", "Precordial region");
  R["a-hipocondrio-d"] = ["a", [72, 106, 19, 24], "Hipocondrio derecho", "Right hypochondrium"]; uno("a-epigastrio", "a", [91, 106, 18, 24], "Epigastrio", "Epigastrium"); R["a-hipocondrio-i"] = ["a", [109, 106, 19, 24], "Hipocondrio izquierdo", "Left hypochondrium"];
  R["a-flanco-d"] = ["a", [72, 130, 19, 24], "Flanco derecho (región lateral derecha)", "Right flank (right lumbar region of the abdomen)"]; uno("a-umbilical", "a", [91, 130, 18, 24], "Región umbilical (mesogastrio)", "Umbilical region");
  R["a-flanco-i"] = ["a", [109, 130, 19, 24], "Flanco izquierdo (región lateral izquierda)", "Left flank (left lumbar region of the abdomen)"];
  R["a-fosa-d"] = ["a", [72, 154, 19, 24], "Fosa ilíaca derecha", "Right iliac fossa"]; uno("a-hipogastrio", "a", [91, 154, 18, 24], "Hipogastrio (región suprapúbica)", "Hypogastrium (suprapubic region)"); R["a-fosa-i"] = ["a", [109, 154, 19, 24], "Fosa ilíaca izquierda", "Left iliac fossa"];
  lado("a-braquial", "a", [52, 92, 18, 48], "Región braquial anterior", "anterior brachial region (arm)"); lado("a-cubital", "a", [52, 140, 18, 16], "Fosa cubital (codo)", "cubital fossa (elbow)");
  lado("a-antebraquial", "a", [50, 156, 18, 48], "Región antebraquial anterior", "anterior antebrachial region (forearm)"); lado("a-carpo", "a", [50, 204, 18, 12], "Carpo anterior (muñeca)", "anterior carpal region (wrist)");
  lado("a-palma", "a", ["e", 58, 230, 12, 14], "Palma de la mano", "palm of the hand");
  lado("a-femoral", "a", [74, 178, 24, 84], "Región femoral anterior (muslo)", "anterior femoral region (thigh)"); lado("a-rotuliana", "a", [76, 262, 22, 20], "Región rotuliana (rodilla)", "patellar region (knee)");
  lado("a-crural", "a", [78, 282, 20, 78], "Región crural anterior (pierna)", "anterior crural region (leg)"); lado("a-tarso", "a", [80, 360, 18, 14], "Región maleolar (tobillo)", "malleolar region (ankle)");
  lado("a-pie", "a", [74, 374, 24, 18], "Dorso del pie", "dorsum of the foot");
  // ---- vista posterior
  uno("p-occipital", "p", ["e", 100, 30, 22, 24], "Región occipital", "Occipital region"); uno("p-cervical", "p", [90, 54, 20, 14], "Región cervical posterior (nuca)", "Posterior cervical region (nape)");
  lado("p-deltoidea", "p", [52, 68, 20, 24], "Región deltoidea posterior", "posterior deltoid region"); lado("p-escapular", "p", [72, 68, 22, 36], "Región escapular", "scapular region");
  uno("p-toracica", "p", [94, 68, 12, 50], "Región vertebral torácica (interescapular)", "Thoracic vertebral (interscapular) region"); lado("p-infraescapular", "p", [72, 104, 22, 26], "Región infraescapular", "infrascapular region");
  uno("p-vlumbar", "p", [94, 118, 12, 40], "Región vertebral lumbar", "Lumbar vertebral region"); lado("p-lumbar", "p", [72, 130, 22, 28], "Región lumbar (fosa renal)", "lumbar region (renal angle)");
  lado("p-glutea", "p", [72, 158, 27, 32], "Región glútea", "gluteal region"); uno("p-sacra", "p", [92, 158, 16, 20], "Región sacra", "Sacral region");
  lado("p-braquial", "p", [52, 92, 18, 48], "Región braquial posterior", "posterior brachial region (arm)"); lado("p-olecraneana", "p", [52, 140, 18, 16], "Región olecraneana (codo)", "olecranon region (elbow)");
  lado("p-antebraquial", "p", [50, 156, 18, 48], "Región antebraquial posterior", "posterior antebrachial region (forearm)"); lado("p-dorso-mano", "p", ["e", 58, 226, 12, 20], "Dorso de la mano", "dorsum of the hand");
  lado("p-femoral", "p", [74, 190, 24, 72], "Región femoral posterior (muslo)", "posterior femoral region (thigh)"); lado("p-poplitea", "p", [76, 262, 22, 20], "Fosa poplítea", "popliteal fossa");
  lado("p-sural", "p", [78, 282, 20, 78], "Región sural (pantorrilla)", "sural region (calf)"); lado("p-calcanea", "p", [78, 360, 20, 32], "Región calcánea (talón)", "calcaneal region (heel)");
  const TORAX = ["a-precordial", "a-esternal", "a-pectoral-d"];
  // clave: [cómo lo dice la persona ES, EN, término médico ES, EN]
  const TIPOS = {
    opresivo: ["Aprieta, como un peso o una prensa", "Squeezing, like a weight or a vice", "dolor opresivo (constrictivo)", "pressure-like (constrictive) pain"],
    punzante: ["Pincha, como una aguja o una puñalada", "Stabbing, like a needle or a knife", "dolor punzante (lancinante)", "stabbing (lancinating) pain"],
    urente: ["Quema, arde", "Burning", "dolor urente", "burning pain"],
    colico: ["Viene y va en oleadas, retortijón", "Comes and goes in waves, griping", "dolor cólico", "colicky pain"],
    pulsatil: ["Late con el pulso", "Throbs with the pulse", "dolor pulsátil", "throbbing (pulsatile) pain"],
    sordo: ["Sordo, continuo, difícil de señalar", "Dull, constant, hard to pinpoint", "dolor sordo (gravativo)", "dull aching pain"],
    fulgurante: ["Como una descarga eléctrica", "Like an electric shock", "dolor fulgurante (paroxístico, de tipo neuropático)", "shooting, electric shock-like (neuropathic-type) pain"],
    parestesia: ["Hormigueo o adormecimiento", "Tingling or numbness", "parestesia", "paresthesia"],
    desgarrante: ["Como si algo se desgarrara", "As if something were tearing", "dolor desgarrante", "tearing pain"],
    terebrante: ["Taladra, perfora", "Boring, drilling", "dolor terebrante", "boring (terebrant) pain"],
    espasmodico: ["Calambre, espasmo del músculo", "Cramp, muscle spasm", "dolor espasmódico (calambre muscular)", "cramping (spasmodic) pain"],
    pleuritico: ["Aumenta al respirar hondo o toser", "Worse on deep breathing or coughing", "dolor pleurítico", "pleuritic pain"],
    palpacion: ["Duele al tocar o presionar", "Hurts when touched or pressed", "dolor a la palpación (hiperalgesia)", "tenderness on palpation (hyperalgesia)"],
    alodinia: ["Duele con el simple roce", "Hurts with a light touch", "alodinia", "allodynia"],
    mecanico: ["Duele al mover la articulación", "Hurts when moving the joint", "dolor mecánico (artralgia con el movimiento)", "mechanical pain (arthralgia on movement)"]
  };
  const INICIO = { subito: ["súbito", "sudden"], gradual: ["gradual", "gradual"] }, CURSO = { continuo: ["continuo", "continuous"], intermitente: ["intermitente", "intermittent"], paroxistico: ["paroxístico (en crisis)", "paroxysmal"] };
  const TIEMPO = { m10: ["menos de 10 min", "less than 10 min"], m30: ["10 a 30 min", "10 to 30 min"], m60: ["30 a 60 min", "30 to 60 min"], h6: ["1 a 6 h", "1 to 6 h"], h24: ["6 a 24 h", "6 to 24 h"], d: ["más de 24 h", "more than 24 h"] };
  const ASOC = { nauseas: ["náuseas", "nausea"], disnea: ["disnea", "dyspnea"], diaforesis: ["diaforesis", "diaphoresis"], mareo: ["mareo o presíncope", "dizziness or presyncope"], fiebre: ["sensación febril", "feverishness"], palpitaciones: ["palpitaciones", "palpitations"] };
  const grado = n => n == null ? "" : n === 0 ? L(["sin dolor", "no pain"]) : n <= 3 ? L(["leve", "mild"]) : n <= 6 ? L(["moderado", "moderate"]) : L(["intenso", "severe"]);
  const termino = id => (R[id] ? L([R[id][2], R[id][3]]) : id), tipo = k => (TIPOS[k] ? L([TIPOS[k][2], TIPOS[k][3]]) : k);
  // descripción clínica en una frase
  function frase(d) {
    const t = tipo(d.tipo), may = t.charAt(0).toUpperCase() + t.slice(1), min = s => s.charAt(0).toLowerCase() + s.slice(1), x = [];
    x.push(may + L([" en ", " in the "]) + min(termino(d.region)));
    if (d.nrs != null) x.push(L(["intensidad ", "intensity "]) + d.nrs + "/10 (" + grado(d.nrs) + ")");
    if (d.inicio && INICIO[d.inicio]) x.push(L(["inicio ", "onset "]) + L(INICIO[d.inicio]) + (d.tiempo && TIEMPO[d.tiempo] ? L([", hace ", ", "]) + L(TIEMPO[d.tiempo]) + L(["", " ago"]) : ""));
    if (d.curso && CURSO[d.curso]) x.push(L(["curso ", "course "]) + L(CURSO[d.curso]));
    if (d.irradia && d.irradia.length) x.push(L(["irradiado a ", "radiating to the "]) + d.irradia.map(i => min(termino(i))).join(L([" y ", " and "])));
    if (d.asociados && d.asociados.length) x.push(L(["asociado a ", "associated with "]) + d.asociados.map(a => L(ASOC[a] || [a, a])).join(", "));
    return x.join("; ") + "." + (d.nota ? " " + L(["Nota: ", "Note: "]) + d.nota : "");
  }
  // línea compacta para el paquete biométrico (siempre en inglés médico abreviado)
  function compacto(d) {
    return (R[d.region] ? R[d.region][3] : d.region) + " · " + (TIPOS[d.tipo] ? TIPOS[d.tipo][3] : d.tipo) + " NRS" + d.nrs + (d.inicio ? " " + INICIO[d.inicio][1] : "") + (d.tiempo ? " " + TIEMPO[d.tiempo][1] : "") + (d.curso ? " " + CURSO[d.curso][1] : "") +
      (d.irradia && d.irradia.length ? " rad:" + d.irradia.map(i => R[i] ? R[i][3] : i).join("+") : "") + (d.asociados && d.asociados.length ? " +" + d.asociados.map(a => (ASOC[a] || [a, a])[1]).join(",") : "");
  }
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // dibujo de una vista; marcas = { idRegion: "sel" | "irr" | "act" }
  let nSvg = 0;
  function svg(vista, marcas, pulsable) {
    marcas = marcas || {}; let h = ""; const clip = "ah-cab-" + (++nSvg);
    Object.keys(R).forEach(id => { const r = R[id]; if (r[0] !== vista) return; const f = r[1], cls = "zona-c" + (marcas[id] ? " " + marcas[id] : ""), at = ' class="' + cls + '" data-reg="' + id + '"' + (pulsable ? ' tabindex="0" role="button"' : "") + ' aria-label="' + esc(termino(id)) + '"' + (/^a-(frontal|temporal|facial)/.test(id) ? ' clip-path="url(#' + clip + ')"' : "");
      h += (f[0] === "e" ? '<ellipse cx="' + f[1] + '" cy="' + f[2] + '" rx="' + f[3] + '" ry="' + f[4] + '"' : '<rect x="' + f[0] + '" y="' + f[1] + '" width="' + f[2] + '" height="' + f[3] + '" rx="3"') + at + "><title>" + esc(termino(id)) + "</title>" + (f[0] === "e" ? "</ellipse>" : "</rect>"); });
    const izq = vista === "a" ? L(["D", "R"]) : L(["I", "L"]), der = vista === "a" ? L(["I", "L"]) : L(["D", "R"]);
    return '<svg class="mapa-cuerpo" viewBox="36 0 128 412" role="img" aria-label="' + esc(vista === "a" ? L(["Vista anterior", "Anterior view"]) : L(["Vista posterior", "Posterior view"])) + '"><defs><clipPath id="' + clip + '"><ellipse cx="100" cy="30" rx="23" ry="26"/></clipPath></defs>' + h +
      '<text x="42" y="404" class="cuerpo-lado">' + izq + '</text><text x="152" y="404" class="cuerpo-lado">' + der + "</text></svg>";
  }
  AH.Cuerpo = { R, TIPOS, INICIO, CURSO, TIEMPO, ASOC, TORAX, termino, tipo, grado, frase, compacto, svg, L };
})();
