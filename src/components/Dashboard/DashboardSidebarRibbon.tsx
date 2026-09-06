import React from 'react';
import { 
  Shield, 
  BookOpen, 
  Workflow, 
  Settings, 
  Sun, 
  Moon, 
  Sparkles,
  Sparkle
} from 'lucide-react';
import { SafeIcon } from '@/components/common/SafeIcon';
import { ConchaLogo } from '@/components/common/ConchaLogo';
import clsx from 'clsx';

export type DashboardTab = 'active-vault' | 'vaults-library' | 'canvases';

export interface DashboardSidebarRibbonProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onOpenSettings: () => void;
  theme: string;
  onToggleTheme: () => void;
  className?: string;
}

interface RibbonItem {
  id: DashboardTab;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  showActiveIndicator?: boolean;
}

const NAVIGATION_ITEMS: RibbonItem[] = [
  {
    id: 'active-vault',
    label: 'Vault Ativo',
    subtitle: 'Configurações e Detalhes',
    icon: SafeIcon,
    showActiveIndicator: true,
  },
  {
    id: 'vaults-library',
    label: 'Biblioteca de Vaults',
    subtitle: 'Bases e Armazenamento',
    icon: BookOpen,
  },
  {
    id: 'canvases',
    label: 'Acesso Rápido aos Canvas',
    subtitle: 'Conexões e Áudio RPG',
    icon: Workflow,
  },
];

export const DashboardSidebarRibbon: React.FC<DashboardSidebarRibbonProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  theme,
  onToggleTheme,
  className,
}) => {
  const isLight = theme === 'light';

  const ThemeIcon = isLight ? Sun : Moon;
  const themeLabel = isLight ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro';

  return (
    <aside
      aria-label="Barra de Navegação Lateral"
      className={clsx(
        "w-11 h-full min-h-screen shrink-0 z-30 flex flex-col items-center justify-between py-2 select-none app-region-no-drag",
        "border-r transition-colors duration-300",
        isLight
          ? "bg-[#EDE8DD] border-black/[0.08] shadow-[4px_0_24px_rgba(0,0,0,0.03)]"
          : "bg-[#131524] border-white/[0.07] shadow-[4px_0_24px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      {/* ============================================================
          TOP: LOGO / MARCA CONCHA
          ============================================================ */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative group cursor-pointer" title="Concha">
          {/* Outer glow ring on hover with brand gradient */}
          <div className="absolute -inset-1 rounded-xl bg-brand-gradient opacity-0 group-hover:opacity-75 blur-xs transition-opacity duration-300" />
          
          <div className="relative w-7 h-7 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 group-hover:border-[#7F95FF]/50 transition-all duration-300 active:scale-95 p-1.5 overflow-hidden shadow-xs">
            <ConchaLogo 
              className="w-full h-full object-contain select-none transition-transform duration-300 group-hover:scale-110" 
              theme={theme}
            />
          </div>

          {/* Floating Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 bg-stone-900 text-stone-100 dark:bg-white dark:text-stone-900 shadow-xl border border-white/10 dark:border-black/10 backdrop-blur-md">
            Concha
          </div>
        </div>

        {/* Subtle Separator */}
        <div className="w-5 h-px bg-black/[0.08] dark:bg-white/[0.08] my-0.5" />

        {/* ============================================================
            NAVIGATION ITEMS (EXACT 3 ICONS)
            ============================================================ */}
        <nav className="flex flex-col items-center gap-1.5" role="tablist">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectTab(item.id)}
                  className={clsx(
                    "relative p-2 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer outline-none",
                    "active:scale-95 focus-visible:ring-2 focus-visible:ring-[#7F95FF]",
                    isSelected
                      ? isLight
                        ? "bg-white text-[#1831D7] shadow-sm border border-black/10 font-bold"
                        : "bg-white/[0.12] text-white shadow-[0_0_16px_rgba(127,149,255,0.15)] border border-[#7F95FF]/30"
                      : isLight
                        ? "text-stone-500 hover:text-stone-900 hover:bg-black/5"
                        : "text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.06]"
                  )}
                  aria-label={item.label}
                >
                  <Icon size={16} className={clsx("stroke-[1.75]", isSelected && "scale-105")} />

                  {/* Active tab lateral highlight bar */}
                  {isSelected && (
                    <span 
                      className="absolute -left-1.5 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-[#1831D7] dark:bg-[#7F95FF] shadow-[0_0_8px_rgba(127,149,255,0.8)]" 
                    />
                  )}

                  {/* Luminous Green Active Indicator for 'active-vault' */}
                  {item.showActiveIndicator && isSelected && (
                    <span 
                      className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-[#131524] shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" 
                      title="Vault conectado e ativo"
                    />
                  )}
                </button>

                {/* Floating Tooltip */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium tracking-normal whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 bg-stone-900/95 text-stone-100 dark:bg-white/95 dark:text-stone-900 shadow-xl border border-white/10 dark:border-black/10 backdrop-blur-md flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{item.label}</span>
                    {item.showActiveIndicator && isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 dark:text-neutral-500 font-normal">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* ============================================================
          BOTTOM: THEME TOGGLE & GENERAL SETTINGS
          ============================================================ */}
      <div className="flex flex-col items-center gap-1.5">
        {/* Theme Switcher Button */}
        <div className="relative group">
          <button
            onClick={onToggleTheme}
            className={clsx(
              "p-2 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer outline-none active:scale-95",
              isLight
                ? "text-stone-600 hover:text-stone-900 hover:bg-black/5"
                : "text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.06]"
            )}
            aria-label="Alternar Tema"
          >
            <ThemeIcon 
              size={16} 
              className={clsx(
                "stroke-[1.75] transition-transform duration-300 group-hover:rotate-12",
                isLight ? "text-[#1831D7]" : "text-[#7F95FF]"
              )} 
            />
          </button>

          {/* Floating Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 bg-stone-900 text-stone-100 dark:bg-white dark:text-stone-900 shadow-xl border border-white/10 dark:border-black/10 backdrop-blur-md flex items-center gap-1.5">
            <Sparkle size={10} className="text-[#7F95FF]" />
            <span>{themeLabel}</span>
          </div>
        </div>

        {/* General Settings Button */}
        <div className="relative group">
          <button
            onClick={onOpenSettings}
            className={clsx(
              "p-2 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer outline-none active:scale-95",
              isLight
                ? "text-stone-600 hover:text-stone-900 hover:bg-black/5"
                : "text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.06]"
            )}
            aria-label="Configurações Gerais"
          >
            <Settings size={16} className="stroke-[1.75] transition-transform duration-300 group-hover:rotate-45" />
          </button>

          {/* Floating Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 bg-stone-900 text-stone-100 dark:bg-white dark:text-stone-900 shadow-xl border border-white/10 dark:border-black/10 backdrop-blur-md">
            Configurações Gerais
          </div>
        </div>
      </div>
    </aside>
  );
};
