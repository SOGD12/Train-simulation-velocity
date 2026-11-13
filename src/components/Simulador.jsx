import { useEffect, useMemo, useRef, useState } from 'react'
import { CONTROLES, DISTANCIAS, RECORRIDO, SEGURIDAD, TRENES } from '../data/trenes.js'
import { crearCurva } from '../escenas/curva.js'
import { limitar } from '../lib/anim.js'
import { horaMinutos, num, resolver, tiempoHoras } from '../lib/calculos.js'
import { fuerzaRelativa, seVuelca, zonaDe } from '../lib/seguridad.js'
import Lienzo from './Lienzo.jsx'

// El simulador no depende del scroll: la escena de la curva solo cambia con la velocidad.
const QUIETO = { current: 0 }

const INICIO = {
  distancia: RECORRIDO.distanciaKm,
  bala: TRENES.bala.velocidadKmh,
  convencional: TRENES.convencional.velocidadKmh,
}

const aTexto = (n) => String(n).replace('.', ',')
const porcentaje = (n, { min, max }) => `${((n - min) / (max - min)) * 100}%`

// Barra deslizante + casilla para escribir el número exacto.
function Deslizador({ id, etiqueta, valor, cambiar, control, redondear, zonas }) {
  const [texto, setTexto] = useState(aTexto(valor))
  useEffect(() => setTexto(aTexto(valor)), [valor])

  const confirmar = () => {
    const n = Number(texto.trim().replace(',', '.'))
    if (texto.trim() === '' || !Number.isFinite(n)) {
      setTexto(aTexto(valor))
      return
    }
    const nuevo = redondear(limitar(n, control.min, control.max))
    cambiar(nuevo)
    setTexto(aTexto(nuevo))
  }

  const estiloZonas = zonas && { '--a': porcentaje(zonas.segura, control), '--b': porcentaje(zonas.especial, control) }

  return (
    <div className="deslizador">
      <div className="deslizador__fila">
        <label htmlFor={id}>{etiqueta}</label>
        <span className="deslizador__valor">
          <input
            type="text"
            inputMode="decimal"
            className="cifra"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onBlur={confirmar}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            aria-label={`${etiqueta} en ${control.unidad}`}
          />
          <span>{control.unidad}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        className={zonas ? 'rango rango--zonas' : 'rango'}
        style={estiloZonas}
        min={control.min}
        max={control.max}
        step={control.paso}
        value={valor}
        onChange={(e) => cambiar(Number(e.target.value))}
        aria-valuetext={`${aTexto(valor)} ${control.unidad}`}
      />
      {zonas && (
        <div className="marcas" aria-hidden="true">
          <span style={{ left: porcentaje(zonas.segura, control) }}>{zonas.segura}</span>
          <span style={{ left: porcentaje(zonas.especial, control) }}>{zonas.especial}</span>
        </div>
      )}
    </div>
  )
}

const redondearDistancia = (n) => Math.round(n * 10) / 10
const redondearVelocidad = (n) => Math.max(CONTROLES.velocidad.min, Math.round(n / CONTROLES.velocidad.paso) * CONTROLES.velocidad.paso)

function TarjetaTren({ tipo, clase, velocidad, cambiar, distancia }) {
  const tren = TRENES[tipo]
  const limites = SEGURIDAD[tipo]
  const zona = zonaDe(velocidad, limites)
  const volcado = seVuelca(velocidad, limites)
  const horas = tiempoHoras(distancia, velocidad)
  const fuerza = fuerzaRelativa(velocidad, limites)
  // El Shinkansen tiene control automático (ATC): si pasa el límite de la vía, frena solo.
  const frenaATC = tipo === 'bala' && zona === 'rojo'

  // La escena 3D lee la velocidad en cada cuadro desde esta referencia.
  const velocidadRef = useRef(velocidad)
  useEffect(() => {
    velocidadRef.current = velocidad
  }, [velocidad])
  const crear = useMemo(
    () => (canvas, opciones) => crearCurva(canvas, { ...opciones, tipo, velocidadRef, seguridad: limites }),
    [tipo, limites],
  )

  return (
    <article className={`tren tren--${clase} zona--${zona}`}>
      <header className="tren__cabeza">
        <h3>{tren.nombre}</h3>
        <p>{tren.modelo}</p>
      </header>

      <Lienzo
        crear={crear}
        progresoRef={QUIETO}
        clave={velocidad}
        etiqueta={`${tren.nombre} de frente en una curva con límite de ${limites.segura} km/h, a ${velocidad} km/h. ${volcado ? 'Se volcó y se salió de la vía.' : 'Sigue sobre los rieles.'}`}
        className="tren__curva"
      >
        <p className="tren__fuerza">
          Fuerza en la curva{' '}
          <strong className="cifra">×{fuerza.toFixed(fuerza < 0.1 ? 3 : fuerza < 1 ? 2 : 1).replace('.', ',')}</strong>
        </p>
        {volcado && <p className="tren__aviso tren__aviso--vuelco">Se salió de la vía</p>}
        {frenaATC && <p className="tren__aviso tren__aviso--atc">ATC: frena solo</p>}
        <p className="tren__vista">{limites.curva}</p>
      </Lienzo>

      <Deslizador
        id={`velocidad-${clase}`}
        etiqueta="Velocidad"
        valor={velocidad}
        cambiar={cambiar}
        control={CONTROLES.velocidad}
        redondear={redondearVelocidad}
        zonas={limites}
      />

      <p className="tren__tiempo cifra">{horaMinutos(horas * 60)}</p>
      <p className="tren__cuenta cifra">
        {num(distancia, 1)} km ÷ {velocidad} km/h = {num(horas)} h
      </p>
      <p className="tren__estado" role="status">
        <span className="tren__punto" aria-hidden="true" />
        {limites[zona]}
      </p>
      <p className="tren__dato">
        <strong>¿Se descarrila por ir rápido?</strong> {limites.dato}
      </p>
    </article>
  )
}

function Comparacion({ r, zonas }) {
  const maximo = r.minTotal || 1
  const filas = [
    { tipo: 'bala', clase: 'bala', minutos: r.minBala },
    { tipo: 'convencional', clase: 'conv', minutos: r.minConv },
  ]
  let veredicto = 'Llegan al mismo tiempo.'
  if (r.ganador) {
    veredicto = `${TRENES[r.ganador].nombre} llega ${horaMinutos(r.diferenciaMin)} antes`
    veredicto += zonas[r.ganador] === 'rojo' ? ', pero a una velocidad no permitida.' : '.'
  }

  return (
    <div className="comparacion">
      <p className="comparacion__titulo">Tiempo de viaje · {num(r.d, 1)} km</p>
      {filas.map((f) => (
        <div key={f.tipo} className={`barra-tiempo barra-tiempo--${f.clase}`}>
          <span className="barra-tiempo__nombre">{TRENES[f.tipo].nombre}</span>
          <span className="barra-tiempo__pista">
            <span style={{ transform: `scaleX(${f.minutos / maximo})` }} />
          </span>
          <span className="barra-tiempo__valor cifra">{horaMinutos(f.minutos)}</span>
          {zonas[f.tipo] === 'rojo' && <span className="barra-tiempo__alerta">No permitido</span>}
        </div>
      ))}
      <p className="comparacion__veredicto">{veredicto}</p>
    </div>
  )
}

export default function Simulador() {
  const [distancia, setDistancia] = useState(INICIO.distancia)
  const [vBala, setVBala] = useState(INICIO.bala)
  const [vConv, setVConv] = useState(INICIO.convencional)

  const r = resolver(distancia, vBala, vConv)
  const zonas = { bala: zonaDe(vBala, SEGURIDAD.bala), convencional: zonaDe(vConv, SEGURIDAD.convencional) }
  const esReal = distancia === INICIO.distancia && vBala === INICIO.bala && vConv === INICIO.convencional

  const reiniciar = () => {
    setDistancia(INICIO.distancia)
    setVBala(INICIO.bala)
    setVConv(INICIO.convencional)
  }

  return (
    <section className="simulador" aria-labelledby="titulo-simulador">
      <header className="simulador__cabeza">
        <p className="antetitulo">Tu turno</p>
        <h2 id="titulo-simulador">Simulador</h2>
        <p>Cambia la distancia y la velocidad: mira cuánto tarda cada tren y si es seguro.</p>
      </header>

      <div className="sim-distancia">
        <Deslizador
          id="distancia"
          etiqueta={`Distancia de ${RECORRIDO.origen} a ${RECORRIDO.destino}`}
          valor={distancia}
          cambiar={setDistancia}
          control={CONTROLES.distancia}
          redondear={redondearDistancia}
        />
        <div className="sim-distancia__atajos">
          {DISTANCIAS.map((d) => (
            <button
              key={d.km}
              type="button"
              className={`chip ${distancia === d.km ? 'chip--activo' : ''}`}
              aria-pressed={distancia === d.km}
              onClick={() => setDistancia(d.km)}
            >
              {d.etiqueta}
            </button>
          ))}
          <button type="button" className="chip chip--reiniciar" onClick={reiniciar} disabled={esReal}>
            Datos reales
          </button>
        </div>
      </div>

      <div className="sim-trenes">
        <TarjetaTren tipo="bala" clase="bala" velocidad={vBala} cambiar={setVBala} distancia={distancia} />
        <TarjetaTren tipo="convencional" clase="conv" velocidad={vConv} cambiar={setVConv} distancia={distancia} />
      </div>

      <Comparacion r={r} zonas={zonas} />

      <p className="simulador__nota">
        Modelo simplificado: velocidad constante y sin paradas. La fuerza en la curva es F = m · v² / r comparada con
        la del límite de la curva: al doble de velocidad, 4 veces la fuerza. En la escena el tren se vuelca desde el
        doble del límite, como en los accidentes reales de Brühl (3 veces) y Santiago de Compostela (2,2 veces).
      </p>
    </section>
  )
}
