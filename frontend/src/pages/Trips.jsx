import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Send, Check, Ban, AlertTriangle, Route } from 'lucide-react';

import PageHeader     from '../components/ui/PageHeader';
import SearchBar      from '../components/ui/SearchBar';
import FilterBar      from '../components/ui/FilterBar';
import DataTable      from '../components/ui/DataTable';
import StatusBadge    from '../components/ui/StatusBadge';
import Modal          from '../components/ui/Modal';
import DeleteDialog   from '../components/ui/DeleteDialog';
import Pagination     from '../components/ui/Pagination';
import Toast          from '../components/ui/Toast';
import { useToast }   from '../hooks/useToast';

import {
  getTrips, createTrip, updateTrip, deleteTrip, dispatchTrip, completeTrip, cancelTrip
} from '../services/trip.service';
import { getVehicles } from '../services/vehicle.service';
import { getDrivers }  from '../services/driver.service';

const TRIP_STATUSES = ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];
const PAGE_SIZE = 10;

const tripFormSchema = z.object({
  source: z.string().min(2, 'Min 2 characters').max(100).trim(),
  destination: z.string().min(2, 'Min 2 characters').max(100).trim(),
  plannedDistance: z.coerce.number().positive('Must be positive'),
  cargoWeight: z.coerce.number().positive('Must be positive'),
  plannedDate: z.string().min(1, 'Planned date is required').refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
  notes: z.string().max(500).optional().nullable(),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.string().min(1, 'Driver is required'),
});

function TripFormModal({ isOpen, onClose, editTrip, vehicles, drivers, onSuccess }) {
  const isEdit = !!editTrip;

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(tripFormSchema),
    defaultValues: editTrip
      ? {
          ...editTrip,
          plannedDate: editTrip.plannedDate ? new Date(editTrip.plannedDate).toISOString().split('T')[0] : '',
        }
      : { source: '', destination: '', plannedDistance: '', cargoWeight: '', plannedDate: '', notes: '', vehicleId: '', driverId: '' },
  });

  const selectedVehicleId = watch('vehicleId');
  const selectedDriverId  = watch('driverId');

  // Smart filters for dropdowns: show AVAILABLE items, plus the currently assigned items (for edit)
  const availableVehicles = useMemo(() => {
    return vehicles.filter(
      (v) => v.status === 'AVAILABLE' || (isEdit && v.id === editTrip?.vehicleId)
    );
  }, [vehicles, isEdit, editTrip]);

  const availableDrivers = useMemo(() => {
    return drivers.filter(
      (d) => (d.status === 'AVAILABLE' && new Date(d.licenseExpiry) >= new Date()) || (isEdit && d.id === editTrip?.driverId)
    );
  }, [drivers, isEdit, editTrip]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateTrip(editTrip.id, data);
        onSuccess('Trip updated successfully.', 'success');
      } else {
        await createTrip({ ...data, status: 'DRAFT' });
        onSuccess('Trip created successfully as DRAFT.', 'success');
      }
      reset();
      onClose();
    } catch (err) {
      onSuccess(err?.response?.data?.message || 'An error occurred.', 'error');
    }
  };

  const Field = ({ id, label, children, error }) => (
    <div>
      <label htmlFor={id} className="form-label">{label}</label>
      {children}
      {error && <p className="form-error">{error.message}</p>}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Trip' : 'Create Trip'} size="lg">
      <form id="trip-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field id="source" label="Source Location *" error={errors.source}>
            <input id="source" className="form-input" placeholder="Johannesburg Depot" {...register('source')} />
          </Field>
          <Field id="destination" label="Destination *" error={errors.destination}>
            <input id="destination" className="form-input" placeholder="Pretoria Hub" {...register('destination')} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field id="vehicleId" label="Vehicle (Smart List) *" error={errors.vehicleId}>
            <select id="vehicleId" className="form-input" {...register('vehicleId')}>
              <option value="">Select an available vehicle...</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleName} ({v.registrationNumber}) [Cap: {v.maxLoadCapacity} kg]
                </option>
              ))}
            </select>
          </Field>
          <Field id="driverId" label="Driver (Smart List) *" error={errors.driverId}>
            <select id="driverId" className="form-input" {...register('driverId')}>
              <option value="">Select an available driver...</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName} ({d.licenseNumber}) [Safety: {d.safetyScore}]
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field id="cargoWeight" label="Cargo Weight (kg) *" error={errors.cargoWeight}>
            <input id="cargoWeight" type="number" className="form-input" placeholder="1200" {...register('cargoWeight')} />
          </Field>
          <Field id="plannedDistance" label="Planned Distance (km) *" error={errors.plannedDistance}>
            <input id="plannedDistance" type="number" step="any" className="form-input" placeholder="58.5" {...register('plannedDistance')} />
          </Field>
          <Field id="plannedDate" label="Planned Date *" error={errors.plannedDate}>
            <input id="plannedDate" type="date" className="form-input" {...register('plannedDate')} />
          </Field>
        </div>

        <Field id="notes" label="Notes / Special Instructions" error={errors.notes}>
          <textarea id="notes" rows={3} className="form-input" placeholder="Provide any special instructions here..." {...register('notes')} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="trip-submit-btn" type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{isEdit ? 'Saving...' : 'Creating...'}</> : isEdit ? 'Save Changes' : 'Create Trip'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Action confirmation Modal
function ActionConfirmModal({ isOpen, onClose, onConfirm, title, desc, pending, actionText = 'Proceed', variant = 'brand' }) {
  const btnStyles = {
    brand: 'btn-primary bg-brand-600 hover:bg-brand-500',
    success: 'btn-primary bg-success-600 hover:bg-success-500',
    danger: 'btn-danger',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${
          variant === 'danger' ? 'bg-danger-500/10 border-danger-500/30 text-danger-400' :
          variant === 'success' ? 'bg-success-500/10 border-success-500/30 text-success-400' :
          'bg-brand-500/10 border-brand-500/30 text-brand-400'
        }`}>
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <p className="text-slate-200 font-medium">{title}</p>
          <p className="text-slate-400 text-sm mt-1">{desc}</p>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <button onClick={onClose} disabled={pending} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} disabled={pending} className={`${btnStyles[variant]} flex-1 flex items-center justify-center gap-2`}>
            {pending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Working...</> : actionText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Trips() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast, showToast, clearToast } = useToast();

  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [driverFilter, setDriverFilter]   = useState('');
  const [dateFilter, setDateFilter]       = useState('');
  const [page, setPage]                   = useState(1);

  const [showForm, setShowForm]           = useState(false);
  const [editTrip, setEditTrip]           = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);

  // States for lifecycle confirmations
  const [dispatchTarget, setDispatchTarget] = useState(null);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget]     = useState(null);

  // Fetch lists
  const { data: tripsResponse, isLoading: tripsLoading } = useQuery({ queryKey: ['trips'], queryFn: () => getTrips() });
  const { data: vehiclesResponse } = useQuery({ queryKey: ['vehicles'], queryFn: () => getVehicles() });
  const { data: driversResponse }  = useQuery({ queryKey: ['drivers'], queryFn: () => getDrivers() });

  const trips = tripsResponse?.data ?? [];
  const vehicles = vehiclesResponse?.data ?? [];
  const drivers = driversResponse?.data ?? [];

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        (t.tripNumber && t.tripNumber.toLowerCase().includes(q)) ||
        (t.source && t.source.toLowerCase().includes(q)) ||
        (t.destination && t.destination.toLowerCase().includes(q)) ||
        (t.driver?.fullName && t.driver.fullName.toLowerCase().includes(q)) ||
        (t.vehicle?.registrationNumber && t.vehicle.registrationNumber.toLowerCase().includes(q));

      const matchStatus = !statusFilter  || t.status === statusFilter;
      const matchVehicle = !vehicleFilter || t.vehicleId === vehicleFilter;
      const matchDriver  = !driverFilter  || t.driverId === driverFilter;
      const matchDate    = !dateFilter    || new Date(t.plannedDate).toISOString().split('T')[0] === dateFilter;

      return matchSearch && matchStatus && matchVehicle && matchDriver && matchDate;
    });
  }, [trips, search, statusFilter, vehicleFilter, driverFilter, dateFilter]);


  const paginatedTrips = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTrips.slice(start, start + PAGE_SIZE);
  }, [filteredTrips, page]);

  const totalPages = Math.ceil(filteredTrips.length / PAGE_SIZE);

  // Mutation Hooks
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      showToast('Trip deleted successfully.');
      setDeleteTarget(null);
    },
    onError: (err) => {
      showToast(err?.response?.data?.message || 'Delete failed.', 'error');
      setDeleteTarget(null);
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: (id) => dispatchTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      showToast('Trip successfully dispatched! Vehicle and Driver status updated.');
      setDispatchTarget(null);
    },
    onError: (err) => {
      showToast(err?.response?.data?.message || 'Dispatch failed.', 'error');
      setDispatchTarget(null);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id) => completeTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      showToast('Trip successfully completed. Vehicle and Driver are now Available.');
      setCompleteTarget(null);
    },
    onError: (err) => {
      showToast(err?.response?.data?.message || 'Completion failed.', 'error');
      setCompleteTarget(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      showToast('Trip successfully cancelled. Assets returned to available.');
      setCancelTarget(null);
    },
    onError: (err) => {
      showToast(err?.response?.data?.message || 'Cancellation failed.', 'error');
      setCancelTarget(null);
    },
  });

  const handleFormSuccess = (message, type) => {
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    queryClient.invalidateQueries({ queryKey: ['drivers'] });
    showToast(message, type);
  };

  const columns = [
    { key: 'tripNumber', label: 'Trip Number', render: (t) => <span className="font-mono text-brand-300 font-medium">{t.tripNumber}</span> },
    { key: 'route',      label: 'Route / Path', render: (t) => <div className="max-w-[180px]"><p className="text-slate-200 font-semibold truncate">{t.source}</p><p className="text-slate-500 text-xs truncate">→ {t.destination}</p></div> },
    { key: 'vehicle',    label: 'Vehicle',      render: (t) => <div><p className="text-slate-300 font-medium text-xs truncate">{t.vehicle.vehicleName}</p><p className="text-slate-500 text-[10px] font-mono">{t.vehicle.registrationNumber}</p></div> },
    { key: 'driver',     label: 'Driver',       render: (t) => <div><p className="text-slate-300 font-medium text-xs truncate">{t.driver.fullName}</p><p className="text-slate-500 text-[10px] font-mono">{t.driver.licenseNumber}</p></div> },
    { key: 'distance',   label: 'Dist. (km)',   render: (t) => `${t.plannedDistance.toLocaleString()}` },
    { key: 'weight',     label: 'Cargo (kg)',   render: (t) => `${t.cargoWeight.toLocaleString()}` },
    { key: 'plannedDate',label: 'Planned Date', render: (t) => new Date(t.plannedDate).toLocaleDateString() },
    { key: 'status',     label: 'Status',       render: (t) => <StatusBadge status={t.status} /> },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/trips/${t.id}`)} className="btn-ghost p-2" title="View Details"><Eye className="w-4 h-4" /></button>
          
          {t.status === 'DRAFT' && (
            <>
              <button onClick={() => { setEditTrip(t); setShowForm(true); }} className="btn-ghost p-2" title="Edit Draft"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => setDispatchTarget(t)} className="btn-ghost p-2 text-info-400 hover:text-info-300 hover:bg-info-500/10" title="Dispatch Trip"><Send className="w-4 h-4" /></button>
            </>
          )}

          {t.status === 'DISPATCHED' && (
            <button onClick={() => setCompleteTarget(t)} className="btn-ghost p-2 text-success-400 hover:text-success-300 hover:bg-success-500/10" title="Complete Trip"><Check className="w-4 h-4" /></button>
          )}

          {(t.status === 'DRAFT' || t.status === 'DISPATCHED') && (
            <button onClick={() => setCancelTarget(t)} className="btn-ghost p-2 text-danger-400 hover:text-danger-300 hover:bg-danger-500/10" title="Cancel Trip"><Ban className="w-4 h-4" /></button>
          )}

          {(t.status === 'DRAFT' || t.status === 'CANCELLED') && (
            <button onClick={() => setDeleteTarget(t)} className="btn-ghost p-2 text-slate-500 hover:text-danger-400 hover:bg-danger-500/10" title="Delete Trip"><Trash2 className="w-4 h-4" /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in">
      <PageHeader
        title="Trip Management"
        subtitle={`${filteredTrips.length} active and scheduled trip${filteredTrips.length !== 1 ? 's' : ''} monitored`}
        action={
          <button id="add-trip-btn" onClick={() => { setEditTrip(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Trip
          </button>
        }
      />

      <div className="card p-5">
        <FilterBar
          filters={[
            { id: 'trip-status-filter', value: statusFilter, onChange: (v) => { setStatusFilter(v); setPage(1); }, options: [{ value: '', label: 'All Statuses' }, ...TRIP_STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') }))] },
            { id: 'trip-vehicle-filter', value: vehicleFilter, onChange: (v) => { setVehicleFilter(v); setPage(1); }, options: [{ value: '', label: 'All Vehicles' }, ...vehicles.map((v) => ({ value: v.id, label: v.vehicleName }))] },
            { id: 'trip-driver-filter',  value: driverFilter,  onChange: (v) => { setDriverFilter(v);  setPage(1); }, options: [{ value: '', label: 'All Drivers' }, ...drivers.map((d) => ({ value: d.id, label: d.fullName }))] },
          ]}
        >
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search trips..."
            className="flex-1 min-w-[200px]"
          />
          {/* Custom Date Input for Filter */}
          <input
            id="trip-date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="bg-surface-900 border border-slate-700 rounded-xl px-3 h-9 text-sm text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={paginatedTrips}
          isLoading={tripsLoading}
          emptyMessage="No trips match your current filters. Create a new trip to start."
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filteredTrips.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      {showForm && (
        <TripFormModal
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditTrip(null); }}
          editTrip={editTrip}
          vehicles={vehicles}
          drivers={drivers}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Confirmation Actions Modals */}
      <ActionConfirmModal
        isOpen={!!dispatchTarget}
        onClose={() => setDispatchTarget(null)}
        onConfirm={() => dispatchMutation.mutate(dispatchTarget.id)}
        title="Confirm Dispatch"
        desc={dispatchTarget ? `Are you sure you want to dispatch trip ${dispatchTarget.tripNumber}? This will mark both vehicle (${dispatchTarget.vehicle.vehicleName}) and driver (${dispatchTarget.driver.fullName}) as ON TRIP.` : ''}
        pending={dispatchMutation.isPending}
        actionText="Confirm & Dispatch"
        variant="brand"
      />

      <ActionConfirmModal
        isOpen={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        onConfirm={() => completeMutation.mutate(completeTarget.id)}
        title="Complete Trip"
        desc={completeTarget ? `Complete trip ${completeTarget.tripNumber}? Corresponding vehicle and driver statuses will be set back to AVAILABLE.` : ''}
        pending={completeMutation.isPending}
        actionText="Mark Completed"
        variant="success"
      />

      <ActionConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelMutation.mutate(cancelTarget.id)}
        title="Cancel Trip"
        desc={cancelTarget ? `Cancel trip ${cancelTarget.tripNumber}? Assigned assets (vehicle/driver) will be set back to AVAILABLE.` : ''}
        pending={cancelMutation.isPending}
        actionText="Cancel Trip"
        variant="danger"
      />

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        entityName={deleteTarget ? `Trip ${deleteTarget.tripNumber}` : ''}
        isDeleting={deleteMutation.isPending}
      />

      <Toast toast={toast} onDismiss={clearToast} />
    </div>
  );
}
