import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  blockId: string;
  selectedText?: string;
  existingNoteText?: string;
  onSave: (blockId: string, noteText: string, selectedText?: string) => void;
  onClose: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  blockId,
  selectedText,
  existingNoteText = '',
  onSave,
  onClose,
}) => {
  const [noteText, setNoteText] = useState(existingNoteText);

  useEffect(() => {
    setNoteText(existingNoteText || '');
  }, [existingNoteText, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Add Personal Note</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {selectedText && (
          <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs italic text-neutral-400">
            <span className="not-italic font-semibold text-neutral-500 block mb-1">
              Referenced Passage:
            </span>
            "{selectedText}"
          </div>
        )}

        <div className="mt-4">
          <textarea
            rows={4}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Type your personal observations, summaries, or questions here..."
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            autoFocus
          />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!noteText.trim()}
            onClick={() => {
              onSave(blockId, noteText.trim(), selectedText);
              onClose();
            }}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors shadow-md shadow-indigo-600/20"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};
