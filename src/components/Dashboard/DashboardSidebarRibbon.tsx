import React from 'react';
import { 
  AppSidebarRibbon, 
  DashboardTab as AppDashboardTab 
} from '@/components/common/AppSidebarRibbon';

export type DashboardTab = AppDashboardTab;

export interface DashboardSidebarRibbonProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onOpenSettings: () => void;
  theme: string;
  onToggleTheme: () => void;
  className?: string;
}

export const DashboardSidebarRibbon: React.FC<DashboardSidebarRibbonProps> = (props) => {
  return (
    <AppSidebarRibbon
      variant="dashboard"
      activeTab={props.activeTab}
      onSelectTab={props.onSelectTab}
      onOpenSettings={props.onOpenSettings}
      theme={props.theme}
      onToggleTheme={props.onToggleTheme}
      className={props.className}
    />
  );
};
