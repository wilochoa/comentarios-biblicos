// GitHub: repo principal, PRs abiertos (API pública) y gh para crear/editar PRs.
//
// En la carpeta de un voluntario, `origin` es su fork y `upstream` el repo
// principal (así lo deja `gh repo fork --clone`). En las carpetas internas solo
// hay `origin`, que ya es el principal.
import { execFileSync } from 'node:child_process';
import { ROOT } from './lib.mjs';
import { git } from './reservas.mjs';
import { lotesActivos } from './lotes.mjs';

const REPO_POR_DEFECTO = 'wilochoa/comentarios-biblicos';

/** "git@github-sensate:wilochoa/x.git" o "https://github.com/wilochoa/x" → "wilochoa/x". */
export function repoDeUrl(url) {
  const m = String(url ?? '').trim().match(/[:/]([^/:]+)\/([^/]+?)(?:\.git)?\/?$/);
  return m ? `${m[1]}/${m[2]}` : null;
}

const urlRemoto = (nombre) => git(['remote', 'get-url', nombre], { permitirFallo: true });

export const esFork = () => Boolean(urlRemoto('upstream'));

/** El repo principal ("dueño/nombre"). */
export const repoPrincipal = () =>
  process.env.REPO_PRINCIPAL || repoDeUrl(urlRemoto('upstream')) || repoDeUrl(urlRemoto('origin')) || REPO_POR_DEFECTO;

/** Dueño del fork de esta carpeta (para --head dueño:rama). */
export const duenoFork = () => repoDeUrl(urlRemoto('origin'))?.split('/')[0];

function token() {
  if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) return process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null;
  } catch {
    return null;
  }
}

/** PRs abiertos del repo principal (todas las páginas). */
export async function prsAbiertos(repo = repoPrincipal()) {
  const t = token();
  const cabeceras = { Accept: 'application/vnd.github+json', 'User-Agent': 'comentarios-biblicos-scripts' };
  if (t) cabeceras.Authorization = `Bearer ${t}`;
  const prs = [];
  for (let pagina = 1; pagina <= 10; pagina++) {
    const r = await fetch(`https://api.github.com/repos/${repo}/pulls?state=open&per_page=100&page=${pagina}`, { headers: cabeceras });
    if (!r.ok) throw new Error(`GitHub respondió ${r.status} al listar los PRs de ${repo}.`);
    const lote = await r.json();
    prs.push(...lote);
    if (lote.length < 100) break;
  }
  return prs;
}

/**
 * Archivos ocupados por lotes de PRs activos. Si GitHub no responde, avisa y
 * devuelve vacío (con `estricto`, lanza el error).
 */
export async function archivosEnLotes({ estricto = false, excepto } = {}) {
  try {
    const activos = lotesActivos(await prsAbiertos()).filter((l) => l.numero !== excepto);
    return { activos, archivos: new Set(activos.flatMap((l) => l.archivos)) };
  } catch (error) {
    if (estricto) throw error;
    console.error(`Aviso: no se pudieron leer los lotes de voluntarios (${error.message}). Se sigue solo con reservas/.`);
    return { activos: [], archivos: new Set() };
  }
}

/** Corre gh y devuelve su salida; lanza un error legible si falla. */
export function gh(args) {
  try {
    return execFileSync('gh', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error('Falta GitHub CLI (gh). Instálalo desde https://cli.github.com y corre `gh auth login`.');
    throw new Error(`gh ${args.slice(0, 2).join(' ')} falló:\n${error.stderr || error.message}`);
  }
}
