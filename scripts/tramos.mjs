// Qué tramos siguen según plan.json. Lo usan siguiente.mjs y reservar.mjs.
//
// Un tramo es un grupo de secciones de UN archivo (introducción de un libro o
// un capítulo), de hasta maxPalabras del original. Se emite como mucho un
// tramo por archivo, para que nunca se escriba el mismo archivo en paralelo.
import { relative } from 'node:path';
import { estiloAprobado } from './estilo.mjs';
import { ROOT, cargarFuente, librosDeFuente, leerTraduccion, libroPorCodigo, plan, rutaTraduccion } from './lib.mjs';

async function* objetivos({ comentarios, libros: soloLibros }) {
  for (const fase of plan().fases) {
    if (comentarios?.length && !comentarios.includes(fase.comentario)) continue;
    if (!estiloAprobado(fase.comentario)) continue; // sin perfil de estilo aprobado no se reparte
    const libros = await librosDeFuente(fase.comentario);
    for (const usfm of fase.libros) {
      if (soloLibros?.length && !soloLibros.includes(usfm)) continue;
      const libro = libros.find((b) => b.id === usfm);
      if (!libro) continue;
      if (fase.tipo === 'intro' || fase.tipo === 'libro-completo') yield { comentario: fase.comentario, libro: usfm, unidad: 'intro' };
      if (fase.tipo === 'capitulos' || fase.tipo === 'libro-completo') {
        const desde = libro.firstChapterNumber ?? 1;
        const hasta = libro.lastChapterNumber ?? libro.numberOfChapters;
        for (let cap = desde; cap <= hasta; cap++) yield { comentario: fase.comentario, libro: usfm, unidad: cap };
      }
    }
  }
}

/**
 * Los siguientes `limite` tramos pendientes, en el orden de plan.json.
 * - `excluir`: rutas de archivo ("traducciones/…") reservadas por otro traductor.
 * - `comentarios`: solo estos comentarios (ids), p. ej. ['matthew-henry']. Vacío = todos.
 * - `libros`: solo estos libros (USFM), p. ej. ['JHN', 'ROM']. Vacío = todos.
 * - `soloArchivos`: solo estos archivos ("traducciones/…"), p. ej. los de un lote.
 * Sin filtros se recorren las fases en orden; con `comentarios` se puede
 * trabajar en un autor aunque una fase anterior de otro autor no esté terminada.
 */
export async function siguientesTramos({ limite = 5, maxPalabras = 5000, excluir = new Set(), comentarios = [], libros = [], soloArchivos } = {}) {
  const trabajos = [];
  for await (const obj of objetivos({ comentarios, libros })) {
    if (trabajos.length >= limite) break;
    const ruta = rutaTraduccion(obj.comentario, obj.libro, obj.unidad);
    const archivo = relative(ROOT, ruta);
    if (excluir.has(archivo)) continue;
    if (soloArchivos && !soloArchivos.has(archivo)) continue;
    const actual = leerTraduccion(ruta);
    if (actual && actual.meta.estado !== 'parcial') continue;
    const fuente = await cargarFuente(obj.comentario, obj.libro, obj.unidad);
    if (!fuente) continue;
    const hechas = new Set((actual?.secciones ?? []).map((s) => s.id));
    const pendientes = fuente.secciones.filter((s) => !hechas.has(s.id));
    if (!pendientes.length) continue;

    const tramo = [];
    let palabras = 0;
    for (const s of pendientes) {
      if (tramo.length && palabras + s.palabras > maxPalabras) break;
      tramo.push(s.id);
      palabras += s.palabras;
    }
    trabajos.push({
      id: `${obj.comentario}/${obj.libro}/${obj.unidad}#${tramo[0]}${tramo.length > 1 ? `-${tramo.at(-1)}` : ''}`,
      comentario: obj.comentario,
      libro: obj.libro,
      unidad: obj.unidad,
      secciones: tramo,
      palabras,
      completa_el_archivo: tramo.length === pendientes.length,
      archivo,
    });
  }
  return trabajos;
}

/** "traducciones/tyndale/JHN/3.md" → "Juan 3"; ".../intro.md" → "introducción de Juan". */
export function nombreArchivo(archivo) {
  const [, , usfm, nombre] = archivo.split('/');
  const libro = libroPorCodigo(usfm)?.nombre ?? usfm;
  const unidad = nombre?.replace(/\.md$/, '');
  return unidad === 'intro' ? `introducción de ${libro}` : `${libro} ${unidad}`;
}

/** Lee --comentario y --libro (listas separadas por coma) de los argumentos. */
export function filtrosDeArgs(args) {
  const lista = (nombre) => {
    const i = args.indexOf(`--${nombre}`);
    return i >= 0 && args[i + 1] ? args[i + 1].split(',').map((x) => x.trim()).filter(Boolean) : undefined;
  };
  const comentarios = lista('comentario');
  const libros = lista('libro')?.map((l) => l.toUpperCase());
  return { comentarios, libros };
}

/** Revisa que los comentarios pedidos existan en plan.json. */
export function validarFiltros({ comentarios = [] }) {
  const enPlan = new Set(plan().fases.map((f) => f.comentario));
  const desconocidos = comentarios.filter((c) => !enPlan.has(c));
  if (desconocidos.length) {
    throw new Error(`No están en plan.json: ${desconocidos.join(', ')}. Disponibles: ${[...enPlan].join(', ')}.`);
  }
}
