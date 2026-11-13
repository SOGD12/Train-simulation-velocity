import { tramo } from './anim.js'

// El scroll de la sección "La carrera" se convierte en minutos de viaje.
// Un margen al principio y al final deja ver los trenes quietos en A y ya llegados a B.
export const minutosDeProgreso = (p, minutosTotales) => minutosTotales * tramo(p, 0.06, 0.92)
