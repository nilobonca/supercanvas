import React from 'react';
import { AppSidebarRibbon } from '@/components/common/AppSidebarRibbon';

export interface VaultRibbonProps {
  onOpenGraph: () => void;
  onCreateBoardCanvas: () => void;
  className?: string;
}

export const VaultRibbon: React.FC<VaultRibbonProps> = (props) => {
  return (
    <AppSidebarRibbon
      variant="vault"
      onOpenGraph={props.onOpenGraph}
      onCreateBoardCanvas={props.onCreateBoardCanvas}
      className={props.className}
    />
  );
};
