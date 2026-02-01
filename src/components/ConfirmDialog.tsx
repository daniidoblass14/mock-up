import { ReactNode } from 'react'
import Modal from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmClasses =
    confirmVariant === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-primary-500 hover:bg-primary-600 text-white'

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-dark-200">{description}</div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 border border-gray-300 dark:bg-dark-800 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors text-sm"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

