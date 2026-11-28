---
aprobado_por: William Ochoa
aprobado_el: 2026-11-28
comentario: john-gill
estado: aprobado
analizado_por: Claude (IA)
analizado_el: 2026-11-28
---

# Perfil de estilo · John Gill, *Exposition of the Entire Bible* (1746–1766)

Manda sobre `guia-de-estilo.md` en lo que es propio de este autor.

## El autor y su obra

Pastor bautista de Londres (1697–1771), calvinista estricto y gran hebraísta. Comenta **cada frase** de cada versículo de la King James, con mucha erudición: el hebreo y el griego, las versiones antiguas (Septuaginta, Tárgum, siríaca, árabe, Vulgata) y, sobre todo, los comentaristas judíos. Es la obra más larga del proyecto: unos 8,3 millones de palabras.

## Cómo suena en español

- **Expositor doctrinal, no predicador.** Explica, enumera opiniones y concluye. Menos exclamaciones que Henry; tono sobrio y preciso.
- **Oraciones larguísimas** encadenadas con «;» y «:». Se pueden partir, en el mismo orden y sin perder ningún miembro.
- **Enumera interpretaciones:** `either… or…` → «o bien… o bien…»; `some think… others…` → «algunos piensan… otros…»; `it may be rendered` → «puede traducirse»; `so Kimchi` → «así Kimchi».
- **Doctrina reformada explícita** (predestinación, elección, redención particular): se traduce tal cual, sin suavizar.
- **Abreviaturas:** `Sc.` / `sc.` (*scilicet*) → «es decir»; `i.e.` → «es decir»; `viz.` → «a saber»; `&c.` → como dice la guía.

## Forma de las notas

- **Cada párrafo empieza con un trozo del versículo** de la King James y sigue el comentario. El primero termina en `,....` cuando el versículo sigue en los párrafos siguientes.
- En español: el trozo con las palabras de la **RVA**, en minúscula si no empieza el versículo, y **dos puntos**. El que termina en `,....` lleva `…` antes de los dos puntos:
  - `I say the truth in Christ, I lie not,.... The apostle…` → `Verdad digo en Cristo, no miento…: El apóstol…`
  - `my conscience bearing me witness. The apostle…` → `dándome testimonio mi conciencia: El apóstol…`
- Después de los dos puntos: mayúscula si sigue una oración completa; minúscula si es una aclaración breve.
- Si la RVA ordena el versículo distinto, se toma la parte de la RVA que corresponde a ese trozo, aunque cambie el orden.
- Mismos párrafos que el original: un párrafo por trozo del versículo, y las citas largas de rabinos o autores, en su propio párrafo como en el original.
- `unir.mjs` revisa estas citas contra la RVA (`"formato_citas": "sin-referencia"`).

## Fuentes que cita

- **Comentaristas judíos**, como él los llama: `Jarchi`, `Kimchi`, `Aben Ezra`, `Ben Melech`, `Abarbinel`, `Ben Gersom`, `Maimonides` → Jarchi, Kimchi, Aben Ezra, Ben Melech, Abarbanel, Ben Gersón, Maimónides. «Jarchi» es su nombre para Rashi: se deja «Jarchi».
- **Obras judías:** `Targum` → «el Tárgum» (`the Targum of Jonathan` → «el Tárgum de Jonatán»); `Misnah` → «la Misná»; `Talmud` → «el Talmud»; `Zohar` → «el Zóhar»; `Midrash` → «el Midrás».
- **Versiones antiguas:** `the Septuagint` → «la Septuaginta»; `the Syriac / Arabic / Ethiopic version` → «la versión siríaca / árabe / etiópica»; `the Vulgate Latin` → «la Vulgata latina».
- **Hebraístas cristianos:** `Junius and Tremellius`, `Piscator`, `Cocceius`, `Vatablus`, `Grotius` → Junius y Tremellius, Piscator, Cocceius, Vatablo, Grocio.
- **Traducciones alternativas entre comillas** (`it may be rendered, "what hath the Jew more?"`): se traducen al español entre « »; no se buscan en la RVA, porque son de Gill.

## Problemas de la fuente

- **Hebreo y griego perdidos.** La API dejó en blanco las palabras en hebreo y en griego: `the Hebrew   in Ecclesiastes 1:3`, `the Septuagint render by , "what abundance?"`. Nunca se inventa la palabra ni se pone una marca: se redacta la frase para que se lea bien sin ella («la expresión hebrea de Ec 1:3», «la Septuaginta lo traduce “¿qué abundancia?”»). Si Gill da la palabra transliterada (`Elleh hadebarim`), se deja en cursiva.
- **Notas al pie.** Las llamadas `(a)`, `(b)`… se conservan. Las notas suelen venir al final de la sección, en un párrafo propio (`(r) Vid. Buxtorf. Lexic. Rabbinic. p. 827. (s) Misn. Negaim, c. 2.`): se dejan igual, solo `Vid.` → «Ver»; las abreviaturas latinas de las obras no se traducen. Si una llamada no tiene su nota en la sección, se deja la llamada.
- **Restos de la página web:** el encabezado `INTRODUCTION TO DEUTERONOMY` y la línea final `Next: Deuteronomy Chapter 1` de las introducciones no se traducen.
- **Comillas rotas:** las citas de rabinos cierran a veces con `''`. Se cierran con «».

## Nombres, referencias y términos

- Referencias en formato e-Sword o completas (`Psalm 63:2`, `Leviticus 2:2`), juntadas como en el perfil de Henry: `Sal 63:2`, `Lv 2:2`. `v. 241` en una nota al pie es un verso de un poema: se deja.
- `the Shekinah` → «la Shekiná»; `the Lord` en el Antiguo Testamento → «el SEÑOR» (ver la guía).
- Palabras de 1750 que engañan: `induration` → «endurecimiento»; `conversation` → «conducta»; `meat offering` → «ofrenda de grano»; `prevent` → «adelantarse» o «impedir» según el caso; `Heathens` → «paganos»; `Papists` → «papistas»; `Mahometans` → «mahometanos».

## Ejemplo

> my conscience bearing me witness. The apostle, besides his appeal to Christ, calls his conscience to witness to the truth of his words; and this is as a thousand witnesses;

> dándome testimonio mi conciencia: El apóstol, además de apelar a Cristo, llama a su conciencia por testigo de la verdad de sus palabras; y esto vale por mil testigos.
