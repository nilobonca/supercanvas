import React, { useState } from 'react';
import { SquarePen, Palette, Trash2, Focus, Check } from 'lucide-react';
import clsx from 'clsx';

export interface BoardNoteActionsProps {
  isSelected: boolean;
  isHovered: boolean;
  isEditing: boolean;
  themeBorder: string;
  themes: Record<string, { border: string; bg: string; name: string }>;
  onToggleEdit: () => void;
  onUpdateColor: (color: string) => void;
  onDelete: () => void;
  onCenterElement?: () => void;
  className?: string;
}

export const BoardNoteActions: React.FC<BoardNoteActionsProps> = ({
  isSelected,
  isHovered,
  isEditing,
  themeBorder,
  themes,
  onToggleEdit,
  onUpdateColor,
  onDelete,
  onCenterElement,
  className,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Visível no hover, na seleção ou durante edição
  const isVisible = isSelected || isHovered || isEditing || showColorPicker;

  return (
    <div
      className={clsx(
        "absolute -top-11 right-0 z-50 flex items-center gap-0.5 bg-white/95 dark:bg-[#181822]/95 backdrop-blur-md border border-stone-200/90 dark:border-white/10 rounded-xl p-1 shadow-xl select-none text-stone-700 dark:text-neutral-200 transition-opacity duration-150 prevent-item-drag prevent-edit-trigger",
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        className
      )}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Botão Cor */}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowColorPicker(prev => !prev);
          }}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-600 dark:text-neutral-300 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center"
          title="Cor da nota"
          aria-label="Mudar cor da nota"
        >
          <div 
            className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/20 shadow-2xs transition-transform hover:scale-110"
            style={{ backgroundColor: themeBorder }}
          />
        </button>

        {showColorPicker && (
          <div
            className="absolute top-full right-0 mt-2 bg-white dark:bg-[#181822] border border-stone-200/90 dark:border-white/10 p-2.5 rounded-2xl shadow-2xl z-50 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {Object.entries(themes).map(([key, t]) => (
              <button
                key={key}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateColor(t.border);
                  setShowColorPicker(false);
                }}
                className={clsx(
                  "w-6 h-6 rounded-lg border-2 transition-transform hover:scale-110 cursor-pointer shrink-0",
                  t.border.toLowerCase() === themeBorder.toLowerCase() ? "border-purple-600 scale-105" : "border-transparent"
                )}
                style={{
                  backgroundColor: t.border,
                }}
                title={t.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Botão Centralizar Objeto */}
      {onCenterElement && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCenterElement();
          }}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-600 dark:text-neutral-300 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center"
          title="Centralizar objeto no quadro"
          aria-label="Centralizar nota no quadro"
        >
          <Focus className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 3. Botão Editar */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleEdit();
        }}
        className={clsx(
          "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center",
          isEditing
            ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500/25"
            : "text-stone-600 dark:text-neutral-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10"
        )}
        title={isEditing ? "Concluir edição (Esc)" : "Editar nota (Clique duplo)"}
        aria-label={isEditing ? "Concluir edição" : "Editar nota"}
      >
        {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <SquarePen className="w-3.5 h-3.5" />}
      </button>

      {/* Divisor */}
      <div className="w-px h-4 bg-stone-200 dark:bg-white/10 mx-0.5" />

      {/* 4. Botão Excluir */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 dark:text-rose-400 transition-colors cursor-pointer flex items-center justify-center"
        title="Excluir nota"
        aria-label="Excluir nota"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
