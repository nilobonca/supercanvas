import { useState, useCallback } from 'react';
import { BoardElement, BoardConnection, HandlePosition, PendingArrowContext } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const SNAP_THRESHOLD = 35;

export function getHandleCoordinates(element: BoardElement, handle: HandlePosition): { x: number; y: number } {
  const { x, y, width, height } = element;
  switch (handle) {
    case 'top':
      return { x: x + width / 2, y };
    case 'right':
      return { x: x + width, y: y + height / 2 };
    case 'bottom':
      return { x: x + width / 2, y: y + height };
    case 'left':
      return { x, y: y + height / 2 };
  }
}

export function getOppositeHandle(handle: HandlePosition): HandlePosition {
  switch (handle) {
    case 'top': return 'bottom';
    case 'bottom': return 'top';
    case 'left': return 'right';
    case 'right': return 'left';
  }
}

export function getFacingHandle(
  fromPos: { x: number; y: number },
  toElement: { x: number; y: number; width: number; height: number }
): HandlePosition {
  const toCenter = {
    x: toElement.x + toElement.width / 2,
    y: toElement.y + toElement.height / 2,
  };
  const dx = toCenter.x - fromPos.x;
  const dy = toCenter.y - fromPos.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'left' : 'right';
  } else {
    return dy >= 0 ? 'top' : 'bottom';
  }
}

export interface ActiveArrowDrag {
  sourceId: string;
  sourceHandle: HandlePosition;
  startPos: { x: number; y: number };
  currentPos: { x: number; y: number };
  snappedTarget: { elementId: string; handle: HandlePosition } | null;
}

export function useBoardConnections(
  elements: BoardElement[],
  connections: BoardConnection[],
  setConnections: (updater: (prev: BoardConnection[]) => BoardConnection[]) => void,
  onAutoSpawnAndConnect?: (
    sourceId: string,
    sourceHandle: HandlePosition,
    worldPos: { x: number; y: number }
  ) => void
) {
  const [activeDrag, setActiveDrag] = useState<ActiveArrowDrag | null>(null);
  const [pendingArrowContext, setPendingArrowContext] = useState<PendingArrowContext | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  // Iniciar arraste de seta a partir de uma alça
  const startArrowDrag = useCallback((
    sourceId: string,
    sourceHandle: HandlePosition,
    e: React.PointerEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const sourceEl = elements.find(el => el.id === sourceId);
    if (!sourceEl) return;

    const startPos = getHandleCoordinates(sourceEl, sourceHandle);

    setActiveDrag({
      sourceId,
      sourceHandle,
      startPos,
      currentPos: startPos,
      snappedTarget: null,
    });
  }, [elements]);

  // Atualizar arraste da seta com movimentação do mouse
  const updateArrowDrag = useCallback((worldPos: { x: number; y: number }) => {
    if (!activeDrag) return;

    // Buscar snap em alças de outros elementos
    let bestSnap: { elementId: string; handle: HandlePosition; pos: { x: number; y: number } } | null = null;
    let minDistance = SNAP_THRESHOLD;

    elements.forEach(el => {
      if (el.id === activeDrag.sourceId) return;

      const handles: HandlePosition[] = ['top', 'right', 'bottom', 'left'];
      handles.forEach(handle => {
        const hPos = getHandleCoordinates(el, handle);
        const dist = Math.hypot(worldPos.x - hPos.x, worldPos.y - hPos.y);
        if (dist < minDistance) {
          minDistance = dist;
          bestSnap = { elementId: el.id, handle, pos: hPos };
        }
      });
    });

    setActiveDrag(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentPos: bestSnap ? bestSnap.pos : worldPos,
        snappedTarget: bestSnap ? { elementId: bestSnap.elementId, handle: bestSnap.handle } : null,
      };
    });
  }, [activeDrag, elements]);

  // Finalizar arraste de seta (soltura)
  const finishArrowDrag = useCallback((
    worldPos: { x: number; y: number },
    screenPos: { x: number; y: number }
  ) => {
    if (!activeDrag) return;

    const { sourceId, sourceHandle, snappedTarget, startPos } = activeDrag;

    if (snappedTarget && snappedTarget.elementId !== sourceId) {
      // Conexão direta com elemento existente!
      const newConnection: BoardConnection = {
        id: uuidv4(),
        boardId: '',
        fromId: sourceId,
        fromHandle: sourceHandle,
        toId: snappedTarget.elementId,
        toHandle: snappedTarget.handle,
        color: '#818cf8', // Indigo elegante
      };

      setConnections(prev => [...prev, newConnection]);
      setActiveDrag(null);
    } else {
      // Solto no espaço vazio!
      const dragDist = Math.hypot(worldPos.x - startPos.x, worldPos.y - startPos.y);
      setActiveDrag(null);

      if (dragDist >= 20 && onAutoSpawnAndConnect) {
        onAutoSpawnAndConnect(sourceId, sourceHandle, worldPos);
      } else if (dragDist >= 20) {
        setPendingArrowContext({
          sourceId,
          sourceHandle,
          dropPos: worldPos,
          screenPos,
        });
      }
    }
  }, [activeDrag, onAutoSpawnAndConnect, setConnections]);

  const cancelArrowDrag = useCallback(() => {
    setActiveDrag(null);
  }, []);

  const closePendingArrowContext = useCallback(() => {
    setPendingArrowContext(null);
  }, []);

  const deleteConnection = useCallback((id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
    if (selectedConnectionId === id) setSelectedConnectionId(null);
  }, [selectedConnectionId, setConnections]);

  return {
    activeDrag,
    pendingArrowContext,
    selectedConnectionId,
    setSelectedConnectionId,
    startArrowDrag,
    updateArrowDrag,
    finishArrowDrag,
    cancelArrowDrag,
    closePendingArrowContext,
    deleteConnection,
  };
}
