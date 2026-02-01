export interface Mantenimiento {
  id: number
  vehiculoId: number
  tipo: string
  vencimiento: string
  estado: 'vencido' | 'proximo' | 'completado' | 'al-dia'
  estadoTexto: string
  fechaVencimiento?: Date
  odometro?: number
  costo?: number
  notas?: string
}

export function calcularEstadoMantenimiento(
  fechaVencimiento: Date | undefined,
  odometro: number | undefined,
  odometroActual: number | undefined,
  estadoManual?: 'vencido' | 'proximo' | 'completado' | 'al-dia'
): 'vencido' | 'proximo' | 'completado' | 'al-dia' {
  // Si el usuario seleccionó un estado manual, respetarlo
  if (estadoManual) {
    return estadoManual
  }

  // Si hay fecha de vencimiento, calcular por fecha
  if (fechaVencimiento) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fecha = new Date(fechaVencimiento)
    fecha.setHours(0, 0, 0, 0)

    const diffTime = fecha.getTime() - hoy.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'vencido'
    if (diffDays <= 7) return 'proximo'
    return 'al-dia'
  }

  // Si solo hay odómetro
  if (odometro !== undefined && odometroActual !== undefined) {
    const diff = odometroActual - odometro
    if (diff > 0) return 'vencido'
    if (diff > -500) return 'proximo'
    return 'al-dia'
  }

  // Por defecto
  return 'proximo'
}

/**
 * Estado por fecha objetivo al guardar (regla "calcular"): solo Vencido o Próximo.
 * fechaObjetivo < hoy -> Vencido; fechaObjetivo >= hoy -> Próximo.
 * Permite fechas pasadas (histórico). Comparación a medianoche local.
 */
export function estadoPorFechaObjetivo(fechaVencimiento: Date | undefined): 'vencido' | 'proximo' {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  if (!fechaVencimiento) return 'proximo'
  const fecha = new Date(fechaVencimiento)
  fecha.setHours(0, 0, 0, 0)
  return fecha.getTime() < hoy.getTime() ? 'vencido' : 'proximo'
}

class MantenimientosService {
  private mantenimientos: Mantenimiento[] = [
    {
      id: 1,
      vehiculoId: 1,
      tipo: 'Revisión 50,000km',
      vencimiento: '50,500 km • Excedido por 500km',
      estado: 'vencido',
      estadoTexto: 'Vencido',
      fechaVencimiento: new Date(2023, 9, 15),
      odometro: 50500,
      costo: 180.00,
    },
    {
      id: 2,
      vehiculoId: 2,
      tipo: 'Cambio de Aceite',
      vencimiento: '12 Oct 2023 • En 2 días',
      estado: 'proximo',
      estadoTexto: 'Próximo',
      fechaVencimiento: new Date(2023, 9, 12),
      costo: 45.50,
    },
    {
      id: 3,
      vehiculoId: 3,
      tipo: 'ITV',
      vencimiento: '10 Oct 2023 • Venció hace 2 semanas',
      estado: 'vencido',
      estadoTexto: 'Vencido',
      fechaVencimiento: new Date(2023, 9, 10),
      costo: 120.00,
    },
  ]

  private nextId = 6

  getAll(): Mantenimiento[] {
    return [...this.mantenimientos]
  }

  getById(id: number): Mantenimiento | undefined {
    return this.mantenimientos.find(m => m.id === id)
  }

  add(mantenimiento: Omit<Mantenimiento, 'id'>): Mantenimiento {
    const nuevo: Mantenimiento = {
      ...mantenimiento,
      id: this.nextId++,
    }
    this.mantenimientos.push(nuevo)
    return nuevo
  }

  update(id: number, mantenimiento: Partial<Omit<Mantenimiento, 'id'>>): Mantenimiento | null {
    const index = this.mantenimientos.findIndex(m => m.id === id)
    if (index === -1) return null
    this.mantenimientos[index] = { ...this.mantenimientos[index], ...mantenimiento }
    return this.mantenimientos[index]
  }

  delete(id: number): boolean {
    const index = this.mantenimientos.findIndex(m => m.id === id)
    if (index === -1) return false
    this.mantenimientos.splice(index, 1)
    return true
  }

  getByEstado(estado: 'vencido' | 'proximo' | 'completado' | 'al-dia'): Mantenimiento[] {
    return this.mantenimientos.filter(m => m.estado === estado)
  }

  getByVehiculoId(vehiculoId: number): Mantenimiento[] {
    return this.mantenimientos.filter(m => m.vehiculoId === vehiculoId)
  }

  /** Reemplaza todo el listado. Revive fechaVencimiento si viene como string (JSON). Actualiza nextId. */
  replaceAll(mantenimientos: Mantenimiento[]): void {
    const revived = mantenimientos.map(m => ({
      ...m,
      fechaVencimiento: m.fechaVencimiento
        ? (m.fechaVencimiento instanceof Date ? m.fechaVencimiento : new Date(m.fechaVencimiento as unknown as string))
        : undefined,
    }))
    this.mantenimientos = revived.length > 0 ? revived : []
    const maxId = this.mantenimientos.length > 0 ? Math.max(...this.mantenimientos.map(m => m.id)) : 0
    this.nextId = maxId + 1
  }
}

export const mantenimientosService = new MantenimientosService()
