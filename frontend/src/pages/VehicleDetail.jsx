import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Truck, Gauge, DollarSign, Hash, Tag, Settings2,
  Calendar, AlertTriangle,
} from 'lucide-react';
import { getVehicleById } from '../services/vehicle.service';
import StatusBadge from '../components/ui/StatusBadge';

function DetailCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className="bg-surface-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-brand-600/10 border border-brand-600/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-brand-400" />
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs font-medium mb-0.5">{label}</p>
        <p className={`font-semibold truncate ${highlight ? 'text-brand-300 font-mono' : 'text-slate-100'}`}>{value ?? '—'}</p>
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

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicleById(id),
    retry: false,
  });

  const vehicle = response?.data;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-in">
        <div className="h-8 w-48 bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-danger-400 mb-3" />
        <p className="text-slate-200 font-semibold text-lg">Vehicle not found</p>
        <p className="text-slate-400 text-sm mt-1 mb-6">This vehicle may have been removed or the ID is invalid.</p>
        <button onClick={() => navigate('/vehicles')} className="btn-primary">Back to Vehicles</button>
      </div>
    );
  }

  const isRetired = vehicle.status === 'RETIRED';

  return (
    <div className="space-y-5 animate-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/vehicles')} className="btn-ghost p-2 mt-0.5" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{vehicle.vehicleName}</h1>
            <StatusBadge status={vehicle.status} />
            {isRetired && (
              <span className="flex items-center gap-1 text-warning-400 text-xs bg-warning-500/10 border border-warning-500/20 px-2.5 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Retired — Read Only
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1 font-mono">{vehicle.registrationNumber}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DetailCard icon={Hash}      label="Registration" value={vehicle.registrationNumber} highlight />
        <DetailCard icon={Truck}     label="Vehicle Type"  value={vehicle.vehicleType} />
        <DetailCard icon={Gauge}     label="Odometer (km)" value={vehicle.odometer?.toLocaleString()} />
        <DetailCard icon={DollarSign}label="Acquisition Cost" value={`$${vehicle.acquisitionCost?.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Vehicle Info */}
        <SectionCard title="Vehicle Information">
          <dl className="space-y-3">
            {[
              { label: 'Vehicle Name',       value: vehicle.vehicleName },
              { label: 'Vehicle Type',       value: vehicle.vehicleType },
              { label: 'Registration No.',   value: vehicle.registrationNumber, mono: true },
              { label: 'Max Load Capacity',  value: `${vehicle.maxLoadCapacity?.toLocaleString()} kg` },
              { label: 'Current Odometer',   value: `${vehicle.odometer?.toLocaleString()} km` },
              { label: 'Acquisition Cost',   value: `$${vehicle.acquisitionCost?.toLocaleString()}` },
              { label: 'Status',             value: <StatusBadge status={vehicle.status} /> },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-800/50 last:border-0">
                <dt className="text-slate-400 text-sm flex-shrink-0">{label}</dt>
                <dd className={`text-sm font-medium text-slate-200 text-right ${mono ? 'font-mono text-brand-300' : ''}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        {/* Timestamps */}
        <SectionCard title="Record Details">
          <dl className="space-y-3">
            {[
              { label: 'Record ID',   value: vehicle.id,        mono: true },
              { label: 'Created',     value: new Date(vehicle.createdAt).toLocaleString() },
              { label: 'Last Updated',value: new Date(vehicle.updatedAt).toLocaleString() },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-800/50 last:border-0">
                <dt className="text-slate-400 text-sm flex-shrink-0">{label}</dt>
                <dd className={`text-sm font-medium text-slate-200 text-right break-all ${mono ? 'font-mono text-xs text-slate-400' : ''}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        {/* Future Integration Placeholders */}
        <div className="space-y-5">
          <SectionCard title="Active Trips">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Tag className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-slate-500 text-sm">Trip history will appear here</p>
              <p className="text-slate-600 text-xs mt-1">Available in Phase 3</p>
            </div>
          </SectionCard>
          <SectionCard title="Maintenance">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Settings2 className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-slate-500 text-sm">Maintenance logs will appear here</p>
              <p className="text-slate-600 text-xs mt-1">Available in a future phase</p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
