import { test } from 'node:test';
import assert from 'node:assert/strict';
import { citasDe, cobertura, erroresDeForma, normalizarForma } from './citas.mjs';

test('corrige lo mecánico: puntos suspensivos, punto tras la referencia y comillas en la cita', () => {
  const antes = 'Sal 51–65. Estos salmos…\n\nSal 51. Esta oración.\n\n51:2 «Lávame... Purifícame»: El salmista ora. • «me has quebrantado»: Todo su ser.\n\n50:17 el castigo . . . mis palabras: Los impíos.';
  const despues = normalizarForma(antes);
  assert.equal(
    despues,
    'Sal 51–65 Estos salmos…\n\nSal 51 Esta oración.\n\n51:2 Lávame… Purifícame: El salmista ora. • me has quebrantado: Todo su ser.\n\n50:17 el castigo … mis palabras: Los impíos.',
  );
  assert.deepEqual(erroresDeForma(despues), []);
  assert.equal(erroresDeForma(antes).length, 3);
});

test('encuentra las citas del versículo, no las oraciones largas', () => {
  const citas = citasDe('51:2 Lávame… límpiame: El salmista ora (51:7).\n\n18:20-21 El Dios omnisciente fue cauteloso en su juicio y en todo lo que hizo con ellos: Él sabía.\n\n51:8 Recuperar el gozo es un regalo. • me has quebrantado: Todo su ser.');
  assert.deepEqual(citas.map((c) => [c.ref, c.frase]), [['51:2', 'Lávame… límpiame'], ['51:8', 'me has quebrantado']]);
});

test('mide qué tanto de la cita sale de la RVA (sin acentos, «h» ni flexión fina)', () => {
  const rva = 'Lávame más y más de mi maldad, y límpiame de mi pecado.';
  assert.equal(cobertura('Lávame… límpiame', rva), 1);
  assert.ok(cobertura('Lávame… Purifícame', rva) < 0.6);
  assert.equal(cobertura('tomó Taré', 'Y tomó Thare a Abram su hijo'), 1);
  assert.equal(cobertura('lo vendieron en Egipto a Potifar', 'lo vendieron en Egipto a Potiphar'), 1);
  assert.equal(cobertura('Rabí', 'no queráis ser llamados Rabbí'), 1);
  assert.equal(cobertura('gobernantes (o dioses)', 'gobernantes'), 1);
});
