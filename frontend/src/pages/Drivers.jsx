import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';

import PageHeader     from '../components/ui/PageHeader';
import SearchBar      from '../components/ui/SearchBar';
import FilterBar      from '../components/ui/FilterBar';
import DataTable      from '../components/ui/DataTable';
import StatusBadge    from '../components/ui/StatusBadge';
import { SafetyScoreBadge } from '../components/ui/StatusBadge';
import Modal          from '../components/ui/Modal';
import DeleteDialog   from '../components/ui/DeleteDialog';
import Pagination     from '../components/ui/Pagination';
import Toast          from '../components/ui/Toast';
import { useToast }   from '../hooks/useToast';

import {
  getDrivers, createDriver, updateDriver, deleteDriver,
} from '../services/driver.service';

const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D', 'EB', 'EC'];
const DRIVER_STATUSES    = ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'];
const PAGE_SIZE = 10;

const driverFormSchema = z.object({
  fullName:        z.string().min(2, 'Min 2 characters').max(100).trim(),
  licenseNumber:   z.string().min(3, 'Min 3 characters').max(30).trim(),
  licenseCategory: z.enum(LICENSE_CATEGORIES, { required_error: 'Select a category' }),
  licenseExpiry:   z.string().min(1, 'Expiry date is required').refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
  contactNumber:   z.string().min(7, 'Min 7 characters').max(20).trim(),
  safetyScore:     z.coerce.number().int().min(0, 'Min 0').max(100, 'Max 100').optional().default(100),
  status:          z.enum(DRIVER_STATUSES).optional().default('AVAILABLE'),
});

function DriverFormModal({ isOpen, onClose, editDriver, onSuccess }) {
  const isEdit = !!editDriver;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(driverFormSchema),
    defaultValues: editDriver
      ? {
          ...editDriver,
          licenseExpiry: editDriver.licenseExpiry
            ? new Date(editDriver.licenseExpiry).toISOString().split('T')[0]
            : '',
        }
      : { fullName: '', licenseNumber: '', licenseCategory: 'B', licenseExpiry: '', contactNumber: '', safetyScore: 100, status: 'AVAILABLE' },
  });

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateDriver(editDriver.id, data);
        onSuccess('Driver updated successfully.', 'success');
      } else {
        await createDriver(data);
        onSuccess('Driver created successfully.', 'success');
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Driver' : 'Add Driver'} size="lg">
      <form id="driver-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field id="fullName" label="Full Name *" error={errors.fullName}>
            <input id="fullName" className="form-input" placeholder="James Cooper" {...register('fullName')} />
          </Field>
          <Field id="contactNumber" label="Contact Number *" error={errors.contactNumber}>
            <input id="contactNumber" className="form-input" placeholder="+27-83-001-0001" {...register('contactNumber')} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field id="licenseNumber" label="License Number *" error={errors.licenseNumber}>
            <input id="licenseNumber" className="form-input" placeholder="DL-10001" {...register('licenseNumber')} />
          </Field>
          <Field id="licenseCategory" label="License Category *" error={errors.licenseCategory}>
            <select id="licenseCategory" className="form-input" {...register('licenseCategory')}>
              {LICENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field id="licenseExpiry" label="License Expiry *" error={errors.licenseExpiry}>
            <input id="licenseExpiry" type="date" className="form-input" {...register('licenseExpiry')} />
          </Field>
          <Field id="safetyScore" label="Safety Score (0–100)" error={errors.safetyScore}>
            <input id="safetyScore" type="number" className="form-input" min={0} max={100} placeholder="100" {...register('safetyScore')} />
          </Field>
          <Field id="driver-status" label="Status" error={errors.status}>
            <select id="driver-status" className="form-input" {...register('status')}>
              {DRIVER_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="driver-submit-btn" type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {isSubmitting
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{isEdit ? 'Saving...' : 'Creating...'}</>
              : isEdit ? 'Save Changes' : 'Add Driver'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Drivers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast, showToast, clearToast } = useToast();

  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter]       = useState('');
  const [page, setPage]                 = useState(1);
  const [showForm, setShowForm]         = useState(false);
  const [editDriver, setEditDriver]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => getDrivers(),
  });

  const drivers = response?.data ?? [];

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        d.fullName.toLowerCase().includes(q) ||
        d.licenseNumber.toLowerCase().includes(q) ||
        d.contactNumber.toLowerCase().includes(q);
      const matchStatus = !statusFilter || d.status === statusFilter;
      const matchCat    = !catFilter    || d.licenseCategory === catFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [drivers, search, statusFilter, catFilter]);

  const paginatedDrivers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredDrivers.slice(start, start + PAGE_SIZE);
  }, [filteredDrivers, page]);

  const totalPages = Math.ceil(filteredDrivers.length / PAGE_SIZE);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      showToast('Driver deleted successfully.');
      setDeleteTarget(null);
    },
    onError: (err) => {
      showToast(err?.response?.data?.message || 'Delete failed.', 'error');
      setDeleteTarget(null);
    },
  });

  const handleFormSuccess = (message, type) => {
    queryClient.invalidateQueries({ queryKey: ['drivers'] });
    showToast(message, type);
  };

  const columns = [
    { key: 'fullName',        label: 'Driver Name',     render: (d) => <span className="text-slate-200 font-medium">{d.fullName}</span> },
    { key: 'licenseNumber',   label: 'License No.',     render: (d) => <span className="font-mono text-brand-300 text-sm">{d.licenseNumber}</span> },
    { key: 'licenseCategory', label: 'Category',        render: (d) => <span className="badge-neutral font-mono">{d.licenseCategory}</span> },
    {
      key: 'licenseExpiry',   label: 'Expiry',
      render: (d) => {
        const date = new Date(d.licenseExpiry);
        const expired = date < new Date();
        return <span className={expired ? 'text-danger-400 text-sm' : 'text-slate-300 text-sm'}>{date.toLocaleDateString()}{expired && ' ⚠️'}</span>;
      },
    },
    { key: 'contactNumber',   label: 'Contact',         render: (d) => <span className="text-slate-400 text-sm">{d.contactNumber}</span> },
    { key: 'safetyScore',     label: 'Safety Score',    render: (d) => <SafetyScoreBadge score={d.safetyScore} /> },
    { key: 'status',          label: 'Status',          render: (d) => <StatusBadge status={d.status} /> },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/drivers/${d.id}`)} className="btn-ghost p-2" title="View Details"><Eye className="w-4 h-4" /></button>
          <button onClick={() => { setEditDriver(d); setShowForm(true); }} className="btn-ghost p-2" title="Edit"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(d)} className="btn-ghost p-2 text-danger-400 hover:text-danger-300 hover:bg-danger-500/10" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in">
      <PageHeader
        title="Drivers"
        subtitle={`${filteredDrivers.length} driver${filteredDrivers.length !== 1 ? 's' : ''} found`}
        action={
          <button
            id="add-driver-btn"
            onClick={() => { setEditDriver(null); setShowForm(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Driver
          </button>
        }
      />

      <div className="card p-5">
        <FilterBar
          filters={[
            { id: 'driver-status-filter', value: statusFilter, onChange: (v) => { setStatusFilter(v); setPage(1); }, options: [{ value: '', label: 'All Statuses' }, ...DRIVER_STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') }))] },
            { id: 'category-filter',      value: catFilter,    onChange: (v) => { setCatFilter(v);    setPage(1); }, options: [{ value: '', label: 'All Categories' }, ...LICENSE_CATEGORIES.map((c) => ({ value: c, label: `Cat. ${c}` }))] },
          ]}
        >
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search drivers..."
            className="flex-1 min-w-[200px]"
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={paginatedDrivers}
          isLoading={isLoading}
          emptyMessage="No drivers found. Add your first driver to get started."
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filteredDrivers.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      <DriverFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditDriver(null); }}
        editDriver={editDriver}
        onSuccess={handleFormSuccess}
      />

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        entityName={deleteTarget ? `${deleteTarget.fullName} (${deleteTarget.licenseNumber})` : ''}
        isDeleting={deleteMutation.isPending}
      />

      <Toast toast={toast} onDismiss={clearToast} />
    </div>
  );
}
