#!/usr/bin/env node
// Reserva los siguientes tramos para el traductor de esta carpeta y los sube a
// GitHub, para que ningún otro modelo traduzca lo mismo al mismo tiempo.
//
//   node scripts/reservar.mjs --modelo <id> [--cantidad 5] [--comentario matthew-henry] [--libro JHN,ROM]
//                             [--max-palabras 5000] [--horas 12] [--forzar]
//
// - --modelo: el ID exacto del modelo de esta sesión (p. ej. claude-opus-5-5).
//   Solo se aceptan los de modelos-permitidos.json.
// - Sin --comentario / --libro usa la preferencia de la carpeta (scripts/soy.mjs)
//   y, si no hay, sigue plan.json en orden.
// - Salta lo que otros tienen reservado (reservas/ y lotes de voluntarios en PRs
//   abiertos). Una reserva vence a las --horas (12) y entonces se considera abandonada.
// - Imprime el JSON de los tramos (igual que siguiente.mjs). Al terminar de
//   traducir, entrega con scripts/entregar.mjs (sube y libera la reserva).
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { relative } from 'node:path';
import { ROOT } from './lib.mjs';
import { archivosEnLotes } from './github.mjs';
import { DIR_RESERVAS, actualizar, git, identidad, reservasActivas, rutaReserva, subir } from './reservas.mjs';
import { filtrosDeArgs, siguientesTramos, validarFiltros } from './tramos.mjs';
import { analizarModelo, describirPermitidos, modeloPermitido } from './modelos.mjs';

const args = process.argv.slice(2);
const opcion = (nombre, porDefecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i >= 0 ? Number(args[i + 1]) : porDefecto;
};
const dormir = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const fallar = (mensaje) => {
  console.error(mensaje);
  process.exit(1);
};

let yo;
try {
  yo = identidad();
} catch (error) {
  fallar(error.message);
}
const iModelo = args.indexOf('--modelo');
const modelo = iModelo >= 0 ? args[iModelo + 1] : undefined;
if (!modelo) fallar('Falta --modelo <id del modelo de esta sesión> (p. ej. --modelo claude-opus-5-5).');
if (!modeloPermitido(modelo)) fallar(`El modelo "${modelo}" no está permitido para traducir. Permitidos: ${describirPermitidos()}.`);
const cantidad = opcion('cantidad', 5);
const maxPalabras = opcion('max-palabras', 5000);
const horas = opcion('horas', 12);
const pedidos = filtrosDeArgs(args);
const filtros = { comentarios: pedidos.comentarios ?? yo.comentarios ?? [], libros: pedidos.libros ?? yo.libros ?? [] };
try {
  validarFiltros(filtros);
  actualizar();
} catch (error) {
  fallar(error.message);
}

const ruta = rutaReserva(yo.quien);
const archivoReserva = relative(ROOT, ruta);
const mia = reservasActivas().find((r) => r.quien === yo.quien);
if (mia && !args.includes('--forzar')) {
  fallar(
    `Ya tienes una reserva vigente (${mia.tramos.length} tramos, vence ${mia.vence}).\n` +
      '¿Hay otra sesión traduciendo en esta carpeta? Si no, entrega lo hecho y libérala con `node scripts/entregar.mjs`,\n' +
      'o reemplázala con --forzar.',
  );
}

mkdirSync(DIR_RESERVAS, { recursive: true });
for (let intento = 1; intento <= 6; intento++) {
  if (intento > 1) actualizar();
  const deOtros = reservasActivas().filter((r) => r.quien !== yo.quien);
  const { archivos: enLotes } = await archivosEnLotes();
  const excluir = new Set([...deOtros.flatMap((r) => r.tramos.map((t) => t.archivo)), ...enLotes]);
  const tramos = await siguientesTramos({ limite: cantidad, maxPalabras, excluir, ...filtros });
  if (!tramos.length) {
    console.error('No queda nada pendiente para este filtro (o todo lo pendiente está reservado por otros).');
    console.log('[]');
    process.exit(0);
  }

  const ahora = new Date();
  const reserva = {
    quien: yo.quien,
    modelo: analizarModelo(modelo).nombre,
    desde: ahora.toISOString(),
    vence: new Date(ahora.getTime() + horas * 3600_000).toISOString(),
    tramos,
    hechos: [],
  };
  writeFileSync(ruta, `${JSON.stringify(reserva, null, 2)}\n`);
  git(['add', '--', archivoReserva]);
  git(['commit', '-q', '-m', `Reserva ${yo.quien}: ${tramos.length} tramos`]);
  if (subir()) {
    console.error(`Reservados ${tramos.length} tramos para "${yo.quien}" hasta ${reserva.vence}.`);
    console.log(JSON.stringify(tramos, null, 2));
    process.exit(0);
  }

  // Otro traductor subió antes: deshacer el commit local y recalcular sobre lo último.
  git(['reset', '-q', 'HEAD~1']);
  if (git(['ls-files', '--', archivoReserva]).trim()) git(['checkout', '-q', '--', archivoReserva]);
  else if (existsSync(ruta)) rmSync(ruta);
  dormir(1000 + Math.random() * 3000);
}
fallar('No se pudo subir la reserva tras varios intentos (¿sin red o sin permiso de push?).');
