---
name: traducir
description: Traduce al español los siguientes tramos pendientes de los comentarios bíblicos según plan.json, los valida y hace commit. Úsala cuando el usuario diga "traduce", "/traducir N", "avanza con las traducciones" o en la corrida diaria.
argument-hint: "[número de tramos, por defecto 5]"
---

# Traducir comentarios bíblicos

Traduce N tramos (por defecto 5; usa el número que te den). Un tramo es un grupo de secciones de un archivo: la introducción de un libro o un capítulo, de hasta ~5,000 palabras del original.

**Tú no traduces en este contexto.** Repartes el trabajo a subagentes `traductor` y te encargas de validar, anotar términos y hacer commit. Así cada tramo tiene su propio contexto limpio.

## Pasos

1. **Estado limpio.** Corre `git status --porcelain`. Si hay cambios sin commit dentro de `traducciones/` que no son tuyos, detente y avisa: alguien está revisando a mano. Si existe un remoto (`git remote`), corre `git pull --ff-only`.

2. **Qué sigue.** Corre `node scripts/siguiente.mjs --limite N`. Te da una lista JSON de tramos. Si está vacía, informa que no queda nada pendiente en el plan y termina.

3. **Traducir.** Lanza un subagente `traductor` por tramo, **hasta 3 en paralelo** (nunca más). A cada uno pásale el JSON completo de su tramo, tal cual. Espera a que terminen todos los del grupo antes de lanzar el siguiente grupo.

4. **Revisar resultados.** Cada subagente responde `OK <archivo>` o `FALLÓ <tramo>: <motivo>`, y puede traer una lista de términos nuevos.
   - Si un tramo falló, reinténtalo **una vez** con un subagente nuevo, pasándole el motivo del fallo. Si vuelve a fallar, borra su archivo en `trabajo/` (si quedó) y sigue con los demás.
   - Corre `node scripts/validar.mjs --cambiados`. Todo lo que se va a guardar debe salir con ✓.

5. **Glosario.** Si los subagentes propusieron términos nuevos, agrégalos como filas al final de `glosario.md`, en la sección «Por revisar» (`| inglés | propuesta | dónde apareció |`), sin repetir los que ya estén.

6. **Guardar.** Haz commit solo de `traducciones/` y `glosario.md`:
   ```
   git add traducciones glosario.md
   git commit -m "Traduce: <lista corta de tramos>"
   ```
   Si hay remoto, `git push`.

7. **Informe final** (breve, en español): tramos traducidos, los que fallaron y por qué, términos nuevos por revisar, y la salida de `node scripts/progreso.mjs`.

## Reglas

- Nunca edites `fuentes/`, `plan.json`, `comentarios.json` ni los scripts durante una corrida.
- Nunca toques un archivo con `estado: revisado` (lo corrigió una persona). `unir.mjs` lo impide de todos modos.
- No hagas commit de nada que no pase `validar.mjs`.
- Si algo falla de forma inesperada (sin red, error de un script), detente y explica el error en el informe; no improvises arreglos al proyecto.
