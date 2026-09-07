import React from 'react';
import { Settings, Sun, Moon, Sparkle } from 'lucide-react';
import clsx from 'clsx';

export interface RibbonFooterProps {
  isLight: boolean;
  themeLabel?: string;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  settingsTooltip?: string;
}

export const RibbonFooter: React.FC<RibbonFooterProps> = ({
  isLight,
  themeLabel,
  onToggleTheme,
  onOpenSettings,
  settingsTooltip = 'Configurações Gerais',
}) => {
  const ThemeIcon = isLight ? Sun : Moon;
  const label = themeLabel || (isLight ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro');

  return (
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
          <span>{label}</span>
        </div>
      </div>

      {/* Settings Button */}
      <div className="relative group">
        <button
          onClick={onOpenSettings}
          className={clsx(
            "p-2 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer outline-none active:scale-95",
            isLight
              ? "text-stone-600 hover:text-stone-900 hover:bg-black/5"
              : "text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.06]"
          )}
          aria-label={settingsTooltip}
        >
          <Settings size={16} className="stroke-[1.75] transition-transform duration-300 group-hover:rotate-45" />
        </button>

        {/* Floating Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 bg-stone-900 text-stone-100 dark:bg-white dark:text-stone-900 shadow-xl border border-white/10 dark:border-black/10 backdrop-blur-md">
          {settingsTooltip}
        </div>
      </div>
    </div>
  );
};
