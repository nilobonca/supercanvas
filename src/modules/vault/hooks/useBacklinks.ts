import { useState, useEffect, useRef } from 'react';
import { useVaultStore } from './useVaultStore';
import { extractWikilinks, extractContextSnippet, normalizeNoteTitle, BacklinkReference } from '../utils/wikilinkUtils';

export function useBacklinks() {
  const { activePath, provider, nodes, lastSavedAt } = useVaultStore();
  const [backlinks, setBacklinks] = useState<BacklinkReference[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // In-memory cache of file contents to avoid excessive disk/IDB reads: { path: content }
  const fileCacheRef = useRef<Map<string, { content: string; updatedAt: number }>>(new Map());

  useEffect(() => {
    if (!activePath || !provider) {
      setBacklinks([]);
      return;
    }

    let isCancelled = false;
    const currentDocTitle = activePath.split('/').pop()?.replace(/\.(md|txt)$/, '') || '';
    const normalizedCurrent = normalizeNoteTitle(currentDocTitle);

    const scanAllNotes = async () => {
      setIsScanning(true);
      const allFiles = useVaultStore.getState().getAllFiles();
      const references: BacklinkReference[] = [];

      for (const file of allFiles) {
        // Skip self-referencing links
        if (file.path === activePath) continue;

        try {
          // Check cache or read
          let content = '';
          const cached = fileCacheRef.current.get(file.path);
          if (cached && Date.now() - cached.updatedAt < 5000) {
            content = cached.content;
          } else {
            content = await provider.readDocument(file.path);
            fileCacheRef.current.set(file.path, { content, updatedAt: Date.now() });
          }

          if (isCancelled) return;

          // Extract links
          const links = extractWikilinks(content);
          for (const link of links) {
            if (normalizeNoteTitle(link.targetTitle) === normalizedCurrent) {
              const snippet = extractContextSnippet(content, link.index, link.raw.length);
              references.push({
                sourcePath: file.path,
                sourceTitle: file.name,
                targetTitle: link.targetTitle,
                snippet
              });
            }
          }
        } catch {
          // File might have been deleted or moved
        }
      }

      if (!isCancelled) {
        setBacklinks(references);
        setIsScanning(false);
      }
    };

    scanAllNotes();

    return () => {
      isCancelled = true;
    };
  }, [activePath, provider, nodes, lastSavedAt]);

  return { backlinks, isScanning };
}
