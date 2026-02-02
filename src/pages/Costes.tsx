import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Bar,
  BarChart,
} from 'recharts'
import { DollarSign, Truck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatCurrency } from '../utils/currency'
import CustomSelect from '../components/CustomSelect'

const AÑO_ACTUAL = new Date().getFullYear()

export default function Costes() {
  const navigate = useNavigate()
  const { vehiculos, mantenimientos } = useApp()
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<string>('')

  const sinDatosParaEstadisticas = vehiculos.length === 0 || mantenimientos.length === 0

  // Filtrar mantenimientos según vehículo seleccionado
  const mantenimientosFiltrados = useMemo(() => {
    if (!vehiculoSeleccionado || vehiculoSeleccionado === 'flota') {
      return mantenimientos
    }
    return mantenimientos.filter(m => m.vehiculoId.toString() === vehiculoSeleccionado)
  }, [mantenimientos, vehiculoSeleccionado])

  // Coste total anual (año actual)
  const costeAnual = useMemo(() => {
    return mantenimientosFiltrados
      .filter(m => {
        if (!m.fechaVencimiento || !m.costo) return false
        const año = new Date(m.fechaVencimiento).getFullYear()
        return año === AÑO_ACTUAL
      })
      .reduce((sum, m) => sum + (m.costo ?? 0), 0)
  }, [mantenimientosFiltrados])

  // Desglose por meses del año actual
  const datosMensuales = useMemo(() => {
    const meses: Record<number, number> = {}
    mantenimientosFiltrados.forEach(m => {
      if (m.costo != null && m.fechaVencimiento) {
        const fecha = new Date(m.fechaVencimiento)
        if (fecha.getFullYear() === AÑO_ACTUAL) {
          const mes = fecha.getMonth()
          meses[mes] = (meses[mes] ?? 0) + m.costo
        }
      }
    })
    
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return nombresMeses.map((nombre, index) => ({
      mes: nombre,
      coste: meses[index] ?? 0,
    }))
  }, [mantenimientosFiltrados])

  // Coste total histórico (todos los años)
  const costeTotal = useMemo(() => {
    return mantenimientosFiltrados.reduce((sum, m) => sum + (m.costo ?? 0), 0)
  }, [mantenimientosFiltrados])

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
        <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Costes de Mantenimiento</h1>
        <p className="text-gray-600 dark:text-dark-400">
          Análisis de costes de mantenimiento de la flota.
        </p>
      </div>

      {/* Empty state: sin datos para estadísticas */}
      {sinDatosParaEstadisticas && (
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-12 shadow-sm dark:shadow-none flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <DollarSign className="w-16 h-16 text-gray-400 dark:text-dark-500 mb-4 opacity-60" />
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Aún no hay datos para mostrar costes</h2>
          <p className="text-gray-600 dark:text-dark-400 text-sm mb-6">
            Añade vehículos y registra mantenimientos para ver los costes.
          </p>
          <button
            onClick={() => navigate('/vehiculos')}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            aria-label="Ir a Vehículos"
          >
            Ir a Vehículos
          </button>
        </div>
      )}

      {!sinDatosParaEstadisticas && (
        <>
          {/* Filtro por vehículo */}
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-dark-300 whitespace-nowrap">
                Filtrar por vehículo:
              </label>
              <div className="flex-1 max-w-md">
                <CustomSelect
                  options={[
                    { value: 'flota', label: 'Flota completa' },
                    ...vehiculos.map(v => ({ value: v.id.toString(), label: `${v.modelo} - ${v.matricula}` })),
                  ]}
                  value={vehiculoSeleccionado || 'flota'}
                  onChange={setVehiculoSeleccionado}
                  placeholder="Seleccionar vehículo..."
                />
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 dark:text-dark-400 text-sm">COSTE TOTAL HISTÓRICO</p>
                <DollarSign className="w-8 h-8 text-primary-500 dark:text-primary-400" />
              </div>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">{formatCurrency(costeTotal)}</p>
              <p className="text-gray-500 dark:text-dark-500 text-sm mt-1">Acumulado histórico</p>
            </div>
            <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 dark:text-dark-400 text-sm">COSTE AÑO ACTUAL ({AÑO_ACTUAL})</p>
                <Truck className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">{formatCurrency(costeAnual)}</p>
              <p className="text-gray-500 dark:text-dark-500 text-sm mt-1">Total del año {AÑO_ACTUAL}</p>
            </div>
          </div>

          {/* Gráfica mensual */}
          <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-lg p-6 shadow-sm dark:shadow-none">
            <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Desglose mensual ({AÑO_ACTUAL})</h2>
            <p className="text-gray-600 dark:text-dark-400 text-sm mb-6">Costes de mantenimiento por mes del año actual.</p>
            {datosMensuales.some(d => d.coste > 0) ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={datosMensuales}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-dark-700" />
                  <XAxis dataKey="mes" className="text-gray-600 dark:text-dark-400" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} className="text-gray-600 dark:text-dark-400" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number | undefined) => (value != null ? formatCurrency(value) : '')} />
                  <Bar dataKey="coste" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-dark-800">
                <p className="text-gray-500 dark:text-dark-500 text-sm">No hay datos de costes para el año {AÑO_ACTUAL}.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
