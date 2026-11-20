# Comentarios bíblicos en español · instrucciones para agentes

Proyecto para traducir al español comentarios bíblicos de dominio público o con licencia abierta y publicarlos como una API estática (JSON) en comentarios.iglesy.net. Responde siempre en español.

Varios modelos (Claude, Codex, Gemini…) traducen **al mismo tiempo**, cada uno en **su propia copia del repo** con su propio traductor asignado (`.traductor.json`). Se coordinan con reservas en GitHub para no traducir lo mismo.

## Cómo está organizado

- `comentarios.json`: los comentarios (id, autor, licencias, atribución, si se publican).
- `plan.json`: orden de trabajo (fases por comentario y prioridad de libros).
- `guia-de-estilo.md` y `glosario.md`: reglas de traducción. Obligatorias.
- `instrucciones/tramo.md`: cómo se traduce un tramo, paso a paso.
- `traducciones/<comentario>/<LIBRO>/intro.md | <capítulo>.md`: las traducciones.
- `reservas/<quien>.json`: lo que cada traductor está traduciendo ahora.
- `glosario-propuestas/<quien>.md`: términos nuevos propuestos por cada traductor.
- `fuentes/` y `trabajo/` (ignorados): caché de originales y tramos en curso.

Estados de una traducción: `parcial` → `borrador` (completa, IA) → `revisado` (una persona la revisó).

## Cuando te pidan «traduce N» (o «traduce N de matthew-henry», «traduce N de Juan y Romanos»…)

1. **Identidad.** Corre `node scripts/soy.mjs`. Si dice que la carpeta no tiene traductor, **detente** y pide al usuario que lo configure (`node scripts/soy.mjs <nombre> "<modelo>"`); no lo inventes.
2. **Estado limpio.** `git status --porcelain`. Si hay cambios sin commit en `traducciones/` que no vienen de una corrida tuya anterior, detente y avisa (alguien revisa a mano).
3. **Reservar.** `node scripts/reservar.mjs --cantidad N`, más `--comentario <id>` y/o `--libro <USFM,USFM>` si te pidieron un autor o libros concretos. Te devuelve la lista JSON de tus tramos, ya apartados para ti. Si está vacía, informa que no queda nada pendiente para ese filtro y termina. Si dice que ya tienes una reserva vigente, **no** uses `--forzar` por tu cuenta: avisa al usuario.
4. **Traducir.** Para cada tramo de la lista, sigue `instrucciones/tramo.md`. Si tu herramienta permite subagentes, usa uno por tramo (hasta 3 en paralelo), cada uno con contexto limpio; si no, tradúcelos uno por uno. Si un tramo falla, reinténtalo una vez; si vuelve a fallar, borra su archivo en `trabajo/` y sigue.
   **Después de cada tramo** (o de cada grupo, si van en paralelo) corre `node scripts/entregar.mjs --parcial`: sube lo hecho, conserva tu reserva y deja ver el avance en https://comentarios.iglesy.net/avance/.
5. **Términos.** Si apareció algún término recurrente que no está en `glosario.md`, agrégalo como fila a `glosario-propuestas/<tu nombre>.md` (créalo con el encabezado `| Inglés | Propuesta | Dónde apareció |` / `|---|---|---|` si no existe), sin repetir.
6. **Entregar.** `node scripts/entregar.mjs` (sin `--parcial`). Valida, hace commit, sube y libera tu reserva. Córrelo **siempre** al final, aunque algo haya fallado. Si reporta archivos con ✗, corrígelos y vuelve a correrlo.
7. **Informe** breve: tramos traducidos, fallidos y por qué, términos propuestos, y la salida de `node scripts/progreso.mjs`.

## Cuando te pidan «corrige citas N»

Las traducciones anteriores a la revisión automática pueden tener citas del versículo que no siguen la RVA 1909. Corrígelas así (**una sola herramienta a la vez** hace esta tarea; no usa reservas):

1. `git pull --rebase --autostash`.
2. `node scripts/citas-pendientes.mjs --json N`: los N primeros archivos con citas por corregir y, para cada cita, qué dice la RVA.
3. En cada archivo, cambia **solo** cada cita señalada, como indica el mensaje y `instrucciones/tramo.md` (paso 4): palabras de la RVA, o cursiva si la nota explica justamente esa palabra. No toques nada más.
4. `node scripts/validar.mjs <archivo>` hasta que salga ✓.
5. `node scripts/entregar.mjs` y un informe breve (archivos corregidos; `node scripts/citas-pendientes.mjs` para ver cuántos quedan).

## Reglas

- No traduzcas nada que no esté en tu reserva.
- Nunca edites `fuentes/`, `plan.json`, `comentarios.json`, `reservas/` ni los scripts durante una corrida.
- Nunca toques un archivo con `estado: revisado` (`unir.mjs` lo impide de todos modos).
- No hagas commit ni push a mano: `entregar.mjs` lo hace. Nada que no pase `validar.mjs` se sube.
- Las citas del versículo van con las palabras de la RVA 1909 (`unir.mjs` y `entregar.mjs` lo revisan y rechazan lo que no cumpla). No las «arregles» con cursiva para pasar la revisión: la cursiva es solo para cuando la nota explica una palabra que la RVA traduce distinto.
- Si algo falla de forma inesperada (sin red, error de un script), detente y explica el error; no improvises arreglos al proyecto.
- Pruebas de los scripts: `node --test 'scripts/*.test.mjs'`.
