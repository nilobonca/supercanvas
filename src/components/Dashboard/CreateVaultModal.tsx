import React, { useState, useEffect, useRef } from 'react';
import { X, HardDrive, Database, FolderPlus, RefreshCw, ExternalLink } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { RegisteredVault } from '@/modules/vault/hooks/useVaultRegistry';
import { IDBStorageProvider } from '@/modules/vault/storage/IDBStorageProvider';
import { SafeIcon } from '@/components/common/SafeIcon';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectFSA: () => Promise<boolean | void>;
  onCreateIDB: (vaultId: string, vaultName: string) => Promise<void>;
  onRegisterVault: (vault: RegisteredVault) => void;
}

export const CreateVaultModal: React.FC<CreateVaultModalProps> = ({
  isOpen,
  onClose,
  onConnectFSA,
  onCreateIDB,
  onRegisterVault,
}) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'select' | 'idb-form'>('select');
  const [vaultNameInput, setVaultNameInput] = useState('');
  const [isConnectingFSA, setIsConnectingFSA] = useState(false);
  const [hasNativeFSA, setHasNativeFSA] = useState(false);
  const [isNotLocalhost, setIsNotLocalhost] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode('select');
      setVaultNameInput('');
      if (typeof window !== 'undefined') {
        setHasNativeFSA('showDirectoryPicker' in window);
        setIsNotLocalhost(window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreateIDBSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = vaultNameInput.trim();
    if (!trimmed) return;

    const newId = `vault-${uuidv4().slice(0, 8)}`;
    const newVault: RegisteredVault = {
      id: newId,
      name: trimmed,
      storageType: 'idb',
      updatedAt: Date.now(),
    };

    onRegisterVault(newVault);
    await onCreateIDB(newId, trimmed);
    onClose();
  };

  const handleConnectLocalFolder = async () => {
    if (hasNativeFSA) {
      try {
        setIsConnectingFSA(true);
        const success = await onConnectFSA();
        if (success) {
          onClose();
        }
      } catch (err) {
        console.error('[RPGSA] Erro ao conectar pasta local:', err);
      } finally {
        setIsConnectingFSA(false);
      }
    } else {
      // Fallback universal: Se o navegador não expõe File System Access API nativo
      // (ex: acessando por IP de rede ou browser sem FSA), abre o seletor nativo de pasta
      folderInputRef.current?.click();
    }
  };

  // Processa a seleção de pasta pelo input universal webkitdirectory
  const handleFolderInputFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsConnectingFSA(true);
      const firstPath = files[0].webkitRelativePath || '';
      const folderName = firstPath.split('/')[0] || 'Pasta do Windows';
      const newId = `vault-${uuidv4().slice(0, 8)}`;

      const newVault: RegisteredVault = {
        id: newId,
        name: folderName,
        storageType: 'idb',
        folderName: folderName,
        updatedAt: Date.now(),
      };

      onRegisterVault(newVault);
      await onCreateIDB(newId, folderName);

      const idb = new IDBStorageProvider(newId, folderName);
      await idb.init();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.name.endsWith('.md')) {
          const relativePath = file.webkitRelativePath.split('/').slice(1).join('/') || file.name;
          const text = await file.text();
          await idb.saveDocument(relativePath, text);
        }
      }

      onClose();
    } catch (err) {
      console.error('[RPGSA] Erro ao importar pasta do computador:', err);
    } finally {
      setIsConnectingFSA(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#17192A] border border-black/10 dark:border-[#7F95FF]/20 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col gap-5 text-stone-900 dark:text-[#F4F0E6] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input oculto para fallback universal de seleção de pasta no Windows */}
        <input
          ref={folderInputRef}
          type="file"
          // @ts-expect-error webkitdirectory e directory são atributos não padrão suportados por todos os navegadores
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFolderInputFiles}
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1831D7]/20 text-[#1831D7] dark:bg-[#7F95FF]/20 dark:text-[#7F95FF] flex items-center justify-center">
              <SafeIcon size={20} className="text-[#1831D7] dark:text-[#7F95FF]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                {mode === 'select' ? 'Adicionar ou Criar Vault' : 'Novo Vault IndexedDB'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-[#B4D3F1]/80">
                {mode === 'select' ? 'Escolha o tipo de base de conhecimento' : 'Digite o nome do seu novo vault isolado'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-stone-400 hover:text-stone-800 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Banner de Dica quando acessando via IP */}
        {!hasNativeFSA && isNotLocalhost && mode === 'select' && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
            <div>
              <span className="font-bold block">💡 Dica para acesso direto ao HD:</span>
              <span className="opacity-90">O Chrome exige o endereço localhost para sincronização contínua de pastas.</span>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = `http://localhost:${window.location.port || 3000}`;
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>Abrir no Localhost</span>
              <ExternalLink size={12} />
            </button>
          </div>
        )}

        {/* Body: Select Mode */}
        {mode === 'select' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option 1: Pasta do Windows */}
            <div
              onClick={handleConnectLocalFolder}
              className="p-5 rounded-2xl bg-stone-50/80 hover:bg-[#52B1FF]/10 dark:bg-white/5 dark:hover:bg-[#52B1FF]/10 border border-stone-200/80 hover:border-[#52B1FF]/60 dark:border-white/10 dark:hover:border-[#52B1FF]/50 cursor-pointer transition-all flex flex-col gap-3 group shadow-xs hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-[#52B1FF]/15 text-[#52B1FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                {isConnectingFSA ? (
                  <RefreshCw size={22} className="animate-spin text-[#52B1FF]" />
                ) : (
                  <HardDrive size={22} />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold group-hover:text-[#52B1FF] transition-colors">
                  Pasta do Windows (HD)
                </h4>
                <p className="text-xs text-stone-500 dark:text-[#B4D3F1]/80 leading-relaxed mt-1">
                  Vincule uma pasta local do computador com sincronização direta de arquivos Markdown (.md).
                </p>
              </div>
              <span className="mt-auto text-[11px] font-semibold text-[#52B1FF] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                {isConnectingFSA ? 'Processando pasta...' : 'Selecionar pasta →'}
              </span>
            </div>

            {/* Option 2: IndexedDB Vault */}
            <div
              onClick={() => setMode('idb-form')}
              className="p-5 rounded-2xl bg-stone-50/80 hover:bg-[#1831D7]/10 dark:bg-white/5 dark:hover:bg-[#7F95FF]/10 border border-stone-200/80 hover:border-[#1831D7]/50 dark:border-white/10 dark:hover:border-[#7F95FF]/50 cursor-pointer transition-all flex flex-col gap-3 group shadow-xs hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-[#1831D7]/20 text-[#1831D7] dark:bg-[#7F95FF]/20 dark:text-[#7F95FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Database size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold group-hover:text-[#1831D7] dark:group-hover:text-[#7F95FF] transition-colors">
                  Vault no Navegador
                </h4>
                <p className="text-xs text-stone-500 dark:text-[#B4D3F1]/80 leading-relaxed mt-1">
                  Crie uma base de dados interna no IndexedDB, com isolamento para campanhas e notas.
                </p>
              </div>
              <span className="mt-auto text-[11px] font-semibold text-[#1831D7] dark:text-[#7F95FF] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Criar banco &rarr;
              </span>
            </div>
          </div>
        )}

        {/* Body: IDB Form Mode */}
        {mode === 'idb-form' && (
          <form onSubmit={handleCreateIDBSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-600 dark:text-neutral-300 block mb-1.5">
                Nome do Vault / Campanha
              </label>
              <input
                type="text"
                placeholder="Ex: Campanha Maldita de Baróvia..."
                value={vaultNameInput}
                onChange={(e) => setVaultNameInput(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#131524] border border-black/10 dark:border-[#7F95FF]/20 text-sm outline-none focus:border-[#7F95FF]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-semibold text-stone-700 dark:text-neutral-200 transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={!vaultNameInput.trim()}
                className="px-5 py-2 rounded-xl bg-[#1831D7] hover:bg-[#1831D7]/90 disabled:opacity-50 text-xs font-semibold text-[#F4F0E6] transition-colors shadow-sm"
              >
                Criar e Ativar Vault
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
