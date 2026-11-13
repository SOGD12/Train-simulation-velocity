// Las únicas fórmulas de la simulación (nivel primer semestre):
//   tiempo = distancia ÷ velocidad
//   distancia = velocidad × tiempo

export const tiempoHoras = (distanciaKm, velocidadKmh) => distanciaKm / velocidadKmh

export const horasAMinutos = (horas) => horas * 60

// Dónde va un tren después de cierto tiempo (no puede pasar de la meta).
export const distanciaRecorrida = (velocidadKmh, minutos, distanciaKm) =>
  Math.min(distanciaKm, velocidadKmh * (minutos / 60))

const formato = (decimales) =>
  new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: decimales })

export const num = (n, decimales = 2) => formato(decimales).format(n)

// 94,7 → "1 h 35 min"
export function horaMinutos(minutos) {
  const total = Math.round(minutos)
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

// Reloj de la carrera: 94,7 → "1:34"
export function reloj(minutos) {
  const total = Math.floor(minutos)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

// Resultados de la carrera para una distancia y dos velocidades (las que elija el usuario).
// Sirve para cualquier caso: que gane el tren bala, que gane el convencional o que empaten.
export function resolver(d, vb, vc) {
  const minBala = horasAMinutos(tiempoHoras(d, vb))
  const minConv = horasAMinutos(tiempoHoras(d, vc))
  // Menos de medio minuto de diferencia se muestra como "0 min": eso cuenta como empate.
  let ganador = null
  if (minConv - minBala >= 0.5) ganador = 'bala'
  else if (minBala - minConv >= 0.5) ganador = 'convencional'

  return {
    d,
    vb,
    vc,
    minBala,
    minConv,
    // La carrera dura lo que tarda el último en llegar.
    minTotal: Math.max(minBala, minConv),
    diferenciaMin: Math.abs(minConv - minBala),
    ganador,
  }
}
