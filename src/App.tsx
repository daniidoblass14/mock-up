import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppProvider } from './context/AppContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vehiculos from './pages/Vehiculos'
import DetalleVehiculo from './pages/DetalleVehiculo'
import Mantenimientos from './pages/Mantenimientos'
import DetalleMantenimiento from './pages/DetalleMantenimiento'
import Calendario from './pages/Calendario'
import Costes from './pages/Costes'
import Layout from './components/Layout'

function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
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
                <Route path="costes" element={<Costes />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </ThemeProvider>
    </ToastProvider>
  )
}

export default App
