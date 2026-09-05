import React, { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import { MoreVertical, Check, Sparkles, Code, Eye, BookmarkPlus, Trash2 } from 'lucide-react';
import { FORMATTING_COMMANDS, CATEGORY_LABELS, FormattingCommand } from '../utils/formattingCommands';

interface VaultFormattingMenuProps {
  editor: Editor | null;
  viewMode: 'live' | 'source' | 'reading';
  onViewModeChange: (mode: 'live' | 'source' | 'reading') => void;
  onMakeTemplate?: () => void;
  templateSuccess?: boolean;
  onDeleteNote?: () => void;
  disabled?: boolean;
}

export const VaultFormattingMenu: React.FC<VaultFormattingMenuProps> = ({
  editor,
  viewMode,
  onViewModeChange,
  onMakeTemplate,
  templateSuccess = false,
  onDeleteNote,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Group commands by category
  const categories: FormattingCommand['category'][] = ['headings', 'lists', 'blocks', 'inline'];

  const handleCommandClick = (cmd: FormattingCommand) => {
    if (!editor) return;
    cmd.execute(editor);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300'
            : 'bg-stone-100/80 dark:bg-white/5 hover:bg-stone-200/80 dark:hover:bg-white/10 text-stone-600 dark:text-neutral-300 border-stone-200/90 dark:border-white/10'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        title="Opções de exibição, formatação e ações da nota (...)"
        aria-label="Menu de Opções e Formatação"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-76 max-h-[78vh] overflow-y-auto bg-white dark:bg-[#16161D] border border-stone-200 dark:border-white/10 rounded-xl shadow-2xl p-2 custom-scrollbar select-none animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="px-2.5 py-1 text-[11px] font-semibold text-stone-500 dark:text-neutral-400 border-b border-stone-100 dark:border-white/5 mb-2 flex items-center justify-between">
            <span>Menu da Nota</span>
            <span className="text-[10px] text-stone-400 dark:text-neutral-500 font-normal">Dica: digite / para comandos</span>
          </div>

          {/* 1. Mode Switcher (Live Preview | Fonte | Leitura) */}
          <div className="px-1 mb-3">
            <div className="text-[10px] font-semibold tracking-wider text-stone-400 dark:text-neutral-500 uppercase mb-1.5">
              Modo de Exibição
            </div>
            <div className="grid grid-cols-3 gap-1 bg-stone-100/80 dark:bg-white/5 p-1 rounded-lg border border-stone-200/70 dark:border-white/5">
              <button
                onClick={() => {
                  onViewModeChange('live');
                  setIsOpen(false);
                }}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-md text-xs transition-colors cursor-pointer ${
                  viewMode === 'live'
                    ? 'bg-white dark:bg-white/15 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
                    : 'text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-neutral-200'
                }`}
                title="Live Preview (Edição rica em tempo real)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px]">Live Preview</span>
              </button>
              <button
                onClick={() => {
                  onViewModeChange('source');
                  setIsOpen(false);
                }}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-md text-xs transition-colors cursor-pointer ${
                  viewMode === 'source'
                    ? 'bg-white dark:bg-white/15 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
                    : 'text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-neutral-200'
                }`}
                title="Modo Fonte (Markdown puro com frontmatter)"
              >
                <Code className="w-3.5 h-3.5" />
                <span className="text-[11px]">Fonte</span>
              </button>
              <button
                onClick={() => {
                  onViewModeChange('reading');
                  setIsOpen(false);
                }}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-md text-xs transition-colors cursor-pointer ${
                  viewMode === 'reading'
                    ? 'bg-white dark:bg-white/15 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
                    : 'text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-neutral-200'
                }`}
                title="Modo Leitura (Visualização estática sem edição)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[11px]">Leitura</span>
              </button>
            </div>
          </div>

          <div className="border-t border-stone-100 dark:border-white/5 my-2" />

          {/* 2. Text Formatting Commands */}
          {viewMode === 'live' && editor ? (
            <div className="space-y-3 px-1">
              {categories.map((cat) => {
                const catCommands = FORMATTING_COMMANDS.filter((cmd) => cmd.category === cat);
                return (
                  <div key={cat} className="space-y-0.5">
                    <div className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-stone-400 dark:text-neutral-500 uppercase">
                      {CATEGORY_LABELS[cat]}
                    </div>

                    {catCommands.map((cmd) => {
                      const isActive = cmd.isActive ? cmd.isActive(editor) : false;
                      const IconComponent = cmd.icon;

                      return (
                        <button
                          key={cmd.id}
                          onClick={() => handleCommandClick(cmd)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-medium'
                              : 'hover:bg-stone-100 dark:hover:bg-white/5 text-stone-700 dark:text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-stone-400 dark:text-neutral-400'}`} />
                            <span className="text-xs truncate">{cmd.title}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {cmd.shortcut && (
                              <span className="text-[10px] font-mono text-stone-400 dark:text-neutral-500 px-1 py-0.5 rounded bg-stone-100 dark:bg-white/5">
                                {cmd.shortcut}
                              </span>
                            )}
                            {isActive && <Check className="w-3 h-3 text-purple-600 dark:text-purple-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-3 text-center text-xs text-stone-400 dark:text-neutral-500 bg-stone-50 dark:bg-white/[0.02] rounded-lg border border-stone-200/50 dark:border-white/5">
              <p className="mb-1.5">Comandos de formatação enriquecida disponíveis no modo <strong>Live Preview</strong>.</p>
              <button
                onClick={() => {
                  onViewModeChange('live');
                  setIsOpen(false);
                }}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium cursor-pointer"
              >
                Alternar para Live Preview
              </button>
            </div>
          )}

          {/* 3. Note Actions (Tornar Template & Excluir Nota) */}
          {(onMakeTemplate || onDeleteNote) && (
            <>
              <div className="border-t border-stone-100 dark:border-white/5 my-2" />
              <div className="space-y-1 px-1">
                <div className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-stone-400 dark:text-neutral-500 uppercase">
                  Ações da Nota
                </div>

                {onMakeTemplate && (
                  <button
                    onClick={() => {
                      onMakeTemplate();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      templateSuccess
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium'
                        : 'hover:bg-stone-100 dark:hover:bg-white/5 text-stone-700 dark:text-neutral-300'
                    }`}
                    title="Salvar esta nota como um modelo reutilizável (Template)"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {templateSuccess ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <BookmarkPlus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                      )}
                      <span className="text-xs truncate">
                        {templateSuccess ? 'Template Salvo com Sucesso!' : 'Tornar Template'}
                      </span>
                    </div>
                  </button>
                )}

                {onDeleteNote && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onDeleteNote();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                    title="Excluir esta nota permanentemente"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="text-xs truncate font-medium">Excluir Nota</span>
                    </div>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
