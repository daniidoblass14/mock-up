import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Car, Wrench, Calendar, Settings, TrendingUp } from 'lucide-react'

export default function Sidebar() {
  const navigate = useNavigate()
  
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/vehiculos', icon: Car, label: 'Vehículos' },
    { path: '/mantenimientos', icon: Wrench, label: 'Mantenimiento' },
    { path: '/calendario', icon: Calendar, label: 'Calendario' },
    { path: '/graficas', icon: TrendingUp, label: 'Gráficas' },
  ]

  return (
    <div className="w-64 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-800 flex flex-col shadow-sm dark:shadow-none">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-dark-900 dark:text-white font-semibold text-lg">AutoLytix</h1>
            <p className="text-gray-500 dark:text-dark-400 text-xs">Fleet Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500'
                    : 'text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          )
        })}
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              isActive
                ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400 border-l-2 border-primary-500'
                : 'text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-white'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Configuración</span>
        </NavLink>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-800">
        <button
          onClick={() => navigate('/perfil')}
          className="w-full flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg p-2 transition-colors"
        >
          <div className="w-10 h-10 bg-gray-200 dark:bg-dark-700 rounded-full flex items-center justify-center">
            <span className="text-dark-900 dark:text-white text-sm font-medium">RG</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-dark-900 dark:text-white text-sm font-medium">Roberto García</p>
            <p className="text-gray-500 dark:text-dark-400 text-xs">Administrador</p>
          </div>
        </button>
      </div>
    </div>
  )
}
