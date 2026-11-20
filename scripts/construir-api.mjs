#!/usr/bin/env node
// Genera la API estática (JSON) en dist/api/v1 a partir de traducciones/.
//
//   node scripts/construir-api.mjs
//
// Solo incluye comentarios con "publicar": true en comentarios.json, y
// archivos en estado "borrador" o "revisado"; los consumidores
// deciden si muestran borradores (con la etiqueta "Traducción en revisión").
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { construirAvance } from './avance.mjs';
import { DIR_TRADUCCIONES, ROOT, comentarios, leerTraduccion, libroPorCodigo } from './lib.mjs';

const DIST = join(ROOT, 'dist', 'api', 'v1');
rmSync(join(ROOT, 'dist'), { recursive: true, force: true });

const escribir = (ruta, datos) => {
  const destino = join(DIST, ruta);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, JSON.stringify(datos));
};
const parrafos = (texto) => texto.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

const indice = [];
for (const c of comentarios().filter((x) => x.publicar)) {
  const dir = join(DIR_TRADUCCIONES, c.id);
  const libros = [];
  let publicados = 0;
  if (existsSync(dir)) {
    for (const usfm of readdirSync(dir).sort()) {
      const libro = libroPorCodigo(usfm);
      const entrada = { libro: usfm, nombre: libro?.nombre ?? usfm, introduccion: null, capitulos: [] };
      for (const archivo of readdirSync(join(dir, usfm))) {
        const doc = leerTraduccion(join(dir, usfm, archivo));
        if (!doc || !['borrador', 'revisado'].includes(doc.meta.estado)) continue;
        publicados++;
        const comun = {
          comentario: c.id,
          libro: usfm,
          estado: doc.meta.estado,
          traducido_por: doc.meta.traducido_por,
          revisado_por: doc.meta.revisado_por,
          atribucion: c.atribucion,
        };
        if (archivo === 'intro.md') {
          entrada.introduccion = doc.meta.estado;
          escribir(`${c.id}/${usfm}/introduccion.json`, {
            ...comun,
            secciones: doc.secciones.map((s) => ({ id: s.id, parrafos: parrafos(s.texto) })),
          });
        } else {
          const capitulo = Number(doc.meta.unidad);
          entrada.capitulos.push({ capitulo, estado: doc.meta.estado });
          escribir(`${c.id}/${usfm}/${capitulo}.json`, {
            ...comun,
            capitulo,
            introduccion: parrafos(doc.secciones.find((s) => s.id === 'intro')?.texto ?? ''),
            secciones: doc.secciones
              .filter((s) => s.id.startsWith('v'))
              .map((s) => ({ versiculo: Number(s.id.slice(1)), parrafos: parrafos(s.texto) })),
          });
        }
      }
      entrada.capitulos.sort((a, b) => a.capitulo - b.capitulo);
      if (entrada.introduccion || entrada.capitulos.length) libros.push(entrada);
    }
  }
  escribir(`${c.id}/libros.json`, { comentario: c.id, libros });
  indice.push({
    id: c.id,
    nombre: c.nombre,
    autor: c.autor,
    descripcion: c.descripcion,
    idioma: 'es',
    original: c.original,
    licencia_traduccion: c.licencia_traduccion,
    atribucion: c.atribucion,
    archivos_publicados: publicados,
  });
}
escribir('comentarios.json', { generado_el: new Date().toISOString(), comentarios: indice });
// Avance de todas las traducciones (también las que aún no se publican) y su página /avance/
escribir('avance.json', await construirAvance());
cpSync(join(ROOT, 'web'), join(ROOT, 'dist', 'api'), { recursive: true });
// GitHub Pages: sin Jekyll, y una portada mínima
writeFileSync(join(ROOT, 'dist', 'api', '.nojekyll'), '');
writeFileSync(join(ROOT, 'dist', 'api', 'index.html'), '<!doctype html><meta charset="utf-8"><title>Comentarios bíblicos en español</title><p>API de comentarios bíblicos en español. Índice: <a href="v1/comentarios.json">v1/comentarios.json</a>. Avance de las traducciones: <a href="avance/">avance</a>. Código y licencias: <a href="https://github.com/wilochoa/comentarios-biblicos">github.com/wilochoa/comentarios-biblicos</a>.</p>');
console.log(`API generada en dist/api/v1 (${indice.map((c) => `${c.id}: ${c.archivos_publicados}`).join(', ')})`);
