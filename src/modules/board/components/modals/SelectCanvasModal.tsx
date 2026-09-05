import React from 'react';
import { useIDB } from '@/utils/indexedDB';
import { FolderKanban, Music, X, Check } from 'lucide-react';
import { CanvasPreviewData } from '../../types';
import clsx from 'clsx';

interface SelectCanvasModalProps {
  isOpen: boolean;
  currentBoardId: string;
  onClose: () => void;
  onSelect: (data: CanvasPreviewData) => void;
}

export const SelectCanvasModal: React.FC<SelectCanvasModalProps> = ({
  isOpen,
  currentBoardId,
  onClose,
  onSelect,
}) => {
  const { activeLayers } = useIDB();

  if (!isOpen) return null;

  // Filtrar todos os projetos (Layers metadata)
  const projects = activeLayers.filter(l => l.isProjectMetadata && l.id !== currentBoardId);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Referenciar Outro Canvas</h3>
              <p className="text-[11px] text-neutral-400">Escolha um canvas de áudio ou outro board para criar um preview</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de projetos existentes */}
        <div className="max-h-72 overflow-y-auto flex flex-col gap-2 pr-1">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              Nenhum outro projeto encontrado no momento.
            </div>
          ) : (
            projects.map((proj) => {
              const isBoard = proj.canvasType === 'board';

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    onSelect({
                      targetProjectId: proj.id,
                      targetName: proj.name,
                      targetType: isBoard ? 'board' : 'audio',
                      previewInfo: `ID: ${proj.id.slice(0, 8)}...`,
                    });
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 hover:bg-emerald-600/15 border border-neutral-800 hover:border-emerald-500/30 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                        isBoard
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      )}
                    >
                      {isBoard ? <FolderKanban className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-white">
                        {proj.name}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {isBoard ? 'Canvas de Conexões' : 'Canvas de Áudio'} • {proj.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  <button className="text-xs text-emerald-400 font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Selecionar</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
