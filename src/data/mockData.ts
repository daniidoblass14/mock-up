import type { Vehiculo } from '../services/vehiculos.service'
import type { Mantenimiento } from '../services/mantenimientos.service'

/**
 * Datos mock para demo: ~10 vehículos con perfiles (Nuevo/Estable/Problemático/Veterano)
 * y mantenimientos 2021-2024, costes 80-900€. No sobrescribe datos existentes en localStorage.
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
    { id: 9, vehiculoId: 4, tipo: 'Cambio de aceite', vencimiento: '45.000 km', estado: 'proximo', estadoTexto: 'Próximo', fechaVencimiento: new Date(2024, 4, 1), odometro: 45000, costo: 0 },
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
    { id: 20, vehiculoId: 7, tipo: 'ITV', vencimiento: 'Ene 2024', estado: 'vencido', estadoTexto: 'Vencido', fechaVencimiento: new Date(2024, 0, 10), odometro: 110000, costo: 0 },
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
  ]

  return { vehiculos, mantenimientos }
}
