import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  useAmbientGraphSimulation,
  RealGraphNodeItem,
  RealGraphLinkItem,
} from './useAmbientGraphSimulation';
import { FloatingLoreCard } from './FloatingLoreCard';
import { RotateCcw, Eye, EyeOff, Compass, Loader2 } from 'lucide-react';
import { WindowControls } from '@/components/common/WindowControls';
import { isElectron } from '@/utils/electronHelper';
import clsx from 'clsx';

export type { RealGraphNodeItem, RealGraphLinkItem };

export interface RealFeaturedCardItem {
  id: string;
  title: string;
  category?: string;
  tags?: string[];
  excerpt?: string;
  connectionsCount?: number;
  accentColor?: string;
  defaultPosition?: { x: number; y: number };
  path?: string;
  isCanvas?: boolean;
}

export interface AmbientGraphBackdropProps {
  className?: string;
  vaultName?: string;
  customNodeTitles?: string[];
  realNodes?: RealGraphNodeItem[];
  realLinks?: RealGraphLinkItem[];
  featuredCards?: RealFeaturedCardItem[];
  isLoading?: boolean;
  onSelectNode?: (pathOrTitle: string, isCanvas?: boolean) => void;
  defaultShowCards?: boolean;
}

const DEFAULT_FEATURED_CARDS: RealFeaturedCardItem[] = [
  {
    id: 'card-ravenloft',
    title: 'Castelo Ravenloft',
    category: 'Fortaleza Ancestral',
    tags: ['#fortaleza', '#catacumbas', '#perigo'],
    excerpt: 'Erguendo-se sobre um pináculo rochoso de trezentos metros, as torres ancestrais guardam os segredos e as dores da linhagem Zarovich.',
    connectionsCount: 34,
    accentColor: '#c084fc',
    defaultPosition: { x: 36, y: 100 },
  },
  {
    id: 'card-strahd',
    title: 'Strahd von Zarovich',
    category: 'Lorde de Baróvia',
    tags: ['#antagonista', '#lorde', '#vampiro'],
    excerpt: '«Eu sou o Antigo, eu sou a Terra.» Suas decisões ecoam em cada ruela e floresta, aprisionando o vale sob névoa eterna.',
    connectionsCount: 52,
    accentColor: '#f87171',
    defaultPosition: { x: 260, y: 280 },
  },
  {
    id: 'card-barovia',
    title: 'Vila de Baróvia',
    category: 'Povoado & Encontros',
    tags: ['#povoado', '#ponto-partida', '#névoa'],
    excerpt: 'Casas em ruínas sob névoa permanente. Os habitantes trancam suas portas antes do crepúsculo sob o olhar vigilante dos corvos.',
    connectionsCount: 18,
    accentColor: '#38bdf8',
    defaultPosition: { x: 50, y: 470 },
  },
];

const getDefaultCardPosition = (idx: number): { x: number; y: number } => {
  const positions = [
    { x: 36, y: 100 },
    { x: 260, y: 280 },
    { x: 48, y: 470 },
    { x: 280, y: 520 },
  ];
  return positions[idx % positions.length];
};

export const AmbientGraphBackdrop: React.FC<AmbientGraphBackdropProps> = ({
  className,
  vaultName = 'Campanha de Baróvia',
  customNodeTitles,
  realNodes,
  realLinks,
  featuredCards,
  isLoading = false,
  onSelectNode,
  defaultShowCards = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCards, setShowCards] = useState(defaultShowCards);
  const [dismissedCardIds, setDismissedCardIds] = useState<string[]>([]);
  const [isElec, setIsElec] = useState(false);

  useEffect(() => {
    setIsElec(isElectron());
  }, []);

  const { resetOrbits } = useAmbientGraphSimulation({
    canvasRef,
    containerRef,
    customNodeTitles,
    realNodes,
    realLinks,
    vaultName,
    onSelectNode,
  });

  // Dynamically resolve cards: from props, or auto-derived from realNodes, or default fallback
  const activeCards: RealFeaturedCardItem[] = useMemo(() => {
    if (featuredCards !== undefined) {
      return featuredCards;
    }
    // If realNodes is provided without explicit featuredCards, highlight top connected notes
    if (realNodes && realNodes.length > 0) {
      return realNodes
        .slice()
        .sort((a, b) => (b.connectionsCount ?? 0) - (a.connectionsCount ?? 0))
        .slice(0, 3)
        .map((node, idx) => ({
          id: `card-${node.id}`,
          title: node.title,
          category: node.isCanvas ? 'Canvas Infinito' : 'Nota Relevante',
          tags: node.isCanvas ? ['#canvas', '#mapa'] : ['#grimório', '#nota'],
          excerpt: node.isCanvas
            ? 'Quadro de conexões visuais, fluxos conceituais e anotações espaciais.'
            : 'Registro central do grimório conectado à constelação viva.',
          connectionsCount: node.connectionsCount ?? 0,
          accentColor: node.color || (node.isCanvas ? '#818cf8' : '#c084fc'),
          defaultPosition: getDefaultCardPosition(idx),
          path: node.path,
          isCanvas: node.isCanvas,
        }));
    }
    return DEFAULT_FEATURED_CARDS;
  }, [featuredCards, realNodes]);

  const handleDismissCard = (id: string) => {
    setDismissedCardIds(prev => [...prev, id]);
  };

  const handleResetCards = () => {
    setDismissedCardIds([]);
    setShowCards(true);
    resetOrbits();
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative w-full h-full min-h-[560px] overflow-hidden select-none bg-[#08080C]",
        "border-l border-white/[0.05] transition-colors duration-500",
        className
      )}
      style={{ backgroundColor: '#08080C' }}
    >
      {/* Top subtle synchronization shimmer line when loading */}
      {isLoading && (
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/80 to-transparent animate-pulse z-40" />
      )}

      {/* Deep Atmospheric Gradient Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-32 -left-20 w-[550px] h-[550px] rounded-full blur-[140px] opacity-70"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(8, 8, 12, 0) 70%)' }}
        />
        <div 
          className="absolute top-1/3 -right-24 w-[600px] h-[600px] rounded-full blur-[160px] opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.10) 0%, rgba(8, 8, 12, 0) 70%)' }}
        />
        <div 
          className="absolute -bottom-24 left-1/4 w-[500px] h-[500px] rounded-full blur-[130px] opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(8, 8, 12, 0) 70%)' }}
        />
      </div>

      {/* Subtle Arcane Grid Motif */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.025] z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* High-Performance Canvas for Constellation & Graph */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 w-full h-full block touch-none"
      />

      {/* Floating Interactive Lore Cards */}
      {showCards && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {activeCards.map((card, idx) => {
            if (dismissedCardIds.includes(card.id)) return null;
            return (
              <div key={card.id} className="pointer-events-auto">
                <FloatingLoreCard
                  id={card.id}
                  title={card.title}
                  category={card.category || (card.isCanvas ? 'Canvas Infinito' : 'Nota do Grimório')}
                  tags={card.tags || (card.isCanvas ? ['#canvas', '#mapa'] : ['#nota'])}
                  excerpt={card.excerpt || (card.isCanvas ? 'Quadro de conexões visuais e diagramas espaciais.' : 'Nota registrada no grimório.')}
                  connectionsCount={card.connectionsCount ?? 0}
                  accentColor={card.accentColor || (card.isCanvas ? '#818cf8' : '#c084fc')}
                  defaultPosition={card.defaultPosition || getDefaultCardPosition(idx)}
                  path={card.path}
                  isCanvas={card.isCanvas}
                  dragConstraintsRef={containerRef}
                  onSelect={(target, isCanvas) => {
                    if (onSelectNode) {
                      onSelectNode(target, isCanvas);
                    }
                  }}
                  onDismiss={handleDismissCard}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Top Floating Ambient HUD Bar */}
      <header 
        className="relative z-30 flex items-center justify-between px-6 pt-4 pb-3 pointer-events-auto select-none app-region-drag"
      >
        <div 
          className="flex items-center gap-3 pointer-events-auto app-region-no-drag"
        >
          {/* Status do Vault */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.08] shadow-lg text-xs">
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span className="font-semibold text-neutral-200 tracking-wide">
                  {vaultName}
                </span>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-widest pl-1 border-l border-white/10 animate-pulse">
                  Sincronizando
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="font-semibold text-neutral-200 tracking-wide">
                  {vaultName}
                </span>
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest pl-1 border-l border-white/10">
                  Constelação Viva
                </span>
              </>
            )}
          </div>

          {/* Action Controls: Cards e Atualizar agrupados no HUD esquerdo */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.08] shadow-lg">
            <button
              type="button"
              onClick={() => setShowCards(prev => !prev)}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer text-xs flex items-center gap-1.5 px-2.5"
              title={showCards ? 'Ocultar cards flutuantes' : 'Mostrar cards flutuantes'}
            >
              {showCards ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Cards</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Cards</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetCards}
              className="p-1.5 px-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer text-xs flex items-center gap-1.5"
              title="Recalibrar órbitas e atualizar constelação"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Atualizar</span>
            </button>
          </div>
        </div>

        {/* Centro: Área Livre de Drag da Janela */}
        <div 
          className="flex-1 h-full min-w-8 app-region-drag cursor-default"
          title="Arrastar Janela"
        />

        {/* Lado Direito: controles de janela integrados (.exe Electron) */}
        {isElec && (
          <div 
            className="pointer-events-auto flex items-center shrink-0 app-region-no-drag"
          >
            <div 
              className="p-1 px-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.08] shadow-lg flex items-center"
            >
              <WindowControls variant="compact" />
            </div>
          </div>
        )}
      </header>

      {/* Bottom Floating Ambient Hint */}
      <footer className="absolute bottom-4 inset-x-6 z-30 flex items-center justify-between pointer-events-none text-[11px] text-neutral-500">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Compass className="w-3.5 h-3.5 text-purple-400/70" />
          <span className="hidden sm:inline">
            Arraste os nós estelares e cards para reorganizar a constelação
          </span>
          <span className="sm:hidden">
            Arraste para mover nós
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400/50" />
          <span className="text-[10px] tracking-wider uppercase">Grafo GPU 60fps</span>
        </div>
      </footer>
    </div>
  );
};
