import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  errorText?: string
  helperText?: string
  leadingIcon?: React.ReactNode
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  errorText,
  helperText,
  leadingIcon,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null)

  const selectRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const optionsRefs = useRef<(HTMLButtonElement | null)[]>([])

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) || null,
    [options, value]
  )

  const filteredOptions = useMemo(
    () =>
      options.filter((opt) =>
        opt.label.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [options, search]
  )

  const openDropdown = () => {
    if (disabled) return
    setIsOpen(true)
    setSearch('')
    setHighlightedIndex(-1)

    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect()
      setDropdownRect(rect)
    }
  }

  const closeDropdown = () => {
    setIsOpen(false)
    setSearch('')
    setHighlightedIndex(-1)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      const clickedInsideTrigger =
        selectRef.current && selectRef.current.contains(target)
      const clickedInsideDropdown =
        dropdownRef.current && dropdownRef.current.contains(target)

      if (clickedInsideTrigger || clickedInsideDropdown) {
        // Click dentro del componente o del dropdown → no cerrar
        return
      }

      // Click realmente fuera → cerrar
      closeDropdown()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect()
      setDropdownRect(rect)
    }

    const handleResizeOrScroll = () => {
      if (!selectRef.current) return
      const rect = selectRef.current.getBoundingClientRect()
      setDropdownRect(rect)
    }

    window.addEventListener('resize', handleResizeOrScroll)
    window.addEventListener('scroll', handleResizeOrScroll, true)

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll)
      window.removeEventListener('scroll', handleResizeOrScroll, true)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (highlightedIndex >= 0 && optionsRefs.current[highlightedIndex]) {
      optionsRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
      })
    }
  }, [highlightedIndex])

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue)
    closeDropdown()
  }

  const handleKeyDownOnTrigger = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) {
          openDropdown()
        } else {
          setHighlightedIndex((prev) => {
            const next = prev + 1
            return next >= filteredOptions.length ? 0 : next
          })
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!isOpen) {
          openDropdown()
        } else {
          setHighlightedIndex((prev) => {
            const next = prev - 1
            return next < 0 ? filteredOptions.length - 1 : next
          })
        }
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!isOpen) {
          openDropdown()
        } else if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionSelect(filteredOptions[highlightedIndex].value)
        }
        break
      case 'Escape':
        event.preventDefault()
        closeDropdown()
        break
      default:
        break
    }
  }

  const hasError = !!errorText
  const selectId = useMemo(
    () => `custom-select-${Math.random().toString(36).slice(2, 9)}`,
    []
  )
  const helperId = helperText ? `${selectId}-helper` : undefined
  const errorId = hasError ? `${selectId}-error` : undefined

  const triggerBorderClasses = hasError
    ? 'border-red-500 focus:ring-red-500'
    : 'border-gray-300 dark:border-dark-700 focus:ring-primary-500'

  const baseHeightClasses = 'h-11'
  const triggerPaddingClasses = leadingIcon ? 'pl-10 pr-10' : 'px-4 pr-10'

  const dropdown = isOpen && dropdownRect
    ? createPortal(
        <div
          ref={dropdownRef}
          role="listbox"
          aria-labelledby={selectId}
          className="fixed z-[60] bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg max-h-60 overflow-auto w-full"
          style={{
            top: dropdownRect.bottom + 4,
            left: dropdownRect.left,
            width: dropdownRect.width,
          }}
        >
          <div className="p-2 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setHighlightedIndex(0)
              }}
              placeholder="Buscar..."
              className="w-full bg-white dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded-md px-3 py-2 text-sm text-dark-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-dark-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-dark-400">
                No se encontraron resultados
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  ref={(el) => {
                    optionsRefs.current[index] = el
                  }}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  onMouseDown={(e) => {
                    // Evita que el mousedown cambie el foco antes de seleccionar
                    e.preventDefault()
                    handleOptionSelect(option.value)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                    value === option.value
                      ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
                      : 'text-dark-900 dark:text-white'
                  } ${highlightedIndex === index ? 'bg-gray-100 dark:bg-dark-700' : ''}`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )
    : null

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleKeyDownOnTrigger}
        className={`w-full bg-gray-50 dark:bg-dark-800 ${triggerBorderClasses} rounded-lg text-dark-900 dark:text-white focus:outline-none focus:ring-2 flex items-center justify-between ${baseHeightClasses} ${triggerPaddingClasses} disabled:opacity-60 disabled:cursor-not-allowed`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-describedby={hasError ? errorId : helperId}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {leadingIcon && (
            <span className="text-gray-500 dark:text-dark-400 flex-shrink-0">{leadingIcon}</span>
          )}
          <span
            className={`truncate text-left ${
              selectedOption ? 'text-dark-900 dark:text-white' : 'text-gray-500 dark:text-dark-400'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder || 'Seleccionar...'}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 dark:text-dark-400 flex-shrink-0 ml-2 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {helperText && !hasError && (
        <p id={helperId} className="mt-1 text-xs text-gray-500 dark:text-dark-400">
          {helperText}
        </p>
      )}

      {hasError && (
        <p id={errorId} className="mt-1 text-xs text-red-400">
          {errorText}
        </p>
      )}

      {dropdown}
    </div>
  )
}
