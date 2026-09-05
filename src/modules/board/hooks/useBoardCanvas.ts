import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  BoardElement,
  BoardConnection,
  BoardElementType,
  HandlePosition,
  NoteData,
  TextData,
  AudioData,
  ImageData,
  CanvasPreviewData,
  ViewportTransform,
  BoardElementPayload,
} from '../types';
import { useBoardStorage } from './useBoardStorage';
import { useBoardConnections, getFacingHandle, getOppositeHandle } from './useBoardConnections';

const DEFAULT_NOTE_WIDTH = 220;
const DEFAULT_NOTE_HEIGHT = 180;
const DEFAULT_TEXT_WIDTH = 200;
const DEFAULT_TEXT_HEIGHT = 70;
const DEFAULT_AUDIO_WIDTH = 280;
const DEFAULT_AUDIO_HEIGHT = 120;
const DEFAULT_IMAGE_WIDTH = 260;
const DEFAULT_IMAGE_HEIGHT = 200;
const DEFAULT_PREVIEW_WIDTH = 260;
const DEFAULT_PREVIEW_HEIGHT = 150;

export function useBoardCanvas(boardId: string, initialName?: string) {
  const { boardData, setBoardData, persistBoard, isLoading } = useBoardStorage(boardId, initialName);

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportTransform>({ x: -100, y: -100, k: 1 });
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  // Modais de criação direta
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [canvasModalOpen, setCanvasModalOpen] = useState(false);
  const modalPlacementPos = useRef<{ x: number; y: number } | null>(null);

  // Manipulação de conexões
  const setConnections = useCallback((updater: (prev: BoardConnection[]) => BoardConnection[]) => {
    setBoardData(prev => {
      const updatedConnections = updater(prev.connections);
      const updated = {
        ...prev,
        connections: updatedConnections,
        updatedAt: new Date().toISOString(),
      };
      persistBoard(updated);
      return updated;
    });
  }, [persistBoard, setBoardData]);

  // Criar elemento do mesmo tipo de origem e conectar ao soltar seta no espaço vazio
  const handleAutoSpawnAndConnect = useCallback((
    sourceId: string,
    sourceHandle: HandlePosition,
    dropPos: { x: number; y: number }
  ) => {
    const sourceEl = boardData.elements.find(el => el.id === sourceId);
    if (!sourceEl) return;

    const width = sourceEl.width || DEFAULT_NOTE_WIDTH;
    const height = sourceEl.height || DEFAULT_NOTE_HEIGHT;
    const targetHandle = getOppositeHandle(sourceHandle);

    let spawnX = dropPos.x;
    let spawnY = dropPos.y;

    switch (sourceHandle) {
      case 'right':
        spawnX = dropPos.x;
        spawnY = dropPos.y - height / 2;
        break;
      case 'left':
        spawnX = dropPos.x - width;
        spawnY = dropPos.y - height / 2;
        break;
      case 'bottom':
        spawnX = dropPos.x - width / 2;
        spawnY = dropPos.y;
        break;
      case 'top':
        spawnX = dropPos.x - width / 2;
        spawnY = dropPos.y - height;
        break;
    }

    // Criar novo elemento do mesmo tipo de origem
    let newData: NoteData | TextData | AudioData | ImageData | CanvasPreviewData | Record<string, unknown>;
    if (sourceEl.type === 'note') {
      const srcNote = (sourceEl.data || {}) as NoteData;
      newData = {
        title: 'Nova Nota',
        content: '',
        color: srcNote.color || '#8b5cf6',
      } as NoteData;
    } else if (sourceEl.type === 'text') {
      const srcText = (sourceEl.data || {}) as TextData;
      newData = {
        text: 'Novo Texto',
        fontSize: srcText.fontSize || 16,
        color: srcText.color,
        align: srcText.align,
        isBold: srcText.isBold,
      } as TextData;
    } else if (sourceEl.type === 'audio') {
      const srcAudio = (sourceEl.data || {}) as AudioData;
      newData = { ...srcAudio };
    } else if (sourceEl.type === 'image') {
      const srcImg = (sourceEl.data || {}) as ImageData;
      newData = { ...srcImg };
    } else if (sourceEl.type === 'canvas-preview') {
      const srcPreview = (sourceEl.data || {}) as CanvasPreviewData;
      newData = { ...srcPreview };
    } else {
      newData = { ...(sourceEl.data || {}) };
    }

    const maxZ = boardData.elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0);

    const newElement: BoardElement = {
      id: uuidv4(),
      boardId,
      type: sourceEl.type,
      x: spawnX,
      y: spawnY,
      width,
      height,
      zIndex: maxZ + 1,
      data: newData,
    };

    const newConnection: BoardConnection = {
      id: uuidv4(),
      boardId,
      fromId: sourceId,
      fromHandle: sourceHandle,
      toId: newElement.id,
      toHandle: targetHandle,
      color: '#818cf8',
    };

    setBoardData(prev => {
      const updated = {
        ...prev,
        elements: [...prev.elements, newElement],
        connections: [...prev.connections, newConnection],
        updatedAt: new Date().toISOString(),
      };
      persistBoard(updated);
      return updated;
    });

    setSelectedElementId(newElement.id);
  }, [boardData.elements, boardId, persistBoard, setBoardData]);

  const connectionsHook = useBoardConnections(
    boardData.elements,
    boardData.connections,
    setConnections,
    handleAutoSpawnAndConnect
  );

  // Atualizar elemento
  const updateElement = useCallback((id: string, updates: Partial<BoardElement>) => {
    setBoardData(prev => {
      const updatedElements = prev.elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      );
      const updated = {
        ...prev,
        elements: updatedElements,
        updatedAt: new Date().toISOString(),
      };
      persistBoard(updated);
      return updated;
    });
  }, [persistBoard, setBoardData]);

  // Excluir elemento (e conexões vinculadas)
  const deleteElement = useCallback((id: string) => {
    setBoardData(prev => {
      const updatedElements = prev.elements.filter(el => el.id !== id);
      const updatedConnections = prev.connections.filter(
        c => c.fromId !== id && c.toId !== id
      );
      const updated = {
        ...prev,
        elements: updatedElements,
        connections: updatedConnections,
        updatedAt: new Date().toISOString(),
      };
      persistBoard(updated);
      return updated;
    });
    if (selectedElementId === id) setSelectedElementId(null);
  }, [persistBoard, selectedElementId, setBoardData]);

  // Atualizar nome do board
  const updateBoardName = useCallback((name: string) => {
    setBoardData(prev => {
      const updated = { ...prev, name, updatedAt: new Date().toISOString() };
      persistBoard(updated);
      return updated;
    });
  }, [persistBoard, setBoardData]);

  // Adicionar elemento genérico
  const addElement = useCallback((element: Omit<BoardElement, 'boardId'>) => {
    const maxZ = boardData.elements.length > 0
      ? Math.max(...boardData.elements.map(e => e.zIndex))
      : 0;

    const newEl: BoardElement = {
      ...element,
      boardId,
      zIndex: maxZ + 1,
    };

    setBoardData(prev => {
      const updated = {
        ...prev,
        elements: [...prev.elements, newEl],
        updatedAt: new Date().toISOString(),
      };
      persistBoard(updated);
      return updated;
    });

    setSelectedElementId(newEl.id);
    return newEl;
  }, [boardData.elements, boardId, persistBoard, setBoardData]);

  // Criar Nota
  const createNote = useCallback((
    pos?: { x: number; y: number },
    color: string = '#fef08a',
    initialTitle?: string,
    initialContent?: string,
    filePath?: string
  ) => {
    const x = pos ? pos.x : (-viewportRef.current.x + 300) / viewportRef.current.k;
    const y = pos ? pos.y : (-viewportRef.current.y + 200) / viewportRef.current.k;

    return addElement({
      id: uuidv4(),
      type: 'note',
      x,
      y,
      width: DEFAULT_NOTE_WIDTH,
      height: DEFAULT_NOTE_HEIGHT,
      zIndex: 1,
      data: {
        title: initialTitle || 'Nova Nota',
        content: initialContent || '',
        color,
        filePath,
      } as NoteData,
    });
  }, [addElement]);

  // Criar Texto
  const createText = useCallback((pos?: { x: number; y: number }) => {
    const x = pos ? pos.x : (-viewportRef.current.x + 300) / viewportRef.current.k;
    const y = pos ? pos.y : (-viewportRef.current.y + 200) / viewportRef.current.k;

    return addElement({
      id: uuidv4(),
      type: 'text',
      x,
      y,
      width: DEFAULT_TEXT_WIDTH,
      height: DEFAULT_TEXT_HEIGHT,
      zIndex: 1,
      data: {
        text: 'Clique duas vezes para editar...',
        fontSize: 18,
        color: '#f8fafc',
        align: 'left',
        isBold: false,
      } as TextData,
    });
  }, [addElement]);

  // Criar Áudio
  const createAudio = useCallback((audioData: AudioData, pos?: { x: number; y: number }) => {
    const x = pos ? pos.x : (-viewportRef.current.x + 300) / viewportRef.current.k;
    const y = pos ? pos.y : (-viewportRef.current.y + 200) / viewportRef.current.k;

    return addElement({
      id: uuidv4(),
      type: 'audio',
      x,
      y,
      width: DEFAULT_AUDIO_WIDTH,
      height: DEFAULT_AUDIO_HEIGHT,
      zIndex: 1,
      data: audioData,
    });
  }, [addElement]);

  // Criar Imagem
  const createImage = useCallback((imageData: ImageData, pos?: { x: number; y: number }) => {
    const x = pos ? pos.x : (-viewportRef.current.x + 300) / viewportRef.current.k;
    const y = pos ? pos.y : (-viewportRef.current.y + 200) / viewportRef.current.k;

    return addElement({
      id: uuidv4(),
      type: 'image',
      x,
      y,
      width: DEFAULT_IMAGE_WIDTH,
      height: DEFAULT_IMAGE_HEIGHT,
      zIndex: 1,
      data: imageData,
    });
  }, [addElement]);

  // Criar Preview de Canvas
  const createCanvasPreview = useCallback((previewData: CanvasPreviewData, pos?: { x: number; y: number }) => {
    const x = pos ? pos.x : (-viewportRef.current.x + 300) / viewportRef.current.k;
    const y = pos ? pos.y : (-viewportRef.current.y + 200) / viewportRef.current.k;

    return addElement({
      id: uuidv4(),
      type: 'canvas-preview',
      x,
      y,
      width: DEFAULT_PREVIEW_WIDTH,
      height: DEFAULT_PREVIEW_HEIGHT,
      zIndex: 1,
      data: previewData,
    });
  }, [addElement]);

  // Criação contextual conectada a partir de soltura de seta no vazio!
  const createConnectedElement = useCallback((
    type: BoardElementType,
    payload?: BoardElementPayload
  ) => {
    const context = connectionsHook.pendingArrowContext;
    if (!context) return;

    const { sourceId, sourceHandle, dropPos } = context;

    let newEl: BoardElement;
    const spawnX = dropPos.x - 100;
    const spawnY = dropPos.y - 60;

    switch (type) {
      case 'note': {
        const notePayload = payload as Partial<NoteData> | undefined;
        newEl = createNote({ x: spawnX, y: spawnY }, notePayload?.color || '#fef08a');
        break;
      }
      case 'text':
        newEl = createText({ x: spawnX, y: spawnY });
        break;
      case 'audio':
        newEl = createAudio(
          (payload as AudioData) || { name: 'Áudio Sem Nome', volume: 1 },
          { x: spawnX, y: spawnY }
        );
        break;
      case 'image':
        newEl = createImage(
          (payload as ImageData) || { name: 'Imagem', src: '' },
          { x: spawnX, y: spawnY }
        );
        break;
      case 'canvas-preview':
        newEl = createCanvasPreview(
          (payload as CanvasPreviewData) || { targetProjectId: '', targetName: 'Canvas', targetType: 'audio' },
          { x: spawnX, y: spawnY }
        );
        break;
    }

    // Calcular a melhor alça de conexão voltada para a origem
    const targetHandle = getFacingHandle(dropPos, newEl);

    // Conectar elemento de origem ao novo elemento!
    setConnections(prev => [
      ...prev,
      {
        id: uuidv4(),
        boardId,
        fromId: sourceId,
        fromHandle: sourceHandle,
        toId: newEl.id,
        toHandle: targetHandle,
        color: '#818cf8',
      },
    ]);

    connectionsHook.closePendingArrowContext();
  }, [
    boardId,
    connectionsHook,
    createAudio,
    createCanvasPreview,
    createImage,
    createNote,
    createText,
    setConnections,
  ]);

  // Teclado: Excluir item ou conexão selecionada com Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.getAttribute('contenteditable') === 'true') {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          deleteElement(selectedElementId);
        } else if (connectionsHook.selectedConnectionId) {
          e.preventDefault();
          connectionsHook.deleteConnection(connectionsHook.selectedConnectionId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectionsHook, deleteElement, selectedElementId]);

  return {
    boardData,
    isLoading,
    selectedElementId,
    setSelectedElementId,
    viewport,
    setViewport,
    viewportRef,
    updateBoardName,
    updateElement,
    deleteElement,
    createNote,
    createText,
    createAudio,
    createImage,
    createCanvasPreview,
    createConnectedElement,
    connectionsHook,
    audioModalOpen,
    setAudioModalOpen,
    imageModalOpen,
    setImageModalOpen,
    canvasModalOpen,
    setCanvasModalOpen,
    modalPlacementPos,
  };
}
