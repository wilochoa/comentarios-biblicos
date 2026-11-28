#!/usr/bin/env node
// Deja lista la carpeta de un voluntario. Se corre una vez, dentro del clon de su fork:
//
//   gh repo fork wilochoa/comentarios-biblicos --clone
//   cd comentarios-biblicos && node scripts/unirme.mjs
//
//   node scripts/unirme.mjs --revisar    (solo revisa, no cambia nada; lo usa /colaborar)
//
// Revisa Node, git y GitHub CLI; deja `origin` = tu fork y `upstream` = el repo
// principal; si git no sabe quién eres, usa tu usuario de GitHub con su correo
// privado (noreply), solo para esta carpeta; y asigna el traductor de la carpeta
// (.traductor.json) con tu usuario de GitHub.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';
import { esFork, repoDeUrl } from './github.mjs';
import { git, guardarIdentidad } from './reservas.mjs';

const REPO_PRINCIPAL = 'wilochoa/comentarios-biblicos';
const revisar = process.argv.includes('--revisar');
const problemas = [];
const ok = (m) => console.log(`✓ ${m}`);
const mal = (m) => {
  problemas.push(m);
  console.log(`✗ ${m}`);
};
const correr = (cmd, args) => {
  try {
    return execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
};

// 1. Node
const [mayor] = process.versions.node.split('.').map(Number);
if (mayor >= 20) ok(`Node ${process.versions.node}`);
else mal(`Node ${process.versions.node} es muy viejo: instala Node 20 o superior desde https://nodejs.org`);

// 2. GitHub CLI y sesión
const usuario = correr('gh', ['api', 'user', '--jq', '.login + " " + (.id|tostring)']);
if (correr('gh', ['--version']) === null) mal('Falta GitHub CLI (gh): instálalo desde https://cli.github.com');
else if (!usuario) mal('No has iniciado sesión en GitHub: corre `gh auth login --web` y sigue los pasos en el navegador.');
else ok(`Sesión de GitHub: ${usuario.split(' ')[0]}`);
const [login, id] = usuario?.split(' ') ?? [];

// 3. Remotos: origin = tu fork, upstream = el repo principal
if (!esFork()) {
  const origen = repoDeUrl(git(['remote', 'get-url', 'origin'], { permitirFallo: true }));
  if (revisar || !login) mal('Esta carpeta no está conectada a tu fork (falta el remoto "upstream").');
  else if (origen === REPO_PRINCIPAL) {
    // Clonaron el repo principal directo: se crea el fork y se reacomodan los remotos.
    if (correr('gh', ['repo', 'fork', '--remote', '--remote-name', 'origin']) === null || !esFork()) {
      mal('No se pudo crear tu fork. Corre `gh repo fork --remote` y vuelve a correr este script.');
    } else ok('Fork creado: origin = tu fork, upstream = el repo principal');
  } else {
    git(['remote', 'add', 'upstream', `https://github.com/${REPO_PRINCIPAL}.git`], { permitirFallo: true });
    if (esFork()) ok('Remoto upstream agregado (repo principal)');
    else mal('No se pudo agregar el remoto upstream.');
  }
} else ok(`Fork listo: origin = ${repoDeUrl(git(['remote', 'get-url', 'origin']))}, upstream = ${repoDeUrl(git(['remote', 'get-url', 'upstream']))}`);

// 4. Quién firma los commits
const nombreGit = git(['config', 'user.name'], { permitirFallo: true })?.trim();
const correoGit = git(['config', 'user.email'], { permitirFallo: true })?.trim();
if (nombreGit && correoGit) ok(`Git firma como ${nombreGit}`);
else if (revisar || !login) mal('Git no sabe quién eres (user.name / user.email).');
else {
  git(['config', 'user.name', login]);
  git(['config', 'user.email', `${id}+${login}@users.noreply.github.com`]);
  ok(`Git firmará como ${login}, con el correo privado de GitHub (solo en esta carpeta)`);
}

// 5. Traductor de la carpeta
if (existsSync(join(ROOT, '.traductor.json'))) ok('Traductor de la carpeta asignado');
else if (revisar || !login) mal('La carpeta no tiene traductor asignado (.traductor.json).');
else {
  const quien = login.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+/, '').slice(0, 31) || 'voluntario';
  guardarIdentidad({ quien, modelo: 'Voluntario' });
  ok(`Traductor de la carpeta: ${quien}`);
}

if (problemas.length) {
  console.log(`\nFalta resolver ${problemas.length} punto${problemas.length > 1 ? 's' : ''} antes de traducir.`);
  process.exit(1);
}
console.log(
  revisar
    ? '\nTodo listo para traducir.'
    : `\nTodo listo. Abre esta carpeta (${ROOT}) en una sesión nueva de Claude y escribe /colaborar.`,
);
