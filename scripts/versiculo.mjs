#!/usr/bin/env node
// Texto de la Reina-Valera 1909 (dominio público) para citar en las traducciones.
//
//   node scripts/versiculo.mjs "Jn 3:16" "Joh 3:3-8" "ROM.5.8"
//
// Acepta abreviaturas en español, las de Henry (Joh, Co1…) y códigos USFM.
// Moderniza solo la ortografía de 1909 ("á su Hijo" → "a su Hijo").
import { formatearReferencia, obtenerJson, parsearReferencia } from './lib.mjs';

export function modernizar(texto) {
  return texto
    .replace(/(^|[\s(«"“])([áéóú])(?=[\s,.;:!?)»"”]|$)/g, (_, a, v) => a + { á: 'a', é: 'e', ó: 'o', ú: 'u' }[v])
    .replace(/(?<!\p{L})(fué|dió|vió|fuí|dí)(?!\p{L})/gu, (p) => p.normalize('NFD').replace(/́/g, '').normalize('NFC'))
    .replace(/\s+/g, ' ')
    .trim();
}

async function texto(ref) {
  const cap = await obtenerJson(`spa_r09/${ref.libro.usfm}/${ref.capitulo}.json`);
  if (!cap) return null;
  const versos = (cap.chapter?.content ?? []).filter((x) => x.type === 'verse');
  const elegidos = ref.desde ? versos.filter((v) => v.number >= ref.desde && v.number <= ref.hasta) : versos;
  if (!elegidos.length) return null;
  const plano = (v) => (v.content ?? []).map((c) => (typeof c === 'string' ? c : c?.text ?? '')).join(' ');
  return modernizar(elegidos.map(plano).join(' '));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const refs = process.argv.slice(2);
  if (!refs.length) {
    console.error('Uso: node scripts/versiculo.mjs "Jn 3:16" ["Ro 5:8" ...]');
    process.exit(2);
  }
  let fallo = false;
  for (const r of refs) {
    const ref = parsearReferencia(r);
    const t = ref && (await texto(ref));
    if (!t) {
      console.log(`${r}: no encontrado`);
      fallo = true;
    } else {
      console.log(`${formatearReferencia(ref)} (RVA 1909): ${t}`);
    }
  }
  process.exit(fallo ? 1 : 0);
}
