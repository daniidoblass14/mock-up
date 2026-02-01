import { vehiculosService } from '../services/vehiculos.service'
import { mantenimientosService } from '../services/mantenimientos.service'
import type { Mantenimiento } from '../services/mantenimientos.service'
import { getMockData } from './mockData'

const KEY_VEHICULOS = 'autolytix_vehiculos'
const KEY_MANTENIMIENTOS = 'autolytix_mantenimientos'

function reviveMantenimientos(raw: Mantenimiento[]): Mantenimiento[] {
  return raw.map(m => ({
    ...m,
    fechaVencimiento: m.fechaVencimiento
      ? (m.fechaVencimiento instanceof Date ? m.fechaVencimiento : new Date(m.fechaVencimiento as unknown as string))
      : undefined,
  }))
}

/**
 * Carga datos iniciales: si hay datos en localStorage, los restaura; si no, inicializa con mock y persiste.
 * No sobrescribe datos del usuario si ya existen.
 */
export function loadInitialData(): void {
  try {
    const rawV = localStorage.getItem(KEY_VEHICULOS)
    const rawM = localStorage.getItem(KEY_MANTENIMIENTOS)
    if (rawV && rawM) {
      const vehiculos = JSON.parse(rawV) as ReturnType<typeof vehiculosService.getAll>
      const mantenimientos = reviveMantenimientos(JSON.parse(rawM) as Mantenimiento[])
      if (Array.isArray(vehiculos) && Array.isArray(mantenimientos)) {
        vehiculosService.replaceAll(vehiculos)
        mantenimientosService.replaceAll(mantenimientos)
        return
      }
    }
  } catch {
    // Si falla el parse o hay datos corruptos, inicializamos con mock
  }
  const { vehiculos, mantenimientos } = getMockData()
  vehiculosService.replaceAll(vehiculos)
  mantenimientosService.replaceAll(mantenimientos)
  persistData()
}

/**
 * Persiste vehículos y mantenimientos actuales en localStorage.
 */
export function persistData(): void {
  try {
    localStorage.setItem(KEY_VEHICULOS, JSON.stringify(vehiculosService.getAll()))
    localStorage.setItem(KEY_MANTENIMIENTOS, JSON.stringify(mantenimientosService.getAll()))
  } catch (e) {
    console.error('Error persistiendo datos:', e)
  }
}
