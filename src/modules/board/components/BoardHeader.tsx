import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Check, Edit2, FolderKanban, Folder, Box, Sun, Moon } from 'lucide-react';
import { WindowControls } from '@/components/common/WindowControls';
import { isElectron } from '@/utils/electronHelper';

interface BoardHeaderProps {
  boardName: string;
  onUpdateName: (name: string) => void;
  elementsCount: number;
  connectionsCount: number;
  canvasTheme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  isEmbeddedInVault?: boolean;
  onCloseEmbedded?: () => void;
  folderPath?: string | null;
  onMoveToGeneral?: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  boardName,
  onUpdateName,
  elementsCount,
  connectionsCount,
  canvasTheme = 'dark',
  onToggleTheme,
  isEmbeddedInVault,
  onCloseEmbedded,
  folderPath,
  onMoveToGeneral,
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(boardName);
  const [isElec, setIsElec] = useState(false);

  useEffect(() => {
    setIsElec(isElectron());
  }, []);

  const handleSave = () => {
    if (tempName.trim()) {
      onUpdateName(tempName.trim());
    }
    setIsEditing(false);
  };

  return (
    <header 
      className="absolute top-0 inset-x-0 h-16 pt-4 px-4 z-40 pointer-events-auto flex items-center justify-between select-none app-region-drag"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Lado Esquerdo: Voltar + Nome + Badge */}
      <div 
        className="pointer-events-auto flex items-center gap-3 bg-white/85 dark:bg-[#14141C]/85 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-2.5 shadow-xl backdrop-blur-xl text-stone-900 dark:text-white app-region-no-drag"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {(!isEmbeddedInVault || onCloseEmbedded) && (
          <>
            <button
              onClick={() => {
                if (isEmbeddedInVault && onCloseEmbedded) {
                  onCloseEmbedded();
                } else {
                  router.push('/');
                }
              }}
              className="p-1.5 hover:bg-stone-100 dark:hover:bg-white/10 rounded-xl text-stone-500 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white transition-colors"
              title={isEmbeddedInVault ? "Fechar Canvas no Vault" : "Voltar aos Projetos"}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10" />
          </>
        )}

        {/* Nome do Board */}
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
              className="bg-stone-50 dark:bg-black/40 border border-purple-500 rounded-lg px-2 py-0.5 text-sm font-semibold outline-none w-48 text-stone-900 dark:text-white"
            />
            <button
              onClick={handleSave}
              className="p-1 hover:bg-purple-100 dark:hover:bg-purple-600/20 text-purple-600 dark:text-purple-400 rounded-lg"
              title="Salvar nome"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => {
              setTempName(boardName);
              setIsEditing(true);
            }}
            className="flex items-center gap-2 cursor-pointer group"
            title="Clique para renomear"
          >
            <h1 className="text-sm font-bold group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
              {boardName}
            </h1>
            <Edit2 className="w-3.5 h-3.5 text-stone-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Localização da Pasta / Caixa Geral */}
        {folderPath ? (
          <div className="badge-pastel-lavender flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            <Folder className="w-3 h-3" />
            <span className="truncate max-w-[130px]">{folderPath}</span>
            {onMoveToGeneral && (
              <button
                onClick={onMoveToGeneral}
                className="ml-1 p-0.5 hover:bg-black/10 dark:hover:bg-white/20 rounded transition-colors"
                title="Mover para a Caixa de Canvas Gerais"
              >
                <Box className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <span className="badge-pastel-amber text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Box className="w-3 h-3" />
            <span>Caixa Geral</span>
          </span>
        )}

        {/* Badge do Tipo de Canvas */}
        <span className="badge-pastel-lavender text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <FolderKanban className="w-3 h-3" />
          <span>Canvas de Conexões</span>
        </span>
      </div>

      {/* Centro: Área Livre de Drag da Janela */}
      <div 
        className="flex-1 h-full min-w-8 app-region-drag cursor-default"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        title="Arrastar Janela"
      />

      {/* Lado Direito: Estatísticas / Resumo, Alternador de Fundo do Canvas e Controles da Janela (.exe) */}
      <div 
        className="pointer-events-auto flex items-center gap-2 bg-white/85 dark:bg-[#14141C]/85 border border-black/10 dark:border-white/10 rounded-2xl px-3 py-1.5 shadow-xl backdrop-blur-xl text-stone-500 dark:text-neutral-400 text-xs font-mono select-none shrink-0 app-region-no-drag"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span>{elementsCount} elementos</span>
        <span>•</span>
        <span>{connectionsCount} setas</span>
        {onToggleTheme && (
          <>
            <span>•</span>
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-stone-700 dark:text-neutral-300 transition-colors cursor-pointer font-sans text-xs font-medium"
              title={canvasTheme === 'light' ? "Mudar para fundo escuro" : "Mudar para fundo claro"}
            >
              {canvasTheme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-purple-600" />
                  <span>Fundo Escuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fundo Claro</span>
                </>
              )}
            </button>
          </>
        )}
        {isElec && (
          <>
            <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />
            <WindowControls variant="compact" />
          </>
        )}
      </div>
    </header>
  );
};
