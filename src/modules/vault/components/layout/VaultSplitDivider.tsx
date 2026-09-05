import React, { useCallback, useState } from 'react';
import { SplitDirection } from '../../interfaces/layout';
import { useVaultStore } from '../../hooks/useVaultStore';
import { normalizeSizes } from '../../utils/layoutUtils';

interface VaultSplitDividerProps {
  splitId: string;
  direction: SplitDirection;
  index: number; // Índice entre child[index] e child[index + 1]
  sizes: number[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const VaultSplitDivider: React.FC<VaultSplitDividerProps> = ({
  splitId,
  direction,
  index,
  sizes,
  containerRef
}) => {
  const { resizeSplit } = useVaultStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const isHorizontal = direction === 'horizontal';
    const totalPixels = isHorizontal ? containerRect.width : containerRect.height;
    if (totalPixels <= 0) return;

    setIsDragging(true);

    const startCoord = isHorizontal ? e.clientX : e.clientY;
    const initialSizes = [...sizes];
    const prevSize = initialSizes[index];
    const nextSize = initialSizes[index + 1];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentCoord = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
      const deltaPx = currentCoord - startCoord;
      const deltaPercent = (deltaPx / totalPixels) * 100;

      // Limites mínimos de 10% para cada janela
      const minPercent = 10;
      let newPrev = prevSize + deltaPercent;
      let newNext = nextSize - deltaPercent;

      if (newPrev < minPercent) {
        newPrev = minPercent;
        newNext = prevSize + nextSize - minPercent;
      } else if (newNext < minPercent) {
        newNext = minPercent;
        newPrev = prevSize + nextSize - minPercent;
      }

      const updated = [...initialSizes];
      updated[index] = Math.round(newPrev * 10) / 10;
      updated[index + 1] = Math.round(newNext * 10) / 10;

      resizeSplit(splitId, updated);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [containerRef, direction, index, resizeSplit, sizes, splitId]);

  const handleDoubleClick = () => {
    // Redefine tamanhos iguais em caso de clique duplo
    const equalSizes = normalizeSizes(sizes.length);
    resizeSplit(splitId, equalSizes);
  };

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className={`relative z-20 select-none group transition-colors ${
        isHorizontal
          ? 'w-2 -mx-1 cursor-col-resize h-full'
          : 'h-2 -my-1 cursor-row-resize w-full'
      }`}
      title="Arraste para redimensionar (Duplo clique para igualar)"
    >
      <div
        className={`absolute inset-0 m-auto transition-all ${
          isHorizontal ? 'w-0.5 h-full' : 'h-0.5 w-full'
        } ${
          isDragging
            ? 'bg-purple-500 shadow-[0_0_8px_rgba(167,139,250,0.8)]'
            : 'bg-stone-200 dark:bg-white/10 group-hover:bg-purple-500'
        }`}
      />
    </div>
  );
};
