#!/usr/bin/env node
// Entrega lo traducido por esta carpeta: valida, hace commit de traducciones/
// y glosario-propuestas/, actualiza o libera la reserva y sube a GitHub
// (reintenta si otro subió antes).
//
//   node scripts/entregar.mjs --parcial   (después de cada tramo: sube lo hecho y sigue con la reserva)
//   node scripts/entregar.mjs             (al final: sube lo hecho y libera la reserva)
//
// Úsalo al final de cada corrida, también si algo falló: lo que no se tradujo
// queda libre para otro. Las entregas parciales dejan ver el avance en /avance/.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT, leerTraduccion } from './lib.mjs';
import { actualizar, git, identidad, rutaReserva, subir } from './reservas.mjs';
import { nombreArchivo } from './tramos.mjs';

const fallar = (mensaje) => {
  console.error(mensaje);
  process.exit(1);
};
const dormir = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

let yo;
try {
  yo = identidad();
} catch (error) {
  fallar(error.message);
}

// Primero lo último de GitHub: así se valida con las reglas vigentes aunque esta
// sesión haya empezado con scripts viejos (validar.mjs corre en otro proceso).
try {
  actualizar();
} catch (error) {
  fallar(error.message);
}

const validacion = spawnSync(process.execPath, [join(ROOT, 'scripts/validar.mjs'), '--cambiados'], { cwd: ROOT, stdio: 'inherit' });
if (validacion.status !== 0) {
  fallar('\nNo se entregó nada: corrige los archivos con ✗ (o descártalos con `git checkout -- <archivo>`) y vuelve a correr entregar.mjs.');
}

const traducidos = git(['status', '--porcelain', '--untracked-files=all', '--', 'traducciones'])
  .split('\n')
  .filter(Boolean)
  .map((l) => l.slice(3).trim())
  .filter((p) => p.endsWith('.md'));

const parcial = process.argv.includes('--parcial');
const ruta = rutaReserva(yo.quien);
let avance = '';
if (existsSync(ruta)) {
  if (parcial) {
    // Marca como hechos los tramos cuyas secciones ya están en su archivo.
    const reserva = JSON.parse(readFileSync(ruta, 'utf8'));
    reserva.hechos = reserva.tramos
      .filter((t) => {
        const ids = new Set((leerTraduccion(join(ROOT, t.archivo))?.secciones ?? []).map((s) => s.id));
        return t.secciones.every((id) => ids.has(id));
      })
      .map((t) => t.id);
    writeFileSync(ruta, `${JSON.stringify(reserva, null, 2)}\n`);
    avance = ` Reserva: ${reserva.hechos.length} de ${reserva.tramos.length} tramos hechos.`;
  } else {
    rmSync(ruta);
    avance = ' Reserva liberada.';
  }
}

const rutas = ['traducciones', 'glosario-propuestas', relative(ROOT, ruta)].filter(
  (p) => existsSync(join(ROOT, p)) || git(['ls-files', '--', p]).trim(),
);
git(['add', '-A', '--', ...rutas]);
const preparados = git(['diff', '--cached', '--name-only']).trim();

if (preparados) {
  const porComentario = new Map();
  for (const archivo of traducidos) {
    const c = archivo.split('/')[1];
    porComentario.set(c, [...(porComentario.get(c) ?? []), nombreArchivo(archivo)]);
  }
  const resumen = [...porComentario].map(([c, nombres]) => `${c}: ${nombres.join(', ')}`).join('; ');
  const mensaje = traducidos.length
    ? `Traduce (${yo.modelo}) ${resumen}`
    : parcial ? `Avance de ${yo.quien}` : `Libera la reserva de ${yo.quien}`;
  git(['commit', '-q', '-m', mensaje.length > 300 ? `${mensaje.slice(0, 297)}...` : mensaje]);
}

const pendientesDeSubir = git(['remote']).trim()
  ? Number(git(['rev-list', '--count', '@{u}..HEAD'], { permitirFallo: true })?.trim() ?? 0)
  : 0;
if (!preparados && !pendientesDeSubir) {
  console.log('Nada que entregar.');
  process.exit(0);
}

for (let intento = 1; intento <= 6; intento++) {
  if (subir()) {
    console.log(`Entregado: ${traducidos.length} archivo(s) de traducción${traducidos.length ? ` (${traducidos.map(nombreArchivo).join(', ')})` : ''}.${avance}`);
    process.exit(0);
  }
  try {
    actualizar();
  } catch (error) {
    fallar(`${error.message}\nEl commit quedó en esta carpeta; vuelve a correr entregar.mjs cuando se resuelva.`);
  }
  dormir(1000 + Math.random() * 3000);
}
fallar('No se pudo subir a GitHub tras varios intentos. El commit quedó en esta carpeta; vuelve a correr entregar.mjs.');
