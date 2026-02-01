import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Truck, Clock, AlertTriangle, Eye, Edit, Trash2, CheckCircle2 } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { vehiculosService } from '../services/vehiculos.service'
import { Mantenimiento, estadoPorFechaObjetivo } from '../services/mantenimientos.service'
import { TIPOS_MANTENIMIENTO } from '../constants/tiposMantenimiento'
import { formatCurrency, formatNumber } from '../utils/currency'
import Modal from '../components/Modal'
import CustomSelect from '../components/CustomSelect'
import ConfirmDialog from '../components/ConfirmDialog'

const ESTADO_OPTIONS = [
  { value: 'auto', label: 'Automático (calcular)' },
  { value: 'proximo', label: 'Próximo' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'completado', label: 'Completado' },
  { value: 'al-dia', label: 'Al día' },
]

/** Parsea "YYYY-MM-DD" como fecha local (medianoche local). Evita que new Date(str) se interprete como UTC. */
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

export default function Mantenimientos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { mantenimientos, addMantenimiento, deleteMantenimiento } = useApp()
  const { showToast } = useToast()
  
  const [tabActivo, setTabActivo] = useState<'proximos' | 'vencidos' | 'completados'>(
    (searchParams.get('tab') as any) || 'proximos'
  )
  const [busqueda, setBusqueda] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    vehiculoId: '',
    tipo: '',
    fechaVencimiento: '',
    odometro: '',
    estado: 'auto' as 'auto' | 'vencido' | 'proximo' | 'completado' | 'al-dia',
    costo: '',
    notas: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setTabActivo(tabParam as any)
    }
  }, [searchParams])

  const handleAdd = () => {
    setFormData({
      vehiculoId: '',
      tipo: '',
      fechaVencimiento: '',
      odometro: '',
      estado: 'auto',
      costo: '',
      notas: '',
    })
    setFieldErrors({})
    setIsModalOpen(true)
  }

  const handleEdit = (mantenimiento: Mantenimiento) => {
    navigate(`/mantenimientos/${mantenimiento.id}?mode=edit`)
  }

  const handleView = (mantenimiento: Mantenimiento) => {
    navigate(`/mantenimientos/${mantenimiento.id}?mode=view`)
  }

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id)
  }

  const formatVencimiento = (fechaVencimiento?: Date, odometro?: number): string => {
    const partes: string[] = []
    
    if (fechaVencimiento) {
      partes.push(fechaVencimiento.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }))
    }
    
    if (odometro !== undefined) {
      partes.push(`${formatNumber(odometro)} km`)
    }
    
    return partes.length > 0 ? partes.join(' • ') : 'Sin vencimiento'
  }

  // Validar campos obligatorios
  const validateFields = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.vehiculoId.trim()) {
      errors.vehiculoId = 'El vehículo es obligatorio'
    }
    if (!formData.tipo.trim()) {
      errors.tipo = 'El tipo de mantenimiento es obligatorio'
    }
    if (!formData.costo.trim()) {
      errors.costo = 'El coste es obligatorio'
    } else {
      const costo = parseFloat(formData.costo)
      if (isNaN(costo) || costo < 0) {
        errors.costo = 'El coste debe ser un número válido'
      }
    }
    if (!formData.fechaVencimiento.trim()) {
      errors.fechaVencimiento = 'La fecha objetivo es obligatoria'
    }
    if (!formData.odometro.trim()) {
      errors.odometro = 'El km objetivo es obligatorio'
    } else {
      const odometro = parseInt(formData.odometro)
      if (isNaN(odometro) || odometro < 0) {
        errors.odometro = 'El km objetivo debe ser un número válido'
      }
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validar cuando cambian los campos
  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    
    // Limpiar error del campo si se completa
    if (value.trim() && fieldErrors[field]) {
      const newErrors = { ...fieldErrors }
      delete newErrors[field]
      setFieldErrors(newErrors)
    }
  }

  // Verificar si el formulario es válido para deshabilitar el botón
  const isFormValid = (): boolean => {
    return (
      formData.vehiculoId.trim() !== '' &&
      formData.tipo.trim() !== '' &&
      formData.costo.trim() !== '' &&
      !isNaN(parseFloat(formData.costo)) &&
      parseFloat(formData.costo) >= 0 &&
      formData.fechaVencimiento.trim() !== '' &&
      formData.odometro.trim() !== '' &&
      !isNaN(parseInt(formData.odometro)) &&
      parseInt(formData.odometro) >= 0 &&
      Object.keys(fieldErrors).length === 0
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos obligatorios
    if (!validateFields()) {
      showToast('Por favor, completa todos los campos obligatorios', 'error')
      return
    }
    
    const vehiculo = vehiculosService.getById(parseInt(formData.vehiculoId))
    if (!vehiculo) {
      setFieldErrors({ ...fieldErrors, vehiculoId: 'Vehículo no válido' })
      showToast('Por favor, selecciona un vehículo válido', 'error')
      return
    }
    
    const fechaVencimiento = parseDateStringYYYYMMDD(formData.fechaVencimiento) ?? undefined
    if (!fechaVencimiento && formData.fechaVencimiento.trim()) {
      setFieldErrors(prev => ({ ...prev, fechaVencimiento: 'Fecha objetivo no válida' }))
      showToast('La fecha objetivo no es válida', 'error')
      return
    }
    // odometro es obligatorio, así que siempre debe tener un valor
    const odometro = parseInt(formData.odometro)
    
    // Calcular estado: si es 'auto', según fechaObjetivo (Vencido si < hoy, Próximo si >= hoy)
    const estadoCalculado = formData.estado === 'auto'
      ? estadoPorFechaObjetivo(fechaVencimiento)
      : formData.estado
    
    const estadoTexto = estadoCalculado === 'vencido' ? 'Vencido' 
      : estadoCalculado === 'proximo' ? 'Próximo' 
      : estadoCalculado === 'completado' ? 'Completado' 
      : 'Al día'
    
    const vencimientoTexto = formatVencimiento(fechaVencimiento, odometro)
    
    const mantenimientoData: Omit<Mantenimiento, 'id'> = {
      vehiculoId: parseInt(formData.vehiculoId),
      tipo: formData.tipo,
      vencimiento: vencimientoTexto,
      estado: estadoCalculado,
      estadoTexto,
      fechaVencimiento,
      odometro,
      // costo es obligatorio, así que siempre debe tener un valor
      costo: parseFloat(formData.costo),
      notas: formData.notas || undefined,
    }
    
    addMantenimiento(mantenimientoData)
    showToast('Mantenimiento registrado correctamente', 'success')
    // Cambiar a la pestaña donde aparece el nuevo mantenimiento para verlo en la tabla
    const tabDondeAparece = estadoCalculado === 'completado' ? 'completados' : estadoCalculado === 'vencido' ? 'vencidos' : 'proximos'
    setTabActivo(tabDondeAparece)
    setSearchParams({ tab: tabDondeAparece })

    setIsModalOpen(false)
    setFieldErrors({})
  }

  const mantenimientosFiltrados = useMemo(() => {
    return mantenimientos.filter(m => {
      if (tabActivo === 'proximos' && m.estado !== 'proximo') return false
      if (tabActivo === 'vencidos' && m.estado !== 'vencido') return false
      if (tabActivo === 'completados' && m.estado !== 'completado') return false
      if (busqueda) {
        const vehiculo = vehiculosService.getById(m.vehiculoId)
        const search = busqueda.toLowerCase()
        return (
          vehiculo?.modelo.toLowerCase().includes(search) ||
          vehiculo?.matricula.toLowerCase().includes(search) ||
          m.tipo.toLowerCase().includes(search)
        )
      }
      return true
    })
  }, [mantenimientos, tabActivo, busqueda])

  const getEstadoIcon = (estado: string) => {
    if (estado === 'vencido') return AlertTriangle
    if (estado === 'completado') return CheckCircle2
    return Clock
  }

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

  const hoy = new Date()
  const vencidos = mantenimientos.filter(m => m.estado === 'vencido').length
  
  const proximos7Dias = mantenimientos.filter(m => {
    if (m.estado !== 'proximo') return false
    if (!m.fechaVencimiento) return false
    const diffTime = new Date(m.fechaVencimiento).getTime() - hoy.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  }).length

  const costoMes = mantenimientos
    .filter(m => {
      if (!m.fechaVencimiento) return false
      const fecha = new Date(m.fechaVencimiento)
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
    })
    .reduce((sum, m) => sum + (m.costo || 0), 0)

  const vehiculos = vehiculosService.getAll()

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="vehiculo" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
          Vehículo <span className="text-red-400">*</span>
        </label>
        <CustomSelect
          options={vehiculos.map((v) => ({
            value: v.id.toString(),
            label: `${v.modelo} - ${v.matricula}`,
          }))}
          value={formData.vehiculoId}
          onChange={(value) => handleFieldChange('vehiculoId', value)}
          placeholder="Seleccionar vehículo..."
        />
        {fieldErrors.vehiculoId && (
          <p className="mt-1 text-sm text-red-400" role="alert">
            {fieldErrors.vehiculoId}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="tipo" className="block text-sm font-medium text-dark-300 mb-2">
          Tipo de Mantenimiento <span className="text-red-400">*</span>
        </label>
        <CustomSelect
          options={TIPOS_MANTENIMIENTO.map((tipo) => ({
            value: tipo,
            label: tipo,
          }))}
          value={formData.tipo}
          onChange={(value) => handleFieldChange('tipo', value)}
          placeholder="Seleccionar tipo..."
        />
        {fieldErrors.tipo && (
          <p className="mt-1 text-sm text-red-400" role="alert">
            {fieldErrors.tipo}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fechaVencimiento" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            Fecha objetivo <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            id="fechaVencimiento"
            value={formData.fechaVencimiento}
            onChange={(e) => handleFieldChange('fechaVencimiento', e.target.value)}
            className={`w-full bg-dark-800 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 ${
              fieldErrors.fechaVencimiento
                ? 'border-red-500 focus:ring-red-500'
                : 'border-dark-700 focus:ring-primary-500'
            }`}
            aria-label="Fecha objetivo"
            aria-invalid={!!fieldErrors.fechaVencimiento}
          />
          {fieldErrors.fechaVencimiento && (
            <p className="mt-1 text-sm text-red-400" role="alert">
              {fieldErrors.fechaVencimiento}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="odometro" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            Km objetivo <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            id="odometro"
            min="0"
            value={formData.odometro}
            onChange={(e) => handleFieldChange('odometro', e.target.value)}
            className={`w-full bg-white dark:bg-dark-800 border rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 ${
              fieldErrors.odometro
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-dark-700 focus:ring-primary-500'
            }`}
            placeholder="0"
            aria-label="Km objetivo"
            aria-invalid={!!fieldErrors.odometro}
          />
          {fieldErrors.odometro && (
            <p className="mt-1 text-sm text-red-400" role="alert">
              {fieldErrors.odometro}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Estado
          </label>
          <CustomSelect
            options={ESTADO_OPTIONS}
            value={formData.estado}
            onChange={(value) => handleFieldChange('estado', value)}
            placeholder="Seleccionar estado..."
          />
          <p className="text-xs text-gray-500 dark:text-dark-500 mt-1">
            {formData.estado === 'auto' 
              ? 'Se calculará automáticamente según fecha/kilometraje' 
              : 'Estado fijado manualmente'}
          </p>
        </div>
        <div>
          <label htmlFor="costo" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            Coste (€) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            id="costo"
            min="0"
            step="0.01"
            value={formData.costo}
            onChange={(e) => handleFieldChange('costo', e.target.value)}
            className={`w-full bg-white dark:bg-dark-800 border rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 ${
              fieldErrors.costo
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-dark-700 focus:ring-primary-500'
            }`}
            placeholder="0.00"
            aria-label="Coste en euros"
            aria-invalid={!!fieldErrors.costo}
          />
          {fieldErrors.costo && (
            <p className="mt-1 text-sm text-red-400" role="alert">
              {fieldErrors.costo}
            </p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
          Notas
        </label>
        <textarea
          id="notas"
          rows={3}
          value={formData.notas}
          onChange={(e) => handleFieldChange('notas', e.target.value)}
          className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-2 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Notas adicionales sobre el mantenimiento..."
          aria-label="Notas"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(false)
            setFieldErrors({})
          }}
          className="px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isFormValid()}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isFormValid()
              ? 'bg-primary-500 hover:bg-primary-600 text-white cursor-pointer'
              : 'bg-gray-300 dark:bg-dark-700 text-gray-500 dark:text-dark-400 cursor-not-allowed'
          }`}
        >
          Guardar
        </button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Gestión de Mantenimiento</h1>
        <p className="text-gray-600 dark:text-dark-400">
          Supervisa el estado de tu flota. Mantén tus vehículos seguros y operativos.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-dark-400" />
          <input
            type="text"
            placeholder="Buscar vehículo o tarea..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white dark:bg-dark-900 border border-gray-300 dark:border-dark-800 rounded-lg pl-10 pr-4 py-3 text-dark-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm dark:shadow-none"
            aria-label="Buscar mantenimientos"
          />
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
          aria-label="Registrar nuevo mantenimiento"
        >
          <Plus className="w-5 h-5" />
          <span>Registrar mantenimiento</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-dark-400 text-sm mb-1">MANTENIMIENTOS VENCIDOS</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white">{vencidos}</p>
              {vencidos > 0 && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">Requieren atención</p>
              )}
            </div>
            <div className="w-16 h-16 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-dark-400 text-sm mb-1">PRÓXIMOS 7 DÍAS</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white">{proximos7Dias}</p>
              <p className="text-gray-600 dark:text-dark-400 text-sm mt-1">tareas programadas</p>
            </div>
            <div className="w-16 h-16 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-dark-400 text-sm mb-1">COSTO ESTE MES</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white">{formatCurrency(costoMes)}</p>
              <p className="text-gray-600 dark:text-dark-400 text-sm mt-1">Total acumulado</p>
            </div>
            <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-800">
        <div className="flex gap-6">
          <button
            onClick={() => {
              setTabActivo('proximos')
              setSearchParams({ tab: 'proximos' })
            }}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              tabActivo === 'proximos'
                ? 'text-primary-500 dark:text-primary-400'
                : 'text-gray-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
            }`}
            aria-label="Ver mantenimientos próximos"
          >
            Próximos
            {tabActivo === 'proximos' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></span>
            )}
          </button>
          <button
            onClick={() => {
              setTabActivo('vencidos')
              setSearchParams({ tab: 'vencidos' })
            }}
            className={`pb-4 px-2 font-medium transition-colors relative flex items-center gap-2 ${
              tabActivo === 'vencidos'
                ? 'text-primary-500 dark:text-primary-400'
                : 'text-gray-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
            }`}
            aria-label="Ver mantenimientos vencidos"
          >
            Vencidos
            {vencidos > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                {vencidos}
              </span>
            )}
            {tabActivo === 'vencidos' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></span>
            )}
          </button>
          <button
            onClick={() => {
              setTabActivo('completados')
              setSearchParams({ tab: 'completados' })
            }}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              tabActivo === 'completados'
                ? 'text-primary-500 dark:text-primary-400'
                : 'text-gray-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
            }`}
            aria-label="Ver mantenimientos completados"
          >
            Completados
            {tabActivo === 'completados' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></span>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-dark-400 uppercase tracking-wider">
                  VEHÍCULO
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-dark-400 uppercase tracking-wider">
                  TIPO DE MANTENIMIENTO
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-dark-400 uppercase tracking-wider">
                  FECHA OBJETIVO / KM OBJETIVO
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-dark-400 uppercase tracking-wider">
                  ESTADO
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-dark-400 uppercase tracking-wider">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-800">
              {mantenimientosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Truck className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-dark-500 opacity-50" />
                    <p className="text-gray-600 dark:text-dark-400 text-sm">No se encontraron mantenimientos</p>
                    {busqueda && (
                      <p className="text-gray-500 dark:text-dark-500 text-xs mt-1">Intenta con otros términos de búsqueda</p>
                    )}
                  </td>
                </tr>
              ) : (
                mantenimientosFiltrados.map((mantenimiento) => {
                  const vehiculo = vehiculosService.getById(mantenimiento.vehiculoId)
                  const EstadoIcon = getEstadoIcon(mantenimiento.estado)
                  return (
                    <tr key={mantenimiento.id} className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-dark-800 rounded-lg flex items-center justify-center">
                            <Truck className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                          </div>
                          <div>
                            <div className="text-dark-900 dark:text-white font-medium">{vehiculo?.modelo || 'N/A'}</div>
                            <div className="text-gray-600 dark:text-dark-400 text-sm">Matrícula: {vehiculo?.matricula || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-dark-900 dark:text-white font-medium">{mantenimiento.tipo}</div>
                        {mantenimiento.costo && (
                          <div className="text-gray-600 dark:text-dark-400 text-sm">{formatCurrency(mantenimiento.costo)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-dark-300">
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
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${getEstadoColor(mantenimiento.estado)}`}>
                          <EstadoIcon className="w-4 h-4" />
                          <span className="text-xs font-medium">{mantenimiento.estadoTexto}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(mantenimiento)}
                            className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
                            title="Ver detalles"
                            aria-label="Ver detalles del mantenimiento"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(mantenimiento)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Editar"
                            aria-label="Editar mantenimiento"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(mantenimiento.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar"
                            aria-label="Eliminar mantenimiento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-dark-400 text-sm">
          Mostrando {mantenimientosFiltrados.length} de {mantenimientos.length} tareas
        </p>
      </div>

      {/* Modal Añadir mantenimiento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setFieldErrors({})
        }}
        title="Registrar Mantenimiento"
        size="lg"
      >
        {renderForm()}
      </Modal>


      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="Eliminar mantenimiento"
        description="¿Estás seguro de que deseas eliminar este mantenimiento? Esta acción no se puede deshacer."
        confirmLabel="Eliminar mantenimiento"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId !== null) {
            const resultado = deleteMantenimiento(deleteConfirmId)
            if (resultado) {
              showToast('Mantenimiento eliminado correctamente', 'success')
            } else {
              showToast('Error al eliminar el mantenimiento', 'error')
            }
          }
          setDeleteConfirmId(null)
        }}
      />
    </div>
  )
}
