#!/usr/bin/env node
// Lista los siguientes trabajos de traducción según plan.json.
//
//   node scripts/siguiente.mjs [--limite 5] [--max-palabras 5000]
//
// Cada trabajo es un tramo de secciones de UN archivo (introducción de un
// libro o un capítulo), de hasta --max-palabras del original. Un capítulo
// enorme (Salmo 119 de Henry) se reparte en varios días: se emite como mucho
// un tramo por archivo por corrida, para que nunca se escriba el mismo
// archivo en paralelo. Imprime JSON.
import { relative } from 'node:path';
import { ROOT, cargarFuente, librosDeFuente, leerTraduccion, plan, rutaTraduccion } from './lib.mjs';

const args = process.argv.slice(2);
const opcion = (nombre, porDefecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 ? Number(args[i + 1]) : porDefecto;
};
const limite = opcion('limite', 5);
const maxPalabras = opcion('max-palabras', 5000);

async function* objetivos() {
  for (const fase of plan().fases) {
    const libros = await librosDeFuente(fase.comentario);
    for (const usfm of fase.libros) {
      const libro = libros.find((b) => b.id === usfm);
      if (!libro) continue;
      if (fase.tipo === 'intro' || fase.tipo === 'libro-completo') yield { comentario: fase.comentario, libro: usfm, unidad: 'intro' };
      if (fase.tipo === 'capitulos' || fase.tipo === 'libro-completo') {
        const desde = libro.firstChapterNumber ?? 1;
        const hasta = libro.lastChapterNumber ?? libro.numberOfChapters;
        for (let cap = desde; cap <= hasta; cap++) yield { comentario: fase.comentario, libro: usfm, unidad: cap };
      }
    }
  }
}

const trabajos = [];
for await (const obj of objetivos()) {
  if (trabajos.length >= limite) break;
  const ruta = rutaTraduccion(obj.comentario, obj.libro, obj.unidad);
  const actual = leerTraduccion(ruta);
  if (actual && actual.meta.estado !== 'parcial') continue;
  const fuente = await cargarFuente(obj.comentario, obj.libro, obj.unidad);
  if (!fuente) continue;
  const hechas = new Set((actual?.secciones ?? []).map((s) => s.id));
  const pendientes = fuente.secciones.filter((s) => !hechas.has(s.id));
  if (!pendientes.length) continue;

  const tramo = [];
  let palabras = 0;
  for (const s of pendientes) {
    if (tramo.length && palabras + s.palabras > maxPalabras) break;
    tramo.push(s.id);
    palabras += s.palabras;
  }
  trabajos.push({
    id: `${obj.comentario}/${obj.libro}/${obj.unidad}#${tramo[0]}${tramo.length > 1 ? `-${tramo.at(-1)}` : ''}`,
    comentario: obj.comentario,
    libro: obj.libro,
    unidad: obj.unidad,
    secciones: tramo,
    palabras,
    completa_el_archivo: tramo.length === pendientes.length,
    archivo: relative(ROOT, ruta),
  });
}

console.log(JSON.stringify(trabajos, null, 2));
