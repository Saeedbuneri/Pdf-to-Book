import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  requireMatchText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  requireMatchText,
  onConfirm,
  onCancel,
}) => {
  const [typedText, setTypedText] = useState('');

  if (!isOpen) return null;

  const isConfirmDisabled = requireMatchText ? typedText !== requireMatchText : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDestructive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400'}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-neutral-300 leading-relaxed whitespace-pre-line">{message}</p>

        {requireMatchText && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Type <span className="font-mono font-bold text-rose-400">{requireMatchText}</span> to confirm:
            </label>
            <input
              type="text"
              value={typedText}
              onChange={e => setTypedText(e.target.value)}
              placeholder={requireMatchText}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isConfirmDisabled}
            onClick={() => {
              onConfirm();
              setTypedText('');
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:pointer-events-none'
                : 'bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
