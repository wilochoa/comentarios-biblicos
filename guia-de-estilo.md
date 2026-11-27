# Guía de estilo de traducción

Estas reglas valen para todos los comentarios. Lo propio de cada autor está en su perfil, `estilos/<comentario>.md`. Si una regla choca con el glosario, manda el glosario.

## Lo esencial

1. **Fiel y completa.** Se traduce todo lo que dice el original, en el mismo orden. Nunca se resume, se omite, se suaviza ni se agrega nada: ni opiniones, ni aclaraciones, ni "mejoras" teológicas. Si el autor dice algo con lo que no estamos de acuerdo, igual se traduce tal cual.
2. **Español actual y neutro de Latinoamérica.** Que lo entienda un miembro de iglesia en México, Colombia o Argentina. Se usa "ustedes" (no "vosotros") fuera de las citas bíblicas. Nada de regionalismos.
3. **Natural, no calcado.** Se traduce el sentido, no palabra por palabra. Las oraciones larguísimas del inglés antiguo (Henry) pueden dividirse en dos o tres, sin perder nada. Las expresiones antiguas pasan a español actual: "thou art" → "tú eres"; "it is worth while" → "vale la pena".
4. **Misma estructura.** Mismos párrafos, mismas listas y la misma numeración del autor: `I.`, `II.`, `1.`, `2.`, `(1.)`, `(2.)`, `First`/`Secondly` → `Primero`/`En segundo lugar`.

## La voz de cada autor

La traducción debe sonar como el autor, no como el traductor. Se actualiza el idioma, no el estilo.

- **Cada autor tiene su perfil** en `estilos/<comentario>.md`: cómo escribe, cómo debe sonar en español y las reglas que solo valen para él. Se lee antes de traducir y manda sobre esta guía en lo propio del autor.
- **Trato al lector:** cuando el autor le habla a un lector, «tú»; a varios, «ustedes». A Dios siempre se le habla de «tú» (`Thou, Lord, art…` → `Tú, Señor, eres…`).
- **«Man», «men», «mankind» en sentido genérico:** «el hombre», «los hombres», «el ser humano» o «la humanidad», lo que suene más natural en la frase. Sin desdoblamientos («los y las creyentes») ni lenguaje que el autor no usó.
- **Lenguaje polémico o de época** (`papists`, `Romish`, `heathen`, `the Jews` como adversarios): se traduce tal cual («papistas», «romanista», «paganos», «los judíos»), sin suavizar, sin comillas de distancia y sin comentario.

## Español natural

El lector no debe notar que el texto viene del inglés. Los calcos más frecuentes:

- **Posesivos de más:** `he lifted up his eyes` → «alzó los ojos» (no «sus ojos»); `in their hearts` → «en el corazón».
- **Pasivas:** el inglés las usa mucho más. Se prefiere la activa o la pasiva refleja: `the letter was written by Paul` → «Pablo escribió la carta»; `it is said that` → «se dice que».
- **Gerundio:** nunca para una acción posterior ni como adjetivo: `he left, arriving later` → «salió y llegó más tarde»; `a letter containing` → «una carta que contiene».
- **Adverbios en -mente** seguidos: se evita encadenarlos; `clearly and powerfully` → «con claridad y poder».
- **Sujeto explícito:** el español lo omite cuando ya se entiende: no «Él dijo que él vendría».
- **Raya del inglés (—):** el español rara vez la usa así. Según el caso, coma, dos puntos, paréntesis o punto y coma: `works backward as well as forward—through Christ, God provided` → «…hacia adelante: por medio de Cristo, Dios proveyó». Nunca pegada a las dos palabras (`palabra—palabra`).
- **Orden y conectores:** se reordena la frase si en español suena forzada; `however` al inicio → «sin embargo» o «pero», no siempre «sin embargo».
- **Falsos amigos:**

  | Inglés | No | Sí |
  |---|---|---|
  | eventually | eventualmente | con el tiempo, finalmente |
  | actually | actualmente | en realidad |
  | ultimately | últimamente | en última instancia, al final |
  | to assume | asumir (por suponer) | suponer, dar por sentado |
  | to support (una idea) | soportar | apoyar, respaldar |
  | dramatic | dramático (por grande) | notable, impresionante, drástico |
  | to realize | realizar | darse cuenta, comprender |
  | sensible | sensible | sensato |
  | to pretend | pretender | fingir |
  | to ignore | ignorar (por no saber) | pasar por alto, no hacer caso |
  | consistent | consistente | coherente, constante |
  | evidence | evidencia (siempre) | prueba(s), indicios; «evidencia» con moderación |
  | to address (un tema) | direccionar | tratar, abordar; dirigirse a |
  | issue | — | asunto, cuestión, problema (no «tema» para todo) |
  | scholar | escolar | erudito, estudioso |
  | minister / ministry | — | ministro / ministerio (servicio cristiano); «ministerio de Jesús» es correcto |

## Citas y referencias bíblicas

- **Referencias:** se escriben con las abreviaturas en español del glosario: `Jn 3:16`, `1 Co 1:26`, `Sal 119:148`, `Jn 3:3-8`. (Las de Henry, como `Joh 3:22` o `Co1 1:26`, se convierten solas al guardar, pero es mejor escribirlas ya en español.)
- **Referencias en formato antiguo** (Abbott, Henry): `Acts 14:19` → `Hch 14:19`; `Deut. 25:2, 3` → `Dt 25:2-3`; `Acts 22:6-11, 26:12-19` → `Hch 22:6-11; 26:12-19`; `(Acts 27:)` → `(Hch 27)`; versículos sueltos del mismo capítulo, `(24-27,)` → `(vv. 24-27)`. El paréntesis se cierra antes del punto o la coma: `…apedreado (Hch 14:5).`
- **Referencias del mismo libro** que Tyndale escribe solo con números (`3:1`, `(9:4; 11:10)`) se dejan así.
- **Cuando el original cita un versículo con su referencia**, el texto de la cita se toma de la Reina-Valera 1909 con `node scripts/versiculo.mjs "<referencia>"`. Si el autor cita solo una parte del versículo, se toma esa misma parte del texto de la RVA. No se traduce la cita del inglés.
- **La cita del versículo al inicio de una nota** (Tyndale: `51:2 Wash me . . . Purify me: The psalmist…`) es el caso más frecuente, y `unir.mjs` la revisa sola contra la RVA:
  - Se escribe con las palabras de la RVA, **sin comillas**, con `…` si se salta texto: `51:2 Lávame… límpiame: El salmista ora…` (RVA: «Lávame más y más de mi maldad, y límpiame de mi pecado»). No `51:2 «Lávame... Purifícame»:`.
  - Puede ajustarse lo mínimo para que se lea bien (quitar «Y» inicial, un tiempo verbal), pero las palabras son las de la RVA: `51:14 Líbrame de homicidios:`, no `51:14 derramar sangre:`.
  - Los nombres propios van con su forma actual aunque la RVA de 1909 use la antigua: `Potifar`, `Efraín`, `Rabí`, `Taré` (no Potiphar, Ephraim, Rabbí, Thare). El revisor los acepta.
  - **Solo lleva cita inicial la nota que la tiene en el original.** Si el original empieza directo con el comentario (`17:2 All authority has been placed…`), la traducción también: nunca se agrega una cita, no se alarga la que hay con más texto del versículo y no se reemplaza el comentario por el versículo.
  - Si el original aclara la traducción literal (`I give myself as a holy sacrifice (literally I sanctify myself):`) y la RVA ya dice eso mismo, se omite el paréntesis: `17:19 yo me santifico a mí mismo:`, no `yo me santifico a mí mismo (literalmente me santifico a mí mismo):`. Se conserva solo si aporta algo distinto de la RVA.
  - **Solo si la RVA dice algo distinto y la nota explica justamente esa palabra** (la nota comenta un término que la RVA traduce de otra forma), se traduce la frase del inglés y se escribe **en cursiva**: `58:1 *gobernantes (o dioses)*: Esta designación se usaba…` (la RVA dice «congregación»). La cursiva avisa que no es el texto de la RVA.
- **Autores que citan el versículo sin número** (Abbott): la forma está en su perfil (`estilos/abbott.md`): cita con las palabras de la RVA y dos puntos, y ` • ` entre las citas de una misma nota.
- **Referencia inicial de una nota sin punto:** `Sal 51 Esta conmovedora oración…`, `Sal 51–65 Estos salmos…`, como el original (`Ps 51 This moving prayer…`). No `Sal 51. Esta…`.
- **Puntos suspensivos:** siempre `…` (un solo carácter), nunca `...` ni `. . .`.
- **«&c.»** (abreviatura antigua de «etc.», muy frecuente en Abbott) nunca se deja en la traducción. Según dónde esté:
  - **Cierra la cita del versículo** con que empieza una nota, o la que sigue a una raya `—` dentro de ella: el autor cita las primeras palabras y corta el resto. Se escriben esas mismas palabras con la RVA y `…`, se quita la coma que va antes y siguen dos puntos: `By honor, &c.; whether our course…` → `Por honra…: ya sea que nuestro camino…` (RVA 2 Co 6:8: «Por honra y por deshonra…»). `The brother, whose praise, &c. It is not known…` → `El hermano cuya alabanza…: No se sabe…`.
  - **Va después de una cita entre comillas** dentro del texto: `…` dentro de las comillas: `"Go ye and learn," &c., means, simply, learn` → `«Andad pues, y aprended…» significa simplemente aprender`.
  - **Cierra una enumeración:** `etc.`: `brother, sister, son, daughter, &c.,` → `hermano, hermana, hijo, hija, etc.,`.
- **Cuando la nota explica una palabra de la Biblia inglesa** (frecuente en Abbott y Henry, que comentan la King James): `Charity; love.`, `Conversation; conduct, manner of life.`, `Whether any; if any.` La nota **nunca se omite**. Se resuelve así:
  - Si la RVA usa una palabra que también necesita esa aclaración, se cita la RVA y se traduce la aclaración: `Caridad: amor.` (RVA 1 Co 13).
  - Si la RVA dice otra cosa o ya es clara, la palabra comentada se traduce del inglés **en cursiva** (la cursiva avisa que no es el texto de la RVA) y luego la aclaración: `*Conversación*: conducta, manera de vivir.`
  - Nunca se inventa una explicación ni se agrega «en inglés» o «la versión inglesa dice» si el autor no lo dice.
- **Variantes del texto bíblico:** si el autor comenta palabras que su Biblia trae y la RVA no (o al revés), se traduce la frase del inglés en cursiva, igual que arriba.
- **Alusiones o frases bíblicas sin referencia** (muy frecuentes en Henry): se traducen con naturalidad. Si se reconoce claramente el versículo, se puede usar la redacción de la RVA.
- **Comillas:** « » para citas; “ ” para comillas dentro de una cita.

## Nombres y términos

- **Nombres bíblicos** con su forma en español de la tradición Reina-Valera: Nicodemo, Juan el Bautista, Moisés, Josué, Isaías, Belén, Galilea.
- **Términos teológicos:** siempre como dice el glosario, en todo el comentario.
- **Pronombres para Dios:** con minúscula (él, su, le), como la NVI. "Dios", "Señor", "Espíritu Santo", "Hijo del Hombre" con mayúscula.
- **El nombre de Dios.** Dentro de una cita de la RVA se deja siempre lo que dice la RVA («Jehová»). En el comentario:
  - `LORD` o `the Lord` cuando es el nombre divino del Antiguo Testamento → «el SEÑOR». La fuente a veces pierde las versalitas; en caso de duda, mira el versículo (`versiculo.mjs`): si la RVA dice «Jehová», es «SEÑOR»; si dice «Señor» (Adonai), es «Señor».
  - `the Lord` referido a Jesús, y en general en el Nuevo Testamento → «el Señor».
  - `Yahweh` → «Yahvé». `Jehovah` (Henry, Abbott) → «Jehová».
  - `Sovereign LORD` → «SEÑOR Soberano». `LORD of Heaven’s Armies` / `LORD of hosts` → «SEÑOR de los ejércitos».
- **Términos propios de la NLT** (la Biblia que comenta Tyndale: `made right with God`, `unfailing love`, `teachers of religious law`, `Good News`): si no están en el glosario, se usa el término con que la NTV (su versión hermana en español) dice lo mismo: «amor inagotable», «maestros de la ley religiosa». Se toma el término, nunca el versículo: las citas siempre salen de la RVA.
- **Personajes y obras de la historia:** con su forma española establecida: Agustín, Crisóstomo, Jerónimo, Orígenes, Josefo, Filón, Eusebio, Lutero, Calvino. Los títulos de obras, traducidos y en cursiva si tienen título español conocido (*Antigüedades de los judíos*, *La ciudad de Dios*); si no, en su idioma original y en cursiva.
- **Lugares:** con su nombre español de la tradición Reina-Valera o el actual (Capernaúm, Éfeso, Cesarea de Filipo); los sitios arqueológicos, como en el original (Tell en-Nasba).

## Mayúsculas

El español usa muchas menos que el inglés. Ante la duda, minúscula.

- **Con mayúscula:** Dios, Señor, Espíritu Santo, Hijo, Padre, Mesías, Cristo, Salvador, Buen Pastor, la Providencia (cuando el autor la personifica: «la divina Providencia»; «la providencia de Dios», con minúscula); la Biblia, la Escritura, Antiguo y Nuevo Testamento, Pentateuco, Salterio; fiestas y días señalados (Pascua, Pentecostés, Día de la Expiación); Tierra Prometida, Sermón del Monte.
- **Con minúscula:** templo, tabernáculo, arca del pacto, reino de Dios, reino de los cielos, iglesia, evangelio (el mensaje), ley, pacto, éxodo y exilio (los hechos), apóstol, profeta, salmo, rey, faraón, fariseos, gentiles; los pronombres de Dios (él, su, tú).
- **Evangelio:** con mayúscula solo cuando es el libro («el Evangelio de Juan», «los Evangelios»); el mensaje, con minúscula.
- **Libros:** «Éxodo» es el libro; «el éxodo», la salida de Egipto. «Salmos» es el libro; «el salmo 23», un salmo.

## Abreviaturas, números y medidas

- **Abreviaturas del autor:** `see` → «ver»; `cp.` / `cf.` → «cf.»; `e.g.` → «p. ej.»; `i.e.` → «es decir»; `ch` / `chs` → «cap.» / «caps.»; `v.` / `vv.` → «v.» / «vv.»; `literally` → «literalmente»; `Greek` / `Hebrew` ante una palabra → «griego» / «hebreo»; `AD` / `BC` → «d. C.» / «a. C.» (después del año: «586 a. C.»); `LXX` / `Septuagint` → «Septuaginta».
- **Medidas, pesos y monedas:** como las da el original, sin convertir ni agregar equivalencias: `five miles` → «cinco millas»; si el original trae las dos, se dejan las dos en el mismo orden. Las bíblicas, con su nombre español: codo, talento, denario, siclo, efa, bato.
- **Números:** con letras hasta el diez y en frases redondas («cuarenta años», «doce tribus»); con cifras los demás, las fechas, los versículos y las medidas exactas. Miles con punto solo desde cinco cifras: `1,500` → «1500»; `15,000` → «15.000».

## Poesía, himnos y citas de otros autores

- **Versos e himnos** (Henry los cita a menudo): se traduce el sentido verso por verso, con los mismos saltos de línea. No se fuerza la rima ni la métrica y no se sustituye por un himno español parecido.
- **Citas de otros autores:** se traducen del inglés tal como el autor las da, entre « ».
- **Signos:** el punto y la coma van después de las comillas de cierre (`».`); los signos de apertura `¿` y `¡` son obligatorios.

## Palabras en otros idiomas

- **Griego y hebreo transliterado** (anthrōpos, chesed): se dejan igual, en cursiva con `*...*`.
- **Latín** (frecuente en Henry): se deja la frase y se agrega la traducción entre corchetes: `*Deo volente* [si Dios quiere]`.
- Ninguna otra nota del traductor.

## Formato del archivo

- Markdown simple: párrafos separados por una línea en blanco; cursivas con `*...*`. Sin negritas, títulos ni listas con viñetas que el original no tenga.
- **Erratas de la fuente:** los originales digitalizados traen errores evidentes de puntuación o de letras (`In the, regions`, `the. Jews`). Se traduce lo que el autor quiso decir, sin marcarlo. Si la errata cambia el sentido y no es evidente cuál era el texto, se traduce tal como está.
- Cada sección empieza con `## <id>` exactamente como en el original (`## introduccion`, `## intro`, `## v1`, `## v22`). No se cambian, no se unen y no se inventan secciones.
