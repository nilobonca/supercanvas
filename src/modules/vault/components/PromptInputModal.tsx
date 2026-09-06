import React, { useState, useEffect, useRef } from 'react';
import { Edit3, X, Check } from 'lucide-react';

export interface PromptInputModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  onConfirm: (value: string) => void | Promise<void>;
}

export const PromptInputModal: React.FC<PromptInputModalProps> = ({
  isOpen,
  title,
  description,
  defaultValue = '',
  placeholder = '',
  confirmText = 'Confirmar',
  icon,
  onClose,
  onConfirm,
}) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza o valor padrão ao abrir
  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      // Foca e seleciona o texto para digitação ou confirmação imediata
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultValue]);

  // Tecla Escape para fechar
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    await onConfirm(value.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#16161D] border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-stone-900 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-1 flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#1831D7]/10 border border-[#7F95FF]/30 flex items-center justify-center text-[#1831D7] dark:text-[#7F95FF] shrink-0">
            {icon || <Edit3 className="w-5 h-5" />}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-stone-100 dark:hover:bg-white/10 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-5 py-3">
            <h3 className="text-base font-semibold text-stone-900 dark:text-neutral-100 mb-1">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-stone-600 dark:text-neutral-400 leading-relaxed mb-3">
                {description}
              </p>
            )}

            <div className="mt-2">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-white/15 bg-stone-50 dark:bg-black/30 text-stone-900 dark:text-neutral-100 text-sm outline-none focus:ring-2 focus:ring-[#7F95FF]/50 focus:border-[#1831D7] transition-all font-medium placeholder:text-stone-400 dark:placeholder:text-neutral-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 bg-stone-50 dark:bg-black/30 border-t border-stone-200 dark:border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-stone-200/80 hover:bg-stone-300/80 dark:bg-white/10 dark:hover:bg-white/15 text-stone-700 dark:text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-[#1831D7] hover:bg-[#1831D7]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{confirmText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
