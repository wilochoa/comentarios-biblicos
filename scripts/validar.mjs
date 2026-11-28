#!/usr/bin/env node
// Valida archivos de traducción contra su original.
//
//   node scripts/validar.mjs traducciones/tyndale/JHN/3.md [...]
//   node scripts/validar.mjs --todos
//   node scripts/validar.mjs --cambiados      (los modificados según git, sin commit)
//   node scripts/validar.mjs --desde <ref>    (los cambiados desde <ref>, p. ej. origin/main en un PR)
//   --modelos: además, "traducido_por" debe estar en modelos-permitidos.json si el
//   archivo se tradujo desde "vigente_desde" o si su "traducido_por" cambió
//   (respecto de HEAD con --cambiados, o de <ref> con --desde).
//   --citas-como-aviso: las citas del versículo que no siguen la RVA no cuentan
//   como error (lo usa la publicación mientras se corrigen las antiguas).
//   --resumen: muestra solo los archivos con errores y el total (para Actions).
//   --paralelo N: cuántos archivos se validan a la vez (8 por defecto).
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DIR_TRADUCCIONES, ROOT, leerTraduccion, parsearMarkdown, validarArchivo } from './lib.mjs';
import { describirPermitidos, modeloPermitido, vigenteDesde } from './modelos.mjs';

const correrGit = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

function todos(dir = DIR_TRADUCCIONES) {
  const out = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) out.push(...todos(ruta));
    else if (nombre.endsWith('.md')) out.push(ruta);
  }
  return out;
}

function cambiados() {
  const salida = correrGit(['status', '--porcelain', '--untracked-files=all', '--', 'traducciones']);
  return salida.split('\n').filter(Boolean).map((l) => l.slice(3).trim()).filter((p) => p.endsWith('.md')).map((p) => join(ROOT, p));
}

function cambiadosDesde(ref) {
  const salida = correrGit(['diff', '--name-only', '--diff-filter=AM', `${ref}...HEAD`, '--', 'traducciones']);
  return salida.split('\n').filter((p) => p.endsWith('.md')).map((p) => join(ROOT, p));
}

/** "traducido_por" del archivo en `base` (commit), o null si no existía. */
function traductorEn(base, ruta) {
  try {
    return parsearMarkdown(correrGit(['show', `${base}:${relative(ROOT, ruta)}`])).meta.traducido_por ?? null;
  } catch {
    return null;
  }
}

const args = process.argv.slice(2);
const desde = args.includes('--desde') ? args[args.indexOf('--desde') + 1] : null;
const archivos = args.includes('--todos')
  ? todos()
  : args.includes('--cambiados')
    ? cambiados()
    : desde
      ? cambiadosDesde(desde)
      : args.filter((a) => !a.startsWith('--')).map((a) => join(process.cwd(), a));
if (!archivos.length) {
  console.log('Nada que validar.');
  process.exit(0);
}
// --modelos: contra qué commit se compara "traducido_por" (con --todos, solo cuenta la fecha).
const revisarModelos = args.includes('--modelos');
const base = !revisarModelos || args.includes('--todos') ? null : desde ? correrGit(['merge-base', desde, 'HEAD']).trim() : 'HEAD';
const desdeFecha = revisarModelos ? vigenteDesde() : null;

const resumen = args.includes('--resumen');
const paralelo = Math.max(1, Number(args[args.indexOf('--paralelo') + 1]) || 8);

async function validarUno(ruta) {
  const { errores, avisos } = await validarArchivo(ruta, { citasComoAviso: args.includes('--citas-como-aviso') });
  if (revisarModelos) {
    const meta = leerTraduccion(ruta)?.meta ?? {};
    const ahora = meta.traducido_por;
    const nuevo = String(meta.traducido_el ?? '') >= desdeFecha;
    const cambio = base !== null && ahora !== traductorEn(base, ruta);
    if (ahora && (nuevo || cambio) && !modeloPermitido(ahora)) {
      errores.push(`traducido_por "${ahora}" no es un modelo permitido (${describirPermitidos()})`);
    }
  }
  return { nombre: relative(ROOT, ruta), errores, avisos };
}

// Se validan `paralelo` archivos a la vez y se informa en el orden de la lista.
const resultados = new Array(archivos.length);
let siguiente = 0;
await Promise.all(
  Array.from({ length: Math.min(paralelo, archivos.length) }, async () => {
    while (siguiente < archivos.length) {
      const i = siguiente++;
      resultados[i] = await validarUno(archivos[i]);
    }
  }),
);

let conErrores = 0;
for (const { nombre, errores, avisos } of resultados) {
  if (errores.length) {
    conErrores++;
    console.log(`✗ ${nombre}\n  - ${errores.join('\n  - ')}`);
  } else if (!resumen) {
    console.log(`✓ ${nombre}${avisos.length ? `  (${avisos.length} aviso${avisos.length > 1 ? 's' : ''})` : ''}`);
  }
}
console.log(`\n${archivos.length - conErrores} de ${archivos.length} sin errores.`);
process.exit(conErrores ? 1 : 0);
