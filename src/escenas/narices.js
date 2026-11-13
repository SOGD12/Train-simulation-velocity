import Zdog from 'zdog'
import { lerp, limitar, mezclar, suave, tramo } from '../lib/anim.js'
import { BALA, C, CONV, crearBala, crearConvencional, mostrar, nuevaIlustracion, PICO, TAU } from './modelos.js'

// Escena "Dos narices":
//  1. el pico (un cono oscuro) se transforma en la nariz blanca del tren bala;
//  2. crece el cuerpo del tren bala y llega el tren convencional (una caja);
//  3. aparece el aire: líneas que rodean cada frente y partículas que se vuelven
//     naranjas donde el aire tiene que desviarse de golpe (más presión, más resistencia).

const FRENTE = 120 // x de la punta de ambos trenes
const CARRIL = { conv: -92, bala: 92 }
const BORDE = 380
const MARGEN = 7
const R_CONV = CONV.alto / 2
const R_BALA = BALA.diametro / 2
const DESVIOS = [3, 13, 25, 39, 55]
const PARTICULAS = 5
const VELOCIDAD = 150 // unidades por segundo
const AIRE = '#5fa8d3'
const PRESION = '#e8542a'

// Cuánto se tiene que apartar el aire a la distancia `x` de la punta (x > 0 = delante del tren).
// Caja: el aire choca con un frente plano y se aparta casi de golpe, en muy poco espacio.
const desvioCaja = (x) => (R_CONV + MARGEN) * suave(limitar((26 - x) / 26))
// Cono: el aire se aparta poco a poco, siguiendo la nariz (el radio crece en línea recta).
const desvioCono = (x) => (x >= 6 ? 0 : (R_BALA + MARGEN) * limitar((6 - x) / (BALA.nariz + 6)))

const alturaLinea = (o, r) => Math.sqrt(o * o + r * r)

export function crearNarices(canvas, { reducido }) {
  // Escena a pantalla completa: se deja aire abajo para la leyenda.
  const vista = nuevaIlustracion(canvas, { ancho: 820, alto: 520, rotate: { x: -TAU / 30, y: -TAU / 22 } })
  const { illo } = vista
  illo.translate.y = -36

  const bala = crearBala(illo)
  const conv = crearConvencional(illo)

  // Zonas de presión delante de cada frente.
  const presionConv = new Zdog.Ellipse({
    addTo: illo,
    translate: { x: FRENTE + 14, y: CARRIL.conv, z: 36 },
    width: 46,
    height: 96,
    stroke: false,
    fill: true,
    color: 'rgba(232, 84, 42, 0)',
  })
  const presionBala = new Zdog.Ellipse({
    addTo: illo,
    translate: { x: FRENTE + 4, y: CARRIL.bala, z: 36 },
    width: 14,
    height: 22,
    stroke: false,
    fill: true,
    color: 'rgba(232, 84, 42, 0)',
  })

  // Líneas de aire y sus partículas.
  const corrientes = []
  for (const [carril, desvio] of [
    [CARRIL.conv, desvioCaja],
    [CARRIL.bala, desvioCono],
  ]) {
    for (const lado of [-1, 1]) {
      for (const o of DESVIOS) {
        const y = (x) => carril + lado * alturaLinea(o, desvio(x - FRENTE))
        const path = []
        for (let x = BORDE; x >= -BORDE; x -= 6) path.push({ x, y: y(x) })
        const linea = new Zdog.Shape({ addTo: illo, path, closed: false, stroke: 1.2, color: AIRE, visible: false })
        const puntos = []
        for (let i = 0; i < PARTICULAS; i++) {
          puntos.push({
            forma: new Zdog.Shape({ addTo: illo, stroke: 5, color: AIRE, visible: false, translate: { z: 2 } }),
            fase: (i / PARTICULAS) * BORDE * 2 + o * 7,
          })
        }
        corrientes.push({ y, linea, puntos })
      }
    }
  }

  return {
    ajustar: vista.ajustar,
    dibujar(p, t) {
      // 1. Del pico a la nariz.
      const morf = suave(tramo(p, 0.1, 0.34))
      const crecer = suave(tramo(p, 0.3, 0.48))
      const llegar = suave(tramo(p, 0.34, 0.52))
      const aire = tramo(p, 0.52, 0.6)
      const presion = suave(tramo(p, 0.58, 0.75))

      // En celulares se recorta la cola de los trenes para ver más grandes los frentes.
      const cerca = vista.estrecho ? 1.45 : 1
      illo.zoom = vista.zoomBase * lerp(2.3, cerca, suave(tramo(p, 0.08, 0.46)))
      illo.translate.x = lerp(-30, vista.estrecho ? -150 : 0, crecer)
      // Al aparecer el aire la cámara queda de perfil, para que las líneas sigan la silueta de cada frente.
      const perfil = suave(tramo(p, 0.46, 0.56))
      illo.rotate.y = lerp(lerp(-TAU / 7, -TAU / 22, suave(tramo(p, 0.05, 0.4))), -TAU / 160, perfil)
      illo.rotate.x = lerp(-TAU / 30, -TAU / 200, perfil)

      const diam = lerp(PICO.diametro / BALA.diametro, 1, morf)
      const largo = lerp(PICO.largo / BALA.nariz, 1, morf)
      bala.nariz.scale.set({ x: diam, y: diam, z: largo })
      bala.nariz.translate.x = -BALA.nariz * largo
      bala.cono.color = mezclar(C.pico, C.balaCuerpo, morf)
      bala.cono.backface = mezclar(C.pico, C.balaSombra, morf)

      bala.cuerpo.translate.x = -BALA.nariz * largo
      bala.cuerpo.scale.z = Math.max(crecer, 0.001)
      mostrar(bala.cuerpo, crecer > 0.02)
      bala.ruedas.forEach((r) => (r.visible = crecer > 0.85))
      bala.raiz.translate.set({ x: lerp(60, FRENTE, crecer), y: lerp(0, CARRIL.bala, crecer) })

      mostrar(conv.raiz, llegar > 0)
      conv.raiz.translate.set({ x: lerp(-760, FRENTE, llegar), y: CARRIL.conv })

      // 2. Aire.
      const pulso = reducido ? 1 : 1 + Math.sin(t * 5) * 0.06
      presionConv.color = `rgba(232, 84, 42, ${0.34 * presion})`
      presionConv.scale.set({ x: presion * pulso + 0.001, y: presion * pulso + 0.001, z: 1 })
      presionBala.color = `rgba(232, 84, 42, ${0.2 * presion})`
      presionBala.scale.set({ x: presion + 0.001, y: presion + 0.001, z: 1 })

      for (const { y, linea, puntos } of corrientes) {
        linea.visible = aire > 0
        linea.color = `rgba(95, 168, 211, ${0.45 * aire})`
        for (const punto of puntos) {
          punto.forma.visible = aire > 0.5
          if (!punto.forma.visible) continue
          const recorrido = (t * VELOCIDAD + punto.fase) % (BORDE * 2)
          const x = BORDE - recorrido
          const yx = y(x)
          const pendiente = Math.abs(y(x - 1.5) - y(x + 1.5)) / 3
          punto.forma.translate.x = x
          punto.forma.translate.y = yx
          punto.forma.color = mezclar(AIRE, PRESION, limitar(pendiente * 0.9) * presion)
        }
      }

      illo.updateRenderGraph()
    },
  }
}
