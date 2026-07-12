import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

/**
 * Delete confirmation dialog.
 * @param {{ isOpen, onClose, onConfirm, entityName, isDeleting }} props
 */
export default function DeleteDialog({ isOpen, onClose, onConfirm, entityName, isDeleting }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion" size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-danger-500/10 border border-danger-500/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-danger-400" />
        </div>
        <div>
          <p className="text-slate-200 font-medium">Delete {entityName}?</p>
          <p className="text-slate-400 text-sm mt-1">
            This action cannot be undone. The record will be permanently removed.
          </p>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            id="delete-confirm-btn"
            onClick={onConfirm}
            disabled={isDeleting}
            className="btn-danger flex-1 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
