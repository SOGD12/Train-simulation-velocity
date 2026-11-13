// Leyenda corta sobre la escena. Cambia según el avance del scroll.
// `cortes` marca dónde empieza cada frase (0 a 1).
export function pasoActivo(progreso, cortes) {
  let activo = 0
  cortes.forEach((corte, i) => {
    if (progreso >= corte) activo = i
  })
  return activo
}

export default function Pasos({ progreso, frases, cortes }) {
  const activo = pasoActivo(progreso, cortes)
  return (
    <div className="leyenda">
      <p className="leyenda__frases" aria-live="polite">
        {frases.map((frase, i) => (
          <span key={frase} className={i === activo ? 'activa' : ''} aria-hidden={i !== activo}>
            {frase}
          </span>
        ))}
      </p>
      <div className="leyenda__puntos" aria-hidden="true">
        {frases.map((frase, i) => (
          <span key={frase} className={i === activo ? 'activo' : ''} />
        ))}
      </div>
    </div>
  )
}
