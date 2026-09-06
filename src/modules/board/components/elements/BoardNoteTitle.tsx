import React from 'react';
import clsx from 'clsx';

export interface BoardNoteTitleProps {
  title?: string;
  isEditing?: boolean;
  themeBorder?: string;
  onUpdateTitle?: (newTitle: string) => void;
  className?: string;
}

export const BoardNoteTitle: React.FC<BoardNoteTitleProps> = ({
  title,
  isEditing = false,
  themeBorder,
  onUpdateTitle,
  className,
}) => {
  return (
    <div
      className={clsx(
        "w-full flex flex-col items-center justify-center pt-2.5 pb-1 px-8 select-none shrink-0 pointer-events-auto",
        className
      )}
      onPointerDown={(e) => {
        if (isEditing) e.stopPropagation();
      }}
    >
      {/* Nome da nota - Menor e centralizado */}
      {isEditing ? (
        <input
          type="text"
          value={title || ''}
          placeholder="Título da nota..."
          onChange={(e) => onUpdateTitle?.(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 bg-transparent border-b border-dashed border-neutral-400/80 outline-none text-center max-w-[160px] w-full px-1 py-0.5 transition-colors"
        />
      ) : (
        <span
          className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 tracking-wide truncate max-w-[160px] text-center"
          title={title || 'Sem título'}
        >
          {title || 'Sem título'}
        </span>
      )}

      {/* Divider menor que não encosta nas paredes da nota */}
      <div
        className="w-14 h-[1.5px] rounded-full mt-1.5 opacity-40 transition-colors"
        style={{ backgroundColor: themeBorder || '#1831D7' }}
      />
    </div>
  );
};
