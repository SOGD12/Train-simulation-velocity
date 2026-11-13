import Zdog from 'zdog'

// Modelos 3D hechos con figuras geométricas simples de Zdog:
//  - martín pescador: esferas (trazos gruesos) y un cono para el pico
//  - tren bala: cilindro + cono (la nariz)
//  - tren convencional: una caja (prisma rectangular)
// Todos miran hacia +x (a la derecha).

export const { TAU } = Zdog

export const C = {
  martin: '#1a86c7',
  martinOscuro: '#0b5d8c',
  naranja: '#e8742a',
  blanco: '#fbfaf6',
  pico: '#1d2227',
  ojo: '#0e1114',
  pata: '#d8452b',
  rama: '#7a5634',
  anillo: '#e8742a',
  balaCuerpo: '#f7f6f1',
  balaSombra: '#d5d9d8',
  balaFranja: '#1f4fa0',
  convCuerpo: '#ebe7de',
  convSombra: '#c7c1b4',
  convTecho: '#f4f1ea',
  convFrente: '#c8332b',
  ventana: '#24333d',
  rueda: '#2a2f33',
}

// Ilustración que se adapta al tamaño de su contenedor. `ancho` y `alto` son las unidades
// de la escena que siempre deben caber en pantalla.
// `movil` ({ ancho, alto }, opcional) es el tamaño lógico que debe caber en pantallas estrechas (celulares):
// más chico que el de escritorio, para que la escena se vea más grande y no "lejos".
export const ANCHO_CELULAR = 600

export function nuevaIlustracion(canvas, { ancho, alto, movil, ...opciones }) {
  const illo = new Zdog.Illustration({ element: canvas, resize: false, ...opciones })
  const vista = {
    illo,
    zoomBase: 1,
    estrecho: false,
    w: 0,
    h: 0,
    ajustar() {
      const caja = canvas.parentElement.getBoundingClientRect()
      const w = Math.max(1, Math.round(caja.width))
      const h = Math.max(1, Math.round(caja.height))
      illo.setSize(w, h)
      vista.w = w
      vista.h = h
      vista.estrecho = w < ANCHO_CELULAR
      const base = vista.estrecho && movil ? movil : { ancho, alto }
      vista.zoomBase = Math.min(w / base.ancho, h / base.alto)
      illo.zoom = vista.zoomBase
    },
  }
  return vista
}

// En Zdog un Anchor no tiene `visible`: hay que mostrar u ocultar cada figura que cuelga de él.
export function mostrar(nodo, visible) {
  if ('visible' in nodo) nodo.visible = visible
  for (const hijo of nodo.children) mostrar(hijo, visible)
}

// ---------------------------------------------------------------- martín pescador

export const PICO = { largo: 72, diametro: 15 }

export function crearMartin(addTo, { conAnillos = false, conRama = true } = {}) {
  const raiz = new Zdog.Anchor({ addTo })

  // Cuerpo: un Group dibuja a sus hijos en el orden en que se agregan,
  // así el pecho naranja siempre queda encima del lomo azul.
  const cuerpo = new Zdog.Group({ addTo: raiz })
  new Zdog.Shape({ addTo: cuerpo, path: [{ x: 8, y: -6 }, { x: -26, y: 20 }], stroke: 50, color: C.martin })
  new Zdog.Shape({ addTo: cuerpo, path: [{ x: 6, y: 8 }, { x: -18, y: 27 }], stroke: 38, color: C.naranja })

  // Alas a cada lado.
  for (const lado of [1, -1]) {
    new Zdog.Shape({
      addTo: raiz,
      path: [
        { x: 6, y: -10 },
        { x: -30, y: 6 },
        { x: -48, y: 30 },
        { x: -12, y: 20 },
      ],
      translate: { z: 24 * lado },
      closed: true,
      fill: true,
      stroke: 8,
      color: C.martinOscuro,
    })
  }

  // Cola.
  new Zdog.Shape({ addTo: raiz, path: [{ x: -36, y: 28 }, { x: -62, y: 50 }], stroke: 13, color: C.martinOscuro })

  // Cabeza: una esfera.
  new Zdog.Shape({ addTo: raiz, translate: { x: 22, y: -30 }, stroke: 46, color: C.martin })
  for (const lado of [1, -1]) {
    new Zdog.Shape({ addTo: raiz, translate: { x: 30, y: -24, z: 18 * lado }, stroke: 12, color: C.naranja })
    new Zdog.Shape({ addTo: raiz, translate: { x: 14, y: -12, z: 17 * lado }, stroke: 10, color: C.blanco })
    new Zdog.Shape({ addTo: raiz, translate: { x: 34, y: -38, z: 19 * lado }, stroke: 7, color: C.ojo })
  }

  // Pico: un cono. Su eje local z apunta hacia +x en el mundo.
  const pico = new Zdog.Anchor({ addTo: raiz, translate: { x: 40, y: -30 }, rotate: { y: -TAU / 4 } })
  new Zdog.Cone({
    addTo: pico,
    diameter: PICO.diametro,
    length: PICO.largo,
    stroke: 1,
    color: C.pico,
    backface: C.pico,
  })

  // Anillos: cortes del pico. Cada corte de un cono es un círculo, más chico hacia la punta.
  const anillos = []
  if (conAnillos) {
    const cortes = 5
    for (let i = 0; i < cortes; i++) {
      const z = (PICO.largo * i) / cortes
      const radio = (PICO.diametro / 2) * (1 - z / PICO.largo)
      anillos.push(
        new Zdog.Ellipse({
          addTo: pico,
          translate: { z },
          diameter: radio * 2 + 7,
          stroke: 1.8,
          color: C.anillo,
          visible: false,
        }),
      )
    }
  }

  // Patas y rama.
  for (const lado of [1, -1]) {
    new Zdog.Shape({ addTo: raiz, path: [{ x: -4, y: 40 }, { x: -2, y: 50 }], translate: { z: 7 * lado }, stroke: 5, color: C.pata })
  }
  if (conRama) {
    new Zdog.Shape({ addTo: raiz, path: [{ x: -96, y: 53 }, { x: 74, y: 56 }], stroke: 9, color: C.rama })
  }

  return { raiz, pico, anillos }
}

// ---------------------------------------------------------------- tren bala

export const BALA = { nariz: 120, cuerpo: 210, diametro: 64 }

// La punta de la nariz queda en x = 0; el resto del tren hacia -x.
export function crearBala(addTo) {
  const raiz = new Zdog.Anchor({ addTo })
  const r = BALA.diametro / 2

  // Nariz: un cono. Se escala para la transformación pico → nariz.
  const nariz = new Zdog.Anchor({ addTo: raiz, translate: { x: -BALA.nariz }, rotate: { y: -TAU / 4 } })
  const cono = new Zdog.Cone({
    addTo: nariz,
    diameter: BALA.diametro,
    length: BALA.nariz,
    stroke: 1,
    color: C.balaCuerpo,
    backface: C.balaSombra,
  })
  // Parabrisas sobre la nariz.
  new Zdog.Shape({
    addTo: nariz,
    path: [{ x: 0, y: -16, z: 66 }, { x: 0, y: -11, z: 84 }],
    stroke: 9,
    color: C.ventana,
  })

  // Cuerpo: un cilindro que crece hacia atrás desde la base de la nariz.
  const cuerpo = new Zdog.Anchor({ addTo: raiz, translate: { x: -BALA.nariz }, rotate: { y: -TAU / 4 } })
  new Zdog.Cylinder({
    addTo: cuerpo,
    translate: { z: -BALA.cuerpo / 2 },
    diameter: BALA.diametro,
    length: BALA.cuerpo,
    stroke: 1,
    color: C.balaCuerpo,
    backface: C.balaSombra,
  })
  // En el ancla, x local apunta hacia -z del mundo: x = -r es el costado que mira al público.
  for (const lado of [-1, 1]) {
    new Zdog.Shape({
      addTo: cuerpo,
      path: [{ x: (r + 0.5) * lado, y: 9, z: -2 }, { x: (r + 0.5) * lado, y: 9, z: -BALA.cuerpo + 2 }],
      stroke: 4,
      color: C.balaFranja,
    })
    for (let z = -16; z > -BALA.cuerpo + 10; z -= 24) {
      new Zdog.Shape({
        addTo: cuerpo,
        path: [{ x: (r - 1) * lado, y: -10, z }, { x: (r - 1) * lado, y: -10, z: z - 11 }],
        stroke: 6,
        color: C.ventana,
      })
    }
  }
  // Ruedas.
  const ruedas = []
  for (const x of [-60, -150, -250, -300]) {
    for (const z of [18, -18]) {
      ruedas.push(new Zdog.Shape({ addTo: raiz, translate: { x, y: r + 2, z }, stroke: 9, color: C.rueda }))
    }
  }

  return { raiz, nariz, cono, cuerpo, ruedas }
}

// ---------------------------------------------------------------- tren convencional

export const CONV = { largo: 330, alto: 72, ancho: 62 }

export function crearConvencional(addTo) {
  const raiz = new Zdog.Anchor({ addTo })
  const { largo, alto, ancho } = CONV

  // Una caja: el frente (rightFace, +x) es plano y rojo.
  new Zdog.Box({
    addTo: raiz,
    translate: { x: -largo / 2 },
    width: largo,
    height: alto,
    depth: ancho,
    stroke: 1,
    color: C.convCuerpo,
    rightFace: C.convFrente,
    leftFace: C.convSombra,
    topFace: C.convTecho,
    bottomFace: C.convSombra,
    rearFace: C.convSombra,
  })
  for (const lado of [1, -1]) {
    const z = (ancho / 2 + 0.6) * lado
    new Zdog.Rect({ addTo: raiz, translate: { x: -largo / 2, y: 16, z }, width: largo - 4, height: 6, stroke: 1, fill: true, color: C.convFrente })
    for (let x = -largo + 26; x < -20; x += 34) {
      new Zdog.Rect({ addTo: raiz, translate: { x, y: -12, z }, width: 20, height: 14, stroke: 1, fill: true, color: C.ventana })
    }
  }
  // Ventana del frente.
  new Zdog.Rect({
    addTo: raiz,
    translate: { x: 0.8, y: -16 },
    rotate: { y: TAU / 4 },
    width: 44,
    height: 15,
    stroke: 1,
    fill: true,
    color: C.ventana,
  })
  // Ruedas.
  const ruedas = []
  for (const x of [-40, -110, -230, -300]) {
    for (const z of [20, -20]) {
      ruedas.push(new Zdog.Shape({ addTo: raiz, translate: { x, y: alto / 2 + 3, z }, stroke: 10, color: C.rueda }))
    }
  }

  return { raiz, ruedas }
}
