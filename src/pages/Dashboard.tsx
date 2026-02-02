import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, AlertTriangle, DollarSign, ArrowRight, Plus, X, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { vehiculosService } from '../services/vehiculos.service'
import { formatCurrency } from '../utils/currency'

const ONBOARDING_STORAGE_KEY = 'autolytix_demo_onboarding_seen'

export default function Dashboard() {
  const navigate = useNavigate()
  const { vehiculos, mantenimientos } = useApp()
  const { showToast } = useToast()
  const [showOnboarding, setShowOnboarding] = useState(true)

  useEffect(() => {
    try {
      if (localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true') {
        setShowOnboarding(false)
      }
    } catch {
      // mantener visible si falla localStorage
    }
  }, [])

  const handleCloseOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    } catch {
      // ignore
    }
    setShowOnboarding(false)
  }

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Calcular métricas reales según V1
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const añoActual = hoy.getFullYear()
  
  // Mantenimientos vencidos
  const vencidos = mantenimientos.filter(m => m.estado === 'vencido').length
  
  // Próximos: dentro de 30 días o 1000 km
  const proximos = mantenimientos.filter(m => {
    if (m.estado !== 'proximo') return false
    if (m.fechaVencimiento) {
      const fecha = new Date(m.fechaVencimiento)
      fecha.setHours(0, 0, 0, 0)
      const diffTime = fecha.getTime() - hoy.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 30
    }
    if (m.odometro !== undefined) {
      const vehiculo = vehiculosService.getById(m.vehiculoId)
      if (vehiculo?.kilometrajeActual !== undefined) {
        const diff = m.odometro - vehiculo.kilometrajeActual
        return diff >= 0 && diff <= 1000
      }
    }
    return false
  }).length
  
  // Coste del año (mantenimiento)
  const costoAnual = mantenimientos
    .filter(m => {
      if (!m.fechaVencimiento || !m.costo) return false
      const fecha = new Date(m.fechaVencimiento)
      return fecha.getFullYear() === añoActual
    })
    .reduce((sum, m) => sum + (m.costo || 0), 0)

  // Generar urgencias: mantenimientos vencidos y próximos (30 días / 1000 km)
  const urgencias = mantenimientos
    .filter(m => {
      if (m.estado === 'vencido') return true
      if (m.estado === 'proximo') {
        if (m.fechaVencimiento) {
          const fecha = new Date(m.fechaVencimiento)
          fecha.setHours(0, 0, 0, 0)
          const diffTime = fecha.getTime() - hoy.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return diffDays >= 0 && diffDays <= 30
        }
        if (m.odometro !== undefined) {
          const vehiculo = vehiculosService.getById(m.vehiculoId)
          if (vehiculo?.kilometrajeActual !== undefined) {
            const diff = m.odometro - vehiculo.kilometrajeActual
            return diff >= 0 && diff <= 1000
          }
        }
      }
      return false
    })
    .slice(0, 10)
    .map(m => {
      const vehiculo = vehiculosService.getById(m.vehiculoId)
      if (!vehiculo) return null

      let motivo = ''
      if (m.estado === 'vencido') {
        if (m.fechaVencimiento) {
          const fecha = new Date(m.fechaVencimiento)
          fecha.setHours(0, 0, 0, 0)
          const diffTime = hoy.getTime() - fecha.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          motivo = `Vencido por fecha (hace ${diffDays} días)`
        } else if (m.odometro !== undefined && vehiculo.kilometrajeActual !== undefined) {
          const diff = vehiculo.kilometrajeActual - m.odometro
          motivo = `Vencido por km (${diff.toLocaleString()} km pasado)`
        } else {
          motivo = 'Vencido'
        }
      } else {
        if (m.fechaVencimiento) {
          const fecha = new Date(m.fechaVencimiento)
          fecha.setHours(0, 0, 0, 0)
          const diffTime = fecha.getTime() - hoy.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          motivo = `Próximo por fecha (en ${diffDays} días)`
        } else if (m.odometro !== undefined && vehiculo.kilometrajeActual !== undefined) {
          const diff = m.odometro - vehiculo.kilometrajeActual
          motivo = `Próximo por km (faltan ${diff.toLocaleString()} km)`
        } else {
          motivo = 'Próximo'
        }
      }

      return {
        id: m.id,
        tipo: m.estado === 'vencido' ? 'vencido' : 'proximo',
        icon: m.estado === 'vencido' ? AlertTriangle : Clock,
        mantenimiento: m.tipo,
        vehiculo: vehiculo.modelo,
        matricula: vehiculo.matricula,
        motivo,
      }
    })
    .filter(Boolean)

  const handleRegistrarVehiculo = () => {
    navigate('/vehiculos')
    showToast('Redirigiendo a vehículos...', 'info')
  }

  const handleVerTodo = () => {
    navigate('/mantenimientos')
  }

  const handleUrgenciaClick = (urgencia: any) => {
    navigate(`/mantenimientos/${urgencia.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Resumen de Flota</h1>
          <p className="text-gray-600 dark:text-dark-400">{today}</p>
        </div>
        <button 
          onClick={handleRegistrarVehiculo}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
          aria-label="Registrar nuevo vehículo"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar vehículo</span>
        </button>
      </div>

      {/* Onboarding: card informativa (solo si no se ha cerrado antes) */}
      {showOnboarding && (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-5 shadow-sm dark:shadow-none relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-primary-500 dark:text-primary-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-1">Qué puedes hacer en esta demo</h2>
                <p className="text-gray-600 dark:text-dark-400 text-sm mb-3">
                  Esta demo muestra cómo AutoLytix te ayuda a gestionar vehículos, mantenimientos y costes.
                </p>
                <ul className="text-sm text-gray-600 dark:text-dark-400 space-y-1 list-disc list-inside">
                  <li>Gestionar tu flota de vehículos.</li>
                  <li>Registrar y consultar mantenimientos.</li>
                  <li>Visualizar mantenimientos en el calendario.</li>
                  <li>Analizar costes y tendencias con gráficas.</li>
                  <li>Recibir recomendaciones orientativas basadas en los datos.</li>
                </ul>
                <button
                  type="button"
                  onClick={handleCloseOnboarding}
                  className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                  aria-label="Entendido, ocultar"
                >
                  Entendido
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseOnboarding}
              className="flex-shrink-0 p-2 text-gray-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
              aria-label="Ocultar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Vencidos */}
        <div 
          onClick={() => navigate('/mantenimientos?tab=vencidos')}
          className="bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-950 border border-gray-200 dark:border-red-500/20 rounded-xl p-6 shadow-md dark:shadow-lg dark:shadow-red-500/5 hover:shadow-lg dark:hover:shadow-red-500/10 transition-all cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate('/mantenimientos?tab=vencidos')
            }
          }}
          aria-label={`${vencidos} mantenimientos vencidos. Click para ver detalles`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-dark-300 text-xs font-semibold uppercase tracking-wider mb-2">VENCIDOS</p>
              <p className="text-4xl font-bold text-dark-900 dark:text-white mb-1">{vencidos}</p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/30 to-red-600/20 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-dark-400 text-sm font-medium">Mantenimientos vencidos</p>
        </div>

        {/* Próximos */}
        <div 
          onClick={() => navigate('/mantenimientos?tab=proximos')}
          className="bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-950 border border-gray-200 dark:border-orange-500/20 rounded-xl p-6 shadow-md dark:shadow-lg dark:shadow-orange-500/5 hover:shadow-lg dark:hover:shadow-orange-500/10 transition-all cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate('/mantenimientos?tab=proximos')
            }
          }}
          aria-label={`${proximos} mantenimientos próximos. Click para ver detalles`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-dark-300 text-xs font-semibold uppercase tracking-wider mb-2">PRÓXIMOS</p>
              <p className="text-4xl font-bold text-dark-900 dark:text-white mb-1">{proximos}</p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500/30 to-orange-600/20 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Clock className="w-10 h-10 text-orange-500 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-dark-400 text-sm font-medium">Próximos (30 días / 1000 km)</p>
        </div>

        {/* Coste del año */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-950 border border-gray-200 dark:border-blue-500/20 rounded-xl p-6 shadow-md dark:shadow-lg dark:shadow-blue-500/5 hover:shadow-blue-500/10 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-dark-300 text-xs font-semibold uppercase tracking-wider mb-2">COSTE DEL AÑO</p>
              <p className="text-4xl font-bold text-dark-900 dark:text-white mb-1">{formatCurrency(costoAnual)}</p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <DollarSign className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-dark-400 text-sm font-medium">Mantenimiento {añoActual}</p>
        </div>
      </div>

      {/* Urgencias */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl p-6 shadow-md dark:shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Urgencias</h2>
          <button 
            onClick={handleVerTodo}
            className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-sm flex items-center gap-1 font-medium"
            aria-label="Ver todos los mantenimientos"
          >
            Ver todo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {urgencias.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-dark-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay urgencias pendientes</p>
              <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">Todos los mantenimientos están al día</p>
            </div>
          ) : (
            urgencias.map((urgencia: any) => {
              const Icon = urgencia.icon
              return (
                <div
                  key={urgencia.id}
                  onClick={() => handleUrgenciaClick(urgencia)}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-800/50 border border-gray-200 dark:border-dark-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 hover:border-gray-300 dark:hover:border-dark-600 transition-all cursor-pointer shadow-sm"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleUrgenciaClick(urgencia)
                    }
                  }}
                  aria-label={`Urgencia: ${urgencia.mantenimiento} - ${urgencia.vehiculo}`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md ${
                    urgencia.tipo === 'vencido' ? 'bg-gradient-to-br from-red-500/30 to-red-600/20 border border-red-500/30' :
                    'bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/30'
                  }`}>
                    <Icon className={`w-7 h-7 ${
                      urgencia.tipo === 'vencido' ? 'text-red-400' : 'text-orange-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-dark-900 dark:text-white font-semibold">{urgencia.mantenimiento}</h3>
                      <span className="text-gray-500 dark:text-dark-400 text-sm">•</span>
                      <span className="text-gray-600 dark:text-dark-400 text-sm">{urgencia.vehiculo}</span>
                    </div>
                    <p className="text-gray-600 dark:text-dark-400 text-sm mb-1">Matrícula: {urgencia.matricula}</p>
                    <p className="text-gray-500 dark:text-dark-500 text-xs">{urgencia.motivo}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUrgenciaClick(urgencia)
                    }}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    Ver
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
