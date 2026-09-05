import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useVaultStore } from '../hooks/useVaultStore';
import { extractWikilinks, normalizeNoteTitle } from '../utils/wikilinkUtils';
import { 
  Network, Search, ZoomIn, ZoomOut, RotateCcw, 
  X, Play, Pause, FileText, Layers, ExternalLink
} from 'lucide-react';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;        // normalized title
  name: string;      // display title
  path: string;      // file path
  folder: string;
  connections: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface VaultGraphViewProps {
  onClose?: () => void;
}

export const VaultGraphView: React.FC<VaultGraphViewProps> = ({ onClose }) => {
  const { getAllFiles, provider, openDocument } = useVaultStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [filterText, setFilterText] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [rawLinks, setRawLinks] = useState<{ sourceId: string; targetId: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const allFiles = useMemo(() => getAllFiles(), [getAllFiles]);

  // Extract graph edges from all files
  useEffect(() => {
    let cancelled = false;

    const buildGraphData = async () => {
      if (!provider) return;
      setIsLoadingData(true);

      const links: { sourceId: string; targetId: string }[] = [];
      const titleToId = new Map<string, string>();

      allFiles.forEach(f => {
        titleToId.set(normalizeNoteTitle(f.name), f.name);
      });

      for (const file of allFiles) {
        try {
          const content = await provider.readDocument(file.path);
          if (cancelled) return;
          const extracted = extractWikilinks(content);

          for (const ext of extracted) {
            const normalizedTarget = normalizeNoteTitle(ext.targetTitle);
            if (titleToId.has(normalizedTarget)) {
              links.push({
                sourceId: file.name,
                targetId: titleToId.get(normalizedTarget)!
              });
            }
          }
        } catch {
          // ignore unreadable files
        }
      }

      if (!cancelled) {
        setRawLinks(links);
        setIsLoadingData(false);
      }
    };

    buildGraphData();

    return () => {
      cancelled = true;
    };
  }, [allFiles, provider]);

  // Compute graph nodes and links
  const { nodes, links, connectedNeighbors } = useMemo(() => {
    const connectionCounts = new Map<string, number>();
    rawLinks.forEach(l => {
      connectionCounts.set(l.sourceId, (connectionCounts.get(l.sourceId) || 0) + 1);
      connectionCounts.set(l.targetId, (connectionCounts.get(l.targetId) || 0) + 1);
    });

    const filteredFiles = filterText.trim()
      ? allFiles.filter(f => f.name.toLowerCase().includes(filterText.toLowerCase()) || f.folder.toLowerCase().includes(filterText.toLowerCase()))
      : allFiles;

    const visibleNodeIds = new Set(filteredFiles.map(f => f.name));

    const gNodes: GraphNode[] = filteredFiles.map(f => ({
      id: f.name,
      name: f.name,
      path: f.path,
      folder: f.folder,
      connections: connectionCounts.get(f.name) || 0
    }));

    const gLinks: GraphLink[] = rawLinks
      .filter(l => visibleNodeIds.has(l.sourceId) && visibleNodeIds.has(l.targetId))
      .map(l => ({
        source: l.sourceId,
        target: l.targetId
      }));

    // Neighbor map for hover effects
    const neighbors = new Map<string, Set<string>>();
    rawLinks.forEach(l => {
      if (!neighbors.has(l.sourceId)) neighbors.set(l.sourceId, new Set());
      if (!neighbors.has(l.targetId)) neighbors.set(l.targetId, new Set());
      neighbors.get(l.sourceId)!.add(l.targetId);
      neighbors.get(l.targetId)!.add(l.sourceId);
    });

    return { nodes: gNodes, links: gLinks, connectedNeighbors: neighbors };
  }, [allFiles, rawLinks, filterText]);

  // Color generator based on folder or connection count
  const getNodeColor = (node: GraphNode) => {
    const lowerFolder = node.folder.toLowerCase();
    if (lowerFolder.includes('npc')) return '#10b981'; // emerald
    if (lowerFolder.includes('quest')) return '#f59e0b'; // amber
    if (lowerFolder.includes('local') || lowerFolder.includes('cidade')) return '#06b6d4'; // cyan
    if (lowerFolder.includes('sess') || lowerFolder.includes('diario')) return '#ec4899'; // pink
    if (node.connections > 3) return '#a855f7'; // strong purple
    return '#8b5cf6'; // default violet
  };

  // D3 Force Simulation Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Zoom container
    const g = svg.append('g').attr('class', 'zoom-root');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Initial centered transform
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85));

    // Force simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(110))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(0, 0))
      .force('collide', d3.forceCollide().radius((d: any) => Math.max(16, 8 + (d.connections || 0) * 2.5)))
      .alphaDecay(0.02);

    if (!isPlaying) {
      simulation.stop();
    }

    // Render Links
    const linkGroup = g.append('g').attr('class', 'links');
    const linkElements = linkGroup
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#3f3f46')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.45);

    // Render Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-item')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node Circle
    nodeElements
      .append('circle')
      .attr('r', (d) => Math.min(22, Math.max(7, 6 + d.connections * 2.2)))
      .attr('fill', (d) => getNodeColor(d))
      .attr('stroke', '#18181b')
      .attr('stroke-width', 2)
      .style('transition', 'r 0.15s, fill 0.15s, opacity 0.15s');

    // Node Label
    nodeElements
      .append('text')
      .text((d) => d.name)
      .attr('y', (d) => Math.min(22, Math.max(7, 6 + d.connections * 2.2)) + 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#d4d4d8')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.9)');

    // Hover & Click Events
    nodeElements
      .on('mouseenter', (event, d) => {
        setHoveredNodeId(d.id);
        const nodeNeighbors = connectedNeighbors.get(d.id) || new Set();

        // Highlight links
        linkElements
          .attr('stroke', (l: any) => (l.source.id === d.id || l.target.id === d.id ? '#a855f7' : '#27272a'))
          .attr('stroke-opacity', (l: any) => (l.source.id === d.id || l.target.id === d.id ? 1 : 0.1))
          .attr('stroke-width', (l: any) => (l.source.id === d.id || l.target.id === d.id ? 2.5 : 1));

        // Dim non-connected nodes
        nodeElements.style('opacity', (n: any) => (n.id === d.id || nodeNeighbors.has(n.id) ? 1 : 0.2));
      })
      .on('mouseleave', () => {
        setHoveredNodeId(null);
        linkElements
          .attr('stroke', '#3f3f46')
          .attr('stroke-opacity', 0.45)
          .attr('stroke-width', 1.5);
        nodeElements.style('opacity', 1);
      })
      .on('click', (event, d) => {
        setSelectedNode(d);
      });

    // Simulation Tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeElements.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, isPlaying, connectedNeighbors]);

  const handleOpenSelectedNote = (path: string) => {
    openDocument(path);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="h-14 border-b border-neutral-800 bg-neutral-900/60 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <span>Grafo de Conexões (Graph View)</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 font-mono">
                {nodes.length} notas · {links.length} links
              </span>
            </h2>
          </div>
        </div>

        {/* Search Filter */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar notas no grafo..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 outline-none focus:border-violet-500"
            />
          </div>

          <div className="w-px h-5 bg-neutral-800" />

          {/* Controls */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors"
            title={isPlaying ? 'Pausar física' : 'Retomar física'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Fechar Grafo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="flex-1 w-full h-full relative overflow-hidden bg-neutral-950">
        {isLoadingData ? (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-xs gap-2">
            <Network className="w-5 h-5 animate-pulse text-violet-500" />
            <span>Mapeando conexões [[wikilinks]] do Vault...</span>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80 backdrop-blur-md flex items-center gap-4 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> NPCs</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Quests</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Locais</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Sessões</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Notas Gerais</span>
        </div>

        {/* Selected Node Details Card */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-72 p-4 rounded-xl bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                <h4 className="text-sm font-semibold text-neutral-100 truncate">{selectedNode.name}</h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs text-neutral-400 space-y-1 mb-4">
              {selectedNode.folder && <div>Pasta: <strong className="text-neutral-200">{selectedNode.folder}</strong></div>}
              <div>Conexões diretas: <strong className="text-violet-400">{selectedNode.connections}</strong></div>
            </div>

            <button
              onClick={() => handleOpenSelectedNote(selectedNode.path)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium shadow-md transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Nota no Editor</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
