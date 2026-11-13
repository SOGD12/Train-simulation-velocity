import { useEffect, useRef } from 'react'
import Carrera from './components/Carrera.jsx'
import Fuentes from './components/Fuentes.jsx'
import Narices from './components/Narices.jsx'
import Pico from './components/Pico.jsx'
import Portada from './components/Portada.jsx'
import Simulador from './components/Simulador.jsx'

// Barra fina arriba que muestra cuánto se ha recorrido de la página.
function BarraAvance() {
  const ref = useRef(null)
  useEffect(() => {
    let id = 0
    const medir = () => {
      id = 0
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (ref.current) ref.current.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 0})`
    }
    const pedir = () => {
      if (!id) id = requestAnimationFrame(medir)
    }
    medir()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      cancelAnimationFrame(id)
    }
  }, [])
  return (
    <div className="avance" aria-hidden="true">
      <div ref={ref} />
    </div>
  )
}

export default function App() {
  return (
    <>
      <BarraAvance />
      <Portada />
      <main>
        <Pico />
        <Narices />
        <Carrera />
        <Simulador />
      </main>
      <Fuentes />
    </>
  )
}
