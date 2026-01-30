import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Truck, Edit, Calendar, Wrench } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { vehiculosService } from '../services/vehiculos.service'
import { mantenimientosService } from '../services/mantenimientos.service'
import { formatNumber, formatCurrency } from '../utils/currency'

export default function DetalleVehiculo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { vehiculos } = useApp()
  
  const vehiculoId = id ? parseInt(id) : null
  const vehiculo = vehiculoId ? vehiculos.find(v => v.id === vehiculoId) : null
  
  // Si no se encuentra el vehículo, redirigir
  if (!vehiculo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Truck className="w-16 h-16 text-dark-500 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Vehículo no encontrado</h2>
        <p className="text-dark-400 mb-4">El vehículo que buscas no existe o ha sido eliminado.</p>
        <button
          onClick={() => navigate('/vehiculos')}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          Volver a vehículos
        </button>
      </div>
    )
  }
  
  const mantenimientos = mantenimientosService.getByVehiculoId(vehiculo.id)
  
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'al-dia':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'proximo':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'vencido':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-dark-700 text-dark-300'
    }
  }
  
  const getEstadoDot = (estado: string) => {
    switch (estado) {
      case 'al-dia':
        return 'bg-green-500'
      case 'proximo':
        return 'bg-orange-500'
      case 'vencido':
        return 'bg-red-500'
      default:
        return 'bg-dark-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb y Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-dark-400 mb-2">
            <button
              onClick={() => navigate('/vehiculos')}
              className="hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <button
              onClick={() => navigate('/vehiculos')}
              className="hover:text-white transition-colors"
            >
              Inventario
            </button>
            <span>/</span>
            <span className="text-white">Detalle</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/vehiculos')}
              className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-white">Detalle del Vehículo</h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/vehiculos')}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          <span>Editar</span>
        </button>
      </div>

      {/* Imagen y Datos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Imagen/Placeholder */}
        <div className="lg:col-span-1">
          <div className="bg-dark-900 border border-dark-800 rounded-lg p-6 h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-dark-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Truck className="w-16 h-16 text-primary-400" />
              </div>
              <p className="text-dark-400 text-sm">Imagen del vehículo</p>
            </div>
          </div>
        </div>

        {/* Datos Principales */}
        <div className="lg:col-span-2">
          <div className="bg-dark-900 border border-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Modelo</label>
                <p className="text-white text-lg font-medium">{vehiculo.modelo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Tipo</label>
                <p className="text-white text-lg font-medium">{vehiculo.tipo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Matrícula</label>
                <p className="text-white text-lg font-mono font-medium">{vehiculo.matricula}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Año</label>
                <p className="text-white text-lg font-medium">{vehiculo.año}</p>
              </div>
              {vehiculo.kilometrajeActual !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Kilometraje Actual</label>
                  <p className="text-white text-lg font-medium">{formatNumber(vehiculo.kilometrajeActual)} km</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Estado</label>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getEstadoDot(vehiculo.estado)}`}></span>
                  <span className={`px-3 py-1 rounded text-sm font-medium border ${getEstadoColor(vehiculo.estado)}`}>
                    {vehiculo.estadoTexto}
                  </span>
                </div>
              </div>
              {vehiculo.vin && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark-300 mb-2">VIN</label>
                  <p className="text-white font-mono text-sm">{vehiculo.vin}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Mantenimientos */}
      <div className="bg-dark-900 border border-dark-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-dark-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-semibold text-white">Historial de Mantenimientos</h2>
              <span className="px-2 py-1 bg-dark-800 rounded text-sm text-dark-400">
                {mantenimientos.length}
              </span>
            </div>
            <button
              onClick={() => navigate('/mantenimientos')}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Nuevo Mantenimiento</span>
            </button>
          </div>
        </div>
        
        {mantenimientos.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-12 h-12 mx-auto mb-3 text-dark-500 opacity-50" />
            <p className="text-dark-400 text-sm mb-4">No hay mantenimientos registrados para este vehículo</p>
            <button
              onClick={() => navigate('/mantenimientos')}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm"
            >
              Registrar primer mantenimiento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    TIPO
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    FECHA OBJETIVO / KM OBJETIVO
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    ESTADO
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    COSTE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {mantenimientos.map((mantenimiento) => (
                  <tr key={mantenimiento.id} className="hover:bg-dark-800 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{mantenimiento.tipo}</div>
                    </td>
                    <td className="px-6 py-4 text-dark-300">
                      <div className="space-y-1">
                        {mantenimiento.fechaVencimiento && (
                          <div>
                            {new Date(mantenimiento.fechaVencimiento).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                        {mantenimiento.odometro !== undefined && (
                          <div className="text-sm">
                            Km objetivo: {formatNumber(mantenimiento.odometro)} km
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-medium border ${getEstadoColor(mantenimiento.estado)}`}>
                        {mantenimiento.estadoTexto}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {mantenimiento.costo ? (
                        <span className="text-white font-medium">{formatCurrency(mantenimiento.costo)}</span>
                      ) : (
                        <span className="text-dark-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
