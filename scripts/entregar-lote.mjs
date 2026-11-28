// Entrega de un voluntario: sube lo traducido a la rama de su lote (en su fork)
// y actualiza el PR. Lo llama entregar.mjs cuando la carpeta tiene un lote
// tomado (.lote.json). No toca main ni dispara la publicación.
//
//   --parcial: sube lo hecho y el PR sigue en borrador (la reserva se mantiene viva).
//   sin --parcial: sube lo hecho, deja en el lote solo lo que se tradujo y
//   marca el PR listo para revisar; si no se tradujo nada, cierra el PR y libera el lote.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';
import { gh } from './github.mjs';
import { cuerpoPr, leerLote, pendiente, soltarLote } from './lotes.mjs';
import { analizarModelo } from './modelos.mjs';
import { git } from './reservas.mjs';
import { nombreArchivo } from './tramos.mjs';

export function entregarLote({ parcial, fallar }) {
  const lote = leerLote();
  const rama = git(['rev-parse', '--abbrev-ref', 'HEAD']).trim();
  if (rama !== lote.rama) fallar(`Estás en la rama "${rama}", pero tu lote es "${lote.rama}". Vuelve con \`git checkout ${lote.rama}\`.`);

  // Lo último del repo principal, para validar con las reglas vigentes.
  git(['fetch', '-q', 'upstream', 'main']);
  if (git(['rebase', '-q', '--autostash', 'upstream/main'], { permitirFallo: true }) === null) {
    git(['rebase', '--abort'], { permitirFallo: true });
    fallar('No se pudo poner tu lote al día con el repo principal (conflicto). Pide ayuda en el PR: ' + lote.url);
  }

  const validacion = spawnSync(process.execPath, [join(ROOT, 'scripts/validar.mjs'), '--cambiados', '--modelos'], { cwd: ROOT, stdio: 'inherit' });
  if (validacion.status !== 0) {
    fallar('\nNo se entregó nada: corrige los archivos con ✗ (o descártalos con `git checkout -- <archivo>`) y vuelve a correr entregar.mjs.');
  }

  const traducidos = git(['status', '--porcelain', '--untracked-files=all', '--', 'traducciones'])
    .split('\n')
    .filter(Boolean)
    .map((l) => l.slice(3).trim())
    .filter((p) => p.endsWith('.md'));
  git(['add', '-A', '--', 'traducciones', 'glosario-propuestas']);
  if (git(['diff', '--cached', '--name-only']).trim()) {
    const modelo = analizarModelo(lote.modelo)?.nombre ?? lote.modelo;
    const mensaje = traducidos.length ? `Traduce (${modelo}) ${lote.comentario}: ${traducidos.map(nombreArchivo).join(', ')}` : `Avance del lote ${lote.id}`;
    git(['commit', '-q', '-m', mensaje.length > 300 ? `${mensaje.slice(0, 297)}...` : mensaje]);
  }
  if (git(['push', '-q', '--force-with-lease', 'origin', `HEAD:refs/heads/${lote.rama}`], { permitirFallo: true }) === null) {
    fallar('No se pudo subir a tu fork (¿sin red?). Tu trabajo quedó guardado aquí; vuelve a correr entregar.mjs.');
  }

  const tocados = git(['diff', '--name-only', 'upstream/main...HEAD', '--', 'traducciones'])
    .split('\n')
    .filter((a) => a.endsWith('.md'));
  const hechos = lote.archivos.filter((a) => !pendiente(a)).length;

  if (parcial) {
    gh(['pr', 'edit', String(lote.pr), '--repo', lote.repo, '--body', cuerpoPr(lote, { hechos })]);
    console.log(`Avance subido al PR #${lote.pr}: ${hechos} de ${lote.archivos.length} archivos terminados.`);
    return;
  }

  if (!tocados.length) {
    gh(['pr', 'close', String(lote.pr), '--repo', lote.repo, '--delete-branch', '--comment', 'No se tradujo nada; el lote queda libre.']);
    soltarLote();
    console.log(`No había nada traducido: se cerró el PR #${lote.pr} y el lote ${lote.id} quedó libre.`);
    return;
  }
  // Lo que no se alcanzó a traducir queda libre para otro desde ya.
  const final = { ...lote, archivos: lote.archivos.filter((a) => tocados.includes(a)) };
  const completo = final.archivos.length === lote.archivos.length && hechos === lote.archivos.length;
  gh(['pr', 'edit', String(lote.pr), '--repo', lote.repo, '--body', cuerpoPr(final, { hechos, estado: completo ? 'terminado' : 'entregado en parte' })]);
  gh(['pr', 'ready', String(lote.pr), '--repo', lote.repo]);
  soltarLote();
  console.log(
    `Entregado: el PR #${lote.pr} quedó listo para revisar (${hechos} de ${lote.archivos.length} archivos terminados). ${lote.url}` +
      (completo ? '' : '\nLo que faltó queda libre para otro voluntario.'),
  );
}
