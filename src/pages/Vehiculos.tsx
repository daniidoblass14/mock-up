import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Truck, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { vehiculosService } from '../services/vehiculos.service'
import { mantenimientosService } from '../services/mantenimientos.service'
import { type Vehiculo } from '../services/vehiculos.service'
import Modal from '../components/Modal'
import CustomSelect from '../components/CustomSelect'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatMatricula, validateMatricula, normalizeMatricula } from '../utils/matriculaMask'
import { formatNumber } from '../utils/currency'

const MODELOS = [
  'Toyota Hilux',
  'Ford Transit',
  'Mercedes Sprinter',
  'Seat León',
  'VW Golf',
  'Renault Kangoo',
  'Peugeot Partner',
  'Iveco Daily',
  'Nissan Navara',
  'Chevrolet D-Max',
  'Hino 300 Series',
  'Fiat Ducato',
  'Opel Vivaro',
  'Citroën Berlingo',
  'Ford Ranger',
]

const TIPOS = [
  { value: 'Turismo', label: 'Turismo' },
  { value: 'Furgoneta', label: 'Furgoneta' },
  { value: 'Camión', label: 'Camión' },
  { value: 'Industrial', label: 'Industrial' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Pickup', label: 'Pickup' },
]

const ESTADOS = [
  { value: 'al-dia', label: 'Al día' },
  { value: 'proximo', label: 'Próximo' },
  { value: 'vencido', label: 'Vencido' },
]

// Función helper para calcular próximo mantenimiento desde mantenimientos asociados
function calcularProximoMantenimiento(vehiculoId: number): string {
  const mantenimientos = mantenimientosService.getByVehiculoId(vehiculoId)
  if (mantenimientos.length === 0) {
    return 'Sin mantenimientos programados'
  }

  // Buscar el más urgente (vencido o próximo por fecha/odómetro)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const mantenimientosUrgentes = mantenimientos
    .filter(m => m.estado === 'vencido' || m.estado === 'proximo')
    .map(m => {
      let prioridad = 999999
      if (m.fechaVencimiento) {
        const diffTime = new Date(m.fechaVencimiento).getTime() - hoy.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        prioridad = diffDays
      } else if (m.odometro) {
        const vehiculo = vehiculosService.getById(vehiculoId)
        if (vehiculo?.kilometrajeActual) {
          const diff = m.odometro - vehiculo.kilometrajeActual
          prioridad = diff
        }
      }
      return { mantenimiento: m, prioridad }
    })
    .sort((a, b) => a.prioridad - b.prioridad)

  if (mantenimientosUrgentes.length === 0) {
    return 'Sin mantenimientos pendientes'
  }

  const masUrgente = mantenimientosUrgentes[0].mantenimiento
  if (masUrgente.fechaVencimiento) {
    const fecha = new Date(masUrgente.fechaVencimiento)
    const diffTime = fecha.getTime() - hoy.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return `Vencido hace ${Math.abs(diffDays)} días`
    } else if (diffDays === 0) {
      return 'Vence hoy'
    } else if (diffDays <= 7) {
      return `En ${diffDays} días`
    } else {
      return `En ${Math.ceil(diffDays / 7)} semanas`
    }
  } else if (masUrgente.odometro) {
    const vehiculo = vehiculosService.getById(vehiculoId)
    if (vehiculo?.kilometrajeActual) {
      const diff = masUrgente.odometro - vehiculo.kilometrajeActual
      if (diff < 0) {
        return `Vencido (${Math.abs(diff)} km pasado)`
      } else if (diff <= 500) {
        return `En ${diff} km`
      } else {
        return `En ${Math.ceil(diff / 1000)}k km`
      }
    }
  }

  return masUrgente.tipo
}

export default function Vehiculos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { vehiculos, addVehiculo, updateVehiculo, deleteVehiculo } = useApp()
  const { showToast } = useToast()
  
  const [filtro, setFiltro] = useState<'todos' | 'al-dia' | 'proximo' | 'vencido'>(
    (searchParams.get('filtro') as any) || 'todos'
  )
  const [busqueda, setBusqueda] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null)
  const [formData, setFormData] = useState({
    modelo: '',
    tipo: '',
    año: new Date().getFullYear().toString(),
    matricula: '',
    vin: '',
    kilometrajeActual: '',
    estado: 'al-dia' as 'al-dia' | 'proximo' | 'vencido',
  })
  const [matriculaError, setMatriculaError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [duplicateError, setDuplicateError] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  useEffect(() => {
    const filtroParam = searchParams.get('filtro')
    if (filtroParam) {
      setFiltro(filtroParam as any)
    }
  }, [searchParams])

  const handleAdd = () => {
    setFormData({
      modelo: '',
      tipo: '',
      año: new Date().getFullYear().toString(),
      matricula: '',
      vin: '',
      kilometrajeActual: '',
      estado: 'al-dia',
    })
    setMatriculaError('')
    setFieldErrors({})
    setDuplicateError('')
    setVehiculoSeleccionado(null)
    setIsModalOpen(true)
  }

  const handleEdit = (vehiculo: Vehiculo) => {
    navigate(`/vehiculos/${vehiculo.id}?mode=edit`)
  }

  const handleView = (vehiculo: Vehiculo) => {
    navigate(`/vehiculos/${vehiculo.id}?mode=view`)
  }

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id)
  }

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMatricula(e.target.value)
    const normalized = normalizeMatricula(formatted)
    setFormData({ ...formData, matricula: normalized })
    setDuplicateError('')
    
    if (normalized.length > 0 && !validateMatricula(normalized)) {
      setMatriculaError('Formato inválido. Use: 0000-AAA')
      setFieldErrors({ ...fieldErrors, matricula: 'Formato inválido. Use: 0000-AAA' })
    } else {
      setMatriculaError('')
      const newErrors = { ...fieldErrors }
      delete newErrors.matricula
      setFieldErrors(newErrors)
    }
  }

  // Validar campos obligatorios
  const validateFields = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.modelo.trim()) {
      errors.modelo = 'El modelo es obligatorio'
    }
    if (!formData.año.trim()) {
      errors.año = 'El año es obligatorio'
    }
    if (!formData.matricula.trim()) {
      errors.matricula = 'La matrícula es obligatoria'
    } else if (!validateMatricula(formData.matricula)) {
      errors.matricula = 'Formato inválido. Use: 0000-AAA'
    }
    if (!formData.kilometrajeActual.trim()) {
      errors.kilometrajeActual = 'El kilometraje actual es obligatorio'
    } else {
      const km = parseInt(formData.kilometrajeActual)
      if (isNaN(km) || km < 0) {
        errors.kilometrajeActual = 'El kilometraje debe ser un número válido'
      }
    }
    if (!formData.estado) {
      errors.estado = 'El estado es obligatorio'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validar duplicados (modelo + matrícula)
  const checkDuplicate = (): boolean => {
    if (!vehiculoSeleccionado) {
      // Solo validar duplicados al añadir, no al editar
      const existe = vehiculos.some(v => 
        v.modelo.toLowerCase() === formData.modelo.toLowerCase() &&
        v.matricula.toLowerCase() === formData.matricula.toLowerCase()
      )
      if (existe) {
        setDuplicateError('Ya existe un vehículo con esa marca, modelo y matrícula')
        return false
      }
    }
    setDuplicateError('')
    return true
  }

  // Validar cuando cambian los campos
  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    setDuplicateError('')
    
    // Limpiar error del campo si se completa
    if (value.trim() && fieldErrors[field]) {
      const newErrors = { ...fieldErrors }
      delete newErrors[field]
      setFieldErrors(newErrors)
    }
    
    // Validar duplicados cuando cambian modelo o matrícula
    if ((field === 'modelo' || field === 'matricula') && !vehiculoSeleccionado) {
      const newFormData = { ...formData, [field]: value }
      if (newFormData.modelo.trim() && newFormData.matricula.trim()) {
        const existe = vehiculos.some(v => 
          v.modelo.toLowerCase() === newFormData.modelo.toLowerCase() &&
          v.matricula.toLowerCase() === newFormData.matricula.toLowerCase()
        )
        if (existe) {
          setDuplicateError('Ya existe un vehículo con esa marca, modelo y matrícula')
        } else {
          setDuplicateError('')
        }
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos obligatorios
    if (!validateFields()) {
      showToast('Por favor, completa todos los campos obligatorios', 'error')
      return
    }
    
    // Validar duplicados solo al añadir
    if (!vehiculoSeleccionado && !checkDuplicate()) {
      showToast('Ya existe un vehículo con esa marca, modelo y matrícula', 'error')
      return
    }
    
    // Asegurar que el estado tenga un valor por defecto
    const estadoFinal = formData.estado || 'al-dia'
    const estadoTexto = estadoFinal === 'al-dia' ? 'Al día' : estadoFinal === 'proximo' ? 'Próximo' : 'Vencido'
    
    const vehiculoData: Omit<Vehiculo, 'id'> = {
      modelo: formData.modelo,
      tipo: formData.tipo,
      año: parseInt(formData.año),
      matricula: formData.matricula,
      vin: formData.vin || undefined,
      kilometrajeActual: parseInt(formData.kilometrajeActual),
      estado: estadoFinal,
      estadoTexto,
    }
    
    if (vehiculoSeleccionado) {
      if (updateVehiculo(vehiculoSeleccionado.id, vehiculoData)) {
        showToast('Vehículo actualizado correctamente', 'success')
      } else {
        showToast('Error al actualizar el vehículo', 'error')
      }
    } else {
      addVehiculo(vehiculoData)
      showToast('Vehículo añadido correctamente', 'success')
    }
    
    setIsModalOpen(false)
    setIsModalOpen(false)
    setVehiculoSeleccionado(null)
    setMatriculaError('')
    setFieldErrors({})
    setDuplicateError('')
  }

  // Verificar si el formulario es válido para deshabilitar el botón
  const isFormValid = (): boolean => {
    return (
      formData.modelo.trim() !== '' &&
      formData.año.trim() !== '' &&
      formData.matricula.trim() !== '' &&
      validateMatricula(formData.matricula) &&
      formData.kilometrajeActual.trim() !== '' &&
      !isNaN(parseInt(formData.kilometrajeActual)) &&
      parseInt(formData.kilometrajeActual) >= 0 &&
      formData.estado !== '' &&
      Object.keys(fieldErrors).length === 0 &&
      duplicateError === ''
    )
  }

  const vehiculosFiltrados = useMemo(() => {
    return vehiculos.filter(v => {
      if (filtro !== 'todos' && v.estado !== filtro) return false
      if (busqueda) {
        const search = busqueda.toLowerCase()
        return (
          v.modelo.toLowerCase().includes(search) ||
          v.matricula.toLowerCase().includes(search) ||
          v.tipo.toLowerCase().includes(search) ||
          (v.vin && v.vin.toLowerCase().includes(search))
        )
      }
      return true
    })
  }, [vehiculos, filtro, busqueda])

  // Función reutilizable de paginación
  const paginate = <T,>(data: T[], page: number, size: number): T[] => {
    const startIndex = (page - 1) * size
    const endIndex = startIndex + size
    return data.slice(startIndex, endIndex)
  }

  // Calcular total de páginas
  const totalPages = Math.ceil(vehiculosFiltrados.length / pageSize)

  // Aplicar paginación a los vehículos filtrados
  const vehiculosPaginados = useMemo(() => {
    return paginate(vehiculosFiltrados, currentPage, pageSize)
  }, [vehiculosFiltrados, currentPage, pageSize])

  // Resetear a página 1 cuando cambian filtros o búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [filtro, busqueda])

  // Ajustar página actual si excede el total de páginas
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  // Calcular rango de elementos mostrados
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, vehiculosFiltrados.length)

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'al-dia':
        return 'bg-green-500/20 text-green-400'
      case 'proximo':
        return 'bg-orange-500/20 text-orange-400'
      case 'vencido':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-dark-300'
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

  const años = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
    const año = new Date().getFullYear() - i
    return { value: año.toString(), label: año.toString() }
  })

  const renderForm = (isEdit: boolean = false) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {duplicateError && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-400" role="alert">
            {duplicateError}
          </p>
        </div>
      )}
      <div>
        <label htmlFor={isEdit ? 'edit-modelo' : 'modelo'} className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
          Modelo <span className="text-red-400">*</span>
        </label>
        <CustomSelect
          options={MODELOS.map((modelo) => ({
            value: modelo,
            label: modelo,
          }))}
          value={formData.modelo}
          onChange={(value) => {
            handleFieldChange('modelo', value)
            checkDuplicate()
          }}
          placeholder="Seleccionar modelo..."
        />
        {fieldErrors.modelo && (
          <p className="mt-1 text-sm text-red-400" role="alert">
            {fieldErrors.modelo}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={isEdit ? 'edit-tipo' : 'tipo'} className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
          Tipo <span className="text-red-400">*</span>
        </label>
        <CustomSelect
          options={TIPOS}
          value={formData.tipo}
          onChange={(value) => handleFieldChange('tipo', value)}
          placeholder="Seleccionar tipo..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={isEdit ? 'edit-año' : 'año'} className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            Año <span className="text-red-400">*</span>
          </label>
          <CustomSelect
            options={años}
            value={formData.año}
            onChange={(value) => handleFieldChange('año', value)}
            placeholder="Seleccionar año..."
          />
          {fieldErrors.año && (
            <p className="mt-1 text-sm text-red-400" role="alert">
              {fieldErrors.año}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={isEdit ? 'edit-matricula' : 'matricula'} className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            Matrícula <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id={isEdit ? 'edit-matricula' : 'matricula'}
            required
            value={formData.matricula}
            onChange={handleMatriculaChange}
            onBlur={() => {
              if (formData.matricula.trim()) {
                checkDuplicate()
              }
            }}
            placeholder="0000-AAA"
            maxLength={8}
            className={`w-full bg-white dark:bg-dark-800 border rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 ${
              matriculaError || fieldErrors.matricula
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-dark-700 focus:ring-primary-500'
            }`}
            aria-label="Matrícula del vehículo"
            aria-invalid={!!(matriculaError || fieldErrors.matricula)}
          />
          {(matriculaError || fieldErrors.matricula) && (
            <p className="mt-1 text-sm text-red-400" role="alert">
              {matriculaError || fieldErrors.matricula}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={isEdit ? 'edit-vin' : 'vin'} className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            VIN (opcional)
          </label>
          <input
            type="text"
            id={isEdit ? 'edit-vin' : 'vin'}
            value={formData.vin}
            onChange={(e) => handleFieldChange('vin', e.target.value.toUpperCase())}
            placeholder="17 caracteres"
            maxLength={17}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            aria-label="Número de identificación del vehículo (VIN)"
          />
        </div>
        <div>
          <label htmlFor={isEdit ? 'edit-kilometrajeActual' : 'kilometrajeActual'} className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
            Kilometraje Actual (km) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            id={isEdit ? 'edit-kilometrajeActual' : 'kilometrajeActual'}
            min="0"
            value={formData.kilometrajeActual}
            onChange={(e) => handleFieldChange('kilometrajeActual', e.target.value)}
            placeholder="0"
            className={`w-full bg-white dark:bg-dark-800 border rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 ${
              fieldErrors.kilometrajeActual
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-dark-700 focus:ring-primary-500'
            }`}
            aria-label="Kilometraje actual del vehículo"
            aria-invalid={!!fieldErrors.kilometrajeActual}
          />
          {fieldErrors.kilometrajeActual && (
            <p className="mt-1 text-sm text-red-400" role="alert">
              {fieldErrors.kilometrajeActual}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
          Estado <span className="text-red-400">*</span>
        </label>
        <CustomSelect
          options={ESTADOS}
          value={formData.estado}
          onChange={(value) => handleFieldChange('estado', value)}
          placeholder="Seleccionar estado..."
        />
        {fieldErrors.estado && (
          <p className="mt-1 text-sm text-red-400" role="alert">
            {fieldErrors.estado}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(false)
            setIsModalOpen(false)
            setVehiculoSeleccionado(null)
            setMatriculaError('')
            setFieldErrors({})
            setDuplicateError('')
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
          {isEdit ? 'Guardar cambios' : 'Guardar'}
        </button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-sm text-gray-500 dark:text-dark-400 mb-2">Dashboard &gt; Inventario</div>
        <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Inventario de Flota</h1>
        <p className="text-gray-600 dark:text-dark-400">
          Gestiona el estado y mantenimiento de tus {vehiculos.length} vehículos activos.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-dark-400" />
          <input
            type="text"
            placeholder="Buscar por matrícula, modelo o VIN..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white dark:bg-dark-900 border border-gray-300 dark:border-dark-800 rounded-lg pl-10 pr-4 py-3 text-dark-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm dark:shadow-none"
            aria-label="Buscar vehículos"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFiltro('todos')
              setSearchParams({})
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtro === 'todos'
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white border border-gray-300 dark:border-transparent shadow-sm dark:shadow-none'
            }`}
            aria-label="Mostrar todos los vehículos"
          >
            Todos
          </button>
          <button
            onClick={() => {
              setFiltro('al-dia')
              setSearchParams({ filtro: 'al-dia' })
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filtro === 'al-dia'
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white border border-gray-300 dark:border-transparent shadow-sm dark:shadow-none'
            }`}
            aria-label="Filtrar vehículos al día"
          >
            <span className={`w-2 h-2 rounded-full ${filtro === 'al-dia' ? 'bg-white' : 'bg-green-500'}`}></span>
            Al día
          </button>
          <button
            onClick={() => {
              setFiltro('proximo')
              setSearchParams({ filtro: 'proximo' })
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filtro === 'proximo'
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white border border-gray-300 dark:border-transparent shadow-sm dark:shadow-none'
            }`}
            aria-label="Filtrar vehículos próximos"
          >
            <span className={`w-2 h-2 rounded-full ${filtro === 'proximo' ? 'bg-white' : 'bg-orange-500'}`}></span>
            Próximo
          </button>
          <button
            onClick={() => {
              setFiltro('vencido')
              setSearchParams({ filtro: 'vencido' })
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filtro === 'vencido'
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white border border-gray-300 dark:border-transparent shadow-sm dark:shadow-none'
            }`}
            aria-label="Filtrar vehículos vencidos"
          >
            <span className={`w-2 h-2 rounded-full ${filtro === 'vencido' ? 'bg-white' : 'bg-red-500'}`}></span>
            Vencido
          </button>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
          data-action="add-vehiculo"
          aria-label="Añadir nuevo vehículo"
        >
          <Plus className="w-5 h-5" />
          <span>Añadir vehículo</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-dark-400 uppercase tracking-wider">
                  MODELO / VEHÍCULO
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                  MATRÍCULA
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-dark-400 uppercase tracking-wider">
                  PRÓX. MANTENIMIENTO
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
              {vehiculosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Truck className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-dark-500 opacity-50" />
                    <p className="text-gray-600 dark:text-dark-400 text-sm">No se encontraron vehículos</p>
                    {busqueda && (
                      <p className="text-gray-500 dark:text-dark-500 text-xs mt-1">Intenta con otros términos de búsqueda</p>
                    )}
                  </td>
                </tr>
              ) : (
                vehiculosPaginados.map((vehiculo) => {
                  const proximoMantenimiento = calcularProximoMantenimiento(vehiculo.id)
                  return (
                    <tr key={vehiculo.id} className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-dark-800 rounded-lg flex items-center justify-center">
                            <Truck className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                          </div>
                          <div>
                            <div className="text-dark-900 dark:text-white font-medium">{vehiculo.modelo}</div>
                            <div className="text-gray-600 dark:text-dark-400 text-sm">{vehiculo.tipo} • {vehiculo.año}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-dark-800 rounded-full text-gray-700 dark:text-dark-300 text-sm font-medium">
                          {vehiculo.matricula}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-dark-300">
                        {proximoMantenimiento}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getEstadoDot(vehiculo.estado)}`}></span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(vehiculo.estado)}`}>
                            {vehiculo.estadoTexto}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(vehiculo)}
                            className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
                            title="Ver detalles"
                            aria-label="Ver detalles del vehículo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(vehiculo)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Editar"
                            aria-label="Editar vehículo"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(vehiculo.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar"
                            aria-label="Eliminar vehículo"
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
      {vehiculosFiltrados.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-gray-600 dark:text-dark-400 text-sm">
              Mostrando {startIndex}–{endIndex} de {vehiculosFiltrados.length}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-gray-600 dark:text-dark-400 text-sm">
                Mostrar:
              </label>
              <CustomSelect
                options={[
                  { value: '10', label: '10' },
                  { value: '20', label: '20' },
                  { value: '50', label: '50' },
                ]}
                value={pageSize.toString()}
                onChange={(value) => {
                  setPageSize(parseInt(value))
                  setCurrentPage(1)
                }}
                placeholder="10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-dark-800 text-gray-400 dark:text-dark-500 cursor-not-allowed'
                  : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-dark-700 border border-gray-300 dark:border-transparent'
              }`}
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary-500 text-white'
                        : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 border border-gray-300 dark:border-transparent'
                    }`}
                    aria-label={`Ir a página ${pageNum}`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-dark-800 text-gray-400 dark:text-dark-500 cursor-not-allowed'
                  : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-dark-700 border border-gray-300 dark:border-transparent'
              }`}
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Add */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setVehiculoSeleccionado(null)
          setMatriculaError('')
          setFieldErrors({})
          setDuplicateError('')
        }}
        title="Añadir Vehículo"
        size="lg"
      >
        {renderForm(false)}
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="Eliminar vehículo"
        description="¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer."
        confirmLabel="Eliminar vehículo"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId !== null) {
            const resultado = deleteVehiculo(deleteConfirmId)
            if (resultado) {
              showToast('Vehículo eliminado correctamente', 'success')
            } else {
              showToast('Error al eliminar el vehículo', 'error')
            }
          }
          setDeleteConfirmId(null)
        }}
      />
    </div>
  )
}
