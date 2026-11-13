import { RECORRIDO, TRENES } from '../data/trenes.js'
import { crearCarrera } from '../escenas/carrera.js'
import { distanciaRecorrida, horaMinutos, num, reloj, resolver } from '../lib/calculos.js'
import { minutosDeProgreso } from '../lib/carrera.js'
import { useProgreso } from '../lib/hooks.js'
import Lienzo from './Lienzo.jsx'

// La carrera usa siempre los datos reales. Para probar otros números está el simulador.
const DATOS_REALES = {
  distanciaKm: RECORRIDO.distanciaKm,
  vBala: TRENES.bala.velocidadKmh,
  vConv: TRENES.convencional.velocidadKmh,
}
const r = resolver(DATOS_REALES.distanciaKm, DATOS_REALES.vBala, DATOS_REALES.vConv)
const crear = (canvas, opciones) => crearCarrera(canvas, { ...opciones, datosRef: { current: DATOS_REALES } })

function Ficha({ nombre, clase, velocidad, km, llegado, minutosLlegada }) {
  return (
    <p className={`ficha ficha--${clase}`}>
      <span className="ficha__nombre">{nombre}</span>
      <span className="ficha__dato cifra">{velocidad} km/h</span>
      <span className="ficha__dato cifra">{llegado ? horaMinutos(minutosLlegada) : `${num(km, 0)} km`}</span>
    </p>
  )
}

export default function Carrera() {
  const { ref, progreso, progresoRef } = useProgreso()
  const minutos = minutosDeProgreso(progreso, r.minTotal)
  const kmBala = distanciaRecorrida(r.vb, minutos, r.d)
  const kmConv = distanciaRecorrida(r.vc, minutos, r.d)
  const llegoBala = minutos >= r.minBala
  const llegoConv = minutos >= r.minConv
  const terminada = llegoBala && llegoConv

  return (
    <section className="seccion-fija" style={{ '--alto': '400svh' }} ref={ref} aria-label="La carrera de A a B">
      <div className="fija fija--carrera">
        <div className="carrera__cabeza">
          <p className="carrera__titulo">
            {RECORRIDO.origen} → {RECORRIDO.destino} <span className="cifra">{r.d} km</span>
          </p>
          <p className="reloj cifra" aria-label={`Tiempo de viaje: ${horaMinutos(minutos)}`}>
            {reloj(minutos)}
            <small>h</small>
          </p>
        </div>
        <Lienzo
          crear={crear}
          progresoRef={progresoRef}
          etiqueta="Dos vías de A a B: el tren bala, abajo, avanza más rápido que el convencional, arriba."
          className="carrera__lienzo"
        >
          <div className={`resultado ${terminada ? 'resultado--visible' : ''}`} aria-hidden={!terminada}>
            <p className="cifra">
              {r.d} ÷ {r.vb} = <strong className="azul">{horaMinutos(r.minBala)}</strong>
            </p>
            <p className="cifra">
              {r.d} ÷ {r.vc} = <strong className="rojo">{horaMinutos(r.minConv)}</strong>
            </p>
            <p className="resultado__final">{horaMinutos(r.diferenciaMin)} antes</p>
          </div>
        </Lienzo>
        <div className="carrera__fichas">
          <Ficha nombre={TRENES.bala.nombre} clase="bala" velocidad={r.vb} km={kmBala} llegado={llegoBala} minutosLlegada={r.minBala} />
          <Ficha
            nombre={TRENES.convencional.nombre}
            clase="conv"
            velocidad={r.vc}
            km={kmConv}
            llegado={llegoConv}
            minutosLlegada={r.minConv}
          />
        </div>
      </div>
    </section>
  )
}
