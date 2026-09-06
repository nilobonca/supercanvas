import { useEffect, useRef, useCallback } from 'react';

export interface RealGraphNodeItem {
  id: string;
  title: string;
  path?: string;
  color?: string;
  connectionsCount?: number;
  isCanvas?: boolean;
}

export interface RealGraphLinkItem {
  sourceId: string;
  targetId: string;
}

export interface SimNode {
  id: string;
  title: string;
  path?: string;
  isCanvas?: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
  color: string;
  glowColor: string;
  pulseOffset: number;
  pulseSpeed: number;
  floatAmplitude: number;
  floatSpeed: number;
  connections: number[];
}

export interface SimSpark {
  linkIdx: number;
  progress: number;
  speed: number;
  color: string;
}

export interface SimDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

export interface UseAmbientGraphProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  customNodeTitles?: string[];
  realNodes?: RealGraphNodeItem[];
  realLinks?: RealGraphLinkItem[];
  vaultName?: string;
  onSelectNode?: (pathOrTitle: string, isCanvas?: boolean) => void;
}

// Curated celestial / arcane color palette for uncolored nodes
const LORE_COLOR_PALETTE = [
  '#7F95FF', // soft periwinkle / primary accent
  '#52B1FF', // sky cyan
  '#B4D3F1', // ice blue pastel
  '#1831D7', // royal cobalt
  '#F4F0E6', // warm ivory
  '#17192A', // midnight navy
];

// Helper to convert hex colors to rgba with desired opacity
const hexToRgba = (hex: string, alpha: number): string => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(168, 85, 247, ${alpha})`;
};

// Iconic default lore nodes for fallback demonstration
const DEFAULT_LORE_NODES: { title: string; color: string; glow: string }[] = [
  { title: 'Castelo Ravenloft', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.45)' },
  { title: 'Strahd von Zarovich', color: '#f87171', glow: 'rgba(248, 113, 113, 0.5)' },
  { title: 'Vila de Baróvia', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
  { title: 'Templo de Âmbar', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)' },
  { title: 'Espada do Sol', color: '#fef08a', glow: 'rgba(254, 240, 138, 0.55)' },
  { title: 'Madame Eva', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.45)' },
  { title: 'Moinho Velho', color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.4)' },
  { title: 'Floresta de Svalich', color: '#34d399', glow: 'rgba(52, 211, 153, 0.4)' },
  { title: 'Tomo de Strahd', color: '#818cf8', glow: 'rgba(129, 140, 248, 0.45)' },
  { title: 'Abadia de S. Markovia', color: '#22d3ee', glow: 'rgba(34, 211, 238, 0.4)' },
  { title: 'Argynvostholt', color: '#e2e8f0', glow: 'rgba(226, 232, 240, 0.45)' },
  { title: 'Ruínas de Berez', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.35)' },
  { title: 'Passo de Tsolenka', color: '#67e8f9', glow: 'rgba(103, 232, 249, 0.4)' },
  { title: 'Símbolo de Ravenkind', color: '#facc15', glow: 'rgba(250, 204, 21, 0.5)' },
  { title: 'Lago Zarovich', color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.4)' },
];

export const useAmbientGraphSimulation = ({
  canvasRef,
  containerRef,
  customNodeTitles,
  realNodes,
  realLinks,
  vaultName,
  onSelectNode,
}: UseAmbientGraphProps) => {
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<[number, number][]>([]);
  const sparksRef = useRef<SimSpark[]>([]);
  const dustRef = useRef<SimDust[]>([]);
  const hoveredNodeIdxRef = useRef<number | null>(null);
  const draggedNodeIdxRef = useRef<number | null>(null);
  const isDraggingMoveRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Initialize or update nodes when container, realNodes, realLinks or titles change
  const initSimulation = useCallback((width: number, height: number) => {
    if (width <= 0 || height <= 0) return;

    // 1. Determine raw node items to build the simulation graph from
    let sourceItems: RealGraphNodeItem[] = [];

    if (realNodes && realNodes.length > 0) {
      // Prioritize real nodes from vault
      sourceItems = realNodes;
    } else if (customNodeTitles && customNodeTitles.length > 0) {
      // Backward-compatible fallback from string titles
      sourceItems = customNodeTitles.slice(0, 20).map((title, idx) => {
        const defaultMatch = DEFAULT_LORE_NODES[idx % DEFAULT_LORE_NODES.length];
        return {
          id: `custom-${idx}`,
          title,
          color: defaultMatch.color,
          connectionsCount: Math.max(1, (idx % 4) + 1),
        };
      });
    } else {
      // Vault totally empty: create minimal welcome constellation
      const currentVaultTitle = vaultName && vaultName.trim().length > 0
        ? vaultName.trim()
        : 'Meu Vault';

      sourceItems = [
        {
          id: 'welcome-vault',
          title: currentVaultTitle,
          color: '#c084fc',
          connectionsCount: 3,
        },
        {
          id: 'welcome-notes',
          title: 'Notas do Grimório',
          color: '#38bdf8',
          connectionsCount: 2,
        },
        {
          id: 'welcome-canvas',
          title: 'Canvas Infinito',
          color: '#818cf8',
          connectionsCount: 2,
          isCanvas: true,
        },
        {
          id: 'welcome-lore',
          title: 'Conexões & Ideias',
          color: '#34d399',
          connectionsCount: 1,
        },
      ];
    }

    // Limit maximum simultaneous simulation nodes to maintain silky smooth 60fps GPU rendering
    const MAX_SIM_NODES = 48;
    const sortedItems = sourceItems.length > MAX_SIM_NODES
      ? sourceItems
          .slice()
          .sort((a, b) => (b.connectionsCount ?? 0) - (a.connectionsCount ?? 0))
          .slice(0, MAX_SIM_NODES)
      : sourceItems.slice();

    const count = sortedItems.length;
    const nodes: SimNode[] = [];
    const centerX = width * 0.55; // Offset to give breathing room for left dashboard panels
    const centerY = height * 0.5;
    const maxRadius = Math.min(width, height) * 0.42;

    // Cache previous positions to animate transitions seamlessly without abrupt visual jumps
    const prevPositions = new Map<string, { x: number; y: number; baseX: number; baseY: number }>();
    nodesRef.current.forEach(n => {
      prevPositions.set(n.id, { x: n.x, y: n.y, baseX: n.baseX, baseY: n.baseY });
    });

    for (let i = 0; i < count; i++) {
      const item = sortedItems[i];
      const connCount = item.connectionsCount ?? 0;

      let baseX: number;
      let baseY: number;

      if (count === 1) {
        baseX = centerX;
        baseY = centerY;
      } else {
        // Golden spiral distribution with celestial harmony
        const phi = i * 2.39996 + ((i * 11) % 7) * 0.04;
        const r = (Math.sqrt((i + 0.8) / count) * 0.84 + 0.16) * maxRadius;
        baseX = Math.max(50, Math.min(width - 50, centerX + Math.cos(phi) * r));
        baseY = Math.max(50, Math.min(height - 50, centerY + Math.sin(phi) * r));
      }

      const prev = prevPositions.get(item.id);
      const x = prev ? prev.x : baseX;
      const y = prev ? prev.y : baseY;

      // Calibrate node radius proportional to connection density and canvas flag
      const baseR = item.isCanvas ? 5.2 : 4.0;
      const radius = Math.min(9.5, Math.max(3.8, baseR + Math.sqrt(connCount) * 1.05));

      // Calibrate node category color & ethereal glow
      const fallbackColor = LORE_COLOR_PALETTE[i % LORE_COLOR_PALETTE.length];
      const nodeColor = item.color || (item.isCanvas ? '#818cf8' : fallbackColor);
      const glowColor = hexToRgba(nodeColor, 0.45);

      nodes.push({
        id: item.id,
        title: item.title,
        path: item.path,
        isCanvas: item.isCanvas,
        x,
        y,
        vx: 0,
        vy: 0,
        baseX,
        baseY,
        radius,
        color: nodeColor,
        glowColor,
        pulseOffset: (i * 0.7) % (Math.PI * 2),
        pulseSpeed: 0.8 + (i % 5) * 0.25,
        floatAmplitude: 3.5 + (i % 4) * 2.0,
        floatSpeed: 0.35 + (i % 3) * 0.2,
        connections: [],
      });
    }

    // 2. Build connection index lookup table
    const idToIndex = new Map<string, number>();
    nodes.forEach((n, idx) => {
      idToIndex.set(n.id, idx);
      idToIndex.set(n.id.toLowerCase(), idx);
      if (n.path) {
        idToIndex.set(n.path, idx);
        idToIndex.set(n.path.toLowerCase(), idx);
        idToIndex.set(n.path.replace(/\.md$/, ''), idx);
        idToIndex.set(n.path.replace(/\.md$/, '').toLowerCase(), idx);
      }
      if (n.title) {
        idToIndex.set(n.title, idx);
        idToIndex.set(n.title.toLowerCase(), idx);
      }
    });

    const links: [number, number][] = [];
    const linkKeySet = new Set<string>();

    const addLink = (a: number, b: number): boolean => {
      if (a === b || a < 0 || b < 0 || a >= nodes.length || b >= nodes.length) return false;
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (linkKeySet.has(key)) return false;
      linkKeySet.add(key);
      links.push([a, b]);
      nodes[a]?.connections.push(b);
      nodes[b]?.connections.push(a);
      return true;
    };

    // 3. Map real links or fallback connections
    if (realNodes && realNodes.length > 0 && realLinks && realLinks.length > 0) {
      realLinks.forEach(rl => {
        const srcIdx = idToIndex.get(rl.sourceId) ?? idToIndex.get(rl.sourceId.toLowerCase());
        const tgtIdx = idToIndex.get(rl.targetId) ?? idToIndex.get(rl.targetId.toLowerCase());
        if (srcIdx !== undefined && tgtIdx !== undefined) {
          addLink(srcIdx, tgtIdx);
        }
      });
    } else if (!realNodes || realNodes.length === 0) {
      // Empty vault or custom titles fallback
      if (customNodeTitles && customNodeTitles.length > 0) {
        if (nodes.length >= 3) {
          addLink(0, 1);
          addLink(1, 2);
          addLink(0, 2);
        }
      } else {
        // Welcome constellation links
        addLink(0, 1); // Vault <-> Notes
        addLink(0, 2); // Vault <-> Canvas
        addLink(0, 3); // Vault <-> Lore
        addLink(1, 2); // Notes <-> Canvas
      }
    }

    // 4. Softly connect nodes without direct wikilinks to their nearest neighbor for constellation harmony
    nodes.forEach((node, i) => {
      if (node.connections.length === 0 && nodes.length > 1) {
        let nearestIdx = -1;
        let minDist = Infinity;
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = node.baseX - nodes[j].baseX;
          const dy = node.baseY - nodes[j].baseY;
          const distSq = dx * dx + dy * dy;
          if (distSq < minDist) {
            minDist = distSq;
            nearestIdx = j;
          }
        }
        if (nearestIdx !== -1) {
          addLink(i, nearestIdx);
        }
      }
    });

    // 5. Create traveling arcane sparks over the real links
    const sparks: SimSpark[] = [];
    if (links.length > 0) {
      const sparkCount = Math.min(Math.max(links.length, 6), 16);
      for (let i = 0; i < sparkCount; i++) {
        const linkIdx = Math.floor(Math.random() * links.length);
        const sourceNode = nodes[links[linkIdx][0]];
        sparks.push({
          linkIdx,
          progress: Math.random(),
          speed: 0.12 + Math.random() * 0.22,
          color: sourceNode?.color || '#c084fc',
        });
      }
    }

    // 6. Ambient cosmic dust
    const dust: SimDust[] = [];
    for (let i = 0; i < 35; i++) {
      dust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: 0.8 + Math.random() * 1.5,
        alpha: 0.15 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
      });
    }

    nodesRef.current = nodes;
    linksRef.current = links;
    sparksRef.current = sparks;
    dustRef.current = dust;
  }, [realNodes, realLinks, customNodeTitles, vaultName]);

  // Main render and animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let isDestroyed = false;

    const handleResize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      initSimulation(width, height);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    handleResize();

    const render = (time: number) => {
      if (isDestroyed) return;

      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        ctx.save();
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const nodes = nodesRef.current;
        const links = linksRef.current;
        const sparks = sparksRef.current;
        const dust = dustRef.current;
        const hoveredIdx = hoveredNodeIdxRef.current;
        const draggedIdx = draggedNodeIdxRef.current;
        const mouse = mousePosRef.current;

        // 1. Draw Dust & Cosmic Grain
        dust.forEach(d => {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < 0) d.x = width;
          if (d.x > width) d.x = 0;
          if (d.y < 0) d.y = height;
          if (d.y > height) d.y = 0;

          const twinkle = 0.5 + 0.5 * Math.sin(time * 0.002 + d.phase);
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * twinkle * 0.4})`;
          ctx.fill();
        });

        // 2. Physics & Node Movement
        const tSec = time * 0.001;
        nodes.forEach((node, i) => {
          if (i === draggedIdx && mouse) {
            // Dragging: directly interpolate towards mouse
            node.x += (mouse.x - node.x) * 0.35;
            node.y += (mouse.y - node.y) * 0.35;
            node.baseX = node.x;
            node.baseY = node.y;
          } else {
            // Harmonic floating motion
            const ox = Math.cos(tSec * node.floatSpeed + node.pulseOffset) * node.floatAmplitude;
            const oy = Math.sin(tSec * node.floatSpeed + node.pulseOffset) * node.floatAmplitude;
            const targetX = node.baseX + ox;
            const targetY = node.baseY + oy;

            // Subtle mouse repulsion/attraction aura
            let pushX = 0;
            let pushY = 0;
            if (mouse && i !== hoveredIdx) {
              const dx = node.x - mouse.x;
              const dy = node.y - mouse.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0 && dist < 120) {
                const force = (1 - dist / 120) * 12;
                pushX = (dx / dist) * force;
                pushY = (dy / dist) * force;
              }
            }

            node.x += (targetX + pushX - node.x) * 0.1;
            node.y += (targetY + pushY - node.y) * 0.1;
          }

          // Screen bounds constraints
          node.x = Math.max(30, Math.min(width - 30, node.x));
          node.y = Math.max(30, Math.min(height - 30, node.y));
        });

        // 3. Render Constellation Links
        links.forEach(([a, b]) => {
          const nodeA = nodes[a];
          const nodeB = nodes[b];
          if (!nodeA || !nodeB) return;

          const isConnectedToHovered = hoveredIdx === a || hoveredIdx === b;
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Ethereal line alpha based on distance & hover state
          let baseAlpha = Math.max(0.08, 0.32 - (dist / Math.max(width, height)) * 0.28);
          if (isConnectedToHovered) {
            baseAlpha = 0.75;
          }

          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);

          if (isConnectedToHovered) {
            ctx.strokeStyle = `rgba(127, 149, 255, ${baseAlpha})`;
            ctx.lineWidth = 1.8;
          } else {
            ctx.strokeStyle = `rgba(180, 211, 241, ${baseAlpha * 0.75})`;
            ctx.lineWidth = 1.0;
          }
          ctx.stroke();
        });

        // 4. Render Traveling Arcane Sparks along Real Links
        if (links.length > 0) {
          sparks.forEach(spark => {
            spark.progress += spark.speed * dt;
            if (spark.progress > 1) {
              spark.progress = 0;
              spark.linkIdx = Math.floor(Math.random() * links.length);
              const sourceNode = nodes[links[spark.linkIdx]?.[0]];
              spark.color = sourceNode?.color || '#c084fc';
            }

            const link = links[spark.linkIdx];
            if (!link) return;
            const nodeA = nodes[link[0]];
            const nodeB = nodes[link[1]];
            if (!nodeA || !nodeB) return;

            const sx = nodeA.x + (nodeB.x - nodeA.x) * spark.progress;
            const sy = nodeA.y + (nodeB.y - nodeA.y) * spark.progress;

            // Spark radial glow
            const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 5);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.4, spark.color);
            grad.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          });
        }

        // 5. Render Nodes and Typographic Labels
        nodes.forEach((node, i) => {
          const isHovered = hoveredIdx === i;
          const isConnected = hoveredIdx !== null && node.connections.includes(hoveredIdx);
          const pulse = Math.sin(tSec * node.pulseSpeed + node.pulseOffset);
          const currentRadius = isHovered
            ? node.radius * 1.5
            : isConnected
              ? node.radius * 1.2
              : node.radius + pulse * 0.6;

          // Outer Glow
          const glowMultiplier = isHovered ? 4.5 : isConnected ? 3.0 : 2.5;
          const glowGrad = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, currentRadius * glowMultiplier
          );
          glowGrad.addColorStop(0, node.glowColor);
          glowGrad.addColorStop(0.5, `${node.color}20`);
          glowGrad.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(node.x, node.y, currentRadius * glowMultiplier, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();

          // Canvas node orbital ring
          if (node.isCanvas) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, currentRadius + 3.5, 0, Math.PI * 2);
            ctx.strokeStyle = isHovered ? '#ffffff' : `${node.color}85`;
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]); // reset line dash
          }

          // Star Core
          ctx.beginPath();
          ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? '#ffffff' : node.color;
          ctx.fill();

          // Center bright pinpoint
          ctx.beginPath();
          ctx.arc(node.x, node.y, Math.max(1.2, currentRadius * 0.45), 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Typographic Label
          const labelText = node.title;
          ctx.font = isHovered
            ? '600 11.5px Inter, sans-serif'
            : '500 10.5px Inter, sans-serif';

          const textWidth = ctx.measureText(labelText).width;
          const labelX = node.x;
          const labelY = node.y + currentRadius + 14;

          // Label pill background on hover or connected
          if (isHovered || isConnected) {
            const padX = 6;
            const padY = 3;
            ctx.fillStyle = isHovered ? 'rgba(18, 16, 28, 0.92)' : 'rgba(18, 16, 28, 0.75)';
            ctx.beginPath();
            ctx.roundRect(
              labelX - textWidth / 2 - padX,
              labelY - 10 - padY,
              textWidth + padX * 2,
              14 + padY * 2,
              5
            );
            ctx.fill();
            ctx.strokeStyle = isHovered ? node.color : 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Text rendering with subtle shadow
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 4;
          ctx.fillStyle = isHovered
            ? '#ffffff'
            : isConnected
              ? '#e2e8f0'
              : 'rgba(226, 232, 240, 0.65)';
          ctx.fillText(labelText, labelX, labelY);
          ctx.shadowBlur = 0; // reset
        });

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    // Pause when page is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }
      } else {
        lastTimeRef.current = performance.now();
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isDestroyed = true;
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [initSimulation, canvasRef, containerRef]);

  // Pointer event listeners for hover and dragging
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasCoords = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = getCanvasCoords(e);
      mousePosRef.current = { x, y };

      if (draggedNodeIdxRef.current !== null) {
        if (dragStartPosRef.current) {
          const dx = x - dragStartPosRef.current.x;
          const dy = y - dragStartPosRef.current.y;
          if (dx * dx + dy * dy > 16) {
            isDraggingMoveRef.current = true;
          }
        }
        canvas.style.cursor = 'grabbing';
        return;
      }

      const nodes = nodesRef.current;
      let foundHover: number | null = null;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dx = n.x - x;
        const dy = n.y - y;
        const hitRadius = n.radius + 16;
        if (dx * dx + dy * dy < hitRadius * hitRadius) {
          foundHover = i;
          break;
        }
      }

      hoveredNodeIdxRef.current = foundHover;
      canvas.style.cursor = foundHover !== null ? 'pointer' : 'default';
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // only left click
      const { x, y } = getCanvasCoords(e);
      dragStartPosRef.current = { x, y };
      isDraggingMoveRef.current = false;

      if (hoveredNodeIdxRef.current !== null) {
        draggedNodeIdxRef.current = hoveredNodeIdxRef.current;
        canvas.style.cursor = 'grabbing';
      }
    };

    const handleMouseUp = () => {
      if (draggedNodeIdxRef.current !== null) {
        draggedNodeIdxRef.current = null;
        canvas.style.cursor = hoveredNodeIdxRef.current !== null ? 'pointer' : 'default';
      }
    };

    const handleClick = () => {
      if (isDraggingMoveRef.current) {
        isDraggingMoveRef.current = false;
        return;
      }

      if (hoveredNodeIdxRef.current !== null && onSelectNode) {
        const node = nodesRef.current[hoveredNodeIdxRef.current];
        if (node) {
          const target = node.isCanvas
            ? (node.id || node.path || node.title)
            : (node.path || node.title);
          onSelectNode(target, node.isCanvas);
        }
      }
    };

    const handleMouseLeave = () => {
      mousePosRef.current = null;
      hoveredNodeIdxRef.current = null;
      draggedNodeIdxRef.current = null;
      isDraggingMoveRef.current = false;
      dragStartPosRef.current = null;
      canvas.style.cursor = 'default';
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canvasRef, onSelectNode]);

  const resetOrbits = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      initSimulation(rect.width, rect.height);
    }
  }, [containerRef, initSimulation]);

  return { resetOrbits };
};
