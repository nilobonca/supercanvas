import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  BookOpen, 
  HardDrive, 
  Database, 
  Edit2, 
  Check, 
  X, 
  ArrowRight, 
  FolderOpen, 
  Copy, 
  FileText, 
  Layers, 
  RefreshCw, 
  ChevronDown, 
  Settings, 
  DownloadCloud, 
  UploadCloud 
} from 'lucide-react';
import { RegisteredVault } from '@/modules/vault/hooks/useVaultRegistry';
import { isElectron, setWindowMode } from '@/utils/electronHelper';
import { SafeIcon } from '@/components/common/SafeIcon';
import clsx from 'clsx';

export interface ActiveVaultPanelSectionProps {
  activeVault: RegisteredVault;
  onRenameVault: (id: string, newName: string) => void;
  onConnectFSA: () => Promise<boolean | void> | void;
  onOpenSettings?: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (file: File) => void;
  isConnectingFSA?: boolean;
}

export const ActiveVaultPanelSection: React.FC<ActiveVaultPanelSectionProps> = ({
  activeVault,
  onRenameVault,
  onConnectFSA,
  onOpenSettings,
  onExportBackup,
  onImportBackup,
  isConnectingFSA = false,
}) => {
  const router = useRouter();
  const isFSA = activeVault.storageType === 'fsa';

  // Inline editing for vault name
  const [isEditingName, setIsEditingName] = useState(false);
  const [vaultNameInput, setVaultNameInput] = useState(activeVault.name);

  // Copy path feedback
  const [isCopied, setIsCopied] = useState(false);

  // Dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVaultNameInput(activeVault.name);
  }, [activeVault.name]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleSaveName = () => {
    const trimmed = vaultNameInput.trim();
    if (trimmed && trimmed !== activeVault.name) {
      onRenameVault(activeVault.id, trimmed);
    }
    setIsEditingName(false);
  };

  const displayPath = activeVault.path || (
    isFSA 
      ? (activeVault.folderName ? `D:\\RPG\\Campanhas\\${activeVault.folderName}` : 'D:\\RPG\\Campanhas\\Baróvia')
      : 'indexeddb://rpgsa-vault-storage'
  );

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(displayPath);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleOpenExplorer = async () => {
    if (typeof window !== 'undefined' && window.electronAPI?.openFolderInExplorer) {
      await window.electronAPI.openFolderInExplorer(displayPath);
    } else {
      handleCopyPath();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportBackup) {
      onImportBackup(file);
    }
    e.target.value = '';
    setIsMenuOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ============================================================
          HEADER & STATUS BADGE
          ============================================================ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#1831D7] dark:text-[#7F95FF] font-bold">
            Vault Selecionado
          </span>

          {/* Tag de Status solicitada */}
          {isFSA ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#52B1FF]/10 text-[#52B1FF] border border-[#52B1FF]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#52B1FF] shadow-[0_0_8px_rgba(82,177,255,0.8)] animate-pulse" />
              <span>HD LOCAL (WINDOWS)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1831D7]/15 text-[#1831D7] dark:text-[#7F95FF] border border-[#7F95FF]/30">
              <Database size={11} />
              <span>INDEXEDDB</span>
            </div>
          )}
        </div>

        <h3 className="text-base font-black tracking-tight text-stone-900 dark:text-[#F4F0E6]">
          Configurações do Último Vault
        </h3>
      </div>

      {/* ============================================================
          VAULT NAME (INLINE EDITABLE)
          ============================================================ */}
      <div className="p-3.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03]">
        <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-[#B4D3F1]/70 tracking-wider">
          Nome do Vault
        </span>

        {isEditingName ? (
          <div className="flex items-center gap-1.5 mt-1.5">
            <input
              type="text"
              value={vaultNameInput}
              onChange={(e) => setVaultNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') setIsEditingName(false);
              }}
              autoFocus
              className="w-full bg-white dark:bg-black/60 border border-[#7F95FF] rounded-lg px-2.5 py-1 text-sm font-bold text-stone-900 dark:text-white outline-none"
            />
            <button
              onClick={handleSaveName}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              title="Salvar"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setVaultNameInput(activeVault.name);
                setIsEditingName(false);
              }}
              className="p-1.5 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 text-stone-700 dark:text-white transition-colors"
              title="Cancelar"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 mt-1 group">
            <h4 className="text-base font-extrabold text-stone-900 dark:text-white tracking-tight truncate">
              {activeVault.name}
            </h4>
            <button
              onClick={() => setIsEditingName(true)}
              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 text-stone-400 hover:text-stone-700 dark:hover:text-white transition-all cursor-pointer"
              title="Renomear Vault"
            >
              <Edit2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* ============================================================
          MONOSPACE PATH BOX WITH EXPLORER & COPY ACTIONS
          ============================================================ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500 dark:text-neutral-400">
          <span>Caminho de Armazenamento</span>
          {isCopied && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
              Copiado!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/[0.04] dark:bg-black/50 border border-black/[0.08] dark:border-white/[0.08]">
          <span className="flex-1 font-mono text-[11px] text-stone-700 dark:text-neutral-300 truncate select-all">
            {displayPath}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleOpenExplorer}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-stone-500 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              title={typeof window !== 'undefined' && window.electronAPI ? "Abrir pasta no Windows Explorer" : "Copiar Caminho"}
            >
              <FolderOpen size={13} />
            </button>
            <button
              onClick={handleCopyPath}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-stone-500 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              title="Copiar Caminho"
            >
              {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          STATISTICS: NOTAS SALVAS & CANVASES VINCULADOS
          ============================================================ */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.07] bg-white dark:bg-[#131524] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1831D7]/15 text-[#7F95FF] flex items-center justify-center shrink-0">
            <FileText size={16} />
          </div>
          <div>
            <div className="text-base font-extrabold text-stone-900 dark:text-white leading-none">
              {activeVault.documentCount || 0}
            </div>
            <div className="text-[10px] text-stone-400 dark:text-[#B4D3F1]/80 mt-1">
              Notas & Arquivos
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.07] bg-white dark:bg-[#131524] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#52B1FF]/15 text-[#52B1FF] flex items-center justify-center shrink-0">
            <Layers size={16} />
          </div>
          <div>
            <div className="text-base font-extrabold text-stone-900 dark:text-white leading-none">
              {activeVault.canvasCount || 0}
            </div>
            <div className="text-[10px] text-stone-400 dark:text-[#B4D3F1]/80 mt-1">
              Canvases Vinculados
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          PRIMARY CTA: ABRIR VAULT NO EDITOR →
          ============================================================ */}
      <button
        onClick={() => {
          if (isElectron()) {
            setWindowMode('workspace');
          }
          router.push('/vault');
        }}
        className="w-full group relative overflow-hidden rounded-xl p-3 bg-[#1831D7] text-[#F4F0E6] hover:bg-[#1831D7]/90 font-bold text-xs flex items-center justify-between transition-all duration-200 active:scale-[0.98] shadow-md shadow-[#1831D7]/20 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <SafeIcon size={16} className="text-[#B4D3F1]" />
          <span>Abrir Vault no Editor</span>
        </div>

        <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-1 transition-transform">
          <ArrowRight size={13} />
        </div>
      </button>

      {/* ============================================================
          SECONDARY ACTIONS: TROCAR PASTA HD & OPÇÕES ▾
          ============================================================ */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onConnectFSA()}
          disabled={isConnectingFSA}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-stone-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
        >
          {isConnectingFSA ? (
            <RefreshCw size={13} className="animate-spin text-emerald-500" />
          ) : (
            <HardDrive size={13} className="text-emerald-600 dark:text-emerald-400" />
          )}
          <span>{isFSA ? 'Trocar Pasta HD' : 'Vincular Pasta HD'}</span>
        </button>

        {/* Dropdown Opções ▾ */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="flex items-center gap-1 py-2.5 px-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-stone-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 text-xs font-bold transition-all cursor-pointer"
          >
            <span>Opções</span>
            <ChevronDown size={13} className={clsx("transition-transform duration-200", isMenuOpen && "rotate-180")} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-52 rounded-xl bg-white dark:bg-[#181824] border border-black/10 dark:border-white/10 shadow-2xl p-1.5 z-50 text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsEditingName(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-700 dark:text-neutral-200 font-medium text-left"
              >
                <Edit2 size={13} />
                <span>Renomear Vault</span>
              </button>

              {onOpenSettings && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-700 dark:text-neutral-200 font-medium text-left"
                >
                  <Settings size={13} />
                  <span>Configurações do Vault</span>
                </button>
              )}

              {onExportBackup && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onExportBackup();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-700 dark:text-neutral-200 font-medium text-left"
                >
                  <DownloadCloud size={13} />
                  <span>Exportar Backup (.zip)</span>
                </button>
              )}

              {onImportBackup && (
                <label className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-700 dark:text-neutral-200 font-medium cursor-pointer">
                  <UploadCloud size={13} />
                  <span>Importar Backup (.zip)</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </label>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
