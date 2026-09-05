import React from 'react';
import { HandlePosition } from '../../types';
import clsx from 'clsx';

interface ElementHandlesProps {
  isVisible: boolean;
  snappedHandle?: HandlePosition | null;
  onStartArrow: (handle: HandlePosition, e: React.PointerEvent) => void;
}

const HANDLE_POSITIONS: { handle: HandlePosition; className: string }[] = [
  { handle: 'top', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-crosshair' },
  { handle: 'right', className: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-crosshair' },
  { handle: 'bottom', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-crosshair' },
  { handle: 'left', className: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-crosshair' },
];

export const ElementHandles: React.FC<ElementHandlesProps> = ({
  isVisible,
  snappedHandle,
  onStartArrow,
}) => {
  return (
    <>
      {HANDLE_POSITIONS.map(({ handle, className }) => {
        const isSnapped = snappedHandle === handle;

        return (
          <div
            key={handle}
            className={clsx(
              "absolute z-30 flex items-center justify-center transition-all duration-150 pointer-events-auto",
              className,
              isVisible || isSnapped ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
            )}
            style={{ width: 16, height: 16 }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onStartArrow(handle, e);
            }}
            title={`Conectar a partir do ponto ${handle}`}
          >
            {/* Anel de Snap pulsante quando estiver atraindo a seta */}
            {isSnapped && (
              <span className="absolute inset-0 rounded-full bg-indigo-500/40 animate-ping" />
            )}

            {/* Ponto central da alça */}
            <div
              className={clsx(
                "w-3 h-3 rounded-full border-2 transition-transform duration-100 hover:scale-135 shadow-md",
                isSnapped
                  ? "bg-indigo-400 border-white ring-4 ring-indigo-500/50 scale-125"
                  : "bg-white border-indigo-600 hover:bg-indigo-500 hover:border-white"
              )}
            />
          </div>
        );
      })}
    </>
  );
};
