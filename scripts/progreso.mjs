#!/usr/bin/env node
// Resumen del avance por comentario.
//
//   node scripts/progreso.mjs
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DIR_TRADUCCIONES, comentarios, leerTraduccion, librosDeFuente } from './lib.mjs';
import { reservasActivas } from './reservas.mjs';
import { nombreArchivo } from './tramos.mjs';

for (const c of comentarios()) {
  const libros = await librosDeFuente(c.id);
  const totalIntros = libros.filter((b) => b.introduction?.trim()).length;
  const totalCapitulos = libros.reduce((n, b) => n + (b.numberOfChapters ?? 0), 0);
  const cuenta = { intro: { parcial: 0, borrador: 0, revisado: 0 }, cap: { parcial: 0, borrador: 0, revisado: 0 } };
  const dir = join(DIR_TRADUCCIONES, c.id);
  if (existsSync(dir)) {
    for (const libro of readdirSync(dir)) {
      for (const archivo of readdirSync(join(dir, libro))) {
        const doc = leerTraduccion(join(dir, libro, archivo));
        const tipo = archivo === 'intro.md' ? 'intro' : 'cap';
        if (doc?.meta.estado in cuenta[tipo]) cuenta[tipo][doc.meta.estado]++;
      }
    }
  }
  const linea = (t, total) => {
    const listos = t.borrador + t.revisado;
    return `${listos}/${total} (${total ? Math.round((listos / total) * 100) : 0}%) · revisados ${t.revisado} · a medias ${t.parcial}`;
  };
  console.log(`${c.nombre}`);
  console.log(`  Introducciones de libros: ${linea(cuenta.intro, totalIntros)}`);
  console.log(`  Capítulos:                ${linea(cuenta.cap, totalCapitulos)}`);
}

const reservas = reservasActivas();
console.log(reservas.length ? '\nTraduciendo ahora (reservas vigentes):' : '\nNadie tiene tramos reservados ahora.');
for (const r of reservas) {
  const nombres = [...new Set(r.tramos.map((t) => `${t.comentario}: ${nombreArchivo(t.archivo)}`))];
  console.log(`  ${r.quien} (${r.modelo}) · ${r.tramos.length} tramos · vence ${r.vence.slice(0, 16).replace('T', ' ')} UTC`);
  console.log(`    ${nombres.slice(0, 6).join(', ')}${nombres.length > 6 ? `, … (+${nombres.length - 6})` : ''}`);
}
