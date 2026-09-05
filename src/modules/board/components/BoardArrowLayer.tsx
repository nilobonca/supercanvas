import React from 'react';
import { BoardElement, BoardConnection, HandlePosition } from '../types';
import { getHandleCoordinates, ActiveArrowDrag } from '../hooks/useBoardConnections';
import { Trash2 } from 'lucide-react';

interface BoardArrowLayerProps {
  elements: BoardElement[];
  connections: BoardConnection[];
  activeDrag: ActiveArrowDrag | null;
  selectedConnectionId: string | null;
  onSelectConnection: (id: string | null) => void;
  onDeleteConnection: (id: string) => void;
}

function getHandleNormal(handle: HandlePosition): { x: number; y: number } {
  switch (handle) {
    case 'top': return { x: 0, y: -1 };
    case 'right': return { x: 1, y: 0 };
    case 'bottom': return { x: 0, y: 1 };
    case 'left': return { x: -1, y: 0 };
  }
}

export function computeBezierCurve(
  p1: { x: number; y: number },
  h1: HandlePosition,
  p2: { x: number; y: number },
  h2?: HandlePosition
): { path: string; mid: { x: number; y: number } } {
  const n1 = getHandleNormal(h1);
  const n2 = h2 ? getHandleNormal(h2) : { x: 0, y: 0 };

  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const curvature = Math.max(40, Math.min(180, dist * 0.45));

  const cp1 = {
    x: p1.x + n1.x * curvature,
    y: p1.y + n1.y * curvature,
  };

  const cp2 = {
    x: p2.x + n2.x * curvature,
    y: p2.y + n2.y * curvature,
  };

  const path = `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`;

  // Ponto médio da curva de Bézier em t = 0.5
  const t = 0.5;
  const midX = Math.pow(1 - t, 3) * p1.x + 3 * Math.pow(1 - t, 2) * t * cp1.x + 3 * (1 - t) * Math.pow(t, 2) * cp2.x + Math.pow(t, 3) * p2.x;
  const midY = Math.pow(1 - t, 3) * p1.y + 3 * Math.pow(1 - t, 2) * t * cp1.y + 3 * (1 - t) * Math.pow(t, 2) * cp2.y + Math.pow(t, 3) * p2.y;

  return { path, mid: { x: midX, y: midY } };
}

export const BoardArrowLayer: React.FC<BoardArrowLayerProps> = ({
  elements,
  connections,
  activeDrag,
  selectedConnectionId,
  onSelectConnection,
  onDeleteConnection,
}) => {
  const elementsMap = React.useMemo(() => {
    const map = new Map<string, BoardElement>();
    elements.forEach(e => map.set(e.id, e));
    return map;
  }, [elements]);

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <svg className="w-full h-full overflow-visible">
        <defs>
          {/* Ponteira Padrão */}
          <marker
            id="board-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#818cf8" />
          </marker>

          {/* Ponteira Selecionada */}
          <marker
            id="board-arrow-selected"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8" />
          </marker>

          {/* Ponteira Temporária do Arraste */}
          <marker
            id="board-arrow-drag"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#a5b4fc" />
          </marker>
        </defs>

        {/* Conexões Fixas Persistidas */}
        {connections.map((conn) => {
          const fromEl = elementsMap.get(conn.fromId);
          const toEl = elementsMap.get(conn.toId);
          if (!fromEl || !toEl) return null;

          const p1 = getHandleCoordinates(fromEl, conn.fromHandle);
          const p2 = getHandleCoordinates(toEl, conn.toHandle);

          const { path } = computeBezierCurve(p1, conn.fromHandle, p2, conn.toHandle);
          const isSelected = selectedConnectionId === conn.id;

          return (
            <g key={conn.id} className="group pointer-events-auto">
              {/* Hitbox Invisível mais larga para facilitar clique */}
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectConnection(conn.id);
                }}
              />

              {/* Linha Visível da Seta */}
              <path
                d={path}
                fill="none"
                stroke={isSelected ? "#38bdf8" : (conn.color || "#818cf8")}
                strokeWidth={isSelected ? 3.5 : 2.5}
                strokeDasharray={conn.style === 'dashed' ? "6,4" : undefined}
                markerEnd={`url(#${isSelected ? "board-arrow-selected" : "board-arrow"})`}
                className="transition-colors duration-150 group-hover:stroke-sky-400 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectConnection(conn.id);
                }}
              />
            </g>
          );
        })}

        {/* Seta Dinâmica do Arraste Ativo */}
        {activeDrag && (
          <g>
            <path
              d={
                computeBezierCurve(
                  activeDrag.startPos,
                  activeDrag.sourceHandle,
                  activeDrag.currentPos,
                  activeDrag.snappedTarget ? activeDrag.snappedTarget.handle : undefined
                ).path
              }
              fill="none"
              stroke="#a5b4fc"
              strokeWidth={2.5}
              strokeDasharray="6,4"
              markerEnd="url(#board-arrow-drag)"
              className="animate-pulse"
            />
          </g>
        )}
      </svg>

      {/* Botão de exclusão no ponto médio da conexão selecionada */}
      {selectedConnectionId && (() => {
        const conn = connections.find(c => c.id === selectedConnectionId);
        if (!conn) return null;
        const fromEl = elementsMap.get(conn.fromId);
        const toEl = elementsMap.get(conn.toId);
        if (!fromEl || !toEl) return null;

        const p1 = getHandleCoordinates(fromEl, conn.fromHandle);
        const p2 = getHandleCoordinates(toEl, conn.toHandle);
        const { mid } = computeBezierCurve(p1, conn.fromHandle, p2, conn.toHandle);

        return (
          <div
            style={{
              position: 'absolute',
              left: mid.x,
              top: mid.y,
              transform: 'translate(-50%, -50%)',
            }}
            className="pointer-events-auto z-40"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConnection(conn.id);
              }}
              className="p-1.5 bg-neutral-900 border border-sky-500 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/20 shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
              title="Excluir conexão"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}
    </div>
  );
};
