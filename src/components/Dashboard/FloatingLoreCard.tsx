import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Share2, ArrowUpRight, GripHorizontal } from 'lucide-react';
import clsx from 'clsx';

export interface FloatingLoreCardProps {
  id: string;
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
  connectionsCount: number;
  accentColor?: string;
  defaultPosition: { x: number; y: number };
  path?: string;
  isCanvas?: boolean;
  dragConstraintsRef?: React.RefObject<HTMLDivElement | null>;
  onSelect?: (pathOrTitle: string, isCanvas?: boolean) => void;
  onDismiss?: (id: string) => void;
}

export const FloatingLoreCard: React.FC<FloatingLoreCardProps> = ({
  id,
  title,
  category,
  tags,
  excerpt,
  connectionsCount,
  accentColor = '#a855f7',
  defaultPosition,
  path,
  isCanvas,
  dragConstraintsRef,
  onSelect,
  onDismiss,
}) => {
  return (
    <motion.div
      drag
      dragConstraints={dragConstraintsRef}
      dragElastic={0.12}
      dragMomentum={true}
      initial={{ 
        opacity: 0, 
        scale: 0.9, 
        x: defaultPosition.x, 
        y: defaultPosition.y 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        x: defaultPosition.x, 
        y: [defaultPosition.y, defaultPosition.y - 6, defaultPosition.y] 
      }}
      transition={{
        opacity: { duration: 0.6, ease: 'easeOut' },
        scale: { duration: 0.6, ease: 'easeOut' },
        y: { 
          repeat: Infinity, 
          duration: 6 + (title.length % 3) * 1.5, 
          ease: 'easeInOut' 
        }
      }}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.04, cursor: 'grabbing', zIndex: 40 }}
      onTap={() => {
        if (onSelect) {
          onSelect(path || title, isCanvas);
        }
      }}
      className={clsx(
        "absolute z-20 w-[280px] sm:w-[310px] p-4 rounded-2xl select-none",
        "backdrop-blur-xl bg-[#0F0E18]/85 border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)]",
        "transition-colors duration-300 group cursor-grab"
      )}
      style={{
        boxShadow: `0 16px 36px -10px rgba(0, 0, 0, 0.7), 0 0 24px -6px ${accentColor}25`
      }}
    >
      {/* Glow highlight line at top */}
      <div 
        className="absolute inset-x-4 top-0 h-[1.5px] rounded-full opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`
        }}
      />

      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span 
            className="w-2 h-2 rounded-full animate-pulse shrink-0"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400 truncate">
            {category}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-neutral-500">
          <GripHorizontal className="w-3.5 h-3.5 opacity-40 group-hover:opacity-80 transition-opacity" />
          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(id);
              }}
              className="text-neutral-500 hover:text-neutral-300 p-0.5 rounded transition-colors text-xs ml-1 cursor-pointer"
              title="Ocultar card"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Note Title */}
      <h3 className="text-sm font-semibold text-white tracking-tight leading-snug group-hover:text-purple-200 transition-colors flex items-center justify-between">
        <span className="truncate">{title}</span>
        {onSelect && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(path || title, isCanvas);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white p-0.5 rounded cursor-pointer"
            title={isCanvas ? "Abrir Canvas" : "Ver no Vault"}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </h3>

      {/* Note Excerpt / Lore */}
      <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed line-clamp-2">
        {excerpt}
      </p>

      {/* Tags List */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-neutral-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06] text-[11px] text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Share2 className="w-3 h-3 text-neutral-500" />
          <span>{connectionsCount} conexões</span>
        </div>

        <div className="flex items-center gap-1 text-purple-400/90 font-medium text-[10px] tracking-wide">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Vault Live</span>
        </div>
      </div>
    </motion.div>
  );
};
