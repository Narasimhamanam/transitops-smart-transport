import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { usePermission } from '../hooks/usePermission';

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
  getVehicles, createVehicle, updateVehicle, deleteVehicle,
} from '../services/vehicle.service';

// ---- Constants ----
const VEHICLE_TYPES   = ['CAR', 'VAN', 'MINIBUS', 'BUS', 'TRUCK', 'TRAILER', 'MOTORCYCLE'];
const VEHICLE_STATUSES = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'];
const PAGE_SIZE = 10;

// ---- Zod form schema ----
const vehicleFormSchema = z.object({
  registrationNumber: z.string().min(3, 'Min 3 characters').max(20).trim(),
  vehicleName:        z.string().min(2, 'Min 2 characters').max(100).trim(),
  vehicleType:        z.enum(VEHICLE_TYPES, { required_error: 'Select a type' }),
  maxLoadCapacity:    z.coerce.number({ invalid_type_error: 'Must be a number' }).positive('Must be positive'),
  odometer:           z.coerce.number().min(0, 'Cannot be negative').optional().default(0),
  acquisitionCost:    z.coerce.number({ invalid_type_error: 'Must be a number' }).min(0, 'Cannot be negative'),
  status:             z.enum(VEHICLE_STATUSES).optional().default('AVAILABLE'),
});

// ---- Vehicle Form Modal ----
function VehicleFormModal({ isOpen, onClose, editVehicle, onSuccess }) {
  const isEdit = !!editVehicle;
  const isRetired = editVehicle?.status === 'RETIRED';

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: editVehicle
      ? { ...editVehicle }
      : { registrationNumber: '', vehicleName: '', vehicleType: 'VAN', maxLoadCapacity: '', odometer: 0, acquisitionCost: '', status: 'AVAILABLE' },
  });

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateVehicle(editVehicle.id, data);
        onSuccess('Vehicle updated successfully.', 'success');
      } else {
        await createVehicle(data);
        onSuccess('Vehicle created successfully.', 'success');
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'} size="lg">
      {isRetired && (
        <div className="mb-4 px-3 py-2.5 bg-warning-500/10 border border-warning-500/30 rounded-xl text-warning-400 text-sm">
          ⚠️ Retired vehicles — only <strong>Status</strong> can be changed.
        </div>
      )}
      <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field id="registrationNumber" label="Registration Number *" error={errors.registrationNumber}>
            <input id="registrationNumber" className="form-input" disabled={isRetired} placeholder="TRN-001-AA" {...register('registrationNumber')} />
          </Field>
          <Field id="vehicleName" label="Vehicle Name *" error={errors.vehicleName}>
            <input id="vehicleName" className="form-input" disabled={isRetired} placeholder="Mercedes Sprinter" {...register('vehicleName')} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field id="vehicleType" label="Vehicle Type *" error={errors.vehicleType}>
            <select id="vehicleType" className="form-input" disabled={isRetired} {...register('vehicleType')}>
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field id="status" label="Status" error={errors.status}>
            <select id="status" className="form-input" {...register('status')}>
              {VEHICLE_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field id="maxLoadCapacity" label="Max Load (kg) *" error={errors.maxLoadCapacity}>
            <input id="maxLoadCapacity" type="number" className="form-input" disabled={isRetired} placeholder="1500" {...register('maxLoadCapacity')} />
          </Field>
          <Field id="odometer" label="Odometer (km)" error={errors.odometer}>
            <input id="odometer" type="number" className="form-input" disabled={isRetired} placeholder="42300" {...register('odometer')} />
          </Field>
          <Field id="acquisitionCost" label="Acquisition Cost ($) *" error={errors.acquisitionCost}>
            <input id="acquisitionCost" type="number" className="form-input" disabled={isRetired} placeholder="48000" {...register('acquisitionCost')} />
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="vehicle-submit-btn" type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{isEdit ? 'Saving...' : 'Creating...'}</> : isEdit ? 'Save Changes' : 'Add Vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---- Main Page ----
export default function Vehicles() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canCreateModule, canEditModule, canDeleteModule } = usePermission();
  const canCreate = canCreateModule('vehicles');
  const canEdit = canEditModule('vehicles');
  const canDelete = canDeleteModule('vehicles');
  const { toast, showToast, clearToast } = useToast();

  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [typeFilter, setTypeFilter]       = useState('');
  const [page, setPage]                   = useState(1);
  const [showForm, setShowForm]           = useState(false);
  const [editVehicle, setEditVehicle]     = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles(),
  });

  const vehicles = response?.data ?? [];

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        v.vehicleName.toLowerCase().includes(q) ||
        v.registrationNumber.toLowerCase().includes(q);
      const matchStatus = !statusFilter || v.status === statusFilter;
      const matchType   = !typeFilter   || v.vehicleType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [vehicles, search, statusFilter, typeFilter]);

  const paginatedVehicles = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredVehicles.slice(start, start + PAGE_SIZE);
  }, [filteredVehicles, page]);

  const totalPages = Math.ceil(filteredVehicles.length / PAGE_SIZE);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      showToast('Vehicle deleted successfully.');
      setDeleteTarget(null);
    },
    onError: (err) => {
      showToast(err?.response?.data?.message || 'Delete failed.', 'error');
      setDeleteTarget(null);
    },
  });

  const handleFormSuccess = (message, type) => {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    showToast(message, type);
  };

  const columns = [
    { key: 'registrationNumber', label: 'Reg. Number', render: (v) => <span className="font-mono text-brand-300 font-medium">{v.registrationNumber}</span> },
    { key: 'vehicleName',        label: 'Vehicle Name', render: (v) => <span className="text-slate-200 font-medium">{v.vehicleName}</span> },
    { key: 'vehicleType',        label: 'Type',         render: (v) => <span className="badge-neutral">{v.vehicleType}</span> },
    { key: 'maxLoadCapacity',    label: 'Capacity (kg)', render: (v) => v.maxLoadCapacity.toLocaleString() },
    { key: 'odometer',           label: 'Odometer (km)', render: (v) => v.odometer.toLocaleString() },
    { key: 'acquisitionCost',    label: 'Acq. Cost',    render: (v) => `$${v.acquisitionCost.toLocaleString()}` },
    { key: 'status',             label: 'Status',       render: (v) => <StatusBadge status={v.status} /> },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (v) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/vehicles/${v.id}`)} className="btn-ghost p-2" title="View Details"><Eye className="w-4 h-4" /></button>
          {canEdit && <button onClick={() => { setEditVehicle(v); setShowForm(true); }} className="btn-ghost p-2" title="Edit"><Pencil className="w-4 h-4" /></button>}
          {canDelete && <button onClick={() => setDeleteTarget(v)} className="btn-ghost p-2 text-danger-400 hover:text-danger-300 hover:bg-danger-500/10" title="Delete"><Trash2 className="w-4 h-4" /></button>}
        </div>
      ),
    },
  ];

  const statusFilterOptions = [
    { value: '', label: 'All Statuses' },
    ...VEHICLE_STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') })),
  ];

  const typeFilterOptions = [
    { value: '', label: 'All Types' },
    ...VEHICLE_TYPES.map((t) => ({ value: t, label: t })),
  ];

  return (
    <div className="animate-in">
      <PageHeader
        title="Fleet Vehicles"
        subtitle={`${filteredVehicles.length} vehicle${filteredVehicles.length !== 1 ? 's' : ''} found`}
        action={canCreate ? (
          <button
            id="add-vehicle-btn"
            onClick={() => { setEditVehicle(null); setShowForm(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        ) : null}
      />

      <div className="card p-5">
        <FilterBar
          filters={[
            { id: 'status-filter',  value: statusFilter, onChange: (v) => { setStatusFilter(v); setPage(1); }, options: statusFilterOptions },
            { id: 'type-filter',    value: typeFilter,   onChange: (v) => { setTypeFilter(v);   setPage(1); }, options: typeFilterOptions },
          ]}
        >
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search vehicles..."
            className="flex-1 min-w-[200px]"
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={paginatedVehicles}
          isLoading={isLoading}
          emptyMessage="No vehicles found. Add your first vehicle to get started."
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filteredVehicles.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      <VehicleFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditVehicle(null); }}
        editVehicle={editVehicle}
        onSuccess={handleFormSuccess}
      />

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        entityName={deleteTarget ? `${deleteTarget.vehicleName} (${deleteTarget.registrationNumber})` : ''}
        isDeleting={deleteMutation.isPending}
      />

      <Toast toast={toast} onDismiss={clearToast} />
    </div>
  );
}
