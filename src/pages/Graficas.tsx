import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'
import { TrendingUp, DollarSign, Calendar, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { mantenimientosService } from '../services/mantenimientos.service'
import { vehiculosService } from '../services/vehiculos.service'
import { formatCurrency, formatNumber } from '../utils/currency'
import CustomSelect from '../components/CustomSelect'

export default function Graficas() {
  const { vehiculos, mantenimientos } = useApp()
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<string>('')

  // Obtener mantenimientos del vehículo seleccionado o todos
  const mantenimientosFiltrados = useMemo(() => {
    if (!vehiculoSeleccionado) {
      return mantenimientos
    }
    return mantenimientos.filter(m => m.vehiculoId.toString() === vehiculoSeleccionado)
  }, [mantenimientos, vehiculoSeleccionado])

  // Calcular costes acumulados por año
  const datosCostesAcumulados = useMemo(() => {
    const hoy = new Date()
    const añoActual = hoy.getFullYear()
    const años: Record<number, number> = {}
    
    // Inicializar años desde el año del vehículo hasta hoy
    mantenimientosFiltrados.forEach(m => {
      if (m.costo && m.fechaVencimiento) {
        const año = new Date(m.fechaVencimiento).getFullYear()
        años[año] = (años[año] || 0) + m.costo
      }
    })

    // Si hay vehículo seleccionado, obtener su año de compra
    let añoInicio = añoActual - 5 // Por defecto últimos 5 años
    if (vehiculoSeleccionado) {
      const vehiculo = vehiculos.find(v => v.id.toString() === vehiculoSeleccionado)
      if (vehiculo) {
        añoInicio = vehiculo.año
      }
    }

    // Crear array de datos acumulados
    const datos: Array<{ año: string; coste: number; acumulado: number }> = []
    let acumulado = 0

    for (let año = añoInicio; año <= añoActual; año++) {
      const costeAño = años[año] || 0
      acumulado += costeAño
      datos.push({
        año: año.toString(),
        coste: costeAño,
        acumulado: acumulado
      })
    }

    return datos
  }, [mantenimientosFiltrados, vehiculoSeleccionado, vehiculos])

  // Calcular métricas
  const metricas = useMemo(() => {
    const totalGastado = mantenimientosFiltrados.reduce((sum, m) => sum + (m.costo || 0), 0)
    
    // Calcular gasto anual medio
    const añosConGastos = new Set<number>()
    mantenimientosFiltrados.forEach(m => {
      if (m.costo && m.fechaVencimiento) {
        añosConGastos.add(new Date(m.fechaVencimiento).getFullYear())
      }
    })
    const gastoAnualMedio = añosConGastos.size > 0 ? totalGastado / añosConGastos.size : 0

    // Calcular últimos 12 meses
    const hoy = new Date()
    const hace12Meses = new Date(hoy)
    hace12Meses.setMonth(hace12Meses.getMonth() - 12)
    
    const gastoUltimos12Meses = mantenimientosFiltrados
      .filter(m => {
        if (!m.costo || !m.fechaVencimiento) return false
        const fecha = new Date(m.fechaVencimiento)
        return fecha >= hace12Meses && fecha <= hoy
      })
      .reduce((sum, m) => sum + (m.costo || 0), 0)

    return {
      totalGastado,
      gastoAnualMedio,
      gastoUltimos12Meses,
      añosConGastos: añosConGastos.size
    }
  }, [mantenimientosFiltrados])

  // Estimación simple
  const estimacion = useMemo(() => {
    if (metricas.gastoAnualMedio === 0) {
      return null
    }

    const umbral = 10000 // €10,000 como ejemplo
    const añosParaSuperar = umbral / metricas.gastoAnualMedio

    return {
      años: Math.ceil(añosParaSuperar),
      umbral
    }
  }, [metricas.gastoAnualMedio])

  const vehiculoActual = vehiculoSeleccionado 
    ? vehiculos.find(v => v.id.toString() === vehiculoSeleccionado)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Análisis de Costes</h1>
          <p className="text-gray-600 dark:text-dark-400">
            Visualiza los costes acumulados y métricas de mantenimiento
          </p>
        </div>
      </div>

      {/* Selector de Vehículo */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-4 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-dark-300 whitespace-nowrap">
            Filtrar por vehículo:
          </label>
          <div className="flex-1 max-w-md">
            <CustomSelect
              options={[
                { value: '', label: 'Todos los vehículos' },
                ...vehiculos.map((v) => ({
                  value: v.id.toString(),
                  label: `${v.modelo} - ${v.matricula}`,
                })),
              ]}
              value={vehiculoSeleccionado}
              onChange={(value) => setVehiculoSeleccionado(value)}
              placeholder="Seleccionar vehículo..."
            />
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-dark-400 text-sm mb-1">TOTAL GASTADO</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white">{formatCurrency(metricas.totalGastado)}</p>
            </div>
            <div className="w-16 h-16 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-primary-500 dark:text-primary-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-dark-400 text-sm">
            {vehiculoActual ? `Desde ${vehiculoActual.año}` : 'Total acumulado'}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-dark-400 text-sm mb-1">GASTO ANUAL MEDIO</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white">{formatCurrency(metricas.gastoAnualMedio)}</p>
            </div>
            <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-dark-400 text-sm">
            {metricas.añosConGastos > 0 ? `Promedio de ${metricas.añosConGastos} años` : 'Sin datos suficientes'}
          </p>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-dark-400 text-sm mb-1">ÚLTIMOS 12 MESES</p>
              <p className="text-3xl font-bold text-dark-900 dark:text-white">{formatCurrency(metricas.gastoUltimos12Meses)}</p>
            </div>
            <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-8 h-8 text-green-500 dark:text-green-400" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-dark-400 text-sm">Gasto reciente</p>
        </div>
      </div>

      {/* Gráfica de Costes Acumulados */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
            Costes Acumulados {vehiculoActual ? `- ${vehiculoActual.modelo}` : ''}
          </h2>
          <p className="text-gray-600 dark:text-dark-400 text-sm">
            Evolución del gasto acumulado desde {datosCostesAcumulados[0]?.año || 'el inicio'}
          </p>
        </div>
        {datosCostesAcumulados.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={datosCostesAcumulados}>
              <defs>
                <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="año" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area
                type="monotone"
                dataKey="acumulado"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAcumulado)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-dark-500 opacity-50" />
              <p className="text-gray-600 dark:text-dark-400 text-sm">No hay datos de costes para mostrar</p>
            </div>
          </div>
        )}
      </div>

      {/* Gráfica de Costes por Año */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
            Costes por Año {vehiculoActual ? `- ${vehiculoActual.modelo}` : ''}
          </h2>
          <p className="text-gray-600 dark:text-dark-400 text-sm">
            Desglose del gasto anual
          </p>
        </div>
        {datosCostesAcumulados.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosCostesAcumulados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="año" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="coste" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-72 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-dark-500 opacity-50" />
              <p className="text-gray-600 dark:text-dark-400 text-sm">No hay datos de costes para mostrar</p>
            </div>
          </div>
        )}
      </div>

      {/* Estimación */}
      {estimacion && (
        <div className="bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-950 border border-gray-200 dark:border-orange-500/20 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-orange-500 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">Estimación de Costes</h3>
              <p className="text-gray-700 dark:text-dark-300">
                A este ritmo de gasto anual medio de <span className="text-dark-900 dark:text-white font-semibold">{formatCurrency(metricas.gastoAnualMedio)}</span>,
                en aproximadamente <span className="text-dark-900 dark:text-white font-semibold">{estimacion.años} años</span> el coste anual 
                superaría <span className="text-dark-900 dark:text-white font-semibold">{formatCurrency(estimacion.umbral)}</span>.
              </p>
              <p className="text-gray-600 dark:text-dark-400 text-sm mt-2">
                * Esta es una estimación simple basada en el promedio histórico. Los costes reales pueden variar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
