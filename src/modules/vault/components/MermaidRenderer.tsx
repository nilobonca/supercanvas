import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  chart: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      if (!chart.trim()) return;
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'inherit'
        });

        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart.trim());
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Erro ao renderizar diagrama Mermaid');
        }
      }
    };

    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="my-3 p-3 rounded-lg border border-rose-500/30 bg-rose-950/20 text-rose-400 text-xs font-mono">
        <p className="font-semibold mb-1">Erro de Sintaxe Mermaid:</p>
        <pre className="text-[11px] whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-3 p-4 flex items-center justify-center text-xs text-stone-400 bg-stone-50/50 dark:bg-white/[0.02] rounded-lg animate-pulse">
        Renderizando diagrama...
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="my-4 p-4 rounded-xl border border-stone-200/80 dark:border-white/10 bg-stone-50/40 dark:bg-white/[0.02] overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
