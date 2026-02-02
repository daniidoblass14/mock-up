import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Truck, Edit, Calendar, Wrench, Save } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { mantenimientosService } from '../services/mantenimientos.service'
import { formatNumber, formatCurrency } from '../utils/currency'
import { formatMatricula, validateMatricula, normalizeMatricula } from '../utils/matriculaMask'
import { calcularEstadoDerivadoVehiculo, getEstadoTextoDerivado } from '../utils/estadoVehiculo'
import CustomSelect from '../components/CustomSelect'

const MODELOS = [
  'Toyota Hilux', 'Ford Transit', 'Mercedes Sprinter', 'Seat León', 'VW Golf',
  'Renault Kangoo', 'Peugeot Partner', 'Iveco Daily', 'Nissan Navara',
  'Chevrolet D-Max', 'Hino 300 Series', 'Fiat Ducato', 'Opel Vivaro',
  'Citroën Berlingo', 'Ford Ranger',
]

const TIPOS = [
  { value: 'Turismo', label: 'Turismo' },
  { value: 'Furgoneta', label: 'Furgoneta' },
  { value: 'Camión', label: 'Camión' },
  { value: 'Industrial', label: 'Industrial' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Pickup', label: 'Pickup' },
]

export default function DetalleVehiculo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { vehiculos, mantenimientos, updateVehiculo } = useApp()
  const { showToast } = useToast()

  const mode = (searchParams.get('mode') ?? 'view') === 'edit' ? 'edit' : 'view'
  const isEditMode = mode === 'edit'
  const goToMode = (newMode: 'view' | 'edit') => {
    setSearchParams({ mode: newMode }, { replace: true })
  }

  const vehiculoId = id ? parseInt(id) : null
  const vehiculo = vehiculoId ? vehiculos.find(v => v.id === vehiculoId) : null

  const [formData, setFormData] = useState({
    modelo: '',
    tipo: '',
    año: '',
    matricula: '',
    vin: '',
    kilometrajeActual: '',
  })

  useEffect(() => {
    if (vehiculo && isEditMode) {
      setFormData({
        modelo: vehiculo.modelo,
        tipo: vehiculo.tipo,
        año: vehiculo.año.toString(),
        matricula: vehiculo.matricula,
        vin: vehiculo.vin ?? '',
        kilometrajeActual: vehiculo.kilometrajeActual?.toString() ?? '',
      })
    }
  }, [vehiculo, isEditMode])

  if (!vehiculo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Truck className="w-16 h-16 text-gray-400 dark:text-dark-500 mb-4" />
        <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Vehículo no encontrado</h2>
        <p className="text-gray-600 dark:text-dark-400 mb-4">El vehículo que buscas no existe o ha sido eliminado.</p>
        <button
          onClick={() => navigate('/vehiculos')}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          Volver a vehículos
        </button>
      </div>
    )
  }

  const mantenimientosVehiculo = mantenimientosService.getByVehiculoId(vehiculo.id)

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'al-dia': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'proximo': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'vencido': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-dark-300'
    }
  }
  const getEstadoDot = (estado: string) => {
    switch (estado) {
      case 'al-dia': return 'bg-green-500'
      case 'proximo': return 'bg-orange-500'
      case 'vencido': return 'bg-red-500'
      default: return 'bg-dark-500'
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.modelo.trim() || !formData.año.trim() || !formData.matricula.trim() || !formData.kilometrajeActual.trim()) {
      showToast('Completa los campos obligatorios', 'error')
      return
    }
    if (!validateMatricula(formData.matricula)) {
      showToast('Matrícula inválida. Use formato 0000-AAA', 'error')
      return
    }
    const km = parseInt(formData.kilometrajeActual, 10)
    if (isNaN(km) || km < 0) {
      showToast('Kilometraje debe ser un número válido', 'error')
      return
    }
    // Crear vehículo temporal para calcular estado derivado
    const vehiculoTemporal: Vehiculo = {
      id: vehiculo.id,
      modelo: formData.modelo.trim(),
      tipo: formData.tipo.trim(),
      año: parseInt(formData.año, 10),
      matricula: formData.matricula.trim(),
      vin: formData.vin.trim() || undefined,
      kilometrajeActual: km,
      estado: 'al-dia', // Temporal, se calculará
      estadoTexto: 'Al día',
    }
    
    // Calcular estado derivado
    const estadoDerivado = calcularEstadoDerivadoVehiculo(vehiculoTemporal, mantenimientos)
    const estadoTexto = getEstadoTextoDerivado(estadoDerivado)
    
    const updated = updateVehiculo(vehiculo.id, {
      modelo: formData.modelo.trim(),
      tipo: formData.tipo.trim(),
      año: parseInt(formData.año, 10),
      matricula: formData.matricula.trim(),
      vin: formData.vin.trim() || undefined,
      kilometrajeActual: km,
      estado: estadoDerivado,
      estadoTexto,
    })
    if (updated) {
      showToast('Vehículo actualizado correctamente', 'success')
      goToMode('view')
    } else {
      showToast('Error al actualizar', 'error')
    }
  }

  const años = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
    const y = new Date().getFullYear() - i
    return { value: y.toString(), label: y.toString() }
  })

  const title = isEditMode ? 'Editar vehículo' : 'Detalle del vehículo'

  return (
    <div className="space-y-6">
      {/* Breadcrumb y Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400 mb-2">
            <button onClick={() => navigate('/vehiculos')} className="hover:text-dark-900 dark:hover:text-white transition-colors">Inicio</button>
            <span>/</span>
            <button onClick={() => navigate('/vehiculos')} className="hover:text-dark-900 dark:hover:text-white transition-colors">Vehículos</button>
            <span>/</span>
            <span className="text-dark-900 dark:text-white">{isEditMode ? 'Editar' : 'Detalle'}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/vehiculos')}
              className="p-2 text-gray-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-white">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/vehiculos')}
            className="px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          >
            Volver
          </button>
          {isEditMode ? (
            <>
              <button type="button" onClick={() => goToMode('view')} className="px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors">
                Cancelar
              </button>
              <button type="submit" form="form-vehiculo" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Guardar cambios
              </button>
            </>
          ) : (
            <button onClick={() => goToMode('edit')} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </button>
          )}
        </div>
      </div>

      {isEditMode ? (
        <form id="form-vehiculo" onSubmit={handleSave} className="space-y-6">
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
            <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Información general</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Modelo</label>
                <CustomSelect options={MODELOS.map(m => ({ value: m, label: m }))} value={formData.modelo} onChange={v => setFormData(f => ({ ...f, modelo: v }))} placeholder="Seleccionar..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Tipo</label>
                <CustomSelect options={TIPOS} value={formData.tipo} onChange={v => setFormData(f => ({ ...f, tipo: v }))} placeholder="Seleccionar..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Año</label>
                <CustomSelect options={años} value={formData.año} onChange={v => setFormData(f => ({ ...f, año: v }))} placeholder="Seleccionar..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Matrícula</label>
                <input
                  type="text"
                  value={formData.matricula}
                  onChange={e => setFormData(f => ({ ...f, matricula: normalizeMatricula(formatMatricula(e.target.value)) }))}
                  placeholder="0000-AAA"
                  maxLength={8}
                  className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">VIN (opcional)</label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={e => setFormData(f => ({ ...f, vin: e.target.value.toUpperCase() }))}
                  placeholder="17 caracteres"
                  maxLength={17}
                  className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Kilometraje actual (km)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.kilometrajeActual}
                  onChange={e => setFormData(f => ({ ...f, kilometrajeActual: e.target.value }))}
                  className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </form>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 h-full flex items-center justify-center shadow-sm dark:shadow-none">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-100 dark:bg-dark-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-16 h-16 text-primary-500 dark:text-primary-400" />
                  </div>
                  <p className="text-gray-600 dark:text-dark-400 text-sm">Imagen del vehículo</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
                <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Información General</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Modelo</label>
                    <p className="text-dark-900 dark:text-white text-lg font-medium">{vehiculo.modelo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Tipo</label>
                    <p className="text-dark-900 dark:text-white text-lg font-medium">{vehiculo.tipo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Matrícula</label>
                    <p className="text-dark-900 dark:text-white text-lg font-mono font-medium">{vehiculo.matricula}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Año</label>
                    <p className="text-dark-900 dark:text-white text-lg font-medium">{vehiculo.año}</p>
                  </div>
                  {vehiculo.kilometrajeActual !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Kilometraje Actual</label>
                      <p className="text-dark-900 dark:text-white text-lg font-medium">{formatNumber(vehiculo.kilometrajeActual)} km</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Estado</label>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getEstadoDot(vehiculo.estado)}`}></span>
                      <span className={`px-3 py-1 rounded text-sm font-medium border ${getEstadoColor(vehiculo.estado)}`}>{vehiculo.estadoTexto}</span>
                    </div>
                  </div>
                  {vehiculo.vin && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">VIN</label>
                      <p className="text-dark-900 dark:text-white font-mono text-sm">{vehiculo.vin}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Historial de Mantenimientos (siempre visible) */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
        <div className="p-6 border-b border-gray-200 dark:border-dark-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-primary-500 dark:text-primary-400" />
              <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Historial de Mantenimientos</h2>
              <span className="px-2 py-1 bg-gray-100 dark:bg-dark-800 rounded text-sm text-gray-600 dark:text-dark-400">{mantenimientosVehiculo.length}</span>
            </div>
            <button onClick={() => navigate('/mantenimientos')} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              Nuevo Mantenimiento
            </button>
          </div>
        </div>
        {mantenimientosVehiculo.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-dark-500 opacity-50" />
            <p className="text-gray-600 dark:text-dark-400 text-sm mb-4">No hay mantenimientos registrados para este vehículo</p>
            <button onClick={() => navigate('/mantenimientos')} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm">Registrar primer mantenimiento</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-dark-400 uppercase tracking-wider">TIPO</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-dark-400 uppercase tracking-wider">FECHA OBJETIVO / KM OBJETIVO</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-dark-400 uppercase tracking-wider">ESTADO</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-dark-400 uppercase tracking-wider">COSTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-800">
                {mantenimientosVehiculo.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                    <td className="px-6 py-4"><div className="text-dark-900 dark:text-white font-medium">{m.tipo}</div></td>
                    <td className="px-6 py-4 text-gray-700 dark:text-dark-300">
                      <div className="space-y-1">
                        {m.fechaVencimiento && <div>{new Date(m.fechaVencimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                        {m.odometro !== undefined && <div className="text-sm">Km objetivo: {formatNumber(m.odometro)} km</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-medium border ${getEstadoColor(m.estado)}`}>{m.estadoTexto}</span></td>
                    <td className="px-6 py-4">{m.costo ? <span className="text-dark-900 dark:text-white font-medium">{formatCurrency(m.costo)}</span> : <span className="text-gray-500 dark:text-dark-500">-</span>}</td>
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
