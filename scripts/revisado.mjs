#!/usr/bin/env node
// Marca una traducción como revisada por una persona.
//
//   node scripts/revisado.mjs traducciones/tyndale/JHN/3.md "Nombre de quien revisó"
import { join } from 'node:path';
import { guardarTraduccion, hoy, leerTraduccion, validarArchivo } from './lib.mjs';

const [archivo, quien] = process.argv.slice(2);
if (!archivo || !quien) {
  console.error('Uso: node scripts/revisado.mjs <archivo.md> "Nombre"');
  process.exit(2);
}
const ruta = join(process.cwd(), archivo);
const doc = leerTraduccion(ruta);
if (!doc) {
  console.error('No existe ese archivo.');
  process.exit(1);
}
if (doc.meta.estado === 'parcial') {
  console.error('La traducción está a medias: termínala antes de marcarla como revisada.');
  process.exit(1);
}
guardarTraduccion(ruta, { ...doc.meta, estado: 'revisado', revisado_por: quien, revisado_el: hoy() }, doc.secciones);
const { errores } = await validarArchivo(ruta);
if (errores.length) {
  console.error(`Marcado, pero tiene errores:\n- ${errores.join('\n- ')}`);
  process.exit(1);
}
console.log(`Revisado: ${archivo} (${quien})`);
