import { CheckCircle2, Clock, AlertTriangle, DollarSign, ArrowRight, Plus, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { vehiculosService } from '../services/vehiculos.service'
import { formatCurrency } from '../utils/currency'

export default function Dashboard() {
  const navigate = useNavigate()
  const { vehiculos, mantenimientos } = useApp()
  const { showToast } = useToast()

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Calcular métricas reales
  const operativos = vehiculos.filter(v => v.estado === 'al-dia').length
  const proximos = mantenimientos.filter(m => m.estado === 'proximo').length
  const vencidos = mantenimientos.filter(m => m.estado === 'vencido').length
  
  const hoy = new Date()
  const costoMes = mantenimientos
    .filter(m => {
      if (!m.fechaVencimiento) return false
      const fecha = new Date(m.fechaVencimiento)
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
    })
    .reduce((sum, m) => sum + (m.costo || 0), 0)

  // Generar alertas desde mantenimientos reales
  const alerts = mantenimientos
    .filter(m => m.estado === 'vencido' || m.estado === 'proximo')
    .slice(0, 4)
    .map(m => {
      const vehiculo = vehiculosService.getById(m.vehiculoId)
      if (!vehiculo) return null

      const diffTime = m.fechaVencimiento ? new Date(m.fechaVencimiento).getTime() - new Date().getTime() : 0
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      let tag = ''
      let tagColor = ''
      if (m.estado === 'vencido') {
        tag = 'Vencido'
        tagColor = 'bg-red-500/20 text-red-400'
      } else if (diffDays <= 7) {
        tag = diffDays === 0 ? 'Hoy' : `En ${diffDays} días`
        tagColor = 'bg-orange-500/20 text-orange-400'
      } else {
        tag = `En ${Math.ceil(diffDays / 7)} semanas`
        tagColor = 'bg-orange-500/20 text-orange-400'
      }

      return {
        id: m.id,
        type: m.estado === 'vencido' ? 'vencido' : 'proximo',
        icon: m.estado === 'vencido' ? AlertTriangle : Clock,
        title: `${m.tipo} - ${vehiculo.modelo}`,
        tag,
        tagColor,
        details: `Matrícula: ${vehiculo.matricula}${m.odometro ? ` • ${m.odometro.toLocaleString('es-ES')} km` : ''}`,
        mantenimiento: m,
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

  const handleAlertClick = (alert: any) => {
    navigate('/mantenimientos')
    showToast(`Navegando a mantenimiento: ${alert.title}`, 'info')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Resumen de Flota</h1>
          <p className="text-gray-600 dark:text-dark-400">{today}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => showToast('Filtros próximamente disponibles', 'info')}
            className="px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-gray-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-dark-600 transition-colors flex items-center gap-2 shadow-sm dark:shadow-none"
            aria-label="Filtrar"
          >
            <span>Filtrar</span>
          </button>
          <button 
            onClick={handleRegistrarVehiculo}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
            aria-label="Registrar nuevo vehículo"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Vehículo</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Operativos */}
        <div 
          onClick={() => navigate('/vehiculos?filtro=al-dia')}
          className="bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-950 border border-gray-200 dark:border-green-500/20 rounded-xl p-6 shadow-md dark:shadow-lg dark:shadow-green-500/5 hover:shadow-lg dark:hover:shadow-green-500/10 transition-all cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate('/vehiculos?filtro=al-dia')
            }
          }}
          aria-label={`${operativos} vehículos operativos. Click para ver detalles`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-dark-300 text-xs font-semibold uppercase tracking-wider mb-2">OPERATIVOS</p>
              <p className="text-4xl font-bold text-dark-900 dark:text-white mb-1">{operativos}</p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-dark-400 text-sm font-medium">Vehículos al día</p>
        </div>

        {/* Atención */}
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
              <p className="text-gray-600 dark:text-dark-300 text-xs font-semibold uppercase tracking-wider mb-2">ATENCIÓN</p>
              <p className="text-4xl font-bold text-dark-900 dark:text-white mb-1">{proximos}</p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500/30 to-orange-600/20 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Clock className="w-10 h-10 text-orange-500 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-dark-400 text-sm font-medium">Próximos mantenimientos</p>
        </div>

        {/* Crítico */}
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
              <p className="text-gray-600 dark:text-dark-300 text-xs font-semibold uppercase tracking-wider mb-2">CRÍTICO</p>
              <p className="text-4xl font-bold text-dark-900 dark:text-white mb-1">{vencidos}</p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/30 to-red-600/20 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-dark-400 text-sm font-medium">Mantenimientos vencidos</p>
        </div>

        {/* Finanzas */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-950 border border-gray-200 dark:border-blue-500/20 rounded-xl p-6 shadow-md dark:shadow-lg dark:shadow-blue-500/5 hover:shadow-blue-500/10 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-dark-300 text-xs font-semibold uppercase tracking-wider mb-2">FINANZAS</p>
              <p className="text-4xl font-bold text-dark-900 dark:text-white mb-1">{formatCurrency(costoMes)}</p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <DollarSign className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-dark-400 text-sm font-medium">Coste este mes</p>
        </div>
      </div>

      {/* Quick Alerts */}
      <div className="bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl p-6 shadow-md dark:shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Vista rápida de alertas</h2>
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
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-dark-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay alertas pendientes</p>
              <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">Todos los mantenimientos están al día</p>
            </div>
          ) : (
            alerts.map((alert: any) => {
              const Icon = alert.icon
              return (
                <div
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-800/50 border border-gray-200 dark:border-dark-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 hover:border-gray-300 dark:hover:border-dark-600 transition-all cursor-pointer shadow-sm"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleAlertClick(alert)
                    }
                  }}
                  aria-label={`Alerta: ${alert.title}`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md ${
                    alert.type === 'vencido' ? 'bg-gradient-to-br from-red-500/30 to-red-600/20 border border-red-500/30' :
                    alert.type === 'proximo' ? 'bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/30' :
                    'bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/30'
                  }`}>
                    <Icon className={`w-7 h-7 ${
                      alert.type === 'vencido' ? 'text-red-400' :
                      alert.type === 'proximo' ? 'text-orange-400' :
                      'text-blue-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-dark-900 dark:text-white font-semibold">{alert.title}</h3>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${alert.tagColor} border ${
                        alert.type === 'vencido' ? 'border-red-500/30' :
                        alert.type === 'proximo' ? 'border-orange-500/30' :
                        'border-blue-500/30'
                      }`}>
                        {alert.tag}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-dark-300 text-sm">{alert.details}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 dark:text-dark-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors" />
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
