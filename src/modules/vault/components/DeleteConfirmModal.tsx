import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName: string;
  isFolder?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isFolder = false
}) => {
  // Close on Escape or confirm on Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#16161D] border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-stone-900 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="px-5 pt-4 pb-1 flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 dark:hover:bg-white/10 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-3">
          <h3 className="text-base font-semibold text-stone-900 dark:text-neutral-100 mb-1">
            {isFolder ? 'Excluir Pasta?' : 'Excluir Nota?'}
          </h3>
          <p className="text-xs text-stone-600 dark:text-neutral-400 leading-relaxed">
            {isFolder ? (
              <>
                Tem certeza que deseja excluir a pasta <strong className="text-stone-900 dark:text-neutral-200 font-semibold">"{itemName}"</strong> e todo o seu conteúdo permanentemente?
              </>
            ) : (
              <>
                Tem certeza que deseja excluir permanentemente a nota <strong className="text-stone-900 dark:text-neutral-200 font-semibold">"{itemName}"</strong>?
              </>
            )}
          </p>

          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-[11px] text-rose-700 dark:text-rose-300 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Esta ação não poderá ser desfeita.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-stone-50 dark:bg-black/30 border-t border-stone-200 dark:border-white/10 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-stone-200/80 hover:bg-stone-300/80 dark:bg-white/10 dark:hover:bg-white/15 text-stone-700 dark:text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir {isFolder ? 'Pasta' : 'Nota'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
