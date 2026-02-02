import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Vehiculo, vehiculosService } from '../services/vehiculos.service'
import { Mantenimiento, mantenimientosService } from '../services/mantenimientos.service'
import { TareaCalendario, calendarioService } from '../services/calendario.service'
import { loadInitialData, persistData } from '../data/persistence'
import { calcularEstadoDerivadoVehiculo, getEstadoTextoDerivado } from '../utils/estadoVehiculo'

interface AppContextType {
  vehiculos: Vehiculo[]
  mantenimientos: Mantenimiento[]
  tareasCalendario: TareaCalendario[]
  addVehiculo: (vehiculo: Omit<Vehiculo, 'id'>) => Vehiculo
  updateVehiculo: (id: number, vehiculo: Partial<Omit<Vehiculo, 'id'>>) => Vehiculo | null
  deleteVehiculo: (id: number) => boolean
  addMantenimiento: (mantenimiento: Omit<Mantenimiento, 'id'>) => Mantenimiento
  updateMantenimiento: (id: number, mantenimiento: Partial<Omit<Mantenimiento, 'id'>>) => Mantenimiento | null
  deleteMantenimiento: (id: number) => boolean
  addTareaCalendario: (tarea: Omit<TareaCalendario, 'id'>) => TareaCalendario
  updateTareaCalendario: (id: number, tarea: Partial<Omit<TareaCalendario, 'id'>>) => TareaCalendario | null
  deleteTareaCalendario: (id: number) => boolean
  refreshAll: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([])
  const [tareasCalendario, setTareasCalendario] = useState<TareaCalendario[]>([])

  const refreshAll = useCallback(() => {
    try {
      setVehiculos(vehiculosService.getAll())
      setMantenimientos(mantenimientosService.getAll())
      setTareasCalendario(calendarioService.getAll())
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }, [])

  useEffect(() => {
    loadInitialData()
    refreshAll()
  }, [refreshAll])

  const addVehiculo = useCallback((vehiculo: Omit<Vehiculo, 'id'>): Vehiculo => {
    try {
      const nuevo = vehiculosService.add(vehiculo)
      refreshAll()
      persistData()
      return nuevo
    } catch (error) {
      console.error('Error adding vehiculo:', error)
      throw error
    }
  }, [refreshAll])

  const updateVehiculo = useCallback((id: number, vehiculo: Partial<Omit<Vehiculo, 'id'>>): Vehiculo | null => {
    try {
      const actualizado = vehiculosService.update(id, vehiculo)
      if (actualizado) {
        refreshAll()
        persistData()
      }
      return actualizado
    } catch (error) {
      console.error('Error updating vehiculo:', error)
      return null
    }
  }, [refreshAll])

  const deleteVehiculo = useCallback((id: number): boolean => {
    try {
      const eliminado = vehiculosService.delete(id)
      if (eliminado) {
        refreshAll()
        persistData()
      }
      return eliminado
    } catch (error) {
      console.error('Error deleting vehiculo:', error)
      return false
    }
  }, [refreshAll])

  const addMantenimiento = useCallback((mantenimiento: Omit<Mantenimiento, 'id'>): Mantenimiento => {
    try {
      const nuevo = mantenimientosService.add(mantenimiento)
      
      // Si el mantenimiento tiene fechaVencimiento, crear automáticamente una tarea en el calendario
      if (mantenimiento.fechaVencimiento) {
        const vehiculo = vehiculosService.getById(mantenimiento.vehiculoId)
        if (vehiculo) {
          calendarioService.add({
            vehiculoId: mantenimiento.vehiculoId,
            vehiculo: vehiculo.modelo,
            tipo: mantenimiento.tipo,
            fecha: mantenimiento.fechaVencimiento,
            odometro: mantenimiento.odometro,
            estado: mantenimiento.estado === 'vencido' ? 'vencido' : 
                   mantenimiento.estado === 'proximo' ? 'proximo' : 
                   mantenimiento.estado === 'completado' ? 'completado' : 'proximo',
          })
        }
      }
      
      // Recalcular estado derivado del vehículo
      const vehiculo = vehiculosService.getById(mantenimiento.vehiculoId)
      if (vehiculo) {
        const todosMantenimientos = mantenimientosService.getAll()
        const estadoDerivado = calcularEstadoDerivadoVehiculo(vehiculo, todosMantenimientos)
        const estadoTexto = getEstadoTextoDerivado(estadoDerivado)
        vehiculosService.update(vehiculo.id, { estado: estadoDerivado, estadoTexto })
      }
      
      refreshAll()
      persistData()
      return nuevo
    } catch (error) {
      console.error('Error adding mantenimiento:', error)
      throw error
    }
  }, [refreshAll])

  const updateMantenimiento = useCallback((id: number, mantenimiento: Partial<Omit<Mantenimiento, 'id'>>): Mantenimiento | null => {
    try {
      const actualizado = mantenimientosService.update(id, mantenimiento)
      if (actualizado) {
        // Si se actualizó la fecha, actualizar también la tarea del calendario si existe
        if (mantenimiento.fechaVencimiento) {
          const tareasExistentes = calendarioService.getAll()
          const tareaRelacionada = tareasExistentes.find(t => 
            t.vehiculoId === actualizado.vehiculoId && 
            t.tipo === actualizado.tipo
          )
          
          if (tareaRelacionada) {
            const vehiculo = vehiculosService.getById(actualizado.vehiculoId)
            if (vehiculo) {
              calendarioService.update(tareaRelacionada.id, {
                fecha: mantenimiento.fechaVencimiento,
                odometro: mantenimiento.odometro,
                estado: actualizado.estado === 'vencido' ? 'vencido' : 
                       actualizado.estado === 'proximo' ? 'proximo' : 
                       actualizado.estado === 'completado' ? 'completado' : 'proximo',
              })
            }
          } else {
            // Si no existe, crear una nueva tarea
            const vehiculo = vehiculosService.getById(actualizado.vehiculoId)
            if (vehiculo) {
              calendarioService.add({
                vehiculoId: actualizado.vehiculoId,
                vehiculo: vehiculo.modelo,
                tipo: actualizado.tipo,
                fecha: mantenimiento.fechaVencimiento,
                odometro: mantenimiento.odometro,
                estado: actualizado.estado === 'vencido' ? 'vencido' : 
                       actualizado.estado === 'proximo' ? 'proximo' : 
                       actualizado.estado === 'completado' ? 'completado' : 'proximo',
              })
            }
          }
        }
        
        // Recalcular estado derivado del vehículo
        const vehiculo = vehiculosService.getById(actualizado.vehiculoId)
        if (vehiculo) {
          const todosMantenimientos = mantenimientosService.getAll()
          const estadoDerivado = calcularEstadoDerivadoVehiculo(vehiculo, todosMantenimientos)
          const estadoTexto = getEstadoTextoDerivado(estadoDerivado)
          vehiculosService.update(vehiculo.id, { estado: estadoDerivado, estadoTexto })
        }
        
        refreshAll()
        persistData()
      }
      return actualizado
    } catch (error) {
      console.error('Error updating mantenimiento:', error)
      return null
    }
  }, [refreshAll])

  const deleteMantenimiento = useCallback((id: number): boolean => {
    try {
      // Obtener el mantenimiento antes de eliminarlo para recalcular estado del vehículo
      const mantenimiento = mantenimientosService.getById(id)
      const eliminado = mantenimientosService.delete(id)
      if (eliminado) {
        // Recalcular estado derivado del vehículo si existía el mantenimiento
        if (mantenimiento) {
          const vehiculo = vehiculosService.getById(mantenimiento.vehiculoId)
          if (vehiculo) {
            const todosMantenimientos = mantenimientosService.getAll()
            const estadoDerivado = calcularEstadoDerivadoVehiculo(vehiculo, todosMantenimientos)
            const estadoTexto = getEstadoTextoDerivado(estadoDerivado)
            vehiculosService.update(vehiculo.id, { estado: estadoDerivado, estadoTexto })
          }
        }
        refreshAll()
        persistData()
      }
      return eliminado
    } catch (error) {
      console.error('Error deleting mantenimiento:', error)
      return false
    }
  }, [refreshAll])

  const addTareaCalendario = useCallback((tarea: Omit<TareaCalendario, 'id'>): TareaCalendario => {
    try {
      const nueva = calendarioService.add(tarea)
      refreshAll()
      return nueva
    } catch (error) {
      console.error('Error adding tarea calendario:', error)
      throw error
    }
  }, [refreshAll])

  const updateTareaCalendario = useCallback((id: number, tarea: Partial<Omit<TareaCalendario, 'id'>>): TareaCalendario | null => {
    try {
      const actualizada = calendarioService.update(id, tarea)
      if (actualizada) refreshAll()
      return actualizada
    } catch (error) {
      console.error('Error updating tarea calendario:', error)
      return null
    }
  }, [refreshAll])

  const deleteTareaCalendario = useCallback((id: number): boolean => {
    try {
      const eliminada = calendarioService.delete(id)
      if (eliminada) refreshAll()
      return eliminada
    } catch (error) {
      console.error('Error deleting tarea calendario:', error)
      return false
    }
  }, [refreshAll])

  return (
    <AppContext.Provider
      value={{
        vehiculos,
        mantenimientos,
        tareasCalendario,
        addVehiculo,
        updateVehiculo,
        deleteVehiculo,
        addMantenimiento,
        updateMantenimiento,
        deleteMantenimiento,
        addTareaCalendario,
        updateTareaCalendario,
        deleteTareaCalendario,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
