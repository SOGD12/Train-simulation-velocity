import { VUELCO } from '../data/trenes.js'

// ¿Es segura esta velocidad? Usa los límites reales de SEGURIDAD (data/trenes.js).

// verde: permitida en la vía normal · ámbar: solo en vías especiales · rojo: no permitida con pasajeros
export function zonaDe(velocidad, limites) {
  if (velocidad <= limites.segura) return 'verde'
  if (velocidad <= limites.especial) return 'ambar'
  return 'rojo'
}

// En una curva, la fuerza que empuja al tren hacia afuera es F = m · v² / r.
// Con el mismo tren (m) y la misma curva (r), solo cambia v²: al doble de velocidad, 4 veces la fuerza.
// Se compara con la fuerza al límite de la curva que dibuja la escena: (v ÷ v_límite)².
export const fuerzaRelativa = (velocidad, limites) => (velocidad / limites.segura) ** 2

// ¿Se sale de la vía en esa curva? Solo a partir del doble de su límite (ver VUELCO en data/trenes.js).
export const seVuelca = (velocidad, limites) => velocidad / limites.segura >= VUELCO.vecesLimite

const GRADO = Math.PI / 180

// Cuánto se inclina el tren en la escena (en radianes). Es una imagen didáctica, no un cálculo
// de ingeniería: casi nada hasta el límite, cada vez más hasta el doble, y volcado desde ahí.
export function inclinacion(velocidad, limites) {
  if (seVuelca(velocidad, limites)) return 80 * GRADO
  const veces = velocidad / limites.segura
  if (veces <= 1) return 2 * GRADO * veces ** 2
  return (2 + 10 * ((veces - 1) / (VUELCO.vecesLimite - 1))) * GRADO
}
