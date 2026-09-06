import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  PanelLeftClose, 
  PanelLeft, 
  Network, 
  FolderKanban, 
  Search, 
  Link2, 
  Settings,
  LayoutTemplate,
  Edit2,
  Check,
  Box,
  Files,
  Sun,
  Moon
} from 'lucide-react';
import { SafeIcon } from '@/components/common/SafeIcon';
import { ConchaLogo } from '@/components/common/ConchaLogo';
import { useVaultStore } from '../../hooks/useVaultStore';
import { useThemeStore } from '@/store/themeStore';

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

  const { theme, toggleTheme } = useThemeStore();
  const isLight = theme === 'light';
  const ThemeIcon = isLight ? Sun : Moon;

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
        {/* Marca / Logo Concha */}
        <Link
          href="/"
          className="relative group cursor-pointer"
          title="Concha"
        >
          {/* Outer glow ring on hover with brand gradient */}
          <div className="absolute -inset-1 rounded-xl bg-brand-gradient opacity-0 group-hover:opacity-75 blur-xs transition-opacity duration-300" />
          
          <div className="relative w-7 h-7 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 group-hover:border-[#7F95FF]/50 transition-all duration-300 active:scale-95 p-1.5 overflow-hidden shadow-xs">
            <ConchaLogo 
              className="w-full h-full object-contain select-none transition-transform duration-300 group-hover:scale-110" 
              theme={theme}
            />
          </div>

          {/* Floating Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 bg-stone-900 text-stone-100 dark:bg-white dark:text-stone-900 shadow-xl border border-white/10 dark:border-black/10 backdrop-blur-md">
            Concha
          </div>
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
                ? 'bg-[#1831D7] text-white ring-2 ring-[#7F95FF]/50'
                : 'bg-[#1831D7]/10 hover:bg-[#1831D7]/20 text-[#1831D7] dark:text-[#7F95FF] border border-[#7F95FF]/30'
            }`}
            title={`Vault: ${vaultName} (Clique para opções e renomear)`}
          >
            <SafeIcon size={14} />
            <span 
              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-[#111116] ${
                storageType === 'fsa' ? 'bg-emerald-500' : 'bg-[#1831D7]'
              }`} 
            />
          </button>

          {/* Vault Name Popover */}
          {vaultMenuOpen && (
            <div className="absolute left-10 top-0 w-64 bg-white dark:bg-[#16161D] border border-stone-200 dark:border-white/10 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2.5 text-stone-900 dark:text-neutral-100">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-white/5">
                <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-neutral-500">
                  <SafeIcon size={11} className="text-[#1831D7] dark:text-[#7F95FF]" />
                  Vault Ativo
                </span>
                <span className="flex items-center gap-1 text-[10px] text-stone-500 dark:text-neutral-400 font-mono">
                  <span className={`w-1.5 h-1.5 rounded-full ${storageType === 'fsa' ? 'bg-emerald-500' : 'bg-[#1831D7]'}`} />
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
                    className="flex-1 bg-stone-50 dark:bg-black/30 border border-[#1831D7] rounded-lg px-2 py-1 text-xs text-stone-900 dark:text-neutral-100 outline-none"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded-md bg-[#1831D7] hover:bg-[#1831D7]/90 text-white transition-colors cursor-pointer"
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
                  <span className="font-semibold text-xs text-stone-900 dark:text-neutral-100 truncate group-hover:text-[#1831D7] dark:group-hover:text-[#7F95FF]">
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
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#1831D7]/10 text-stone-700 dark:text-neutral-300 hover:text-[#1831D7] dark:hover:text-[#7F95FF] transition-colors text-left cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#1831D7] dark:text-[#7F95FF]" />
                  <span>Renomear Vault</span>
                </button>
                <button
                  onClick={() => {
                    setVaultMenuOpen(false);
                    setSettingsOpen(true);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#1831D7]/10 text-stone-700 dark:text-neutral-300 hover:text-[#1831D7] dark:hover:text-[#7F95FF] transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-[#1831D7] dark:text-[#7F95FF]" />
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
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes('application/rpgsa-vault-node') || e.dataTransfer.types.includes('Files')) {
              e.preventDefault();
              if (!sidebarOpen) toggleSidebar();
              setSidebarTab('files');
            }
          }}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            sidebarOpen && sidebarTab === 'files'
              ? 'text-[#1831D7] dark:text-[#7F95FF] bg-[#1831D7]/10 ring-1 ring-[#7F95FF]/40'
              : 'text-stone-500 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-white/10'
          }`}
          title="Explorador de Arquivos e Notas (Ctrl+B)"
        >
          <Files className="w-4 h-4" />
        </button>

        {/* Caixa de Canvas Gerais */}
        <button
          onClick={handleToggleCanvasesTab}
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes('application/rpgsa-canvas')) {
              e.preventDefault();
              if (!sidebarOpen) toggleSidebar();
              setSidebarTab('canvases');
            }
          }}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            sidebarOpen && sidebarTab === 'canvases'
              ? 'text-[#1831D7] dark:text-[#7F95FF] bg-[#1831D7]/10 ring-1 ring-[#7F95FF]/40'
              : 'text-stone-500 hover:text-[#1831D7] dark:text-neutral-400 dark:hover:text-[#7F95FF] hover:bg-[#1831D7]/10'
          }`}
          title="Caixa de Canvas Gerais"
        >
          <Box className="w-4 h-4" />
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
          className="p-2 rounded-xl text-stone-500 hover:text-[#1831D7] dark:text-neutral-400 dark:hover:text-[#7F95FF] hover:bg-[#1831D7]/10 transition-colors cursor-pointer"
          title="Novo Quadro de Conexões (Canvas)"
        >
          <FolderKanban className="w-4 h-4" />
        </button>

        {/* Modelos de Notas (Templates) */}
        <button
          onClick={() => setTemplateModalOpen(true)}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            templateModalOpen
              ? 'text-[#1831D7] dark:text-[#7F95FF] bg-[#1831D7]/10'
              : 'text-stone-500 hover:text-[#1831D7] dark:text-neutral-400 dark:hover:text-[#7F95FF] hover:bg-[#1831D7]/10'
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
              ? 'text-[#1831D7] dark:text-[#7F95FF] bg-[#1831D7]/10'
              : 'text-stone-500 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-white/10'
          }`}
          title="Painel de Backlinks e Propriedades"
        >
          <Link2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Actions (Theme Toggle & Settings) */}
      <div className="flex flex-col items-center gap-1.5">
        {/* Alternar Tema */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:text-neutral-500 dark:hover:text-neutral-200 hover:bg-stone-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer hover:text-[#1831D7] dark:hover:text-[#7F95FF]"
          title={isLight ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro'}
          aria-label="Alternar Tema"
        >
          <ThemeIcon className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
        </button>

        {/* Configurações do Vault */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:text-neutral-500 dark:hover:text-neutral-200 hover:bg-stone-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer hover:text-[#1831D7] dark:hover:text-[#7F95FF]"
          title="Configurações do Vault & Armazenamento"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
