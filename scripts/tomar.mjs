#!/usr/bin/env node
// Toma el siguiente lote libre para un voluntario: abre un PR en borrador desde
// su fork, que sirve de reserva. Los demás leen los PRs abiertos y lo saltan.
//
//   node scripts/tomar.mjs --modelo <id del modelo> [--comentario tyndale] [--libro JHN,ROM] [--lote <id>] [--simular]
//
// - --modelo: el ID exacto del modelo de esta sesión (p. ej. claude-opus-5-5).
//   Solo se aceptan los de modelos-permitidos.json.
// - Sin --comentario / --libro sigue plan.json en orden (o la preferencia de soy.mjs).
// - Si dos toman el mismo lote a la vez, gana el PR de número menor; el otro
//   cierra el suyo y toma el siguiente.
// - --simular: dice qué lote tomaría, sin crear nada.
//
// Después: `node scripts/siguiente.mjs --lote` da los tramos del lote, y
// `node scripts/entregar.mjs [--parcial]` sube lo traducido al PR.
import { archivosEnLotes, duenoFork, esFork, gh, prsAbiertos, repoPrincipal } from './github.mjs';
import { conflicto, cuerpoPr, guardarLote, hayLote, leerLote, lotesActivos, lotesDelPlan, lotesLibres, tituloPr } from './lotes.mjs';
import { describirPermitidos, modeloPermitido } from './modelos.mjs';
import { git, identidad, reservasActivasEn } from './reservas.mjs';
import { filtrosDeArgs, validarFiltros } from './tramos.mjs';
import { estiloAprobado } from './estilo.mjs';

const args = process.argv.slice(2);
const valor = (nombre) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const fallar = (mensaje) => {
  console.error(mensaje);
  process.exit(1);
};
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const simular = args.includes('--simular');

let yo;
try {
  yo = identidad();
} catch (error) {
  fallar(error.message);
}
const modelo = valor('modelo');
if (!modelo) fallar('Falta --modelo <id del modelo de esta sesión> (p. ej. --modelo claude-opus-5-5).');
if (!modeloPermitido(modelo)) fallar(`El modelo "${modelo}" no está permitido para traducir. Permitidos: ${describirPermitidos()}.`);

if (hayLote()) {
  const l = leerLote();
  fallar(`Ya tienes tomado el lote ${l.id} (${l.url}).\nSigue con \`node scripts/siguiente.mjs --lote\` o entrégalo con \`node scripts/entregar.mjs\`.`);
}
if (!esFork()) {
  fallar('Esta carpeta no es un fork (falta el remoto "upstream"). Los lotes son para voluntarios; en las carpetas internas usa reservar.mjs.');
}
if (!simular) {
  if (!git(['config', 'user.email'], { permitirFallo: true })?.trim()) {
    fallar('Git no sabe quién eres. Configúralo una vez:\n  git config --global user.name "Tu nombre"\n  git config --global user.email "tu@correo"');
  }
  const sucios = git(['status', '--porcelain', '--', 'traducciones', 'glosario-propuestas']).trim();
  if (sucios) fallar(`Hay cambios sin entregar en traducciones/ o glosario-propuestas/:\n${sucios}\nEntrégalos o descártalos antes de tomar otro lote.`);
}

const pedidos = filtrosDeArgs(args);
const filtros = {
  comentarios: pedidos.comentarios ?? yo.comentarios ?? [],
  libros: pedidos.libros ?? yo.libros ?? [],
};
try {
  validarFiltros(filtros);
} catch (error) {
  fallar(error.message);
}

const repo = repoPrincipal();
// Partir siempre de lo último del repo principal.
git(['fetch', '-q', 'upstream', 'main']);
if (!simular) git(['checkout', '-q', '--detach', 'upstream/main']);

const descartados = new Set();
for (let intento = 1; intento <= 5; intento++) {
  const internos = reservasActivasEn('upstream/main').flatMap((r) => r.tramos.map((t) => t.archivo));
  let enLotes;
  try {
    enLotes = await archivosEnLotes({ estricto: true });
  } catch (error) {
    fallar(`No se pudo consultar GitHub: ${error.message}`);
  }
  const ocupados = new Set([...internos, ...enLotes.archivos]);
  let libres = lotesLibres(lotesDelPlan(), { ocupados, ...filtros }).filter((l) => !descartados.has(l.id) && estiloAprobado(l.comentario));
  if (valor('lote')) libres = libres.filter((l) => l.id === valor('lote'));
  if (!libres.length) {
    console.error(valor('lote') ? `El lote ${valor('lote')} no está libre (o ya está traducido).` : 'No queda ningún lote libre para este filtro.');
    console.log('null');
    process.exit(0);
  }

  const elegido = libres[0];
  const lote = {
    id: elegido.id,
    nombre: elegido.nombre,
    comentario: elegido.comentario,
    libro: elegido.libro,
    palabras: elegido.palabras,
    archivos: elegido.pendientes,
    quien: yo.quien,
    modelo,
    desde: new Date().toISOString(),
  };
  if (simular) {
    console.error(`Tomaría el lote ${lote.id} (${lote.nombre}, ${lote.archivos.length} archivos). No se creó nada.`);
    console.log(JSON.stringify(lote, null, 2));
    process.exit(0);
  }

  const rama = `lote/${lote.id}`;
  git(['checkout', '-q', '-B', rama, 'upstream/main']);
  git(['commit', '-q', '--allow-empty', '-m', `Toma el lote ${lote.id}`]);
  git(['push', '-q', '--force', '-u', 'origin', rama]);
  let url;
  try {
    url = gh(['pr', 'create', '--repo', repo, '--draft', '--base', 'main', '--head', `${duenoFork()}:${rama}`, '--title', tituloPr(lote), '--body', cuerpoPr(lote)]);
  } catch (error) {
    fallar(`No se pudo abrir el PR del lote: ${error.message}`);
  }
  const numero = Number(url.match(/\/pull\/(\d+)/)?.[1]);

  // ¿Alguien tomó lo mismo al mismo tiempo? Gana el PR de número menor (o una reserva interna).
  await dormir(3000);
  git(['fetch', '-q', 'upstream', 'main']);
  const internosAhora = new Set(reservasActivasEn('upstream/main').flatMap((r) => r.tramos.map((t) => t.archivo)));
  const otro = conflicto(numero, lote.archivos, lotesActivos(await prsAbiertos(repo)));
  if (otro || lote.archivos.some((a) => internosAhora.has(a))) {
    console.error(`El lote ${lote.id} lo tomó otro al mismo tiempo${otro ? ` (PR #${otro.numero})` : ''}; se cierra el PR #${numero} y se busca otro.`);
    gh(['pr', 'close', String(numero), '--repo', repo, '--delete-branch', '--comment', 'Lo tomó otro voluntario al mismo tiempo; se cierra automáticamente.']);
    git(['checkout', '-q', '--detach', 'upstream/main']);
    git(['branch', '-q', '-D', rama], { permitirFallo: true });
    descartados.add(lote.id);
    continue;
  }

  guardarLote({ ...lote, repo, rama, pr: numero, url });
  console.error(`Tomaste el lote ${lote.id} (${lote.nombre}, ${lote.archivos.length} archivos): ${url}`);
  console.error('Siguiente paso: `node scripts/siguiente.mjs --lote` para ver sus tramos.');
  console.log(JSON.stringify({ ...lote, pr: numero, url }, null, 2));
  process.exit(0);
}
fallar('No se pudo tomar un lote tras varios intentos (otros voluntarios tomaron los mismos). Vuelve a intentarlo en un minuto.');
