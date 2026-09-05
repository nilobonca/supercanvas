import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useVaultStore, FlatNoteItem } from './useVaultStore';
import { RegisteredVault } from './useVaultRegistry';
import { Layer } from '@/interfaces/utils/indexedDB';
import { extractWikilinks, extractTags, normalizeNoteTitle, ExtractedLink } from '../utils/wikilinkUtils';
import { parseFrontmatter } from '../utils/frontmatterUtils';

/**
 * Nó do grafo visual do Vault
 */
export interface VaultGraphNode {
  id: string;
  title: string;
  path: string;
  folder: string;
  isCanvas: boolean;
  canvasType?: 'audio' | 'board';
  connectionsCount: number;
  tags: string[];
  excerpt: string;
  accentColor: string;
}

/**
 * Conexão direcionada ou bidirecional entre dois nós do grafo
 */
export interface VaultGraphLink {
  sourceId: string;
  targetId: string;
}

/**
 * Estrutura de dados consumida pelos FloatingLoreCards flutuantes
 */
export interface FeaturedLoreCardData {
  id: string;
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
  connectionsCount: number;
  accentColor: string;
  defaultPosition: { x: number; y: number };
  targetPath?: string;
  isCanvas?: boolean;
}

/**
 * Retorno completo do hook useVaultRealGraphData
 */
export interface VaultRealGraphData {
  nodes: VaultGraphNode[];
  links: VaultGraphLink[];
  featuredCards: FeaturedLoreCardData[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

// Paleta harmônica de cores estelares para o grafo
const THEME_PALETTE = [
  '#c084fc', // Lilás / Arcano
  '#38bdf8', // Ciano / Local / Áudio
  '#f87171', // Coral / Perigo / Monstro
  '#fbbf24', // Âmbar / Tesouro / Item
  '#34d399', // Esmeralda / Natureza
  '#818cf8', // Índigo / Sessão / Diário
  '#f472b6', // Rosa / Pessoal
  '#22d3ee', // Celeste / Elementar
  '#fb923c', // Laranja / NPCs
  '#a78bfa', // Violeta / Místico
];

// Posições padrão dos cards em destaque
const DEFAULT_CARD_POSITIONS: { x: number; y: number }[] = [
  { x: 36, y: 72 },
  { x: 260, y: 260 },
  { x: 50, y: 460 },
];

/**
 * Extrai resumo limpo do texto Markdown:
 * Ignora frontmatter YAML, cabeçalhos (#), blocos de código e sintetiza o primeiro parágrafo
 */
function extractCleanExcerpt(rawMarkdown: string, folder: string, title: string): string {
  if (!rawMarkdown || typeof rawMarkdown !== 'string') {
    return `Anotação de lore no diretório ${folder || 'raiz'} do vault.`;
  }

  // 1. Remove YAML frontmatter
  const { content: bodyContent } = parseFrontmatter(rawMarkdown);

  // 2. Remove blocos de código cercados por ```
  const withoutCodeBlocks = bodyContent.replace(/```[\s\S]*?```/g, ' ');

  // 3. Divide em parágrafos separados por linhas em branco
  const paragraphs = withoutCodeBlocks.split(/\r?\n\s*\r?\n/);

  for (const paragraph of paragraphs) {
    const lines = paragraph
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Ignora parágrafos que são puramente títulos (#), separadores (---) ou tabelas
    const nonHeaderLines = lines.filter(line => (
      !line.startsWith('#') &&
      !line.startsWith('---') &&
      !line.startsWith('===') &&
      !line.startsWith('|') &&
      !line.startsWith('![')
    ));

    if (nonHeaderLines.length === 0) continue;

    let candidate = nonHeaderLines.join(' ');

    // Limpa sintaxe de wikilinks [[Destino|Alias]] -> Alias e [[Destino]] -> Destino
    candidate = candidate.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2');
    candidate = candidate.replace(/\[\[([^\]]+)\]\]/g, '$1');

    // Limpa links Markdown [Texto](url) -> Texto
    candidate = candidate.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Limpa formatação Markdown básica (negrito, itálico, código inline, listas, citações)
    candidate = candidate
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^>\s*/g, '')
      .replace(/^[-*+]\s+/g, '')
      .replace(/^\d+\.\s+/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (candidate.length >= 12) {
      if (candidate.length > 175) {
        return candidate.slice(0, 172).trim() + '...';
      }
      return candidate;
    }
  }

  return `Documento sobre ${title} organizado na pasta ${folder || 'principal'}.`;
}

/**
 * Determina uma cor de destaque consistente para o nó baseando-se em tags, pasta ou título
 */
function deriveAccentColor(
  title: string,
  folder: string,
  tags: string[],
  frontmatterColor?: string
): string {
  if (frontmatterColor && /^#([0-9a-fA-F]{3}){1,2}$/.test(frontmatterColor)) {
    return frontmatterColor;
  }

  const normalizedTags = tags.map(t => t.toLowerCase().replace(/^#/, ''));
  const folderLower = (folder || '').toLowerCase();

  // 1. Prioridade para tags temáticas de RPG
  if (normalizedTags.some(t => ['antagonista', 'inimigo', 'vilao', 'boss', 'monstro', 'perigo', 'combate'].includes(t))) {
    return '#f87171'; // Coral / Perigo
  }
  if (normalizedTags.some(t => ['npc', 'personagem', 'aliado', 'heroi', 'comerciante', 'povo'].includes(t))) {
    return '#fb923c'; // Laranja quente
  }
  if (normalizedTags.some(t => ['local', 'cidade', 'vila', 'reino', 'mapa', 'taverna', 'castelo', 'fortaleza', 'cenario'].includes(t))) {
    return '#38bdf8'; // Ciano / Azul
  }
  if (normalizedTags.some(t => ['item', 'artefato', 'arma', 'armadura', 'tesouro', 'reliquia', 'loot'].includes(t))) {
    return '#fbbf24'; // Âmbar / Dourado
  }
  if (normalizedTags.some(t => ['lore', 'historia', 'faccao', 'cla', 'origem', 'religiao', 'divindade', 'seita'].includes(t))) {
    return '#c084fc'; // Lilás
  }
  if (normalizedTags.some(t => ['magia', 'feitico', 'ritual', 'arcano', 'necromancia'].includes(t))) {
    return '#a855f7'; // Violeta
  }
  if (normalizedTags.some(t => ['sessao', 'diario', 'registro', 'campanha', 'resumo'].includes(t))) {
    return '#818cf8'; // Índigo
  }
  if (normalizedTags.some(t => ['natureza', 'floresta', 'pantano', 'montanha', 'bioma'].includes(t))) {
    return '#34d399'; // Esmeralda
  }
  if (normalizedTags.some(t => ['audio', 'som', 'trilha', 'musica', 'efeito'].includes(t))) {
    return '#22d3ee'; // Celeste
  }

  // 2. Mapeamento por palavras-chave na pasta
  if (folderLower.includes('npc') || folderLower.includes('personagen')) return '#fb923c';
  if (folderLower.includes('local') || folderLower.includes('cenario') || folderLower.includes('mapa')) return '#38bdf8';
  if (folderLower.includes('item') || folderLower.includes('artefato') || folderLower.includes('equip')) return '#fbbf24';
  if (folderLower.includes('lore') || folderLower.includes('historia') || folderLower.includes('faccao')) return '#c084fc';
  if (folderLower.includes('magia') || folderLower.includes('feitico')) return '#a855f7';
  if (folderLower.includes('sessao') || folderLower.includes('diario') || folderLower.includes('log')) return '#818cf8';
  if (folderLower.includes('audio') || folderLower.includes('som')) return '#22d3ee';

  // 3. Hashing determinístico como fallback
  const seedString = folder ? folder.toLowerCase() : title.toLowerCase();
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const colorIndex = Math.abs(hash) % THEME_PALETTE.length;
  return THEME_PALETTE[colorIndex];
}

/**
 * Deriva uma categoria amigável para o Lore Card
 */
function deriveCategory(
  folder: string,
  tags: string[],
  frontmatterCategory?: string
): string {
  if (frontmatterCategory && typeof frontmatterCategory === 'string' && frontmatterCategory.trim()) {
    return frontmatterCategory.trim();
  }

  const folderLower = (folder || '').toLowerCase();
  if (folderLower.includes('npc') || folderLower.includes('personagen')) return 'NPC & Personagens';
  if (folderLower.includes('local') || folderLower.includes('cenario') || folderLower.includes('mapa')) return 'Local & Geografia';
  if (folderLower.includes('item') || folderLower.includes('artefato')) return 'Item & Equipamento';
  if (folderLower.includes('lore') || folderLower.includes('historia')) return 'Lore & Crônicas';
  if (folderLower.includes('faccao') || folderLower.includes('cla')) return 'Fações & Alianças';
  if (folderLower.includes('sessao') || folderLower.includes('diario')) return 'Sessões & Diários';
  if (folderLower.includes('magia') || folderLower.includes('grimorio')) return 'Artes Arcanas';

  if (folder && folder.trim()) {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '').split('/').pop() || folder;
    return cleanFolder.charAt(0).toUpperCase() + cleanFolder.slice(1);
  }

  if (tags.length > 0) {
    const cleanTag = tags[0].replace(/^#/, '');
    return cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1);
  }

  return 'Anotação de Lore';
}

interface NoteScanResult {
  file: FlatNoteItem;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
  accentColor: string;
  wikilinks: ExtractedLink[];
}

/**
 * Hook principal que extrai o grafo real e cards em destaque do Vault
 */
export function useVaultRealGraphData(
  activeVault: RegisteredVault | null,
  canvases?: Layer[]
): VaultRealGraphData {
  const getAllFiles = useVaultStore(state => state.getAllFiles);
  const provider = useVaultStore(state => state.provider);
  const storeNodes = useVaultStore(state => state.nodes);
  const documentCache = useVaultStore(state => state.documentCache);
  const lastSavedAt = useVaultStore(state => state.lastSavedAt);

  const [nodes, setNodes] = useState<VaultGraphNode[]>([]);
  const [links, setLinks] = useState<VaultGraphLink[]>([]);
  const [featuredCards, setFeaturedCards] = useState<FeaturedLoreCardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Cache em memória de conteúdo lido para evitar leituras redundantes de disco/IDB
  const memoryDocCacheRef = useRef<Map<string, { content: string; timestamp: number }>>(new Map());

  const refresh = useCallback(async () => {
    // Invalida cache de leituras e força novo escaneamento
    memoryDocCacheRef.current.clear();
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const computeRealGraph = async () => {
      setIsLoading(true);

      try {
        // 1. Extrair todas as notas Markdown reais do Vault (.md)
        const allFiles = getAllFiles();
        const markdownFiles = allFiles.filter(f => {
          const lower = f.path.toLowerCase();
          return lower.endsWith('.md') || f.fileType === 'note' || f.extension === 'md';
        });

        // 2. Se o Vault não tiver notas e nem canvases
        const isVaultEmpty = markdownFiles.length === 0;

        // Se o provider não estiver disponível e não houver arquivos, gerar card acolhedor imediatamente
        if (isVaultEmpty) {
          const emptyWelcomeCard: FeaturedLoreCardData = {
            id: 'card-vault-empty-welcome',
            title: 'Vault Inicializado',
            category: 'Constelação de Lore',
            tags: ['#rpgsa', '#vault', '#lore'],
            excerpt: 'Crie ou importe suas primeiras anotações no editor para ver sua constelação de lore se expandir em tempo real!',
            connectionsCount: 0,
            accentColor: '#c084fc',
            defaultPosition: DEFAULT_CARD_POSITIONS[0],
            targetPath: '',
            isCanvas: false,
          };

          if (!isCancelled) {
            setNodes([]);
            setLinks([]);
            setFeaturedCards([emptyWelcomeCard]);
            setIsLoading(false);
          }
          return;
        }

        // 3. Ler o conteúdo das notas de forma assíncrona com controle de concorrência (batches)
        // Limite seguro de leitura para garantir máxima performance
        const BATCH_SIZE = 8;
        const scannedNotes: NoteScanResult[] = [];
        const filesToProcess = markdownFiles.slice(0, 300); // Limite de salvaguarda

        for (let i = 0; i < filesToProcess.length; i += BATCH_SIZE) {
          if (isCancelled) return;

          const batch = filesToProcess.slice(i, i + BATCH_SIZE);
          const batchResults = await Promise.all(
            batch.map(async (file): Promise<NoteScanResult> => {
              let content = '';

              // Verificar cache Zustand ativo primeiro
              if (documentCache[file.path]?.content !== undefined) {
                content = documentCache[file.path].content;
              } else {
                // Verificar cache local do hook
                const cached = memoryDocCacheRef.current.get(file.path);
                if (cached && Date.now() - cached.timestamp < 15000) {
                  content = cached.content;
                } else if (provider) {
                  try {
                    content = await provider.readDocument(file.path);
                    memoryDocCacheRef.current.set(file.path, {
                      content,
                      timestamp: Date.now(),
                    });
                  } catch (e) {
                    console.warn(`[useVaultRealGraphData] Falha ao ler nota ${file.path}:`, e);
                    content = '';
                  }
                }
              }

              const cleanTitle = file.name.replace(/\.md$/i, '');
              const { data: frontmatter } = parseFrontmatter(content);

              // Extrai wikilinks e tags do corpo
              const wikilinks = extractWikilinks(content);
              const inlineTags = extractTags(content);

              // Normaliza tags combinando frontmatter + tags inline
              const tagsSet = new Set<string>();
              if (Array.isArray(frontmatter?.tags)) {
                frontmatter.tags.forEach((t: unknown) => {
                  if (typeof t === 'string' && t.trim()) {
                    tagsSet.add(t.startsWith('#') ? t.trim() : `#${t.trim()}`);
                  }
                });
              } else if (typeof frontmatter?.tags === 'string') {
                frontmatter.tags.split(',').forEach((t: string) => {
                  if (t.trim()) tagsSet.add(t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`);
                });
              }
              inlineTags.forEach(t => {
                tagsSet.add(t.startsWith('#') ? t : `#${t}`);
              });
              const tags = Array.from(tagsSet);

              // Extrai resumo limpo e dados semânticos
              const excerpt = extractCleanExcerpt(content, file.folder, cleanTitle);
              const accentColor = deriveAccentColor(cleanTitle, file.folder, tags, frontmatter?.accentColor || frontmatter?.color);
              const category = deriveCategory(file.folder, tags, frontmatter?.category || frontmatter?.classe || frontmatter?.type);

              return {
                file,
                title: cleanTitle,
                content,
                excerpt,
                tags,
                category,
                accentColor,
                wikilinks,
              };
            })
          );

          scannedNotes.push(...batchResults);
        }

        if (isCancelled) return;

        // 4. Identificar e incluir Canvases associados a este Vault
        const activeVaultId = activeVault?.id;
        const isDefaultVault = Boolean(activeVault?.isDefault || activeVaultId === 'default-vault');

        const associatedCanvases = (canvases || []).filter(c => {
          const isProjectRoot = c.isProjectMetadata || c.isProject || c.type === 'group' || (!c.parentId && c.canvasType);
          if (!isProjectRoot) return false;

          if (c.vaultId) {
            return c.vaultId === activeVaultId;
          }
          return isDefaultVault;
        });

        // 5. Construir nós das notas
        const noteNodes: VaultGraphNode[] = scannedNotes.map(n => ({
          id: n.file.path,
          title: n.title,
          path: n.file.path,
          folder: n.file.folder || '',
          isCanvas: false,
          connectionsCount: 0, // calculado no grafo de adjacência
          tags: n.tags,
          excerpt: n.excerpt,
          accentColor: n.accentColor,
        }));

        // Construir nós dos canvases
        const canvasNodes: VaultGraphNode[] = associatedCanvases.map(c => {
          const isAudio = c.canvasType === 'audio';
          return {
            id: `canvas-${c.id}`,
            title: c.name,
            path: `canvas://${c.id}`,
            folder: c.folderPath || 'Canvases',
            isCanvas: true,
            canvasType: isAudio ? 'audio' : 'board',
            connectionsCount: 0,
            tags: isAudio ? ['#audio', '#rpg'] : ['#canvas', '#conexoes'],
            excerpt: isAudio
              ? 'Mesa sonora e espacialização de áudio para sessões de RPG.'
              : 'Quadro visual tático para conexões de lore, pistas e documentos.',
            accentColor: isAudio ? '#38bdf8' : '#c084fc',
          };
        });

        const allGraphNodes: VaultGraphNode[] = [...noteNodes, ...canvasNodes];

        // 6. Mapeamento de títulos e caminhos para resolução rápida O(1) de wikilinks
        const titleToIdMap = new Map<string, string>();
        const pathToIdMap = new Map<string, string>();

        for (const note of scannedNotes) {
          const normTitle = normalizeNoteTitle(note.title);
          const normPath = normalizeNoteTitle(note.file.path);
          titleToIdMap.set(normTitle, note.file.path);
          pathToIdMap.set(normPath, note.file.path);
          pathToIdMap.set(note.file.path.toLowerCase(), note.file.path);
        }

        for (const canvas of associatedCanvases) {
          const canvasNodeId = `canvas-${canvas.id}`;
          const normCanvasTitle = normalizeNoteTitle(canvas.name);
          titleToIdMap.set(normCanvasTitle, canvasNodeId);
          pathToIdMap.set(`canvas://${canvas.id}`.toLowerCase(), canvasNodeId);
          pathToIdMap.set(canvas.id.toLowerCase(), canvasNodeId);
        }

        // 7. Construir realLinks e calcular conexões reais
        const realLinks: VaultGraphLink[] = [];
        const linkKeySet = new Set<string>();
        const adjacencyMap = new Map<string, Set<string>>();

        allGraphNodes.forEach(node => {
          adjacencyMap.set(node.id, new Set<string>());
        });

        for (const note of scannedNotes) {
          const sourceId = note.file.path;

          for (const link of note.wikilinks) {
            const targetQuery = normalizeNoteTitle(link.targetTitle);
            const targetId = titleToIdMap.get(targetQuery) || pathToIdMap.get(targetQuery);

            if (targetId && targetId !== sourceId) {
              const linkKey = `${sourceId}->${targetId}`;
              if (!linkKeySet.has(linkKey)) {
                linkKeySet.add(linkKey);
                realLinks.push({ sourceId, targetId });

                adjacencyMap.get(sourceId)?.add(targetId);
                adjacencyMap.get(targetId)?.add(sourceId);
              }
            }
          }

          // Verificar também se o conteúdo cita nominalmente algum canvas
          for (const canvas of associatedCanvases) {
            const canvasNodeId = `canvas-${canvas.id}`;
            const normCanvasTitle = normalizeNoteTitle(canvas.name);
            const citesCanvas = note.wikilinks.some(wl => normalizeNoteTitle(wl.targetTitle) === normCanvasTitle);

            if (citesCanvas && canvasNodeId !== sourceId) {
              const linkKey = `${sourceId}->${canvasNodeId}`;
              if (!linkKeySet.has(linkKey)) {
                linkKeySet.add(linkKey);
                realLinks.push({ sourceId, targetId: canvasNodeId });

                adjacencyMap.get(sourceId)?.add(canvasNodeId);
                adjacencyMap.get(canvasNodeId)?.add(sourceId);
              }
            }
          }
        }

        // Atribui connectionsCount real a todos os nós
        const realNodes: VaultGraphNode[] = allGraphNodes.map(node => ({
          ...node,
          connectionsCount: adjacencyMap.get(node.id)?.size || 0,
        }));

        // 8. Computar featuredCards:
        // Selecionar até 3 notas com maior número de conexões
        const sortedNotes = [...scannedNotes].sort((a, b) => {
          const connA = adjacencyMap.get(a.file.path)?.size || 0;
          const connB = adjacencyMap.get(b.file.path)?.size || 0;
          if (connB !== connA) return connB - connA;
          // Desempate por completude do resumo
          return b.excerpt.length - a.excerpt.length;
        });

        const topNotes = sortedNotes.slice(0, 3);
        let featuredCardsData: FeaturedLoreCardData[] = [];

        if (topNotes.length === 0) {
          featuredCardsData = [
            {
              id: 'card-vault-empty-welcome',
              title: 'Vault Inicializado',
              category: 'Constelação de Lore',
              tags: ['#rpgsa', '#vault', '#lore'],
              excerpt: 'Crie ou importe suas primeiras anotações no editor para ver sua constelação de lore se expandir em tempo real!',
              connectionsCount: 0,
              accentColor: '#c084fc',
              defaultPosition: DEFAULT_CARD_POSITIONS[0],
              targetPath: '',
              isCanvas: false,
            },
          ];
        } else {
          featuredCardsData = topNotes.map((item, idx) => {
            const connectionsCount = adjacencyMap.get(item.file.path)?.size || 0;
            const position = DEFAULT_CARD_POSITIONS[idx] || {
              x: 36 + idx * 80,
              y: 72 + idx * 190,
            };

            return {
              id: `card-${idx}-${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              title: item.title,
              category: item.category,
              tags: item.tags.length > 0 ? item.tags.slice(0, 3) : ['#lore', '#vault'],
              excerpt: item.excerpt,
              connectionsCount,
              accentColor: item.accentColor,
              defaultPosition: position,
              targetPath: item.file.path,
              isCanvas: false,
            };
          });
        }

        if (!isCancelled) {
          setNodes(realNodes);
          setLinks(realLinks);
          setFeaturedCards(featuredCardsData);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[useVaultRealGraphData] Erro ao extrair grafo do Vault:', err);
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    // Debounce leve para estabilização de requisições concorrentes e transições de vault
    const timeoutId = setTimeout(() => {
      computeRealGraph();
    }, 120);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    activeVault?.id,
    activeVault?.storageType,
    activeVault?.updatedAt,
    activeVault?.isDefault,
    canvases,
    provider,
    storeNodes,
    lastSavedAt,
    getAllFiles,
    documentCache,
    refreshTrigger,
  ]);

  return useMemo(() => ({
    nodes,
    links,
    featuredCards,
    isLoading,
    refresh,
  }), [nodes, links, featuredCards, isLoading, refresh]);
}
