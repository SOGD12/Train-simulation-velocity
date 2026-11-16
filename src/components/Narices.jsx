import { crearNarices } from '../escenas/narices.js'
import { tramo } from '../lib/anim.js'
import { useProgreso } from '../lib/hooks.js'
import Lienzo from './Lienzo.jsx'
import Pasos from './Pasos.jsx'

const FRASES = ['Del pico…', '…a la nariz del tren bala', 'Paraboloide contra caja', 'El aire choca con la caja y rodea el paraboloide']

export default function Narices() {
  const { ref, progreso, progresoRef } = useProgreso()
  return (
    <section className="seccion-fija" style={{ '--alto': '460svh' }} ref={ref} aria-label="Dos narices, dos geometrías">
      <div className="fija">
        <Lienzo
          crear={crearNarices}
          progresoRef={progresoRef}
          etiqueta="El pico se transforma en la nariz del tren bala. Arriba llega un tren convencional de frente plano. El aire se amontona frente a la caja y rodea suavemente la nariz, un paraboloide de revolución."
          className="narices__lienzo"
        >
          <p className="etiqueta-tren etiqueta-tren--conv" style={{ opacity: tramo(progreso, 0.44, 0.52) }}>
            InterCity (Clase 101) · Alemania
          </p>
          <p className="etiqueta-tren etiqueta-tren--bala" style={{ opacity: tramo(progreso, 0.4, 0.48) }}>
            Shinkansen N700S · Japón
          </p>
        </Lienzo>
        <Pasos progreso={progreso} frases={FRASES} cortes={[0, 0.14, 0.4, 0.54]} />
      </div>
    </section>
  )
}
