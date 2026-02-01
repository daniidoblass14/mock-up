import { useState, useMemo } from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp, DollarSign, AlertCircle, Truck, Info } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatCurrency } from '../utils/currency'
import { getRecomendacion, type NivelRecomendacion } from '../utils/recomendacion'
import CustomSelect from '../components/CustomSelect'

const AÑO_ACTUAL = new Date().getFullYear()
const AÑO_ANTERIOR = AÑO_ACTUAL - 1

function getBadgeClasses(nivel: NivelRecomendacion): string {
  switch (nivel) {
    case 'mantener':
      return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/40'
    case 'vigilar':
      return 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40'
    case 'valorar-cambio':
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
    case 'insuficientes':
      return 'bg-gray-200 dark:bg-dark-700 text-gray-600 dark:text-dark-400 border-gray-300 dark:border-dark-600'
    default:
      return 'bg-gray-200 dark:bg-dark-700 text-gray-600 dark:text-dark-400'
  }
}

function getBadgeLabel(nivel: NivelRecomendacion): string {
  switch (nivel) {
    case 'mantener':
      return 'Mantener'
    case 'vigilar':
      return 'Vigilar'
    case 'valorar-cambio':
      return 'Valorar cambio'
    case 'insuficientes':
      return 'Datos insuficientes'
    default:
      return nivel
  }
}

type TabGraficas = 'por-vehiculo' | 'flota'

export default function Graficas() {
  const { vehiculos, mantenimientos } = useApp()
  const [tabActivo, setTabActivo] = useState<TabGraficas>('por-vehiculo')
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<string>('')

  // ---- A) Resumen flota ----
  const resumenFlota = useMemo(() => {
    const totalFlota = mantenimientos.reduce((sum, m) => sum + (m.costo ?? 0), 0)
    const gastoAñoActual = mantenimientos
      .filter(m => m.fechaVencimiento && new Date(m.fechaVencimiento).getFullYear() === AÑO_ACTUAL)
      .reduce((sum, m) => sum + (m.costo ?? 0), 0)
    const gastoAñoAnterior = mantenimientos
      .filter(m => m.fechaVencimiento && new Date(m.fechaVencimiento).getFullYear() === AÑO_ANTERIOR)
      .reduce((sum, m) => sum + (m.costo ?? 0), 0)
    const variacion =
      gastoAñoAnterior > 0
        ? ((gastoAñoActual - gastoAñoAnterior) / gastoAñoAnterior) * 100
        : 0
    return {
      gastoTotalFlota: totalFlota,
      gastoAñoActual,
      gastoAñoAnterior,
      variacionPorcentaje: variacion,
      numVehiculos: vehiculos.length,
    }
  }, [mantenimientos, vehiculos.length])

  // ---- B) Análisis por vehículo: datos filtrados y acumulado ----
  const mantenimientosFiltrados = useMemo(() => {
    if (!vehiculoSeleccionado) return mantenimientos
    return mantenimientos.filter(m => m.vehiculoId.toString() === vehiculoSeleccionado)
  }, [mantenimientos, vehiculoSeleccionado])

  const datosCostesAcumulados = useMemo(() => {
    const años: Record<number, number> = {}
    mantenimientosFiltrados.forEach(m => {
      if (m.costo != null && m.fechaVencimiento) {
        const año = new Date(m.fechaVencimiento).getFullYear()
        años[año] = (años[año] ?? 0) + m.costo
      }
    })
    let añoInicio = AÑO_ACTUAL - 5
    if (vehiculoSeleccionado) {
      const v = vehiculos.find(x => x.id.toString() === vehiculoSeleccionado)
      if (v) añoInicio = v.año
    }
    const datos: Array<{ año: string; coste: number; acumulado: number }> = []
    let acumulado = 0
    for (let año = añoInicio; año <= AÑO_ACTUAL; año++) {
      const costeAño = años[año] ?? 0
      acumulado += costeAño
      datos.push({ año: año.toString(), coste: costeAño, acumulado })
    }
    return datos
  }, [mantenimientosFiltrados, vehiculoSeleccionado, vehiculos])

  const metricasVehiculo = useMemo(() => {
    const totalGastado = mantenimientosFiltrados.reduce((sum, m) => sum + (m.costo ?? 0), 0)
    const añosSet = new Set<number>()
    mantenimientosFiltrados.forEach(m => {
      if (m.costo != null && m.fechaVencimiento) {
        añosSet.add(new Date(m.fechaVencimiento).getFullYear())
      }
    })
    const añosConDatos = añosSet.size
    const gastoAnualMedio = añosConDatos > 0 ? totalGastado / añosConDatos : 0
    const hace12Meses = new Date()
    hace12Meses.setMonth(hace12Meses.getMonth() - 12)
    const gastoUltimos12Meses = mantenimientosFiltrados
      .filter(m => {
        if (m.costo == null || !m.fechaVencimiento) return false
        const f = new Date(m.fechaVencimiento)
        return f >= hace12Meses && f <= new Date()
      })
      .reduce((sum, m) => sum + (m.costo ?? 0), 0)
    return {
      totalGastado,
      gastoAnualMedio,
      gastoUltimos12Meses,
      añosConDatos,
    }
  }, [mantenimientosFiltrados])

  const vehiculoActual = vehiculoSeleccionado
    ? vehiculos.find(v => v.id.toString() === vehiculoSeleccionado)
    : null

  const recomendacion = useMemo(() => {
    if (!vehiculoActual) return null
    return getRecomendacion(vehiculoActual, mantenimientos)
  }, [vehiculoActual, mantenimientos])

  // ---- C) Vista global flota: gasto por años ----
  const datosGastoPorAños = useMemo(() => {
    const años: Record<number, number> = {}
    mantenimientos.forEach(m => {
      if (m.costo != null && m.fechaVencimiento) {
        const año = new Date(m.fechaVencimiento).getFullYear()
        años[año] = (años[año] ?? 0) + m.costo
      }
    })
    const minAño = Math.min(...Object.keys(años).map(Number), AÑO_ANTERIOR)
    const datos: Array<{ año: string; coste: number }> = []
    for (let año = minAño; año <= AÑO_ACTUAL; año++) {
      datos.push({ año: año.toString(), coste: años[año] ?? 0 })
    }
    return datos.sort((a, b) => parseInt(a.año, 10) - parseInt(b.año, 10))
  }, [mantenimientos])

  const tooltipStyle = {
    backgroundColor: 'var(--tw-bg-opacity, 1)',
    border: '1px solid rgb(55 65 81)',
    borderRadius: '8px',
    color: 'inherit',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Gráficas y Estadísticas</h1>
        <p className="text-gray-600 dark:text-dark-400">
          Resumen de la flota, análisis por vehículo y recomendaciones orientativas.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-700">
        <nav className="flex gap-1" aria-label="Secciones de gráficas">
          <button
            type="button"
            onClick={() => setTabActivo('por-vehiculo')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              tabActivo === 'por-vehiculo'
                ? 'bg-white dark:bg-dark-900 text-primary-600 dark:text-primary-400 border border-b-0 border-gray-200 dark:border-dark-700 -mb-px'
                : 'text-gray-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
            }`}
          >
            Por vehículo
          </button>
          <button
            type="button"
            onClick={() => setTabActivo('flota')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              tabActivo === 'flota'
                ? 'bg-white dark:bg-dark-900 text-primary-600 dark:text-primary-400 border border-b-0 border-gray-200 dark:border-dark-700 -mb-px'
                : 'text-gray-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
            }`}
          >
            Flota
          </button>
        </nav>
      </div>

      {/* Tab: Por vehículo */}
      {tabActivo === 'por-vehiculo' && (
      <>
      {/* B) Análisis por vehículo */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
        <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-4">Análisis por vehículo</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-dark-300 whitespace-nowrap sm:pt-2">
            Vehículo:
          </label>
          <div className="flex-1 max-w-md">
            <CustomSelect
              options={[
                { value: '', label: 'Seleccionar un vehículo...' },
                ...vehiculos.map(v => ({ value: v.id.toString(), label: `${v.modelo} - ${v.matricula}` })),
              ]}
              value={vehiculoSeleccionado}
              onChange={setVehiculoSeleccionado}
              placeholder="Seleccionar vehículo..."
            />
          </div>
        </div>

        {vehiculoActual ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
                <p className="text-gray-600 dark:text-dark-400 text-sm">Total gastado</p>
                <p className="text-xl font-bold text-dark-900 dark:text-white">{formatCurrency(metricasVehiculo.totalGastado)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
                <p className="text-gray-600 dark:text-dark-400 text-sm">Gasto anual medio</p>
                <p className="text-xl font-bold text-dark-900 dark:text-white">{formatCurrency(metricasVehiculo.gastoAnualMedio)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4">
                <p className="text-gray-600 dark:text-dark-400 text-sm">Últimos 12 meses</p>
                <p className="text-xl font-bold text-dark-900 dark:text-white">{formatCurrency(metricasVehiculo.gastoUltimos12Meses)}</p>
              </div>
            </div>

            {datosCostesAcumulados.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-dark-900 dark:text-white mb-2">Coste acumulado</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={datosCostesAcumulados}>
                    <defs>
                      <linearGradient id="colorAcumuladoGraficas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-dark-700" />
                    <XAxis dataKey="año" className="text-gray-600 dark:text-dark-400" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} className="text-gray-600 dark:text-dark-400" />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number | undefined) => (value != null ? formatCurrency(value) : '')} />
                    <Area type="monotone" dataKey="acumulado" stroke="#3b82f6" strokeWidth={2} fill="url(#colorAcumuladoGraficas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-dark-800 mb-6">
                <p className="text-gray-500 dark:text-dark-500 text-sm">No hay datos de costes para este vehículo.</p>
              </div>
            )}

            {/* Card recomendación */}
            {recomendacion && (
              <div className="border border-gray-200 dark:border-dark-700 rounded-lg p-4 bg-gray-50 dark:bg-dark-800/50">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getBadgeClasses(recomendacion.nivel)}`}>
                    {getBadgeLabel(recomendacion.nivel)}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-dark-300 text-sm">{recomendacion.texto}</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 dark:text-dark-500 mb-3" />
            <p className="text-gray-600 dark:text-dark-400 text-sm">Seleccione un vehículo para ver el análisis y la recomendación.</p>
          </div>
        )}
      </div>
      </>
      )}

      {/* Tab: Flota */}
      {tabActivo === 'flota' && (
      <>
      {/* A) Resumen flota - KPIs globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 dark:text-dark-400 text-sm">GASTO TOTAL FLOTA</p>
            <DollarSign className="w-8 h-8 text-primary-500 dark:text-primary-400" />
          </div>
          <p className="text-2xl font-bold text-dark-900 dark:text-white">{formatCurrency(resumenFlota.gastoTotalFlota)}</p>
          <p className="text-gray-500 dark:text-dark-500 text-sm mt-1">Acumulado histórico</p>
        </div>
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 dark:text-dark-400 text-sm">AÑO ACTUAL vs ANTERIOR</p>
            <TrendingUp className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-dark-900 dark:text-white">{formatCurrency(resumenFlota.gastoAñoActual)}</p>
          <p className="text-gray-500 dark:text-dark-500 text-sm mt-1">
            {AÑO_ACTUAL}: {formatCurrency(resumenFlota.gastoAñoActual)} · {AÑO_ANTERIOR}: {formatCurrency(resumenFlota.gastoAñoAnterior)}
            {resumenFlota.gastoAñoAnterior > 0 && (
              <span className={resumenFlota.variacionPorcentaje <= 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
                {' '}({resumenFlota.variacionPorcentaje >= 0 ? '+' : ''}{resumenFlota.variacionPorcentaje.toFixed(1)} %)
              </span>
            )}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 dark:text-dark-400 text-sm">Nº DE VEHÍCULOS</p>
            <Truck className="w-8 h-8 text-gray-500 dark:text-dark-400" />
          </div>
          <p className="text-2xl font-bold text-dark-900 dark:text-white">{resumenFlota.numVehiculos}</p>
          <p className="text-gray-500 dark:text-dark-500 text-sm mt-1">En inventario</p>
        </div>
      </div>

      {/* C) Vista global flota - gráfico lineal/área */}
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
        <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Gasto total por años (flota)</h2>
        <p className="text-gray-600 dark:text-dark-400 text-sm mb-6">Evolución anual del gasto en mantenimiento.</p>
        {datosGastoPorAños.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={datosGastoPorAños}>
                <defs>
                  <linearGradient id="colorGastoFlota" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-dark-700" />
                <XAxis dataKey="año" className="text-gray-600 dark:text-dark-400" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} className="text-gray-600 dark:text-dark-400" />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number | undefined) => (value != null ? formatCurrency(value) : '')} labelFormatter={label => `Año ${label}`} />
                <Area type="monotone" dataKey="coste" stroke="#3b82f6" strokeWidth={2} fill="url(#colorGastoFlota)" name="Gasto" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-dark-400">
              <span><strong className="text-dark-900 dark:text-white">{AÑO_ACTUAL}:</strong> {formatCurrency(resumenFlota.gastoAñoActual)}</span>
              <span><strong className="text-dark-900 dark:text-white">{AÑO_ANTERIOR}:</strong> {formatCurrency(resumenFlota.gastoAñoAnterior)}</span>
              {resumenFlota.gastoAñoAnterior > 0 && (
                <span>
                  Variación: {resumenFlota.variacionPorcentaje >= 0 ? '+' : ''}{resumenFlota.variacionPorcentaje.toFixed(1)} %
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-dark-800">
            <p className="text-gray-500 dark:text-dark-500 text-sm">No hay datos de gasto por años.</p>
          </div>
        )}
      </div>
      </>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800/50 p-4">
        <Info className="w-5 h-5 text-gray-500 dark:text-dark-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600 dark:text-dark-400">
          Las recomendaciones se basan en los datos registrados y criterios orientativos. No sustituyen asesoramiento profesional.
        </p>
      </div>
    </div>
  )
}
