# Reservas

Cada traductor (una carpeta con su propio `.traductor.json`) aparta aquí los tramos que está traduciendo, en `<quien>.json`, con `node scripts/reservar.mjs`. Los demás los saltan. `node scripts/entregar.mjs` sube lo traducido y borra la reserva.

Una reserva vence a las 12 horas (`vence`) y entonces se considera abandonada. No edites estos archivos a mano; si un traductor quedó colgado, basta con esperar a que venza o borrar su archivo y hacer commit.
