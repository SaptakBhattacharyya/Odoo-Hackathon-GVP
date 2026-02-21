import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/Toast'
import Login from './pages/Login'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import VehicleRegistry from './pages/VehicleRegistry'
import TripDispatcher from './pages/TripDispatcher'
import Maintenance from './pages/Maintenance'
import ExpenseFuel from './pages/ExpenseFuel'
import DriverPerformance from './pages/DriverPerformance'
import FinancialAnalytics from './pages/FinancialAnalytics'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="fleet" element={<ProtectedRoute requiredPath="/fleet"><VehicleRegistry /></ProtectedRoute>} />
              <Route path="dispatch" element={<ProtectedRoute requiredPath="/dispatch"><TripDispatcher /></ProtectedRoute>} />
              <Route path="maintenance" element={<ProtectedRoute requiredPath="/maintenance"><Maintenance /></ProtectedRoute>} />
              <Route path="expenses" element={<ProtectedRoute requiredPath="/expenses"><ExpenseFuel /></ProtectedRoute>} />
              <Route path="drivers" element={<ProtectedRoute requiredPath="/drivers"><DriverPerformance /></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute requiredPath="/analytics"><FinancialAnalytics /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
