import { useZdog } from '../lib/hooks.js'

// Contenedor de una escena Zdog. El tamaño lo pone el CSS del contenedor.
// `clave` obliga a redibujar cuando cambia algo que no es el scroll (los datos del usuario).
export default function Lienzo({ crear, progresoRef, clave, etiqueta, className = '', children }) {
  const canvasRef = useZdog(crear, progresoRef, clave)
  return (
    <div className={`lienzo ${className}`}>
      <canvas ref={canvasRef} role="img" aria-label={etiqueta} />
      {children}
    </div>
  )
}
