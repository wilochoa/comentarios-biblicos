// Lotes: el trabajo que toma un voluntario de una vez.
//
// Un lote son unidades seguidas (introducción o capítulos) de UN libro, hasta
// LOTE_PALABRAS del original. Se arman con plan.json y datos/tamanos.json, sin
// red, así que su id ("tyndale-JDG-1-7") es estable mientras no cambien esos
// archivos. Un voluntario reserva un lote abriendo un PR en borrador desde su
// fork (scripts/tomar.mjs); los demás leen los PRs abiertos y lo saltan.
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT, comentario, leerJson, leerTraduccion, libroPorCodigo, plan, rutaTraduccion } from './lib.mjs';

export const LOTE_PALABRAS = 10000;
/** Un PR en borrador sin movimiento en estas horas se considera abandonado. */
export const HORAS_ABANDONO = 24;
const ARCHIVO_LOTE = join(ROOT, '.lote.json');

const ordenUnidades = (a, b) => (a === 'intro' ? -1 : b === 'intro' ? 1 : Number(a) - Number(b));

/**
 * Todos los lotes del plan, en orden. Puro: recibe plan y tamaños.
 * Cada lote: { id, comentario, libro, unidades, archivos, palabras, nombre }.
 */
export function construirLotes({ plan: elPlan, tamanos, palabras = LOTE_PALABRAS }) {
  const lotes = [];
  const vistos = new Set();
  for (const fase of elPlan.fases) {
    const medidas = tamanos[fase.comentario];
    if (!medidas) throw new Error(`Falta medir "${fase.comentario}": corre node scripts/medir.mjs ${fase.comentario}`);
    for (const libro of fase.libros) {
      const delLibro = medidas[libro];
      if (!delLibro) continue;
      const unidades = Object.keys(delLibro)
        .filter((u) => (fase.tipo === 'intro' ? u === 'intro' : fase.tipo === 'capitulos' ? u !== 'intro' : true))
        .sort(ordenUnidades);
      let actual = null;
      const cerrar = () => {
        if (!actual) return;
        const primera = actual.unidades[0];
        const ultima = actual.unidades.at(-1);
        actual.id = `${fase.comentario}-${libro}-${primera}${ultima !== primera ? `-${ultima}` : ''}`;
        if (!vistos.has(actual.id)) {
          vistos.add(actual.id);
          lotes.push(actual);
        }
        actual = null;
      };
      for (const unidad of unidades) {
        const p = delLibro[unidad][0];
        if (actual && actual.palabras + p > palabras) cerrar();
        actual ??= { id: '', comentario: fase.comentario, libro, unidades: [], archivos: [], palabras: 0 };
        actual.unidades.push(unidad);
        actual.archivos.push(relative(ROOT, rutaTraduccion(fase.comentario, libro, unidad)));
        actual.palabras += p;
      }
      cerrar();
    }
  }
  for (const l of lotes) l.nombre = nombreLote(l);
  return lotes;
}

/** "Jueces 1–7", "introducción de Juan", "Juan: introducción y 1–4". */
export function nombreLote({ libro, unidades }) {
  const nombre = libroPorCodigo(libro)?.nombre ?? libro;
  const caps = unidades.filter((u) => u !== 'intro');
  const rango = caps.length ? (caps.length > 1 ? `${caps[0]}–${caps.at(-1)}` : caps[0]) : '';
  if (!unidades.includes('intro')) return `${nombre} ${rango}`;
  return rango ? `${nombre}: introducción y ${rango}` : `introducción de ${nombre}`;
}

export const lotesDelPlan = () => construirLotes({ plan: plan(), tamanos: leerJson(join(ROOT, 'datos', 'tamanos.json')) });

/** ¿Falta traducir este archivo? (no existe o está a medias). */
export function pendiente(archivo) {
  const doc = leerTraduccion(join(ROOT, archivo));
  return !doc || doc.meta.estado === 'parcial';
}

/**
 * Los lotes que se pueden tomar, en orden: con algo pendiente y sin ningún
 * archivo pendiente ocupado por otro (reservas/ o lotes de otros PRs).
 * Cada uno trae `pendientes` (sus archivos por traducir).
 */
export function lotesLibres(lotes, { ocupados = new Set(), comentarios = [], libros = [], esPendiente = pendiente } = {}) {
  const libres = [];
  for (const lote of lotes) {
    if (comentarios.length && !comentarios.includes(lote.comentario)) continue;
    if (libros.length && !libros.includes(lote.libro)) continue;
    const pendientes = lote.archivos.filter(esPendiente);
    if (!pendientes.length || pendientes.some((a) => ocupados.has(a))) continue;
    libres.push({ ...lote, pendientes });
  }
  return libres;
}

// ---------------------------------------------------------------------------
// El lote que esta carpeta tiene tomado (.lote.json, no se sube)
// ---------------------------------------------------------------------------
export const hayLote = () => existsSync(ARCHIVO_LOTE);
export const leerLote = () => (hayLote() ? JSON.parse(readFileSync(ARCHIVO_LOTE, 'utf8')) : null);
export const guardarLote = (lote) => writeFileSync(ARCHIVO_LOTE, `${JSON.stringify(lote, null, 2)}\n`);
export const soltarLote = () => rmSync(ARCHIVO_LOTE, { force: true });

// ---------------------------------------------------------------------------
// El lote viaja en el cuerpo del PR, en un comentario HTML con JSON
// ---------------------------------------------------------------------------
const MARCA = /<!--\s*lote\s*\n([\s\S]*?)\n\s*-->/;

const licencia = (id) => {
  try {
    return comentario(id).licencia_traduccion;
  } catch {
    return 'ver comentarios.json';
  }
};

export const tituloPr = (lote) => `[lote ${lote.id}] ${lote.nombre}`;

export function cuerpoPr(lote, { hechos = 0, estado = 'en curso' } = {}) {
  const datos = { id: lote.id, archivos: lote.archivos, quien: lote.quien, modelo: lote.modelo, desde: lote.desde };
  return [
    `Traducción del lote **${lote.id}** (${lote.nombre}, ${lote.palabras.toLocaleString('es')} palabras del original).`,
    '',
    `- Traduce: ${lote.quien} · ${lote.modelo}`,
    `- Estado: ${estado} · ${hechos} de ${lote.archivos.length} archivos terminados`,
    `- Licencia: entrego esta traducción para que se publique bajo la licencia del proyecto para este comentario (${licencia(lote.comentario)}).`,
    '',
    'Lo creó `scripts/tomar.mjs`; mientras sea borrador, este lote está reservado. No edites el bloque de abajo.',
    '',
    `<!-- lote\n${JSON.stringify(datos)}\n-->`,
  ].join('\n');
}

export function loteDelCuerpo(cuerpo) {
  const m = String(cuerpo ?? '').match(MARCA);
  if (!m) return null;
  try {
    const datos = JSON.parse(m[1]);
    return Array.isArray(datos.archivos) ? datos : null;
  } catch {
    return null;
  }
}

/**
 * Lotes reservados en PRs abiertos. Un PR listo para revisar siempre cuenta;
 * uno en borrador, solo si se movió en las últimas HORAS_ABANDONO horas.
 * `prs`: lo que devuelve la API de GitHub (number, draft, updated_at, body, user).
 */
export function lotesActivos(prs, ahora = new Date(), horas = HORAS_ABANDONO) {
  return prs
    .map((pr) => ({ pr, lote: loteDelCuerpo(pr.body) }))
    .filter(({ pr, lote }) => lote && (!pr.draft || ahora - new Date(pr.updated_at) < horas * 3600_000))
    .map(({ pr, lote }) => ({ ...lote, numero: pr.number, borrador: pr.draft, autor: pr.user?.login, actualizado: pr.updated_at }));
}

/** El PR activo de número menor que comparte algún archivo con el mío (gana el que llegó antes), o null. */
export function conflicto(miNumero, misArchivos, activos) {
  const mios = new Set(misArchivos);
  return activos
    .filter((l) => l.numero < miNumero && l.archivos.some((a) => mios.has(a)))
    .sort((a, b) => a.numero - b.numero)[0] ?? null;
}
