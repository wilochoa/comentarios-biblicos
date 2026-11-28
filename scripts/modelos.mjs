// Qué modelos pueden traducir (modelos-permitidos.json): en las carpetas internas y en los lotes de voluntarios.
//
// Acepta el ID del modelo ("claude-opus-5-5", "claude-sonnet-5-5-20261001") o
// su nombre ("Claude Opus 5.5", "Claude Fable 5.2 (IA)").
import { join } from 'node:path';
import { ROOT, leerJson } from './lib.mjs';

const NOMBRES = { opus: 'Opus', sonnet: 'Sonnet', fable: 'Fable', haiku: 'Haiku' };

export const minimos = () => leerJson(join(ROOT, 'modelos-permitidos.json')).minimos;
/** Desde qué fecha (traducido_el) se exige la regla a todos los archivos. */
export const vigenteDesde = () => leerJson(join(ROOT, 'modelos-permitidos.json')).vigente_desde;

/** "claude-opus-5-5" → { familia: 'opus', version: [5, 5], nombre: 'Claude Opus 5.5' }; si no se reconoce, null. */
export function analizarModelo(texto) {
  const m = String(texto ?? '').match(/\b(opus|sonnet|fable|haiku)[\s_-]*(\d{1,2})(?:[.-](\d{1,2})(?!\d))?/i);
  if (!m) return null;
  const familia = m[1].toLowerCase();
  const version = [Number(m[2]), Number(m[3] ?? 0)];
  return { familia, version, nombre: `Claude ${NOMBRES[familia]} ${version.join('.')}` };
}

const comparar = (a, b) => a[0] - b[0] || a[1] - b[1];

/** ¿Este modelo puede traducir? */
export function modeloPermitido(texto, tabla = minimos()) {
  const modelo = analizarModelo(texto);
  if (!modelo || !(modelo.familia in tabla)) return false;
  const minimo = String(tabla[modelo.familia]).split('.').map(Number);
  return comparar(modelo.version, [minimo[0], minimo[1] ?? 0]) >= 0;
}

/** Lista legible de lo permitido, para los mensajes de error. */
export const describirPermitidos = (tabla = minimos()) =>
  Object.entries(tabla).map(([f, v]) => `Claude ${NOMBRES[f] ?? f} ${v} o superior`).join(', ');
