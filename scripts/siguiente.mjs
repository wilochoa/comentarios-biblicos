#!/usr/bin/env node
// Lista los siguientes trabajos de traducción según plan.json (solo consulta: no reserva nada).
//
//   node scripts/siguiente.mjs [--limite 5] [--max-palabras 5000] [--comentario matthew-henry] [--libro JHN,ROM]
//   node scripts/siguiente.mjs --lote [--limite 3]     (los tramos del lote que tomaste con tomar.mjs)
//
// Omite los archivos que otro traductor tiene reservados (reservas/ y lotes de
// voluntarios en PRs). Para trabajar, usa reservar.mjs (carpetas internas) o
// tomar.mjs (voluntarios), que además los apartan para ti. Imprime JSON.
import { archivosEnLotes } from './github.mjs';
import { leerLote } from './lotes.mjs';
import { reservasActivas } from './reservas.mjs';
import { filtrosDeArgs, siguientesTramos, validarFiltros } from './tramos.mjs';

const args = process.argv.slice(2);
const opcion = (nombre, porDefecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 ? Number(args[i + 1]) : porDefecto;
};

if (args.includes('--lote')) {
  const lote = leerLote();
  if (!lote) {
    console.error('Esta carpeta no tiene un lote tomado. Toma uno con `node scripts/tomar.mjs --modelo <id>`.');
    process.exit(2);
  }
  const trabajos = await siguientesTramos({
    limite: opcion('limite', 3),
    maxPalabras: opcion('max-palabras', 5000),
    comentarios: [lote.comentario],
    libros: [lote.libro],
    soloArchivos: new Set(lote.archivos),
  });
  if (!trabajos.length) console.error(`El lote ${lote.id} está completo: entrégalo con \`node scripts/entregar.mjs\`.`);
  console.log(JSON.stringify(trabajos, null, 2));
  process.exit(0);
}

const filtros = filtrosDeArgs(args);
try {
  validarFiltros(filtros);
} catch (error) {
  console.error(error.message);
  process.exit(2);
}
const { archivos: enLotes } = await archivosEnLotes();
const excluir = new Set([...reservasActivas().flatMap((r) => r.tramos.map((t) => t.archivo)), ...enLotes]);
const trabajos = await siguientesTramos({ limite: opcion('limite', 5), maxPalabras: opcion('max-palabras', 5000), excluir, ...filtros });
console.log(JSON.stringify(trabajos, null, 2));
