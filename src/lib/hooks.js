import { useEffect, useRef, useState } from 'react'
import { limitar, sinMovimiento } from './anim.js'

// Progreso de 0 a 1 de una sección según el scroll.
//  - modo 'recorrido' (secciones altas con escena fija): 0 cuando la sección llega arriba,
//    1 cuando su final toca el borde inferior de la pantalla.
//  - modo 'salida' (portada): 0 arriba del todo, 1 cuando la sección ya salió de la pantalla.
export function useProgreso(modo = 'recorrido') {
  const ref = useRef(null)
  const progresoRef = useRef(0)
  const [progreso, setProgreso] = useState(0)

  useEffect(() => {
    let id = 0
    const medir = () => {
      id = 0
      const el = ref.current
      if (!el) return
      const caja = el.getBoundingClientRect()
      let p
      if (modo === 'salida') {
        p = limitar(-caja.top / caja.height)
      } else {
        const recorrido = caja.height - window.innerHeight
        p = recorrido > 0 ? limitar(-caja.top / recorrido) : caja.top < 0 ? 1 : 0
      }
      progresoRef.current = p
      setProgreso((antes) => (Math.abs(antes - p) > 0.0005 || p === 0 || p === 1 ? p : antes))
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
  }, [modo])

  return { ref, progreso, progresoRef }
}

// Monta una escena de Zdog en un <canvas>. `crear(canvas, { reducido })` devuelve
// { ajustar(), dibujar(progreso, segundos) }. Solo se anima mientras el canvas se ve en pantalla.
// Con "reducir movimiento" el tiempo se queda quieto: la escena solo cambia con el scroll
// o cuando cambia `clave` (por ejemplo, los datos que elige el usuario).
export function useZdog(crear, progresoRef, clave) {
  const canvasRef = useRef(null)
  const forzarRef = useRef(false)

  useEffect(() => {
    forzarRef.current = true
  }, [clave])

  useEffect(() => {
    const canvas = canvasRef.current
    const reducido = sinMovimiento()
    const escena = crear(canvas, { reducido })
    const inicio = performance.now()
    let visible = false
    let id = 0
    let ultimo = -1

    const dibujar = (ahora) => escena.dibujar(progresoRef.current, reducido ? 0 : (ahora - inicio) / 1000)

    const cuadro = (ahora) => {
      id = 0
      if (!reducido || progresoRef.current !== ultimo || forzarRef.current) {
        ultimo = progresoRef.current
        forzarRef.current = false
        dibujar(ahora)
      }
      if (visible) id = requestAnimationFrame(cuadro)
    }

    const io = new IntersectionObserver(([entrada]) => {
      visible = entrada.isIntersecting
      if (visible && !id) id = requestAnimationFrame(cuadro)
    })
    io.observe(canvas)

    const ro = new ResizeObserver(() => {
      escena.ajustar()
      ultimo = -1
      dibujar(performance.now())
    })
    ro.observe(canvas.parentElement)

    return () => {
      io.disconnect()
      ro.disconnect()
      cancelAnimationFrame(id)
    }
  }, [crear, progresoRef])

  return canvasRef
}
