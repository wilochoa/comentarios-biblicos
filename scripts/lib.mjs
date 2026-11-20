// Utilidades compartidas por los scripts del proyecto (sin dependencias).
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DIR_FUENTES = join(ROOT, 'fuentes');
export const DIR_TRADUCCIONES = join(ROOT, 'traducciones');
export const DIR_TRABAJO = join(ROOT, 'trabajo');
export const HELLOAO = 'https://bible.helloao.org/api';

// ---------------------------------------------------------------------------
// Libros: código USFM, nombre y abreviatura en español (estilo RVR) y la
// abreviatura que usa Matthew Henry (e-Sword) en sus referencias.
// ---------------------------------------------------------------------------
export const LIBROS = [
  ['GEN', 'Génesis', 'Gn', 'Gen'], ['EXO', 'Éxodo', 'Éx', 'Exo'], ['LEV', 'Levítico', 'Lv', 'Lev'],
  ['NUM', 'Números', 'Nm', 'Num'], ['DEU', 'Deuteronomio', 'Dt', 'Deu'], ['JOS', 'Josué', 'Jos', 'Jos'],
  ['JDG', 'Jueces', 'Jue', 'Jdg'], ['RUT', 'Rut', 'Rt', 'Rut'], ['1SA', '1 Samuel', '1 S', 'Sa1'],
  ['2SA', '2 Samuel', '2 S', 'Sa2'], ['1KI', '1 Reyes', '1 R', 'Kg1'], ['2KI', '2 Reyes', '2 R', 'Kg2'],
  ['1CH', '1 Crónicas', '1 Cr', 'Ch1'], ['2CH', '2 Crónicas', '2 Cr', 'Ch2'], ['EZR', 'Esdras', 'Esd', 'Ezr'],
  ['NEH', 'Nehemías', 'Neh', 'Neh'], ['EST', 'Ester', 'Est', 'Est'], ['JOB', 'Job', 'Job', 'Job'],
  ['PSA', 'Salmos', 'Sal', 'Psa'], ['PRO', 'Proverbios', 'Pr', 'Pro'], ['ECC', 'Eclesiastés', 'Ec', 'Ecc'],
  ['SNG', 'Cantares', 'Cnt', 'Sol'], ['ISA', 'Isaías', 'Is', 'Isa'], ['JER', 'Jeremías', 'Jer', 'Jer'],
  ['LAM', 'Lamentaciones', 'Lm', 'Lam'], ['EZK', 'Ezequiel', 'Ez', 'Eze'], ['DAN', 'Daniel', 'Dn', 'Dan'],
  ['HOS', 'Oseas', 'Os', 'Hos'], ['JOL', 'Joel', 'Jl', 'Joe'], ['AMO', 'Amós', 'Am', 'Amo'],
  ['OBA', 'Abdías', 'Abd', 'Oba'], ['JON', 'Jonás', 'Jon', 'Jon'], ['MIC', 'Miqueas', 'Mi', 'Mic'],
  ['NAM', 'Nahúm', 'Nah', 'Nah'], ['HAB', 'Habacuc', 'Hab', 'Hab'], ['ZEP', 'Sofonías', 'Sof', 'Zep'],
  ['HAG', 'Hageo', 'Hag', 'Hag'], ['ZEC', 'Zacarías', 'Zac', 'Zac'], ['MAL', 'Malaquías', 'Mal', 'Mal'],
  ['MAT', 'Mateo', 'Mt', 'Mat'], ['MRK', 'Marcos', 'Mr', 'Mar'], ['LUK', 'Lucas', 'Lc', 'Luk'],
  ['JHN', 'Juan', 'Jn', 'Joh'], ['ACT', 'Hechos', 'Hch', 'Act'], ['ROM', 'Romanos', 'Ro', 'Rom'],
  ['1CO', '1 Corintios', '1 Co', 'Co1'], ['2CO', '2 Corintios', '2 Co', 'Co2'], ['GAL', 'Gálatas', 'Gá', 'Gal'],
  ['EPH', 'Efesios', 'Ef', 'Eph'], ['PHP', 'Filipenses', 'Fil', 'Phi'], ['COL', 'Colosenses', 'Col', 'Col'],
  ['1TH', '1 Tesalonicenses', '1 Ts', 'Th1'], ['2TH', '2 Tesalonicenses', '2 Ts', 'Th2'], ['1TI', '1 Timoteo', '1 Ti', 'Ti1'],
  ['2TI', '2 Timoteo', '2 Ti', 'Ti2'], ['TIT', 'Tito', 'Tit', 'Tit'], ['PHM', 'Filemón', 'Flm', 'Plm'],
  ['HEB', 'Hebreos', 'He', 'Heb'], ['JAS', 'Santiago', 'Stg', 'Jam'], ['1PE', '1 Pedro', '1 P', 'Pe1'],
  ['2PE', '2 Pedro', '2 P', 'Pe2'], ['1JN', '1 Juan', '1 Jn', 'Jo1'], ['2JN', '2 Juan', '2 Jn', 'Jo2'],
  ['3JN', '3 Juan', '3 Jn', 'Jo3'], ['JUD', 'Judas', 'Jud', 'Jde'], ['REV', 'Apocalipsis', 'Ap', 'Rev'],
].map(([usfm, nombre, abrev, henry]) => ({ usfm, nombre, abrev, henry }));

const sinAcentos = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const ALIAS = new Map();
for (const l of LIBROS) {
  for (const a of [l.usfm, l.nombre, l.abrev, l.henry]) ALIAS.set(sinAcentos(a), l);
}
// Algunos alias comunes extra
for (const [a, usfm] of [['salmo', 'PSA'], ['sal', 'PSA'], ['cantar de los cantares', 'SNG'], ['phm', 'PHM'], ['jud', 'JUD']]) {
  ALIAS.set(a, LIBROS.find((l) => l.usfm === usfm));
}

export const libroPorCodigo = (usfm) => LIBROS.find((l) => l.usfm === String(usfm).toUpperCase());
export const libroPorAlias = (texto) => ALIAS.get(sinAcentos(texto));

/**
 * "JHN.3.16", "Joh 3:16", "Jn 3:16-18", "1 Juan 4:9" → { libro, capitulo, desde, hasta }.
 */
export function parsearReferencia(ref) {
  const t = ref.trim();
  let m = /^([1-3]?[A-Z]{2,3})\.(\d+)(?:\.(\d+)(?:-(\d+))?)?$/.exec(t);
  if (!m) m = /^(.+?)\s+(\d+)(?::(\d+)(?:\s*[-–]\s*(\d+))?)?$/.exec(t);
  if (!m) return null;
  const libro = libroPorAlias(m[1]);
  if (!libro) return null;
  return {
    libro,
    capitulo: Number(m[2]),
    desde: m[3] ? Number(m[3]) : null,
    hasta: m[4] ? Number(m[4]) : m[3] ? Number(m[3]) : null,
  };
}

export const formatearReferencia = (r) =>
  `${r.libro.abrev} ${r.capitulo}${r.desde ? `:${r.desde}${r.hasta && r.hasta !== r.desde ? `-${r.hasta}` : ''}` : ''}`;

/** Convierte referencias con abreviaturas de Henry ("Joh 3:22", "Co1 1:26") a español ("Jn 3:22", "1 Co 1:26"). */
export function convertirReferencias(texto) {
  return texto.replace(/\b((?:Sa|Kg|Ch|Co|Th|Ti|Pe|Jo)[123]|[A-Z][a-z]{2})(?= \d+:\d+)/g, (abrev) => {
    const libro = LIBROS.find((l) => l.henry === abrev);
    return libro ? libro.abrev : abrev;
  });
}

// ---------------------------------------------------------------------------
// Comentarios y plan
// ---------------------------------------------------------------------------
export const leerJson = (ruta) => JSON.parse(readFileSync(ruta, 'utf8'));
export const comentarios = () => leerJson(join(ROOT, 'comentarios.json')).comentarios;
export const comentario = (id) => {
  const c = comentarios().find((x) => x.id === id);
  if (!c) throw new Error(`Comentario desconocido: ${id}`);
  return c;
};
export const plan = () => leerJson(join(ROOT, 'plan.json'));

// ---------------------------------------------------------------------------
// Fuentes (Free Use Bible API, bible.helloao.org), con caché local en fuentes/
// ---------------------------------------------------------------------------
export async function obtenerJson(rutaApi) {
  const cache = join(DIR_FUENTES, rutaApi.replace(/^\//, ''));
  if (existsSync(cache)) return leerJson(cache);
  const res = await fetch(`${HELLOAO}/${rutaApi.replace(/^\//, '')}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`La fuente respondió ${res.status} para ${rutaApi}`);
  const data = await res.json();
  mkdirSync(dirname(cache), { recursive: true });
  writeFileSync(cache, JSON.stringify(data));
  return data;
}

export const contarPalabras = (texto) => (texto.match(/\S+/g) ?? []).length;
const sha256 = (s) => createHash('sha256').update(s).digest('hex');

/** Libros del comentario según la fuente (introducciones, número de capítulos). */
export async function librosDeFuente(idComentario) {
  const c = comentario(idComentario);
  const data = await obtenerJson(`c/${c.fuente}/books.json`);
  return data?.books ?? [];
}

/**
 * Secciones del original para una unidad: la introducción de un libro
 * (unidad "intro") o un capítulo (unidad = número).
 * Ids: "introduccion"/"resumen" (libro), "intro" (capítulo) y "v<N>" (sección que empieza en el versículo N).
 */
export async function cargarFuente(idComentario, usfm, unidad) {
  const c = comentario(idComentario);
  let secciones = [];
  let url;
  if (unidad === 'intro') {
    url = `${HELLOAO}/c/${c.fuente}/books.json`;
    const libro = (await librosDeFuente(idComentario)).find((b) => b.id === usfm);
    if (!libro) return null;
    if (libro.introduction?.trim()) secciones.push({ id: 'introduccion', texto: libro.introduction.trim() });
    if (libro.introductionSummary?.trim()) secciones.push({ id: 'resumen', texto: libro.introductionSummary.trim() });
  } else {
    url = `${HELLOAO}/c/${c.fuente}/${usfm}/${unidad}.json`;
    const data = await obtenerJson(`c/${c.fuente}/${usfm}/${unidad}.json`);
    if (!data) return null;
    const cap = data.chapter ?? {};
    if (cap.introduction?.trim()) secciones.push({ id: 'intro', texto: cap.introduction.trim() });
    for (const item of cap.content ?? []) {
      if (item.type !== 'verse') continue;
      const texto = (item.content ?? []).filter((x) => typeof x === 'string').join('\n\n').trim();
      if (texto) secciones.push({ id: `v${item.number}`, texto });
    }
  }
  if (!secciones.length) return null;
  secciones = secciones.map((s) => ({ ...s, palabras: contarPalabras(s.texto) }));
  return { url, sha256: sha256(JSON.stringify(secciones.map((s) => [s.id, s.texto]))), secciones };
}

// ---------------------------------------------------------------------------
// Archivos de traducción: Markdown con encabezado y secciones "## <id>"
// ---------------------------------------------------------------------------
export const ESTADOS = ['parcial', 'borrador', 'revisado'];
export const CAMPOS = ['comentario', 'libro', 'unidad', 'estado', 'fuente', 'fuente_sha256', 'traducido_por', 'traducido_el', 'revisado_por', 'revisado_el'];

export const rutaTraduccion = (idComentario, usfm, unidad) =>
  join(DIR_TRADUCCIONES, idComentario, usfm, unidad === 'intro' ? 'intro.md' : `${unidad}.md`);

export function parsearMarkdown(texto) {
  const meta = {};
  let cuerpo = texto;
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(texto);
  if (m) {
    for (const linea of m[1].split('\n')) {
      const i = linea.indexOf(':');
      if (i < 0) continue;
      const valor = linea.slice(i + 1).trim();
      meta[linea.slice(0, i).trim()] = valor === '' ? null : valor;
    }
    cuerpo = texto.slice(m[0].length);
  }
  const secciones = [];
  let actual = null;
  for (const linea of cuerpo.split('\n')) {
    const h = /^## (\S+)\s*$/.exec(linea);
    if (h) {
      actual = { id: h[1], lineas: [] };
      secciones.push(actual);
    } else if (actual) {
      actual.lineas.push(linea);
    }
  }
  return {
    meta,
    secciones: secciones.map((s) => ({ id: s.id, texto: s.lineas.join('\n').trim() })),
  };
}

export function serializarMarkdown(meta, secciones) {
  const cabecera = CAMPOS.map((k) => `${k}: ${meta[k] ?? ''}`.trimEnd()).join('\n');
  const cuerpo = secciones.map((s) => `## ${s.id}\n\n${s.texto.trim()}\n`).join('\n');
  return `---\n${cabecera}\n---\n\n${cuerpo}`;
}

export const leerTraduccion = (ruta) => (existsSync(ruta) ? parsearMarkdown(readFileSync(ruta, 'utf8')) : null);

export function guardarTraduccion(ruta, meta, secciones) {
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, serializarMarkdown(meta, secciones));
}

export const hoy = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Revisión automática de una sección traducida
// ---------------------------------------------------------------------------
const PALABRAS_INGLES = new Set(['the', 'and', 'of', 'that', 'which', 'is', 'was', 'with', 'this', 'are', 'were', 'his', 'they', 'not', 'be', 'by', 'it']);

export function revisarSeccion(original, traduccion) {
  const errores = [];
  const en = contarPalabras(original);
  const es = contarPalabras(traduccion);
  if (!es) return ['está vacía'];
  if (en >= 40) {
    const razon = es / en;
    if (razon < 0.7) errores.push(`parece incompleta (${es} palabras para ${en} del original)`);
    if (razon > 1.9) errores.push(`es mucho más larga que el original (${es} contra ${en}); ¿se agregó contenido?`);
  }
  const palabras = traduccion.toLowerCase().match(/[a-záéíóúñü]+/g) ?? [];
  const ingles = palabras.filter((p) => PALABRAS_INGLES.has(p)).length;
  if (palabras.length >= 30 && ingles / palabras.length > 0.04) errores.push('parece tener texto en inglés sin traducir');
  if (/\b(TODO|PENDIENTE|\[\.\.\.\])\b/.test(traduccion)) errores.push('tiene marcas de pendiente');
  return errores;
}

/**
 * Valida un archivo de traducción contra su fuente. Devuelve { errores, avisos }.
 * Con `citasComoAviso`, las citas del versículo que no siguen la RVA quedan
 * como aviso (para publicar mientras se corrigen las traducciones antiguas).
 */
export async function validarArchivo(ruta, { citasComoAviso = false } = {}) {
  const errores = [];
  const avisos = [];
  const doc = leerTraduccion(ruta);
  if (!doc) return { errores: ['no existe'], avisos };
  const { meta, secciones } = doc;
  for (const k of ['comentario', 'libro', 'unidad', 'estado', 'fuente_sha256', 'traducido_por', 'traducido_el']) {
    if (!meta[k]) errores.push(`falta "${k}" en el encabezado`);
  }
  if (meta.estado && !ESTADOS.includes(meta.estado)) errores.push(`estado inválido: ${meta.estado}`);
  if (meta.estado === 'revisado' && (!meta.revisado_por || !meta.revisado_el)) errores.push('un archivo revisado necesita revisado_por y revisado_el');
  if (errores.length) return { errores, avisos };

  const fuente = await cargarFuente(meta.comentario, meta.libro, meta.unidad === 'intro' ? 'intro' : Number(meta.unidad));
  if (!fuente) return { errores: ['no se encontró el original'], avisos };
  if (fuente.sha256 !== meta.fuente_sha256) avisos.push('el original cambió desde que se tradujo');

  const originales = new Map(fuente.secciones.map((s) => [s.id, s.texto]));
  const vistos = new Set();
  for (const s of secciones) {
    if (vistos.has(s.id)) errores.push(`sección repetida: ${s.id}`);
    vistos.add(s.id);
    if (!originales.has(s.id)) {
      errores.push(`sección que no existe en el original: ${s.id}`);
      continue;
    }
    for (const e of revisarSeccion(originales.get(s.id), s.texto)) errores.push(`${s.id}: ${e}`);
    const { erroresDeForma, revisarCitas } = await import('./citas.mjs');
    for (const e of erroresDeForma(s.texto)) errores.push(`${s.id}: ${e}`);
    for (const e of await revisarCitas({ libro: meta.libro, original: originales.get(s.id), traduccion: s.texto })) {
      (citasComoAviso ? avisos : errores).push(`${s.id}: ${e}`);
    }
  }
  const faltan = fuente.secciones.filter((s) => !vistos.has(s.id)).map((s) => s.id);
  if (meta.estado !== 'parcial' && faltan.length) errores.push(`estado "${meta.estado}" pero faltan secciones: ${faltan.join(', ')}`);
  if (meta.estado === 'parcial' && !faltan.length) avisos.push('tiene todas las secciones: debería estar en "borrador"');
  return { errores, avisos };
}
