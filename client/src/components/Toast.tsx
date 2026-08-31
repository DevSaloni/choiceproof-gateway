import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from './Icons';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-portal">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-600" />}
            {toast.type === 'warning' && <AlertCircle size={18} className="text-amber-600" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-red-600" />}
            {toast.type === 'info' && <Info size={18} className="text-blue-600" />}
          </div>
          <div className="toast-content">{toast.message}</div>
          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss toast"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
