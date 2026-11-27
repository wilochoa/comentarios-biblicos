// Perfil de estilo de cada comentario (estilos/<comentario>.md): cómo escribe
// el autor y cómo se traduce. Lo crea la skill /analizar-autor antes de
// empezar un comentario nuevo y lo aprueba una persona. Sin perfil aprobado,
// reservar.mjs, tomar.mjs y siguiente.mjs no reparten ese comentario.
//
//   node scripts/estilo.mjs                          (estado del perfil de cada comentario)
//   node scripts/estilo.mjs aprobar <comentario> "<quién aprueba>"
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, comentarios, hoy } from './lib.mjs';

export const DIR_ESTILOS = join(ROOT, 'estilos');
export const rutaEstilo = (id) => join(DIR_ESTILOS, `${id}.md`);

/** Encabezado (--- clave: valor ---) y cuerpo de un perfil. */
export function parsearEstilo(texto) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(texto);
  const meta = {};
  for (const linea of (m?.[1] ?? '').split('\n')) {
    const i = linea.indexOf(':');
    if (i > 0) meta[linea.slice(0, i).trim()] = linea.slice(i + 1).trim();
  }
  return { meta, cuerpo: m ? texto.slice(m[0].length) : texto };
}

/** 'aprobado', 'borrador' o 'falta'. */
export function estadoEstilo(id, dir = DIR_ESTILOS) {
  const ruta = join(dir, `${id}.md`);
  if (!existsSync(ruta)) return 'falta';
  return parsearEstilo(readFileSync(ruta, 'utf8')).meta.estado === 'aprobado' ? 'aprobado' : 'borrador';
}

const avisados = new Set();
/** ¿Se puede repartir este comentario? Si no, avisa una vez por qué (en stderr). */
export function estiloAprobado(id) {
  const estado = estadoEstilo(id);
  if (estado === 'aprobado') return true;
  if (!avisados.has(id)) {
    avisados.add(id);
    console.error(
      estado === 'falta'
        ? `«${id}» no se reparte: falta su perfil de estilo (estilos/${id}.md). Créalo con /analizar-autor ${id}.`
        : `«${id}» no se reparte: su perfil de estilo (estilos/${id}.md) está en borrador. Una persona debe revisarlo y aprobarlo: node scripts/estilo.mjs aprobar ${id} "<nombre>".`,
    );
  }
  return false;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [accion, id, quien] = process.argv.slice(2);
  if (accion === 'aprobar') {
    if (!id || !quien) {
      console.error('Uso: node scripts/estilo.mjs aprobar <comentario> "<quién aprueba>"');
      process.exit(1);
    }
    if (estadoEstilo(id) === 'falta') {
      console.error(`No existe estilos/${id}.md. Créalo primero con /analizar-autor ${id}.`);
      process.exit(1);
    }
    const texto = readFileSync(rutaEstilo(id), 'utf8');
    const poner = (t, clave, valor) =>
      new RegExp(`^${clave}:.*$`, 'm').test(t) ? t.replace(new RegExp(`^${clave}:.*$`, 'm'), `${clave}: ${valor}`) : t.replace(/^---\n/, `---\n${clave}: ${valor}\n`);
    writeFileSync(rutaEstilo(id), poner(poner(poner(texto, 'aprobado_el', hoy()), 'aprobado_por', quien), 'estado', 'aprobado'));
    console.log(`Perfil de «${id}» aprobado por ${quien}. Haz commit de estilos/${id}.md para que valga para todos.`);
  } else {
    for (const c of comentarios()) console.log(`${estadoEstilo(c.id).padEnd(9)} ${c.id}`);
  }
}
