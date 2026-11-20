# Guía de estilo de traducción

Estas reglas valen para todos los comentarios. Si una regla choca con el glosario, manda el glosario.

## Lo esencial

1. **Fiel y completa.** Se traduce todo lo que dice el original, en el mismo orden. Nunca se resume, se omite, se suaviza ni se agrega nada: ni opiniones, ni aclaraciones, ni "mejoras" teológicas. Si el autor dice algo con lo que no estamos de acuerdo, igual se traduce tal cual.
2. **Español actual y neutro de Latinoamérica.** Que lo entienda un miembro de iglesia en México, Colombia o Argentina. Se usa "ustedes" (no "vosotros") fuera de las citas bíblicas. Nada de regionalismos.
3. **Natural, no calcado.** Se traduce el sentido, no palabra por palabra. Las oraciones larguísimas del inglés antiguo (Henry) pueden dividirse en dos o tres, sin perder nada. Las expresiones antiguas pasan a español actual: "thou art" → "tú eres"; "it is worth while" → "vale la pena".
4. **Misma estructura.** Mismos párrafos, mismas listas y la misma numeración del autor: `I.`, `II.`, `1.`, `2.`, `(1.)`, `(2.)`, `First`/`Secondly` → `Primero`/`En segundo lugar`.

## Citas y referencias bíblicas

- **Referencias:** se escriben con las abreviaturas en español del glosario: `Jn 3:16`, `1 Co 1:26`, `Sal 119:148`, `Jn 3:3-8`. (Las de Henry, como `Joh 3:22` o `Co1 1:26`, se convierten solas al guardar, pero es mejor escribirlas ya en español.)
- **Referencias del mismo libro** que Tyndale escribe solo con números (`3:1`, `(9:4; 11:10)`) se dejan así.
- **Cuando el original cita un versículo con su referencia**, el texto de la cita se toma de la Reina-Valera 1909 con `node scripts/versiculo.mjs "<referencia>"`. Si el autor cita solo una parte del versículo, se toma esa misma parte del texto de la RVA. No se traduce la cita del inglés.
- **La cita del versículo al inicio de una nota** (Tyndale: `51:2 Wash me . . . Purify me: The psalmist…`) es el caso más frecuente, y `unir.mjs` la revisa sola contra la RVA:
  - Se escribe con las palabras de la RVA, **sin comillas**, con `…` si se salta texto: `51:2 Lávame… límpiame: El salmista ora…` (RVA: «Lávame más y más de mi maldad, y límpiame de mi pecado»). No `51:2 «Lávame... Purifícame»:`.
  - Puede ajustarse lo mínimo para que se lea bien (quitar «Y» inicial, un tiempo verbal), pero las palabras son las de la RVA: `51:14 Líbrame de homicidios:`, no `51:14 derramar sangre:`.
  - Los nombres propios van con su forma actual aunque la RVA de 1909 use la antigua: `Potifar`, `Efraín`, `Rabí`, `Taré` (no Potiphar, Ephraim, Rabbí, Thare). El revisor los acepta.
  - **Solo si la RVA dice algo distinto y la nota explica justamente esa palabra** (la nota comenta un término que la RVA traduce de otra forma), se traduce la frase del inglés y se escribe **en cursiva**: `58:1 *gobernantes (o dioses)*: Esta designación se usaba…` (la RVA dice «congregación»). La cursiva avisa que no es el texto de la RVA.
- **Referencia inicial de una nota sin punto:** `Sal 51 Esta conmovedora oración…`, `Sal 51–65 Estos salmos…`, como el original (`Ps 51 This moving prayer…`). No `Sal 51. Esta…`.
- **Puntos suspensivos:** siempre `…` (un solo carácter), nunca `...` ni `. . .`.
- **Alusiones o frases bíblicas sin referencia** (muy frecuentes en Henry): se traducen con naturalidad. Si se reconoce claramente el versículo, se puede usar la redacción de la RVA.
- **Comillas:** « » para citas; “ ” para comillas dentro de una cita.

## Nombres y términos

- **Nombres bíblicos** con su forma en español de la tradición Reina-Valera: Nicodemo, Juan el Bautista, Moisés, Josué, Isaías, Belén, Galilea.
- **Términos teológicos:** siempre como dice el glosario, en todo el comentario.
- **Pronombres para Dios:** con minúscula (él, su, le), como la NVI. "Dios", "Señor", "Espíritu Santo", "Hijo del Hombre" con mayúscula.
- **SEÑOR / LORD:** cuando el original escribe LORD en versalitas (el nombre divino del Antiguo Testamento), se escribe "SEÑOR".

## Palabras en otros idiomas

- **Griego y hebreo transliterado** (anthrōpos, chesed): se dejan igual, en cursiva con `*...*`.
- **Latín** (frecuente en Henry): se deja la frase y se agrega la traducción entre corchetes: `*Deo volente* [si Dios quiere]`.
- Ninguna otra nota del traductor.

## Formato del archivo

- Markdown simple: párrafos separados por una línea en blanco; cursivas con `*...*`. Sin negritas, títulos ni listas con viñetas que el original no tenga.
- Cada sección empieza con `## <id>` exactamente como en el original (`## introduccion`, `## intro`, `## v1`, `## v22`). No se cambian, no se unen y no se inventan secciones.
