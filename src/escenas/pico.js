import { lerp, suave, tramo } from '../lib/anim.js'
import { crearMartin, nuevaIlustracion, TAU } from './modelos.js'

// Escena "El pico": el pájaro completo, luego acercamiento al pico, aparecen los cortes
// (anillos) y se gira para ver que cada corte es un círculo.
export function crearPico(canvas) {
  // Escena a pantalla completa: se deja aire abajo para la leyenda.
  const vista = nuevaIlustracion(canvas, { ancho: 380, alto: 330, rotate: { x: -TAU / 40, y: -TAU / 14 } })
  vista.illo.translate.y = -24
  const { illo } = vista
  const { raiz, anillos } = crearMartin(illo, { conAnillos: true })

  return {
    ajustar: vista.ajustar,
    dibujar(p, t) {
      const acercar = suave(tramo(p, 0.2, 0.42)) * (1 - 0.35 * suave(tramo(p, 0.8, 1)))
      const girar = suave(tramo(p, 0.5, 0.72))

      illo.zoom = vista.zoomBase * lerp(1, 1.6, acercar)
      raiz.translate.x = lerp(-6, -74, acercar)
      raiz.translate.y = lerp(4, 30, acercar)
      illo.rotate.y = lerp(-TAU / 14, TAU / 7, girar) + Math.sin(t * 0.6) * 0.04
      illo.rotate.x = lerp(-TAU / 40, -TAU / 28, girar)

      anillos.forEach((anillo, i) => {
        const a = suave(tramo(p, 0.3 + i * 0.035, 0.36 + i * 0.035))
        anillo.visible = a > 0
        const s = Math.max(a, 0.001)
        anillo.scale.set({ x: s, y: s, z: s })
      })

      illo.updateRenderGraph()
    },
  }
}
