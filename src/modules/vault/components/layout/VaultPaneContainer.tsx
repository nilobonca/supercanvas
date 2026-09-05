import React, { useRef } from 'react';
import { VaultLayoutNode } from '../../interfaces/layout';
import { isPaneLeaf, isPaneSplit, getAllPanes } from '../../utils/layoutUtils';
import { useVaultStore } from '../../hooks/useVaultStore';
import { VaultPaneView } from './VaultPaneView';
import { VaultSplitDivider } from './VaultSplitDivider';

interface VaultPaneContainerProps {
  node: VaultLayoutNode;
}

export const VaultPaneContainer: React.FC<VaultPaneContainerProps> = ({ node }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { layout } = useVaultStore();
  const totalPanesCount = getAllPanes(layout).length;

  if (isPaneLeaf(node)) {
    return (
      <VaultPaneView
        pane={node}
        totalPanesCount={totalPanesCount}
      />
    );
  }

  if (isPaneSplit(node)) {
    const isHorizontal = node.direction === 'horizontal';

    return (
      <div
        ref={containerRef}
        className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} w-full h-full min-w-0 min-h-0 overflow-hidden`}
      >
        {node.children.map((child, idx) => {
          const size = node.sizes[idx] ?? (100 / node.children.length);

          return (
            <React.Fragment key={child.id}>
              <div
                style={{
                  [isHorizontal ? 'width' : 'height']: `${size}%`,
                  [isHorizontal ? 'minWidth' : 'minHeight']: 0,
                }}
                className={`${isHorizontal ? 'h-full' : 'w-full'} overflow-hidden`}
              >
                <VaultPaneContainer node={child} />
              </div>

              {/* Divider between children */}
              {idx < node.children.length - 1 && (
                <VaultSplitDivider
                  splitId={node.id}
                  direction={node.direction}
                  index={idx}
                  sizes={node.sizes}
                  containerRef={containerRef}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return null;
};
