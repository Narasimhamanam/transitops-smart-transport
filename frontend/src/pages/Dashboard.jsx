import {
  Truck,
  Route,
  Users,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';
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

// ---- Mock Data ----
const tripTrendData = [
  { day: 'Mon', trips: 42, completed: 38 },
  { day: 'Tue', trips: 55, completed: 51 },
  { day: 'Wed', trips: 48, completed: 45 },
  { day: 'Thu', trips: 61, completed: 58 },
  { day: 'Fri', trips: 67, completed: 63 },
  { day: 'Sat', trips: 38, completed: 35 },
  { day: 'Sun', trips: 29, completed: 27 },
];

const fleetStatusData = [
  { name: 'Active',       value: 34, fill: '#22c55e' },
  { name: 'In Maint.',    value: 8,  fill: '#eab308' },
  { name: 'Idle',         value: 12, fill: '#6366f1' },
  { name: 'Out of Svc.',  value: 3,  fill: '#ef4444' },
];

const recentActivity = [
  { id: 1, type: 'trip',     icon: Route,      color: 'text-info-400',    bg: 'bg-info-500/10',    text: 'Trip #TRP-2041 dispatched to Route 7', time: '2m ago',  status: 'ACTIVE' },
  { id: 2, type: 'alert',    icon: AlertTriangle, color: 'text-warning-400', bg: 'bg-warning-500/10', text: 'Vehicle VH-105 maintenance due in 3 days', time: '15m ago', status: 'WARNING' },
  { id: 3, type: 'driver',   icon: Users,       color: 'text-brand-400',   bg: 'bg-brand-500/10',   text: 'Driver James Cooper clocked in', time: '28m ago', status: 'INFO' },
  { id: 4, type: 'complete', icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success-500/10', text: 'Trip #TRP-2038 completed successfully', time: '1h ago',  status: 'DONE' },
  { id: 5, type: 'alert',    icon: ShieldCheck,  color: 'text-danger-400',  bg: 'bg-danger-500/10',  text: 'Safety inspection overdue: VH-089', time: '2h ago',  status: 'DANGER' },
];

const STATUS_BADGE = {
  ACTIVE:  'badge-info',
  WARNING: 'badge-warning',
  INFO:    'badge-brand',
  DONE:    'badge-success',
  DANGER:  'badge-danger',
};

function StatCard({ label, value, delta, deltaLabel, icon: Icon, iconBg, trend }) {
  return (
    <div className="stat-card animate-in">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
        <p className="text-slate-100 text-2xl font-bold leading-none">{value}</p>
        {delta !== undefined && (
          <div className="flex items-center gap-1 mt-1.5">
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3 text-success-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-danger-400" />
            )}
            <span className={cn('text-xs font-medium', trend === 'up' ? 'text-success-400' : 'text-danger-400')}>
              {delta}
            </span>
            <span className="text-slate-500 text-xs">{deltaLabel}</span>
          </div>
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-in">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Here's what's happening with your fleet today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-surface-900 border border-slate-800 rounded-xl px-3 py-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Live · Updated just now</span>
          <Activity className="w-3 h-3 text-success-400 animate-pulse-slow" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Active Vehicles"
          value="34"
          delta="+3"
          deltaLabel="vs yesterday"
          icon={Truck}
          iconBg="bg-brand-600"
          trend="up"
        />
        <StatCard
          label="Trips Today"
          value="67"
          delta="+12%"
          deltaLabel="vs last week"
          icon={Route}
          iconBg="bg-info-600"
          trend="up"
        />
        <StatCard
          label="Drivers On Duty"
          value="28"
          delta="-2"
          deltaLabel="vs yesterday"
          icon={Users}
          iconBg="bg-success-600"
          trend="down"
        />
        <StatCard
          label="Open Alerts"
          value="5"
          delta="+2"
          deltaLabel="since morning"
          icon={AlertTriangle}
          iconBg="bg-warning-600"
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Trip Trend Chart */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-slate-200 font-semibold">Trip Activity</h2>
              <p className="text-slate-500 text-xs mt-0.5">Trips dispatched vs completed — this week</p>
            </div>
            <span className="badge-success text-xs">+8.4% this week</span>
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

        {/* Fleet Status Chart */}
        <div className="card p-5">
          <div className="mb-5">
            <h2 className="text-slate-200 font-semibold">Fleet Status</h2>
            <p className="text-slate-500 text-xs mt-0.5">Vehicle breakdown by status</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={fleetStatusData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Vehicles" radius={[0, 6, 6, 0]}>
                {fleetStatusData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {fleetStatusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.fill }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="text-slate-300 font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-200 font-semibold">Recent Activity</h2>
          <button className="text-brand-400 hover:text-brand-300 text-xs font-medium flex items-center gap-1 transition-colors">
            View all <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-1">
          {recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', item.bg)}>
                <item.icon className={cn('w-4 h-4', item.color)} />
              </div>
              <p className="flex-1 text-sm text-slate-300">{item.text}</p>
              <span className={cn(STATUS_BADGE[item.status], 'badge hidden sm:inline-flex')}>{item.status}</span>
              <span className="text-slate-600 text-xs whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
