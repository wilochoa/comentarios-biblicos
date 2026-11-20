#!/usr/bin/env node
// Lista los siguientes trabajos de traducción según plan.json (solo consulta: no reserva nada).
//
//   node scripts/siguiente.mjs [--limite 5] [--max-palabras 5000] [--comentario matthew-henry] [--libro JHN,ROM]
//
// Omite los archivos que otro traductor tiene reservados (reservas/). Para
// trabajar, usa reservar.mjs, que además los aparta para ti. Imprime JSON.
import { reservasActivas } from './reservas.mjs';
import { filtrosDeArgs, siguientesTramos, validarFiltros } from './tramos.mjs';

const args = process.argv.slice(2);
const opcion = (nombre, porDefecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 ? Number(args[i + 1]) : porDefecto;
};
const filtros = filtrosDeArgs(args);
try {
  validarFiltros(filtros);
} catch (error) {
  console.error(error.message);
  process.exit(2);
}
const excluir = new Set(reservasActivas().flatMap((r) => r.tramos.map((t) => t.archivo)));
const trabajos = await siguientesTramos({ limite: opcion('limite', 5), maxPalabras: opcion('max-palabras', 5000), excluir, ...filtros });
console.log(JSON.stringify(trabajos, null, 2));
