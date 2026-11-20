// Reglas de forma de las traducciones que se pueden revisar solas:
//
// 1. Citas del versículo («lemas»): cuando Tyndale cita el versículo que
//    comenta («51:2 Wash me . . . Purify me: The psalmist…»), la traducción usa
//    el texto de la Reina-Valera 1909, no una traducción del inglés. Si la RVA
//    dice algo distinto y la nota explica justamente esa palabra, la frase va en
//    cursiva (*gobernantes (o dioses)*:) y no se revisa.
// 2. Detalles mecánicos que unir.mjs corrige solo: «...» → «…», sin punto
//    después de la referencia inicial («Sal 51 Texto», no «Sal 51. Texto») y
//    sin comillas «» alrededor de la cita del versículo.
import { obtenerJson } from './lib.mjs';
import { modernizar } from './versiculo.mjs';

// ---------------------------------------------------------------------------
// Texto de la RVA 1909
// ---------------------------------------------------------------------------
async function versos(traduccion, usfm, capitulo) {
  const cap = await obtenerJson(`${traduccion}/${usfm}/${capitulo}.json`);
  const lista = (cap?.chapter?.content ?? []).filter((x) => x.type === 'verse');
  const plano = (v) => (v.content ?? []).map((c) => (typeof c === 'string' ? c : c?.text ?? '')).join(' ');
  return new Map(lista.map((v) => [v.number, plano(v)]));
}

export async function versosRva(usfm, capitulo) {
  const mapa = await versos('spa_r09', usfm, capitulo);
  return new Map([...mapa].map(([n, t]) => [n, modernizar(t)]));
}

/**
 * Texto en inglés del versículo (Berean Standard Bible y King James, dominio
 * público), para saber si una frase del original en inglés es una cita del
 * versículo o una oración del propio Tyndale que termina en «:».
 */
async function versosIngles(usfm, capitulo) {
  const [bsb, kjv] = await Promise.all([versos('BSB', usfm, capitulo), versos('eng_kjv', usfm, capitulo)]);
  const mapa = new Map();
  for (const [n, t] of bsb) mapa.set(n, `${t} ${kjv.get(n) ?? ''}`);
  return mapa;
}

// ---------------------------------------------------------------------------
// Correcciones mecánicas (las aplica unir.mjs)
// ---------------------------------------------------------------------------
const REF_INICIAL_CON_PUNTO = /^((?:[1-3]\s?)?[A-ZÁÉÍÓÚ][a-záéíóúñ]{0,4}\.?\s\d+(?:[–-]\d+)?)\.(\s)/gm;
const LEMA_ENTRE_COMILLAS = /^(\d+:\d+(?:[-–]\d+)?\s)«([^»\n]{1,120})»(?=:\s)/gm;
const VINETA_ENTRE_COMILLAS = /(•\s)«([^»\n]{1,120})»(?=:\s)/g;

export function normalizarForma(texto) {
  return texto
    .replace(/\.\s?\.\s?\./g, '…')
    .replace(REF_INICIAL_CON_PUNTO, '$1$2')
    .replace(LEMA_ENTRE_COMILLAS, '$1$2')
    .replace(VINETA_ENTRE_COMILLAS, '$1$2');
}

/** Errores de forma (para archivos editados a mano; unir.mjs ya los corrige). */
export function erroresDeForma(texto) {
  const errores = [];
  if (/\.\s?\.\s?\./.test(texto)) errores.push('usa «...»: escribe «…»');
  if (new RegExp(REF_INICIAL_CON_PUNTO.source, 'm').test(texto)) {
    errores.push('la referencia inicial lleva punto: escribe «Sal 51 Texto», no «Sal 51. Texto»');
  }
  if (new RegExp(LEMA_ENTRE_COMILLAS.source, 'm').test(texto) || new RegExp(VINETA_ENTRE_COMILLAS.source).test(texto)) {
    errores.push('la cita del versículo va sin comillas: «51:2 Lávame más y más…:», no «51:2 «Lávame»:»');
  }
  return errores;
}

// ---------------------------------------------------------------------------
// Citas del versículo
// ---------------------------------------------------------------------------
const parrafos = (texto) => texto.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
// «51:2 Frase: texto» al inicio del párrafo, o «• Frase: texto» dentro de él.
const REF_INICIO = /^(\d+):(\d+)(?:\s*[-–]\s*(\d+))?\s/;
const LEMA_INICIO = /^(\d+):(\d+)(?:\s*[-–]\s*(\d+))?\s+([^:•\n]{2,110}?):\s/;
const LEMA_VINETA = /•\s+([^:•\n]{2,110}?):\s/g;

// Una cita del versículo es una frase corta; una oración larga terminada en «:» no lo es.
const esFrase = (frase) => !/\d/.test(frase) && frase.split(/\s+/).length <= 8 && !/[.;!?]\s/.test(frase);

/** Citas del versículo en un texto: [{ clave, capitulo, desde, hasta, frase }]. */
export function citasDe(texto) {
  const citas = [];
  for (const p of parrafos(texto.replace(/\.\s?\.\s?\./g, '…'))) {
    const r = REF_INICIO.exec(p);
    if (!r) continue;
    const capitulo = Number(r[1]);
    const desde = Number(r[2]);
    const hasta = r[3] ? Number(r[3]) : desde;
    const ref = `${capitulo}:${desde}${r[3] ? `-${hasta}` : ''}`;
    const m = LEMA_INICIO.exec(p);
    if (m && esFrase(m[4])) citas.push({ clave: `${ref}#0`, ref, capitulo, desde, hasta, frase: m[4].trim() });
    let n = 0;
    for (const v of p.matchAll(LEMA_VINETA)) {
      n++;
      if (esFrase(v[1])) citas.push({ clave: `${ref}#${n}`, ref, capitulo, desde, hasta, frase: v[1].trim() });
    }
  }
  return citas;
}

const VACIAS_EN = new Set(['the', 'and', 'that', 'his', 'her', 'their', 'you', 'your', 'for', 'with', 'from', 'this', 'was', 'were', 'are', 'not', 'him', 'them', 'they', 'will', 'shall', 'have', 'had', 'has', 'who', 'what', 'all', 'but', 'into', 'upon', 'unto']);
const palabrasEn = (s) => s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 3 && !VACIAS_EN.has(w));
const raizEn = (w) => w.replace(/(ing|ed|es|s)$/, '').slice(0, 5);

const VACIAS = new Set(['los', 'las', 'del', 'que', 'por', 'con', 'una', 'uno', 'unos', 'mis', 'sus', 'tus', 'nos', 'les', 'para', 'como', 'pero', 'más', 'mas', 'este', 'esta', 'ese', 'esa', 'son', 'fue', 'ser', 'hay', 'muy', 'sin', 'entre', 'sobre', 'cuando', 'donde', 'todo', 'toda', 'todos', 'todas']);
// Sin acentos ni «h» (la RVA de 1909 escribe «Thare», «Jehová»…).
const palabras = (s) =>
  s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-zñ\s]/g, ' ').replace(/h/g, '')
    .split(/\s+/).filter((w) => w.length >= 3 && !VACIAS.has(w));
// Raíz simple para tolerar flexión («quebrantado» / «quebrantaste»).
const raiz = (w) => w.slice(0, Math.max(4, Math.ceil(w.length * 0.7)));

/** Qué tanto de la frase está en el texto de la RVA (0 a 1). */
export function cobertura(frase, rva) {
  const objetivo = palabras(frase.replace(/\([^)]*\)/g, ' '));
  if (!objetivo.length) return 1;
  const raices = new Set(palabras(rva).map(raiz));
  return objetivo.filter((w) => raices.has(raiz(w))).length / objetivo.length;
}

const enRango = (mapa, c, margen) => {
  const out = [];
  for (let v = c.desde - margen; v <= c.hasta + margen; v++) if (mapa.has(v)) out.push(mapa.get(v));
  return out.join(' ');
};

/** ¿La frase en inglés sale del versículo? (si no, es una oración de Tyndale, no una cita). */
async function esCitaDelVersiculo(libro, c) {
  const ingles = enRango(await versosIngles(libro, c.capitulo), c, 1);
  if (!ingles) return false;
  const objetivo = palabrasEn(c.frase.replace(/\([^)]*\)/g, ' '));
  if (!objetivo.length) return false;
  const raices = new Set(palabrasEn(ingles).map(raizEn));
  return objetivo.filter((w) => raices.has(raizEn(w))).length / objetivo.length >= 0.5;
}

/**
 * Revisa las citas del versículo de una sección contra la RVA 1909. Solo
 * revisa las frases que en el original en inglés son de verdad una cita del
 * versículo (están en el texto bíblico en inglés), no las oraciones de Tyndale
 * que terminan en «:».
 */
export async function revisarCitas({ libro, original, traduccion }) {
  const citasOriginal = new Map(citasDe(original).map((c) => [c.clave, c]));
  const errores = [];
  for (const c of citasDe(traduccion)) {
    const enIngles = citasOriginal.get(c.clave);
    if (!enIngles || /^\*.*\*$/.test(c.frase)) continue;
    if (!(await esCitaDelVersiculo(libro, enIngles))) continue;
    const versos = await versosRva(libro, c.capitulo);
    if (!versos.size) continue;
    // Un versículo de margen: la numeración de la RVA a veces difiere en uno.
    const rva = [];
    for (let v = c.desde - 1; v <= c.hasta + 1; v++) if (versos.has(v)) rva.push(versos.get(v));
    if (!rva.length || cobertura(c.frase, rva.join(' ')) >= 0.6) continue;
    const exacto = [];
    for (let v = c.desde; v <= c.hasta; v++) if (versos.has(v)) exacto.push(versos.get(v));
    errores.push(
      `la cita «${c.frase}» (${c.ref}) no sale de la RVA 1909, que dice: «${(exacto.length ? exacto : rva).join(' ')}». ` +
        'Usa las palabras de la RVA (solo la parte que la nota cita; «…» si saltas texto). Si la RVA dice algo distinto ' +
        'y la nota explica justamente esa palabra, escribe la frase en cursiva: *frase*:',
    );
  }
  return errores;
}
