#!/usr/bin/env node
// Asigna el traductor de esta carpeta (se guarda en .traductor.json, que no se sube).
//
//   node scripts/soy.mjs claude "Claude Opus 5.5"
//   node scripts/soy.mjs codex "GPT-5 Codex" --comentario matthew-henry
//   node scripts/soy.mjs gemini "Gemini 3 Pro" --comentario tyndale --libro JHN,ROM
//   node scripts/soy.mjs                         (muestra la configuración actual)
//
// - El nombre corto identifica sus reservas (reservas/<nombre>.json) y debe ser
//   distinto en cada carpeta.
// - El modelo queda en "traducido_por" de cada archivo que traduzca.
// - --comentario / --libro: qué traduce esta carpeta por defecto (listas
//   separadas por coma). Sin ellos, sigue plan.json en orden. Cada corrida
//   puede cambiarlo con las mismas opciones en reservar.mjs.
import { guardarIdentidad, identidad } from './reservas.mjs';
import { filtrosDeArgs, validarFiltros } from './tramos.mjs';

const args = process.argv.slice(2);
const [quien, modelo] = args;
if (!quien || quien.startsWith('--') || !modelo) {
  try {
    const actual = identidad();
    const foco = [actual.comentarios?.join(', '), actual.libros?.join(', ')].filter(Boolean).join(' · ');
    console.log(`Esta carpeta traduce como "${actual.quien}" (${actual.modelo})${foco ? ` · solo: ${foco}` : ' · todo el plan'}.`);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  process.exit(0);
}
const filtros = filtrosDeArgs(args);
validarFiltros(filtros);
guardarIdentidad({ quien, modelo, ...filtros });
const foco = [filtros.comentarios?.join(', '), filtros.libros?.join(', ')].filter(Boolean).join(' · ');
console.log(`Listo: esta carpeta traduce como "${quien}" (${modelo})${foco ? ` · solo: ${foco}` : ' · todo el plan'}.`);
