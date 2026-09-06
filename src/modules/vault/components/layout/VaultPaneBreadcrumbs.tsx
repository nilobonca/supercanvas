import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { VaultTab } from '../../interfaces/layout';
import { useVaultStore } from '../../hooks/useVaultStore';

interface VaultPaneBreadcrumbsProps {
  paneId: string;
  activeTab?: VaultTab;
}

export const VaultPaneBreadcrumbs: React.FC<VaultPaneBreadcrumbsProps> = ({
  activeTab
}) => {
  const { isEditing, toggleIsEditing } = useVaultStore();

  if (!activeTab) return null;

  const isCanvas = activeTab.type === 'canvas' || activeTab.path.startsWith('canvas:');
  const cleanPath = isCanvas 
    ? (activeTab.title || 'Quadro de Conexões')
    : activeTab.path.replace(/\.(md|txt)$/, '');

  const segments = cleanPath.split('/').filter(Boolean);

  return (
    <div className="h-8 border-b border-stone-200/90 dark:border-white/10 bg-stone-50/70 dark:bg-white/[0.02] px-3 flex items-center justify-between text-xs text-stone-500 dark:text-neutral-400 shrink-0 select-none">
      <div className="flex items-center gap-2 truncate min-w-0">
        <div className="flex items-center gap-1 text-stone-400 dark:text-neutral-500">
          <button 
            className="p-1 hover:text-stone-900 dark:hover:text-neutral-200 hover:bg-stone-200/60 dark:hover:bg-white/10 rounded disabled:opacity-30 transition-colors cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
          <button 
            className="p-1 hover:text-stone-900 dark:hover:text-neutral-200 hover:bg-stone-200/60 dark:hover:bg-white/10 rounded disabled:opacity-30 transition-colors cursor-pointer"
            title="Avançar"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="w-px h-3 bg-stone-200 dark:bg-white/10" />

        {/* Breadcrumb path segments */}
        <div className="flex items-center gap-1.5 truncate text-[11px]">
          {segments.map((segment, idx) => {
            const isLast = idx === segments.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-stone-300 dark:text-neutral-600">/</span>}
                <span
                  className={`truncate ${
                    isLast 
                      ? 'text-stone-900 dark:text-neutral-200 font-medium' 
                      : 'text-stone-400 dark:text-neutral-500 hover:text-stone-600 dark:hover:text-neutral-400 cursor-default'
                  }`}
                >
                  {segment}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Pane toolbar actions */}
      <div className="flex items-center gap-1 text-stone-400 dark:text-neutral-400 ml-2">
        {!isCanvas && (
          <button
            onClick={toggleIsEditing}
            className={`p-1 rounded hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer ${
              isEditing ? 'text-[#1831D7] dark:text-[#7F95FF] font-medium' : 'text-stone-400 dark:text-neutral-400'
            }`}
            title={isEditing ? 'Modo de Leitura' : 'Modo de Edição'}
          >
            {isEditing ? <BookOpen className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};
