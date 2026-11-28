---
name: colaborar
description: Para voluntarios. Toma un lote libre de comentarios bíblicos (o retoma el que dejaste a medias), lo traduce al español con subagentes y lo entrega como PR a GitHub. Úsala cuando el usuario escriba "/colaborar", "quiero colaborar", "toma un lote", "sigue con mi lote" o "traduce otro lote" en una carpeta que es un fork del proyecto.
argument-hint: "[comentario o libros, opcional]"
---

# Colaborar como voluntario

Te habla una persona voluntaria, quizá no técnica. Háblale en español sencillo, sin jerga: nada de «rebase», «remoto» ni «stdout». Tú haces todo; esa persona solo aprueba lo que Claude le pida.

Un **lote** son unos capítulos de un libro (hasta ~10,000 palabras del original). Se reserva con un PR en borrador en GitHub y se entrega marcando ese PR listo para revisar. **Tú no traduces en este contexto:** repartes cada tramo a un subagente `traductor` y te encargas de tomar, revisar y entregar.

## 1. Modelo

Di cuál es tu ID de modelo exacto (lo tienes en tu configuración, p. ej. `claude-opus-5-5`). Solo se aceptan los de `modelos-permitidos.json`: **Claude Opus o Sonnet 5.5 o superior, o Fable**. Si el tuyo no está, detente y explícale cómo cambiarlo: en la app de escritorio, el selector de modelo junto al cuadro de mensaje; en la terminal, `/model`. No sigas con otro modelo.

## 2. Carpeta lista

`node scripts/unirme.mjs --revisar`. Si marca algo con ✗, corre `node scripts/unirme.mjs` (sin `--revisar`) y, si aún falta algo, explícale en sencillo qué hacer (por ejemplo, iniciar sesión con `gh auth login --web`). Si la carpeta no es un fork del proyecto, detente: esta skill es solo para voluntarios.

## 3. Tomar o retomar un lote

- Si existe `.lote.json`, ya tiene un lote a medias: léelo y **retómalo** (paso 4). Díselo: «Seguimos con tu lote <nombre>».
- Si no, `node scripts/tomar.mjs --modelo <tu ID>` (más `--comentario <id>` o `--libro <USFM,...>` si el usuario pidió algo concreto). Muestra el nombre del lote y el enlace del PR.
  - Si responde `null`: no queda nada libre para ese filtro; díselo y termina.
  - Si falla, explica el error en sencillo y detente. No improvises arreglos.

## 4. Traducir el lote

Repite hasta que no quede nada:

1. `node scripts/siguiente.mjs --lote --limite 3`. Si la lista está vacía, el lote está completo: ve al paso 6.
2. Lanza un subagente `traductor` por tramo, **hasta 3 en paralelo**, pasándole a cada uno el JSON completo de su tramo, tal cual, sin instrucciones extra.
3. Cada subagente responde `OK <archivo>` o `FALLÓ <tramo>: <motivo>`, y puede traer términos nuevos.
   - Si uno falló, reinténtalo **una vez** con un subagente nuevo, pasándole el motivo. Si vuelve a fallar, borra su archivo en `trabajo/` y sigue.
   - Revisa cada archivo `OK` contra `node scripts/fuente.mjs`: citas iniciales que el original no tiene, notas reemplazadas por el versículo, calcos y frases sin sentido. Corrige y valida con `node scripts/validar.mjs <archivo>`.
4. `node scripts/entregar.mjs --parcial`: guarda el avance en GitHub y mantiene la reserva viva.
5. Cuéntale en una línea cómo va («Llevamos 3 de 7 capítulos»).

Si el uso de Claude se le acaba a la mitad, no pasa nada: lo hecho ya está guardado. Dile que vuelva a escribir `/colaborar` cuando pueda, **antes de 24 horas**, o el lote quedará libre para otro.

## 5. Términos

Agrega los términos nuevos como filas a `glosario-propuestas/<quien>.md` (`<quien>` sale de `node scripts/soy.mjs`; si el archivo no existe, créalo con `| Inglés | Propuesta | Dónde apareció |` y `|---|---|---|`), sin repetir los que ya estén ahí, en `glosario.md` o en `nombres.md`.

## 6. Entregar

`node scripts/entregar.mjs` (sin `--parcial`). Marca el PR listo para revisar; lo que no se alcanzó a traducir queda libre para otro. Córrelo siempre al terminar, aunque algo haya fallado. Si muestra archivos con ✗, corrígelos con un subagente o descártalos y vuelve a correrlo.

## 7. Despedida

En dos o tres líneas sencillas: qué tradujo, el enlace del PR, que el equipo lo revisará antes de publicarlo, y si quiere tomar otro lote (si dice que sí, vuelve al paso 3).

## Reglas

- Nunca edites `fuentes/`, `plan.json`, `comentarios.json`, `modelos-permitidos.json`, `reservas/`, `.github/` ni los scripts.
- Nunca toques un archivo con `estado: revisado`.
- No hagas commit, push ni cambies de rama a mano: lo hacen `tomar.mjs` y `entregar.mjs`.
- No pidas ni escribas contraseñas o tokens. Si GitHub pide iniciar sesión, el voluntario lo hace en el navegador.
