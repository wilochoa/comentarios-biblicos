// Muestra del original de un comentario para analizar el estilo de su autor
// antes de empezar a traducirlo (skill /analizar-autor).
//
//   node scripts/muestra.mjs <comentario> [--libros 8]
//
// Toma libros repartidos por toda la obra (introducción + un capítulo del
// medio de cada uno), guarda el texto en trabajo/muestra-<comentario>.md y
// muestra conteos de lo que suele necesitar una regla propia: abreviaturas,
// cómo empiezan las notas, rayas, formato de las referencias, inglés antiguo,
// otros idiomas, listas numeradas.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIR_TRABAJO, cargarFuente, comentario, contarPalabras, librosDeFuente } from './lib.mjs';

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
if (!id) {
  console.error('Uso: node scripts/muestra.mjs <comentario> [--libros 8]');
  process.exit(1);
}
const cuantos = Number(args[args.indexOf('--libros') + 1]) || 8;
const c = comentario(id);
const libros = await librosDeFuente(id);
const paso = Math.max(1, Math.floor(libros.length / cuantos));
const elegidos = libros.filter((_, i) => i % paso === Math.floor(paso / 2)).slice(0, cuantos);

const partes = [];
const secciones = [];
for (const libro of elegidos) {
  const intro = await cargarFuente(id, libro.id, 'intro');
  const desde = libro.firstChapterNumber ?? 1;
  const hasta = libro.lastChapterNumber ?? libro.numberOfChapters ?? desde;
  const medio = Math.ceil((desde + hasta) / 2);
  const cap = await cargarFuente(id, libro.id, medio);
  for (const [unidad, fuente] of [['intro', intro], [medio, cap]]) {
    if (!fuente) continue;
    partes.push(`# ${libro.id} · ${unidad}\n\n${fuente.secciones.map((s) => `## ${s.id}\n\n${s.texto}`).join('\n\n')}`);
    for (const s of fuente.secciones) secciones.push({ ...s, esNota: unidad !== 'intro' && /^v\d/.test(s.id) });
  }
}
const texto = secciones.map((s) => s.texto).join('\n\n');
const notas = secciones.filter((s) => s.esNota);

const contar = (re) => (texto.match(re) ?? []).length;
const ejemplos = (re, n = 4) => [...new Set((texto.match(re) ?? []).map((x) => x.trim()))].slice(0, n).join(' · ');
const fila = (nombre, re) => {
  const k = contar(re);
  if (k) console.log(`  ${String(k).padStart(5)}  ${nombre.padEnd(46)} ${ejemplos(re)}`);
};
const cuantas = (prueba) => notas.filter((s) => prueba(s.texto)).length;
const pct = (k) => (notas.length ? `${Math.round((100 * k) / notas.length)} %` : '—');

mkdirSync(DIR_TRABAJO, { recursive: true });
const salida = join(DIR_TRABAJO, `muestra-${id}.md`);
writeFileSync(salida, `${partes.join('\n\n')}\n`);

const tamanos = notas.map((s) => s.palabras).sort((a, b) => a - b);
console.log(`${c.nombre} (${c.autor})`);
console.log(`Muestra: ${elegidos.map((l) => l.id).join(', ')} · ${contarPalabras(texto)} palabras en ${secciones.length} secciones → ${salida}`);
console.log(`Notas por versículo: ${notas.length}; mediana ${tamanos[Math.floor(tamanos.length / 2)] ?? 0} palabras, la más larga ${tamanos.at(-1) ?? 0}.`);

console.log('\nCómo empiezan las notas:');
console.log(`  ${pct(cuantas((t) => /^\d+:\d+/.test(t)))} con «capítulo:versículo» (formato con referencia, como Tyndale)`);
console.log(`  ${pct(cuantas((t) => /^[^.;:]{2,60};/.test(t)))} con unas palabras y «;» (cita sin referencia, como Abbott)`);
console.log(`  ${pct(cuantas((t) => /^[^.;:]{2,60}:/.test(t) && !/^\d+:\d+/.test(t)))} con unas palabras y «:»`);
console.log(`  ${pct(cuantas((t) => /^(?:[IVX]+|\d+)\.\s/.test(t)))} con numeración («I.», «1.»)`);

console.log('\nCosas que suelen pedir una regla (veces · qué · ejemplos):');
fila('abreviatura «&c.»', /&c\.?/g);
fila('viz. / i.e. / e.g. / cf. / cp. / q.d.', /\b(?:viz|i\.e|e\.g|cf|cp|q\.d|sc|ver|comp)\./gi);
fila('raya pegada entre frases (—)', /\S—\S/g);
fila('referencias al estilo antiguo', /\b(?:[1-3] )?[A-Z][a-z]{2,5}\. ?\d+:\d+(?:, ?\d+)*/g);
fila('referencias al estilo e-Sword', /\b[A-Z][a-z]{1,2}\d? \d+:\d+/g);
fila('remisiones «v.» / «ver.» / «ch.»', /\b(?:vv?|ver|chs?|chap)\. ?\d+/gi);
fila('inglés antiguo (thou, thee, hath, -eth)', /\b(?:thou|thee|thy|thine|ye|hath|doth|saith|\w+eth)\b/gi);
fila('listas numeradas (I. · 1. · (1.) · First,)', /(?:^|\s)(?:[IVX]+\.|\(\d+\.?\)|\d+\.)\s|\b(?:First|Secondly|Thirdly|Lastly),/gm);
fila('fórmulas del autor (Observe, Note, Learn)', /\b(?:Observe|Note|Learn hence|Here is|Here we have|See here|Mark)[,:]/g);
fila('latín, griego o hebreo señalado', /\b(?:Greek|Hebrew|Latin|Gr\.|Heb\.|Lat\.|Chaldee|Syriac|Septuagint|LXX|Vulgate)\b/g);
fila('letras griegas o hebreas', /[Ͱ-Ͽ֐-׿]+/g);
fila('nombre divino (LORD, Jehovah, Yahweh)', /\b(?:LORD|Jehovah|Yahweh)\b/g);
fila('otras Biblias y autores citados', /\b(?:margin|marginal|Septuagint|Vulgate|Josephus|Calvin|Luther|Augustine|Chrysostom|Jerome|Grotius|Lightfoot|Whitby|Poole)\b/g);
fila('polémica de época (papists, Romish, heathen)', /\b(?:papists?|popery|popish|Romish|Romanists?|heathens?|Mahometans?|infidels?)\b/gi);
fila('versos o himnos (líneas cortas seguidas)', /(?:^.{10,45}[,;]\n){2,}/gm);
fila('medidas y monedas', /\b(?:miles?|feet|cubits?|furlongs?|talents?|shekels?|pence|penny|pounds?)\b/gi);
fila('comillas rectas o inglesas', /["“”]/g);
fila('corchetes del editor', /\[[^\]]{1,60}\]/g);
