import React from 'react';
import { DropZoneType } from '../../interfaces/layout';

interface VaultDropOverlayProps {
  zone: DropZoneType;
}

export const VaultDropOverlay: React.FC<VaultDropOverlayProps> = ({ zone }) => {
  let positionClasses = '';

  switch (zone) {
    case 'split-top':
      // Ocupa os 50% superiores do painel (como na Imagem 3 de exemplo)
      positionClasses = 'top-0 left-0 right-0 h-1/2 p-2';
      break;
    case 'split-bottom':
      // Ocupa os 50% inferiores do painel
      positionClasses = 'bottom-0 left-0 right-0 h-1/2 p-2';
      break;
    case 'split-left':
      // Ocupa os 50% esquerdos do painel (como na Imagem 2 de exemplo)
      positionClasses = 'top-0 bottom-0 left-0 w-1/2 p-2';
      break;
    case 'split-right':
      // Ocupa os 50% direitos do painel
      positionClasses = 'top-0 bottom-0 right-0 w-1/2 p-2';
      break;
    case 'between-panes':
      // Barra vertical lilás entre janelas
      positionClasses = 'top-0 bottom-0 left-0 w-10 -ml-5 z-40 p-1';
      break;
    case 'tab-bar':
      // Destaque na barra de abas / topo
      positionClasses = 'top-0 left-0 right-0 h-9 p-0.5';
      break;
    default:
      positionClasses = 'inset-0 p-2';
  }

  return (
    <div
      className={`absolute ${positionClasses} pointer-events-none z-50 flex items-center justify-center`}
    >
      <div className="w-full h-full rounded-xl bg-purple-400/35 dark:bg-purple-500/30 border-2 border-purple-400 dark:border-purple-300/80 shadow-[0_0_24px_rgba(168,85,247,0.35)] backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-75">
        <span className="px-3 py-1 rounded-full bg-purple-900/90 dark:bg-purple-950/90 border border-purple-300/60 text-purple-100 text-xs font-semibold shadow-md">
          {zone === 'split-top' && 'Dividir acima'}
          {zone === 'split-bottom' && 'Dividir abaixo'}
          {zone === 'split-left' && 'Dividir à esquerda'}
          {zone === 'split-right' && 'Dividir à direita'}
          {zone === 'tab-bar' && 'Mover para esta barra de abas'}
          {zone === 'between-panes' && 'Inserir nova janela'}
        </span>
      </div>
    </div>
  );
};
