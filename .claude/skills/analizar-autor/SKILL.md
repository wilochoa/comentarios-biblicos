---
name: analizar-autor
description: Analiza el estilo del autor de un comentario antes de empezar a traducirlo y escribe su perfil de estilo (estilos/<comentario>.md), que después siguen todos los traductores. Úsala cuando el usuario escriba "/analizar-autor <comentario>", agregue un comentario nuevo a comentarios.json o plan.json, o cuando un script diga que a un comentario le falta su perfil de estilo.
argument-hint: "<id del comentario>"
---

# Analizar el estilo de un autor

Cada autor escribe distinto y pide reglas propias: Abbott cita el versículo sin número y abusa de «&c.»; Henry predica en listas numeradas; Tyndale explica la NLT. Eso se descubre **antes** de traducir, no en el capítulo 200. El resultado es `estilos/<comentario>.md`. Sin ese perfil aprobado por una persona, los scripts no reparten el comentario.

Trabaja en una carpeta interna del proyecto, no en la de un voluntario. No traduce nada para publicar.

## 1. Requisitos

- El comentario está en `comentarios.json` (con `publicar: false`) y medido (`node scripts/medir.mjs <id>`). Si no, detente y dilo.
- Lee `guia-de-estilo.md`, `glosario.md` y los perfiles que ya existen en `estilos/` (sirven de modelo: `abbott.md`, `tyndale.md`).

## 2. Muestra

`node scripts/muestra.mjs <id>`: guarda en `trabajo/muestra-<id>.md` introducciones y capítulos repartidos por toda la obra, y muestra conteos de lo que suele pedir regla propia. **Lee la muestra entera.** Si un conteo llama la atención, busca más casos en otros libros con `node scripts/fuente.mjs <id> <LIBRO> <unidad>`.

Averigua también quién fue el autor: época, tradición, para quién escribía y **qué Biblia comenta** (King James, NLT, su propia traducción). De eso depende casi todo lo demás.

## 3. Qué hay que averiguar

1. **Voz:** registro, largo de las oraciones, persona («nosotros», «tú»), retórica, fórmulas que repite. ¿Cómo debe sonar en español para que siga siendo él?
2. **Forma de las notas:** ¿cita el versículo? ¿Con número o sin él? ¿Con qué signos la cierra y separa? ¿Numeración, listas, subtítulos?
3. **Relación con la RVA 1909:** las citas van con la RVA. ¿Qué pasa cuando el autor explica una palabra de su Biblia que la RVA traduce distinto? ¿Glosas de inglés antiguo? ¿Variantes textuales?
4. **Referencias y abreviaturas:** formato de las referencias bíblicas, remisiones internas, abreviaturas propias.
5. **Términos propios** que no están en el glosario, y nombre de Dios (`LORD`, `Jehovah`, `Yahweh`).
6. **Otros idiomas, citas de otros autores, versos.**
7. **Trampas:** erratas de la fuente, lenguaje polémico o de época, medidas, cualquier rareza.

## 4. Probar antes de escribir

Traduce tú mismo, en `trabajo/`, **dos notas cortas, una larga y una introducción** de la muestra, siguiendo `instrucciones/tramo.md`. Es una prueba: no corras `unir.mjs`. Cada duda que te surja y la guía no resuelva es una regla que falta.

## 5. Escribir el perfil

`estilos/<id>.md`, con el mismo encabezado y las mismas secciones que `estilos/abbott.md`:

```
---
comentario: <id>
estado: borrador
analizado_por: <tu traductor, p. ej. Claude (IA)>
analizado_el: <fecha de hoy>
---
```

Secciones: «El autor y su obra», «Cómo suena en español», «Forma de las notas», «La Biblia que comenta y la RVA», «Referencias y abreviaturas», «Trampas», «Ejemplo» (un original y su traducción). Reglas concretas, cada una con un ejemplo real del original y su traducción. Sin generalidades: lo que ya dice la guía no se repite. Máximo unas 60 líneas: el traductor lo lee en cada tramo.

## 6. Lo que el perfil no puede resolver solo

Dilo en el informe, no lo cambies por tu cuenta:

- **Reglas que valen para todos los autores:** proponlas para `guia-de-estilo.md`.
- **Términos nuevos:** a `glosario-propuestas/<tu nombre>.md`.
- **Formato de las citas:** si el autor cita el versículo sin número, como Abbott, hace falta `"formato_citas": "sin-referencia"` en `comentarios.json`. Si su forma es otra y el revisor (`scripts/citas.mjs`) no la reconoce, explica cómo es para que alguien lo adapte.
- **Reglas que debería revisar un script** (algo mecánico y frecuente).

## 7. Informe y aprobación

El perfil queda en `estado: borrador`. **Tú nunca lo apruebas ni corres el comando de aprobación:** eso lo hace la persona responsable del proyecto, después de leerlo. Muéstrale, en lenguaje sencillo: cómo es el autor, las 5 o 6 reglas más importantes con su ejemplo, las traducciones de prueba y lo del paso 6. Dile que, si está de acuerdo, lo apruebe con:

`node scripts/estilo.mjs aprobar <id> "<su nombre>"`

y que después se haga commit de `estilos/<id>.md`. Desde ahí el comentario ya se reparte.

## Si el perfil ya existe

Con un perfil aprobado, esta skill lo **revisa**: lee las últimas traducciones del comentario, busca reglas que falten o que no se estén cumpliendo, y propone los cambios al usuario. Un perfil aprobado solo se cambia con su visto bueno.
