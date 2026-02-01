import type { Vehiculo } from '../services/vehiculos.service'
import type { Mantenimiento } from '../services/mantenimientos.service'

export type NivelRecomendacion = 'mantener' | 'vigilar' | 'valorar-cambio' | 'insuficientes'

export interface RecomendacionVehiculo {
  nivel: NivelRecomendacion
  texto: string
  antiguedad: number
  totalGastado: number
  gastoAnualMedio: number
  gastoUltimos12Meses: number
  ratio: number
  añosConDatos: number
}

const AÑO_ACTUAL = new Date().getFullYear()

function getMantenimientosDelVehiculo(vehiculoId: number, mantenimientos: Mantenimiento[]) {
  return mantenimientos.filter(m => m.vehiculoId === vehiculoId)
}

function calcularMetricas(vehiculo: Vehiculo, mantenimientos: Mantenimiento[]) {
  const delVehiculo = getMantenimientosDelVehiculo(vehiculo.id, mantenimientos)
  const totalGastado = delVehiculo.reduce((sum, m) => sum + (m.costo ?? 0), 0)
  const añosSet = new Set<number>()
  delVehiculo.forEach(m => {
    if (m.costo != null && m.fechaVencimiento) {
      añosSet.add(new Date(m.fechaVencimiento).getFullYear())
    }
  })
  const añosConDatos = añosSet.size
  const gastoAnualMedio = añosConDatos > 0 ? totalGastado / añosConDatos : 0
  const hace12Meses = new Date()
  hace12Meses.setMonth(hace12Meses.getMonth() - 12)
  const gastoUltimos12Meses = delVehiculo
    .filter(m => {
      if (m.costo == null || !m.fechaVencimiento) return false
      const f = new Date(m.fechaVencimiento)
      return f >= hace12Meses && f <= new Date()
    })
    .reduce((sum, m) => sum + (m.costo ?? 0), 0)
  const ratio = gastoAnualMedio > 0 ? gastoUltimos12Meses / gastoAnualMedio : 0
  const antiguedad = AÑO_ACTUAL - vehiculo.año
  return {
    totalGastado,
    gastoAnualMedio,
    gastoUltimos12Meses,
    ratio,
    antiguedad,
    añosConDatos,
  }
}

/**
 * Reglas DEMO (simples y explicables):
 * - Valorar cambio: antigüedad >= 8 OR ratio >= 1.5 OR kilometrajeActual >= 150000
 * - Vigilar: ratio >= 1.3 OR antigüedad entre 5 y 7
 * - Mantener: resto
 * - Insuficientes: añosConDatos < 1 o totalGastado muy bajo sin historial
 */
export function getRecomendacion(vehiculo: Vehiculo, mantenimientos: Mantenimiento[]): RecomendacionVehiculo {
  const metricas = calcularMetricas(vehiculo, mantenimientos)
  const { antiguedad, ratio, añosConDatos } = metricas
  const km = vehiculo.kilometrajeActual ?? 0

  // Datos insuficientes: menos de 1 año con gastos registrados
  if (añosConDatos < 1) {
    return {
      nivel: 'insuficientes',
      texto: 'Aún no hay suficiente historial de mantenimientos para ofrecer una orientación. Siga registrando operaciones para obtener recomendaciones.',
      ...metricas,
    }
  }

  if (antiguedad >= 8 || ratio >= 1.5 || km >= 150000) {
    const motivos: string[] = []
    if (antiguedad >= 8) motivos.push(`antigüedad de ${antiguedad} años`)
    if (ratio >= 1.5) motivos.push('gasto reciente notablemente superior al promedio')
    if (km >= 150000) motivos.push('kilometraje elevado')
    const texto = `Por ${motivos.join(', ')}, podría ser momento de valorar la renovación del vehículo. Esta recomendación es orientativa; la decisión depende de su situación y del uso que le dé.`
    return { nivel: 'valorar-cambio', texto, ...metricas }
  }

  if (ratio >= 1.3 || (antiguedad >= 5 && antiguedad <= 7)) {
    const motivos: string[] = []
    if (ratio >= 1.3) motivos.push('el gasto de los últimos 12 meses es superior al promedio histórico')
    if (antiguedad >= 5 && antiguedad <= 7) motivos.push('antigüedad en un rango donde suelen aumentar las reparaciones')
    const texto = `Conviene vigilar este vehículo: ${motivos.join('; ')}. Planificar revisiones y revisar el presupuesto de mantenimiento puede ayudarle.`
    return { nivel: 'vigilar', texto, ...metricas }
  }

  return {
    nivel: 'mantener',
    texto: 'El gasto en mantenimiento se mantiene estable y dentro de lo esperado para la antigüedad y uso del vehículo. No se detectan señales que aconsejen un cambio.',
    ...metricas,
  }
}
