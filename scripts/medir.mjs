#!/usr/bin/env node
// Mide el tamaño de cada original (palabras y secciones por introducción y
// capítulo) y lo guarda en datos/tamanos.json, para que el avance se cuente
// en palabras y no en archivos (un capítulo de Henry vale 20 de Tyndale).
// Se corre una vez por comentario nuevo:
//
//   node scripts/medir.mjs [comentario ...]      (por defecto, los de plan.json)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, cargarFuente, librosDeFuente, plan } from './lib.mjs';

const RUTA = join(ROOT, 'datos', 'tamanos.json');
const pedidos = process.argv.slice(2);
const ids = pedidos.length ? pedidos : [...new Set(plan().fases.map((f) => f.comentario))];
const tamanos = existsSync(RUTA) ? JSON.parse(readFileSync(RUTA, 'utf8')) : {};

for (const id of ids) {
  const libros = await librosDeFuente(id);
  const resultado = {};
  const tareas = [];
  for (const libro of libros) {
    resultado[libro.id] = {};
    const desde = libro.firstChapterNumber ?? 1;
    const hasta = libro.lastChapterNumber ?? libro.numberOfChapters;
    for (const unidad of ['intro', ...Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i)]) {
      tareas.push({ libro: libro.id, unidad });
    }
  }
  let hechas = 0;
  const fallidas = [];
  const conReintentos = async (t) => {
    for (let intento = 1; ; intento++) {
      try {
        return await cargarFuente(id, t.libro, t.unidad);
      } catch (error) {
        if (intento === 4) throw error;
        await new Promise((r) => setTimeout(r, 2000 * intento));
      }
    }
  };
  const trabajar = async () => {
    for (let t = tareas.shift(); t; t = tareas.shift()) {
      try {
        const fuente = await conReintentos(t);
        if (fuente) resultado[t.libro][t.unidad] = [fuente.secciones.reduce((n, s) => n + s.palabras, 0), fuente.secciones.length];
      } catch (error) {
        fallidas.push(`${t.libro} ${t.unidad}: ${error.message}`);
      }
      if (++hechas % 200 === 0) console.error(`${id}: ${hechas}…`);
    }
  };
  await Promise.all(Array.from({ length: 8 }, trabajar));
  tamanos[id] = resultado;
  writeFileSync(RUTA, `${JSON.stringify(tamanos)}\n`);
  const total = Object.values(resultado).flatMap((l) => Object.values(l)).reduce((n, [p]) => n + p, 0);
  console.log(`${id}: ${hechas} unidades, ${total.toLocaleString('es')} palabras`);
  if (fallidas.length) console.log(`  Sin medir (la fuente falló; vuelve a correr más tarde):\n  - ${fallidas.join('\n  - ')}`);
}
