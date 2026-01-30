import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AppProvider } from './context/AppContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vehiculos from './pages/Vehiculos'
import DetalleVehiculo from './pages/DetalleVehiculo'
import Mantenimientos from './pages/Mantenimientos'
import DetalleMantenimiento from './pages/DetalleMantenimiento'
import Calendario from './pages/Calendario'
import Graficas from './pages/Graficas'
import Perfil from './pages/Perfil'
import Layout from './components/Layout'

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vehiculos" element={<Vehiculos />} />
              <Route path="vehiculos/:id" element={<DetalleVehiculo />} />
              <Route path="mantenimientos" element={<Mantenimientos />} />
              <Route path="mantenimientos/:id" element={<DetalleMantenimiento />} />
              <Route path="calendario" element={<Calendario />} />
              <Route path="graficas" element={<Graficas />} />
              <Route path="perfil" element={<Perfil />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  )
}

export default App
