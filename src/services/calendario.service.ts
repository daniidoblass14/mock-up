export interface TareaCalendario {
  id: number
  vehiculoId: number
  vehiculo: string
  tipo: string
  fecha: Date
  odometro?: number
  estado?: 'proximo' | 'vencido' | 'completado'
}

class CalendarioService {
  private tareas: TareaCalendario[] = []
  private nextId = 1

  getAll(): TareaCalendario[] {
    return [...this.tareas]
  }

  getById(id: number): TareaCalendario | undefined {
    return this.tareas.find(t => t.id === id)
  }

  add(tarea: Omit<TareaCalendario, 'id'>): TareaCalendario {
    const nueva: TareaCalendario = {
      ...tarea,
      id: this.nextId++,
    }
    this.tareas.push(nueva)
    return nueva
  }

  update(id: number, tarea: Partial<Omit<TareaCalendario, 'id'>>): TareaCalendario | null {
    const index = this.tareas.findIndex(t => t.id === id)
    if (index === -1) return null
    this.tareas[index] = { ...this.tareas[index], ...tarea }
    return this.tareas[index]
  }

  delete(id: number): boolean {
    const index = this.tareas.findIndex(t => t.id === id)
    if (index === -1) return false
    this.tareas.splice(index, 1)
    return true
  }

  getByVehiculo(vehiculoId: number): TareaCalendario[] {
    return this.tareas.filter(t => t.vehiculoId === vehiculoId)
  }

  getByTipo(tipo: string): TareaCalendario[] {
    return this.tareas.filter(t => t.tipo === tipo)
  }

  getByFecha(fecha: Date): TareaCalendario[] {
    const fechaStr = fecha.toDateString()
    return this.tareas.filter(t => t.fecha.toDateString() === fechaStr)
  }
}

export const calendarioService = new CalendarioService()
