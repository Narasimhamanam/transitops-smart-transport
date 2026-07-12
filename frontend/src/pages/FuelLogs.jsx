import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Fuel, AlertTriangle } from 'lucide-react';

import PageHeader   from '../components/ui/PageHeader';
import SearchBar    from '../components/ui/SearchBar';
import FilterBar    from '../components/ui/FilterBar';
import DataTable    from '../components/ui/DataTable';
import Modal        from '../components/ui/Modal';
import DeleteDialog from '../components/ui/DeleteDialog';
import Pagination   from '../components/ui/Pagination';
import Toast        from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

import { getFuelLogs, createFuelLog, updateFuelLog, deleteFuelLog } from '../services/fuel.service';
import { getVehicles } from '../services/vehicle.service';
import { getTrips }    from '../services/trip.service';

const PAGE_SIZE = 10;

const fuelFormSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  tripId: z.string().optional().nullable(),
  fuelDate: z.string().min(1, 'Fuel date is required').refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
  liters: z.coerce.number().positive('Liters must be positive'),
  pricePerLiter: z.coerce.number().positive('Price must be positive'),
  odometerReading: z.coerce.number().min(0, 'Odometer cannot be negative'),
  fuelStation: z.string().min(2, 'Fuel station is too short').max(100).trim(),
});

function FuelFormModal({ isOpen, onClose, editRecord, vehicles, trips, onSuccess }) {
  const isEdit = !!editRecord;

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(fuelFormSchema),
    defaultValues: editRecord
      ? {
          ...editRecord,
          fuelDate: editRecord.fuelDate ? new Date(editRecord.fuelDate).toISOString().split('T')[0] : '',
        }
      : { vehicleId: '', tripId: '', fuelDate: new Date().toISOString().split('T')[0], liters: '', pricePerLiter: '', odometerReading: '', fuelStation: '' },
  });

  const watchLiters = watch('liters');
  const watchPrice  = watch('pricePerLiter');
  const totalCost   = useMemo(() => {
    const l = parseFloat(watchLiters);
    const p = parseFloat(watchPrice);
    if (!isNaN(l) && !isNaN(p)) return (l * p).toFixed(2);
    return '0.00';
  }, [watchLiters, watchPrice]);

  const onSubmit = async (data) => {
    try {
      if (!data.tripId) data.tripId = null;

      if (isEdit) {
        await updateFuelLog(editRecord.id, data);
        onSuccess('Fuel log updated successfully.', 'success');
      } else {
        await createFuelLog(data);
        onSuccess('Fuel entry added successfully.', 'success');
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Fuel Entry' : 'Add Fuel Entry'} size="lg">
      <form id="fuel-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field id="vehicleId" label="Vehicle *" error={errors.vehicleId}>
            <select id="vehicleId" className="form-input" {...register('vehicleId')}>
              <option value="">Select a vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleName} ({v.registrationNumber}) [Odo limit: {v.odometer} km]
                </option>
              ))}
            </select>
          </Field>
          <Field id="tripId" label="Associated Trip (Optional)" error={errors.tripId}>
            <select id="tripId" className="form-input" {...register('tripId')}>
              <option value="">None / Off-trip Refuel</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tripNumber} ({t.source} ➔ {t.destination})
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field id="liters" label="Liters *" error={errors.liters}>
            <input id="liters" type="number" step="any" className="form-input" placeholder="60" {...register('liters')} />
          </Field>
          <Field id="pricePerLiter" label="Price / Liter ($) *" error={errors.pricePerLiter}>
            <input id="pricePerLiter" type="number" step="any" className="form-input" placeholder="1.25" {...register('pricePerLiter')} />
          </Field>
          <div>
            <label className="form-label text-slate-500">Calculated Cost</label>
            <div className="bg-surface-900 border border-slate-800 rounded-xl px-3 h-9 flex items-center font-mono font-bold text-success-400">
              ${totalCost}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field id="odometerReading" label="Odometer Reading (km) *" error={errors.odometerReading}>
            <input id="odometerReading" type="number" className="form-input" placeholder="42350" {...register('odometerReading')} />
          </Field>
          <Field id="fuelDate" label="Refuel Date *" error={errors.fuelDate}>
            <input id="fuelDate" type="date" className="form-input" {...register('fuelDate')} />
          </Field>
        </div>

        <Field id="fuelStation" label="Fuel Station Name *" error={errors.fuelStation}>
          <input id="fuelStation" className="form-input" placeholder="Shell Midrand Ultra City" {...register('fuelStation')} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="fuel-submit-btn" type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : isEdit ? 'Save Entry' : 'Log Refuel'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function FuelLogs() {
  const queryClient = useQueryClient();
  const { toast, showToast, clearToast } = useToast();

  const [search, setSearch]             = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [page, setPage]                   = useState(1);

  const [showForm, setShowForm]           = useState(false);
  const [editRecord, setEditRecord]       = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);

  const { data: logsResponse, isLoading } = useQuery({ queryKey: ['fuel-logs'], queryFn: () => getFuelLogs() });
  const { data: vehiclesResponse }       = useQuery({ queryKey: ['vehicles'], queryFn: () => getVehicles() });
  const { data: tripsResponse }          = useQuery({ queryKey: ['trips'], queryFn: () => getTrips() });

  const logs = logsResponse?.data ?? [];
  const vehicles = vehiclesResponse?.data ?? [];
  const trips = tripsResponse?.data ?? [];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        log.fuelStation.toLowerCase().includes(q) ||
        log.vehicle.registrationNumber.toLowerCase().includes(q) ||
        (log.trip && log.trip.tripNumber.toLowerCase().includes(q));

      const matchVehicle = !vehicleFilter || log.vehicleId === vehicleFilter;

      return matchSearch && matchVehicle;
    });
  }, [logs, search, vehicleFilter]);

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, page]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFuelLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
      showToast('Fuel entry deleted successfully.');
      setDeleteTarget(null);
    },
    onError: (err) => {
      showToast(err?.response?.data?.message || 'Delete failed.', 'error');
      setDeleteTarget(null);
    },
  });

  const handleFormSuccess = (message, type) => {
    queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    showToast(message, type);
  };

  const columns = [
    { key: 'vehicle',     label: 'Vehicle',       render: (fl) => <div><p className="text-slate-300 font-medium text-xs truncate">{fl.vehicle.vehicleName}</p><p className="text-slate-500 text-[10px] font-mono">{fl.vehicle.registrationNumber}</p></div> },
    { key: 'trip',        label: 'Trip Link',     render: (fl) => fl.trip ? <span className="font-mono text-brand-300 font-semibold">{fl.trip.tripNumber}</span> : <span className="text-slate-500 text-xs">Off-trip refuel</span> },
    { key: 'date',        label: 'Refuel Date',   render: (fl) => new Date(fl.fuelDate).toLocaleDateString() },
    { key: 'liters',      label: 'Liters',        render: (fl) => `${fl.liters} L` },
    { key: 'price',       label: 'Price/Liter',   render: (fl) => `$${fl.pricePerLiter.toFixed(2)}` },
    { key: 'cost',        label: 'Total Cost',    render: (fl) => <span className="font-semibold text-success-400 font-mono">${fl.totalCost.toFixed(2)}</span> },
    { key: 'odometer',    label: 'Odometer (km)', render: (fl) => fl.odometerReading.toLocaleString() },
    { key: 'station',     label: 'Fuel Station',  render: (fl) => <span className="text-slate-300 text-xs truncate max-w-[130px] block" title={fl.fuelStation}>{fl.fuelStation}</span> },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (fl) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setEditRecord(fl); setShowForm(true); }} className="btn-ghost p-2" title="Edit Entry"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(fl)} className="btn-ghost p-2 text-slate-500 hover:text-danger-400 hover:bg-danger-500/10" title="Delete Entry"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in">
      <PageHeader
        title="Fuel Logbook"
        subtitle={`${filteredLogs.length} refuel entries logged`}
        action={
          <button id="add-fuel-btn" onClick={() => { setEditRecord(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Fuel Entry
          </button>
        }
      />

      <div className="card p-5">
        <FilterBar
          filters={[
            { id: 'fuel-vehicle-filter', value: vehicleFilter, onChange: (v) => { setVehicleFilter(v); setPage(1); }, options: [{ value: '', label: 'All Vehicles' }, ...vehicles.map((v) => ({ value: v.id, label: v.vehicleName }))] },
          ]}
        >
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search station or registration..."
            className="flex-1 min-w-[200px]"
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={paginatedLogs}
          isLoading={isLoading}
          emptyMessage="No fuel logs logged. Create a new log to start."
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filteredLogs.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      {showForm && (
        <FuelFormModal
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditRecord(null); }}
          editRecord={editRecord}
          vehicles={vehicles}
          trips={trips}
          onSuccess={handleFormSuccess}
        />
      )}

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        entityName={deleteTarget ? `Fuel Entry of ${deleteTarget.liters}L` : ''}
        isDeleting={deleteMutation.isPending}
      />

      <Toast toast={toast} onDismiss={clearToast} />
    </div>
  );
}
