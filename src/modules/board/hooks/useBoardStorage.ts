import { useState, useEffect, useCallback, useRef } from 'react';
import { BoardData } from '../types';
import { cleanLegacyPlaceholder } from '@/utils/cleanLegacyPlaceholder';

const DB_NAME = 'RPGSA_DB';
const STORE_NAME = 'keyval';

function openKeyvalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not available'));
    }
    const request = indexedDB.open(DB_NAME, 12);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getBoardDataFromIDB(boardId: string): Promise<BoardData | null> {
  try {
    const db = await openKeyvalDB();
    if (!db.objectStoreNames.contains(STORE_NAME)) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(`board_data_${boardId}`);
      req.onsuccess = () => {
        const val = req.result;
        if (val) {
          try {
            const parsed = typeof val === 'string' ? JSON.parse(val) : val;
            if (parsed && Array.isArray(parsed.elements)) {
              let changed = false;
              parsed.elements = parsed.elements.map((el: any) => {
                if (el.type === 'note' && el.data?.content) {
                  const cleaned = cleanLegacyPlaceholder(el.data.content);
                  if (cleaned !== el.data.content) {
                    changed = true;
                    return { ...el, data: { ...el.data, content: cleaned } };
                  }
                }
                return el;
              });
              if (changed) {
                saveBoardDataToIDB(parsed);
              }
            }
            resolve(parsed);
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error('Erro ao ler board do IndexedDB:', err);
    return null;
  }
}

async function saveBoardDataToIDB(data: BoardData): Promise<void> {
  try {
    const db = await openKeyvalDB();
    if (!db.objectStoreNames.contains(STORE_NAME)) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(JSON.stringify(data), `board_data_${data.id}`);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Erro ao salvar board no IndexedDB:', err);
  }
}

export function useBoardStorage(boardId: string, initialName: string = 'Quadro de Conexões') {
  const [boardData, setBoardData] = useState<BoardData>({
    id: boardId,
    name: initialName,
    elements: [],
    connections: [],
    updatedAt: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar dados salvos ao montar ou quando mudar boardId
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getBoardDataFromIDB(boardId).then((saved) => {
      if (!isMounted) return;
      if (saved) {
        setBoardData(saved);
      } else {
        setBoardData({
          id: boardId,
          name: initialName,
          elements: [],
          connections: [],
          updatedAt: new Date().toISOString(),
        });
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [boardId, initialName]);

  // Salvar com debounce de 350ms
  const persistBoard = useCallback((data: BoardData) => {
    setBoardData(data);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveBoardDataToIDB(data);
    }, 350);
  }, []);

  return {
    boardData,
    setBoardData,
    persistBoard,
    isLoading,
  };
}
