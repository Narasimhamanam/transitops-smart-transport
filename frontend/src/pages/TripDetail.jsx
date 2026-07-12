import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Truck, Gauge, DollarSign, Calendar, MapPin,
  Scale, ClipboardList, Phone, User, AlertTriangle
} from 'lucide-react';
import { getTripById } from '../services/trip.service';
import StatusBadge from '../components/ui/StatusBadge';
import Timeline    from '../components/ui/Timeline';

function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-surface-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-brand-600/10 border border-brand-600/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-brand-400" />
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs font-medium mb-0.5">{label}</p>
        <p className="font-semibold truncate text-slate-100">{value ?? '—'}</p>
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

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => getTripById(id),
    retry: false,
  });

  const trip = response?.data;

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

  if (isError || !trip) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-danger-400 mb-3" />
        <p className="text-slate-200 font-semibold text-lg">Trip not found</p>
        <p className="text-slate-400 text-sm mt-1 mb-6">This trip may have been removed or the ID is invalid.</p>
        <button onClick={() => navigate('/trips')} className="btn-primary">Back to Trips</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/trips')} className="btn-ghost p-2 mt-0.5" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">Trip {trip.tripNumber}</h1>
            <StatusBadge status={trip.status} />
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Route: <span className="font-semibold text-slate-200">{trip.source}</span> to{' '}
            <span className="font-semibold text-slate-200">{trip.destination}</span>
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DetailCard icon={Scale}        label="Cargo Weight"       value={`${trip.cargoWeight.toLocaleString()} kg`} />
        <DetailCard icon={Gauge}        label="Planned Distance"   value={`${trip.plannedDistance.toLocaleString()} km`} />
        <DetailCard icon={Calendar}     label="Planned Date"       value={new Date(trip.plannedDate).toLocaleDateString()} />
        <DetailCard icon={MapPin}       label="Status"             value={trip.status.replace('_', ' ')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Trip, Vehicle, and Driver Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Dispatch details */}
          <SectionCard title="Route / Path Details">
            <div className="relative pl-6 border-l border-slate-700 py-1 space-y-4">
              <div className="relative">
                <span className="absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full bg-brand-500 border-2 border-surface-950" />
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Start Point</p>
                <p className="text-slate-200 text-sm font-medium mt-0.5">{trip.source}</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full bg-success-500 border-2 border-surface-950" />
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Destination</p>
                <p className="text-slate-200 text-sm font-medium mt-0.5">{trip.destination}</p>
              </div>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Vehicle Card */}
            <SectionCard title="Assigned Vehicle">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-slate-200 font-semibold">{trip.vehicle.vehicleName}</h3>
                  <span className="font-mono text-brand-300 text-xs font-semibold">{trip.vehicle.registrationNumber}</span>
                </div>
              </div>
              <dl className="space-y-2 text-sm text-slate-400">
                <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                  <dt>Vehicle Type</dt>
                  <dd className="text-slate-200 font-medium">{trip.vehicle.vehicleType}</dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                  <dt>Max Load Capacity</dt>
                  <dd className="text-slate-200 font-medium">{trip.vehicle.maxLoadCapacity.toLocaleString()} kg</dd>
                </div>
                <div className="flex justify-between py-1.5 last:border-none">
                  <dt>Odometer Reading</dt>
                  <dd className="text-slate-200 font-medium">{trip.vehicle.odometer.toLocaleString()} km</dd>
                </div>
              </dl>
            </SectionCard>

            {/* Driver Card */}
            <SectionCard title="Assigned Driver">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                  <span className="text-white font-bold">{trip.driver.fullName.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-slate-200 font-semibold">{trip.driver.fullName}</h3>
                  <span className="font-mono text-brand-300 text-xs font-semibold">{trip.driver.licenseNumber} (Cat. {trip.driver.licenseCategory})</span>
                </div>
              </div>
              <dl className="space-y-2 text-sm text-slate-400">
                <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                  <dt>Contact Number</dt>
                  <dd className="text-slate-200 font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" /> {trip.driver.contactNumber}
                  </dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/50">
                  <dt>License Expiry</dt>
                  <dd className="text-slate-200 font-medium">{new Date(trip.driver.licenseExpiry).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between py-1.5 last:border-none">
                  <dt>Safety Score</dt>
                  <dd className="text-slate-200 font-medium">{trip.driver.safetyScore}/100</dd>
                </div>
              </dl>
            </SectionCard>
          </div>

          {/* Notes Card */}
          {trip.notes && (
            <SectionCard title="Special Instructions / Notes">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-sm leading-relaxed flex items-start gap-2.5">
                <ClipboardList className="w-4.5 h-4.5 text-slate-500 mt-0.5 flex-shrink-0" />
                <p>{trip.notes}</p>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right Column: Timeline / Lifecycle */}
        <div className="lg:col-span-1">
          <SectionCard title="Trip Progress Timeline">
            <Timeline
              status={trip.status}
              actualStartTime={trip.actualStartTime}
              actualEndTime={trip.actualEndTime}
              plannedDate={trip.plannedDate}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
