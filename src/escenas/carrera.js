import Zdog from 'zdog'
import { lerp, limitar } from '../lib/anim.js'
import { distanciaRecorrida, resolver } from '../lib/calculos.js'
import { minutosDeProgreso } from '../lib/carrera.js'
import { C, crearBala, crearConvencional, nuevaIlustracion, TAU } from './modelos.js'

// Escena "La carrera": dos vías de A a B. El scroll es el reloj.
// La distancia y las velocidades las elige el usuario: llegan en `datosRef`
// ({ distanciaKm, vBala, vConv }) y se leen en cada cuadro.

const X_A = -370
const X_B = 370
const ESCALA = 0.8
const ESCALA_CELULAR = 0.62 // en celulares los trenes se dibujan más grandes y la cámara los sigue
const LARGO_TREN_BASE = 330
const ZOOM_MAX_CELULAR = 1.25
const VIAS = { bala: 100, conv: -100 }
const SUELO = 10

// Letras A y B dibujadas con líneas, sobre un cartel.
function cartel(addTo, x, letra) {
  const poste = new Zdog.Anchor({ addTo, translate: { x, y: SUELO } })
  new Zdog.Shape({ addTo: poste, path: [{ y: 0 }, { y: -70 }], stroke: 4, color: '#3b4750' })
  const placa = new Zdog.Anchor({ addTo: poste, translate: { y: -86 } })
  new Zdog.Rect({ addTo: placa, width: 34, height: 32, stroke: 4, fill: true, color: '#14212b' })
  const trazo = { addTo: placa, translate: { z: 6 }, closed: false, stroke: 3.4, color: '#f4efe4' }
  if (letra === 'A') {
    new Zdog.Shape({ ...trazo, path: [{ x: -8, y: 10 }, { x: 0, y: -10 }, { x: 8, y: 10 }] })
    new Zdog.Shape({ ...trazo, path: [{ x: -4.5, y: 3 }, { x: 4.5, y: 3 }] })
  } else {
    new Zdog.Shape({
      ...trazo,
      path: [
        { x: -6, y: 10 },
        { x: -6, y: -10 },
        { x: 1, y: -10 },
        { arc: [{ x: 7, y: -10 }, { x: 7, y: -5 }] },
        { arc: [{ x: 7, y: 0 }, { x: 1, y: 0 }] },
        { x: -6, y: 0 },
        { move: { x: 1, y: 0 } },
        { arc: [{ x: 8, y: 0 }, { x: 8, y: 5 }] },
        { arc: [{ x: 8, y: 10 }, { x: 1, y: 10 }] },
        { x: -6, y: 10 },
      ],
    })
  }
}

function via(addTo, z) {
  new Zdog.Rect({
    addTo,
    translate: { y: SUELO + 1, z },
    rotate: { x: TAU / 4 },
    width: X_B - X_A + 40,
    height: 38,
    stroke: 1,
    fill: true,
    color: '#d6ccb6',
  })
  for (let x = X_A - 10; x <= X_B + 10; x += 16) {
    new Zdog.Shape({ addTo, path: [{ x, z: z - 11 }, { x, z: z + 11 }], translate: { y: SUELO }, stroke: 3, color: '#9a7b5c' })
  }
  for (const lado of [-6, 6]) {
    new Zdog.Shape({
      addTo,
      path: [{ x: X_A - 20 }, { x: X_B + 20 }],
      translate: { y: SUELO - 1.5, z: z + lado },
      stroke: 2.4,
      color: '#68737c',
    })
  }
}

function bandera(addTo, z, color) {
  const asta = new Zdog.Anchor({ addTo, translate: { x: X_B + 24, y: SUELO, z } })
  new Zdog.Shape({ addTo: asta, path: [{ y: 0 }, { y: -46 }], stroke: 2.5, color: '#3b4750' })
  const tela = new Zdog.Shape({
    addTo: asta,
    path: [{ y: -46 }, { x: 22, y: -39 }, { y: -32 }],
    closed: true,
    fill: true,
    stroke: 2,
    color: '#b9b2a3',
  })
  return { tela, color }
}

export function crearCarrera(canvas, { datosRef }) {
  const vista = nuevaIlustracion(canvas, {
    ancho: 840,
    alto: 340,
    movil: { ancho: 420, alto: 340 },
    rotate: { x: -TAU / 11, y: 0 },
  })
  const { illo } = vista
  illo.translate.y = 26 // deja aire arriba para el cuadro del resultado

  // Zdog dibuja cada figura según su profundidad media. Un solo suelo grande taparía la vía de atrás,
  // así que el suelo va en franjas que nunca quedan debajo de una vía.
  const franjas = [
    [VIAS.conv - 60, VIAS.conv - 19],
    [VIAS.conv + 19, VIAS.bala - 19],
    [VIAS.bala + 19, VIAS.bala + 60],
  ]
  for (const [z0, z1] of franjas) {
    new Zdog.Rect({
      addTo: illo,
      translate: { y: SUELO + 2, z: (z0 + z1) / 2 },
      rotate: { x: TAU / 4 },
      width: X_B - X_A + 120,
      height: z1 - z0,
      stroke: 1,
      fill: true,
      color: '#e9e1cf',
    })
  }
  via(illo, VIAS.conv)
  via(illo, VIAS.bala)
  cartel(illo, X_A - 4, 'A')
  cartel(illo, X_B + 4, 'B')
  const banderas = [bandera(illo, VIAS.bala + 20, C.naranja), bandera(illo, VIAS.conv + 20, C.convFrente)]

  const bala = crearBala(illo)
  const conv = crearConvencional(illo)
  let escala = 0
  const ubicar = (raiz, km, d, z, alto) => {
    raiz.translate.set({ x: lerp(X_A + LARGO_TREN_BASE * escala + 4, X_B, km / d), y: SUELO - alto, z })
    return raiz.translate.x
  }

  return {
    ajustar: vista.ajustar,
    dibujar(p) {
      const { distanciaKm, vBala, vConv } = datosRef.current
      // Escala de los trenes según el ancho de pantalla.
      const nueva = vista.estrecho ? ESCALA_CELULAR : ESCALA
      if (nueva !== escala) {
        escala = nueva
        for (const tren of [bala.raiz, conv.raiz]) tren.scale.set({ x: escala, y: escala, z: escala })
      }
      const r = resolver(distanciaKm, vBala, vConv)
      const minutos = minutosDeProgreso(p, r.minTotal)
      const kmBala = distanciaRecorrida(r.vb, minutos, r.d)
      const kmConv = distanciaRecorrida(r.vc, minutos, r.d)
      const xBala = ubicar(bala.raiz, kmBala, r.d, VIAS.bala, 32 * escala + 5)
      const xConv = ubicar(conv.raiz, kmConv, r.d, VIAS.conv, 36 * escala + 6)

      if (vista.estrecho) {
        // Cámara de celular: se centra en los dos trenes y se aleja solo lo justo para que quepan.
        const largo = LARGO_TREN_BASE * escala
        const izq = Math.min(xBala, xConv) - largo - 30
        const der = Math.max(xBala, xConv) + 40
        const zoomMin = vista.w / (X_B - X_A + 120)
        const zoom = limitar(vista.w / (der - izq), zoomMin, ZOOM_MAX_CELULAR)
        const mitad = vista.w / zoom / 2
        const centro = limitar((izq + der) / 2, X_A - 50 + mitad, X_B + 50 - mitad)
        illo.zoom = zoom
        illo.translate.x = -centro
      } else {
        illo.zoom = vista.zoomBase
        illo.translate.x = 0
      }
      banderas[0].tela.color = kmBala >= r.d ? banderas[0].color : '#b9b2a3'
      banderas[1].tela.color = kmConv >= r.d ? banderas[1].color : '#b9b2a3'
      illo.updateRenderGraph()
    },
  }
}
