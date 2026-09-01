import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlertCircle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reasonText?: string) => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  requireReason = false,
  reasonLabel = 'Reason for this action',
  reasonPlaceholder = 'Please enter detailed explanation...',
  loading = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('Please provide a reason before continuing.');
      return;
    }
    setError('');
    await onConfirm(reason.trim());
    setReason('');
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle className="w-6 h-6 text-rose-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      default:
        return <HelpCircle className="w-6 h-6 text-blue-600" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-400';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-400';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start space-x-3.5">
          <div className="shrink-0 p-2 rounded-xl bg-zinc-100">{getIcon()}</div>
          <div className="text-sm text-zinc-600 leading-relaxed pt-0.5">{message}</div>
        </div>

        {requireReason && (
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
              {reasonLabel} <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="confirm-dialog-reason-textarea"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={reasonPlaceholder}
              className="w-full text-sm rounded-lg border border-zinc-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-xs text-rose-600">{error}</p>}
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-100">
          <button
            type="button"
            id="confirm-dialog-cancel-btn"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            id="confirm-dialog-submit-btn"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg shadow-xs transition-colors focus:ring-2 ${getButtonClass()}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
