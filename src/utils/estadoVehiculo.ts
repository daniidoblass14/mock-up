import { Vehiculo } from '../services/vehiculos.service'
import { Mantenimiento } from '../services/mantenimientos.service'

/**
 * Calcula el estado derivado del vehículo basado en sus mantenimientos.
 * Reglas V1:
 * - "Vencido" si tiene ≥ 1 mantenimiento vencido
 * - "Próximo" si no tiene vencidos pero sí ≥ 1 próximo
 * - "Al día" si no tiene vencidos ni próximos
 */
export function calcularEstadoDerivadoVehiculo(
  vehiculo: Vehiculo,
  mantenimientos: Mantenimiento[]
): 'al-dia' | 'proximo' | 'vencido' {
  const mantenimientosVehiculo = mantenimientos.filter(m => m.vehiculoId === vehiculo.id)

  // Filtrar solo mantenimientos no completados
  const mantenimientosActivos = mantenimientosVehiculo.filter(m => m.estado !== 'completado')

  if (mantenimientosActivos.length === 0) {
    return 'al-dia'
  }

  const tieneVencidos = mantenimientosActivos.some(m => m.estado === 'vencido')
  if (tieneVencidos) return 'vencido'

  const tieneProximos = mantenimientosActivos.some(m => m.estado === 'proximo')
  if (tieneProximos) return 'proximo'

  return 'al-dia'
}

/**
 * Obtiene el texto del estado derivado
 */
export function getEstadoTextoDerivado(estado: 'al-dia' | 'proximo' | 'vencido'): string {
  switch (estado) {
    case 'vencido':
      return 'Vencido'
    case 'proximo':
      return 'Próximo'
    case 'al-dia':
    default:
      return 'Al día'
  }
}
