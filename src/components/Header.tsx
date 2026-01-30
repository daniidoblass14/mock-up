import { useState, useEffect, useRef } from 'react'
import { Bell, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { vehiculosService } from '../services/vehiculos.service'

interface SearchResult {
  type: 'vehiculo' | 'mantenimiento'
  id: number
  label: string
  subtitle: string
}

export default function Header() {
  const navigate = useNavigate()
  const { mantenimientos } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchQuery.length === 0) {
      setResults([])
      setShowResults(false)
      setSelectedIndex(-1)
      return
    }

    const query = searchQuery.toLowerCase()
    const searchResults: SearchResult[] = []

    // Buscar vehículos
    vehiculosService.getAll().forEach(v => {
      if (
        v.modelo.toLowerCase().includes(query) ||
        v.matricula.toLowerCase().includes(query) ||
        (v.vin && v.vin.toLowerCase().includes(query))
      ) {
        searchResults.push({
          type: 'vehiculo',
          id: v.id,
          label: v.modelo,
          subtitle: v.matricula,
        })
      }
    })

    // Buscar mantenimientos
    mantenimientos.forEach(m => {
      const vehiculo = vehiculosService.getById(m.vehiculoId)
      if (
        m.tipo.toLowerCase().includes(query) ||
        vehiculo?.modelo.toLowerCase().includes(query) ||
        vehiculo?.matricula.toLowerCase().includes(query)
      ) {
        searchResults.push({
          type: 'mantenimiento',
          id: m.id,
          label: m.tipo,
          subtitle: vehiculo ? `${vehiculo.modelo} - ${vehiculo.matricula}` : 'N/A',
        })
      }
    })

    // Eliminar duplicados y limitar resultados
    const uniqueResults = searchResults.filter((result, index, self) =>
      index === self.findIndex(r => r.type === result.type && r.id === result.id)
    ).slice(0, 8)

    setResults(uniqueResults)
    setShowResults(uniqueResults.length > 0)
    setSelectedIndex(-1)
  }, [searchQuery, mantenimientos])

  // Click outside para cerrar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showResults || results.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            handleResultClick(results[selectedIndex])
          }
          break
        case 'Escape':
          setShowResults(false)
          setSearchQuery('')
          break
      }
    }

    if (showResults) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showResults, results, selectedIndex])

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'vehiculo') {
      navigate('/vehiculos')
    } else {
      navigate('/mantenimientos')
    }
    setSearchQuery('')
    setShowResults(false)
    setSelectedIndex(-1)
  }

  const vencidosCount = mantenimientos.filter(m => m.estado === 'vencido').length

  return (
    <header className="h-16 bg-dark-900 border-b border-dark-800 flex items-center justify-between px-6">
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
        <input
          type="text"
          placeholder="Buscar vehículos, mantenimientos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowResults(results.length > 0)}
          className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-10 py-2 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Búsqueda global"
          aria-expanded={showResults}
          aria-controls="search-results"
          role="combobox"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('')
              setShowResults(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {showResults && results.length > 0 && (
          <div
            id="search-results"
            ref={resultsRef}
            className="absolute top-full mt-2 w-full bg-dark-800 border border-dark-700 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50"
            role="listbox"
          >
            {results.map((result, idx) => (
              <button
                key={`${result.type}-${result.id}-${idx}`}
                onClick={() => handleResultClick(result)}
                className={`w-full text-left px-4 py-3 hover:bg-dark-700 transition-colors border-b border-dark-700 last:border-b-0 ${
                  idx === selectedIndex ? 'bg-dark-700' : ''
                }`}
                role="option"
                aria-selected={idx === selectedIndex}
              >
                <div className="text-white font-medium">{result.label}</div>
                <div className="text-dark-400 text-xs mt-1">
                  {result.type === 'vehiculo' ? 'Vehículo' : 'Mantenimiento'} • {result.subtitle}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/mantenimientos?tab=vencidos')}
          className="relative p-2 text-dark-400 hover:text-white transition-colors"
          title={`${vencidosCount} mantenimientos vencidos`}
          aria-label={`Notificaciones: ${vencidosCount} mantenimientos vencidos`}
        >
          <Bell className="w-5 h-5" />
          {vencidosCount > 0 && (
            <>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
              <span className="sr-only">{vencidosCount} mantenimientos vencidos</span>
            </>
          )}
        </button>
      </div>
    </header>
  )
}
