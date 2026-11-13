import { crearMartin, nuevaIlustracion, TAU } from './modelos.js'

// Portada: el martín pescador gira suave de perfil → de frente → al otro perfil, y vuelve.
// En el modelo el pico apunta a +x. Con giro en y:
//   0       → perfil, pico a la derecha
//   TAU/4   → de frente (pecho naranja al público)
//   TAU/2   → perfil, pico a la izquierda
// La espalda quedaría en 3·TAU/4, así que el balanceo se queda dentro de [0, TAU/2]
// (un poco menos, 86° a cada lado del frente) y nunca la muestra.
const DE_FRENTE = TAU / 4
const BALANCEO = (86 / 360) * TAU
const VELOCIDAD = 0.42 // una vuelta completa de ida y vuelta ≈ 15 s

export function crearPortada(canvas) {
  const vista = nuevaIlustracion(canvas, { ancho: 280, alto: 230, movil: { ancho: 220, alto: 200 }, rotate: { x: -TAU / 28, y: DE_FRENTE } })
  const { illo } = vista
  const { raiz } = crearMartin(illo)
  // Centro aproximado del pájaro con su rama, para que gire sobre sí mismo y no se desplace.
  raiz.translate.set({ x: -8, y: 2 })

  return {
    ajustar: vista.ajustar,
    dibujar(p, t) {
      // El seno frena solo en los extremos: el pájaro se queda un momento de perfil.
      illo.rotate.y = DE_FRENTE + Math.sin(t * VELOCIDAD) * BALANCEO
      illo.rotate.x = -TAU / 28 + Math.sin(t * 0.37) * 0.03 - p * 0.15
      illo.updateRenderGraph()
    },
  }
}
