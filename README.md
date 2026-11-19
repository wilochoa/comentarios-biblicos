# Comentarios bíblicos en español

Traducciones al español de comentarios bíblicos clásicos y abiertos, hechas con IA poco a poco y revisadas por personas, publicadas como una API JSON estática que cualquier app puede consumir.

| Comentario | Original | Licencia de la traducción |
|---|---|---|
| Notas de estudio de Tyndale | Tyndale Open Study Notes, CC BY-SA 4.0 | CC BY-SA 4.0 (obligatoria) |
| Comentario de Matthew Henry | Dominio público | **Pendiente de decidir** |

Los originales vienen de la [Free Use Bible API](https://bible.helloao.org) y las citas bíblicas de la Reina-Valera 1909 (dominio público).

## Cómo se trabaja

```
plan.json ──► siguiente.mjs ──► subagente traductor ──► unir.mjs ──► traducciones/*.md ──► construir-api.mjs ──► dist/api/v1
                (qué sigue)       (traduce un tramo)     (valida y      (git: historial        (JSON estático)
                                                          guarda)        y revisión)
```

### Traducir

En Claude Code, dentro de esta carpeta:

```
/traducir 5
```

Traduce 5 tramos (cada uno hasta ~5,000 palabras del original), los valida y hace commit. Consume tu plan de Claude, sin costo de API.

### Corrida diaria automática

`scripts/diario.sh [N]` corre lo mismo sin intervención (`claude -p`), y deja el registro en `logs/diario.log`. Para programarla (todos los días a las 6:00), agrega con `crontab -e`:

```
0 6 * * * /Users/wochoa/Documents/Projects/WamsIA/comentarios-biblicos/scripts/diario.sh 5
```

Para que corra sin pedir permisos, crea `.claude/settings.json` con los permisos que la skill necesita:

```json
{
  "permissions": {
    "allow": [
      "Bash(node scripts/*)",
      "Bash(git status*)", "Bash(git diff*)", "Bash(git remote*)", "Bash(git pull --ff-only*)",
      "Bash(git add traducciones*)", "Bash(git commit -m *)", "Bash(git push*)",
      "Bash(rm trabajo/*)",
      "Write(trabajo/**)", "Edit(glosario.md)"
    ]
  }
}
```

### Revisar

1. Abre un archivo en `traducciones/` y compáralo con el original (`node scripts/fuente.mjs tyndale JHN 3`).
2. Corrige directamente en el Markdown.
3. Márcalo: `node scripts/revisado.mjs traducciones/tyndale/JHN/3.md "Tu nombre"`.
4. Commit. Un archivo revisado nunca se vuelve a sobrescribir.

Términos nuevos que propone el traductor quedan al final de `glosario.md` («Por revisar»): muévelos a la tabla principal cuando decidas cómo se traducen.

### Otros comandos

| Comando | Para qué |
|---|---|
| `node scripts/progreso.mjs` | Avance por comentario |
| `node scripts/siguiente.mjs --limite 10` | Qué se traduciría a continuación |
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
