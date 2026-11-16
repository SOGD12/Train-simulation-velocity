import { crearPico } from '../escenas/pico.js'
import { useProgreso } from '../lib/hooks.js'
import Lienzo from './Lienzo.jsx'
import Pasos from './Pasos.jsx'

const FRASES = ['El martín pescador', 'Su pico es un paraboloide', 'Entra al agua sin salpicar', 'Y así inspiró al tren bala']

export default function Pico() {
  const { ref, progreso, progresoRef } = useProgreso()
  return (
    <section className="seccion-fija" style={{ '--alto': '400svh' }} ref={ref} aria-label="El pico del martín pescador">
      <div className="fija">
        <Lienzo
          crear={crearPico}
          progresoRef={progresoRef}
          etiqueta="El martín pescador de cerca. Sobre su pico aparecen anillos: cortes circulares cada vez más pequeños hacia la punta."
        />
        <Pasos progreso={progreso} frases={FRASES} cortes={[0, 0.22, 0.5, 0.78]} />
      </div>
    </section>
  )
}
