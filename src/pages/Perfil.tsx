import { useState, useRef, useEffect } from 'react'
import { User, Mail, Building, Lock, ArrowRight, Phone, Globe, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import CustomSelect from '../components/CustomSelect'
import ConfirmDialog from '../components/ConfirmDialog'

const ROLES = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'gestor', label: 'Gestor' },
]

const IDIOMAS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
]

const ZONAS_HORARIAS = [
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'Europe/London', label: 'Londres (GMT+0)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
]

export default function Perfil() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null)
  const [fotoPerfilURL, setFotoPerfilURL] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: 'Juan Pérez',
    email: 'juan.perez@autolytix.com',
    empresa: 'Constructora Pérez S.A.',
    telefono: '+34 600 123 456',
    rol: 'administrador',
    idioma: 'es',
    zonaHoraria: 'Europe/Madrid',
  })
  const [formDataInicial] = useState(formData)
  const [passwordData, setPasswordData] = useState({
    actual: '',
    nueva: '',
    confirmar: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  // Cleanup de URL cuando se desmonte o cambie la foto
  useEffect(() => {
    return () => {
      if (fotoPerfilURL) {
        URL.revokeObjectURL(fotoPerfilURL)
      }
    }
  }, [fotoPerfilURL])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      showToast('Por favor, selecciona una imagen válida (JPG, PNG o GIF)', 'error')
      return
    }

    // Validar tamaño (1MB)
    if (file.size > 1024 * 1024) {
      showToast('El archivo es demasiado grande. Máximo 1MB.', 'error')
      return
    }

    // Limpiar URL anterior si existe
    if (fotoPerfilURL) {
      URL.revokeObjectURL(fotoPerfilURL)
    }

    // Crear nueva URL
    const url = URL.createObjectURL(file)
    setFotoPerfilURL(url)
    setFotoPerfil(url)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCancel = () => {
    setFormData(formDataInicial)
    setPasswordData({ actual: '', nueva: '', confirmar: '' })
    setErrors({})
    if (fotoPerfilURL) {
      URL.revokeObjectURL(fotoPerfilURL)
      setFotoPerfilURL(null)
      setFotoPerfil(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    showToast('Cambios cancelados', 'info')
  }

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    // Validar contraseñas si se están cambiando
    if (passwordData.nueva || passwordData.confirmar) {
      if (!passwordData.actual) {
        newErrors.password = 'Debes ingresar la contraseña actual'
      } else if (passwordData.nueva.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
      } else if (passwordData.nueva !== passwordData.confirmar) {
        newErrors.password = 'Las contraseñas no coinciden'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showToast('Por favor, corrige los errores en el formulario', 'error')
      return
    }

    // Simular guardado
    setErrors({})
    if (passwordData.nueva) {
      setPasswordData({ actual: '', nueva: '', confirmar: '' })
    }
    showToast('Cambios guardados correctamente', 'success')
  }

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true)
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Configuración de cuenta</h1>
            <p className="text-gray-600 dark:text-dark-400">
              Gestiona tu perfil personal y la seguridad de tu cuenta.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors shadow-sm dark:shadow-none"
            aria-label="Volver al dashboard"
          >
            Volver al Dashboard
          </button>
        </div>

        {/* User Data Section */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl p-8 shadow-md dark:shadow-lg">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Datos de usuario</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="w-32 h-32 bg-gray-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4 overflow-hidden border-2 border-gray-200 dark:border-dark-700 shadow-lg">
                {fotoPerfil ? (
                  <img src={fotoPerfil} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-dark-900 dark:text-white font-semibold">JP</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Subir foto de perfil"
              />
              <button
                onClick={handleUploadClick}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-medium"
                aria-label="Subir nueva foto de perfil"
              >
                Subir nueva foto
              </button>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-2 text-center lg:text-left">JPG, PNG o GIF. Máx. 1MB.</p>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-dark-400 pointer-events-none" />
                    <input
                      type="text"
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 pr-10 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Nombre completo"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-dark-400 pointer-events-none" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      readOnly
                      className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 pr-10 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 opacity-60 cursor-not-allowed"
                      aria-label="Correo electrónico (no editable)"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Nombre de la empresa
                  </label>
                  <div className="relative">
                    <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-dark-400 pointer-events-none" />
                    <input
                      type="text"
                      id="empresa"
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 pr-10 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Nombre de la empresa"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-dark-400 pointer-events-none" />
                    <input
                      type="tel"
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 pr-10 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="+34 600 123 456"
                      aria-label="Teléfono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Rol
                  </label>
                  <CustomSelect
                    options={ROLES}
                    value={formData.rol}
                    onChange={(value) => setFormData({ ...formData, rol: value })}
                    placeholder="Seleccionar rol..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Idioma
                  </label>
                  <CustomSelect
                    options={IDIOMAS}
                    value={formData.idioma}
                    onChange={(value) => setFormData({ ...formData, idioma: value })}
                    placeholder="Seleccionar idioma..."
                    leadingIcon={<Globe className="w-4 h-4" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Zona horaria
                  </label>
                  <CustomSelect
                    options={ZONAS_HORARIAS}
                    value={formData.zonaHoraria}
                    onChange={(value) => setFormData({ ...formData, zonaHoraria: value })}
                    placeholder="Seleccionar zona..."
                    leadingIcon={<Clock className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-950 border border-gray-200 dark:border-dark-800 rounded-xl p-8 shadow-md dark:shadow-lg">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Seguridad</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="password-actual" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Contraseña actual
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-dark-400 pointer-events-none" />
                <input
                  type="password"
                  id="password-actual"
                  value={passwordData.actual}
                  onChange={(e) => setPasswordData({ ...passwordData, actual: e.target.value })}
                  className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 pr-10 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                  aria-label="Contraseña actual"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password-nueva" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  id="password-nueva"
                  value={passwordData.nueva}
                  onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })}
                  className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nueva contraseña"
                  aria-label="Nueva contraseña"
                />
              </div>

              <div>
                <label htmlFor="password-confirmar" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  id="password-confirmar"
                  value={passwordData.confirmar}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })}
                  className={`w-full bg-white dark:bg-dark-800 border rounded-lg px-4 py-3 text-dark-900 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-dark-700 focus:ring-primary-500'
                  }`}
                  placeholder="Repetir contraseña"
                  aria-label="Confirmar contraseña"
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handleLogout}
            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 flex items-center gap-2 transition-colors"
            aria-label="Cerrar sesión"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-dark-900 dark:text-white hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
              aria-label="Cancelar cambios"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              aria-label="Guardar cambios"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title="Cerrar sesión"
        description="¿Estás seguro de que deseas cerrar sesión? Tendrás que volver a iniciar sesión para acceder de nuevo al panel."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false)
          showToast('Cerrando sesión...', 'info')
          setTimeout(() => {
            navigate('/login')
          }, 500)
        }}
      />
    </div>
  )
}
