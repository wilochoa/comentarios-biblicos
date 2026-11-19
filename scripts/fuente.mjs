#!/usr/bin/env node
// Muestra el texto original de una unidad, listo para traducir.
//
//   node scripts/fuente.mjs <comentario> <LIBRO> <intro|capítulo> [--secciones v1,v22]
import { cargarFuente, comentario, libroPorCodigo } from './lib.mjs';

const [idComentario, usfm, unidadArg, ...resto] = process.argv.slice(2);
if (!idComentario || !usfm || !unidadArg) {
  console.error('Uso: node scripts/fuente.mjs <comentario> <LIBRO> <intro|capítulo> [--secciones v1,v22]');
  process.exit(2);
}
const i = resto.indexOf('--secciones');
const filtro = i >= 0 ? new Set(resto[i + 1].split(',')) : null;
const unidad = unidadArg === 'intro' ? 'intro' : Number(unidadArg);

const fuente = await cargarFuente(idComentario, usfm, unidad);
if (!fuente) {
  console.error('No se encontró el original.');
  process.exit(1);
}
const c = comentario(idComentario);
const libro = libroPorCodigo(usfm);
console.log(`# ${c.nombre} · ${libro?.nombre ?? usfm} · ${unidad === 'intro' ? 'introducción del libro' : `capítulo ${unidad}`}\n`);
for (const s of fuente.secciones) {
  if (filtro && !filtro.has(s.id)) continue;
  console.log(`## ${s.id}\n\n${s.texto}\n`);
}
