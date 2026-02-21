import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import VehicleRegistry from './pages/VehicleRegistry'
import TripDispatcher from './pages/TripDispatcher'
import Maintenance from './pages/Maintenance'
import ExpenseFuel from './pages/ExpenseFuel'
import DriverPerformance from './pages/DriverPerformance'
import FinancialAnalytics from './pages/FinancialAnalytics'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="fleet" element={<VehicleRegistry />} />
        <Route path="dispatch" element={<TripDispatcher />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="expenses" element={<ExpenseFuel />} />
        <Route path="drivers" element={<DriverPerformance />} />
        <Route path="analytics" element={<FinancialAnalytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
