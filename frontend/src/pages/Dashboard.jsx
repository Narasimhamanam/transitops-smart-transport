import { useMemo } from 'react';
import {
  Truck, Route, Users, AlertTriangle, Clock, Activity,
  ArrowUpRight, TrendingUp, Wrench, Fuel, DollarSign, Plus, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../services/dashboard.service';
import { getTrips }          from '../services/trip.service';
import { getMaintenances }   from '../services/maintenance.service';
import { getFuelLogs }       from '../services/fuel.service';
import { getExpenses }       from '../services/expense.service';
import { getDrivers }        from '../services/driver.service';
import { useNavigate }       from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { ROLE_LABELS, DASHBOARD_QUICK_ACTIONS } from '../config/permissions';

// ─── Shared sub-components ────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconBg, description }) {
  return (
    <div className="stat-card animate-in">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon className="w-4.5 h-4.5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-slate-100 text-2xl font-bold leading-none">{value}</p>
        {description && (
          <p className="text-slate-500 text-xs mt-1.5 truncate">{description}</p>
        )}
      </div>
    </div>
  );
}

const ICON_MAP = { Truck, Route, Users, Wrench, Fuel, DollarSign, ShieldAlert };

function QuickActions({ role, navigate }) {
  const actions = DASHBOARD_QUICK_ACTIONS[role] ?? [];
  if (!actions.length) return null;
  return (
    <div className="card p-4 flex flex-wrap items-center gap-3">
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mr-2">Quick Actions:</span>
      {actions.map((a) => {
        const Icon = ICON_MAP[a.icon];
        return (
          <button
            key={a.label}
            onClick={() => navigate(a.href)}
            className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs"
          >
            {Icon && <Icon className="w-3.5 h-3.5 text-brand-400" />}
            {a.label}
          </button>
        );
      })}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm shadow-card">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Role dashboards ──────────────────────────────────────────────────────────

/** FLEET MANAGER — fleet assets, vehicle lifecycle, maintenance, operational efficiency */
function FleetManagerDashboard({ stats, statsLoading, maintenances, navigate }) {
  const fleetStatusData = useMemo(() => [
    { name: 'On Trip',   value: stats.vehiclesOnTrip ?? 0,    fill: '#6366f1' },
    { name: 'Available', value: stats.availableVehicles ?? 0, fill: '#22c55e' },
    { name: 'In Shop',   value: stats.inShopVehicles ?? 0,    fill: '#eab308' },
    { name: 'Retired',   value: stats.retiredVehicles ?? 0,   fill: '#ef4444' },
  ], [stats]);

  const recentMaintenances = useMemo(() => maintenances.slice(0, 5), [maintenances]);

  return (
    <div className="space-y-6">
      {/* Fleet KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Available Vehicles" value={statsLoading ? '...' : stats.availableVehicles} icon={Truck}      iconBg="bg-success-600"  description="Ready for assignment" />
        <StatCard label="Vehicles On Trip"   value={statsLoading ? '...' : stats.vehiclesOnTrip}   icon={Truck}      iconBg="bg-brand-600"    description="Actively en route" />
        <StatCard label="In Maintenance"     value={statsLoading ? '...' : stats.inShopVehicles}   icon={Wrench}     iconBg="bg-warning-600"  description="Under service" />
        <StatCard label="Retired Vehicles"   value={statsLoading ? '...' : stats.retiredVehicles}  icon={AlertTriangle} iconBg="bg-danger-600" description="Decommissioned" />
        <StatCard label="Fleet Utilization"  value={statsLoading ? '...' : `${stats.fleetUtilization}%`} icon={TrendingUp} iconBg="bg-brand-500" description="Active vs idle fleet" />
        <StatCard label="Maint. Scheduled"   value={statsLoading ? '...' : (maintenances.filter(m => m.status === 'SCHEDULED').length)} icon={Wrench} iconBg="bg-info-600" description="Upcoming service" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Fleet Status Breakdown */}
        <div className="card p-5 xl:col-span-2">
          <div className="mb-5">
            <h2 className="text-slate-200 font-semibold">Fleet Status Breakdown</h2>
            <p className="text-slate-500 text-xs mt-0.5">Vehicles by operational status</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={fleetStatusData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Vehicles" radius={[0, 6, 6, 0]}>
                {fleetStatusData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Maintenance Status Summary */}
        <div className="card p-5">
          <div className="mb-5">
            <h2 className="text-slate-200 font-semibold">Maintenance Overview</h2>
            <p className="text-slate-500 text-xs mt-0.5">Current service pipeline</p>
          </div>
          {[
            { label: 'Scheduled',    color: 'bg-info-500',    key: 'SCHEDULED' },
            { label: 'In Progress',  color: 'bg-warning-500', key: 'IN_PROGRESS' },
            { label: 'Completed',    color: 'bg-success-500', key: 'COMPLETED' },
            { label: 'Cancelled',    color: 'bg-danger-500',  key: 'CANCELLED' },
          ].map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', s.color)} />
                <span className="text-slate-400 text-sm">{s.label}</span>
              </div>
              <span className="text-slate-200 font-semibold text-sm">
                {maintenances.filter(m => m.status === s.key).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Maintenance */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4 text-brand-400" /> Recent Maintenance Activity
          </h3>
          <button onClick={() => navigate('/maintenance')} className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors">
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2.5">
          {recentMaintenances.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-850 rounded-xl">
              <div>
                <p className="font-mono text-xs font-bold text-brand-300">{item.maintenanceNumber}</p>
                <p className="text-slate-400 text-xs truncate max-w-[200px] mt-0.5">
                  {item.vehicle?.registrationNumber} · {item.maintenanceType}
                </p>
              </div>
              <span className={`badge ${item.status === 'COMPLETED' ? 'badge-success' : item.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-neutral'}`}>
                {item.status}
              </span>
            </div>
          ))}
          {recentMaintenances.length === 0 && <p className="text-slate-500 text-xs py-4 text-center">No maintenance records.</p>}
        </div>
      </div>
    </div>
  );
}

/** DRIVER (DISPATCHER) — trip management only */
function DriverDashboard({ trips, navigate }) {
  const today = new Date().toDateString();
  const todaysTrips    = useMemo(() => trips.filter(t => new Date(t.plannedDate).toDateString() === today), [trips, today]);
  const activeTrips    = useMemo(() => trips.filter(t => t.status === 'DISPATCHED'), [trips]);
  const pendingTrips   = useMemo(() => trips.filter(t => t.status === 'DRAFT'), [trips]);
  const completedTrips = useMemo(() => trips.filter(t => t.status === 'COMPLETED'), [trips]);
  const recentTrips    = useMemo(() => trips.slice(0, 6), [trips]);

  return (
    <div className="space-y-6">
      {/* Trip KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today's Trips"   value={todaysTrips.length}    icon={Route} iconBg="bg-brand-600"   description="Scheduled for today" />
        <StatCard label="Active Trips"    value={activeTrips.length}    icon={Route} iconBg="bg-info-600"    description="Currently dispatched" />
        <StatCard label="Pending Trips"   value={pendingTrips.length}   icon={Route} iconBg="bg-warning-600" description="Awaiting dispatch" />
        <StatCard label="Completed Today" value={completedTrips.length} icon={Route} iconBg="bg-success-600" description="Finished runs" />
      </div>

      {/* Recent Trips */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
            <Route className="w-4 h-4 text-brand-400" /> Trip Operations
          </h3>
          <button onClick={() => navigate('/trips')} className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors">
            Manage Trips <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2.5">
          {recentTrips.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-850 rounded-xl">
              <div>
                <p className="font-mono text-xs font-bold text-brand-300">{item.tripNumber}</p>
                <p className="text-slate-400 text-xs truncate max-w-[220px] mt-0.5">{item.source} ➔ {item.destination}</p>
              </div>
              <span className={`badge ${item.status === 'COMPLETED' ? 'badge-success' : item.status === 'DISPATCHED' ? 'badge-info' : 'badge-neutral'}`}>
                {item.status}
              </span>
            </div>
          ))}
          {recentTrips.length === 0 && <p className="text-slate-500 text-xs py-4 text-center">No trips found. Create your first trip.</p>}
        </div>
      </div>
    </div>
  );
}

/** SAFETY OFFICER — driver compliance, license validity, safety monitoring */
function SafetyOfficerDashboard({ drivers, navigate }) {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiredLicenses  = useMemo(() => drivers.filter(d => new Date(d.licenseExpiry) < now), [drivers, now]);
  const expiringLicenses = useMemo(() => drivers.filter(d => {
    const exp = new Date(d.licenseExpiry);
    return exp >= now && exp <= in30Days;
  }), [drivers, now, in30Days]);
  const suspendedDrivers = useMemo(() => drivers.filter(d => d.status === 'SUSPENDED'), [drivers]);
  const availableDrivers = useMemo(() => drivers.filter(d => d.status === 'AVAILABLE'), [drivers]);
  const lowSafetyScore   = useMemo(() => drivers.filter(d => d.safetyScore < 70), [drivers]);

  return (
    <div className="space-y-6">
      {/* Safety KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Available Drivers"   value={availableDrivers.length}  icon={Users}        iconBg="bg-success-600"  description="Active & ready" />
        <StatCard label="Expired Licenses"    value={expiredLicenses.length}   icon={AlertTriangle} iconBg="bg-danger-600"  description="Immediate action needed" />
        <StatCard label="Expiring ≤30 Days"   value={expiringLicenses.length}  icon={Clock}        iconBg="bg-warning-600"  description="Renew soon" />
        <StatCard label="Suspended Drivers"   value={suspendedDrivers.length}  icon={ShieldAlert}  iconBg="bg-danger-500"   description="Off duty" />
      </div>

      {/* Low Safety Score Alert */}
      {lowSafetyScore.length > 0 && (
        <div className="card p-4 border border-warning-500/30 bg-warning-500/5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-warning-400" />
            <h3 className="text-warning-400 font-semibold text-sm">Drivers With Low Safety Score (&lt;70)</h3>
          </div>
          <div className="space-y-2">
            {lowSafetyScore.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                <span className="text-slate-200 text-sm">{d.fullName}</span>
                <span className="font-mono text-danger-400 font-bold">{d.safetyScore}/100</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expired / Expiring Licenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-danger-400" /> Expired Licenses
            </h3>
            <button onClick={() => navigate('/drivers')} className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          {expiredLicenses.length === 0
            ? <p className="text-slate-500 text-xs py-4 text-center">✅ No expired licenses.</p>
            : expiredLicenses.slice(0, 4).map((d) => (
              <div key={d.id} className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl mb-2">
                <div>
                  <p className="text-slate-200 font-medium text-sm">{d.fullName}</p>
                  <p className="text-slate-500 text-xs font-mono">{d.licenseNumber}</p>
                </div>
                <span className="text-danger-400 text-xs font-semibold">
                  {new Date(d.licenseExpiry).toLocaleDateString()}
                </span>
              </div>
            ))
          }
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning-400" /> Expiring Soon (≤30 days)
            </h3>
          </div>
          {expiringLicenses.length === 0
            ? <p className="text-slate-500 text-xs py-4 text-center">✅ No licenses expiring soon.</p>
            : expiringLicenses.slice(0, 4).map((d) => (
              <div key={d.id} className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl mb-2">
                <div>
                  <p className="text-slate-200 font-medium text-sm">{d.fullName}</p>
                  <p className="text-slate-500 text-xs font-mono">{d.licenseNumber}</p>
                </div>
                <span className="text-warning-400 text-xs font-semibold">
                  {new Date(d.licenseExpiry).toLocaleDateString()}
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

/** FINANCIAL ANALYST — fuel costs, expenses, profitability */
function FinancialAnalystDashboard({ fuelLogs, expenses, navigate }) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear  = now.getFullYear();

  const monthlyFuel = useMemo(() =>
    fuelLogs
      .filter(f => { const d = new Date(f.fuelDate); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; })
      .reduce((sum, f) => sum + (f.totalCost || 0), 0),
    [fuelLogs, thisMonth, thisYear]
  );

  const monthlyExp = useMemo(() =>
    expenses
      .filter(e => { const d = new Date(e.expenseDate); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; })
      .reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses, thisMonth, thisYear]
  );

  const recentFuel = useMemo(() => fuelLogs.slice(0, 4), [fuelLogs]);
  const recentExp  = useMemo(() => expenses.slice(0, 4), [expenses]);

  return (
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Monthly Fuel Cost"  value={`$${monthlyFuel.toFixed(0)}`}  icon={Fuel}        iconBg="bg-warning-600"  description="This month" />
        <StatCard label="Monthly Expenses"   value={`$${monthlyExp.toFixed(0)}`}   icon={DollarSign}  iconBg="bg-danger-600"   description="This month" />
        <StatCard label="Total Fuel Logs"    value={fuelLogs.length}               icon={Fuel}        iconBg="bg-brand-600"    description="All time logs" />
        <StatCard label="Total Expenses"     value={expenses.length}               icon={DollarSign}  iconBg="bg-info-600"     description="All transactions" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
              <Fuel className="w-4 h-4 text-brand-400" /> Recent Fuel Entries
            </h3>
            <button onClick={() => navigate('/fuel-logs')} className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {recentFuel.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-850 rounded-xl">
                <div>
                  <p className="text-slate-300 text-xs font-bold truncate max-w-[180px]">{f.vehicle?.vehicleName}</p>
                  <p className="text-slate-500 text-[10px]">{new Date(f.fuelDate).toLocaleDateString()} · {f.fuelStation}</p>
                </div>
                <span className="font-mono text-success-400 text-xs font-bold">${f.totalCost?.toFixed(2)}</span>
              </div>
            ))}
            {recentFuel.length === 0 && <p className="text-slate-500 text-xs py-4 text-center">No fuel logs yet.</p>}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand-400" /> Recent Expenses
            </h3>
            <button onClick={() => navigate('/expenses')} className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {recentExp.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-850 rounded-xl">
                <div>
                  <p className="text-slate-300 text-xs font-bold truncate max-w-[180px]">{e.description}</p>
                  <p className="text-slate-500 text-[10px]">{e.expenseType} · {e.trip?.tripNumber}</p>
                </div>
                <span className="font-mono text-success-400 text-xs font-bold">${e.amount?.toFixed(2)}</span>
              </div>
            ))}
            {recentExp.length === 0 && <p className="text-slate-500 text-xs py-4 text-center">No expenses tracked yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard controller ────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 10000,
  });

  // Only fetch data needed for the current role
  const { data: tripsResponse }   = useQuery({ queryKey: ['trips'],        queryFn: () => getTrips(),        enabled: ['FLEET_MANAGER','DISPATCHER'].includes(role) });
  const { data: mntResponse }     = useQuery({ queryKey: ['maintenances'], queryFn: () => getMaintenances(), enabled: role === 'FLEET_MANAGER' });
  const { data: fuelResponse }    = useQuery({ queryKey: ['fuel-logs'],    queryFn: () => getFuelLogs(),     enabled: role === 'FINANCIAL_ANALYST' });
  const { data: expResponse }     = useQuery({ queryKey: ['expenses'],     queryFn: () => getExpenses(),     enabled: role === 'FINANCIAL_ANALYST' });
  const { data: driversResponse } = useQuery({ queryKey: ['drivers'],      queryFn: () => getDrivers(),      enabled: role === 'SAFETY_OFFICER' });

  const stats       = statsResponse?.data ?? { availableVehicles: 0, vehiclesOnTrip: 0, inShopVehicles: 0, retiredVehicles: 0, availableDrivers: 0, activeTrips: 0, pendingTrips: 0, fleetUtilization: 0 };
  const trips       = tripsResponse?.data ?? [];
  const maintenances= mntResponse?.data ?? [];
  const fuelLogs    = fuelResponse?.data ?? [];
  const expenses    = expResponse?.data ?? [];
  const drivers     = driversResponse?.data ?? [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            {roleLabel} Dashboard — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-surface-900 border border-slate-800 rounded-xl px-3 py-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Live Sync Enabled</span>
          <Activity className="w-3 h-3 text-success-400 animate-pulse-slow" />
        </div>
      </div>

      {/* Role-specific quick actions */}
      <QuickActions role={role} navigate={navigate} />

      {/* Role-specific dashboard content */}
      {role === 'FLEET_MANAGER' && (
        <FleetManagerDashboard stats={stats} statsLoading={statsLoading} maintenances={maintenances} navigate={navigate} />
      )}
      {role === 'DISPATCHER' && (
        <DriverDashboard trips={trips} navigate={navigate} />
      )}
      {role === 'SAFETY_OFFICER' && (
        <SafetyOfficerDashboard drivers={drivers} navigate={navigate} />
      )}
      {role === 'FINANCIAL_ANALYST' && (
        <FinancialAnalystDashboard fuelLogs={fuelLogs} expenses={expenses} navigate={navigate} />
      )}
    </div>
  );
}
