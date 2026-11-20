import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filtrarActivas } from './reservas.mjs';
import { filtrosDeArgs, nombreArchivo } from './tramos.mjs';

test('una reserva vencida se considera abandonada', () => {
  const ahora = new Date('2026-11-20T12:00:00Z');
  const reservas = [
    { quien: 'claude', vence: '2026-11-20T18:00:00Z', tramos: [] },
    { quien: 'codex', vence: '2026-11-20T11:59:00Z', tramos: [] },
  ];
  assert.deepEqual(filtrarActivas(reservas, ahora).map((r) => r.quien), ['claude']);
});

test('lee los filtros de comentario y libro', () => {
  assert.deepEqual(filtrosDeArgs(['--cantidad', '5', '--comentario', 'matthew-henry', '--libro', 'jhn, rom']), {
    comentarios: ['matthew-henry'],
    libros: ['JHN', 'ROM'],
  });
  assert.deepEqual(filtrosDeArgs(['--cantidad', '5']), { comentarios: undefined, libros: undefined });
});

test('nombra los archivos de traducción en español', () => {
  assert.equal(nombreArchivo('traducciones/tyndale/JHN/3.md'), 'Juan 3');
  assert.equal(nombreArchivo('traducciones/matthew-henry/1CO/intro.md'), 'introducción de 1 Corintios');
});
