import { FUENTES } from '../data/trenes.js'

// Pie con las fuentes de los datos, en pequeño.
export default function Fuentes() {
  return (
    <footer className="pie">
      <p className="pie__titulo">
        <strong>Datos de trenes</strong> · React + Zdog
      </p>
      <p className="pie__fuentes">
        Fuentes:{' '}
        {Object.values(FUENTES).map((fuente, i, todas) => (
          <span key={fuente.url}>
            <a href={fuente.url} target="_blank" rel="noreferrer">
              {fuente.titulo}
            </a>{' '}
            ({fuente.sitio}){i < todas.length - 1 ? ' · ' : '.'}
          </span>
        ))}
      </p>
    </footer>
  )
}
