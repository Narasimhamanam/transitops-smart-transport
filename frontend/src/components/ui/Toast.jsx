import { CheckCircle2, XCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-card border animate-in',
      isSuccess
        ? 'bg-success-500/10 border-success-500/30 text-success-400'
        : 'bg-danger-500/10 border-danger-500/30 text-danger-400'
    )}>
      {isSuccess
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <XCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="text-sm font-medium">{toast.message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
