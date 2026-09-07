import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  Search, 
  X, 
  Share2 
} from 'lucide-react';
import clsx from 'clsx';

export interface GraphControlsOverlayProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  nodeCount: number;
  linkCount: number;
  className?: string;
}

export const GraphControlsOverlay: React.FC<GraphControlsOverlayProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  isPlaying,
  onTogglePlayPause,
  searchQuery,
  onSearchChange,
  nodeCount,
  linkCount,
  className,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className={clsx("flex items-center gap-2 pointer-events-auto", className)}>
      {/* Topology Stats Pill */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.08] shadow-lg text-[11px] text-neutral-300">
        <Share2 className="w-3 h-3 text-[#7F95FF]" />
        <span className="font-medium text-neutral-200">{nodeCount}</span>
        <span className="text-neutral-500">nós</span>
        <span className="w-1 h-1 rounded-full bg-neutral-600" />
        <span className="font-medium text-neutral-200">{linkCount}</span>
        <span className="text-neutral-500">conexões</span>
      </div>

      {/* Search Input Pill */}
      <div className="flex items-center">
        {isSearchOpen ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#7F95FF]/40 shadow-lg transition-all animate-in fade-in duration-200">
            <Search className="w-3.5 h-3.5 text-[#7F95FF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filtrar conexões..."
              className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-32 sm:w-44"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-neutral-400 hover:text-white p-0.5"
                title="Limpar busca"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setIsSearchOpen(false);
              }}
              className="text-neutral-500 hover:text-neutral-300 pl-1 border-l border-white/10"
              title="Fechar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer shadow-lg"
            title="Buscar e filtrar nós do grafo"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navigation & Simulation Controls */}
      <div className="flex items-center gap-0.5 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.08] shadow-lg">
        <button
          type="button"
          onClick={onZoomIn}
          className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          title="Aproximar (Zoom In)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onZoomOut}
          className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          title="Afastar (Zoom Out)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onResetView}
          className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          title="Recentralizar grafo (Reset Zoom)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-3 bg-white/10 mx-0.5" />

        <button
          type="button"
          onClick={onTogglePlayPause}
          className={clsx(
            "p-1.5 rounded-full transition-all cursor-pointer",
            isPlaying 
              ? "text-neutral-400 hover:text-white hover:bg-white/[0.08]" 
              : "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20"
          )}
          title={isPlaying ? 'Pausar simulação física' : 'Retomar física'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
