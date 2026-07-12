import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, IdCard, Phone, Shield, Calendar, AlertTriangle,
  Route, FileText, User,
} from 'lucide-react';
import { getDriverById } from '../services/driver.service';
import StatusBadge from '../components/ui/StatusBadge';
import { SafetyScoreBadge } from '../components/ui/StatusBadge';

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

function ScoreRing({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  const pct   = (score / 100) * 282;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${pct} 282`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <p className="text-slate-400 text-xs">Safety Score</p>
    </div>
  );
}

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['driver', id],
    queryFn: () => getDriverById(id),
    retry: false,
  });

  const driver = response?.data;

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

  if (isError || !driver) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-danger-400 mb-3" />
        <p className="text-slate-200 font-semibold text-lg">Driver not found</p>
        <p className="text-slate-400 text-sm mt-1 mb-6">This driver may have been removed or the ID is invalid.</p>
        <button onClick={() => navigate('/drivers')} className="btn-primary">Back to Drivers</button>
      </div>
    );
  }

  const expiryDate = new Date(driver.licenseExpiry);
  const isExpired  = expiryDate < new Date();
  const daysToExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-5 animate-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/drivers')} className="btn-ghost p-2 mt-0.5" aria-label="Go back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{driver.fullName.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{driver.fullName}</h1>
                <StatusBadge status={driver.status} />
              </div>
              <p className="text-slate-400 text-sm mt-0.5 font-mono">{driver.licenseNumber} · Cat. {driver.licenseCategory}</p>
            </div>
          </div>
        </div>
      </div>

      {isExpired && (
        <div className="flex items-center gap-3 px-4 py-3 bg-danger-500/10 border border-danger-500/30 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-danger-400 flex-shrink-0" />
          <p className="text-danger-400 text-sm font-medium">
            License expired on {expiryDate.toLocaleDateString()}. This driver cannot legally operate vehicles.
          </p>
        </div>
      )}
      {!isExpired && daysToExpiry <= 30 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-warning-500/10 border border-warning-500/30 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-warning-400 flex-shrink-0" />
          <p className="text-warning-400 text-sm font-medium">
            License expires in {daysToExpiry} day{daysToExpiry !== 1 ? 's' : ''} on {expiryDate.toLocaleDateString()}.
          </p>
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DetailCard icon={IdCard}   label="License Number"   value={driver.licenseNumber} highlight />
        <DetailCard icon={Shield}   label="License Category" value={`Category ${driver.licenseCategory}`} />
        <DetailCard icon={Calendar} label="License Expiry"   value={expiryDate.toLocaleDateString()} />
        <DetailCard icon={Phone}    label="Contact"          value={driver.contactNumber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Driver Info */}
        <SectionCard title="Driver Information">
          <dl className="space-y-3">
            {[
              { label: 'Full Name',         value: driver.fullName },
              { label: 'License Number',    value: driver.licenseNumber, mono: true },
              { label: 'License Category',  value: `Category ${driver.licenseCategory}` },
              { label: 'License Expiry',    value: expiryDate.toLocaleDateString() },
              { label: 'Contact Number',    value: driver.contactNumber },
              { label: 'Status',            value: <StatusBadge status={driver.status} /> },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-800/50 last:border-0">
                <dt className="text-slate-400 text-sm flex-shrink-0">{label}</dt>
                <dd className={`text-sm font-medium text-slate-200 text-right ${mono ? 'font-mono text-brand-300' : ''}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        {/* Safety Score */}
        <SectionCard title="Safety Profile">
          <div className="flex flex-col items-center gap-5">
            <ScoreRing score={driver.safetyScore} />
            <div className="w-full space-y-2">
              {[
                { label: 'Excellent (80–100)', active: driver.safetyScore >= 80, color: 'bg-success-500' },
                { label: 'Acceptable (60–79)', active: driver.safetyScore >= 60 && driver.safetyScore < 80, color: 'bg-warning-500' },
                { label: 'Critical (0–59)',    active: driver.safetyScore < 60,  color: 'bg-danger-500' },
              ].map((tier) => (
                <div key={tier.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${tier.active ? 'bg-white/5 border border-white/10' : ''}`}>
                  <span className={`w-2 h-2 rounded-full ${tier.active ? tier.color : 'bg-slate-700'}`} />
                  <span className={tier.active ? 'text-slate-200 font-medium' : 'text-slate-600'}>{tier.label}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Future Placeholders */}
        <div className="space-y-5">
          <SectionCard title="Trip History">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Route className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-slate-500 text-sm">Trip history will appear here</p>
              <p className="text-slate-600 text-xs mt-1">Available in Phase 3</p>
            </div>
          </SectionCard>
          <SectionCard title="Incidents">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-slate-500 text-sm">Incident reports will appear here</p>
              <p className="text-slate-600 text-xs mt-1">Available in a future phase</p>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Record Details */}
      <div className="card p-5">
        <h2 className="text-slate-200 font-semibold mb-4 pb-3 border-b border-slate-800">Record Details</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-slate-500 mb-1">Record ID</p><p className="font-mono text-slate-400 text-xs break-all">{driver.id}</p></div>
          <div><p className="text-slate-500 mb-1">Created</p><p className="text-slate-300">{new Date(driver.createdAt).toLocaleString()}</p></div>
          <div><p className="text-slate-500 mb-1">Last Updated</p><p className="text-slate-300">{new Date(driver.updatedAt).toLocaleString()}</p></div>
        </div>
      </div>
    </div>
  );
}
