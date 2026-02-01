import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Wrench, Edit, Calendar, Truck, DollarSign, Gauge } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { mantenimientosService } from '../services/mantenimientos.service'
import { vehiculosService } from '../services/vehiculos.service'
import { formatCurrency, formatNumber } from '../utils/currency'

export default function DetalleMantenimiento() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { mantenimientos } = useApp()
  
  const mantenimientoId = id ? parseInt(id) : null
  const mantenimiento = mantenimientoId ? mantenimientos.find(m => m.id === mantenimientoId) : null
  
  // Si no se encuentra el mantenimiento, redirigir
  if (!mantenimiento) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Wrench className="w-16 h-16 text-gray-400 dark:text-dark-500 mb-4" />
        <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Mantenimiento no encontrado</h2>
        <p className="text-gray-600 dark:text-dark-400 mb-4">El mantenimiento que buscas no existe o ha sido eliminado.</p>
        <button
          onClick={() => navigate('/mantenimientos')}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          Volver a mantenimientos
        </button>
      </div>
    )
  }
  
  const vehiculo = vehiculosService.getById(mantenimiento.vehiculoId)
  
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'vencido':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'proximo':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'completado':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'al-dia':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-dark-300'
    }
  }
  
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'vencido':
        return '⚠️'
      case 'proximo':
        return '⏰'
      case 'completado':
        return '✅'
      case 'al-dia':
        return '✓'
      default:
        return '•'
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb y Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400 mb-2">
            <button
              onClick={() => navigate('/mantenimientos')}
              className="hover:text-dark-900 dark:hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <button
              onClick={() => navigate('/mantenimientos')}
              className="hover:text-dark-900 dark:hover:text-white transition-colors"
            >
              Mantenimientos
            </button>
            <span>/</span>
            <span className="text-dark-900 dark:text-white">Detalle</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/mantenimientos')}
              className="p-2 text-gray-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Detalle del Mantenimiento</h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/mantenimientos')}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          <span>Editar</span>
        </button>
      </div>

      {/* Resumen Principal */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Wrench className="w-8 h-8 text-primary-500 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-1">{mantenimiento.tipo}</h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getEstadoColor(mantenimiento.estado)}`}>
                  <span className="mr-2">{getEstadoIcon(mantenimiento.estado)}</span>
                  {mantenimiento.estadoTexto}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Información */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Vehículo */}
          <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-5 h-5 text-primary-500 dark:text-primary-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-dark-300">Vehículo</label>
            </div>
            <p className="text-dark-900 dark:text-white font-semibold text-lg">{vehiculo?.modelo || 'N/A'}</p>
            <p className="text-gray-600 dark:text-dark-400 text-sm mt-1">Matrícula: {vehiculo?.matricula || 'N/A'}</p>
            {vehiculo && (
              <button
                onClick={() => navigate(`/vehiculos/${vehiculo.id}`)}
                className="mt-3 text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-sm transition-colors"
              >
                Ver detalle del vehículo →
              </button>
            )}
          </div>

          {/* Coste */}
          {mantenimiento.costo !== undefined && (
            <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-dark-300">Coste</label>
              </div>
              <p className="text-dark-900 dark:text-white font-semibold text-2xl">{formatCurrency(mantenimiento.costo)}</p>
            </div>
          )}

          {/* Fecha Objetivo */}
          {mantenimiento.fechaVencimiento && (
            <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-dark-300">Fecha Objetivo</label>
              </div>
              <p className="text-dark-900 dark:text-white font-semibold text-lg">
                {new Date(mantenimiento.fechaVencimiento).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className="text-gray-600 dark:text-dark-400 text-sm mt-1">
                {new Date(mantenimiento.fechaVencimiento).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Km Objetivo */}
          {mantenimiento.odometro !== undefined && (
            <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Gauge className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-dark-300">Km Objetivo</label>
              </div>
              <p className="text-dark-900 dark:text-white font-semibold text-2xl">{formatNumber(mantenimiento.odometro)}</p>
              <p className="text-gray-600 dark:text-dark-400 text-sm mt-1">kilómetros</p>
              {vehiculo?.kilometrajeActual !== undefined && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 dark:text-dark-400">
                    Actual: {formatNumber(vehiculo.kilometrajeActual)} km
                  </p>
                  {mantenimiento.odometro > vehiculo.kilometrajeActual ? (
                    <p className="text-xs text-blue-400 mt-1">
                      Faltan {formatNumber(mantenimiento.odometro - vehiculo.kilometrajeActual)} km
                    </p>
                  ) : (
                    <p className="text-xs text-red-400 mt-1">
                      Excedido por {formatNumber(vehiculo.kilometrajeActual - mantenimiento.odometro)} km
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Vencimiento (texto formateado) */}
          <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-dark-300">Vencimiento</label>
            </div>
            <p className="text-dark-900 dark:text-white font-medium">{mantenimiento.vencimiento}</p>
          </div>
        </div>

        {/* Notas (si existen) */}
        {mantenimiento.notas && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-3">Notas</label>
            <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
              <p className="text-dark-900 dark:text-white whitespace-pre-wrap">{mantenimiento.notas}</p>
            </div>
          </div>
        )}
      </div>

      {/* Información Adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del Vehículo */}
        {vehiculo && (
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary-500 dark:text-primary-400" />
              Información del Vehículo
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Modelo</label>
                <p className="text-dark-900 dark:text-white">{vehiculo.modelo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Tipo</label>
                <p className="text-dark-900 dark:text-white">{vehiculo.tipo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Año</label>
                <p className="text-dark-900 dark:text-white">{vehiculo.año}</p>
              </div>
              {vehiculo.kilometrajeActual !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Kilometraje Actual</label>
                  <p className="text-dark-900 dark:text-white">{formatNumber(vehiculo.kilometrajeActual)} km</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estado y Detalles */}
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary-500 dark:text-primary-400" />
            Estado y Detalles
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Estado</label>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${getEstadoColor(mantenimiento.estado)}`}>
                <span>{getEstadoIcon(mantenimiento.estado)}</span>
                {mantenimiento.estadoTexto}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Tipo de Mantenimiento</label>
              <p className="text-dark-900 dark:text-white">{mantenimiento.tipo}</p>
            </div>
            {mantenimiento.fechaVencimiento && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Fecha Programada</label>
                <p className="text-dark-900 dark:text-white">
                  {new Date(mantenimiento.fechaVencimiento).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
