import React from 'react';
import { Layers, FileText, Share2, ArrowUpRight } from 'lucide-react';

export interface HoveredNodeData {
  id: string;
  title: string;
  isCanvas?: boolean;
  connectionsCount?: number;
  path?: string;
  color?: string;
  screenX: number;
  screenY: number;
}

export interface GraphNodeTooltipProps {
  node: HoveredNodeData | null;
}

export const GraphNodeTooltip: React.FC<GraphNodeTooltipProps> = ({ node }) => {
  if (!node) return null;

  const accentColor = node.color || (node.isCanvas ? '#818cf8' : '#7F95FF');

  return (
    <div
      className="pointer-events-none absolute z-30 transition-all duration-75 -translate-x-1/2 -translate-y-full mb-3"
      style={{
        left: `${node.screenX}px`,
        top: `${node.screenY - 14}px`,
      }}
    >
      <div 
        className="flex flex-col gap-1 px-3 py-2 rounded-xl backdrop-blur-xl bg-[#131524]/95 border border-white/[0.12] shadow-[0_12px_32px_rgba(0,0,0,0.7)] text-left min-w-[160px] max-w-[240px] animate-in fade-in zoom-in-95 duration-150"
        style={{
          boxShadow: `0 12px 28px -6px rgba(0, 0, 0, 0.8), 0 0 20px -4px ${accentColor}30`
        }}
      >
        {/* Node Category & Icon */}
        <div className="flex items-center justify-between gap-1.5 text-[10px] text-neutral-400 font-medium">
          <div className="flex items-center gap-1">
            {node.isCanvas ? (
              <Layers className="w-3 h-3 text-[#818cf8]" />
            ) : (
              <FileText className="w-3 h-3 text-[#7F95FF]" />
            )}
            <span className="uppercase tracking-wider">
              {node.isCanvas ? 'Canvas Infinito' : 'Nota do Grimório'}
            </span>
          </div>

          <span className="flex items-center gap-1 text-[10px] text-neutral-400">
            <Share2 className="w-2.5 h-2.5" />
            <span>{node.connectionsCount ?? 0}</span>
          </span>
        </div>

        {/* Node Title */}
        <div className="font-semibold text-xs text-white leading-tight truncate">
          {node.title}
        </div>

        {/* Action Hint */}
        <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-white/[0.06] mt-0.5">
          <span className="text-neutral-500">Clique para abrir</span>
          <ArrowUpRight className="w-3 h-3 text-neutral-400" />
        </div>
      </div>
    </div>
  );
};
