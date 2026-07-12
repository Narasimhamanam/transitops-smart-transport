import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Landmark, AlertTriangle } from 'lucide-react';
import { usePermission } from '../hooks/usePermission';

import PageHeader   from '../components/ui/PageHeader';
import SearchBar    from '../components/ui/SearchBar';
import FilterBar    from '../components/ui/FilterBar';
import DataTable    from '../components/ui/DataTable';
import Modal        from '../components/ui/Modal';
import DeleteDialog from '../components/ui/DeleteDialog';
import Pagination   from '../components/ui/Pagination';
import Toast        from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/expense.service';
import { getTrips } from '../services/trip.service';

const PAGE_SIZE = 10;
const EXPENSE_TYPES = ['TOLL', 'FOOD', 'REPAIR', 'PARKING', 'MISCELLANEOUS'];

const expenseFormSchema = z.object({
  tripId: z.string().min(1, 'Trip is required'),
  expenseType: z.enum(EXPENSE_TYPES, { errorMap: () => ({ message: 'Invalid category' }) }),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().min(3, 'Description is too short').max(200).trim(),
  expenseDate: z.string().min(1, 'Date is required').refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
});

function ExpenseFormModal({ isOpen, onClose, editRecord, trips, onSuccess }) {
  const isEdit = !!editRecord;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: editRecord
      ? {
          ...editRecord,
          expenseDate: editRecord.expenseDate ? new Date(editRecord.expenseDate).toISOString().split('T')[0] : '',
        }
      : { tripId: '', expenseType: 'TOLL', amount: '', description: '', expenseDate: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateExpense(editRecord.id, data);
        onSuccess('Expense updated successfully.', 'success');
      } else {
        await createExpense(data);
        onSuccess('Expense tracked successfully.', 'success');
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Expense Record' : 'Track Expense'} size="md">
      <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field id="tripId" label="Associated Trip *" error={errors.tripId}>
          <select id="tripId" className="form-input" {...register('tripId')}>
            <option value="">Select a trip link...</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tripNumber} ({t.source} ➔ {t.destination})
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field id="expenseType" label="Category *" error={errors.expenseType}>
            <select id="expenseType" className="form-input" {...register('expenseType')}>
              {EXPENSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field id="amount" label="Amount ($) *" error={errors.amount}>
            <input id="amount" type="number" step="any" className="form-input" placeholder="45.00" {...register('amount')} />
          </Field>
        </div>

        <Field id="expenseDate" label="Expense Date *" error={errors.expenseDate}>
          <input id="expenseDate" type="date" className="form-input" {...register('expenseDate')} />
        </Field>

        <Field id="description" label="Short Description *" error={errors.description}>
          <input id="description" className="form-input" placeholder="Toll plaza cash slip" {...register('description')} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button id="expense-submit-btn" type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : isEdit ? 'Save Record' : 'Track Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Expenses() {
  const queryClient = useQueryClient();
  const { toast, showToast, clearToast } = useToast();
  const { canWriteModule } = usePermission();
  const canWrite = canWriteModule('expenses');

  const [search, setSearch]         = useState('');
  const [tripFilter, setTripFilter]   = useState('');
  const [page, setPage]               = useState(1);

  const [showForm, setShowForm]       = useState(false);
  const [editRecord, setEditRecord]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: expResponse, isLoading } = useQuery({ queryKey: ['expenses'], queryFn: () => getExpenses() });
  const { data: tripsResponse }          = useQuery({ queryKey: ['trips'], queryFn: () => getTrips() });

  const list = expResponse?.data ?? [];
  const trips = tripsResponse?.data ?? [];
  const filteredExpenses = useMemo(() => {
    return list.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.expenseType && item.expenseType.toLowerCase().includes(q)) ||
        (item.trip?.tripNumber && item.trip.tripNumber.toLowerCase().includes(q));

      const matchTrip = !tripFilter || item.tripId === tripFilter;

      return matchSearch && matchTrip;
    });
  }, [list, search, tripFilter]);


  const paginatedExpenses = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredExpenses.slice(start, start + PAGE_SIZE);
  }, [filteredExpenses, page]);

  const totalPages = Math.ceil(filteredExpenses.length / PAGE_SIZE);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      showToast('Expense record deleted successfully.');
      setDeleteTarget(null);
    },
    onError: (err) => {
      showToast(err?.response?.data?.message || 'Delete failed.', 'error');
      setDeleteTarget(null);
    },
  });

  const handleFormSuccess = (message, type) => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    showToast(message, type);
  };

  const columns = [
    { key: 'trip',        label: 'Trip Link',     render: (ex) => <span className="font-mono text-brand-300 font-semibold">{ex.trip.tripNumber}</span> },
    { key: 'category',    label: 'Category',      render: (ex) => <span className="badge badge-brand">{ex.expenseType}</span> },
    { key: 'amount',      label: 'Amount',        render: (ex) => <span className="font-semibold font-mono text-success-400">${ex.amount.toFixed(2)}</span> },
    { key: 'description', label: 'Description',   render: (ex) => <span className="text-slate-300 text-xs truncate max-w-[180px] block" title={ex.description}>{ex.description}</span> },
    { key: 'date',        label: 'Expense Date',  render: (ex) => new Date(ex.expenseDate).toLocaleDateString() },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (ex) => (
        <div className="flex items-center justify-end gap-1">
          {canWrite && <button onClick={() => { setEditRecord(ex); setShowForm(true); }} className="btn-ghost p-2" title="Edit Record"><Pencil className="w-4 h-4" /></button>}
          {canWrite && <button onClick={() => setDeleteTarget(ex)} className="btn-ghost p-2 text-slate-500 hover:text-danger-400 hover:bg-danger-500/10" title="Delete Record"><Trash2 className="w-4 h-4" /></button>}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in">
      <PageHeader
        title="Active Operations Expenses"
        subtitle={`${filteredExpenses.length} expense transactions filed`}
        action={canWrite ? (
          <button id="add-expense-btn" onClick={() => { setEditRecord(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Track Expense
          </button>
        ) : null}
      />

      <div className="card p-5">
        <FilterBar
          filters={[
            { id: 'exp-trip-filter', value: tripFilter, onChange: (v) => { setTripFilter(v); setPage(1); }, options: [{ value: '', label: 'All Trips' }, ...trips.map((t) => ({ value: t.id, label: t.tripNumber }))] },
          ]}
        >
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search category or desc..."
            className="flex-1 min-w-[200px]"
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={paginatedExpenses}
          isLoading={isLoading}
          emptyMessage="No operations expenses filed. Create a new log to start."
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filteredExpenses.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      {showForm && (
        <ExpenseFormModal
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditRecord(null); }}
          editRecord={editRecord}
          trips={trips}
          onSuccess={handleFormSuccess}
        />
      )}

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        entityName={deleteTarget ? `$${deleteTarget.amount} [${deleteTarget.expenseType}]` : ''}
        isDeleting={deleteMutation.isPending}
      />

      <Toast toast={toast} onDismiss={clearToast} />
    </div>
  );
}
