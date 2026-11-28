#!/usr/bin/env node
// Traducciones cuyas citas del versículo no siguen la RVA 1909 (las anteriores
// a la regla automática). Para corregirlas poco a poco:
//
//   node scripts/citas-pendientes.mjs            (lista: archivo · citas por corregir)
//   node scripts/citas-pendientes.mjs --json 5   (los 5 primeros, con el detalle de cada cita)
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DIR_TRADUCCIONES, ROOT, cargarFuente, leerTraduccion } from './lib.mjs';
import { revisarCitas } from './citas.mjs';

function archivos(dir = DIR_TRADUCCIONES) {
  return readdirSync(dir).flatMap((n) => {
    const r = join(dir, n);
    return statSync(r).isDirectory() ? archivos(r) : n.endsWith('.md') && n !== 'intro.md' ? [r] : [];
  });
}

const args = process.argv.slice(2);
const json = args.includes('--json');
const limite = json ? Number(args[args.indexOf('--json') + 1]) || 5 : Infinity;
const pendientes = [];
for (const ruta of archivos().sort()) {
  if (pendientes.length >= limite) break;
  const doc = leerTraduccion(ruta);
  if (!doc || doc.meta.estado === 'revisado') continue;
  const fuente = await cargarFuente(doc.meta.comentario, doc.meta.libro, Number(doc.meta.unidad));
  if (!fuente) continue;
  const originales = new Map(fuente.secciones.map((s) => [s.id, s.texto]));
  const citas = [];
  for (const s of doc.secciones) {
    if (!originales.has(s.id)) continue;
    for (const e of await revisarCitas({ libro: doc.meta.libro, original: originales.get(s.id), traduccion: s.texto, comentario: doc.meta.comentario, unidad: doc.meta.unidad, seccion: s.id })) citas.push(`${s.id}: ${e}`);
  }
  if (citas.length) pendientes.push({ archivo: relative(ROOT, ruta), citas });
}
if (json) console.log(JSON.stringify(pendientes, null, 2));
else {
  for (const p of pendientes) console.log(`${p.archivo} · ${p.citas.length}`);
  console.log(`\n${pendientes.length} archivos con ${pendientes.reduce((n, p) => n + p.citas.length, 0)} citas por corregir.`);
}
