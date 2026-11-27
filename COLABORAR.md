# Colabora traduciendo comentarios bíblicos

Traducimos al español comentarios bíblicos clásicos y los publicamos gratis en https://comentarios.iglesy.net para que cualquier app o persona los use. Tú puedes ayudar desde tu computadora, **sin saber programar**: Claude hace el trabajo técnico y la traducción; tú solo lo pones en marcha y apruebas lo que te pida.

Cada vez que colaboras tomas un **lote**: unos capítulos de un libro (hasta unas 10,000 palabras del original). Nadie más lo toca mientras lo traduces. Al terminar, el equipo lo revisa y lo publica.

## Qué necesitas

- Una computadora con macOS, Windows o Linux.
- Una cuenta de **Claude** de pago (Pro o Max) con la **app de escritorio de Claude** (pestaña **Code**) o Claude Code en la terminal. La versión web de claude.ai no sirve: hace falta trabajar con archivos en tu computadora.
- Una cuenta de **GitHub** (gratis en https://github.com/signup).
- Usar uno de estos modelos: **Claude Opus 5.5 o superior, Claude Sonnet 5.5 o superior, o Claude Fable**. Con otros modelos el sistema no acepta la traducción.

## La primera vez (unos 10 minutos)

1. Abre la app de Claude, entra a la pestaña **Code** y elige una carpeta de trabajo, por ejemplo `Documentos`.
2. Revisa que el modelo elegido sea Opus, Sonnet 5.5 o superior, o Fable.
3. Pega este mensaje y envíalo:

```text
Quiero colaborar como voluntario traduciendo comentarios bíblicos al español
(proyecto github.com/wilochoa/comentarios-biblicos). No soy técnico: haz tú los
pasos y explícame en palabras sencillas lo que necesites de mí.

1. Dime qué modelo eres. Si no eres Claude Opus 5.5 o superior, Sonnet 5.5 o
   superior, o Fable, detente y explícame cómo cambiar de modelo.
2. Revisa si tengo git, Node 20 o superior y GitHub CLI (gh). Si falta algo,
   guíame para instalarlo y pídeme permiso antes de descargar nada.
3. Si no he iniciado sesión en GitHub, corre `gh auth login --web` y dime qué
   hacer en el navegador.
4. En esta carpeta, haz mi fork y clónalo:
   `gh repo fork wilochoa/comentarios-biblicos --clone`
   Luego, dentro de la carpeta comentarios-biblicos, corre `node scripts/unirme.mjs`.
5. Al terminar, dime que abra la carpeta comentarios-biblicos en una sesión
   nueva de Claude y escriba /colaborar.
```

4. Cuando termine, abre una **sesión nueva** en la carpeta `comentarios-biblicos` que se creó y escribe `/colaborar`.

## Las siguientes veces

Abre una sesión en la carpeta `comentarios-biblicos` y escribe `/colaborar`. Si tenías un lote a medias, Claude lo retoma; si no, toma uno nuevo.

## Qué pasa mientras traduces

- Claude reserva el lote abriendo una propuesta (un *pull request*) en GitHub a tu nombre.
- Traduce el lote por partes y guarda el avance en GitHub cada tanto, así que no se pierde nada si se corta.
- Al final marca la propuesta como lista; el equipo la revisa y la publica.

Si se te acaba el uso de Claude a la mitad, no pasa nada: vuelve y escribe `/colaborar` **dentro de las 24 horas siguientes**. Pasado ese tiempo sin avance, el lote queda libre para otra persona (lo ya entregado no se pierde).

## Licencia

Al entregar un lote aceptas que tu traducción se publique bajo la licencia que el proyecto define para ese comentario en `comentarios.json` (por ejemplo, CC BY-SA 4.0 para las notas de Tyndale). Tu usuario de GitHub queda en el historial del proyecto.

## Preguntas frecuentes

**¿Tengo que revisar la traducción?** No es obligatorio. Claude la valida automáticamente (forma, citas de la Reina-Valera 1909, que no falte nada), y el equipo la revisa antes de publicarla.

**¿Cuánto uso de Claude gasta un lote?** Depende del lote y de tu plan. Con Pro puede tomarte más de una sesión; con Max suele bastar una.

**¿Puedo elegir un libro?** Sí: escribe, por ejemplo, `/colaborar Romanos`.

**Algo falló.** Copia el mensaje de error y escríbelo en tu propuesta en GitHub (el enlace te lo da Claude), o abre un *issue* en https://github.com/wilochoa/comentarios-biblicos/issues.
