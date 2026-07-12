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
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      {/* Protected – requires authentication */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/"          element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Fleet Manager: Vehicles */}
          <Route element={<RoleGuard allowedRoles={['FLEET_MANAGER']} />}>
            <Route path="/vehicles"         element={<Vehicles />} />
            <Route path="/vehicles/:id"     element={<VehicleDetail />} />
          </Route>

          {/* Driver (DISPATCHER): Trips */}
          <Route element={<RoleGuard allowedRoles={['DISPATCHER']} />}>
            <Route path="/trips"            element={<Trips />} />
            <Route path="/trips/:id"        element={<TripDetail />} />
          </Route>

          {/* Fleet Manager + Safety Officer: Drivers */}
          <Route element={<RoleGuard allowedRoles={['FLEET_MANAGER', 'SAFETY_OFFICER']} />}>
            <Route path="/drivers"          element={<Drivers />} />
            <Route path="/drivers/:id"      element={<DriverDetail />} />
          </Route>

          {/* Fleet Manager + Financial Analyst: Maintenance */}
          <Route element={<RoleGuard allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']} />}>
            <Route path="/maintenance"      element={<Maintenance />} />
            <Route path="/maintenance/:id"  element={<MaintenanceDetail />} />
          </Route>

          {/* Financial Analyst: Fuel & Expenses */}
          <Route element={<RoleGuard allowedRoles={['FINANCIAL_ANALYST']} />}>
            <Route path="/fuel-logs"        element={<FuelLogs />} />
            <Route path="/expenses"         element={<Expenses />} />
          </Route>

          {/* Analytics: Financial Analyst */}
          <Route element={<RoleGuard allowedRoles={['FINANCIAL_ANALYST']} />}>
            <Route path="/analytics"        element={<Analytics />} />
          </Route>

          {/* Settings: Fleet Manager only */}
          <Route element={<RoleGuard allowedRoles={['FLEET_MANAGER']} />}>
            <Route path="/settings"         element={<Settings />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
