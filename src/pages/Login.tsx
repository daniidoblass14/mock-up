import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex">
      {/* Left Side - Vehicle Image with Overlays */}
      <div className="hidden lg:flex lg:w-2/3 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-900 dark:to-dark-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1568605117034-5c4f8c1e0e1c?w=1200&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 p-12 flex flex-col justify-center">
          {/* Overlay Data Points */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
              <div>
                <div className="h-1 w-32 bg-primary-500/30 mb-2"></div>
                <p className="text-primary-400 font-medium">ESTADO MOTOR: Correcto</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-primary-500 rounded-full mt-2"></div>
              <div>
                <div className="h-1 w-40 bg-primary-500/30 mb-2"></div>
                <p className="text-primary-400 font-medium">EFICIENCIA FLOTA: 98%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/3 bg-gray-50 dark:bg-dark-950 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                <Car className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-dark-900 dark:text-white">AutoLytix</h1>
            </div>
            <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-3">
              Mantenimiento inteligente
            </h2>
            <p className="text-gray-600 dark:text-dark-400">
              Control sencillo para la flota de tu empresa. Ingresa tus datos para continuar.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-dark-400" />
                <input
                  type="email"
                  id="email"
                  placeholder="usuario@empresa.com"
                  className="w-full bg-white dark:bg-dark-900 border border-gray-300 dark:border-dark-800 rounded-lg pl-10 pr-4 py-3 text-dark-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm dark:shadow-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full bg-white dark:bg-dark-900 border border-gray-300 dark:border-dark-800 rounded-lg pl-10 pr-12 py-3 text-dark-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm dark:shadow-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-dark-300">Recuérdame</span>
              </label>
              <a href="#" className="text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Entrar
            </button>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-600 dark:text-dark-400">
              ¿No tienes una cuenta?{' '}
              <a href="#" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-medium">
                Regístrate aquí
              </a>
            </p>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-500 dark:text-dark-500">
            © 2024 AutoLytix. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
