import React from 'react';
import { useGesture } from '@use-gesture/react';
import { ActiveVaultLink } from '@/interfaces/utils/indexedDB';
import { useCanvas } from '../canva-teste';
import { useRouter } from 'next/router';
import { BookOpen, ExternalLink, Trash2, FileText } from 'lucide-react';
import { SafeIcon } from '@/components/common/SafeIcon';

interface VaultLinkItemProps {
  item: ActiveVaultLink;
  onUpdate: (item: ActiveVaultLink) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent | React.PointerEvent | React.TouchEvent) => void;
  zIndex?: number;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export default function VaultLinkItem({
  item,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
  zIndex = 10,
  onContextMenu
}: VaultLinkItemProps) {
  const { transform } = useCanvas();
  const router = useRouter();

  const bind = useGesture({
    onDrag: ({ offset: [ox, oy], event }) => {
      event.stopPropagation();
      const x = ox / transform.k;
      const y = oy / transform.k;
      onUpdate({ ...item, position: { x, y } });
    },
    onDragStart: ({ event }) => {
      onSelect?.(event as any);
    },
    onDragEnd: ({ event }) => {
      event.stopPropagation();
    }
  }, {
    drag: {
      from: () => [item.position.x * transform.k, item.position.y * transform.k],
    }
  });

  const handleOpenNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to Vault with the document path encoded
    router.push(`/vault?doc=${encodeURIComponent(item.documentPath)}`);
  };

  const scale = transform.k;
  const width = (item.width || 180) * scale;

  return (
    <div
      {...bind()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(e);
      }}
      style={{
        position: 'absolute',
        transform: `translate(${item.position.x * scale}px, ${item.position.y * scale}px)`,
        width: `${width}px`,
        zIndex: isSelected ? 50 : zIndex,
        touchAction: 'none'
      }}
      className={`group select-none rounded-xl backdrop-blur-md transition-shadow cursor-grab active:cursor-grabbing ${
        isSelected
          ? 'ring-2 ring-[#7F95FF] shadow-xl shadow-[#1831D7]/20 bg-[#17192A]/95 border border-[#1831D7]/50'
          : 'bg-[#17192A]/80 border border-neutral-800/80 hover:border-[#1831D7]/40 hover:bg-[#17192A]/90 shadow-lg'
      }`}
    >
      {/* Floating Toolbar when selected */}
      {isSelected && (
        <div
          style={{ transform: `scale(${Math.max(0.7, Math.min(1.2, 1 / scale))})` }}
          className="absolute -top-10 left-0 flex items-center gap-1.5 bg-neutral-950/90 border border-neutral-800 rounded-lg p-1 shadow-xl z-50 origin-bottom-left"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleOpenNote}
            className="flex items-center gap-1 px-2 py-1 bg-[#1831D7] hover:bg-[#1831D7]/90 text-white rounded text-xs font-medium transition-colors cursor-pointer"
            title="Abrir nota no Vault"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Abrir</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-1 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded transition-colors cursor-pointer"
            title="Excluir do canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Card Content */}
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1831D7]/20 border border-[#1831D7]/30 flex items-center justify-center text-[#7F95FF] shrink-0">
            <SafeIcon size={16} className="text-[#7F95FF]" />
          </div>
          <button
            onClick={handleOpenNote}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#1831D7]/30 text-neutral-400 hover:text-[#7F95FF] rounded transition-all cursor-pointer"
            title="Abrir nota completa"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-neutral-100 line-clamp-1 group-hover:text-[#B4D3F1] transition-colors">
            {item.title}
          </h4>
          <span className="text-[10px] text-neutral-400 flex items-center gap-1 truncate mt-0.5 font-mono">
            <FileText className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{item.documentPath}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
