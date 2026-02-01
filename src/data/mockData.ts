import type { Vehiculo } from '../services/vehiculos.service'
import type { Mantenimiento } from '../services/mantenimientos.service'

const TIPOS_MOCK = [
  'Cambio de aceite', 'Filtro de aire', 'Pastillas de freno', 'Discos de freno', 'Cambio de neumáticos',
  'Rotación de neumáticos', 'Revisión general', 'ITV', 'Batería', 'Correa de distribución', 'Embrague', 'Otros',
] as const

/**
 * Datos mock para demo: ~10 vehículos con perfiles (Nuevo/Estable/Problemático/Veterano)
 * y mantenimientos 2021-2025, costes 80-900€. Densidad suficiente para gráficas y recomendaciones variadas.
 */
export function getMockData(): { vehiculos: Vehiculo[]; mantenimientos: Mantenimiento[] } {
  const vehiculos: Vehiculo[] = [
    { id: 1, modelo: 'Seat León', tipo: 'Turismo', año: 2023, matricula: '1234-ABC', estado: 'al-dia', estadoTexto: 'Al día', kilometrajeActual: 12000 },
    { id: 2, modelo: 'Toyota Hilux', tipo: 'Pickup', año: 2023, matricula: '2345-DEF', estado: 'al-dia', estadoTexto: 'Al día', kilometrajeActual: 15000 },
    { id: 3, modelo: 'VW Golf', tipo: 'Turismo', año: 2022, matricula: '3456-GHI', estado: 'al-dia', estadoTexto: 'Al día', kilometrajeActual: 35000 },
    { id: 4, modelo: 'Renault Kangoo', tipo: 'Furgoneta', año: 2021, matricula: '4567-JKL', estado: 'proximo', estadoTexto: 'Próximo', kilometrajeActual: 45000 },
    { id: 5, modelo: 'Peugeot Partner', tipo: 'Furgoneta', año: 2020, matricula: '5678-MNO', estado: 'al-dia', estadoTexto: 'Al día', kilometrajeActual: 52000 },
    { id: 6, modelo: 'Ford Transit', tipo: 'Furgoneta', año: 2020, matricula: '6789-PQR', estado: 'proximo', estadoTexto: 'Próximo', kilometrajeActual: 95000 },
    { id: 7, modelo: 'Mercedes Sprinter', tipo: 'Furgoneta', año: 2019, matricula: '7890-STU', estado: 'vencido', estadoTexto: 'Vencido', kilometrajeActual: 110000 },
    { id: 8, modelo: 'Fiat Ducato', tipo: 'Furgoneta', año: 2018, matricula: '8901-VWX', estado: 'proximo', estadoTexto: 'Próximo', kilometrajeActual: 78000 },
    { id: 9, modelo: 'Hino 300 Series', tipo: 'Camión', año: 2016, matricula: '9012-YZA', estado: 'vencido', estadoTexto: 'Vencido', kilometrajeActual: 185000 },
    { id: 10, modelo: 'Iveco Daily', tipo: 'Camión', año: 2015, matricula: '0123-BCD', estado: 'vencido', estadoTexto: 'Vencido', kilometrajeActual: 210000 },
  ]

  const mantenimientos: Mantenimiento[] = [
    // Vehículo 1 (Nuevo - Mantener): 2 mantenimientos
    { id: 1, vehiculoId: 1, tipo: 'Cambio de aceite', vencimiento: '15.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2024, 0, 10), odometro: 15000, costo: 95 },
    { id: 2, vehiculoId: 1, tipo: 'Revisión general', vencimiento: '10.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 5, 20), odometro: 10000, costo: 180 },
    // Vehículo 2 (Nuevo - Mantener): 2
    { id: 3, vehiculoId: 2, tipo: 'Cambio de aceite', vencimiento: '15.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2024, 1, 5), odometro: 15000, costo: 120 },
    { id: 4, vehiculoId: 2, tipo: 'Filtro de aire', vencimiento: '15.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 7, 1), odometro: 15000, costo: 85 },
    // Vehículo 3 (Estable - Mantener): 4
    { id: 5, vehiculoId: 3, tipo: 'Cambio de aceite', vencimiento: '30.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2024, 2, 1), odometro: 35000, costo: 90 },
    { id: 6, vehiculoId: 3, tipo: 'Revisión general', vencimiento: '30.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 3, 15), odometro: 30000, costo: 220 },
    { id: 7, vehiculoId: 3, tipo: 'Pastillas de freno', vencimiento: '25.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 8, 10), odometro: 25000, costo: 180 },
    { id: 8, vehiculoId: 3, tipo: 'Cambio de aceite', vencimiento: '20.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 1, 20), odometro: 20000, costo: 85 },
    // Vehículo 4 (Estable - Mantener): 3
    { id: 9, vehiculoId: 4, tipo: 'Cambio de aceite', vencimiento: '45.000 km', estado: 'proximo', estadoTexto: 'Próximo', fechaVencimiento: new Date(2024, 4, 1), odometro: 45000, costo: 95 },
    { id: 10, vehiculoId: 4, tipo: 'Revisión general', vencimiento: '40.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 6, 15), odometro: 40000, costo: 195 },
    { id: 11, vehiculoId: 4, tipo: 'Filtro de habitáculo', vencimiento: '30.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 2, 10), odometro: 30000, costo: 65 },
    // Vehículo 5 (Estable - Mantener): 3
    { id: 12, vehiculoId: 5, tipo: 'Cambio de aceite', vencimiento: '50.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 9, 5), odometro: 50000, costo: 88 },
    { id: 13, vehiculoId: 5, tipo: 'ITV', vencimiento: 'Oct 2023', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 9, 20), odometro: 48000, costo: 42 },
    { id: 14, vehiculoId: 5, tipo: 'Revisión general', vencimiento: '40.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 4, 12), odometro: 40000, costo: 175 },
    // Vehículo 6 (Problemático - Vigilar): 5 mantenimientos, gasto reciente alto
    { id: 15, vehiculoId: 6, tipo: 'Correa de distribución', vencimiento: '90.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2024, 0, 15), odometro: 95000, costo: 520 },
    { id: 16, vehiculoId: 6, tipo: 'Pastillas de freno', vencimiento: '85.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 10, 1), odometro: 85000, costo: 210 },
    { id: 17, vehiculoId: 6, tipo: 'Cambio de aceite', vencimiento: '80.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 5, 10), odometro: 80000, costo: 95 },
    { id: 18, vehiculoId: 6, tipo: 'Revisión general', vencimiento: '75.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 11, 20), odometro: 75000, costo: 240 },
    { id: 19, vehiculoId: 6, tipo: 'Discos de freno', vencimiento: '70.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 3, 5), odometro: 70000, costo: 310 },
    // Vehículo 7 (Problemático - Vigilar): 5
    { id: 20, vehiculoId: 7, tipo: 'ITV', vencimiento: 'Ene 2024', estado: 'vencido', estadoTexto: 'Vencido', fechaVencimiento: new Date(2024, 0, 10), odometro: 110000, costo: 42 },
    { id: 21, vehiculoId: 7, tipo: 'Cambio de aceite', vencimiento: '105.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 8, 15), odometro: 105000, costo: 130 },
    { id: 22, vehiculoId: 7, tipo: 'Embrague', vencimiento: '100.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 2, 1), odometro: 100000, costo: 680 },
    { id: 23, vehiculoId: 7, tipo: 'Revisión general', vencimiento: '95.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 6, 10), odometro: 95000, costo: 255 },
    { id: 24, vehiculoId: 7, tipo: 'Pastillas de freno', vencimiento: '90.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 0, 20), odometro: 90000, costo: 195 },
    // Vehículo 8 (Vigilar - 6 años): 4
    { id: 25, vehiculoId: 8, tipo: 'Cambio de aceite', vencimiento: '75.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 11, 5), odometro: 78000, costo: 98 },
    { id: 26, vehiculoId: 8, tipo: 'ITV', vencimiento: 'Jun 2023', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 5, 15), odometro: 72000, costo: 38 },
    { id: 27, vehiculoId: 8, tipo: 'Revisión general', vencimiento: '60.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 4, 1), odometro: 60000, costo: 210 },
    { id: 28, vehiculoId: 8, tipo: 'Filtro de aire', vencimiento: '50.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2021, 9, 10), odometro: 50000, costo: 72 },
    // Vehículo 9 (Veterano - Valorar cambio): 6, 8 años, 185k km
    { id: 29, vehiculoId: 9, tipo: 'Revisión general', vencimiento: '180.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2024, 0, 20), odometro: 185000, costo: 420 },
    { id: 30, vehiculoId: 9, tipo: 'Correa de distribución', vencimiento: '175.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 6, 10), odometro: 175000, costo: 580 },
    { id: 31, vehiculoId: 9, tipo: 'Pastillas y discos', vencimiento: '170.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 1, 5), odometro: 170000, costo: 390 },
    { id: 32, vehiculoId: 9, tipo: 'Cambio de aceite', vencimiento: '165.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 7, 15), odometro: 165000, costo: 145 },
    { id: 33, vehiculoId: 9, tipo: 'Batería', vencimiento: '160.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 2, 1), odometro: 160000, costo: 125 },
    { id: 34, vehiculoId: 9, tipo: 'ITV', vencimiento: 'Mar 2022', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 2, 15), odometro: 158000, costo: 55 },
    // Vehículo 10 (Veterano - Valorar cambio): 5, 9 años, 210k km
    { id: 35, vehiculoId: 10, tipo: 'Revisión general', vencimiento: '210.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2024, 1, 10), odometro: 210000, costo: 485 },
    { id: 36, vehiculoId: 10, tipo: 'Embrague', vencimiento: '205.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 8, 20), odometro: 205000, costo: 720 },
    { id: 37, vehiculoId: 10, tipo: 'Correa de distribución', vencimiento: '200.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 2, 5), odometro: 200000, costo: 610 },
    { id: 38, vehiculoId: 10, tipo: 'Cambio de aceite', vencimiento: '195.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 9, 1), odometro: 195000, costo: 155 },
    { id: 39, vehiculoId: 10, tipo: 'Pastillas de freno', vencimiento: '190.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 4, 15), odometro: 190000, costo: 265 },
    // Mantenimientos adicionales 2021 y 2025 para densidad en gráficas (mín. 6 vehículos)
    { id: 40, vehiculoId: 1, tipo: 'Cambio de neumáticos', vencimiento: '8.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2021, 10, 5), odometro: 8000, costo: 380 },
    { id: 41, vehiculoId: 2, tipo: 'Revisión general', vencimiento: '5.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2021, 8, 15), odometro: 5000, costo: 165 },
    { id: 42, vehiculoId: 3, tipo: 'Filtro de habitáculo', vencimiento: '15.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2021, 3, 20), odometro: 15000, costo: 72 },
    { id: 43, vehiculoId: 4, tipo: 'Cambio de aceite', vencimiento: '20.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2021, 5, 10), odometro: 20000, costo: 88 },
    { id: 44, vehiculoId: 5, tipo: 'ITV', vencimiento: 'May 2021', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2021, 4, 12), odometro: 32000, costo: 38 },
    { id: 45, vehiculoId: 6, tipo: 'Cambio de aceite', vencimiento: '55.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2021, 1, 8), odometro: 55000, costo: 98 },
    { id: 46, vehiculoId: 1, tipo: 'Revisión general', vencimiento: '25.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2025, 2, 15), odometro: 25000, costo: 195 },
    { id: 47, vehiculoId: 2, tipo: 'Pastillas de freno', vencimiento: '30.000 km', estado: 'proximo', estadoTexto: 'Próximo', fechaVencimiento: new Date(2025, 5, 1), odometro: 30000, costo: 210 },
    { id: 48, vehiculoId: 3, tipo: 'Cambio de neumáticos', vencimiento: '40.000 km', estado: 'proximo', estadoTexto: 'Próximo', fechaVencimiento: new Date(2025, 8, 10), odometro: 40000, costo: 420 },
    { id: 49, vehiculoId: 4, tipo: 'Batería', vencimiento: '50.000 km', estado: 'proximo', estadoTexto: 'Próximo', fechaVencimiento: new Date(2025, 0, 20), odometro: 50000, costo: 125 },
    { id: 50, vehiculoId: 5, tipo: 'Correa de distribución', vencimiento: '60.000 km', estado: 'proximo', estadoTexto: 'Próximo', fechaVencimiento: new Date(2025, 4, 5), odometro: 60000, costo: 520 },
    { id: 51, vehiculoId: 6, tipo: 'Revisión general', vencimiento: '100.000 km', estado: 'proximo', estadoTexto: 'Próximo', fechaVencimiento: new Date(2025, 6, 1), odometro: 100000, costo: 255 },
    { id: 52, vehiculoId: 7, tipo: 'Cambio de neumáticos', vencimiento: '115.000 km', estado: 'proximo', estadoTexto: 'Próximo', fechaVencimiento: new Date(2025, 3, 12), odometro: 115000, costo: 480 },
    { id: 53, vehiculoId: 8, tipo: 'Pastillas de freno', vencimiento: '85.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2024, 8, 20), odometro: 85000, costo: 195 },
    { id: 54, vehiculoId: 9, tipo: 'Refrigerante', vencimiento: '188.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2024, 10, 5), odometro: 188000, costo: 145 },
    { id: 55, vehiculoId: 10, tipo: 'Batería', vencimiento: '215.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2024, 5, 15), odometro: 215000, costo: 132 },
    { id: 56, vehiculoId: 1, tipo: 'Filtro de aire', vencimiento: '20.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 0, 10), odometro: 20000, costo: 65 },
    { id: 57, vehiculoId: 2, tipo: 'Líquido de frenos', vencimiento: '20.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 6, 1), odometro: 20000, costo: 85 },
    { id: 58, vehiculoId: 4, tipo: 'Pastillas de freno', vencimiento: '35.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 9, 15), odometro: 35000, costo: 180 },
    { id: 59, vehiculoId: 5, tipo: 'Rotación de neumáticos', vencimiento: '45.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 11, 5), odometro: 45000, costo: 45 },
    { id: 60, vehiculoId: 6, tipo: 'Filtro de aceite', vencimiento: '65.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2022, 0, 20), odometro: 65000, costo: 42 },
    { id: 61, vehiculoId: 8, tipo: 'Cambio de neumáticos', vencimiento: '65.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 0, 10), odometro: 65000, costo: 390 },
    { id: 62, vehiculoId: 9, tipo: 'Otros', vencimiento: '178.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 9, 1), odometro: 178000, costo: 280 },
    { id: 63, vehiculoId: 10, tipo: 'Dirección', vencimiento: '198.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 0, 25), odometro: 198000, costo: 340 },
    { id: 64, vehiculoId: 3, tipo: 'Batería', vencimiento: '28.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 7, 10), odometro: 28000, costo: 118 },
    { id: 65, vehiculoId: 7, tipo: 'Discos de freno', vencimiento: '98.000 km', estado: 'completado', estadoTexto: 'Completado', fechaVencimiento: new Date(2023, 4, 5), odometro: 98000, costo: 310 },
  ]

  return { vehiculos, mantenimientos }
}

/** Umbral: si hay menos mantenimientos que este valor y hay al menos 6 vehículos, se añaden mock adicionales. */
export const MIN_MANTENIMIENTOS_PARA_ANADIR_MOCK = 50

type VehiculoParaMock = Pick<Vehiculo, 'id'>
/**
 * Genera mantenimientos mock adicionales para rellenar cuando el usuario tiene pocos datos.
 * No sobrescribe: se añaden con ids nuevos. Fechas 2021-2025, costes 80-900€, varios tipos.
 */
export function getMockMantenimientosAdicionales(
  vehiculos: VehiculoParaMock[],
  mantenimientosActuales: Mantenimiento[],
): Mantenimiento[] {
  const maxId = mantenimientosActuales.length > 0 ? Math.max(...mantenimientosActuales.map(m => m.id)) : 0
  const vehiculoIds = vehiculos.slice(0, Math.max(6, vehiculos.length)).map(v => v.id)
  if (vehiculoIds.length === 0) return []

  const tipos = TIPOS_MOCK
  const adicionales: Mantenimiento[] = []
  let id = maxId + 1
  const años = [2021, 2022, 2023, 2024, 2025]
  const costes = [80, 85, 88, 95, 98, 120, 125, 132, 145, 165, 180, 195, 210, 220, 255, 280, 310, 340, 380, 420, 480, 520, 580, 610, 680, 720, 900]

  for (let a = 0; a < años.length; a++) {
    for (let v = 0; v < vehiculoIds.length; v++) {
      const vehiculoId = vehiculoIds[v % vehiculoIds.length]
      const año = años[a]
      const mes = (a * 2 + v) % 12
      const dia = 5 + (v % 20)
      const fecha = new Date(año, mes, Math.min(dia, 28))
      const tipo = tipos[(a + v) % tipos.length]
      const costo = costes[(a * 3 + v) % costes.length]
      const odometro = 15000 + (año - 2021) * 12000 + v * 3000
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const f = new Date(fecha)
      f.setHours(0, 0, 0, 0)
      const estado = f.getTime() < hoy.getTime() ? 'completado' : 'proximo'
      const estadoTexto = estado === 'completado' ? 'Completado' : 'Próximo'
      const vencimiento = `${odometro.toLocaleString('es-ES')} km`
      adicionales.push({
        id: id++,
        vehiculoId,
        tipo,
        vencimiento,
        estado: estado as 'vencido' | 'proximo' | 'completado' | 'al-dia',
        estadoTexto,
        fechaVencimiento: fecha,
        odometro,
        costo,
      })
    }
  }

  return adicionales.slice(0, 45)
}
