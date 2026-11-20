---
name: traducir
description: Reserva y traduce al español los siguientes tramos pendientes de los comentarios bíblicos (opcionalmente de un comentario o libros concretos), los valida y los entrega a GitHub. Úsala cuando el usuario diga "traduce", "/traducir N", "/traducir N matthew-henry", "avanza con las traducciones" o en la corrida diaria.
argument-hint: "[número de tramos, por defecto 5] [comentario] [libros USFM] | citas N"
---

# Traducir comentarios bíblicos

Traduce N tramos (por defecto 5). Un tramo es un grupo de secciones de un archivo: la introducción de un libro o un capítulo, de hasta ~5,000 palabras del original.

Otros modelos pueden estar traduciendo al mismo tiempo desde otras carpetas: por eso **se reserva antes** y **se entrega al final** con los scripts, que se coordinan por GitHub.

**Tú no traduces en este contexto.** Repartes el trabajo a subagentes `traductor` y te encargas de reservar, revisar y entregar. Así cada tramo tiene su propio contexto limpio.

## Argumentos

- `citas N` (p. ej. `/traducir citas 10`): no traduce; corrige citas del versículo de traducciones antiguas. Sigue la sección «Cuando te pidan "corrige citas N"» de `AGENTS.md` (puedes repartir un archivo por subagente `traductor`, hasta 3 en paralelo, pasándole el archivo y la lista de citas a corregir).

- Un número: cuántos tramos.
- Un id de comentario (`tyndale`, `matthew-henry`; los de `plan.json`) → `--comentario <id>`.
- Códigos USFM de libros (`JHN`, `ROM`…) o nombres en español que puedas traducir a USFM → `--libro JHN,ROM`.
- Sin comentario ni libros: se usa la preferencia de la carpeta (`node scripts/soy.mjs` la muestra) o, si no hay, el orden de `plan.json`.

## Pasos

1. **Identidad.** `node scripts/soy.mjs`. Si la carpeta no tiene traductor asignado, detente y pide al usuario que corra `node scripts/soy.mjs <nombre> "<modelo>"`.

2. **Estado limpio.** `git status --porcelain`. Si hay cambios sin commit dentro de `traducciones/` que no son de una corrida tuya, detente y avisa: alguien está revisando a mano.

3. **Reservar.** `node scripts/reservar.mjs --cantidad N [--comentario <id>] [--libro <USFM,...>]`. Devuelve (en stdout) la lista JSON de tramos ya apartados para ti.
   - Lista vacía: informa que no queda nada pendiente para ese filtro y termina.
   - «Ya tienes una reserva vigente»: no uses `--forzar`; avisa al usuario (puede haber otra sesión en esta carpeta).

4. **Traducir.** Lanza un subagente `traductor` por tramo, **hasta 3 en paralelo** (nunca más). A cada uno pásale el JSON completo de su tramo, tal cual. Espera a que terminen los del grupo antes de lanzar el siguiente.
   **Al terminar cada grupo**, corre `node scripts/entregar.mjs --parcial`: sube lo hecho, conserva la reserva y deja ver el avance en https://comentarios.iglesy.net/avance/.

5. **Revisar resultados.** Cada subagente responde `OK <archivo>` o `FALLÓ <tramo>: <motivo>`, y puede traer términos nuevos.
   - Si un tramo falló, reinténtalo **una vez** con un subagente nuevo, pasándole el motivo. Si vuelve a fallar, borra su archivo en `trabajo/` (si quedó) y sigue.

6. **Términos.** Agrega los términos nuevos como filas a `glosario-propuestas/<quien>.md` (`<quien>` es el nombre de `soy.mjs`; si el archivo no existe, créalo con `| Inglés | Propuesta | Dónde apareció |` y `|---|---|---|`), sin repetir los que ya estén ahí o en `glosario.md`.

7. **Entregar.** `node scripts/entregar.mjs` (sin `--parcial`). Valida, hace commit, sube y libera la reserva. Córrelo siempre, aunque haya fallos. Si muestra archivos con ✗, corrígelos con un subagente o descártalos y vuelve a correrlo.

8. **Informe final** (breve, en español): tramos traducidos, los que fallaron y por qué, términos propuestos, y la salida de `node scripts/progreso.mjs`.

## Reglas

- Nunca edites `fuentes/`, `plan.json`, `comentarios.json`, `reservas/` ni los scripts durante una corrida.
- Nunca toques un archivo con `estado: revisado`.
- No hagas commit ni push a mano: lo hace `entregar.mjs`.
- Si algo falla de forma inesperada (sin red, error de un script), detente y explica el error en el informe; no improvises arreglos al proyecto.
