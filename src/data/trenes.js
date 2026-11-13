// Todos los números de la simulación salen de aquí. Cada dato dice de qué fuente sale (ver FUENTES abajo).

// Distancia de la pizarra: del punto A al punto B.
export const RECORRIDO = {
  distanciaKm: 450,
  origen: 'A',
  destino: 'B',
}

export const TRENES = {
  // Modelo exacto: Shinkansen N700S, el que circula hoy por la línea Tokaido (Tokio–Osaka).
  bala: {
    nombre: 'Tren bala',
    modelo: 'Shinkansen N700S · Japón',
    velocidadKmh: 285,
    detalle: 'Velocidad máxima comercial en la línea Tokaido desde el 14 de marzo de 2015.',
    fuentes: ['tokaido', 'jrCentral', 'n700s'],
  },
  // Modelo exacto: InterCity clásico de Deutsche Bahn, remolcado por la locomotora eléctrica
  // DB Clase 101 (Adtranz, 145 unidades, 1996–1999). No es un ICE ni un IC2 de dos pisos.
  convencional: {
    nombre: 'Tren convencional',
    modelo: 'InterCity, locomotora DB Clase 101 · Alemania',
    velocidadKmh: 200,
    detalle: 'Velocidad de servicio de la Clase 101 (su diseño llega a 220 km/h).',
    fuentes: ['clase101', 'interCity'],
  },
}

// Dato real: el Shinkansen más rápido de Tokio a Shin-Osaka.
export const VIAJE_REAL = {
  ruta: 'Tokio → Osaka',
  distanciaKm: 515.4,
  minutos: 141, // 2 h 21 min (JR Central, horario de marzo de 2023)
  fuentes: ['tokaido', 'jrCentral'],
}

// Lo que dicen las fuentes sobre el diseño inspirado en el martín pescador.
export const BIOMIMETICA = {
  serie: 'Shinkansen Serie 500 (JR West, 1997)',
  velocidadKmh: 300,
  ahorroEnergiaPct: 15,
  aumentoVelocidadPct: 10,
  ingeniero: 'Eiji Nakatsu',
  fuentes: ['serie500', 'jrPass'],
}

// ---------------------------------------------------------------- simulador

// Velocidades permitidas (reales). Tres zonas:
//   verde  → hasta `segura`: permitido en la vía normal de ese tren.
//   ámbar  → hasta `especial`: solo en vías preparadas para eso.
//   rojo   → más que `especial`: no se permite con pasajeros.
// "No permitido" NO significa "se descarrila": eso depende de la curva (ver VUELCO más abajo).
//
// `curva` es la curva que dibuja la escena del simulador y su límite de velocidad.
// `dato` responde con hechos reales a "¿se puede descarrilar por ir rápido?".
export const SEGURIDAD = {
  bala: {
    segura: 285,
    especial: 320,
    curva: 'Curva de la línea Tokaido · límite 285 km/h',
    verde: 'Segura. Es el límite del N700S en la línea Tokaido.',
    ambar: 'Solo en la línea Tohoku, que tiene curvas más abiertas (tren E5, hasta 320 km/h).',
    rojo: 'No permitido con pasajeros. Sin pasajeros se probó hasta 382 km/h (ALFA-X, 2020). Si el tren pasa el límite, el sistema ATC frena solo.',
    dato: 'Ningún Shinkansen se ha descarrilado por ir rápido. Sus descarrilamientos (2004 y 2022) fueron por terremotos y nadie murió.',
    fuentes: ['tokaido', 'tohoku', 'alfaX', 'shinkansen', 'chuetsu', 'fukushima', 'jrEast'],
  },
  convencional: {
    segura: 160,
    especial: 200,
    curva: 'Curva de vía convencional · límite 160 km/h',
    verde: 'Segura. Es el límite de las vías comunes en Alemania.',
    ambar: 'Solo en vías mejoradas con señal dentro de la cabina (LZB). Es la velocidad de servicio de la Clase 101.',
    rojo: 'No permitido: pasa su velocidad de servicio (200 km/h). La locomotora Clase 101 está diseñada para 220 km/h.',
    dato: 'Un tren convencional sí se sale si entra muy rápido a una curva o un desvío. Brühl (Alemania, 2000): 122 km/h en un desvío de 40 km/h, 9 muertos.',
    fuentes: ['clase101', 'lzb', 'bruhl', 'santiago'],
  },
}

// ¿Cuándo se vuelca el tren en la escena de la curva? En los accidentes reales por exceso de
// velocidad, los trenes se salieron yendo a más del doble del límite: Brühl (2000) a 3 veces
// (122 en un desvío de 40) y Santiago de Compostela (2013) a 2,2 veces (179 en una curva de 80).
// La escena usa esa regla: se vuelca a partir del doble del límite de la curva.
export const VUELCO = { vecesLimite: 2 }

// Límites de los controles del simulador.
export const CONTROLES = {
  distancia: { min: 10, max: 2000, paso: 1, unidad: 'km' },
  velocidad: { min: 20, max: 400, paso: 5, unidad: 'km/h' },
}

// Atajos de distancia con datos reales.
export const DISTANCIAS = [
  { etiqueta: `Pizarra · ${RECORRIDO.distanciaKm} km`, km: RECORRIDO.distanciaKm },
  { etiqueta: `${VIAJE_REAL.ruta} · 515 km`, km: VIAJE_REAL.distanciaKm },
]

export const FUENTES = {
  tokaido: {
    titulo: 'Tokaido Shinkansen',
    sitio: 'Wikipedia (inglés)',
    url: 'https://en.wikipedia.org/wiki/Tokaido_Shinkansen',
    aporta: 'Velocidad máxima de 285 km/h (desde 2015) y longitud de la línea: 515,4 km.',
  },
  jrCentral: {
    titulo: 'About the Shinkansen',
    sitio: 'Central Japan Railway Company (JR Central)',
    url: 'https://global.jr-central.co.jp/en/company/about_shinkansen',
    aporta: 'Velocidad máxima de 285 km/h y tiempo Tokio–Shin-Osaka de 2 h 21 min (horario de marzo de 2023).',
  },
  tohoku: {
    titulo: 'Tōhoku Shinkansen',
    sitio: 'Wikipedia (inglés)',
    url: 'https://en.wikipedia.org/wiki/T%C5%8Dhoku_Shinkansen',
    aporta: 'Desde 2013 permite 320 km/h entre Utsunomiya y Morioka.',
  },
  n700s: {
    titulo: 'Central Japan Railway’s test Shinkansen hits 360 kph',
    sitio: 'The Japan Times (2019)',
    url: 'https://www.japantimes.co.jp/news/2019/05/25/business/tech/central-japan-railways-test-shinkansen-hits-360-kph/',
    aporta: 'El N700S llegó a 360 km/h en una prueba; en servicio va como máximo a 285 km/h.',
  },
  alfaX: {
    titulo: 'New bullet train Alpha-X hits top speed of 382 kph in test run',
    sitio: 'Swiss Science and Technology Office Tokyo (2020)',
    url: 'https://www.stofficetokyo.ch/news/general-interest/new-bullet-train-alpha-x-hits-top-speed-of-382-kph-in-test-run',
    aporta: 'El tren de pruebas ALFA-X llegó a 382 km/h el 27 de octubre de 2020, sin pasajeros.',
  },
  shinkansen: {
    titulo: 'Shinkansen',
    sitio: 'Wikipedia (inglés)',
    url: 'https://en.wikipedia.org/wiki/Shinkansen',
    aporta:
      'Ningún pasajero ha muerto por descarrilamiento o choque. Las curvas cerradas, los túneles estrechos y las normas de ruido limitan la velocidad. Descarrilamiento por nieve en la línea Akita (2013), sin heridos.',
  },
  chuetsu: {
    titulo: '2004 Chūetsu earthquake',
    sitio: 'Wikipedia (inglés)',
    url: 'https://en.wikipedia.org/wiki/2004_Ch%C5%ABetsu_earthquake',
    aporta: 'Primer descarrilamiento de un Shinkansen en servicio: el Toki 325 (serie 200), por el terremoto. Sin heridos.',
  },
  fukushima: {
    titulo: '2022 Fukushima earthquake',
    sitio: 'Wikipedia (inglés)',
    url: 'https://en.wikipedia.org/wiki/2022_Fukushima_earthquake',
    aporta: 'Un Yamabiko de la línea Tohoku descarriló por el terremoto del 16 de marzo de 2022. Ningún muerto.',
  },
  jrEast: {
    titulo: 'Progress in Measures to Prevent Shinkansen Derailment',
    sitio: 'JR East (2006)',
    url: 'https://www.jreast.co.jp/en/e/press/20061001/',
    aporta: 'Guías en forma de L en los bogies para que las ruedas no se alejen de la vía; el ATC aplica el freno de emergencia.',
  },
  clase101: {
    titulo: 'DB Class 101',
    sitio: 'Wikipedia (inglés)',
    url: 'https://en.wikipedia.org/wiki/DB_Class_101',
    aporta:
      'Locomotora de Adtranz (145 unidades, 1996–1999), 83 t, para trenes InterCity: 200 km/h en servicio y 220 km/h de diseño. La 101 092 quedó muy dañada en el descarrilamiento de Brühl.',
  },
  interCity: {
    titulo: 'InterCity',
    sitio: 'Wikipedia (inglés)',
    url: 'https://en.wikipedia.org/wiki/InterCity',
    aporta: 'Velocidad máxima de un InterCity en Alemania: 200 km/h.',
  },
  lzb: {
    titulo: 'Linienzugbeeinflussung (LZB)',
    sitio: 'Wikipedia (inglés)',
    url: 'https://en.wikipedia.org/wiki/Linienzugbeeinflussung',
    aporta: 'En Alemania, para pasar de 160 km/h se necesita la señal dentro de la cabina (LZB).',
  },
  bruhl: {
    titulo: 'Brühl train derailment',
    sitio: 'Wikipedia (inglés)',
    url: 'https://en.wikipedia.org/wiki/Br%C3%BChl_train_derailment',
    aporta: '6 de febrero de 2000: el D 203 pasó a 122 km/h por un desvío de 40 km/h (3 veces el límite). 9 muertos.',
  },
  santiago: {
    titulo: 'Santiago de Compostela derailment',
    sitio: 'Wikipedia (inglés)',
    url: 'https://en.wikipedia.org/wiki/Santiago_de_Compostela_derailment',
    aporta: 'España, 2013: un tren Alvia descarriló a 179 km/h en una curva de 80 km/h (2,2 veces el límite). 79 muertos.',
  },
  serie500: {
    titulo: '500 Series Shinkansen',
    sitio: 'Wikipedia (inglés)',
    url: 'https://en.wikipedia.org/wiki/500_Series_Shinkansen',
    aporta:
      'Operó a 300 km/h; su frente imita el pico del martín pescador; 15 % menos energía y 10 % más velocidad. La propia página pide una fuente mejor para esta parte.',
  },
  jrPass: {
    titulo: 'Why do Shinkansen have such long noses? The design story',
    sitio: 'JRPass (blog)',
    url: 'https://www.jrpass.com/blog/why-do-shinkansen-have-such-long-noses-the-design-story',
    aporta: 'Eiji Nakatsu, ingeniero y observador de aves; el estruendo al salir de los túneles con una nariz roma.',
  },
}
