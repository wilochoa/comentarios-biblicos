// Identidad del traductor de esta carpeta, reservas de tramos y git.
//
// Varios modelos (Claude, Codex, Gemini…) pueden traducir a la vez, cada uno
// en su propia copia del repo. Antes de traducir, cada uno reserva sus tramos
// en reservas/<quien>.json y lo sube a GitHub; los demás los saltan. El push
// es el candado: si otro subió antes, se vuelve a calcular sobre lo último.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

export const DIR_RESERVAS = join(ROOT, 'reservas');
const ARCHIVO_IDENTIDAD = join(ROOT, '.traductor.json');

/**
 * Quién traduce en esta carpeta: { quien, modelo, comentarios?, libros? }.
 * `comentarios` y `libros` son la preferencia de la carpeta (qué traduce por
 * defecto). Se configura con scripts/soy.mjs.
 */
export function identidad() {
  if (!existsSync(ARCHIVO_IDENTIDAD)) {
    throw new Error(
      'Esta carpeta no tiene traductor asignado. Configúralo una vez con:\n' +
        '  node scripts/soy.mjs <nombre-corto> "<modelo>"     p. ej.: node scripts/soy.mjs codex "GPT-5 Codex"',
    );
  }
  return JSON.parse(readFileSync(ARCHIVO_IDENTIDAD, 'utf8'));
}

export function guardarIdentidad({ quien, modelo, comentarios, libros }) {
  if (!/^[a-z0-9][a-z0-9-]{0,30}$/.test(quien)) throw new Error('El nombre corto solo admite minúsculas, números y guiones (p. ej. "codex", "claude-2").');
  const datos = { quien, modelo };
  if (comentarios?.length) datos.comentarios = comentarios;
  if (libros?.length) datos.libros = libros;
  writeFileSync(ARCHIVO_IDENTIDAD, `${JSON.stringify(datos, null, 2)}\n`);
}

export const rutaReserva = (quien) => join(DIR_RESERVAS, `${quien}.json`);

export function leerReservas() {
  if (!existsSync(DIR_RESERVAS)) return [];
  return readdirSync(DIR_RESERVAS)
    .filter((n) => n.endsWith('.json'))
    .map((n) => JSON.parse(readFileSync(join(DIR_RESERVAS, n), 'utf8')));
}

/** Reservas vigentes (no vencidas). Una reserva vencida se considera abandonada. */
export const filtrarActivas = (reservas, ahora = new Date()) => reservas.filter((r) => new Date(r.vence) > ahora);

export const reservasActivas = (ahora = new Date()) => filtrarActivas(leerReservas(), ahora);

/** Corre git en la raíz del repo. Con `permitirFallo`, devuelve null si falla. */
export function git(args, { permitirFallo = false } = {}) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    if (permitirFallo) return null;
    throw new Error(`git ${args.join(' ')} falló:\n${error.stderr || error.message}`);
  }
}

export const hayRemoto = () => git(['remote']).trim().length > 0;

/** Trae lo último de GitHub (rebase, guardando cambios locales sin commit). */
export function actualizar() {
  if (!hayRemoto()) return;
  if (git(['pull', '--rebase', '--autostash', '-q'], { permitirFallo: true }) === null) {
    git(['rebase', '--abort'], { permitirFallo: true });
    throw new Error('No se pudo traer lo último de GitHub (¿conflicto o sin red?). Revisa `git status`.');
  }
}

/** Sube el commit actual. Devuelve false si GitHub lo rechazó (otro subió antes). */
export function subir() {
  if (!hayRemoto()) return true;
  return git(['push', '-q'], { permitirFallo: true }) !== null;
}

/** Reservas vigentes tal como están en una rama o commit (p. ej. "upstream/main"), sin tocar la carpeta. */
export function reservasActivasEn(ref, ahora = new Date()) {
  const nombres = (git(['ls-tree', '--name-only', ref, 'reservas/'], { permitirFallo: true }) ?? '')
    .split('\n')
    .filter((n) => n.endsWith('.json'));
  const reservas = nombres.map((n) => JSON.parse(git(['show', `${ref}:${n}`])));
  return filtrarActivas(reservas, ahora);
}
