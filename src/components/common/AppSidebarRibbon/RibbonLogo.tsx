import React from 'react';
import Link from 'next/link';
import { ConchaLogo } from '@/components/common/ConchaLogo';

export interface RibbonLogoProps {
  theme: string;
}

export const RibbonLogo: React.FC<RibbonLogoProps> = ({ theme }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Link
        href="/"
        className="relative group cursor-pointer"
        title="Concha"
      >
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
      </Link>

      {/* Separador sutil abaixo do Logo Concha */}
      <div className="w-5 h-px bg-black/[0.08] dark:bg-white/[0.08] my-0.5" />
    </div>
  );
};
