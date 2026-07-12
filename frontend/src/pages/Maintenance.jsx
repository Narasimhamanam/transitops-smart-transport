import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Wrench, Check, Ban, AlertTriangle } from 'lucide-react';
import { usePermission } from '../hooks/usePermission';
import { cn } from '../utils/cn';

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
  getMaintenances, createMaintenance, updateMaintenance, deleteMaintenance
} from '../services/maintenance.service';
import { getVehicles } from '../services/vehicle.service';

const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const TYPES = ['Routine Oil Change', 'Brake Replacement', 'Tire Rotation', 'Engine Tune-up', 'Electrical System repair', 'Body Work', 'Inspection', 'Suspension'];
const PAGE_SIZE = 10;

const maintenanceFormSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  maintenanceType: z.string().min(2, 'Type is too short').max(100).trim(),
  description: z.string().min(5, 'Description is too short').max(500).trim(),
  serviceCenter: z.string().min(2, 'Service center name is too short').max(100).trim(),
  estimatedCost: z.coerce.number().positive('Cost must be positive'),
  scheduledDate: z.string().min(1, 'Scheduled date is required').refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
  actualCost: z.coerce.number().positive('Cost must be positive').optional().nullable(),
  completedDate: z.string().optional().nullable(),
  status: z.enum(STATUSES).optional().default('SCHEDULED'),
});

function MaintenanceFormModal({ isOpen, onClose, editRecord, vehicles, onSuccess }) {
  const isEdit = !!editRecord;

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: editRecord
      ? {
          ...editRecord,
          scheduledDate: editRecord.scheduledDate ? new Date(editRecord.scheduledDate).toISOString().split('T')[0] : '',
          completedDate: editRecord.completedDate ? new Date(editRecord.completedDate).toISOString().split('T')[0] : '',
        }
      : { vehicleId: '', maintenanceType: 'Routine Oil Change', description: '', serviceCenter: '', estimatedCost: '', scheduledDate: '', actualCost: '', completedDate: '', status: 'SCHEDULED' },
  });

  const watchStatus = watch('status');

  // Smart Vehicle list: only show non-retired, non-trip vehicles when scheduling new maintenance
  const selectableVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (isEdit && v.id === editRecord.vehicleId) return true;
      return v.status !== 'RETIRED' && v.status !== 'ON_TRIP';
    });
  }, [vehicles, isEdit, editRecord]);

  const onSubmit = async (data) => {
    try {
      // Clean nullable fields
      if (!data.actualCost) data.actualCost = null;
      if (!data.completedDate) data.completedDate = null;

      if (isEdit) {
        await updateMaintenance(editRecord.id, data);
        onSuccess('Maintenance log updated successfully.', 'success');
      } else {
        await createMaintenance(data);
        onSuccess('Maintenance scheduled successfully.', 'success');
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Maintenance Log' : 'Schedule Maintenance'} size="lg">
      <form id="maintenance-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field id="vehicleId" label="Vehicle (Eligible List) *" error={errors.vehicleId}>
            <select id="vehicleId" className="form-input" {...register('vehicleId')}>
              <option value="">Select a vehicle...</option>
              {selectableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleName} ({v.registrationNumber}) [Odo: {v.odometer} km]
                </option>
              ))}
            </select>
          </Field>
          <Field id="maintenanceType" label="Maintenance Type *" error={errors.maintenanceType}>
            <select id="maintenanceType" className="form-input" {...register('maintenanceType')}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field id="serviceCenter" label="Service Center *" error={errors.serviceCenter}>
            <input id="serviceCenter" className="form-input" placeholder="George Service Center" {...register('serviceCenter')} />
          </Field>
          <Field id="status" label="Status" error={errors.status}>
            <select id="status" className="form-input" {...register('status')}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field id="estimatedCost" label="Estimated Cost ($) *" error={errors.estimatedCost}>
            <input id="estimatedCost" type="number" className="form-input" placeholder="250" {...register('estimatedCost')} />
          </Field>
          <Field id="scheduledDate" label="Scheduled Date *" error={errors.scheduledDate}>
            <input id="scheduledDate" type="date" className="form-input" {...register('scheduledDate')} />
          </Field>
        </div>

        {(watchStatus === 'COMPLETED' || isEdit) && (
          <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
            <Field id="actualCost" label="Actual Cost ($)" error={errors.actualCost}>
              <input id="actualCost" type="number" className="form-input" placeholder="245" {...register('actualCost')} />
            </Field>
            <Field id="completedDate" label="Completed Date" error={errors.completedDate}>
              <input id="completedDate" type="date" className="form-input" {...register('completedDate')} />
            </Field>
          </div>
        )}

        <Field id="description" label="Detailed Description *" error={errors.description}>
          <textarea id="description" rows={3} className="form-input" placeholder="Specify mechanical complaints or service requests..." {...register('description')} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="maintenance-submit-btn" type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : isEdit ? 'Save Changes' : 'Schedule Service'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Action transition confirmation modal
function ActionConfirmModal({ isOpen, onClose, onConfirm, title, desc, pending, actionText = 'Confirm', variant = 'brand' }) {
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
            {pending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</> : actionText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Maintenance() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canWriteModule } = usePermission();
  const canWrite = canWriteModule('maintenance');
  const { toast, showToast, clearToast } = useToast();

  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [page, setPage]                   = useState(1);

  const [showForm, setShowForm]           = useState(false);
  const [editRecord, setEditRecord]       = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);

  // States for lifecycle confirmations
  const [startTarget, setStartTarget]       = useState(null);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget]     = useState(null);

  const { data: mntResponse, isLoading } = useQuery({ queryKey: ['maintenances'], queryFn: () => getMaintenances() });
  const { data: vehiclesResponse }       = useQuery({ queryKey: ['vehicles'], queryFn: () => getVehicles() });

  const logs = mntResponse?.data ?? [];
  const vehicles = vehiclesResponse?.data ?? [];



  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        (item.maintenanceNumber && item.maintenanceNumber.toLowerCase().includes(q)) ||
        (item.maintenanceType && item.maintenanceType.toLowerCase().includes(q)) ||
        (item.serviceCenter && item.serviceCenter.toLowerCase().includes(q)) ||
        (item.vehicle?.registrationNumber && item.vehicle.registrationNumber.toLowerCase().includes(q));

      const matchStatus  = !statusFilter  || item.status === statusFilter;
      const matchVehicle = !vehicleFilter || item.vehicleId === vehicleFilter;

      return matchSearch && matchStatus && matchVehicle;
    });
  }, [logs, search, statusFilter, vehicleFilter]);
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, page]);


  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteMaintenance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      showToast('Maintenance log removed successfully.');
      setDeleteTarget(null);
    },
    onError: (err) => {
      showToast(err?.response?.data?.message || 'Delete failed.', 'error');
      setDeleteTarget(null);
    },
  });

  const transitionMutation = useMutation({
    mutationFn: ({ id, status, actualCost, completedDate }) => updateMaintenance(id, { status, actualCost, completedDate }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      showToast(`Maintenance successfully updated to ${variables.status.replace('_', ' ').toLowerCase()}!`);
      setStartTarget(null);
      setCompleteTarget(null);
      setCancelTarget(null);
    },
    onError: (err) => {
      showToast(err?.response?.data?.message || 'Status transition failed.', 'error');
      setStartTarget(null);
      setCompleteTarget(null);
      setCancelTarget(null);
    },
  });

  const handleFormSuccess = (message, type) => {
    queryClient.invalidateQueries({ queryKey: ['maintenances'] });
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    showToast(message, type);
  };

  const columns = [
    { key: 'maintenanceNumber', label: 'Mnt. Number', render: (m) => <span className="font-mono text-brand-300 font-medium">{m.maintenanceNumber}</span> },
    { key: 'vehicle',           label: 'Vehicle',     render: (m) => <div><p className="text-slate-300 font-medium text-xs truncate">{m.vehicle.vehicleName}</p><p className="text-slate-500 text-[10px] font-mono">{m.vehicle.registrationNumber}</p></div> },
    { key: 'type',              label: 'Service Type', render: (m) => <div className="max-w-[150px]"><p className="text-slate-200 font-semibold truncate">{m.maintenanceType}</p><p className="text-slate-500 text-xs truncate">{m.serviceCenter}</p></div> },
    { key: 'cost',              label: 'Costs',        render: (m) => <div><p className="text-slate-300 text-xs">Est: ${m.estimatedCost.toLocaleString()}</p>{m.actualCost && <p className="text-success-400 text-xs">Act: ${m.actualCost.toLocaleString()}</p>}</div> },
    { key: 'dates',             label: 'Schedule',     render: (m) => <div><p className="text-slate-400 text-xs">Sched: {new Date(m.scheduledDate).toLocaleDateString()}</p>{m.completedDate && <p className="text-slate-500 text-xs">Done: {new Date(m.completedDate).toLocaleDateString()}</p>}</div> },
    { key: 'status',            label: 'Status',       render: (m) => <span className={cn(
      m.status === 'SCHEDULED' ? 'badge-neutral' :
      m.status === 'IN_PROGRESS' ? 'badge-warning' :
      m.status === 'COMPLETED' ? 'badge-success' :
      'badge-danger',
      'badge'
    )}>{m.status.replace('_', ' ')}</span> },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/maintenance/${m.id}`)} className="btn-ghost p-2" title="View Details"><Eye className="w-4 h-4" /></button>

          {canWrite && m.status === 'SCHEDULED' && (
            <>
              <button onClick={() => { setEditRecord(m); setShowForm(true); }} className="btn-ghost p-2" title="Edit Scheduled Log"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => setStartTarget(m)} className="btn-ghost p-2 text-warning-400 hover:text-warning-300 hover:bg-warning-500/10" title="Start Service"><Wrench className="w-4 h-4" /></button>
            </>
          )}

          {canWrite && m.status === 'IN_PROGRESS' && (
            <>
              <button onClick={() => { setEditRecord(m); setShowForm(true); }} className="btn-ghost p-2" title="Edit Cost & Details"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => setCompleteTarget(m)} className="btn-ghost p-2 text-success-400 hover:text-success-300 hover:bg-success-500/10" title="Complete Service"><Check className="w-4 h-4" /></button>
            </>
          )}

          {canWrite && (m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS') && (
            <button onClick={() => setCancelTarget(m)} className="btn-ghost p-2 text-danger-400 hover:text-danger-300 hover:bg-danger-500/10" title="Cancel Service"><Ban className="w-4 h-4" /></button>
          )}

          {canWrite && (m.status === 'SCHEDULED' || m.status === 'CANCELLED') && (
            <button onClick={() => setDeleteTarget(m)} className="btn-ghost p-2 text-slate-500 hover:text-danger-400 hover:bg-danger-500/10" title="Delete Log"><Trash2 className="w-4 h-4" /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in">
      <PageHeader
        title="Fleet Maintenance Logs"
        subtitle={`${filteredLogs.length} maintenance file${filteredLogs.length !== 1 ? 's' : ''} tracked`}
        action={canWrite ? (
          <button id="schedule-service-btn" onClick={() => { setEditRecord(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Schedule Service
          </button>
        ) : null}
      />

      <div className="card p-5">
        <FilterBar
          filters={[
            { id: 'mnt-status-filter', value: statusFilter, onChange: (v) => { setStatusFilter(v); setPage(1); }, options: [{ value: '', label: 'All Statuses' }, ...STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') }))] },
            { id: 'mnt-vehicle-filter', value: vehicleFilter, onChange: (v) => { setVehicleFilter(v); setPage(1); }, options: [{ value: '', label: 'All Vehicles' }, ...vehicles.map((v) => ({ value: v.id, label: v.vehicleName }))] },
          ]}
        >
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search maintenance logs..."
            className="flex-1 min-w-[200px]"
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={paginatedLogs}
          isLoading={isLoading}
          emptyMessage="No maintenance records found. Schedule a service to start."
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
        <MaintenanceFormModal
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditRecord(null); }}
          editRecord={editRecord}
          vehicles={vehicles}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Confirmation Actions */}
      <ActionConfirmModal
        isOpen={!!startTarget}
        onClose={() => setStartTarget(null)}
        onConfirm={() => transitionMutation.mutate({ id: startTarget.id, status: 'IN_PROGRESS' })}
        title="Start Maintenance Service"
        desc={startTarget ? `Start maintenance task ${startTarget.maintenanceNumber}? This will mark vehicle (${startTarget.vehicle.vehicleName}) as IN SHOP.` : ''}
        pending={transitionMutation.isPending}
        actionText="Start Service"
        variant="brand"
      />

      <ActionConfirmModal
        isOpen={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        onConfirm={() => transitionMutation.mutate({ id: completeTarget.id, status: 'COMPLETED', actualCost: completeTarget.estimatedCost })}
        title="Complete Maintenance"
        desc={completeTarget ? `Complete maintenance task ${completeTarget.maintenanceNumber}? Vehicle (${completeTarget.vehicle.vehicleName}) status will return to AVAILABLE.` : ''}
        pending={transitionMutation.isPending}
        actionText="Mark Completed"
        variant="success"
      />

      <ActionConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => transitionMutation.mutate({ id: cancelTarget.id, status: 'CANCELLED' })}
        title="Cancel Maintenance"
        desc={cancelTarget ? `Cancel maintenance task ${cancelTarget.maintenanceNumber}? Assigned vehicle status will return to AVAILABLE if it was in the shop.` : ''}
        pending={transitionMutation.isPending}
        actionText="Cancel Service"
        variant="danger"
      />

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        entityName={deleteTarget ? `Maintenance Record ${deleteTarget.maintenanceNumber}` : ''}
        isDeleting={deleteMutation.isPending}
      />

      <Toast toast={toast} onDismiss={clearToast} />
    </div>
  );
}
