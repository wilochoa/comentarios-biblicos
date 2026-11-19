# Comentarios bíblicos en español

Proyecto para traducir al español comentarios bíblicos de dominio público o con licencia abierta y publicarlos como una API estática (JSON). Lo consume Iglesy (iglesy.net) y cualquiera que lo necesite.

Responde siempre en español.

## Cómo está organizado

- `comentarios.json`: los comentarios del proyecto (id, autor, licencia del original y de la traducción, atribución).
- `plan.json`: orden de trabajo (fases y prioridad de libros).
- `guia-de-estilo.md` y `glosario.md`: reglas de traducción. Son obligatorias.
- `traducciones/<comentario>/<LIBRO>/intro.md | <capítulo>.md`: las traducciones. Encabezado YAML simple + secciones `## <id>` que coinciden con las del original.
- `scripts/`: Node sin dependencias. `siguiente`, `fuente`, `versiculo`, `unir`, `validar`, `progreso`, `revisado`, `construir-api`.
- `fuentes/` (ignorado): caché de los originales de bible.helloao.org.
- `trabajo/` (ignorado): tramos en curso.

## Estados de una traducción

`parcial` (faltan secciones) → `borrador` (completa, traducida por IA) → `revisado` (una persona la revisó: `node scripts/revisado.mjs <archivo> "Nombre"`).

## Reglas

- Para traducir, usa la skill `traducir` (que reparte el trabajo al subagente `traductor`). No traduzcas a mano fuera de ese flujo.
- Nunca sobrescribas un archivo `revisado`.
- Todo lo que se guarde debe pasar `node scripts/validar.mjs`.
- No edites `fuentes/`. Si un original cambia, `validar` avisa.
- Las pruebas de los scripts: `node --test 'scripts/*.test.mjs'`.
