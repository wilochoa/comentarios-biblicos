#!/usr/bin/env node
// Une un tramo traducido (trabajo/*.md) a su archivo en traducciones/ y lo valida.
//
//   node scripts/unir.mjs trabajo/tyndale-JHN-3.md [--modelo claude-opus-5-5]
//
// --modelo: el ID exacto del modelo que tradujo (obligatorio). Debe estar en
// modelos-permitidos.json y queda en "traducido_por".
//
// El archivo de trabajo lleva en su encabezado: comentario, libro, unidad,
// y debajo las secciones "## <id>" traducidas. Este script:
//   - convierte las referencias de Henry a abreviaturas en español,
//   - corrige la forma («...» → «…», sin punto tras «Sal 51», cita del versículo sin «»),
//   - revisa que las citas del versículo salgan de la RVA 1909 (scripts/citas.mjs),
//   - ordena las secciones como el original,
//   - pone el estado (parcial / borrador), la fecha y la huella del original,
//   - valida; si hay errores no guarda nada y termina con código 1.
import { readFileSync, rmSync } from 'node:fs';
import { normalizarForma, revisarCitas } from './citas.mjs';
import { identidad } from './reservas.mjs';
import { analizarModelo, describirPermitidos, modeloPermitido } from './modelos.mjs';
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
let yo;
try {
  yo = identidad();
} catch (error) {
  console.error(error.message);
  process.exit(2);
}
const iModelo = process.argv.indexOf('--modelo');
const modelo = iModelo > 0 ? process.argv[iModelo + 1] : null;
if (!modelo) {
  console.error('Falta --modelo <tu ID de modelo exacto> (p. ej. --modelo claude-opus-5-5).');
  process.exit(2);
}
if (!modeloPermitido(modelo)) {
  console.error(`El modelo "${modelo}" no está permitido para traducir. Permitidos: ${describirPermitidos()}.`);
  process.exit(2);
}
const traductor = analizarModelo(modelo).nombre;
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
  // Lo mecánico se corrige solo («...» → «…», «Sal 51.» → «Sal 51», comillas en la cita del versículo).
  const texto = normalizarForma(convertirReferencias(s.texto));
  for (const e of revisarSeccion(originales.get(s.id), texto)) errores.push(`${s.id}: ${e}`);
  for (const e of await revisarCitas({ libro, original: originales.get(s.id), traduccion: texto, comentario: idComentario, unidad, seccion: s.id })) errores.push(`${s.id}: ${e}`);
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
  traducido_por: `${traductor} (IA)`,
  traducido_el: hoy(),
  revisado_por: null,
  revisado_el: null,
}, secciones);
rmSync(ruta);
console.log(`OK ${destino.split('/traducciones/')[1]} · ${secciones.length}/${fuente.secciones.length} secciones · ${completa ? 'borrador' : 'parcial'}`);
