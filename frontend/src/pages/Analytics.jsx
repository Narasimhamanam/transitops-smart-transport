import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Truck, Route, DollarSign, Calendar, Activity, AlertTriangle
} from 'lucide-react';

import PageHeader from '../components/ui/PageHeader';
import { getVehicles }     from '../services/vehicle.service';
import { getTrips }        from '../services/trip.service';
import { getMaintenances } from '../services/maintenance.service';
import { getFuelLogs }     from '../services/fuel.service';
import { getExpenses }     from '../services/expense.service';

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#a855f7'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-900 border border-slate-700 rounded-xl px-3 py-2 text-xs shadow-card font-mono">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data: vResponse,   isLoading: vLoading } = useQuery({ queryKey: ['vehicles'], queryFn: () => getVehicles() });
  const { data: tResponse,   isLoading: tLoading } = useQuery({ queryKey: ['trips'], queryFn: () => getTrips() });
  const { data: mResponse,   isLoading: mLoading } = useQuery({ queryKey: ['maintenances'], queryFn: () => getMaintenances() });
  const { data: fResponse,   isLoading: fLoading } = useQuery({ queryKey: ['fuel-logs'], queryFn: () => getFuelLogs() });
  const { data: expResponse, isLoading: expLoading } = useQuery({ queryKey: ['expenses'], queryFn: () => getExpenses() });

  const vehicles = vResponse?.data ?? [];
  const trips = tResponse?.data ?? [];
  const maintenances = mResponse?.data ?? [];
  const fuelLogs = fResponse?.data ?? [];
  const expenses = expResponse?.data ?? [];

  const isLoading = vLoading || tLoading || mLoading || fLoading || expLoading;

  // 1. Vehicle Status Aggregations
  const vehicleStatusData = useMemo(() => {
    const counts = { AVAILABLE: 0, ON_TRIP: 0, IN_SHOP: 0, RETIRED: 0 };
    vehicles.forEach((v) => { counts[v.status] = (counts[v.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  }, [vehicles]);

  // 2. Trip Status Aggregations
  const tripStatusData = useMemo(() => {
    const counts = { DRAFT: 0, DISPATCHED: 0, COMPLETED: 0, CANCELLED: 0 };
    trips.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  }, [trips]);

  // 3. Operational Financial aggregates
  const financials = useMemo(() => {
    const fuel = fuelLogs.reduce((acc, curr) => acc + curr.totalCost, 0);
    const mnt = maintenances.reduce((acc, curr) => acc + (curr.actualCost || curr.estimatedCost || 0), 0);
    const exp = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    return { fuel, mnt, exp, total: fuel + mnt + exp };
  }, [fuelLogs, maintenances, expenses]);

  // 4. Monthly operational trends (Trips dispatched vs completed)
  const monthlyActivityData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = {};
    trips.forEach((t) => {
      const mIdx = new Date(t.plannedDate).getMonth();
      const mName = months[mIdx];
      if (!map[mName]) map[mName] = { month: mName, trips: 0, completed: 0 };
      map[mName].trips += 1;
      if (t.status === 'COMPLETED') map[mName].completed += 1;
    });
    return Object.values(map);
  }, [trips]);

  // 5. Fleet cost trends
  const costTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = {};
    fuelLogs.forEach((f) => {
      const mIdx = new Date(f.fuelDate).getMonth();
      const mName = months[mIdx];
      if (!map[mName]) map[mName] = { month: mName, fuelCost: 0, maintenanceCost: 0 };
      map[mName].fuelCost += f.totalCost;
    });
    maintenances.forEach((m) => {
      const mIdx = new Date(m.scheduledDate).getMonth();
      const mName = months[mIdx];
      if (!map[mName]) map[mName] = { month: mName, fuelCost: 0, maintenanceCost: 0 };
      map[mName].maintenanceCost += (m.actualCost || m.estimatedCost || 0);
    });
    return Object.values(map);
  }, [fuelLogs, maintenances]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="h-8 w-48 bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-28 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-28 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-28 bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Fleet Analytics & Insights"
        subtitle="Operational metrics, fuel efficiency logs, and cost summary indicators"
      />

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-600/10 border border-brand-600/20 text-brand-400">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Total Spent</p>
            <h3 className="text-slate-100 text-xl font-mono font-bold mt-0.5">${financials.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-success-600/10 border border-success-600/20 text-success-400">
            <Activity className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Fuel Spend</p>
            <h3 className="text-success-400 text-xl font-mono font-bold mt-0.5">${financials.fuel.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning-600/10 border border-warning-600/20 text-warning-400">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Maintenance</p>
            <h3 className="text-slate-100 text-xl font-mono font-bold mt-0.5">${financials.mnt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-info-600/10 border border-info-600/20 text-info-400">
            <Route className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Other Expenses</p>
            <h3 className="text-slate-100 text-xl font-mono font-bold mt-0.5">${financials.exp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Monthly Activity Area Chart */}
        <div className="card p-5">
          <h3 className="text-slate-200 font-semibold mb-4 text-sm">Monthly Trip Volume</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyActivityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="trips" name="Total Scheduled" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Trends Multi-Line Chart */}
        <div className="card p-5">
          <h3 className="text-slate-200 font-semibold mb-4 text-sm">Fleet Cost Trends</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend tick={{ fill: '#94a3b8', fontSize: 10 }} wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="fuelCost" name="Fuel Logs ($)" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="maintenanceCost" name="Maintenance ($)" stroke="#eab308" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Status Pie */}
        <div className="card p-5">
          <h3 className="text-slate-200 font-semibold mb-4 text-sm">Vehicle Status Distribution</h3>
          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trip Status Bar Chart */}
        <div className="card p-5">
          <h3 className="text-slate-200 font-semibold mb-4 text-sm">Trip Operations distribution</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripStatusData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Total Trips" radius={[4, 4, 0, 0]}>
                  {tripStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
