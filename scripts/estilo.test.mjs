import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { estadoEstilo, parsearEstilo } from './estilo.mjs';

test('lee el encabezado del perfil de estilo', () => {
  const { meta, cuerpo } = parsearEstilo('---\ncomentario: abbott\nestado: aprobado\n---\n\n# Perfil\n');
  assert.equal(meta.comentario, 'abbott');
  assert.equal(meta.estado, 'aprobado');
  assert.match(cuerpo, /# Perfil/);
});

test('un comentario solo se reparte con el perfil aprobado', () => {
  const dir = mkdtempSync(join(tmpdir(), 'estilos-'));
  writeFileSync(join(dir, 'a.md'), '---\ncomentario: a\nestado: aprobado\n---\n');
  writeFileSync(join(dir, 'b.md'), '---\ncomentario: b\nestado: borrador\n---\n');
  assert.equal(estadoEstilo('a', dir), 'aprobado');
  assert.equal(estadoEstilo('b', dir), 'borrador');
  assert.equal(estadoEstilo('c', dir), 'falta');
});
