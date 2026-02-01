import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Search, ChevronLeft, ChevronRight, CheckCircle2, Filter, Eye, Edit, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { vehiculosService } from '../services/vehiculos.service'
import { TareaCalendario } from '../services/calendario.service'
import { TIPOS_MANTENIMIENTO } from '../constants/tiposMantenimiento'
import { formatNumber } from '../utils/currency'
import Modal from '../components/Modal'
import CustomSelect from '../components/CustomSelect'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Calendario() {
  const { tareasCalendario, addTareaCalendario, updateTareaCalendario, deleteTareaCalendario } = useApp()
  const { showToast } = useToast()
  
  const [fechaActual, setFechaActual] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaCalendario | null>(null)
  const [filtroVehiculo, setFiltroVehiculo] = useState<string>('')
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [busqueda, setBusqueda] = useState('')
  const [formData, setFormData] = useState({
    vehiculoId: '',
    tipo: '',
    fecha: '',
    odometro: '',
  })
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const hoy = useMemo(() => new Date(), [])
  const mesActual = fechaActual.getMonth()
  const añoActual = fechaActual.getFullYear()

  const primerDiaMes = new Date(añoActual, mesActual, 1)
  const ultimoDiaMes = new Date(añoActual, mesActual + 1, 0)
  const primerDiaSemana = primerDiaMes.getDay() === 0 ? 6 : primerDiaMes.getDay() - 1

  const diasMes = Array.from({ length: ultimoDiaMes.getDate() }, (_, i) => i + 1)
  const diasVacios = Array.from({ length: primerDiaSemana }, (_, i) => i)

  const handleAdd = useCallback((fechaPrellenada?: string) => {
    setFormData({
      vehiculoId: '',
      tipo: '',
      fecha: fechaPrellenada || '',
      odometro: '',
    })
    setTareaSeleccionada(null)
    setIsModalOpen(true)
  }, [])

  const handleEdit = useCallback((tarea: TareaCalendario) => {
    setTareaSeleccionada(tarea)
    setFormData({
      vehiculoId: tarea.vehiculoId.toString(),
      tipo: tarea.tipo,
      fecha: new Date(tarea.fecha).toISOString().split('T')[0],
      odometro: tarea.odometro?.toString() || '',
    })
    setIsDetailModalOpen(false)
    setIsEditModalOpen(true)
  }, [])

  const handleView = useCallback((tarea: TareaCalendario) => {
    setTareaSeleccionada(tarea)
    setIsDetailModalOpen(true)
  }, [])

  const handleDelete = useCallback((id: number) => {
    setDeleteConfirmId(id)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const vehiculo = vehiculosService.getById(parseInt(formData.vehiculoId))
    if (!vehiculo) {
      showToast('Por favor, selecciona un vehículo', 'error')
      return
    }

    const tareaData = {
      vehiculoId: parseInt(formData.vehiculoId),
      vehiculo: vehiculo.modelo,
      tipo: formData.tipo,
      fecha: new Date(formData.fecha),
      odometro: formData.odometro ? parseInt(formData.odometro) : undefined,
      estado: 'proximo' as const,
    }

    if (tareaSeleccionada) {
      if (updateTareaCalendario(tareaSeleccionada.id, tareaData)) {
        showToast('Tarea actualizada correctamente', 'success')
      } else {
        showToast('Error al actualizar la tarea', 'error')
      }
    } else {
      addTareaCalendario(tareaData)
      showToast('Tarea creada correctamente', 'success')
    }

    setIsModalOpen(false)
    setIsEditModalOpen(false)
    setTareaSeleccionada(null)
    setFormData({
      vehiculoId: '',
      tipo: '',
      fecha: '',
      odometro: '',
    })
  }

  const tareasFiltradas = useMemo(() => {
    return tareasCalendario.filter(t => {
      if (filtroVehiculo && t.vehiculoId.toString() !== filtroVehiculo) return false
      if (filtroTipo && t.tipo !== filtroTipo) return false
      if (busqueda) {
        const vehiculo = vehiculosService.getById(t.vehiculoId)
        const search = busqueda.toLowerCase()
        return (
          vehiculo?.modelo.toLowerCase().includes(search) ||
          vehiculo?.matricula.toLowerCase().includes(search) ||
          t.tipo.toLowerCase().includes(search)
        )
      }
      return true
    })
  }, [tareasCalendario, filtroVehiculo, filtroTipo, busqueda])

  const getTareasDia = useCallback((dia: number) => {
    return tareasFiltradas.filter(t => {
      const fechaTarea = new Date(t.fecha)
      return fechaTarea.getDate() === dia &&
        fechaTarea.getMonth() === mesActual &&
        fechaTarea.getFullYear() === añoActual
    })
  }, [tareasFiltradas, mesActual, añoActual])

  const getTipoColor = (tipo: string) => {
    if (tipo.includes('ITV') || tipo.includes('Seguro')) return 'border-l-red-500'
    if (tipo.includes('aceite') || tipo.includes('filtro')) return 'border-l-orange-500'
    return 'border-l-blue-500'
  }

  const esHoy = useCallback((dia: number) => {
    return hoy.getDate() === dia &&
      hoy.getMonth() === mesActual &&
      hoy.getFullYear() === añoActual
  }, [hoy, mesActual, añoActual])

  const cambiarMes = (direccion: number) => {
    setFechaActual(new Date(añoActual, mesActual + direccion, 1))
  }

  const irAHoy = () => {
    setFechaActual(new Date())
  }

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const nombresDias = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

  // Calcular "Esta Semana": desde hoy hasta +7 días
  const inicioSemana = useMemo(() => {
    const fecha = new Date(hoy)
    fecha.setHours(0, 0, 0, 0)
    return fecha
  }, [hoy])

  const finSemana = useMemo(() => {
    const fecha = new Date(hoy)
    fecha.setDate(fecha.getDate() + 7)
    fecha.setHours(23, 59, 59, 999)
    return fecha
  }, [hoy])

  const tareasEstaSemana = useMemo(() => {
    return tareasFiltradas.filter(tarea => {
      const fechaTarea = new Date(tarea.fecha)
      return fechaTarea >= inicioSemana && fechaTarea <= finSemana
    }).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
  }, [tareasFiltradas, inicioSemana, finSemana])

  const vehiculos = vehiculosService.getAll()

  const handleDiaClick = (dia: number) => {
    const fechaSeleccionada = new Date(añoActual, mesActual, dia)
    const fechaISO = fechaSeleccionada.toISOString().split('T')[0]
    handleAdd(fechaISO)
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Calendario de Mantenimiento</h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-dark-400" />
              <input
                type="text"
                placeholder="Buscar tareas o vehículos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="bg-white dark:bg-dark-900 border border-gray-300 dark:border-dark-800 rounded-lg pl-10 pr-4 py-2 text-dark-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm dark:shadow-none"
                aria-label="Buscar tareas"
              />
            </div>
            <button
              onClick={() => handleAdd()}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
              aria-label="Nueva tarea"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Tarea</span>
            </button>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => cambiarMes(-1)}
              className="p-2 text-gray-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors"
              title="Mes anterior"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-dark-900 dark:text-white">
              {nombresMeses[mesActual]} {añoActual}
            </h2>
            <button
              onClick={() => cambiarMes(1)}
              className="p-2 text-gray-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors"
              title="Mes siguiente"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={irAHoy}
              className="px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-gray-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white transition-colors shadow-sm dark:shadow-none"
              aria-label="Ir a hoy"
            >
              Hoy
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none lg:w-56 min-w-[200px]">
              <CustomSelect
                options={[
                  { value: '', label: 'Todos los vehículos' },
                  ...vehiculos.map((v) => ({
                    value: v.id.toString(),
                    label: `${v.modelo} · ${v.matricula}`,
                  })),
                ]}
                value={filtroVehiculo}
                onChange={(value) => setFiltroVehiculo(value)}
                placeholder="Filtrar por vehículos"
                leadingIcon={<Filter className="w-4 h-4" />}
                helperText="Filtra las tareas por vehículo"
              />
            </div>
            <div className="flex-1 lg:flex-none lg:w-64 min-w-[200px]">
              <CustomSelect
                options={[
                  { value: '', label: 'Todos los tipos de mantenimiento' },
                  ...TIPOS_MANTENIMIENTO.map((tipo) => ({
                    value: tipo,
                    label: tipo,
                  })),
                ]}
                value={filtroTipo}
                onChange={(value) => setFiltroTipo(value)}
                placeholder="Todos los tipos de mantenimiento"
              />
            </div>
            {(filtroVehiculo || filtroTipo) && (
              <button
                onClick={() => {
                  setFiltroVehiculo('')
                  setFiltroTipo('')
                }}
                className="px-3 py-2 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-dark-900 dark:text-white rounded-lg text-sm transition-colors whitespace-nowrap"
                title="Limpiar filtros"
                aria-label="Limpiar filtros"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          {/* Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {nombresDias.map((dia) => (
              <div key={dia} className="text-center text-gray-600 dark:text-dark-400 text-sm font-medium py-2">
                {dia}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {diasVacios.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}
            {diasMes.map((dia) => {
              const tareasDia = getTareasDia(dia)
              const esHoyDia = esHoy(dia)
              return (
                <div
                  key={dia}
                  className={`aspect-square border rounded-lg p-2 ${
                    esHoyDia
                      ? 'bg-primary-500/10 border-primary-500 border'
                      : 'bg-gray-50 dark:bg-dark-800 border-gray-200 dark:border-dark-800'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${esHoyDia ? 'text-primary-500 dark:text-primary-400' : 'text-dark-900 dark:text-white'}`}>
                    {dia}
                  </div>
                  <div className="space-y-1">
                    {tareasDia.slice(0, 2).map((tarea) => (
                      <div
                        key={tarea.id}
                        onClick={() => handleView(tarea)}
                        className={`text-xs p-1 rounded border-l-2 ${getTipoColor(tarea.tipo)} bg-white dark:bg-dark-900 text-dark-900 dark:text-white truncate cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors border border-gray-100 dark:border-transparent`}
                        title={`${tarea.vehiculo} · ${tarea.tipo}`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleView(tarea)
                          }
                        }}
                      >
                        {tarea.vehiculo} · {tarea.tipo}
                      </div>
                    ))}
                    {tareasDia.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-dark-400">
                        +{tareasDia.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sidebar - This Week */}
      <div className="w-80 bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
          Esta Semana
          {tareasEstaSemana.length > 0 && (
            <span className="ml-2 text-sm text-gray-500 dark:text-dark-400">({tareasEstaSemana.length} pendientes)</span>
          )}
        </h2>
        <div className="space-y-4">
          {tareasEstaSemana.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-dark-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay tareas para esta semana</p>
            </div>
          ) : (
            tareasEstaSemana.map((tarea) => {
              const diffTime = new Date(tarea.fecha).getTime() - hoy.getTime()
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              const esVencida = diffDays < 0
              const esHoy = diffDays === 0
              const esManana = diffDays === 1

              let etiqueta = ''
              let etiquetaColor = ''
              if (esVencida) {
                etiqueta = 'VENCIDA'
                etiquetaColor = 'text-red-400'
              } else if (esHoy) {
                etiqueta = 'HOY'
                etiquetaColor = 'text-blue-400'
              } else if (esManana) {
                etiqueta = 'MAÑANA'
                etiquetaColor = 'text-orange-400'
              }

              return (
                <div
                  key={tarea.id}
                  onClick={() => handleView(tarea)}
                  className={`p-4 rounded-lg border-l-4 ${getTipoColor(tarea.tipo)} bg-gray-50 dark:bg-dark-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors border border-gray-100 dark:border-transparent`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleView(tarea)
                    }
                  }}
                >
                  {etiqueta && (
                    <div className={`text-xs font-semibold mb-2 ${etiquetaColor}`}>
                      {etiqueta} • {new Date(tarea.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  <div className="text-dark-900 dark:text-white font-medium mb-1">{tarea.vehiculo}</div>
                  <div className="text-gray-600 dark:text-dark-400 text-sm mb-1">{tarea.tipo}</div>
                  {tarea.odometro && (
                    <div className="text-gray-500 dark:text-dark-400 text-xs mb-3">{formatNumber(tarea.odometro)} km</div>
                  )}
                </div>
              )
            })
          )}
        </div>
        {tareasEstaSemana.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-800 text-center">
            <button
              onClick={() => {
                const proximaSemana = new Date(hoy)
                proximaSemana.setDate(proximaSemana.getDate() + 7)
                setFechaActual(proximaSemana)
              }}
              className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-sm"
            >
              Ver próxima semana →
            </button>
          </div>
        )}
      </div>

      {/* Modal Nueva Tarea */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setFormData({
            vehiculoId: '',
            tipo: '',
            fecha: '',
            odometro: '',
          })
        }}
        title="Nueva Tarea"
        size="md"
      >
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
              onChange={(value) => setFormData({ ...formData, vehiculoId: value })}
              placeholder="Seleccionar vehículo..."
            />
          </div>
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Tipo de Mantenimiento <span className="text-red-400">*</span>
            </label>
            <CustomSelect
              options={TIPOS_MANTENIMIENTO.map((tipo) => ({
                value: tipo,
                label: tipo,
              }))}
              value={formData.tipo}
              onChange={(value) => setFormData({ ...formData, tipo: value })}
              placeholder="Seleccionar tipo..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Fecha <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                id="fecha"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Fecha de la tarea"
              />
            </div>
            <div>
              <label htmlFor="odometro" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Kilometraje (km)
              </label>
              <input
                type="number"
                id="odometro"
                min="0"
                value={formData.odometro}
                onChange={(e) => setFormData({ ...formData, odometro: e.target.value })}
                className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Opcional"
                aria-label="Kilometraje"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                setFormData({
                  vehiculoId: '',
                  tipo: '',
                  fecha: '',
                  odometro: '',
                })
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Tarea */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setTareaSeleccionada(null)
        }}
        title="Editar Tarea"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-vehiculo" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Vehículo <span className="text-red-400">*</span>
            </label>
            <CustomSelect
              options={vehiculos.map((v) => ({
                value: v.id.toString(),
                label: `${v.modelo} - ${v.matricula}`,
              }))}
              value={formData.vehiculoId}
              onChange={(value) => setFormData({ ...formData, vehiculoId: value })}
              placeholder="Seleccionar vehículo..."
            />
          </div>
          <div>
            <label htmlFor="edit-tipo" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
              Tipo de Mantenimiento <span className="text-red-400">*</span>
            </label>
            <CustomSelect
              options={TIPOS_MANTENIMIENTO.map((tipo) => ({
                value: tipo,
                label: tipo,
              }))}
              value={formData.tipo}
              onChange={(value) => setFormData({ ...formData, tipo: value })}
              placeholder="Seleccionar tipo..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-fecha" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Fecha <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                id="edit-fecha"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Fecha de la tarea"
              />
            </div>
            <div>
              <label htmlFor="edit-odometro" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Kilometraje (km)
              </label>
              <input
                type="number"
                id="edit-odometro"
                min="0"
                value={formData.odometro}
                onChange={(e) => setFormData({ ...formData, odometro: e.target.value })}
                className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Opcional"
                aria-label="Kilometraje"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false)
                setTareaSeleccionada(null)
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle Tarea */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setTareaSeleccionada(null)
        }}
        title="Detalles de Tarea"
        size="md"
      >
        {tareaSeleccionada && (() => {
          const vehiculo = vehiculosService.getById(tareaSeleccionada.vehiculoId)
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Vehículo</label>
                <p className="text-dark-900 dark:text-white">{vehiculo?.modelo || 'N/A'}</p>
                <p className="text-gray-600 dark:text-dark-400 text-sm">Matrícula: {vehiculo?.matricula || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Tipo de Mantenimiento</label>
                <p className="text-dark-900 dark:text-white">{tareaSeleccionada.tipo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Fecha</label>
                <p className="text-dark-900 dark:text-white">
                  {new Date(tareaSeleccionada.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              {tareaSeleccionada.odometro && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">Kilometraje</label>
                  <p className="text-dark-900 dark:text-white">{formatNumber(tareaSeleccionada.odometro)} km</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => handleDelete(tareaSeleccionada.id)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => handleEdit(tareaSeleccionada)}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Editar
                </button>
              </div>
            </div>
          )
        })()}
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="Eliminar tarea"
        description="¿Estás seguro de que deseas eliminar esta tarea del calendario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar tarea"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId !== null) {
            const resultado = deleteTareaCalendario(deleteConfirmId)
            if (resultado) {
              showToast('Tarea eliminada correctamente', 'success')
              setIsDetailModalOpen(false)
            } else {
              showToast('Error al eliminar la tarea', 'error')
            }
          }
          setDeleteConfirmId(null)
        }}
      />
    </div>
  )
}
