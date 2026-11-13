import { crearPortada } from '../escenas/portada.js'
import { useProgreso } from '../lib/hooks.js'
import Lienzo from './Lienzo.jsx'

export default function Portada() {
  const { ref, progresoRef } = useProgreso('salida')
  return (
    <header className="portada" ref={ref}>
      <Lienzo
        crear={crearPortada}
        progresoRef={progresoRef}
        etiqueta="Martín pescador en 3D posado en una rama."
        className="portada__lienzo"
      />
      <div className="portada__texto">
        <h1>
          Datos de <em>trenes</em>
        </h1>
        <p className="portada__pista">
          Del martín pescador al tren bala <span aria-hidden="true">↓</span>
        </p>
      </div>
    </header>
  )
}
