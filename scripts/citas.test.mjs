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

test('encuentra las citas sin referencia (Abbott) en el original y en la traducción', async () => {
  const { citasSinReferenciaOriginal, citasSinReferenciaTraduccion } = await import('./citas.mjs');
  const original = 'Rude in speech; unskilful in oratory.—Made manifest; made known; that is, they had opportunities.\n\nIn Damascus, &c. The apostle here mentions a case.—Kept the city—with a garrison; guarded the gates.\n\nThis language is obscure; no satisfactory explanation of it has been given.';
  assert.deepEqual(citasSinReferenciaOriginal(original).map((c) => [c.clave, c.frase]), [
    ['0#0', 'Rude in speech'], ['0#1', 'Made manifest'], ['1#0', 'In Damascus'], ['1#1', 'Kept the city—with a garrison'], ['2#0', 'This language is obscure'],
  ]);
  const traduccion = 'Basto en la palabra: poco diestro en la oratoria. • Manifiestos: dados a conocer.\n\nEn Damasco...: El apóstol menciona un caso. • Guardaba la ciudad: custodiaba las puertas.\n\nEste lenguaje es oscuro; no se ha dado ninguna explicación.';
  assert.deepEqual(citasSinReferenciaTraduccion(traduccion).map((c) => [c.clave, c.frase]), [
    ['0#0', 'Basto en la palabra'], ['0#1', 'Manifiestos'], ['1#0', 'En Damasco…'], ['1#1', 'Guardaba la ciudad'],
  ]);
});

test('reconoce la cita larga que Gill corta con «,....»', async () => {
  const { citasSinReferenciaOriginal, citasSinReferenciaTraduccion } = await import('./citas.mjs');
  const original = 'I say the truth in Christ, I lie not,.... The apostle being about to discourse.\n\nmy conscience bearing me witness. The apostle calls his conscience.';
  assert.deepEqual(citasSinReferenciaOriginal(original).map((c) => c.frase), ['I say the truth in Christ, I lie not', 'my conscience bearing me witness']);
  const traduccion = 'Verdad digo en Cristo, no miento…: Estando el apóstol a punto de tratar.\n\ndándome testimonio mi conciencia: El apóstol llama a su conciencia.';
  assert.deepEqual(citasSinReferenciaTraduccion(traduccion).map((c) => c.frase), ['Verdad digo en Cristo, no miento…', 'dándome testimonio mi conciencia']);
});

test('reconoce las citas numeradas de Calvino', async () => {
  const { citasNumeradas } = await import('./citas.mjs');
  const original = '3. What indeed if some, etc. As before, while regarding the Jews.\n\nShall their unbelief, etc. Katargein is properly to render void.\n\n1. Though Paul has clearly proved that bare circumcision brought nothing to the Jews, yet since.';
  assert.deepEqual(citasNumeradas(original, { ingles: true, primerVerso: 3 }).map((c) => [c.clave, c.verso, c.frase]), [['0', 3, 'What indeed if some'], ['1', 3, 'Shall their unbelief']]);
  const traduccion = '3. ¿Pues qué si algunos…? Como antes, al considerar a los judíos.\n\n¿La incredulidad de ellos…? *Katargein* significa propiamente anular.';
  assert.deepEqual(citasNumeradas(traduccion, { primerVerso: 3 }).map((c) => [c.clave, c.frase]), [['0', '¿Pues qué si algunos…'], ['1', '¿La incredulidad de ellos…']]);
});
