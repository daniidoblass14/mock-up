import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Wrench, Edit, Calendar, Truck, DollarSign, Gauge, Save } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { estadoPorFechaObjetivo } from '../services/mantenimientos.service'
import { vehiculosService } from '../services/vehiculos.service'
import { formatCurrency, formatNumber } from '../utils/currency'
import { TIPOS_MANTENIMIENTO } from '../constants/tiposMantenimiento'
import CustomSelect from '../components/CustomSelect'

const ESTADO_OPTIONS = [
  { value: 'auto', label: 'Automático (calcular)' },
  { value: 'proximo', label: 'Próximo' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'completado', label: 'Completado' },
  { value: 'al-dia', label: 'Al día' },
]

function parseDateStringYYYYMMDD(str: string): Date | undefined {
  const trimmed = str?.trim()
  if (!trimmed) return undefined
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (!match) return undefined
  const year = parseInt(match[1], 10)
  const month = parseInt(match[2], 10) - 1
  const day = parseInt(match[3], 10)
  if (month < 0 || month > 11 || day < 1 || day > 31) return undefined
  const d = new Date(year, month, day)
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return undefined
  return d
}

function toDateStringYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatVencimiento(fechaVencimiento?: Date, odometro?: number): string {
  const partes: string[] = []
  if (fechaVencimiento) partes.push(fechaVencimiento.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }))
  if (odometro !== undefined) partes.push(`${formatNumber(odometro)} km`)
  return partes.length > 0 ? partes.join(' • ') : 'Sin vencimiento'
}

export default function DetalleMantenimiento() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { mantenimientos, updateMantenimiento } = useApp()
  const { showToast } = useToast()

  const mode = (searchParams.get('mode') ?? 'view') === 'edit' ? 'edit' : 'view'
  const isEditMode = mode === 'edit'
  const goToMode = (newMode: 'view' | 'edit') => setSearchParams({ mode: newMode }, { replace: true })

  const mantenimientoId = id ? parseInt(id) : null
  const mantenimiento = mantenimientoId ? mantenimientos.find(m => m.id === mantenimientoId) : null

  const [formData, setFormData] = useState({
    vehiculoId: '',
    tipo: '',
    fechaVencimiento: '',
    odometro: '',
    estado: 'auto' as 'auto' | 'vencido' | 'proximo' | 'completado' | 'al-dia',
    costo: '',
    notas: '',
  })

  useEffect(() => {
    if (mantenimiento && isEditMode) {
      setFormData({
        vehiculoId: mantenimiento.vehiculoId.toString(),
        tipo: mantenimiento.tipo,
        fechaVencimiento: mantenimiento.fechaVencimiento ? toDateStringYYYYMMDD(new Date(mantenimiento.fechaVencimiento)) : '',
        odometro: mantenimiento.odometro?.toString() ?? '',
        estado: mantenimiento.estado,
        costo: mantenimiento.costo?.toString() ?? '',
        notas: mantenimiento.notas ?? '',
      })
    }
  }, [mantenimiento, isEditMode])

  if (!mantenimiento) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Wrench className="w-16 h-16 text-gray-400 dark:text-dark-500 mb-4" />
        <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Mantenimiento no encontrado</h2>
        <p className="text-gray-600 dark:text-dark-400 mb-4">El mantenimiento que buscas no existe o ha sido eliminado.</p>
        <button onClick={() => navigate('/mantenimientos')} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
          Volver a mantenimientos
        </button>
      </div>
    )
  }

  const vehiculo = vehiculosService.getById(mantenimiento.vehiculoId)
  const vehiculos = vehiculosService.getAll()

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'vencido': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'proximo': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'completado': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'al-dia': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-dark-300'
    }
  }
  const getEstadoIcon = (estado: string) => {
    switch (estado) { case 'vencido': return '⚠️'; case 'proximo': return '⏰'; case 'completado': return '✅'; case 'al-dia': return '✓'; default: return '•' }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.vehiculoId.trim() || !formData.tipo.trim() || !formData.fechaVencimiento.trim() || !formData.odometro.trim() || !formData.costo.trim()) {
      showToast('Completa los campos obligatorios', 'error')
      return
    }
    const v = vehiculosService.getById(parseInt(formData.vehiculoId))
    if (!v) {
      showToast('Vehículo no válido', 'error')
      return
    }
    const fechaVencimiento = parseDateStringYYYYMMDD(formData.fechaVencimiento) ?? undefined
    if (!fechaVencimiento && formData.fechaVencimiento.trim()) {
      showToast('Fecha objetivo no válida', 'error')
      return
    }
    const odometro = parseInt(formData.odometro, 10)
    if (isNaN(odometro) || odometro < 0) {
      showToast('Km objetivo debe ser un número válido', 'error')
      return
    }
    const costo = parseFloat(formData.costo)
    if (isNaN(costo) || costo < 0) {
      showToast('Coste debe ser un número válido', 'error')
      return
    }
    const estadoCalculado = formData.estado === 'auto'
      ? estadoPorFechaObjetivo(fechaVencimiento)
      : formData.estado
    const estadoTexto = estadoCalculado === 'vencido' ? 'Vencido' : estadoCalculado === 'proximo' ? 'Próximo' : estadoCalculado === 'completado' ? 'Completado' : 'Al día'
    const vencimientoTexto = formatVencimiento(fechaVencimiento, odometro)

    const updated = updateMantenimiento(mantenimiento.id, {
      vehiculoId: parseInt(formData.vehiculoId),
      tipo: formData.tipo.trim(),
      vencimiento: vencimientoTexto,
      estado: estadoCalculado,
      estadoTexto,
      fechaVencimiento,
      odometro,
      costo,
      notas: formData.notas.trim() || undefined,
    })
    if (updated) {
      showToast('Mantenimiento actualizado correctamente', 'success')
      goToMode('view')
    } else {
      showToast('Error al actualizar', 'error')
    }
  }

  const title = isEditMode ? 'Editar mantenimiento' : 'Detalle del mantenimiento'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400 mb-2">
            <button onClick={() => navigate('/mantenimientos')} className="hover:text-dark-900 dark:hover:text-white transition-colors">Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate('/mantenimientos')} className="hover:text-dark-900 dark:hover:text-white transition-colors">Mantenimientos</button>
            <span>/</span>
            <span className="text-dark-900 dark:text-white">{isEditMode ? 'Editar' : 'Detalle'}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/mantenimientos')} className="p-2 text-gray-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors" aria-label="Volver">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-white">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/mantenimientos')} className="px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">Volver</button>
          {isEditMode ? (
            <>
              <button type="button" onClick={() => goToMode('view')} className="px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors">Cancelar</button>
              <button type="submit" form="form-mantenimiento" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2">
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
        <form id="form-mantenimiento" onSubmit={handleSave} className="space-y-6">
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
            <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Datos del mantenimiento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Vehículo</label>
                <CustomSelect
                  options={vehiculos.map(v => ({ value: v.id.toString(), label: `${v.modelo} - ${v.matricula}` }))}
                  value={formData.vehiculoId}
                  onChange={v => setFormData(f => ({ ...f, vehiculoId: v }))}
                  placeholder="Seleccionar vehículo..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Tipo de mantenimiento</label>
                <CustomSelect options={TIPOS_MANTENIMIENTO.map(t => ({ value: t, label: t }))} value={formData.tipo} onChange={v => setFormData(f => ({ ...f, tipo: v }))} placeholder="Seleccionar..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Fecha objetivo</label>
                <input type="date" value={formData.fechaVencimiento} onChange={e => setFormData(f => ({ ...f, fechaVencimiento: e.target.value }))} className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Km objetivo</label>
                <input type="number" min={0} value={formData.odometro} onChange={e => setFormData(f => ({ ...f, odometro: e.target.value }))} className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Estado</label>
                <CustomSelect options={ESTADO_OPTIONS} value={formData.estado} onChange={v => setFormData(f => ({ ...f, estado: v as any }))} placeholder="Seleccionar..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Coste (€)</label>
                <input type="number" min={0} step="0.01" value={formData.costo} onChange={e => setFormData(f => ({ ...f, costo: e.target.value }))} className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Notas</label>
                <textarea rows={3} value={formData.notas} onChange={e => setFormData(f => ({ ...f, notas: e.target.value }))} className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-2 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Notas opcionales..." />
              </div>
            </div>
          </div>
        </form>
      ) : (
        <>
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <Wrench className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-1">{mantenimiento.tipo}</h2>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getEstadoColor(mantenimiento.estado)}`}>
                    <span className="mr-2">{getEstadoIcon(mantenimiento.estado)}</span>
                    {mantenimiento.estadoTexto}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-dark-300">Vehículo</label>
                </div>
                <p className="text-dark-900 dark:text-white font-semibold text-lg">{vehiculo?.modelo || 'N/A'}</p>
                <p className="text-gray-600 dark:text-dark-400 text-sm mt-1">Matrícula: {vehiculo?.matricula || 'N/A'}</p>
                {vehiculo && (
                  <button onClick={() => navigate(`/vehiculos/${vehiculo.id}?mode=view`)} className="mt-3 text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-sm transition-colors">Ver detalle del vehículo →</button>
                )}
              </div>
              {mantenimiento.costo !== undefined && (
                <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400" />
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-300">Coste</label>
                  </div>
                  <p className="text-dark-900 dark:text-white font-semibold text-2xl">{formatCurrency(mantenimiento.costo)}</p>
                </div>
              )}
              {mantenimiento.fechaVencimiento && (
                <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-300">Fecha Objetivo</label>
                  </div>
                  <p className="text-dark-900 dark:text-white font-semibold text-lg">
                    {new Date(mantenimiento.fechaVencimiento).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-gray-600 dark:text-dark-400 text-sm mt-1">
                    {new Date(mantenimiento.fechaVencimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )}
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
                      <p className="text-xs text-gray-600 dark:text-dark-400">Actual: {formatNumber(vehiculo.kilometrajeActual)} km</p>
                      {mantenimiento.odometro > vehiculo.kilometrajeActual ? (
                        <p className="text-xs text-blue-400 mt-1">Faltan {formatNumber(mantenimiento.odometro - vehiculo.kilometrajeActual)} km</p>
                      ) : (
                        <p className="text-xs text-red-400 mt-1">Excedido por {formatNumber(vehiculo.kilometrajeActual - mantenimiento.odometro)} km</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4 md:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-dark-300">Vencimiento</label>
                </div>
                <p className="text-dark-900 dark:text-white font-medium">{mantenimiento.vencimiento}</p>
              </div>
            </div>
            {mantenimiento.notas && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-3">Notas</label>
                <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
                  <p className="text-dark-900 dark:text-white whitespace-pre-wrap">{mantenimiento.notas}</p>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehiculo && (
              <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                  Información del Vehículo
                </h3>
                <div className="space-y-3">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Modelo</label><p className="text-dark-900 dark:text-white">{vehiculo.modelo}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Tipo</label><p className="text-dark-900 dark:text-white">{vehiculo.tipo}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Año</label><p className="text-dark-900 dark:text-white">{vehiculo.año}</p></div>
                  {vehiculo.kilometrajeActual !== undefined && <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Kilometraje Actual</label><p className="text-dark-900 dark:text-white">{formatNumber(vehiculo.kilometrajeActual)} km</p></div>}
                </div>
              </div>
            )}
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
                <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Tipo de Mantenimiento</label><p className="text-dark-900 dark:text-white">{mantenimiento.tipo}</p></div>
                {mantenimiento.fechaVencimiento && (
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Fecha Programada</label><p className="text-dark-900 dark:text-white">{new Date(mantenimiento.fechaVencimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
