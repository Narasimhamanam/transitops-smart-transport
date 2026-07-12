import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute  from './routes/ProtectedRoute';
import RoleGuard       from './routes/RoleGuard';
import DashboardLayout from './layouts/DashboardLayout';
import Login           from './pages/Login';
import Register        from './pages/Register';
import ForgotPassword  from './pages/ForgotPassword';
import ResetPassword   from './pages/ResetPassword';
import Dashboard       from './pages/Dashboard';
import Vehicles        from './pages/Vehicles';
import VehicleDetail   from './pages/VehicleDetail';
import Drivers         from './pages/Drivers';
import DriverDetail    from './pages/DriverDetail';
import Trips           from './pages/Trips';
import TripDetail      from './pages/TripDetail';
import Maintenance     from './pages/Maintenance';
import MaintenanceDetail from './pages/MaintenanceDetail';
import FuelLogs        from './pages/FuelLogs';
import Expenses        from './pages/Expenses';
import Analytics       from './pages/Analytics';
import AIInsights      from './pages/AIInsights';
import Settings        from './pages/Settings';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/"               element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/settings"       element={<Settings />} />

          {/* Operations Restricted Routes */}
          <Route element={<RoleGuard allowedRoles={['FLEET_MANAGER', 'DISPATCHER']} />}>
            <Route path="/vehicles"       element={<Vehicles />} />
            <Route path="/vehicles/:id"   element={<VehicleDetail />} />
            <Route path="/drivers"        element={<Drivers />} />
            <Route path="/drivers/:id"    element={<DriverDetail />} />
            <Route path="/trips"          element={<Trips />} />
            <Route path="/trips/:id"      element={<TripDetail />} />
            <Route path="/maintenance"    element={<Maintenance />} />
            <Route path="/maintenance/:id" element={<MaintenanceDetail />} />
          </Route>

          {/* Compliance Restricted Routes */}
          <Route element={<RoleGuard allowedRoles={['FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']} />}>
            <Route path="/analytics"      element={<Analytics />} />
            <Route path="/ai-insights"    element={<AIInsights />} />
          </Route>

          {/* Finance Restricted Routes */}
          <Route element={<RoleGuard allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']} />}>
            <Route path="/fuel-logs"      element={<FuelLogs />} />
            <Route path="/expenses"       element={<Expenses />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
