import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import { BoardElement, HandlePosition, NoteData } from '../../types';
import { ElementHandles } from './ElementHandles';
import { BoardNoteTitle } from './BoardNoteTitle';
import { BoardNoteActions } from './BoardNoteActions';
import { useVaultStore } from '@/modules/vault/hooks/useVaultStore';
import { marked } from 'marked';
import clsx from 'clsx';
import { cleanLegacyPlaceholder } from '@/utils/cleanLegacyPlaceholder';

interface BoardNoteElementProps {
  element: BoardElement;
  isSelected: boolean;
  snappedHandle?: HandlePosition | null;
  zoom: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<BoardElement>) => void;
  onDelete: () => void;
  onStartArrow: (handle: HandlePosition, e: React.PointerEvent) => void;
  onCenterElement?: () => void;
}

export const NOTE_THEMES: Record<string, { border: string; bg: string; name: string }> = {
  purple: { border: '#8b5cf6', bg: '#faf5ff', name: 'Roxo' },
  yellow: { border: '#eab308', bg: '#fefce8', name: 'Amarelo' },
  emerald: { border: '#10b981', bg: '#f0fdf4', name: 'Esmeralda' },
  cyan: { border: '#06b6d4', bg: '#f0fdfa', name: 'Ciano' },
  rose: { border: '#f43f5e', bg: '#fff1f2', name: 'Rosa' },
  slate: { border: '#64748b', bg: '#f8fafc', name: 'Cinza' },
};

function getNoteTheme(color?: string) {
  if (!color) return NOTE_THEMES.purple;
  const lower = color.toLowerCase();
  for (const key of Object.keys(NOTE_THEMES)) {
    const t = NOTE_THEMES[key];
    if (t.border.toLowerCase() === lower || key === lower) {
      return t;
    }
  }
  if (lower.includes('yellow') || lower.includes('fef08a') || lower.includes('fde047')) return NOTE_THEMES.yellow;
  if (lower.includes('emerald') || lower.includes('a7f3d0') || lower.includes('34d399')) return NOTE_THEMES.emerald;
  if (lower.includes('cyan') || lower.includes('a5f3fc') || lower.includes('38bdf8')) return NOTE_THEMES.cyan;
  if (lower.includes('purple') || lower.includes('e9d5ff') || lower.includes('a855f7')) return NOTE_THEMES.purple;
  if (lower.includes('rose') || lower.includes('pink') || lower.includes('fecdd3')) return NOTE_THEMES.rose;
  if (lower.includes('slate') || lower.includes('gray') || lower.includes('1e293b')) return NOTE_THEMES.slate;

  return { border: color, bg: '#fbfbfe', name: 'Custom' };
}

function processMarkdownForPreview(markdown: string): string {
  const cleaned = cleanLegacyPlaceholder(markdown);
  if (!cleaned) {
    return '';
  }

  // Convert wikilinks [[Target|Alias]] or [[Target]] to badges
  const withWikilinks = cleaned.replace(/\[\[(.*?)(?:\|(.*?))?\]\]/g, (_m, target, alias) => {
    const text = alias || target;
    return `<span class="inline-flex items-center px-1.5 py-0.2 rounded bg-black/10 font-mono text-[11px] font-semibold border border-black/10">[[${text}]]</span>`;
  });

  try {
    return marked.parse(withWikilinks, { async: false, breaks: true }) as string;
  } catch {
    return withWikilinks;
  }
}

export const BoardNoteElement: React.FC<BoardNoteElementProps> = ({
  element,
  isSelected,
  snappedHandle,
  zoom,
  onSelect,
  onUpdate,
  onDelete,
  onStartArrow,
  onCenterElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { provider } = useVaultStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const data = useMemo(() => (element.data || {}) as NoteData, [element.data]);
  const wasSelectedRef = useRef(isSelected);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleUpdateTitle = useCallback((newTitle: string) => {
    onUpdate({
      data: {
        ...data,
        title: newTitle,
      }
    });
  }, [data, onUpdate]);

  // Estado local do rascunho de edição (limpando qualquer placeholder residual legado)
  const [draftContent, setDraftContent] = useState(() => cleanLegacyPlaceholder(data.content));

  // Sincroniza draft quando o conteúdo externo mudar e não estivermos editando
  useEffect(() => {
    if (!isEditing) {
      setDraftContent(cleanLegacyPlaceholder(data.content));
    }
  }, [data.content, isEditing]);

  // Purga permanentemente qualquer placeholder residual gravado no banco de dados
  useEffect(() => {
    const cleaned = cleanLegacyPlaceholder(data.content);
    if (data.content && data.content !== cleaned) {
      onUpdate({
        data: {
          ...data,
          content: cleaned,
        }
      });
    }
  }, [data.content, onUpdate]);

  // Rastreia estado da seleção antes do início do clique
  const handlePointerDown = (e: React.PointerEvent) => {
    wasSelectedRef.current = isSelected;
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
  };

  // Clique simples: se já estava selecionada antes deste clique, entra em modo de edição
  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.prevent-edit-trigger')) return;

    if (pointerDownPosRef.current) {
      const dx = Math.abs(e.clientX - pointerDownPosRef.current.x);
      const dy = Math.abs(e.clientY - pointerDownPosRef.current.y);
      if (dx > 5 || dy > 5) return;
    }

    if (wasSelectedRef.current && !isEditing) {
      setIsEditing(true);
    }
  };

  // Duplo clique: ativa edição imediatamente
  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.prevent-edit-trigger')) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  const theme = getNoteTheme(data.color);

  // Salvar nota e sair do modo edição
  const saveAndExitEdit = useCallback(() => {
    setIsEditing(false);
    onUpdate({
      data: {
        ...data,
        content: draftContent,
      }
    });

    // Se for uma nota vinculada do Vault, sincroniza no storage do Vault também
    if (data.filePath && provider) {
      provider.saveDocument(data.filePath, draftContent).catch((err) => {
        console.warn('Erro ao sincronizar nota no Vault:', err);
      });
    }
  }, [data, draftContent, onUpdate, provider]);

  // Click outside listener: ao clicar fora da nota enquanto edita, salva e volta ao modo renderizado
  useEffect(() => {
    if (!isEditing) return;

    const handlePointerDownOutside = (e: MouseEvent | PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        saveAndExitEdit();
      }
    };

    window.addEventListener('pointerdown', handlePointerDownOutside, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDownOutside, true);
    };
  }, [isEditing, saveAndExitEdit]);

  // Se perder a seleção enquanto edita, salva e volta ao modo renderizado
  useEffect(() => {
    if (!isSelected && isEditing) {
      saveAndExitEdit();
    }
  }, [isSelected, isEditing, saveAndExitEdit]);

  const renderedHtml = useMemo(() => {
    const rawContent = isEditing
      ? draftContent
      : (draftContent !== undefined && draftContent !== '' ? draftContent : (data.content || ''));
    return processMarkdownForPreview(rawContent);
  }, [isEditing, draftContent, data.content]);

  // Arraste do elemento
  const bindDrag = useGesture({
    onDrag: ({ offset: [ox, oy], event }) => {
      event.stopPropagation();
      onUpdate({
        x: ox / zoom,
        y: oy / zoom,
      });
    },
    onDragStart: ({ event }) => {
      event.stopPropagation();
      onSelect();
    },
  }, {
    drag: {
      from: () => [element.x * zoom, element.y * zoom],
      filterTaps: true,
    }
  });

  // Redimensionamento interativo suave e preciso via Pointer Events
  const handleResizePointerDown = (
    direction: 'se' | 'sw' | 'ne' | 'nw' | 'e' | 's' | 'w' | 'n',
    e: React.PointerEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = element.x;
    const startY = element.y;
    const startW = element.width;
    const startH = element.height;

    const MIN_W = 160;
    const MIN_H = 120;

    const handlePointerMove = (moveEv: PointerEvent) => {
      moveEv.stopPropagation();
      moveEv.preventDefault();

      const dx = (moveEv.clientX - startClientX) / zoom;
      const dy = (moveEv.clientY - startClientY) / zoom;

      let newX = startX;
      let newY = startY;
      let newW = startW;
      let newH = startH;

      if (direction.includes('e')) {
        newW = Math.max(MIN_W, startW + dx);
      }
      if (direction.includes('s')) {
        newH = Math.max(MIN_H, startH + dy);
      }
      if (direction.includes('w')) {
        const proposedW = startW - dx;
        if (proposedW >= MIN_W) {
          newW = proposedW;
          newX = startX + dx;
        } else {
          newW = MIN_W;
          newX = startX + (startW - MIN_W);
        }
      }
      if (direction.includes('n')) {
        const proposedH = startH - dy;
        if (proposedH >= MIN_H) {
          newH = proposedH;
          newY = startY + dy;
        } else {
          newH = MIN_H;
          newY = startY + (startH - MIN_H);
        }
      }

      onUpdate({
        x: newX,
        y: newY,
        width: newW,
        height: newH,
      });
    };

    const handlePointerUp = (upEv: PointerEvent) => {
      upEv.stopPropagation();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: isSelected ? 50 : element.zIndex,
      }}
      className="group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={handlePointerDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
        handleClick(e);
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Alças de Conexão no meio das 4 bordas */}
      <ElementHandles
        isVisible={isHovered || isSelected}
        snappedHandle={snappedHandle}
        onStartArrow={onStartArrow}
      />

      {/* Zonas de Redimensionamento Invisíveis nos 4 Ângulos da Nota */}
      <div
        onPointerDown={(e) => handleResizePointerDown('nw', e)}
        className="absolute -top-2 -left-2 w-6 h-6 cursor-nwse-resize z-40 pointer-events-auto"
        title="Redimensionar"
      />
      <div
        onPointerDown={(e) => handleResizePointerDown('ne', e)}
        className="absolute -top-2 -right-2 w-6 h-6 cursor-nesw-resize z-40 pointer-events-auto"
        title="Redimensionar"
      />
      <div
        onPointerDown={(e) => handleResizePointerDown('sw', e)}
        className="absolute -bottom-2 -left-2 w-6 h-6 cursor-nesw-resize z-40 pointer-events-auto"
        title="Redimensionar"
      />
      <div
        onPointerDown={(e) => handleResizePointerDown('se', e)}
        className="absolute -bottom-2 -right-2 w-6 h-6 cursor-nwse-resize z-40 pointer-events-auto"
        title="Redimensionar"
      />

      {/* Botões de Opções de Interação (acima da nota no canto direito) */}
      <BoardNoteActions
        isSelected={isSelected}
        isHovered={isHovered}
        isEditing={isEditing}
        themeBorder={theme.border}
        themes={NOTE_THEMES}
        onToggleEdit={() => {
          if (isEditing) {
            saveAndExitEdit();
          } else {
            setIsEditing(true);
          }
        }}
        onUpdateColor={(newColor) => {
          onUpdate({ data: { ...data, color: newColor } });
        }}
        onCenterElement={onCenterElement}
        onDelete={onDelete}
      />

      {/* Cartão Delimitador da Nota */}
      <div
        {...bindDrag()}
        className={clsx(
          "w-full h-full rounded-2xl border-[3px] shadow-sm flex flex-col overflow-hidden relative cursor-grab active:cursor-grabbing",
          isSelected ? "shadow-lg shadow-black/10" : ""
        )}
        style={{
          backgroundColor: theme.bg,
          borderColor: theme.border,
        }}
      >
        {/* Nome da Nota - Menor e centralizado com divider que não encosta nas paredes */}
        <BoardNoteTitle
          title={data.title}
          isEditing={isEditing}
          themeBorder={theme.border}
          onUpdateTitle={handleUpdateTitle}
        />

        {/* Corpo: Modo Edição Direto ou Preview Renderizado */}
        {isEditing ? (
          <div 
            className="w-full flex-1 min-h-0 flex flex-col p-4 pt-1 cursor-text select-text"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <textarea
              autoFocus
              value={draftContent}
              onChange={(e) => {
                setDraftContent(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  saveAndExitEdit();
                }
              }}
              className="w-full h-full resize-none bg-transparent outline-none font-sans text-xs leading-relaxed text-neutral-900 custom-scrollbar"
            />
          </div>
        ) : (
          <div
            className="board-note-preview w-full flex-1 min-h-0 p-4 pt-1 overflow-y-auto custom-scrollbar select-text cursor-default"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        )}
      </div>
    </div>
  );
};
