import React from 'react';
import clsx from 'clsx';

export interface RibbonIconButtonProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  subtitle?: string;
  isSelected?: boolean;
  isLight: boolean;
  showActiveIndicator?: boolean;
  activeIndicatorTitle?: string;
  onClick?: () => void;
  onDragOver?: (e: React.DragEvent<HTMLButtonElement>) => void;
  role?: string;
  'aria-selected'?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const RibbonIconButton = React.forwardRef<HTMLDivElement, RibbonIconButtonProps>(({
  icon: Icon,
  label,
  subtitle,
  isSelected = false,
  isLight,
  showActiveIndicator = false,
  activeIndicatorTitle,
  onClick,
  onDragOver,
  role = 'tab',
  'aria-selected': ariaSelected,
  className,
  children,
}, ref) => {
  return (
    <div className={clsx("relative group", className)} ref={ref}>
      <button
        role={role}
        aria-selected={ariaSelected ?? isSelected}
        onClick={onClick}
        onDragOver={onDragOver}
        className={clsx(
          "relative p-1.5 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer outline-none",
          "active:scale-95 focus-visible:ring-2 focus-visible:ring-[#7F95FF]",
          isSelected
            ? isLight
              ? "bg-white text-[#1831D7] shadow-sm border border-black/10 font-bold"
              : "bg-white/[0.12] text-white shadow-[0_0_16px_rgba(127,149,255,0.15)] border border-[#7F95FF]/30"
            : isLight
              ? "text-stone-500 hover:text-stone-900 hover:bg-black/5"
              : "text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.06]"
        )}
        aria-label={label}
      >
        <Icon size={16} className={clsx("stroke-[1.75]", isSelected && "scale-105")} />

        {/* Active tab lateral highlight bar */}
        {isSelected && (
          <span 
            className="absolute -left-1.5 top-1 bottom-1 w-0.5 rounded-r-full bg-[#1831D7] dark:bg-[#7F95FF] shadow-[0_0_8px_rgba(127,149,255,0.8)]" 
          />
        )}

        {/* Luminous Green Active Indicator */}
        {showActiveIndicator && (
          <span 
            className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-[#131524] shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" 
            title={activeIndicatorTitle}
          />
        )}
      </button>

      {/* Floating Tooltip */}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium tracking-normal whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-50 bg-stone-900/95 text-stone-100 dark:bg-white/95 dark:text-stone-900 shadow-xl border border-white/10 dark:border-black/10 backdrop-blur-md flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 font-bold">
          <span>{label}</span>
          {showActiveIndicator && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </div>
        {subtitle && (
          <span className="text-[10px] text-stone-400 dark:text-neutral-500 font-normal">
            {subtitle}
          </span>
        )}
      </div>

      {children}
    </div>
  );
});

RibbonIconButton.displayName = 'RibbonIconButton';
