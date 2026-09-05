import React, { useState, useRef, useEffect } from 'react';
import { ActiveNote } from '@/interfaces/utils/indexedDB';
import { useCanvas } from '../canva-teste';
import { 
  Trash2, 
  Edit2, 
  Check, 
  Focus, 
  Palette, 
  Square, 
  Ban, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Plus, 
  Minus 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { cleanLegacyPlaceholder } from '@/utils/cleanLegacyPlaceholder';

interface NoteItemProps {
  note: ActiveNote;
  onUpdate: (note: ActiveNote) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent | React.PointerEvent | React.TouchEvent) => void;
  zIndex?: number;
  onContextMenu?: (e: React.MouseEvent) => void;
}

/**
 * Calcula cor de texto de alto contraste (preto ou branco)
 * com base na luminância YIQ da cor de fundo hex.
 */
function getContrastTextColor(hexColor?: string): string {
  if (!hexColor || hexColor === 'transparent') return '#1c1917';
  const clean = hexColor.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 145 ? '#1c1917' : '#f8fafc';
  }
  return '#1c1917';
}

const PRESET_COLORS = [
  { name: 'Amarelo', hex: '#fef08a' },
  { name: 'Rosa', hex: '#fbcfe8' },
  { name: 'Azul', hex: '#bae6fd' },
  { name: 'Verde', hex: '#bbf7d0' },
  { name: 'Lavanda', hex: '#ede9fe' },
  { name: 'Pêssego', hex: '#fed7aa' },
  { name: 'Cinza', hex: '#f3f4f6' },
  { name: 'Ardósia', hex: '#1e293b' },
  { name: 'Branco', hex: '#ffffff' },
];

export default function NoteItem({
  note,
  onUpdate,
  onDelete,
  isSelected = false,
  onSelect,
  zIndex,
  onContextMenu,
}: NoteItemProps) {
  const { centerOn } = useCanvas();
  const [text, setText] = useState(() => cleanLegacyPlaceholder(note.content));
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wasSelectedRef = useRef(isSelected);
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

  // Sincroniza conteúdo externo com estado local (sempre sanitizado)
  useEffect(() => {
    setText(cleanLegacyPlaceholder(note.content));
  }, [note.content]);

  // Purga permanentemente qualquer placeholder residual gravado no banco de dados
  useEffect(() => {
    const cleaned = cleanLegacyPlaceholder(note.content);
    if (note.content && note.content !== cleaned) {
      onUpdate({ ...note, content: cleaned });
    }
  }, [note.content, onUpdate]);

  // Se o item for desmarcado, fecha modo de edição e popover
  useEffect(() => {
    if (!isSelected) {
      setIsEditing(false);
      setShowColorPicker(false);
    }
  }, [isSelected]);

  // Ao entrar no modo de edição, foca e coloca cursor no final
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  // Auto-ajuste de altura conforme o conteúdo digitado
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(100, textareaRef.current.scrollHeight)}px`;
    }
  }, [text, note.width, note.fontSize]);

  // Mudança de texto
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onUpdate({ ...note, content: e.target.value });
  };

  // Rastreia estado no mousedown
  const handleMouseDown = (e: React.MouseEvent) => {
    wasSelectedRef.current = isSelected;
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  // Clique simples: se já ativo antes deste clique e não editando, ativa edição
  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.prevent-edit-trigger')) return;

    if (mouseDownPosRef.current) {
      const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
      const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);
      if (dx > 5 || dy > 5) return;
    }

    if (wasSelectedRef.current && !isEditing) {
      setIsEditing(true);
    }
  };

  // Clique duplo: sempre ativa edição
  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.prevent-edit-trigger')) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  // Centralizar o canvas na posição da nota
  const handleCenterOnNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const w = note.width || 220;
    const h = textareaRef.current?.offsetHeight || 110;
    centerOn?.(note.position.x + w / 2, note.position.y + h / 2);
  };

  // Teclado na textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation(); // Evita atalhos do canvas (como delete ou space)
    if (e.key === 'Escape') {
      setIsEditing(false);
      textareaRef.current?.blur();
    }
  };

  // Blur na textarea
  const handleBlur = (e: React.FocusEvent) => {
    // Se o clique foi no toolbar de opções, mantém o modo de edição
    if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest(`#note-toolbar-${note.id}`)) {
      return;
    }
    setIsEditing(false);
  };

  // Alterações de estilo
  const handleColorChange = (color: string) => {
    onUpdate({ ...note, color, fillMode: 'filled', transparentBg: false });
  };

  const handleBorderColorChange = (borderColor: string) => {
    onUpdate({ ...note, borderColor });
  };

  const handleModeChange = (mode: 'filled' | 'transparent' | 'outlined') => {
    onUpdate({
      ...note,
      fillMode: mode,
      transparentBg: mode === 'transparent' || mode === 'outlined',
    });
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(10, Math.min(64, (note.fontSize || 15) + delta));
    onUpdate({ ...note, fontSize: newSize });
  };

  const handleTextAlignChange = (align: 'left' | 'center' | 'right') => {
    onUpdate({ ...note, textAlign: align });
  };

  // Propriedades visuais do container
  const width = note.width || 220;
  const isFilled = note.fillMode === 'filled' || !note.fillMode;
  const isOutlined = note.fillMode === 'outlined';
  const isTransparent = note.fillMode === 'transparent';

  const bgColor = isFilled ? (note.color || '#fef08a') : 'transparent';
  const borderColor = isOutlined 
    ? (note.borderColor || '#8b5cf6') 
    : isTransparent 
      ? (isSelected ? 'rgba(59, 130, 246, 0.4)' : 'transparent') 
      : 'rgba(0,0,0,0.08)';
  const borderWidth = isOutlined ? (note.borderWidth || 2) : 1;
  const textColor = note.fontColor || (isFilled ? getContrastTextColor(bgColor) : undefined);

  return (
    <div
      style={{ width }}
      className="relative select-none group"
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={onContextMenu}
    >
      {/* ============================================================
          BOTÕES DE OPÇÕES EM CIMA DO RETÂNGULO DA NOTA NO LADO DIREITO
          (Cor, Centralizar Objeto, Editar, Excluir)
          ============================================================ */}
      {isSelected && (
        <div
          id={`note-toolbar-${note.id}`}
          className="absolute -top-11 right-0 flex items-center gap-0.5 bg-white/95 dark:bg-[#181822]/95 backdrop-blur-md border border-stone-200/90 dark:border-white/10 rounded-xl p-1 shadow-xl z-50 select-none prevent-item-drag prevent-edit-trigger text-stone-700 dark:text-neutral-200"
          onMouseDown={(e) => e.stopPropagation()}
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
              onMouseDown={(e) => e.preventDefault()}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-600 dark:text-neutral-300 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center"
              title="Cor e estilo"
              aria-label="Opções de cor e estilo"
            >
              <div 
                className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/20 shadow-2xs transition-transform hover:scale-110"
                style={{
                  backgroundColor: isFilled ? (note.color || '#fef08a') : 'transparent',
                  borderColor: isOutlined ? (note.borderColor || '#8b5cf6') : undefined,
                  borderWidth: isOutlined ? 2 : 1
                }}
              />
            </button>

            {/* Menu Popover de Cores e Tipografia */}
            {showColorPicker && (
              <div 
                className="absolute top-full right-0 mt-2 p-3 bg-white dark:bg-[#181822] rounded-2xl shadow-2xl border border-stone-200/90 dark:border-white/10 w-64 flex flex-col gap-3 z-50 text-stone-900 dark:text-neutral-100 text-xs animate-in fade-in zoom-in-95 duration-150"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Seleção do Modo de Preenchimento */}
                <div className="flex gap-1 bg-stone-100 dark:bg-white/5 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleModeChange('filled')}
                    className={cn(
                      "flex-1 py-1 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-[11px] cursor-pointer",
                      isFilled 
                        ? "bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-xs" 
                        : "text-stone-500 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white"
                    )}
                  >
                    <Square size={12} fill="currentColor" />
                    <span>Cheio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('transparent')}
                    className={cn(
                      "flex-1 py-1 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-[11px] cursor-pointer",
                      isTransparent 
                        ? "bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-xs" 
                        : "text-stone-500 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white"
                    )}
                  >
                    <Ban size={12} />
                    <span>Livre</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('outlined')}
                    className={cn(
                      "flex-1 py-1 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-[11px] cursor-pointer",
                      isOutlined 
                        ? "bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-xs" 
                        : "text-stone-500 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white"
                    )}
                  >
                    <Square size={12} />
                    <span>Borda</span>
                  </button>
                </div>

                {/* Paleta de Cores Pré-definidas */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-neutral-500">
                    {isOutlined ? 'Cor da Borda' : 'Cor de Fundo'}
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => isOutlined ? handleBorderColorChange(c.hex) : handleColorChange(c.hex)}
                        className={cn(
                          "w-7 h-7 rounded-lg border border-black/10 dark:border-white/10 transition-transform hover:scale-110 cursor-pointer flex items-center justify-center relative",
                          (isOutlined ? note.borderColor === c.hex : note.color === c.hex) && "ring-2 ring-purple-500 scale-105"
                        )}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                    {/* Seletor de Cor Livre Hex */}
                    <label 
                      className="w-7 h-7 rounded-lg border border-dashed border-stone-300 dark:border-white/20 transition-transform hover:scale-110 cursor-pointer flex items-center justify-center relative overflow-hidden bg-stone-50 dark:bg-white/5"
                      title="Cor personalizada"
                    >
                      <input
                        type="color"
                        value={isOutlined ? (note.borderColor || '#8b5cf6') : (note.color || '#fef08a')}
                        onChange={(e) => isOutlined ? handleBorderColorChange(e.target.value) : handleColorChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Palette size={13} className="text-stone-500 dark:text-neutral-400 pointer-events-none" />
                    </label>
                  </div>
                </div>

                {/* Ajuste de Tamanho de Fonte e Alinhamento */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200/80 dark:border-white/10 gap-2">
                  {/* Tamanho da Fonte */}
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-white/5 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleFontSizeChange(-2)}
                      className="p-1 hover:bg-white dark:hover:bg-white/10 rounded text-stone-600 dark:text-neutral-300 cursor-pointer"
                      title="Diminuir fonte"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-[11px] font-mono px-1 min-w-[20px] text-center font-semibold">
                      {note.fontSize || 15}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleFontSizeChange(2)}
                      className="p-1 hover:bg-white dark:hover:bg-white/10 rounded text-stone-600 dark:text-neutral-300 cursor-pointer"
                      title="Aumentar fonte"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  {/* Alinhamento de Texto */}
                  <div className="flex items-center gap-0.5 bg-stone-100 dark:bg-white/5 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleTextAlignChange('left')}
                      className={cn(
                        "p-1 rounded cursor-pointer transition-colors",
                        (note.textAlign === 'left' || !note.textAlign) 
                          ? "bg-white dark:bg-white/15 text-purple-600 dark:text-purple-300 shadow-2xs" 
                          : "text-stone-500 hover:text-stone-900 dark:text-neutral-400"
                      )}
                      title="Alinhar à esquerda"
                    >
                      <AlignLeft size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTextAlignChange('center')}
                      className={cn(
                        "p-1 rounded cursor-pointer transition-colors",
                        note.textAlign === 'center' 
                          ? "bg-white dark:bg-white/15 text-purple-600 dark:text-purple-300 shadow-2xs" 
                          : "text-stone-500 hover:text-stone-900 dark:text-neutral-400"
                      )}
                      title="Centralizar texto"
                    >
                      <AlignCenter size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTextAlignChange('right')}
                      className={cn(
                        "p-1 rounded cursor-pointer transition-colors",
                        note.textAlign === 'right' 
                          ? "bg-white dark:bg-white/15 text-purple-600 dark:text-purple-300 shadow-2xs" 
                          : "text-stone-500 hover:text-stone-900 dark:text-neutral-400"
                      )}
                      title="Alinhar à direita"
                    >
                      <AlignRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Botão Centralizar Objeto */}
          <button
            type="button"
            onClick={handleCenterOnNote}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-600 dark:text-neutral-300 hover:text-stone-950 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Centralizar objeto no canvas"
            aria-label="Centralizar nota no canvas"
          >
            <Focus size={14} />
          </button>

          {/* 3. Botão Editar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(prev => !prev);
            }}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center",
              isEditing 
                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500/25" 
                : "text-stone-600 dark:text-neutral-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10"
            )}
            title={isEditing ? "Concluir edição (Esc)" : "Editar nota (Clique duplo)"}
            aria-label={isEditing ? "Concluir edição" : "Editar texto da nota"}
          >
            {isEditing ? <Check size={14} className="text-emerald-500" /> : <Edit2 size={14} />}
          </button>

          {/* Divisor */}
          <div className="w-px h-4 bg-stone-200 dark:bg-white/10 mx-0.5" />

          {/* 4. Botão Excluir */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            onMouseDown={(e) => e.preventDefault()}
            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 dark:text-rose-400 transition-colors cursor-pointer flex items-center justify-center"
            title="Excluir nota"
            aria-label="Excluir nota"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* ============================================================
          CORPO DO RETÂNGULO DA NOTA (Textarea com auto-redimensionamento)
          ============================================================ */}
      <div
        className={cn(
          "rounded-2xl transition-all duration-150 relative overflow-hidden",
          isFilled && "shadow-md hover:shadow-lg",
          isEditing 
            ? "ring-2 ring-purple-500 shadow-xl" 
            : (isSelected ? "ring-2 ring-blue-500/80 shadow-md" : "hover:ring-1 hover:ring-black/15 dark:hover:ring-white/15")
        )}
        style={{
          backgroundColor: bgColor,
          border: `${borderWidth}px solid ${borderColor}`,
          color: textColor,
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          readOnly={!isEditing}
          placeholder="Digite sua nota..."
          className={cn(
            "w-full p-4 outline-none rounded-2xl font-medium leading-relaxed resize-none bg-transparent block transition-colors",
            isEditing 
              ? "prevent-item-drag cursor-text select-text" 
              : "cursor-grab select-none"
          )}
          style={{
            fontSize: note.fontSize || 15,
            textAlign: note.textAlign || 'left',
            minHeight: 110,
            color: textColor,
          }}
        />
      </div>
    </div>
  );
}
