import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  PanelLeftClose, 
  PanelLeft, 
  Network, 
  FolderKanban, 
  Search, 
  Link2, 
  HardDrive, 
  HelpCircle,
  Settings,
  Database,
  LayoutTemplate,
  Edit2,
  Check,
  Box,
  Files
} from 'lucide-react';
import { SafeIcon } from '@/components/common/SafeIcon';
import { useVaultStore } from '../../hooks/useVaultStore';

interface VaultRibbonProps {
  onOpenGraph: () => void;
  onCreateBoardCanvas: () => void;
}

export const VaultRibbon: React.FC<VaultRibbonProps> = ({
  onOpenGraph,
  onCreateBoardCanvas,
}) => {
  const { 
    sidebarOpen, 
    toggleSidebar, 
    sidebarTab,
    setSidebarTab,
    canvases,
    storageType, 
    vaultName, 
    setVaultName,
    connectFSA,
    setCommandPaletteOpen,
    backlinksPanelOpen,
    setBacklinksPanelOpen,
    setSettingsOpen,
    templateModalOpen,
    setTemplateModalOpen,
  } = useVaultStore();

  const [vaultMenuOpen, setVaultMenuOpen] = useState(false);
  const [nameInput, setNameInput] = useState(vaultName);
  const [isEditingName, setIsEditingName] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNameInput(vaultName);
  }, [vaultName]);

  // Click outside to close vault menu
  useEffect(() => {
    if (!vaultMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVaultMenuOpen(false);
        setIsEditingName(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [vaultMenuOpen]);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== vaultName) {
      await setVaultName(trimmed);
    }
    setIsEditingName(false);
  };

  const generalCanvasesCount = (canvases || []).filter(c => !c.folderPath).length;

  const handleToggleFilesTab = () => {
    if (!sidebarOpen) {
      toggleSidebar();
      setSidebarTab('files');
    } else if (sidebarTab === 'files') {
      toggleSidebar();
    } else {
      setSidebarTab('files');
    }
  };

  const handleToggleCanvasesTab = () => {
    if (!sidebarOpen) {
      toggleSidebar();
      setSidebarTab('canvases');
    } else if (sidebarTab === 'canvases') {
      toggleSidebar();
    } else {
      setSidebarTab('canvases');
    }
  };

  return (
    <div 
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      className="w-11 h-full bg-stone-100/95 dark:bg-[#111116] border-r border-stone-200/90 dark:border-white/10 flex flex-col items-center justify-between py-2 shrink-0 select-none z-30 transition-colors"
    >
      {/* Top Actions */}
      <div className="flex flex-col items-center gap-1.5">
        {/* Voltar para Projetos */}
        <Link
          href="/"
          className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Voltar para a lista de Projetos"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Identidade do Vault & Menu de Opções / Renomeação */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setVaultMenuOpen(!vaultMenuOpen);
              setIsEditingName(false);
              setNameInput(vaultName);
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer shadow-xs relative ${
              vaultMenuOpen
                ? 'bg-purple-600 text-white ring-2 ring-purple-400/50'
                : 'bg-purple-100 hover:bg-purple-200/80 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-300/80 dark:border-purple-800/60'
            }`}
            title={`Vault: ${vaultName} (Clique para opções e renomear)`}
          >
            <SafeIcon size={14} />
            <span 
              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-[#111116] ${
                storageType === 'fsa' ? 'bg-emerald-500' : 'bg-purple-500'
              }`} 
            />
          </button>

          {/* Vault Name Popover */}
          {vaultMenuOpen && (
            <div className="absolute left-10 top-0 w-64 bg-white dark:bg-[#16161D] border border-stone-200 dark:border-white/10 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2.5 text-stone-900 dark:text-neutral-100">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-white/5">
                <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-neutral-500">
                  <SafeIcon size={11} className="text-purple-600 dark:text-purple-400" />
                  Vault Ativo
                </span>
                <span className="flex items-center gap-1 text-[10px] text-stone-500 dark:text-neutral-400 font-mono">
                  <span className={`w-1.5 h-1.5 rounded-full ${storageType === 'fsa' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                  {storageType === 'fsa' ? 'HD Local' : 'IndexedDB'}
                </span>
              </div>

              {/* Vault Name Display / Edit */}
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    placeholder="Nome do Vault..."
                    className="flex-1 bg-stone-50 dark:bg-black/30 border border-purple-500 rounded-lg px-2 py-1 text-xs text-stone-900 dark:text-neutral-100 outline-none"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer"
                    title="Salvar nome"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => {
                    setNameInput(vaultName);
                    setIsEditingName(true);
                  }}
                  className="group flex items-center justify-between p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  title="Clique para renomear o Vault"
                >
                  <span className="font-semibold text-xs text-stone-900 dark:text-neutral-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-300">
                    {vaultName}
                  </span>
                  <Edit2 className="w-3 h-3 text-stone-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              )}

              {/* Quick Actions in Popover */}
              <div className="pt-1 border-t border-stone-100 dark:border-white/5 flex flex-col gap-1 text-xs">
                <button
                  onClick={() => {
                    setNameInput(vaultName);
                    setIsEditingName(true);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 text-stone-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors text-left cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Renomear Vault</span>
                </button>
                <button
                  onClick={() => {
                    setVaultMenuOpen(false);
                    setSettingsOpen(true);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 text-stone-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Configurações & Pastas</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-5 h-px bg-stone-200 dark:bg-white/10 my-0.5" />

        {/* Explorador de Arquivos & Notas */}
        <button
          onClick={handleToggleFilesTab}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            sidebarOpen && sidebarTab === 'files'
              ? 'text-purple-600 dark:text-purple-400 bg-purple-100/80 dark:bg-purple-950/40 ring-1 ring-purple-400/40'
              : 'text-stone-500 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-white/10'
          }`}
          title="Explorador de Arquivos e Notas (Ctrl+B)"
        >
          <Files className="w-4 h-4" />
        </button>

        {/* Caixa de Canvas Gerais */}
        <button
          onClick={handleToggleCanvasesTab}
          className={`p-2 rounded-xl transition-colors cursor-pointer relative ${
            sidebarOpen && sidebarTab === 'canvases'
              ? 'text-amber-600 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/40 ring-1 ring-amber-400/40'
              : 'text-stone-500 hover:text-amber-600 dark:text-neutral-400 dark:hover:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-950/20'
          }`}
          title="Caixa de Canvas Gerais"
        >
          <Box className="w-4 h-4" />
          {generalCanvasesCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-xs">
              {generalCanvasesCount > 9 ? '9+' : generalCanvasesCount}
            </span>
          )}
        </button>

        <div className="w-5 h-px bg-stone-200 dark:bg-white/10 my-0.5" />

        {/* Grafo de Conexões */}
        <button
          onClick={onOpenGraph}
          className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Abrir Grafo Interativo de Conexões"
        >
          <Network className="w-4 h-4" />
        </button>

        {/* Novo Canvas de Conexões */}
        <button
          onClick={onCreateBoardCanvas}
          className="p-2 rounded-xl text-stone-500 hover:text-purple-600 dark:text-neutral-400 dark:hover:text-purple-400 hover:bg-purple-100/70 dark:hover:bg-purple-950/30 transition-colors cursor-pointer"
          title="Novo Quadro de Conexões (Canvas)"
        >
          <FolderKanban className="w-4 h-4" />
        </button>

        {/* Modelos de Notas (Templates) */}
        <button
          onClick={() => setTemplateModalOpen(true)}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            templateModalOpen
              ? 'text-purple-600 dark:text-purple-400 bg-purple-100/80 dark:bg-purple-950/40'
              : 'text-stone-500 hover:text-purple-600 dark:text-neutral-400 dark:hover:text-purple-400 hover:bg-purple-100/70 dark:hover:bg-purple-950/30'
          }`}
          title="Modelos de Notas (Templates)"
        >
          <LayoutTemplate className="w-4 h-4" />
        </button>

        {/* Busca Global (Command Palette / Quick Switcher) */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Buscar notas ou executar comandos (Ctrl+P)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Painel de Backlinks e Detalhes */}
        <button
          onClick={() => setBacklinksPanelOpen(!backlinksPanelOpen)}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            backlinksPanelOpen
              ? 'text-purple-600 dark:text-purple-400 bg-purple-100/80 dark:bg-purple-950/40'
              : 'text-stone-500 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-white/10'
          }`}
          title="Painel de Backlinks e Propriedades"
        >
          <Link2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Actions (User / Help / Settings) */}
      <div className="flex flex-col items-center gap-2">
        {/* Storage Badge Icon */}
        <div 
          onClick={() => setSettingsOpen(true)}
          className="w-7 h-7 rounded-lg bg-stone-200/70 dark:bg-white/5 border border-stone-300/80 dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-stone-600 dark:text-neutral-300 cursor-pointer hover:border-purple-400 transition-colors"
          title={`Vault: ${vaultName} (${storageType === 'fsa' ? 'HD Local (Windows)' : 'IndexedDB'}). Clique para Configurações.`}
        >
          {storageType === 'fsa' ? (
            <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          )}
        </div>

        {/* Help / Ajuda */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:text-neutral-500 dark:hover:text-neutral-200 hover:bg-stone-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Ajuda e Atalhos (Ctrl+P)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Configurações do Vault */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:text-neutral-500 dark:hover:text-neutral-200 hover:bg-stone-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer hover:text-purple-600 dark:hover:text-purple-300"
          title="Configurações do Vault & Armazenamento"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
