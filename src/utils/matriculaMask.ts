export function formatMatricula(value: string): string {
  // Eliminar todo lo que no sea letra o número y normalizar a mayúsculas
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  
  // Máximo 7 caracteres (4 números + 3 letras)
  const limited = cleaned.slice(0, 7)
  
  // Separar números y letras
  const numbers = limited.match(/\d/g) || []
  const letters = limited.match(/[A-Z]/g) || []
  
  // Formato: 4 números + 3 letras
  let formatted = ''
  
  // Añadir números (máximo 4)
  if (numbers.length > 0) {
    formatted = numbers.slice(0, 4).join('')
  }
  
  // Añadir guion si hay números y letras
  if (numbers.length > 0 && letters.length > 0) {
    formatted += '-'
  }
  
  // Añadir letras (máximo 3)
  if (letters.length > 0) {
    formatted += letters.slice(0, 3).join('')
  }
  
  return formatted
}

export function validateMatricula(matricula: string): boolean {
  // Formato: 4 números + guion + 3 letras
  const pattern = /^\d{4}-[A-Z]{3}$/
  return pattern.test(matricula)
}

export function normalizeMatricula(matricula: string): string {
  return matricula.toUpperCase().trim()
}
