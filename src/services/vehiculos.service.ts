export interface Vehiculo {
  id: number
  modelo: string
  tipo: string
  año: number
  matricula: string
  vin?: string
  kilometrajeActual?: number
  estado: 'al-dia' | 'proximo' | 'vencido'
  estadoTexto: string
}

class VehiculosService {
  private vehiculos: Vehiculo[] = [
    {
      id: 1,
      modelo: 'Toyota Hilux',
      tipo: 'Pick-up 4x4',
      año: 2022,
      matricula: '1234-ABC',
      vin: 'JTMHV05J504123456',
      kilometrajeActual: 50500,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 2,
      modelo: 'Ford Transit',
      tipo: 'Van de Carga',
      año: 2021,
      matricula: '5678-XYZ',
      vin: 'NM0AE8F77N1234567',
      kilometrajeActual: 125000,
      estado: 'proximo',
      estadoTexto: 'Próximo',
    },
    {
      id: 3,
      modelo: 'Mercedes Sprinter',
      tipo: 'Transporte',
      año: 2020,
      matricula: '9012-DEF',
      vin: 'WDB9066331N123456',
      kilometrajeActual: 98000,
      estado: 'vencido',
      estadoTexto: 'Vencido',
    },
    {
      id: 4,
      modelo: 'Chevrolet D-Max',
      tipo: 'Pick-up',
      año: 2023,
      matricula: '3456-GHI',
      vin: 'MMUJBK30P0K123456',
      kilometrajeActual: 15000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 5,
      modelo: 'Hino 300 Series',
      tipo: 'Camión Ligero',
      año: 2019,
      matricula: '7890-JKL',
      vin: 'JN1TBNT30U0123456',
      kilometrajeActual: 185000,
      estado: 'vencido',
      estadoTexto: 'Vencido',
    },
    {
      id: 6,
      modelo: 'Seat León',
      tipo: 'Turismo',
      año: 2023,
      matricula: '1111-AAA',
      vin: 'VSSZZZ5FZ1R123456',
      kilometrajeActual: 12000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 7,
      modelo: 'VW Golf',
      tipo: 'Turismo',
      año: 2022,
      matricula: '2222-BBB',
      vin: 'WVWZZZ1JZ3W123456',
      kilometrajeActual: 35000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 8,
      modelo: 'Renault Kangoo',
      tipo: 'Furgoneta',
      año: 2021,
      matricula: '3333-CCC',
      vin: 'VF1MA0000H1234567',
      kilometrajeActual: 45000,
      estado: 'proximo',
      estadoTexto: 'Próximo',
    },
    {
      id: 9,
      modelo: 'Peugeot Partner',
      tipo: 'Furgoneta',
      año: 2020,
      matricula: '4444-DDD',
      vin: 'VF3MA0000H1234567',
      kilometrajeActual: 78000,
      estado: 'proximo',
      estadoTexto: 'Próximo',
    },
    {
      id: 10,
      modelo: 'Iveco Daily',
      tipo: 'Camión',
      año: 2019,
      matricula: '5555-EEE',
      vin: 'ZCFC70E00K1234567',
      kilometrajeActual: 120000,
      estado: 'vencido',
      estadoTexto: 'Vencido',
    },
    {
      id: 11,
      modelo: 'Nissan Navara',
      tipo: 'Pickup',
      año: 2022,
      matricula: '6666-FFF',
      vin: 'VSKCVND50U0123456',
      kilometrajeActual: 28000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 12,
      modelo: 'Fiat Ducato',
      tipo: 'Furgoneta',
      año: 2021,
      matricula: '7777-GGG',
      vin: 'ZFA25000001234567',
      kilometrajeActual: 55000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 13,
      modelo: 'Opel Vivaro',
      tipo: 'Furgoneta',
      año: 2020,
      matricula: '8888-HHH',
      vin: 'W0L0TGF0012345678',
      kilometrajeActual: 95000,
      estado: 'proximo',
      estadoTexto: 'Próximo',
    },
    {
      id: 14,
      modelo: 'Citroën Berlingo',
      tipo: 'Furgoneta',
      año: 2023,
      matricula: '9999-III',
      vin: 'VF7MA0000H1234567',
      kilometrajeActual: 8000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 15,
      modelo: 'Ford Ranger',
      tipo: 'Pickup',
      año: 2021,
      matricula: '1010-JJJ',
      vin: '1FTFW1E55MFC12345',
      kilometrajeActual: 42000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 16,
      modelo: 'Toyota Hilux',
      tipo: 'Pickup',
      año: 2020,
      matricula: '2020-KKK',
      vin: 'JTMHV05J504123789',
      kilometrajeActual: 68000,
      estado: 'proximo',
      estadoTexto: 'Próximo',
    },
    {
      id: 17,
      modelo: 'Mercedes Sprinter',
      tipo: 'Furgoneta',
      año: 2019,
      matricula: '3030-LLL',
      vin: 'WDB9066331N123789',
      kilometrajeActual: 110000,
      estado: 'vencido',
      estadoTexto: 'Vencido',
    },
    {
      id: 18,
      modelo: 'Ford Transit',
      tipo: 'Furgoneta',
      año: 2022,
      matricula: '4040-MMM',
      vin: 'NM0AE8F77N1237890',
      kilometrajeActual: 32000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 19,
      modelo: 'Chevrolet D-Max',
      tipo: 'Pickup',
      año: 2021,
      matricula: '5050-NNN',
      vin: 'MMUJBK30P0K123789',
      kilometrajeActual: 48000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 20,
      modelo: 'Hino 300 Series',
      tipo: 'Camión',
      año: 2020,
      matricula: '6060-OOO',
      vin: 'JN1TBNT30U0123789',
      kilometrajeActual: 89000,
      estado: 'proximo',
      estadoTexto: 'Próximo',
    },
    {
      id: 21,
      modelo: 'Seat León',
      tipo: 'Turismo',
      año: 2022,
      matricula: '7070-PPP',
      vin: 'VSSZZZ5FZ1R123789',
      kilometrajeActual: 38000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 22,
      modelo: 'VW Golf',
      tipo: 'Turismo',
      año: 2021,
      matricula: '8080-QQQ',
      vin: 'WVWZZZ1JZ3W123789',
      kilometrajeActual: 52000,
      estado: 'proximo',
      estadoTexto: 'Próximo',
    },
    {
      id: 23,
      modelo: 'Renault Kangoo',
      tipo: 'Furgoneta',
      año: 2020,
      matricula: '9090-RRR',
      vin: 'VF1MA0000H1237890',
      kilometrajeActual: 75000,
      estado: 'vencido',
      estadoTexto: 'Vencido',
    },
    {
      id: 24,
      modelo: 'Peugeot Partner',
      tipo: 'Furgoneta',
      año: 2023,
      matricula: '1212-SSS',
      vin: 'VF3MA0000H1237890',
      kilometrajeActual: 15000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 25,
      modelo: 'Iveco Daily',
      tipo: 'Camión',
      año: 2022,
      matricula: '1313-TTT',
      vin: 'ZCFC70E00K1237890',
      kilometrajeActual: 29000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 26,
      modelo: 'Nissan Navara',
      tipo: 'Pickup',
      año: 2021,
      matricula: '1414-UUU',
      vin: 'VSKCVND50U0123789',
      kilometrajeActual: 41000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 27,
      modelo: 'Fiat Ducato',
      tipo: 'Furgoneta',
      año: 2020,
      matricula: '1515-VVV',
      vin: 'ZFA25000001237890',
      kilometrajeActual: 82000,
      estado: 'proximo',
      estadoTexto: 'Próximo',
    },
    {
      id: 28,
      modelo: 'Opel Vivaro',
      tipo: 'Furgoneta',
      año: 2019,
      matricula: '1616-WWW',
      vin: 'W0L0TGF0012378901',
      kilometrajeActual: 105000,
      estado: 'vencido',
      estadoTexto: 'Vencido',
    },
    {
      id: 29,
      modelo: 'Citroën Berlingo',
      tipo: 'Furgoneta',
      año: 2022,
      matricula: '1717-XXX',
      vin: 'VF7MA0000H1237890',
      kilometrajeActual: 36000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 30,
      modelo: 'Ford Ranger',
      tipo: 'Pickup',
      año: 2023,
      matricula: '1818-YYY',
      vin: '1FTFW1E55MFC12378',
      kilometrajeActual: 11000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 31,
      modelo: 'Toyota Hilux',
      tipo: 'Pickup',
      año: 2021,
      matricula: '1919-ZZZ',
      vin: 'JTMHV05J504123456',
      kilometrajeActual: 47000,
      estado: 'al-dia',
      estadoTexto: 'Al día',
    },
    {
      id: 32,
      modelo: 'Mercedes Sprinter',
      tipo: 'Furgoneta',
      año: 2020,
      matricula: '2121-AAA',
      vin: 'WDB9066331N123456',
      kilometrajeActual: 72000,
      estado: 'proximo',
      estadoTexto: 'Próximo',
    },
  ]

  private nextId = 33

  getAll(): Vehiculo[] {
    return [...this.vehiculos]
  }

  getById(id: number): Vehiculo | undefined {
    return this.vehiculos.find(v => v.id === id)
  }

  add(vehiculo: Omit<Vehiculo, 'id'>): Vehiculo {
    const nuevo: Vehiculo = {
      ...vehiculo,
      id: this.nextId++,
    }
    this.vehiculos.push(nuevo)
    return nuevo
  }

  update(id: number, vehiculo: Partial<Omit<Vehiculo, 'id'>>): Vehiculo | null {
    const index = this.vehiculos.findIndex(v => v.id === id)
    if (index === -1) return null
    this.vehiculos[index] = { ...this.vehiculos[index], ...vehiculo }
    return this.vehiculos[index]
  }

  delete(id: number): boolean {
    const index = this.vehiculos.findIndex(v => v.id === id)
    if (index === -1) return false
    this.vehiculos.splice(index, 1)
    return true
  }
}

export const vehiculosService = new VehiculosService()
