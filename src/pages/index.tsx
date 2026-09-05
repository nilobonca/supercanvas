import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useIDB } from '@/utils/indexedDB';
import { Layer } from '@/interfaces/utils/indexedDB';
import { useThemeStore } from '@/store/themeStore';
import { useVaultStore } from '@/modules/vault/hooks/useVaultStore';
import { useVaultRegistry, RegisteredVault } from '@/modules/vault/hooks/useVaultRegistry';
import { useVaultRealGraphData } from '@/modules/vault/hooks/useVaultRealGraphData';
import { 
  DashboardSidebarRibbon, 
  DashboardTab 
} from '@/components/Dashboard/DashboardSidebarRibbon';
import { DashboardAdaptivePanel } from '@/components/Dashboard/DashboardAdaptivePanel';
import { AmbientGraphBackdrop } from '@/components/Dashboard/AmbientGraphBackdrop';
import { CreateVaultModal } from '@/components/Dashboard/CreateVaultModal';
import { CanvasCreateModal } from '@/components/Dashboard/CanvasCreateModal';
import { VaultSettingsModal } from '@/modules/vault/components/VaultSettingsModal';
import { ExportModal } from '@/components/ExportModal';
import { ImportConflictModal } from '@/components/ImportConflictModal';
import { parseBackupFile, ParsedImportData } from '@/utils/exportSystem/importUtils';
import { isElectron, setWindowMode } from '@/utils/electronHelper';
import { Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';

export default function Dashboard() {
  const router = useRouter();
  const { activeLayers, addLayer, updateLayer, deleteLayer } = useIDB();

  // Vault Store & Registry
  const { 
    initializeStorage, 
    setSettingsOpen, 
    refreshNodes 
  } = useVaultStore();

  const {
    vaults,
    activeVault,
    activeVaultId,
    registerVault,
    removeVault,
    switchVault,
    renameVault,
    connectFSA,
    connectIDB,
  } = useVaultRegistry();

  // Active Dashboard Tab (Default: 'active-vault')
  const [activeTab, setActiveTab] = useState<DashboardTab>('active-vault');

  // Initialize vault storage on mount
  useEffect(() => {
    initializeStorage();
  }, [initializeStorage]);

  // Projects & Canvases State
  const [projects, setProjects] = useState<Layer[]>([]);
  const [projectPageCounts, setProjectPageCounts] = useState<Record<string, number>>({});

  // Real Vault Graph & Connections Data (Real files, wikilinks, and canvases)
  const {
    nodes: realGraphNodes,
    links: realGraphLinks,
    featuredCards: realFeaturedCards,
    isLoading: isGraphLoading,
  } = useVaultRealGraphData(activeVault, projects);

  // Modals State
  const [isCreateVaultModalOpen, setIsCreateVaultModalOpen] = useState(false);
  const [isCreateCanvasModalOpen, setIsCreateCanvasModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [parsedImportData, setParsedImportData] = useState<ParsedImportData | null>(null);
  const [isConnectingFSA, setIsConnectingFSA] = useState(false);

  // Delete canvas modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    canvas: Layer | null;
  }>({ isOpen: false, canvas: null });

  // Escape key handler for delete modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteModal.isOpen) setDeleteModal({ isOpen: false, canvas: null });
        if (isCreateVaultModalOpen) setIsCreateVaultModalOpen(false);
        if (isCreateCanvasModalOpen) setIsCreateCanvasModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteModal.isOpen, isCreateVaultModalOpen, isCreateCanvasModalOpen]);

  // Sync projects and compute page counts
  useEffect(() => {
    const pMap = new Map<string, Layer>();
    const pGroups = new Map<string, Layer[]>();

    let migrationNeeded = false;
    const actionsToPerform: (() => void)[] = [];

    activeLayers.forEach(l => {
      if (l.isProjectMetadata) {
        pMap.set(l.id, l);
      } else if (l.isProject) {
        const pid = l.projectId || l.id;
        if (!pGroups.has(pid)) pGroups.set(pid, []);
        pGroups.get(pid)?.push(l);
      }
    });

    // Check for orphaned groups (legacy migration)
    pGroups.forEach((pages, pid) => {
      if (!pMap.has(pid)) {
        const firstPage = pages[0];
        const metaLayer: Layer = {
          id: pid,
          type: 'group',
          name: firstPage.name,
          visible: true,
          locked: false,
          parentId: null,
          depth: 0,
          isProject: false,
          isProjectMetadata: true,
          projectId: pid,
          order: 0,
        };
        pMap.set(pid, metaLayer);
        actionsToPerform.push(() => addLayer(metaLayer));
        migrationNeeded = true;
      }
    });

    // Compute page counts
    const counts: Record<string, number> = {};
    pGroups.forEach((pages, pid) => {
      counts[pid] = pages.length;
    });
    setProjectPageCounts(counts);

    setProjects(Array.from(pMap.values()));

    if (migrationNeeded && actionsToPerform.length > 0) {
      actionsToPerform.forEach(action => action());
    }
  }, [activeLayers, addLayer]);

  // Navigate to Canvas
  const handleOpenCanvas = (canvas: Layer) => {
    if (isElectron()) {
      setWindowMode('workspace');
    }
    if (canvas.canvasType === 'board') {
      router.push(`/board/${canvas.id}`);
    } else {
      router.push(`/project/${canvas.id}`);
    }
  };

  // Create new canvas with assigned vault
  const handleCreateCanvas = (
    canvasType: 'audio' | 'board',
    targetVaultId: string | null = null,
    targetVaultName: string | null = null
  ) => {
    const prefix = canvasType === 'board' ? 'Quadro de Conexões' : 'Projeto de Áudio';
    let newName = `${prefix} 1`;
    let counter = 1;
    const existingNames = new Set(projects.map(p => p.name.trim()));

    while (existingNames.has(`${prefix} ${counter}`)) {
      counter++;
    }
    newName = `${prefix} ${counter}`;

    const newProjectId = uuidv4();

    const projectMeta: Layer = {
      id: newProjectId,
      type: 'group',
      name: newName,
      visible: true,
      locked: false,
      parentId: null,
      depth: 0,
      isProject: false,
      isProjectMetadata: true,
      projectId: newProjectId,
      order: 0,
      canvasType,
      vaultId: targetVaultId,
      vaultName: targetVaultName,
      folderPath: null,
    };
    addLayer(projectMeta);

    if (isElectron()) {
      setWindowMode('workspace');
    }

    if (canvasType === 'audio') {
      const newPage: Layer = {
        id: uuidv4(),
        type: 'group',
        name: 'Página 1',
        visible: true,
        locked: false,
        parentId: null,
        depth: 0,
        isProject: true,
        projectId: newProjectId,
        order: 0,
      };
      addLayer(newPage);
      router.push(`/project/${newProjectId}`);
    } else {
      router.push(`/board/${newProjectId}`);
    }
  };

  // Canvas Delete flow
  const handleDeleteConfirm = () => {
    const canvas = deleteModal.canvas;
    if (!canvas) return;

    deleteLayer(canvas.id);
    const pages = activeLayers.filter(l => l.projectId === canvas.id || (l.projectId === undefined && l.id === canvas.id));
    pages.forEach(p => deleteLayer(p.id));
    setDeleteModal({ isOpen: false, canvas: null });
  };

  // FSA Connection trigger
  const handleTriggerConnectFSA = async () => {
    try {
      setIsConnectingFSA(true);
      const success = await connectFSA();
      if (success) {
        await refreshNodes();
      }
    } finally {
      setIsConnectingFSA(false);
    }
  };

  // Theme Management
  const { setIsSettingsOpen, theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme : 'dark';
  const isLight = currentTheme === 'light';
  const isEthereal = currentTheme === 'ethereal';

  return (
    <>
      <Head>
        <title>RPGSA — Central de Vaults & Canvas</title>
        <meta name="description" content="Editor Markdown, base de conhecimento integrada e quadros de conexões do RPGSA." />
      </Head>

      <div className={clsx(
        "w-full h-full overflow-hidden flex flex-row select-none transition-colors duration-200 relative",
        isEthereal 
          ? "bg-[#08070D] text-white" 
          : isLight 
            ? "bg-[#FAF9F6] text-[#1C1917]" 
            : "bg-[#0A0A0E] text-[#F4F4F6]"
      )}>
        {/* ============================================================
            1. MENU LATERAL DE ÍCONES (RIBBON ~58px)
            ============================================================ */}
        <DashboardSidebarRibbon
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={currentTheme}
          onToggleTheme={toggleTheme}
        />

        {/* ============================================================
            2. JANELA LATERAL ADAPTATIVA (~370px)
            ============================================================ */}
        <DashboardAdaptivePanel
          activeTab={activeTab}
          activeVault={activeVault}
          vaults={vaults}
          onRenameVault={renameVault}
          onSwitchVault={(targetVault: RegisteredVault, forcePicker?: boolean) => switchVault(targetVault, forcePicker)}
          onConnectFSA={handleTriggerConnectFSA}
          onCreateVault={() => setIsCreateVaultModalOpen(true)}
          onRemoveVault={removeVault}
          onOpenSettings={() => setSettingsOpen(true)}
          onExportBackup={() => setIsExportModalOpen(true)}
          onImportBackup={async (file: File) => {
            try {
              const parsed = await parseBackupFile(file);
              setParsedImportData(parsed);
              setIsImportModalOpen(true);
            } catch (err) {
              console.error(err);
              alert("Arquivo zip inválido ou corrompido.");
            }
          }}
          isConnectingFSA={isConnectingFSA}
          canvases={projects}
          projectPageCounts={projectPageCounts}
          onCreateCanvas={() => setIsCreateCanvasModalOpen(true)}
          onOpenCanvas={handleOpenCanvas}
          onDeleteCanvas={(canvas) => setDeleteModal({ isOpen: true, canvas })}
          onUpdateCanvas={updateLayer}
          theme={currentTheme}
        />

        {/* ============================================================
            3. ÁREA PRINCIPAL: GRAFO DE CONEXÕES AMBIENTE (WEB VIEWPORT)
            ============================================================ */}
        <main className="flex-1 h-full relative overflow-hidden hidden md:block">
          <AmbientGraphBackdrop
            vaultName={activeVault.name}
            realNodes={realGraphNodes}
            realLinks={realGraphLinks}
            featuredCards={realFeaturedCards}
            isLoading={isGraphLoading}
            onSelectNode={(pathOrTitle, isCanvas) => {
              if (isElectron()) {
                setWindowMode('workspace');
              }
              if (isCanvas) {
                const found = projects.find(p => p.id === pathOrTitle || p.name === pathOrTitle);
                if (found) {
                  handleOpenCanvas(found);
                  return;
                }
              }
              router.push(`/vault?doc=${encodeURIComponent(pathOrTitle)}`);
            }}
          />
        </main>
      </div>

      {/* ============================================================
          MODALS DE APOIO
          ============================================================ */}
      <CreateVaultModal
        isOpen={isCreateVaultModalOpen}
        onClose={() => setIsCreateVaultModalOpen(false)}
        onConnectFSA={handleTriggerConnectFSA}
        onCreateIDB={connectIDB}
        onRegisterVault={registerVault}
      />

      <CanvasCreateModal
        isOpen={isCreateCanvasModalOpen}
        onClose={() => setIsCreateCanvasModalOpen(false)}
        vaults={vaults}
        activeVaultId={activeVaultId}
        onCreate={handleCreateCanvas}
      />

      {/* Modal de Exclusão de Canvas */}
      {deleteModal.isOpen && deleteModal.canvas && (
        <div
          className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setDeleteModal({ isOpen: false, canvas: null })}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#16161D] border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col gap-4 text-stone-900 dark:text-white animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center">
              <h4 className="text-base font-bold">Excluir Canvas?</h4>
              <p className="text-xs text-stone-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                Você está prestes a excluir <span className="font-bold text-stone-800 dark:text-stone-200">&ldquo;{deleteModal.canvas.name}&rdquo;</span>.
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => setDeleteModal({ isOpen: false, canvas: null })}
                className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-semibold text-stone-700 dark:text-neutral-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors shadow-sm cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configurações do Vault */}
      <VaultSettingsModal />

      {/* Modais de Backup / Importação */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeLayers={activeLayers}
        currentProjectId={null}
      />

      <ImportConflictModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        parsedData={parsedImportData}
        onSuccess={() => {
          setIsImportModalOpen(false);
          alert('Importação concluída com sucesso! Recarregando a página.');
          window.location.reload();
        }}
      />
    </>
  );
}
