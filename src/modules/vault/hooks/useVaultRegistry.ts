import { useState, useEffect, useCallback, useMemo } from 'react';
import { useVaultStore } from './useVaultStore';
import { useIDB } from '@/utils/indexedDB';

export interface RegisteredVault {
  id: string;
  name: string;
  storageType: 'fsa' | 'idb';
  folderName?: string;
  path?: string;
  updatedAt: number;
  documentCount?: number;
  canvasCount?: number;
  isDefault?: boolean;
}

const VAULT_REGISTRY_KEY = 'rpgsa_registered_vaults';

const DEFAULT_VAULT: RegisteredVault = {
  id: 'default-vault',
  name: 'Meu Vault Local',
  storageType: 'idb',
  updatedAt: Date.now(),
  isDefault: true,
};

export function useVaultRegistry() {
  const { 
    vaultId: currentVaultId, 
    vaultName: currentVaultName, 
    storageType: currentStorageType, 
    isConnected, 
    connectIDB, 
    connectFSA, 
    setVaultName,
    getAllFiles,
  } = useVaultStore();

  const { activeLayers } = useIDB();

  const [storedVaults, setStoredVaults] = useState<RegisteredVault[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar lista de vaults salvos do localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(VAULT_REGISTRY_KEY);
      if (raw) {
        const parsed: RegisteredVault[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStoredVaults(parsed);
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.error('Erro ao ler registro de vaults do localStorage:', e);
    }

    // Default fallback
    setStoredVaults([DEFAULT_VAULT]);
    setIsLoaded(true);
  }, []);

  // Salvar alterações no localStorage
  const saveVaultsToStorage = useCallback((vaults: RegisteredVault[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(VAULT_REGISTRY_KEY, JSON.stringify(vaults));
    } catch (e) {
      console.error('Erro ao salvar vaults no localStorage:', e);
    }
  }, []);

  // Sincronizar o vault atualmente conectado com a lista registrada
  useEffect(() => {
    if (!isLoaded || !currentVaultId) return;

    setStoredVaults(prev => {
      const index = prev.findIndex(v => v.id === currentVaultId);
      const updatedVault: RegisteredVault = {
        id: currentVaultId,
        name: currentVaultName || (currentStorageType === 'fsa' ? 'Pasta Windows (HD)' : 'Meu Vault'),
        storageType: currentStorageType,
        updatedAt: Date.now(),
        isDefault: currentVaultId === 'default-vault',
      };

      let next: RegisteredVault[];
      if (index >= 0) {
        next = [...prev];
        next[index] = { ...prev[index], ...updatedVault };
      } else {
        next = [updatedVault, ...prev];
      }

      saveVaultsToStorage(next);
      return next;
    });
  }, [currentVaultId, currentVaultName, currentStorageType, isLoaded, saveVaultsToStorage]);

  // Contagem de canvases por vault
  const allCanvases = useMemo(() => {
    return activeLayers.filter(l => l.isProjectMetadata);
  }, [activeLayers]);

  // Enriquecer vaults com estatísticas em tempo real
  const vaults = useMemo(() => {
    return storedVaults.map(vault => {
      const isCurrent = vault.id === currentVaultId;
      // Contar canvases que pertencem a este vault
      const linkedCanvases = allCanvases.filter(c => {
        if (c.vaultId) {
          return c.vaultId === vault.id;
        }
        // Se não tiver vaultId e este for o default, associa como fallback
        return vault.isDefault;
      });

      return {
        ...vault,
        canvasCount: linkedCanvases.length,
        documentCount: isCurrent ? getAllFiles().length : vault.documentCount || 0,
      };
    });
  }, [storedVaults, currentVaultId, allCanvases, getAllFiles]);

  const activeVault = useMemo(() => {
    return vaults.find(v => v.id === currentVaultId) || {
      id: currentVaultId || 'default-vault',
      name: currentVaultName || 'Meu Vault Local',
      storageType: currentStorageType,
      updatedAt: Date.now(),
      canvasCount: allCanvases.filter(c => !c.vaultId || c.vaultId === currentVaultId).length,
      documentCount: getAllFiles().length,
      isDefault: currentVaultId === 'default-vault',
    };
  }, [vaults, currentVaultId, currentVaultName, currentStorageType, allCanvases, getAllFiles]);

  // Adicionar novo vault ao registro
  const registerVault = useCallback((newVault: RegisteredVault) => {
    setStoredVaults(prev => {
      const exists = prev.some(v => v.id === newVault.id);
      const next = exists
        ? prev.map(v => v.id === newVault.id ? { ...v, ...newVault } : v)
        : [newVault, ...prev];
      saveVaultsToStorage(next);
      return next;
    });
  }, [saveVaultsToStorage]);

  // Remover vault do registro
  const removeVault = useCallback((vaultId: string) => {
    if (vaultId === currentVaultId) {
      alert('Não é possível remover o vault que está atualmente ativo.');
      return;
    }
    setStoredVaults(prev => {
      const next = prev.filter(v => v.id !== vaultId);
      saveVaultsToStorage(next);
      return next;
    });
  }, [currentVaultId, saveVaultsToStorage]);

  // Alternar para outro vault
  const switchVault = useCallback(async (targetVault: RegisteredVault, forcePicker = false): Promise<boolean> => {
    if (targetVault.id === currentVaultId) return true;

    if (targetVault.storageType === 'fsa') {
      const success = await connectFSA(forcePicker);
      return Boolean(success);
    } else {
      await connectIDB(targetVault.id, targetVault.name);
      return true;
    }
  }, [currentVaultId, connectFSA, connectIDB]);

  // Renomear vault
  const renameVault = useCallback(async (vaultId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    if (vaultId === currentVaultId) {
      await setVaultName(trimmed);
    }

    setStoredVaults(prev => {
      const next = prev.map(v => v.id === vaultId ? { ...v, name: trimmed, updatedAt: Date.now() } : v);
      saveVaultsToStorage(next);
      return next;
    });
  }, [currentVaultId, setVaultName, saveVaultsToStorage]);

  return {
    vaults,
    activeVault,
    activeVaultId: currentVaultId,
    allCanvases,
    registerVault,
    removeVault,
    switchVault,
    renameVault,
    connectFSA,
    connectIDB,
    isConnected,
  };
}
