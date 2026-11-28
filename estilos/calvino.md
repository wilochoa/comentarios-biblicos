---
aprobado_por: William Ochoa
aprobado_el: 2026-11-28
comentario: calvino
estado: aprobado
analizado_por: Claude (IA)
analizado_el: 2026-11-28
---

# Perfil de estilo · Juan Calvino, *Comentarios* (Calvin Translation Society, 1843–1855)

Manda sobre `guia-de-estilo.md` en lo que es propio de este autor.

## El autor y su obra

Juan Calvino (1509–1564), reformador de Ginebra. Escribió en latín; se traduce la versión inglesa de la Calvin Translation Society (edición de CCEL), **solo el texto de Calvino**. Hay **comentarios** (Pentateuco en armonía, Josué, Salmos, Isaías, armonía de los Evangelios, Juan, Hechos, epístolas) y **lecciones** dictadas a estudiantes (Jeremías, Lamentaciones, Ezequiel, Daniel, profetas menores), que terminan con una oración. Comenta **su propia traducción latina**, no la King James. Cada sección es una perícopa: mediana de 830 palabras; algunas pasan de 10.000.

## Cómo suena en español

- **Exegeta y polemista, no predicador.** Sopesa interpretaciones y decide en primera persona; se conserva el «yo»: `Some think… but such a view is not suitable` → «Algunos piensan… pero esa interpretación no encaja»; `I make no doubt but that` → «no dudo que».
- Oraciones largas encadenadas con «;»: se pueden partir. El `for` que argumenta → «porque», «pues».
- **Fórmulas:** `It follows, --` → «Sigue:»; `He afterwards adds, --` → «Después añade:»; `We now perceive the meaning of the Prophet` → «Ahora entendemos lo que quiere decir el profeta»; `This is the import of the passage` → «Este es el sentido del pasaje»; `In short,` → «En suma,»; `viz.` → «a saber».
- **Marcas orales de las lecciones**, tal cual: `here I stop` → «Aquí me detengo»; `The rest to-morrow` → «El resto, mañana».
- Léxico: `the godly` → «los piadosos»; `the ungodly` → «los impíos»; `the reprobate` → «los réprobos»; `gratuitous` → «gratuito»; `to recumb on God` → «descansar en Dios»; `frigid` (interpretación) → «débil»; `the Prophet`, `the Apostle` → «el profeta», «el apóstol». El inglés arcaico de Hechos (`doth`, `gathereth`) pasa a español actual.

## Lo que ya viene preparado

`scripts/calvino.mjs` prepara el original antes de que lo veas, así que no aparecen:
- el encabezado («Romans 3:1-2») ni el bloque de versículos en inglés y en latín: la publicación muestra la RVA;
- las notas de los editores ingleses ni sus llamadas `[87]`;
- en Marcos y Lucas, las secciones de la armonía que ya están en un Evangelio anterior (se traducen una sola vez).

Además se recuperaron de la edición CrossWire los párrafos de Calvino que la de CCEL perdió (inicios de las lecciones, argumentos de los salmos y de las epístolas); se traducen como cualquier otro. Si aun así queda un versículo suelto de la Biblia en inglés, sin comentario, se escribe con la RVA.

## Forma de las secciones

1. **Comentario.** La nota de cada versículo empieza con su número y, casi siempre, un **lema**: las palabras de la RVA cerradas con **punto**, como en el original (no dos puntos). `etc.` → `…`. `2. Much in every way, etc.; that is, very much.` → `2. Mucho en todas maneras…; es decir, muchísimo.` A veces el número va solo: `1. Though Paul has clearly proved` → `1. Aunque Pablo ha probado`. Los lemas al comienzo de párrafo, igual pero sin número: `But for the glory of God. This clause` → `Mas por gloria de Dios. Esta cláusula`. Si falta el punto (`He desireth an excellent work The Apostle`), se pone. Génesis e Isaías no numeran sus lemas. `unir.mjs` revisa estos lemas contra la RVA (`"formato_citas": "numerada"`).
2. **Oración** (lecciones): `PRAYER.` / `Prayer.` → «Oración», en línea propia. De «tú» a Dios: `Grant, Almighty God, that…` → «Concédenos, Dios Todopoderoso, que…»; `-- Amen.` → «Amén.».
3. Colofones, tal cual: `End of the Commentaries on Amos.` → «Fin de los comentarios sobre Amós.»; `Praise be to God.` → «Alabado sea Dios.».

## La Biblia que comenta y la RVA

- El lema traduce el latín de Calvino y a menudo no coincide con la RVA. Si dice lo mismo, RVA; si la nota discute justamente esa palabra, cursiva traducida del inglés: `12. For the renewing of the saints. In this version I follow Erasmus` → `12. *Para la renovación de los santos*. En esta versión sigo a Erasmo` (RVA: «Para perfección»); `By oracles he means` → `Por *oráculos* entiende` (RVA: «la palabra de Dios»).
- **Versículo entretejido** en la prosa (sobre todo en las lecciones): las palabras citadas, con la RVA y en cursiva: `But these words are added, with a squared stone The verb` → `Pero se añaden estas palabras: *con piedra tajada*. El verbo`. La paráfrasis en tercera persona va sin cursiva.
- **Juan 1:** `the Speech` es el *Sermo* de Calvino, que explica por qué no dice *Verbum*: → *la Palabra*, en cursiva (no «el Verbo»).
- **Nombre de Dios:** `Jehovah` → «Jehová»; `the Lord` → «el Señor», siempre. (`LORD` solo aparecía en el bloque de versículos, que ya no viene.)
- `the Vulgate`, `Vulg.`, `the old interpreter` → «la Vulgata», «el antiguo intérprete»; `Sept.`, `LXX` → «la Septuaginta»; `Syr.` → «la siríaca»; `our version`, `A.V.` → «nuestra versión», «la versión autorizada».

## Otros idiomas

- **La fuente pasó el griego y el hebreo a letras latinas.** El griego queda transliterado (`Katargein`, `katartismos`) y el hebreo como consonantes sueltas (`cht'h` por חטאה), casi siempre seguidas de la transliteración de Calvino. Todo se copia tal cual, en cursiva: `the word,cht'h chateah` → «la palabra *cht'h*, *chateah*». No se reconstruyen las letras originales.
- **Latín que añade el traductor inglés:** cursiva y se traduce la glosa: `its virtue (virtutem, efficacy)` → «su virtud (*virtutem*, eficacia)». `?` en medio de una palabra latina es una æ perdida: `Pr?rogativa` → *Praerogativa*.
- **Hebreo y griego en su alfabeto** (en los párrafos recuperados de CrossWire): se copian tal cual.

## Referencias y abreviaturas

- `(Hebrews 13:11-12.)` → `(Heb 13:11-12).` · `Matthew 6:33; Mark 7:27` → `Mt 6:33; Mr 7:27`. `see my Institutes` → «ver mi *Institución*».
- Polémica, tal cual: `Papists` → «papistas»; `Sophists` → «sofistas»; `the Schoolmen` → «los escolásticos»; `the Sorbonian theology` → «la teología de la Sorbona»; `Monks` → «monjes»; `Anabaptists` → «anabaptistas»; `Mahometans` → «mahometanos»; `Servetus` → «Servet»; `the Rabbins` → «los rabinos».

## Trampas

- **Raya y comillas:** la fuente escribe la raya como `--` (sigue la regla de la raya de la guía) y usa comillas rectas; a veces perdió la de apertura (`Who has believed our hearing?'`): se ponen « » completas.
- **Erratas** frecuentes: `lie shews` (he), `theft though` (that), `hi calling` (in), `bad forgotten` (had), `l.` por `1.`. Se corrigen al traducir; el latín no.

## Ejemplo

> 3. What indeed if some, etc. […] he testifies that its virtue (virtutem, efficacy) is not destroyed, no, not even by their inconstancy. […]
> Shall their unbelief, etc. Katargein is properly to render void and ineffectual; a meaning most suitable to this passage.

> 3. ¿Pues qué si algunos…? […] atestigua que su virtud (*virtutem*, eficacia) no queda destruida, no, ni siquiera por la inconstancia de ellos. […]
>
> ¿La incredulidad de ellos…? *Katargein* significa propiamente anular y dejar sin efecto, sentido muy apropiado para este pasaje.
