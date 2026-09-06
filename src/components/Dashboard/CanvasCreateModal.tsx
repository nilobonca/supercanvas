import React, { useState, useEffect } from 'react';
import { X, FolderKanban, Music, Database } from 'lucide-react';
import { SafeIcon } from '@/components/common/SafeIcon';
import { RegisteredVault } from '@/modules/vault/hooks/useVaultRegistry';

interface CanvasCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaults: RegisteredVault[];
  activeVaultId: string;
  onCreate: (canvasType: 'board' | 'audio', targetVaultId: string | null, targetVaultName: string | null) => void;
}

export const CanvasCreateModal: React.FC<CanvasCreateModalProps> = ({
  isOpen,
  onClose,
  vaults,
  activeVaultId,
  onCreate,
}) => {
  const [selectedVaultId, setSelectedVaultId] = useState<string>(activeVaultId);

  useEffect(() => {
    setSelectedVaultId(activeVaultId);
  }, [activeVaultId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectType = (canvasType: 'board' | 'audio') => {
    const targetVault = vaults.find(v => v.id === selectedVaultId);
    const targetVaultId = selectedVaultId === '__general__' ? null : selectedVaultId;
    const targetVaultName = targetVault ? targetVault.name : null;

    onCreate(canvasType, targetVaultId, targetVaultName);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#161620] border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col gap-5 text-stone-900 dark:text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Criar Novo Canvas</h3>
            <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5">
              Escolha a modalidade de projeto e o vault onde será salvo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 dark:hover:bg-white/10 rounded-full text-stone-400 hover:text-stone-800 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vault Destination Selector */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-black/25 border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <SafeIcon size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <span className="text-xs font-semibold block text-stone-800 dark:text-neutral-200">
                Salvar no Vault:
              </span>
              <span className="text-[11px] text-stone-500 dark:text-neutral-400">
                Organiza o canvas dentro da base de conhecimento
              </span>
            </div>
          </div>

          <select
            value={selectedVaultId}
            onChange={(e) => setSelectedVaultId(e.target.value)}
            className="text-xs font-medium bg-white dark:bg-[#1E1E28] border border-black/10 dark:border-white/10 rounded-xl px-3 py-1.5 text-stone-900 dark:text-white outline-none focus:border-purple-500 shadow-xs"
          >
            <option value="__general__">Caixa Geral (Sem Vault específico)</option>
            {vaults.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.storageType === 'fsa' ? 'HD Windows' : 'IndexedDB'})
              </option>
            ))}
          </select>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Canvas de Conexões */}
          <div
            onClick={() => handleSelectType('board')}
            className="group p-5 rounded-2xl bg-stone-50/80 hover:bg-purple-50/60 dark:bg-white/5 dark:hover:bg-purple-600/15 border border-stone-200/80 hover:border-purple-400 dark:border-white/10 dark:hover:border-purple-500/60 cursor-pointer transition-all flex flex-col gap-3 shadow-xs hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                Canvas de Conexões
              </h4>
              <p className="text-xs text-stone-500 dark:text-neutral-400 leading-relaxed mt-1">
                Quadro visual infinito de Notas, Wikilinks, Áudio, Imagens e Setas conectadas dinamicamente.
              </p>
            </div>
            <span className="mt-auto text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Criar Conexões &rarr;
            </span>
          </div>

          {/* Option 2: Canvas de Áudio RPG */}
          <div
            onClick={() => handleSelectType('audio')}
            className="group p-5 rounded-2xl bg-stone-50/80 hover:bg-sky-50/60 dark:bg-white/5 dark:hover:bg-sky-600/15 border border-stone-200/80 hover:border-sky-400 dark:border-white/10 dark:hover:border-sky-500/60 cursor-pointer transition-all flex flex-col gap-3 shadow-xs hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                Canvas de Áudio (RPG)
              </h4>
              <p className="text-xs text-stone-500 dark:text-neutral-400 leading-relaxed mt-1">
                Mesa virtual com áudio espacial 3D, paredes acústicas, zonas sonoras, páginas e soundboard.
              </p>
            </div>
            <span className="mt-auto text-[11px] font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Criar Áudio RPG &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
