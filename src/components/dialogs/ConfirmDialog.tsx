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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#16171b] p-6 sm:p-7 shadow-2xl transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                isDestructive
                  ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                  : 'bg-[#ff6934]/10 text-[#ff6934] border border-[#ff6934]/20'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
          {message}
        </p>

        {requireMatchText && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              Type <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{requireMatchText}</span> to confirm:
            </label>
            <input
              type="text"
              value={typedText}
              onChange={e => setTypedText(e.target.value)}
              placeholder={requireMatchText}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-3.5 py-2 text-xs sm:text-sm text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="bouncy-btn px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-all"
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
            className={`bouncy-btn px-4 py-2 text-xs font-semibold text-white rounded-xl transition-all shadow-md ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25 disabled:opacity-50 disabled:pointer-events-none'
                : 'bg-[#ff6934] hover:bg-[#ff551b] shadow-[#ff6934]/25 disabled:opacity-50 disabled:pointer-events-none'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
