import { useMemo } from 'react';
import {
  Truck,
  Route,
  Users,
  AlertTriangle,
  Clock,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Wrench,
  Fuel,
  DollarSign,
  Plus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../services/dashboard.service';
import { getTrips } from '../services/trip.service';
import { getMaintenances } from '../services/maintenance.service';
import { getFuelLogs } from '../services/fuel.service';
import { getExpenses } from '../services/expense.service';
import { getNotifications } from '../services/notification.service';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

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

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Queries for live dashboard feeds
  const { data: statsResponse, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats, refetchInterval: 10000 });
  const { data: tripsResponse }       = useQuery({ queryKey: ['trips'], queryFn: () => getTrips() });
  const { data: mntResponse }         = useQuery({ queryKey: ['maintenances'], queryFn: () => getMaintenances() });
  const { data: fuelResponse }        = useQuery({ queryKey: ['fuel-logs'], queryFn: () => getFuelLogs() });
  const { data: expResponse }         = useQuery({ queryKey: ['expenses'], queryFn: () => getExpenses() });
  const { data: notifResponse }       = useQuery({ queryKey: ['notifications'], queryFn: () => getNotifications() });

  const stats = statsResponse?.data ?? {
    availableVehicles: 0,
    vehiclesOnTrip: 0,
    inShopVehicles: 0,
    retiredVehicles: 0,
    totalDrivers: 0,
    availableDrivers: 0,
    activeTrips: 0,
    pendingTrips: 0,
    fleetUtilization: 0
  };
  const trips = tripsResponse?.data ?? [];
  const maintenances = mntResponse?.data ?? [];
  const fuelLogs = fuelResponse?.data ?? [];
  const expenses = expResponse?.data ?? [];
  const notifications = notifResponse?.data ?? [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Dynamic Fleet Status breakdown matching current live stats from the database
  const fleetStatusData = useMemo(() => [
    { name: 'On Trip',   value: stats.vehiclesOnTrip ?? 0, fill: '#6366f1' },
    { name: 'Available', value: stats.availableVehicles ?? 0, fill: '#22c55e' },
    { name: 'In Shop',   value: stats.inShopVehicles ?? 0,  fill: '#eab308' },
    { name: 'Retired',   value: stats.retiredVehicles ?? 0,  fill: '#ef4444' },
  ], [stats]);

  // Dynamic trip activity data grouped by day of the week based on current live trips
  const tripTrendData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const dayMap = orderedDays.reduce((acc, d) => {
      acc[d] = { day: d, trips: 0, completed: 0 };
      return acc;
    }, {});

    trips.forEach((t) => {
      const date = new Date(t.plannedDate);
      if (!isNaN(date.getTime())) {
        const dName = days[date.getDay()];
        if (dayMap[dName]) {
          dayMap[dName].trips += 1;
          if (t.status === 'COMPLETED') {
            dayMap[dName].completed += 1;
          }
        }
      }
    });

    return orderedDays.map(d => dayMap[d]);
  }, [trips]);

  // Dynamic dashboard items slicing
  const recentTrips = useMemo(() => trips.slice(0, 3), [trips]);
  const recentMaintenances = useMemo(() => maintenances.slice(0, 3), [maintenances]);
  const recentFuelLogs = useMemo(() => fuelLogs.slice(0, 3), [fuelLogs]);
  const recentExpenses = useMemo(() => expenses.slice(0, 3), [expenses]);

  return (
    <div className="space-y-6 animate-in">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Here's what's happening with TransitOps today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-surface-900 border border-slate-800 rounded-xl px-3 py-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Live Sync Enabled</span>
          <Activity className="w-3 h-3 text-success-400 animate-pulse-slow" />
        </div>
      </div>

      {/* KPI Cards (6 columns grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Available Vehicles"
          value={statsLoading ? '...' : stats.availableVehicles}
          icon={Truck}
          iconBg="bg-success-600"
          description="Ready for assignment"
        />
        <StatCard
          label="Vehicles On Trip"
          value={statsLoading ? '...' : stats.vehiclesOnTrip}
          icon={Truck}
          iconBg="bg-brand-600"
          description="Actively en route"
        />
        <StatCard
          label="Available Drivers"
          value={statsLoading ? '...' : stats.availableDrivers}
          icon={Users}
          iconBg="bg-success-600"
          description="Active & ready"
        />
        <StatCard
          label="Active Trips"
          value={statsLoading ? '...' : stats.activeTrips}
          icon={Route}
          iconBg="bg-info-600"
          description="Dispatched trips"
        />
        <StatCard
          label="Pending Trips"
          value={statsLoading ? '...' : stats.pendingTrips}
          icon={Route}
          iconBg="bg-warning-600"
          description="Draft trips in queue"
        />
        <StatCard
          label="Utilization Rate"
          value={statsLoading ? '...' : `${stats.fleetUtilization}%`}
          icon={TrendingUp}
          iconBg="bg-brand-500"
          description="Active vs idle fleet"
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mr-2">Quick Actions:</span>
        <button onClick={() => navigate('/trips')} className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs"><Plus className="w-3.5 h-3.5 text-brand-400" /> Create Trip</button>
        <button onClick={() => navigate('/maintenance')} className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs"><Plus className="w-3.5 h-3.5 text-brand-400" /> Schedule Service</button>
        <button onClick={() => navigate('/fuel-logs')} className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs"><Plus className="w-3.5 h-3.5 text-brand-400" /> Log Refuel</button>
        <button onClick={() => navigate('/expenses')} className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs"><Plus className="w-3.5 h-3.5 text-brand-400" /> Add Expense</button>
      </div>

      {/* Main Charts Block */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Trip Activity */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-slate-200 font-semibold">Weekly Trip Activity</h2>
              <p className="text-slate-500 text-xs mt-0.5">Trips dispatched vs completed successfully</p>
            </div>
            <span className="badge-brand text-xs font-mono">Weekly Operations</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={tripTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTrips" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="trips"     name="Dispatched" stroke="#6366f1" fill="url(#gradTrips)"     strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="completed" name="Completed"  stroke="#22c55e" fill="url(#gradCompleted)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet Status Breakdown */}
        <div className="card p-5">
          <div className="mb-5">
            <h2 className="text-slate-200 font-semibold">Fleet Utilization Breakdown</h2>
            <p className="text-slate-500 text-xs mt-0.5">Vehicles by operational status</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={fleetStatusData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Vehicles" radius={[0, 6, 6, 0]}>
                {fleetStatusData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {fleetStatusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.fill }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="text-slate-300 font-semibold">{statsLoading ? '...' : d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recents Feeds (2x2 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Trips */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2"><Route className="w-4 h-4 text-brand-400" /> Recent Operations Trips</h3>
            <button onClick={() => navigate('/trips')} className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors">View All <ArrowUpRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-2.5">
            {recentTrips.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-850 rounded-xl">
                <div>
                  <p className="font-mono text-xs font-bold text-brand-300">{item.tripNumber}</p>
                  <p className="text-slate-400 text-xs truncate max-w-[200px] mt-0.5">{item.source} ➔ {item.destination}</p>
                </div>
                <span className={`badge ${item.status === 'COMPLETED' ? 'badge-success' : item.status === 'DISPATCHED' ? 'badge-info' : 'badge-neutral'}`}>{item.status}</span>
              </div>
            ))}
            {recentTrips.length === 0 && <p className="text-slate-500 text-xs py-4 text-center">No recent trips tracked.</p>}
          </div>
        </div>

        {/* Recent Maintenance */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2"><Wrench className="w-4 h-4 text-brand-400" /> Scheduled & Active Maintenance</h3>
            <button onClick={() => navigate('/maintenance')} className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors">View All <ArrowUpRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-2.5">
            {recentMaintenances.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-850 rounded-xl">
                <div>
                  <p className="font-mono text-xs font-bold text-brand-300">{item.maintenanceNumber}</p>
                  <p className="text-slate-400 text-xs truncate max-w-[200px] mt-0.5">{item.vehicle.registrationNumber} · {item.maintenanceType}</p>
                </div>
                <span className={`badge ${item.status === 'COMPLETED' ? 'badge-success' : item.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-neutral'}`}>{item.status}</span>
              </div>
            ))}
            {recentMaintenances.length === 0 && <p className="text-slate-500 text-xs py-4 text-center">No maintenance scheduled.</p>}
          </div>
        </div>

        {/* Recent Fuel entries */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2"><Fuel className="w-4 h-4 text-brand-400" /> Recent Refuel Logs</h3>
            <button onClick={() => navigate('/fuel-logs')} className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors">View All <ArrowUpRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-2.5">
            {recentFuelLogs.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-850 rounded-xl">
                <div>
                  <p className="text-slate-300 text-xs font-bold truncate max-w-[200px]">{item.vehicle.vehicleName} ({item.vehicle.registrationNumber})</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{new Date(item.fuelDate).toLocaleDateString()} · {item.fuelStation}</p>
                </div>
                <span className="font-mono text-success-400 text-xs font-bold">${item.totalCost.toFixed(2)}</span>
              </div>
            ))}
            {recentFuelLogs.length === 0 && <p className="text-slate-500 text-xs py-4 text-center">No refuels logged.</p>}
          </div>
        </div>

        {/* Recent Operations Expenses */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2"><DollarSign className="w-4.5 h-4.5 text-brand-400" /> Recent Active Expenses</h3>
            <button onClick={() => navigate('/expenses')} className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors">View All <ArrowUpRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-2.5">
            {recentExpenses.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-850 rounded-xl">
                <div>
                  <p className="text-slate-300 text-xs font-bold truncate max-w-[200px]">{item.description}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">Category: {item.expenseType} · Trip: {item.trip.tripNumber}</p>
                </div>
                <span className="font-mono text-success-400 text-xs font-bold">${item.amount.toFixed(2)}</span>
              </div>
            ))}
            {recentExpenses.length === 0 && <p className="text-slate-500 text-xs py-4 text-center">No expenses tracked.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
