import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conflicto, construirLotes, cuerpoPr, loteDelCuerpo, lotesActivos, lotesLibres, lotesDelPlan } from './lotes.mjs';
import { repoDeUrl } from './github.mjs';
import { analizarModelo, modeloPermitido } from './modelos.mjs';

const tamanos = {
  tyndale: {
    JDG: { intro: [900, 5], 1: [700, 10], 2: [400, 8], 3: [880, 12], 10: [300, 4] },
    RUT: { intro: [500, 3], 1: [300, 5] },
  },
};
const elPlan = {
  fases: [
    { comentario: 'tyndale', tipo: 'intro', libros: ['RUT', 'JDG'] },
    { comentario: 'tyndale', tipo: 'capitulos', libros: ['JDG', 'RUT'] },
  ],
};

test('arma lotes por libro hasta el tope de palabras, con id estable', () => {
  const lotes = construirLotes({ plan: elPlan, tamanos, palabras: 1500 });
  assert.deepEqual(lotes.map((l) => l.id), ['tyndale-RUT-intro', 'tyndale-JDG-intro', 'tyndale-JDG-1-2', 'tyndale-JDG-3-10', 'tyndale-RUT-1']);
  assert.deepEqual(lotes[2].archivos, ['traducciones/tyndale/JDG/1.md', 'traducciones/tyndale/JDG/2.md']);
  assert.equal(lotes[2].palabras, 1100);
  assert.equal(lotes[2].nombre, 'Jueces 1–2');
  assert.equal(lotes[1].nombre, 'introducción de Jueces');
});

test('un capítulo más grande que el tope queda solo en su lote', () => {
  const lotes = construirLotes({ plan: elPlan, tamanos, palabras: 500 });
  assert.ok(lotes.some((l) => l.id === 'tyndale-JDG-3' && l.palabras === 880));
});

test('los lotes del plan real no repiten id', () => {
  const ids = lotesDelPlan().map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('un lote libre tiene algo pendiente y nada ocupado por otro', () => {
  const lotes = construirLotes({ plan: elPlan, tamanos, palabras: 1500 });
  const hechos = new Set(['traducciones/tyndale/RUT/intro.md', 'traducciones/tyndale/JDG/1.md']);
  const libres = lotesLibres(lotes, {
    esPendiente: (a) => !hechos.has(a),
    ocupados: new Set(['traducciones/tyndale/JDG/intro.md']),
    comentarios: ['tyndale'],
  });
  assert.deepEqual(libres.map((l) => l.id), ['tyndale-JDG-1-2', 'tyndale-JDG-3-10', 'tyndale-RUT-1']);
  assert.deepEqual(libres[0].pendientes, ['traducciones/tyndale/JDG/2.md']);
});

test('el lote viaja en el cuerpo del PR y se recupera', () => {
  const lote = { id: 'tyndale-JDG-1-2', nombre: 'Jueces 1–2', palabras: 1100, archivos: ['traducciones/tyndale/JDG/2.md'], quien: 'ana', modelo: 'claude-opus-5-5', desde: '2026-11-27T10:00:00Z' };
  const datos = loteDelCuerpo(cuerpoPr(lote, { hechos: 0 }));
  assert.equal(datos.id, lote.id);
  assert.deepEqual(datos.archivos, lote.archivos);
  assert.equal(loteDelCuerpo('un PR cualquiera'), null);
});

test('un borrador quieto 24 h se considera abandonado; uno listo, nunca', () => {
  const cuerpo = (id) => cuerpoPr({ id, nombre: id, palabras: 1, archivos: [`traducciones/${id}.md`], quien: 'x', modelo: 'm', desde: '' });
  const ahora = new Date('2026-11-27T12:00:00Z');
  const prs = [
    { number: 1, draft: true, updated_at: '2026-11-27T10:00:00Z', body: cuerpo('a') },
    { number: 2, draft: true, updated_at: '2026-11-25T10:00:00Z', body: cuerpo('b') },
    { number: 3, draft: false, updated_at: '2026-11-20T10:00:00Z', body: cuerpo('c') },
    { number: 4, draft: false, updated_at: '2026-11-27T10:00:00Z', body: 'otro PR' },
  ];
  assert.deepEqual(lotesActivos(prs, ahora).map((l) => l.numero), [1, 3]);
});

test('si dos toman el mismo lote, gana el PR de número menor', () => {
  const activos = [
    { numero: 10, archivos: ['a', 'b'] },
    { numero: 12, archivos: ['b'] },
    { numero: 8, archivos: ['z'] },
  ];
  assert.equal(conflicto(12, ['b'], activos).numero, 10);
  assert.equal(conflicto(10, ['a', 'b'], activos), null);
});

test('solo se permiten Opus/Sonnet 5.5 o superior y Fable', () => {
  for (const m of ['claude-opus-5-5', 'Claude Opus 5.5 (IA)', 'claude-sonnet-5-5-20261001', 'claude-opus-6', 'claude-fable-5-2', 'Claude Sonnet 5.6']) {
    assert.ok(modeloPermitido(m), m);
  }
  for (const m of ['claude-opus-5', 'claude-sonnet-4-5', 'claude-haiku-5-5', 'Claude (IA)', 'GPT-5 Codex', '', undefined]) {
    assert.ok(!modeloPermitido(m), String(m));
  }
  assert.equal(analizarModelo('claude-opus-5-5').nombre, 'Claude Opus 5.5');
});

test('lee dueño/repo de la URL del remoto', () => {
  assert.equal(repoDeUrl('git@github-sensate:wilochoa/comentarios-biblicos.git'), 'wilochoa/comentarios-biblicos');
  assert.equal(repoDeUrl('https://github.com/ana/comentarios-biblicos'), 'ana/comentarios-biblicos');
});
