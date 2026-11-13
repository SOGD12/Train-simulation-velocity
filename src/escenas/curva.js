import Zdog from 'zdog'
import { fuerzaRelativa, inclinacion, seVuelca, zonaDe } from '../lib/seguridad.js'
import { C, nuevaIlustracion, TAU } from './modelos.js'

// Escena "en una curva": el frente del tren sobre sus dos rieles.
// La flecha es la fuerza que lo empuja hacia afuera (crece con v²).
// Por encima del límite de la curva se inclina sobre el riel de afuera; desde el doble del límite
// (la regla de los accidentes reales, ver VUELCO en data/trenes.js) se vuelca y se sale de la vía.

const TROCHA = 44 // separación entre los rieles
const RIEL_Y = 34 // altura de la parte de arriba de los rieles
const VISTA_X = -TAU / 48 // se mira apenas desde arriba
const BAJO = -16 // altura del borde de abajo del tren sobre el riel (deja ver las ruedas)

// Las piezas del frente se dibujan relativas al pivote (riel de afuera, x = 0). El tren va centrado en -TROCHA/2.
const CENTRO = -TROCHA / 2

// Tren bala: frente redondeado (la nariz en punta, vista de frente), parabrisas y franja azul.
function frenteBala(addTo) {
  const silueta = (x, z, color) =>
    new Zdog.Shape({
      addTo,
      translate: { x: CENTRO + x, z },
      path: [
        { x: -46, y: BAJO },
        { x: -46, y: -52 },
        { arc: [{ x: -46, y: -102 }, { x: 0, y: -102 }] },
        { arc: [{ x: 46, y: -102 }, { x: 46, y: -52 }] },
        { x: 46, y: BAJO },
      ],
      closed: true,
      fill: true,
      stroke: 8,
      color,
    })
  silueta(-7, -10, '#cfd4d3') // costado, para dar volumen
  silueta(0, 0, C.balaCuerpo)

  const pieza = (opciones) => new Zdog.Shape({ addTo, translate: { x: CENTRO, z: 2 }, ...opciones })
  // Parabrisas.
  pieza({
    path: [{ x: -30, y: -64 }, { arc: [{ x: -30, y: -86 }, { x: 0, y: -88 }] }, { arc: [{ x: 30, y: -86 }, { x: 30, y: -64 }] }],
    closed: true,
    fill: true,
    stroke: 5,
    color: C.ventana,
  })
  // Punta de la nariz (brillo en el centro).
  pieza({ translate: { x: CENTRO, y: -44, z: 3 }, stroke: 16, color: '#ffffff' })
  // Franja azul y faros.
  pieza({ path: [{ x: -44, y: -26 }, { x: 44, y: -26 }], stroke: 5, color: C.balaFranja })
  for (const x of [-26, 26]) pieza({ translate: { x: CENTRO + x, y: -38, z: 3 }, stroke: 7, color: '#ffe3a1' })
}

// Tren convencional: frente plano (una caja vista de frente), rojo, con su ventana.
function frenteConvencional(addTo) {
  const caja = (x, z, color) =>
    new Zdog.Rect({
      addTo,
      translate: { x: CENTRO + x, y: BAJO - 52, z },
      width: 98,
      height: 104,
      stroke: 4,
      fill: true,
      color,
    })
  caja(-7, -10, '#8f2620') // costado, para dar volumen
  caja(0, 0, C.convFrente)

  const pieza = (opciones) => new Zdog.Shape({ addTo, translate: { x: CENTRO, z: 2 }, ...opciones })
  pieza({ path: [{ x: -34, y: -96 }, { x: 34, y: -96 }, { x: 34, y: -76 }, { x: -34, y: -76 }], closed: true, fill: true, stroke: 4, color: C.ventana })
  pieza({ path: [{ x: -47, y: BAJO - 6 }, { x: 47, y: BAJO - 6 }], stroke: 8, color: '#3b3f42' })
  for (const x of [-32, 32]) pieza({ translate: { x: CENTRO + x, y: -40, z: 3 }, stroke: 8, color: '#ffe3a1' })
}

export function crearCurva(canvas, { reducido, tipo, velocidadRef, seguridad }) {
  // Se deja aire arriba para que el frente del tren no tape la etiqueta de la fuerza.
  const vista = nuevaIlustracion(canvas, { ancho: 300, alto: 270, rotate: { x: VISTA_X } })
  const { illo } = vista
  illo.translate.y = -6

  // Suelo: un rectángulo de frente muy al fondo, para que se dibuje antes que todo.
  // En Zdog, girar en x da y' = y·cos − z·sin; se despeja para que su borde quede bajo el durmiente.
  const zSuelo = -420
  const altoSuelo = 500
  const borde = RIEL_Y + 13
  new Zdog.Rect({
    addTo: illo,
    width: 1600,
    height: altoSuelo,
    translate: { y: (borde + zSuelo * Math.sin(VISTA_X)) / Math.cos(VISTA_X) + altoSuelo / 2, z: zSuelo },
    stroke: 1,
    fill: true,
    color: '#e6ddca',
  })

  // Durmiente y rieles.
  new Zdog.Box({
    addTo: illo,
    width: TROCHA + 56,
    height: 7,
    depth: 18,
    translate: { y: RIEL_Y + 9, z: -20 },
    stroke: 1,
    color: '#8d6f52',
    topFace: '#a8896a',
  })
  for (const x of [-TROCHA / 2, TROCHA / 2]) {
    new Zdog.Box({
      addTo: illo,
      width: 6,
      height: 8,
      depth: 26,
      translate: { x, y: RIEL_Y + 4, z: -20 },
      stroke: 1,
      color: '#5d666e',
      topFace: '#a3abb2',
    })
  }

  // El tren cuelga de un pivote en el riel de afuera (derecha): ahí se inclina y se vuelca.
  const pivote = new Zdog.Anchor({ addTo: illo, translate: { x: TROCHA / 2, y: RIEL_Y } })
  // Eje con una rueda sobre cada riel: al inclinarse se ve cuál se levanta.
  const eje = new Zdog.Anchor({ addTo: pivote, translate: { z: -12 } })
  new Zdog.Shape({ addTo: eje, path: [{ x: -TROCHA, y: -7 }, { x: 0, y: -7 }], stroke: 4, color: C.rueda })
  for (const x of [-TROCHA, 0]) new Zdog.Shape({ addTo: eje, translate: { x, y: -7 }, stroke: 14, color: C.rueda })
  if (tipo === 'bala') frenteBala(pivote)
  else frenteConvencional(pivote)

  // Flecha de la fuerza hacia afuera de la curva.
  const flecha = new Zdog.Anchor({ addTo: illo, translate: { x: CENTRO + TROCHA / 2 + 66, y: RIEL_Y - 60, z: 40 } })
  const tramo = new Zdog.Anchor({ addTo: flecha })
  const linea = new Zdog.Shape({ addTo: tramo, path: [{ x: 0 }, { x: 1 }], stroke: 6, color: C.naranja })
  const punta = new Zdog.Shape({
    addTo: flecha,
    path: [{ x: -10, y: -8 }, { x: 0, y: 0 }, { x: -10, y: 8 }],
    closed: false,
    stroke: 6,
    color: C.naranja,
  })

  let angulo = 0
  let desliz = 0
  let anterior = null

  return {
    ajustar: vista.ajustar,
    dibujar(_p, t) {
      const v = velocidadRef.current
      const zona = zonaDe(v, seguridad)
      const volcado = seVuelca(v, seguridad)

      // Se acerca suave a la inclinación que toca (o salta, con "reducir movimiento").
      const dt = anterior === null ? 1 : Math.min(0.1, Math.max(0, t - anterior))
      anterior = t
      const k = reducido ? 1 : 1 - Math.exp(-dt * (volcado ? 4 : 8))
      angulo += (inclinacion(v, seguridad) - angulo) * k
      desliz += ((volcado ? 22 : 0) - desliz) * k

      // Por encima del límite de la curva el tren vibra un poco.
      const vibra = !reducido && !volcado && v > seguridad.segura ? Math.sin(t * 40) * 0.006 : 0
      pivote.rotate.z = angulo + vibra
      pivote.translate.x = TROCHA / 2 + desliz

      const largo = Math.min(120, 14 + 26 * fuerzaRelativa(v, seguridad))
      tramo.scale.x = largo
      punta.translate.x = largo
      const color = zona === 'rojo' ? C.convFrente : zona === 'ambar' ? '#d4911a' : '#2f8f57'
      linea.color = color
      punta.color = color
      const conFlecha = angulo < 0.5
      linea.visible = conFlecha
      punta.visible = conFlecha

      illo.updateRenderGraph()
    },
  }
}
