# Comentarios bíblicos en español

Traducciones al español de comentarios bíblicos clásicos y abiertos, hechas con IA poco a poco y revisadas por personas, publicadas como una API JSON estática que cualquier app puede consumir.

| Comentario | Original | Licencia de la traducción |
|---|---|---|
| Notas de estudio de Tyndale | Tyndale Open Study Notes, CC BY-SA 4.0 | CC BY-SA 4.0 (obligatoria) |
| Comentario de Matthew Henry | Dominio público | **Pendiente de decidir** |

Los originales vienen de la [Free Use Bible API](https://bible.helloao.org) y las citas bíblicas de la Reina-Valera 1909 (dominio público).

## Cómo se trabaja

```
plan.json ──► reservar.mjs ──► traductor (IA) ──► unir.mjs ──► entregar.mjs ──► GitHub ──► construir-api.mjs ──► comentarios.iglesy.net
              (aparta tramos)   (un tramo)        (valida y     (commit, push,             (JSON estático)
                                                   guarda)       libera la reserva)
```

### Varios modelos a la vez

Cada modelo (Claude, Codex, Gemini, Cursor…) trabaja en **su propia copia del repo**. Antes de traducir, aparta sus tramos en `reservas/<quien>.json` y lo sube a GitHub; los demás los saltan. Al terminar, `entregar.mjs` sube lo traducido y libera la reserva. Así pueden trabajar 5 a la vez sin pisarse: en el mismo autor (tramos distintos) o en autores distintos.

**Una sola vez:** `scripts/preparar.sh` crea `../traductores/{codex,opencode,cursor,claude,gemini}`, cada una con su copia del repo y su traductor asignado.

Para que una carpeta se dedique a un autor o a unos libros (opcional), dentro de ella:

```sh
node scripts/soy.mjs codex "Codex" --comentario matthew-henry   # solo Henry
node scripts/soy.mjs gemini "Gemini" --libro JHN,ROM            # solo esos libros
```

El nombre corto (`codex`) debe ser distinto en cada carpeta. El modelo queda en `traducido_por` de cada archivo. **No abras dos sesiones en la misma carpeta**: `reservar.mjs` lo detecta y se niega.

**Para traducir**, en cada herramienta, dentro de su carpeta:

| Herramienta | Qué decirle |
|---|---|
| Claude Code | `/traducir 15` · `/traducir 10 matthew-henry` · `/traducir 5 tyndale JHN` |
| Codex, Cursor, otros | «traduce 15» · «traduce 10 de matthew-henry» (leen `AGENTS.md`) |
| Gemini CLI | lo mismo (lee `GEMINI.md`, que apunta a `AGENTS.md`) |

Sin autor ni libros, cada carpeta usa su preferencia de `soy.mjs`; si no tiene, sigue `plan.json` en orden. Con un autor se puede avanzar en él aunque las fases anteriores de otro autor no estén terminadas.

La herramienta necesita red (descarga los originales de bible.helloao.org y hace push a GitHub) y permiso para correr `node scripts/*`. Si una corrida se corta, corre `node scripts/entregar.mjs` en esa carpeta: sube lo que alcanzó a traducir y libera el resto. Una reserva abandonada vence sola a las 12 horas.

**Avance en la web:** https://comentarios.iglesy.net/avance/ muestra lo traducido, lo que falta (en palabras del original), el ritmo y quién está traduciendo qué ahora (se actualiza solo). En la terminal: `node scripts/progreso.mjs`.

El avance se cuenta con `datos/tamanos.json` (palabras de cada original). Si agregas un comentario al plan, mídelo una vez: `node scripts/medir.mjs <comentario>`.

### Corrida diaria automática (Claude)

`scripts/diario.sh [N] [comentario]` corre lo mismo sin intervención (`claude -p`), y deja el registro en `logs/diario.log`. Para programarla (todos los días a las 6:00), agrega con `crontab -e`:

```
0 6 * * * /Users/wochoa/Documents/Projects/WamsIA/comentarios-biblicos/scripts/diario.sh 5
```

Para que corra sin pedir permisos, crea `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(node scripts/*)",
      "Bash(git status*)", "Bash(git diff*)",
      "Bash(rm trabajo/*)",
      "Write(trabajo/**)", "Write(glosario-propuestas/**)", "Edit(glosario-propuestas/**)"
    ]
  }
}
```

### Revisar

1. Abre un archivo en `traducciones/` y compáralo con el original (`node scripts/fuente.mjs tyndale JHN 3`).
2. Corrige directamente en el Markdown.
3. Márcalo: `node scripts/revisado.mjs traducciones/tyndale/JHN/3.md "Tu nombre"`.
4. Commit. Un archivo revisado nunca se vuelve a sobrescribir.

Los términos nuevos que propone cada traductor quedan en `glosario-propuestas/<quien>.md`: pásalos a la tabla de `glosario.md` cuando decidas cómo se traducen, y bórralos de ahí.

### Otros comandos

| Comando | Para qué |
|---|---|
| `node scripts/progreso.mjs` | Avance por comentario y reservas vigentes |
| `node scripts/soy.mjs` | Quién traduce en esta carpeta y qué prefiere |
| `node scripts/siguiente.mjs --limite 10 [--comentario id] [--libro JHN]` | Qué se traduciría a continuación (sin reservar) |
| `node scripts/reservar.mjs` / `entregar.mjs` | Apartar tramos / subir lo traducido y liberar |
| `node scripts/validar.mjs --todos` | Valida todas las traducciones contra su original |
| `node scripts/versiculo.mjs "Jn 3:16"` | Texto RVA 1909 de un pasaje |
| `node scripts/construir-api.mjs` | Genera la API en `dist/api/v1` |
| `node --test 'scripts/*.test.mjs'` | Pruebas de los scripts |

## La API

Archivos JSON estáticos (pensados para GitHub Pages o Cloudflare Pages). Se publican los archivos en `borrador` y `revisado`; cada respuesta trae `estado` para que la app muestre «Traducción en revisión» en los borradores.

| Ruta | Contenido |
|---|---|
| `/v1/comentarios.json` | Comentarios disponibles, licencias, atribución |
| `/v1/<comentario>/libros.json` | Libros con introducción y capítulos publicados (y su estado) |
| `/v1/<comentario>/<LIBRO>/introduccion.json` | Introducción del libro |
| `/v1/<comentario>/<LIBRO>/<capítulo>.json` | Comentario del capítulo, por secciones (`versiculo` donde empieza cada una) |

`<LIBRO>` es el código USFM (`GEN`, `JHN`, `1CO`…). Quien use la API debe mostrar el campo `atribucion`.

**Dirección pública:** https://comentarios.iglesy.net/v1/comentarios.json

Se publica sola con cada push a `main` (`.github/workflows/publicar.yml`: pruebas → validar → construir → GitHub Pages). Solo salen los comentarios con `"publicar": true` en `comentarios.json`: hoy, Tyndale. Matthew Henry espera la decisión de licencia.
