import { useState, useCallback } from 'react';

/**
 * Lightweight toast state hook.
 * Returns { toast, showToast, clearToast }
 * toast: { message: string, type: 'success' | 'error' } | null
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  return { toast, showToast, clearToast };
}
