// Prepara el original de Calvino (fuente CCEL, `john-calvin`) para traducir
// solo el texto de Calvino. Lo usa lib.mjs → cargarFuente() para "calvino".
//
// 1. Quita el bloque de versículos del inicio de cada sección (encabezado
//    «Romans 3:1-2», cada versículo en inglés y su línea latina): la
//    publicación muestra la RVA, y el latín no se traduce.
// 2. Quita las notas de los editores ingleses (bloques «Footnotes:» y sus
//    llamadas [87]); conserva la oración final y los colofones que la fuente
//    pegó después de las notas.
// 3. Recupera de la versión CrossWire (`calvincommentaries`) los párrafos de
//    Calvino que CCEL perdió: inicios de lecciones, argumentos de los salmos,
//    argumentos de las epístolas.
// 4. Armonía de los Evangelios: una sección que ya está en un Evangelio
//    anterior (Mateo, luego Marcos) no se vuelve a traducir en Marcos o Lucas.
import { obtenerJson } from './lib.mjs';

const INGLES_A_USFM = Object.fromEntries(
  ('Genesis GEN|Exodus EXO|Leviticus LEV|Numbers NUM|Deuteronomy DEU|Joshua JOS|Psalm PSA|Psalms PSA|Isaiah ISA|Jeremiah JER|' +
    'Lamentations LAM|Ezekiel EZK|Daniel DAN|Hosea HOS|Joel JOL|Amos AMO|Obadiah OBA|Jonah JON|Micah MIC|Nahum NAM|Habakkuk HAB|' +
    'Zephaniah ZEP|Haggai HAG|Zechariah ZEC|Malachi MAL|Matthew MAT|Mark MRK|Luke LUK|John JHN|Acts ACT|Romans ROM|' +
    '1 Corinthians 1CO|2 Corinthians 2CO|Galatians GAL|Ephesians EPH|Philippians PHP|Colossians COL|1 Thessalonians 1TH|' +
    '2 Thessalonians 2TH|1 Timothy 1TI|2 Timothy 2TI|Titus TIT|Philemon PHM|Hebrews HEB|James JAS|1 Peter 1PE|2 Peter 2PE|1 John 1JN|Jude JUD')
    .split('|')
    .map((x) => [x.slice(0, x.lastIndexOf(' ')), x.slice(x.lastIndexOf(' ') + 1)]),
);
const REF = /((?:[1-3]\s)?[A-Z][a-z]+)\s?(\d+)(?::[\d,\s\-–]*)?/g;
/** Un párrafo que solo tiene referencias («Romans 3:1-2», «Luke 3:19-20; Luke 4:14»). */
export const esEncabezado = (p) => /\d+:\d+/.test(p) && !p.replace(REF, '').replace(/[\s;:,.\-–\d]/g, '');
/** Capítulos que nombran los encabezados: [[USFM, capítulo]]. */
const capitulosDe = (p) => [...p.matchAll(REF)].map((m) => [INGLES_A_USFM[m[1]], Number(m[2])]).filter(([u]) => u);
const NOTAS = /^\s*Footnotes:\s*$/;
const LLAMADA = /\s?\[\d+\]/g;
const SE_CONSERVA_TRAS_NOTAS = /^(?:PRAYER\.?|Prayer\.?|Grant,? (?:Almighty|O) |Amen|End of |Praise be to God|Glory be to God)/;

const LATIN = new Set('et est in ad qui quae quod non ut enim autem sed cum ex de per sunt eius ejus super nos vos tibi mihi hoc dixit dei domini jehovae quia vel atque etiam nempe illis ille illa erat fuit sicut dicendo vestri nostri suis suum tuum meum'.split(' '));
const INGLES = new Set('the and of to that which is was he his they them this with for be not are'.split(' '));
const VACIAS = new Set([...INGLES, 'shall', 'unto', 'thou', 'thee', 'thy', 'have', 'hath', 'who', 'from', 'all', 'but', 'him', 'their', 'there', 'when', 'will', 'were', 'what', 'upon', 'into', 'out', 'your', 'you', 'our', 'ye']);

const palabras = (t) => t.toLowerCase().normalize('NFD').replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
const clave = (t) => t.toLowerCase().normalize('NFD').replace(/\[\d+\]|\(\d+\)/g, '').replace(/[^a-z]/g, '');

export function esLatin(parrafo) {
  const ps = palabras(parrafo);
  if (ps.length < 4) return false;
  const lat = ps.filter((p) => LATIN.has(p)).length / ps.length;
  const ing = ps.filter((p) => INGLES.has(p)).length / ps.length;
  return lat >= 0.12 && ing < 0.05;
}

/** Qué parte de las palabras del párrafo está en el texto bíblico en inglés (0 a 1). */
export function cobertura(parrafo, biblia) {
  const ps = palabras(parrafo).filter((p) => p.length >= 3 && !VACIAS.has(p));
  if (!ps.length) return 0;
  return ps.filter((p) => biblia.has(p)).length / ps.length;
}

const numeros = (p) => (p.match(/(?:^|\s)\d+\.\s+\S/g) ?? []).length;

const bibliasIngles = new Map();
/** Texto bíblico en inglés del capítulo y de los que nombran los encabezados de la sección (armonías). */
export async function bibliaDeSeccion(usfm, capitulo, texto) {
  const caps = [[usfm, capitulo]];
  for (const p of texto.split(/\n\n/).slice(0, 8)) if (esEncabezado(p)) caps.push(...capitulosDe(p));
  const sets = await Promise.all(caps.map(([u, c]) => bibliaIngles(u, c)));
  return sets.length === 1 ? sets[0] : new Set(sets.flatMap((x) => [...x]));
}

async function bibliaIngles(usfm, capitulo) {
  const k = `${usfm}/${capitulo}`;
  if (!bibliasIngles.has(k)) {
    bibliasIngles.set(
      k,
      (async () => {
        const set = new Set();
        for (const t of ['eng_kjv', 'BSB']) {
          const cap = await obtenerJson(`${t}/${usfm}/${capitulo}.json`).catch(() => null);
          for (const v of cap?.chapter?.content ?? []) {
            if (v.type !== 'verse') continue;
            for (const c of v.content ?? []) for (const p of palabras(typeof c === 'string' ? c : c?.text ?? '')) set.add(p);
          }
        }
        return set;
      })(),
    );
  }
  return bibliasIngles.get(k);
}

/** Párrafos de una sección sin bloque de versículos ni notas del editor. */
export function limpiarParrafos(parrafos, biblia, { bloquesEnCualquierLugar = false } = {}) {
  const out = [];
  let enNotas = false;
  let alInicio = true;
  let anterior = null;
  for (const crudo of parrafos) {
    const p = crudo.trim();
    if (!p) continue;
    if (NOTAS.test(p)) {
      enNotas = true;
      continue;
    }
    if (enNotas) {
      // La oración y los colofones quedaron a veces dentro de las notas.
      const i = p.search(/PRAYER\.|Grant,? Almighty God/);
      if (SE_CONSERVA_TRAS_NOTAS.test(p)) out.push(p);
      else if (i > 0) out.push(p.slice(i));
      continue;
    }
    if (alInicio || bloquesEnCualquierLugar) {
      // Bloque de versículos: encabezados, cada versículo en inglés y, debajo, su línea latina.
      if (esEncabezado(p)) continue;
      const num = /^(\d+)\.\s/.exec(p)?.[1];
      const cob = cobertura(p, biblia);
      const esVerso = Boolean(num) && (numeros(p) >= 2 ? cob >= 0.45 : cob >= 0.7 && palabras(p).length <= 120);
      const esSuLatin = Boolean(num) && anterior?.tipo === 'verso' && anterior.num === num && cob < 0.5;
      if (esVerso || esSuLatin || esLatin(p)) {
        anterior = { num, tipo: esVerso ? 'verso' : 'latin' };
        continue;
      }
      anterior = null;
      alInicio = false;
    }
    out.push(p.replace(LLAMADA, ''));
  }
  return out;
}

// Párrafos de CrossWire que no son de Calvino (portadas, prefacios del
// traductor, disertaciones, apéndices, índices, marcado).
const EDITOR = /\bthe Editor\b|\bEditor's\b|\bthe Translator\b/;
const BASURA = /<\/?div|sID=|eID=|Calvin Translation Society|TRANSLATOR|Translator's Preface|PREFACE|DEDICATION|INDEX|Index of|A Translation of Calvin|Calvin's Version|Dissertation|Edinburgh|Printed for/;

// Para comparar las dos ediciones: palabras de 4 letras o más (así no influyen
// el hebreo y el griego, que CCEL transliteró y CrossWire trae en su alfabeto,
// ni la puntuación ni las comillas).
const firma = (t) => palabras(t.replace(/\[\d+\]|\(\d+\)/g, ' ')).filter((p) => p.length >= 4);
const ventanas = (ps) => {
  if (ps.length < 6) return [ps.join(' ')];
  const medio = Math.floor((ps.length - 6) / 2);
  return [0, medio, ps.length - 6].map((i) => ps.slice(i, i + 6).join(' '));
};
const esIngles = (p) => {
  const ps = palabras(p);
  return ps.length < 6 || ps.filter((x) => INGLES.has(x)).length / ps.length >= 0.06;
};

async function recuperarDeCrossWire(usfm, capitulo, secciones, ultimoCapitulo) {
  // GEN 1: portada y prefacio del traductor. Último capítulo de cada libro:
  // apéndices («Calvin's Version»), índices y disertaciones del editor.
  if (usfm === 'GEN' && capitulo === 1) return secciones;
  const cw = await obtenerJson(`c/calvincommentaries/${usfm}/${capitulo}.json`).catch(() => null);
  if (!cw) return secciones;
  const versos = (cw.chapter?.content ?? []).filter((v) => v.type === 'verse');
  const ultimoVerso = versos.at(-1)?.number;
  const texto = ' ' + secciones.map((s) => firma(s.parrafos.join(' ')).join(' ')).join(' | ') + ' ';
  const posicion = (vs) => {
    for (let i = 0; i < secciones.length; i++) {
      const j = secciones[i].parrafos.findIndex((p) => {
        const f = ' ' + firma(p).join(' ') + ' ';
        return vs.some((v) => f.includes(' ' + v + ' '));
      });
      if (j >= 0) return [i, j];
    }
    return null;
  };
  let pendientes = [];
  const insertar = (i, j) => {
    if (!pendientes.length) return;
    secciones[i].parrafos.splice(j, 0, ...pendientes);
    pendientes = [];
  };
  for (const v of versos) {
    if (capitulo === ultimoCapitulo && v.number === ultimoVerso) break;
    // En CrossWire los bloques de versículos quedaron al final de la sección anterior: se quitan donde estén.
    const crudo = (v.content ?? []).filter((c) => typeof c === 'string').join('\n');
    const parrafos = limpiarParrafos(crudo.split(/\n+/), await bibliaDeSeccion(usfm, capitulo, crudo.replace(/\n+/g, '\n\n')), {
      bloquesEnCualquierLugar: true,
    });
    for (const p of parrafos) {
      const f = firma(p);
      if (f.length < 6) continue;
      const vs = ventanas(f);
      if (vs.some((x) => texto.includes(' ' + x + ' '))) {
        const donde = posicion(vs);
        if (donde) insertar(...donde);
        continue;
      }
      if (BASURA.test(p) || EDITOR.test(p) || palabras(p).length < 12 || !esIngles(p)) continue;
      pendientes.push(p.replace(/’/g, "'").replace(/[“”]/g, '"'));
    }
  }
  if (pendientes.length && secciones.length) insertar(secciones.length - 1, secciones.at(-1).parrafos.length);
  return secciones;
}

const EVANGELIOS = ['MAT', 'MRK', 'LUK'];

/** Secciones de CCEL ya limpias, sin recuperar nada (para comparar la armonía). */
async function seccionesLimpias(usfm, capitulo) {
  const cap = await obtenerJson(`c/john-calvin/${usfm}/${capitulo}.json`).catch(() => null);
  const salida = [];
  for (const v of (cap?.chapter?.content ?? []).filter((x) => x.type === 'verse')) {
    const texto = (v.content ?? []).filter((c) => typeof c === 'string').join('\n\n');
    salida.push(limpiarParrafos(texto.split(/\n\n/), await bibliaDeSeccion(usfm, capitulo, texto), { bloquesEnCualquierLugar: true }).filter((p) => !EDITOR.test(p)).join('\n\n'));
  }
  return salida;
}

const clavesEvangelio = new Map();
async function clavesDe(usfm) {
  if (!clavesEvangelio.has(usfm)) {
    clavesEvangelio.set(
      usfm,
      (async () => {
        const set = new Set();
        const libro = (await obtenerJson('c/john-calvin/books.json'))?.books?.find((b) => b.id === usfm);
        for (let c = 1; c <= (libro?.numberOfChapters ?? 0); c++) {
          for (const t of await seccionesLimpias(usfm, c)) if (t) set.add(clave(t).slice(0, 400));
        }
        return set;
      })(),
    );
  }
  return clavesEvangelio.get(usfm);
}

/** Secciones preparadas de un capítulo de Calvino: [{ id, texto }]. */
export async function prepararCalvino(usfm, capitulo, secciones) {
  const biblia = await bibliaIngles(usfm, capitulo);
  let preparadas = [];
  for (const s of secciones) {
    // CCEL repite el bloque (versículo y latín) en medio de algunas secciones largas: se quita donde esté.
    const parrafos = limpiarParrafos(s.texto.split(/\n\n/), await bibliaDeSeccion(usfm, capitulo, s.texto), { bloquesEnCualquierLugar: true });
    preparadas.push({ id: s.id, parrafos: parrafos.filter((p) => !EDITOR.test(p)) });
  }
  // Armonía: fuera las secciones que ya están en un Evangelio anterior (se compara antes de recuperar).
  const i = EVANGELIOS.indexOf(usfm);
  if (i > 0) {
    const anteriores = await Promise.all(EVANGELIOS.slice(0, i).map(clavesDe));
    preparadas = preparadas.filter((s) => !anteriores.some((set) => set.has(clave(s.parrafos.join('\n\n')).slice(0, 400))));
  }
  const libro = (await obtenerJson('c/john-calvin/books.json'))?.books?.find((b) => b.id === usfm);
  preparadas = await recuperarDeCrossWire(usfm, capitulo, preparadas, libro?.numberOfChapters);
  return preparadas.map((s) => ({ id: s.id, texto: s.parrafos.join('\n\n').trim() })).filter((s) => s.texto);
}
