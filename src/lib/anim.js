// Ayudas pequeñas para animar con el progreso del scroll (valores de 0 a 1).

export const limitar = (n, min = 0, max = 1) => Math.min(Math.max(n, min), max)

// Cuánto se ha avanzado dentro de un tramo [a, b] del progreso: 0 antes, 1 después.
export const tramo = (p, a, b) => limitar((p - a) / (b - a))

// Arranque y frenado suaves.
export const suave = (t) => t * t * (3 - 2 * t)

export const lerp = (a, b, t) => a + (b - a) * t

// Mezcla dos colores #rrggbb.
export function mezclar(a, b, t) {
  const x = parseInt(a.slice(1), 16)
  const y = parseInt(b.slice(1), 16)
  const c = (s) => Math.round(((x >> s) & 255) + (((y >> s) & 255) - ((x >> s) & 255)) * t)
  return `#${((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1)}`
}

export const sinMovimiento = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
