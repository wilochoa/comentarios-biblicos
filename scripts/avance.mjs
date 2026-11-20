// Resumen del avance de todas las traducciones, para la página /avance/.
// Lo genera construir-api.mjs en dist/api/v1/avance.json.
//
// Cuenta en palabras del original (datos/tamanos.json, de scripts/medir.mjs);
// si falta la medición de algo, ese algo cuenta 1 palabra para no romper.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LIBROS, ROOT, comentarios, leerTraduccion, librosDeFuente, plan, rutaTraduccion } from './lib.mjs';

const CODIGO = { parcial: 'p', borrador: 'b', revisado: 'r' };

export async function construirAvance() {
  const rutaTamanos = join(ROOT, 'datos', 'tamanos.json');
  const tamanos = existsSync(rutaTamanos) ? JSON.parse(readFileSync(rutaTamanos, 'utf8')) : {};
  const enPlan = new Set(plan().fases.map((f) => f.comentario));
  const porDia = {};
  const salida = [];

  for (const c of comentarios()) {
    const fuente = await librosDeFuente(c.id);
    const medidas = tamanos[c.id] ?? {};
    const libros = [];
    const total = { palabras: 0, hechas: 0, revisadas: 0 };
    const unidades = { intro: { total: 0, b: 0, r: 0, p: 0 }, cap: { total: 0, b: 0, r: 0, p: 0 } };
    const traductores = {};

    for (const { usfm, nombre } of LIBROS) {
      const libro = fuente.find((b) => b.id === usfm);
      if (!libro) continue;
      const desde = libro.firstChapterNumber ?? 1;
      const hasta = libro.lastChapterNumber ?? libro.numberOfChapters;
      const tieneIntro = medidas[usfm] ? 'intro' in medidas[usfm] : Boolean(libro.introduction?.trim());
      const unidadesLibro = [...(tieneIntro ? ['intro'] : []), ...Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i)];
      const fila = { libro: usfm, nombre, intro: null, desde, caps: '', palabras: 0, hechas: 0 };

      for (const unidad of unidadesLibro) {
        // Si está medido y la unidad no aparece, no existe en el original (no se puede traducir).
        if (medidas[usfm] && !(unidad in medidas[usfm])) {
          if (unidad !== 'intro') fila.caps += 'x';
          continue;
        }
        const [palabras, secciones] = medidas[usfm]?.[unidad] ?? [1, 1];
        const doc = leerTraduccion(rutaTraduccion(c.id, usfm, unidad));
        const estado = doc ? CODIGO[doc.meta.estado] ?? '-' : '-';
        const hechas = estado === 'b' || estado === 'r'
          ? palabras
          : estado === 'p' ? Math.round((palabras * (doc.secciones.length)) / Math.max(secciones, 1)) : 0;
        const tipo = unidad === 'intro' ? 'intro' : 'cap';
        unidades[tipo].total++;
        if (estado !== '-') unidades[tipo][estado]++;
        if (unidad === 'intro') fila.intro = estado;
        else fila.caps += estado;
        fila.palabras += palabras;
        fila.hechas += hechas;
        total.palabras += palabras;
        total.hechas += hechas;
        if (estado === 'r') total.revisadas += palabras;
        if (doc && hechas) {
          const quien = String(doc.meta.traducido_por ?? 'IA').replace(/\s*\(IA\)\s*$/, '') || 'IA';
          traductores[quien] = (traductores[quien] ?? 0) + hechas;
          const dia = doc.meta.traducido_el;
          if (dia) porDia[dia] = (porDia[dia] ?? 0) + hechas;
        }
      }
      libros.push(fila);
    }
    salida.push({
      id: c.id,
      nombre: c.nombre,
      autor: c.autor,
      publicado: Boolean(c.publicar),
      en_plan: enPlan.has(c.id),
      palabras: total,
      unidades,
      traductores,
      libros,
    });
  }
  return { generado_el: new Date().toISOString(), por_dia: porDia, comentarios: salida };
}
