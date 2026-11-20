import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIBROS, convertirReferencias, formatearReferencia, parsearMarkdown, parsearReferencia, revisarSeccion, serializarMarkdown } from './lib.mjs';
import { modernizar } from './versiculo.mjs';

test('tiene los 66 libros con abreviaturas únicas', () => {
  assert.equal(LIBROS.length, 66);
  assert.equal(new Set(LIBROS.map((l) => l.abrev)).size, 66);
  assert.equal(new Set(LIBROS.map((l) => l.henry)).size, 66);
});

test('entiende referencias en español, de Henry y USFM', () => {
  for (const [entrada, salida] of [
    ['Jn 3:16', 'Jn 3:16'], ['Joh 3:3-8', 'Jn 3:3-8'], ['Co1 1:26', '1 Co 1:26'], ['JHN.3.16', 'Jn 3:16'],
    ['1 Juan 4:9', '1 Jn 4:9'], ['Salmo 23', 'Sal 23'], ['Psa 119:148', 'Sal 119:148'], ['Jde 1:3', 'Jud 1:3'],
  ]) {
    assert.equal(formatearReferencia(parsearReferencia(entrada)), salida, entrada);
  }
  assert.equal(parsearReferencia('Xyz 1:1'), null);
});

test('convierte las referencias de Henry dentro del texto', () => {
  assert.equal(
    convertirReferencias('como David, Psa 63:6, y Joh 7:50; Joh 19:39; ver Co1 1:26 y Mar 3:5.'),
    'como David, Sal 63:6, y Jn 7:50; Jn 19:39; ver 1 Co 1:26 y Mr 3:5.',
  );
  // No toca palabras que no son referencias ni abreviaturas en español
  assert.equal(convertirReferencias('Sal 23:1 y Mar Muerto'), 'Sal 23:1 y Mar Muerto');
});

test('Markdown con encabezado y secciones ida y vuelta', () => {
  const meta = { comentario: 'tyndale', libro: 'JHN', unidad: '3', estado: 'borrador' };
  const secciones = [{ id: 'v1', texto: 'Uno.\n\nDos.' }, { id: 'v22', texto: 'Tres.' }];
  const doc = parsearMarkdown(serializarMarkdown(meta, secciones));
  assert.equal(doc.meta.libro, 'JHN');
  assert.equal(doc.meta.revisado_por, null);
  assert.deepEqual(doc.secciones, secciones);
});

test('detecta traducciones incompletas o con inglés', () => {
  const original = 'word '.repeat(100);
  assert.deepEqual(revisarSeccion(original, 'palabra '.repeat(110)), []);
  assert.match(revisarSeccion(original, 'palabra '.repeat(40))[0], /incompleta/);
  assert.ok(revisarSeccion(original, 'the man and the woman of the city was with this '.repeat(10)).some((e) => /inglés/.test(e)));
  const conIsaias = 'El profeta advierte en Is 5:11 y vuelve a hablar en Is 55:1 del vino, del juicio y de la misericordia que Dios ofrece a su pueblo cuando se arrepiente de corazón.';
  assert.deepEqual(revisarSeccion('word', conIsaias), []);
});

test('moderniza la ortografía de la RV 1909', () => {
  assert.equal(modernizar('Este vino á Jesús de noche, y fué ó no'), 'Este vino a Jesús de noche, y fue o no');
});
