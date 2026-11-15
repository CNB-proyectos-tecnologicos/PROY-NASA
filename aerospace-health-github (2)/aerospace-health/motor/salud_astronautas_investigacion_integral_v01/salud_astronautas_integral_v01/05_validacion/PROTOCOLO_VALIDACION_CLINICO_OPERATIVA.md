# Protocolo de validación, seguridad y evaluación de errores

## Fases

1. **Curaduría bibliográfica:** por cada regla conservar URL, autor, año, localizador, texto corto, copia de la unidad, jurisdicción, población aplicable y versión de norma. Dos revisores independientes cotejan límites de NASA, ADA, WHO y consenso SANS, y corrigen errores de transcripción.
2. **Análisis de riesgo:** clasificar peligros del motor en fallo de sensor, dato faltante, omisión de alerta, falsa alerta, presión de operación, fuga de datos y tratamiento sugerido. FMEA/STPA con dirección medicina de vuelo y seguridad misión.
3. **Laboratorio/simulador:** reproducir trazas de CO2, presión, dosis, horario, ejercicio, CGM; verificar unidades y ventanas; perturbar clock drift, lagunas, sensor saturado y límites en borde.
4. **Análogos terrestres:** cama inclinada/head-down tilt, aislamiento, EVA simuladas, cámaras hipobáricas en centros especializados, centrifugación, recondicionamiento. **No equivalente a validación en órbita**.
5. **Retrospectiva multicohorte:** control de misión/crew/fecha, cross-validation leave-one-mission-out, auditoría de event-label leakage; evaluar sesgo de verificación (OCT, eco sólo en seleccionados).
6. **Prospectiva en shadow mode:** el motor produce recomendaciones que NO llegan a operación y se comparan con evaluación médica y controles. Consentimiento, privacidad y revisión ética.
7. **Despliegue supervisado por Flight Surgeon:** sólo normas operativas homologadas y recomendaciones seguras habilitadas, nunca prescripción autónoma; escalamiento y rollback.

## Métricas obligatorias por regla

- Denominador preciso `tripulante-día`, `turno de EVA`, `hora de cabina` según dominio.
- Sensibilidad, especificidad, PPV, NPV, LR+/LR− (cuando hay etiquetas de eventos verificadas y suficiente prevalencia).
- Falsas alarmas por 100 astronauta-días y por misión; latencia de aviso; estabilidad temporal; fatiga de alertas; número de veces que se solicita verificación redundante.
- Subgrupos por misión, instrumentación, perfil EVA, edad/sexo, pigmentación, ciclo/terapia hormonal si hay datos y consentimiento; no sobreinterpretar intervalos anchos.
- Para probabilidades calibradas: Brier, calibración intercepto-pendiente, discriminación AUROC/AUPRC, IC bootstrap por astronauta/misión, drift.
- En exposición ambiental: tasa detección límite y cumplimiento exacto de ventanas y umbrales, fallo fail-safe ECLSS y exposición de dosis acumulada.
- Para VTE 2026: *no* declarar AUROC sin base de datos; comparar puntuación con seguimiento, ultrasonido, desenlace confirmado, complicaciones y calidad del dímero D.

## Conjuntos de casos sintéticos

1. CO₂: 3.000= compliant, 3.001=excede, 1h de 59min válidos debe abstener si QA requiere hora completa.
2. Pcabina: 34.5kPa fuera por desigualdad estricta; 103.0 dentro; 103.001 fuera.
3. Dosis carrera: 599.9 cumple, 600 incumple, mGy introducido donde se esperan mSv => `ERROR_UNIDAD`.
4. Masa inercial: dato de balanza gravitacional en órbita => `DATO_INVALIDO`.
5. PA sin manguito sin ensayo clínico validado => suspender regla diagnóstica.
6. CGM: <54 pero sensor artefactado => verificar con método independiente; síntomas/urgencia guían sin demorar seguridad.
7. SANS: ΔTRT=19.99 sin umbral; 20 clase A por OCT; 55 clase B; sin OCT => `NO_CALCULABLE`.
8. VTE: edad 52 añade 2, no 1+2; doble criterio estasis/flujo retrógrado suma 4 sólo una vez.
9. Medicación hormonal desconocida VTE => No calcular puntaje total de 0 por defecto.
10. Caída sistólica 20mmHg sin transición a bipedestación => NO clasificar ortostatismo.
11. Dosimetría GCR tasa 1.31mSv/día para hábitat de 30d => estándar V1 4033 de >60d no aplica.
12. Límite ruido 105 dBA aplica launch/entry, no necesariamente toda la estancia; ruido impulsivo fuera de fórmula.

## Criterios de aceptación

Antes de habilitar una regla clínica, exigir: fuente verificada, dispositivo válido, unidad validada, ventana temporal definida, gating y acción autorizada, evaluación de daños/falsas alarmas. Si no hay ground truth ni cohorte, conservar como **vigilancia descriptiva o hipótesis**. El motor demostrado aquí es un prototipo y NO debe usarse para seguridad de misión.

## Gobernanza y privacidad

Datos de salud y sensores son de alta sensibilidad: minimización, cifrado, segregación por persona/misión, roles, consentimiento, vencimiento, propósito limitado, acceso auditado y revisión de normativa aplicable (NASA/JSC, país de operación, programa comercial). Desacoplar seguimiento psicológico de supervisión laboral; uso discriminatorio de fase menstrual o origen étnico queda proscrito. Un criterio NASA no sustituye aprobación aeronáutica, ética ni regulatoria del software.
