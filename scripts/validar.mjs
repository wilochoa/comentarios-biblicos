#!/usr/bin/env node
// Valida archivos de traducción contra su original.
//
//   node scripts/validar.mjs traducciones/tyndale/JHN/3.md [...]
//   node scripts/validar.mjs --todos
//   node scripts/validar.mjs --cambiados      (los modificados según git)
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DIR_TRADUCCIONES, ROOT, validarArchivo } from './lib.mjs';

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
  const salida = execFileSync('git', ['status', '--porcelain', '--untracked-files=all', '--', 'traducciones'], { cwd: ROOT, encoding: 'utf8' });
  return salida.split('\n').filter(Boolean).map((l) => l.slice(3).trim()).filter((p) => p.endsWith('.md')).map((p) => join(ROOT, p));
}

const args = process.argv.slice(2);
const archivos = args.includes('--todos') ? todos() : args.includes('--cambiados') ? cambiados() : args.map((a) => join(process.cwd(), a));
if (!archivos.length) {
  console.log('Nada que validar.');
  process.exit(0);
}

let conErrores = 0;
for (const ruta of archivos) {
  const { errores, avisos } = await validarArchivo(ruta);
  const nombre = relative(ROOT, ruta);
  if (errores.length) {
    conErrores++;
    console.log(`✗ ${nombre}\n  - ${errores.join('\n  - ')}`);
  } else {
    console.log(`✓ ${nombre}${avisos.length ? `  (aviso: ${avisos.join('; ')})` : ''}`);
  }
}
console.log(`\n${archivos.length - conErrores} de ${archivos.length} sin errores.`);
process.exit(conErrores ? 1 : 0);
