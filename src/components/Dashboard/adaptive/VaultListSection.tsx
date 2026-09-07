import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { 
  Search, 
  Plus, 
  HardDrive, 
  Database, 
  Trash2, 
  X,
  FileText,
  Layers,
  Check
} from 'lucide-react';
import { RegisteredVault } from '@/modules/vault/hooks/useVaultRegistry';
import { isElectron, setWindowMode } from '@/utils/electronHelper';
import clsx from 'clsx';

export interface VaultListSectionProps {
  vaults: RegisteredVault[];
  activeVaultId: string;
  onSwitchVault: (vault: RegisteredVault, forcePicker?: boolean) => Promise<boolean | void> | void;
  onCreateVault?: () => void;
  onRemoveVault?: (id: string) => void;
}

export const VaultListSection: React.FC<VaultListSectionProps> = ({
  vaults,
  activeVaultId,
  onSwitchVault,
  onCreateVault,
  onRemoveVault,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVaults = useMemo(() => {
    if (!searchQuery.trim()) return vaults;
    const query = searchQuery.toLowerCase().trim();
    return vaults.filter(v => 
      v.name.toLowerCase().includes(query) ||
      (v.path && v.path.toLowerCase().includes(query)) ||
      (v.folderName && v.folderName.toLowerCase().includes(query)) ||
      (v.storageType && v.storageType.toLowerCase().includes(query))
    );
  }, [vaults, searchQuery]);

  // Clique simples (1x): Seleciona o vault para atualizar o Vault Ativo e o Grafo
  const handleSelectVault = async (vault: RegisteredVault) => {
    if (vault.id !== activeVaultId) {
      try {
        await onSwitchVault(vault, false);
      } catch (err) {
        console.warn('[VaultListSection] Falha ao alternar vault:', err);
      }
    }
  };

  // Clique duplo (2x): Entra diretamente no editor do Vault
  const handleDoubleClickVault = async (vault: RegisteredVault) => {
    try {
      if (vault.id !== activeVaultId) {
        const success = await onSwitchVault(vault, true);
        if (success === false) return;
      }
      if (isElectron()) {
        setWindowMode('workspace');
      }
      await router.push('/vault');
    } catch (err) {
      console.error('[VaultListSection] Erro ao entrar no vault:', err);
    }
  };

  return (
    <div className="space-y-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
      {/* Header: Title, Count & New Vault Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-stone-500 dark:text-neutral-400 font-bold">
            Lista de Vaults
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-stone-600 dark:text-neutral-400 font-bold">
            {vaults.length}
          </span>
        </div>

        {onCreateVault && (
          <button
            onClick={onCreateVault}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1831D7] hover:bg-[#1831D7]/90 text-[#F4F0E6] text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-[0.97]"
            title="Criar ou conectar novo Vault"
          >
            <Plus size={12} className="stroke-[2.5]" />
            <span>Novo Vault</span>
          </button>
        )}
      </div>

      {/* Search Input (visível quando houver mais de 2 vaults ou já houver busca) */}
      {(vaults.length > 2 || searchQuery) && (
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar vaults..."
            className="w-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-lg pl-7 pr-7 py-1 text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 outline-none focus:border-[#7F95FF] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-white"
            >
              <X size={11} />
            </button>
          )}
        </div>
      )}

      {/* List of Vaults */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5 custom-scrollbar">
        {filteredVaults.length === 0 ? (
          <div className="text-center py-6 px-3 rounded-xl border border-dashed border-black/10 dark:border-white/10 text-stone-400 text-xs">
            Nenhum vault encontrado com a busca.
          </div>
        ) : (
          filteredVaults.map((vault) => {
            const isActive = vault.id === activeVaultId;
            const isFSA = vault.storageType === 'fsa';

            return (
              <div
                key={vault.id}
                onClick={() => handleSelectVault(vault)}
                onDoubleClick={() => handleDoubleClickVault(vault)}
                className={clsx(
                  "p-2.5 rounded-xl border transition-all duration-200 group flex flex-col gap-1.5 cursor-pointer select-none",
                  isActive
                    ? "bg-[#1831D7]/10 dark:bg-[#7F95FF]/15 border-[#1831D7] dark:border-[#7F95FF] ring-1 ring-[#7F95FF]/30 shadow-xs"
                    : "bg-white dark:bg-[#131524] border-black/[0.06] dark:border-white/[0.08] hover:border-[#7F95FF]/40 hover:bg-black/[0.01] dark:hover:bg-[#17192A]"
                )}
                title="Clique 1x para ativar • 2x para abrir no editor"
              >
                {/* Top Row: Icon, Name & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="relative shrink-0">
                      <div className={clsx(
                        "w-6 h-6 rounded-md flex items-center justify-center",
                        isFSA 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                          : "bg-[#1831D7]/15 text-[#1831D7] dark:bg-[#7F95FF]/20 dark:text-[#7F95FF]"
                      )}>
                        {isFSA ? <HardDrive size={13} /> : <Database size={13} />}
                      </div>
                      {isActive && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-[#131524] animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={clsx(
                          "font-bold text-xs truncate transition-colors",
                          isActive 
                            ? "text-[#1831D7] dark:text-[#7F95FF]" 
                            : "text-stone-900 dark:text-[#F4F0E6] group-hover:text-[#1831D7] dark:group-hover:text-[#7F95FF]"
                        )}>
                          {vault.name}
                        </span>

                        {isActive && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Check size={9} />
                            Ativo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions / Remove button */}
                  {!isActive && onRemoveVault && !vault.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveVault(vault.id);
                      }}
                      className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer shrink-0"
                      title="Remover Vault da Lista"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Bottom Row: Path / Details */}
                <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-neutral-400 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                  <span className="font-mono text-[10px] truncate max-w-[180px]">
                    {vault.folderName || vault.path || (isFSA ? 'HD Local' : 'Armazenamento Interno')}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-0.5">
                      <FileText size={10} />
                      {vault.documentCount || 0}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Layers size={10} />
                      {vault.canvasCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-[9px] text-center text-stone-400 dark:text-neutral-500">
        Clique <span className="font-semibold text-stone-600 dark:text-neutral-400">1x</span> para alternar • <span className="font-semibold text-stone-600 dark:text-neutral-400">2x</span> para abrir
      </p>
    </div>
  );
};
