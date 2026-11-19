#!/usr/bin/env node
// Une un tramo traducido (trabajo/*.md) a su archivo en traducciones/ y lo valida.
//
//   node scripts/unir.mjs trabajo/tyndale-JHN-3.md
//
// El archivo de trabajo lleva en su encabezado: comentario, libro, unidad,
// y debajo las secciones "## <id>" traducidas. Este script:
//   - convierte las referencias de Henry a abreviaturas en español,
//   - ordena las secciones como el original,
//   - pone el estado (parcial / borrador), la fecha y la huella del original,
//   - valida; si hay errores no guarda nada y termina con código 1.
import { readFileSync, rmSync } from 'node:fs';
import {
  cargarFuente, convertirReferencias, guardarTraduccion, hoy, leerTraduccion, parsearMarkdown, revisarSeccion,
  rutaTraduccion,
} from './lib.mjs';

const ruta = process.argv[2];
if (!ruta) {
  console.error('Uso: node scripts/unir.mjs trabajo/<archivo>.md');
  process.exit(2);
}
const trabajo = parsearMarkdown(readFileSync(ruta, 'utf8'));
const { comentario: idComentario, libro, unidad: unidadTxt } = trabajo.meta;
if (!idComentario || !libro || !unidadTxt) {
  console.error('El archivo de trabajo necesita "comentario", "libro" y "unidad" en el encabezado.');
  process.exit(2);
}
const unidad = unidadTxt === 'intro' ? 'intro' : Number(unidadTxt);
const fuente = await cargarFuente(idComentario, libro, unidad);
if (!fuente) {
  console.error('No se encontró el original.');
  process.exit(1);
}

const destino = rutaTraduccion(idComentario, libro, unidad);
const actual = leerTraduccion(destino);
if (actual?.meta.estado === 'revisado') {
  console.error('Ese archivo ya está revisado: no se sobrescribe. Corrígelo a mano.');
  process.exit(1);
}

const originales = new Map(fuente.secciones.map((s) => [s.id, s.texto]));
const errores = [];
const nuevas = new Map((actual?.secciones ?? []).map((s) => [s.id, s.texto]));
for (const s of trabajo.secciones) {
  if (!originales.has(s.id)) {
    errores.push(`${s.id}: no existe en el original`);
    continue;
  }
  const texto = convertirReferencias(s.texto);
  for (const e of revisarSeccion(originales.get(s.id), texto)) errores.push(`${s.id}: ${e}`);
  nuevas.set(s.id, texto);
}
if (!trabajo.secciones.length) errores.push('el archivo de trabajo no tiene secciones');
if (errores.length) {
  console.error(`No se unió ${ruta}:\n- ${errores.join('\n- ')}`);
  process.exit(1);
}

const secciones = fuente.secciones.filter((s) => nuevas.has(s.id)).map((s) => ({ id: s.id, texto: nuevas.get(s.id) }));
const completa = secciones.length === fuente.secciones.length;
guardarTraduccion(destino, {
  comentario: idComentario,
  libro,
  unidad: String(unidad),
  estado: completa ? 'borrador' : 'parcial',
  fuente: fuente.url,
  fuente_sha256: fuente.sha256,
  traducido_por: 'Claude (IA)',
  traducido_el: hoy(),
  revisado_por: null,
  revisado_el: null,
}, secciones);
rmSync(ruta);
console.log(`OK ${destino.split('/traducciones/')[1]} · ${secciones.length}/${fuente.secciones.length} secciones · ${completa ? 'borrador' : 'parcial'}`);
