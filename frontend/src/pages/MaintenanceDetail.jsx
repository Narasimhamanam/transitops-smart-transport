import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Truck, Wrench, ShieldAlert, Calendar, AlertTriangle,
  FileText, Landmark, DollarSign, Clock
} from 'lucide-react';
import { getMaintenanceById } from '../services/maintenance.service';
import StatusBadge from '../components/ui/StatusBadge';

function DetailCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className="bg-surface-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-brand-600/10 border border-brand-600/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-brand-400" />
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs font-medium mb-0.5">{label}</p>
        <p className={`font-semibold truncate ${highlight ? 'text-brand-300 font-mono text-sm' : 'text-slate-100'}`}>{value ?? '—'}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="card p-5">
      <h2 className="text-slate-200 font-semibold mb-4 pb-3 border-b border-slate-800">{title}</h2>
      {children}
    </div>
  );
}

export default function MaintenanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => getMaintenanceById(id),
    retry: false,
  });

  const record = response?.data;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-in">
        <div className="h-8 w-48 bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !record) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-danger-400 mb-3" />
        <p className="text-slate-200 font-semibold text-lg">Maintenance record not found</p>
        <p className="text-slate-400 text-sm mt-1 mb-6">The maintenance entry may have been deleted or the ID is invalid.</p>
        <button onClick={() => navigate('/maintenance')} className="btn-primary">Back to Maintenance</button>
      </div>
    );
  }

  const isCompleted = record.status === 'COMPLETED';

  return (
    <div className="space-y-5 animate-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/maintenance')} className="btn-ghost p-2 mt-0.5" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">Maintenance File {record.maintenanceNumber}</h1>
            <span className={`badge ${
              record.status === 'SCHEDULED' ? 'badge-neutral' :
              record.status === 'IN_PROGRESS' ? 'badge-warning' :
              record.status === 'COMPLETED' ? 'badge-success' :
              'badge-danger'
            }`}>{record.status.replace('_', ' ')}</span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Service Target: <span className="font-mono text-slate-200">{record.vehicle.registrationNumber}</span> · {record.maintenanceType}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DetailCard icon={Wrench}       label="Service Center" value={record.serviceCenter} />
        <DetailCard icon={Calendar}     label="Scheduled Date" value={new Date(record.scheduledDate).toLocaleDateString()} />
        <DetailCard icon={DollarSign}   label="Est. Cost"     value={`$${record.estimatedCost.toLocaleString()}`} />
        <DetailCard icon={DollarSign}   label="Actual Cost"   value={record.actualCost ? `$${record.actualCost.toLocaleString()}` : '—'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Service Details */}
        <div className="lg:col-span-2 space-y-5">
          <SectionCard title="Service Information">
            <dl className="space-y-3">
              {[
                { label: 'Maintenance Type',   value: record.maintenanceType },
                { label: 'Estimated Cost',     value: `$${record.estimatedCost.toLocaleString()}` },
                { label: 'Actual Cost',        value: record.actualCost ? `$${record.actualCost.toLocaleString()}` : 'Not completed yet' },
                { label: 'Scheduled Date',     value: new Date(record.scheduledDate).toLocaleDateString() },
                { label: 'Completed Date',     value: record.completedDate ? new Date(record.completedDate).toLocaleDateString() : '—' },
                { label: 'Service Center',     value: record.serviceCenter },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-800/50 last:border-0">
                  <dt className="text-slate-400 text-sm flex-shrink-0">{label}</dt>
                  <dd className="text-sm font-medium text-slate-200 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <SectionCard title="Task Description">
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-sm leading-relaxed flex items-start gap-2.5">
              <FileText className="w-4.5 h-4.5 text-slate-500 mt-0.5 flex-shrink-0" />
              <p>{record.description}</p>
            </div>
          </SectionCard>
        </div>

        {/* Right Info: Vehicle info */}
        <div className="space-y-5">
          <SectionCard title="Vehicle Information">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-brand-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-slate-200 font-semibold truncate">{record.vehicle.vehicleName}</h3>
                <span className="font-mono text-brand-300 text-xs font-semibold">{record.vehicle.registrationNumber}</span>
              </div>
            </div>
            <dl className="space-y-2 text-sm text-slate-400">
              <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                <dt>Type</dt>
                <dd className="text-slate-200 font-medium">{record.vehicle.vehicleType}</dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                <dt>Capacity</dt>
                <dd className="text-slate-200 font-medium">{record.vehicle.maxLoadCapacity.toLocaleString()} kg</dd>
              </div>
              <div className="flex justify-between py-1.5 last:border-none">
                <dt>Odometer</dt>
                <dd className="text-slate-200 font-medium">{record.vehicle.odometer.toLocaleString()} km</dd>
              </div>
            </dl>
          </SectionCard>

          {/* Record info */}
          <SectionCard title="Audit Summary">
            <dl className="space-y-2 text-xs text-slate-500 font-mono">
              <div className="flex justify-between py-1 border-b border-slate-850/50">
                <dt>Record ID</dt>
                <dd className="text-slate-400 truncate max-w-[120px]" title={record.id}>{record.id}</dd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850/50">
                <dt>Created At</dt>
                <dd className="text-slate-400">{new Date(record.createdAt).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between py-1 last:border-none">
                <dt>Updated At</dt>
                <dd className="text-slate-400">{new Date(record.updatedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
