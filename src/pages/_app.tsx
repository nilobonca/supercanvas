import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import { IDBProvider } from "@/utils/indexedDB";
import { LogSystemProvider } from "@/utils/logSystem";
import { ThemeProvider } from "@/components/theme-provider";
import type { AppProps } from "next/app";

import { useEffect, useState } from "react";
import { FeedbackWidget } from "@/components/Feedback/FeedbackWidget";
import { AppUpdateToast } from "@/components/common/AppUpdateToast";
import { PollsProvider } from "@/contexts/PollsContext";
import { useThemeStore } from "@/store/themeStore";
import { SettingsModal } from "@/components/SettingsModal/SettingsModal";
import clsx from "clsx";

export default function App({ Component, pageProps }: AppProps) {
  const { theme, isSettingsOpen, setIsSettingsOpen } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);

    // Electron Global Hotkeys Listener
    let unsubMute: (() => void) | undefined;
    let unsubTrigger: (() => void) | undefined;

    if (typeof window !== 'undefined' && window.electronAPI) {
      unsubMute = window.electronAPI.onMuteAll(() => {
        document.querySelectorAll('audio').forEach((el) => {
          if (!el.paused) el.pause();
        });
      });

      unsubTrigger = window.electronAPI.onSoundboardTrigger((slot) => {
        const soundboardBtns = document.querySelectorAll('[data-soundboard-slot]');
        if (soundboardBtns[slot - 1]) {
          (soundboardBtns[slot - 1] as HTMLElement).click();
        }
      });
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      unsubMute?.();
      unsubTrigger?.();
    };
  }, []);

  const activeTheme = mounted ? theme : 'dark';

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'ethereal', 'grimdark', 'cyber', 'taverna');
    if (activeTheme === 'ethereal' || activeTheme === 'grimdark' || activeTheme === 'cyber' || activeTheme === 'taverna') {
      root.classList.add('dark', activeTheme);
    } else if (activeTheme === 'dark' || activeTheme === 'default') {
      root.classList.add('dark');
    } else if (activeTheme === 'light') {
      root.classList.add('light');
    }
  }, [activeTheme, mounted]);

  return (
    <LogSystemProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <PollsProvider>
            <IDBProvider>
              <div className={clsx(
                "w-screen h-screen overflow-hidden flex flex-col transition-colors duration-300", 
                activeTheme,
                activeTheme === 'light' ? 'bg-[#FAF9F6] text-[#1C1917]' : 
                activeTheme === 'dark' || activeTheme === 'default' ? 'bg-[#0F0F13] text-[#F4F4F6]' : ''
              )}>
                <div className="flex-1 w-full h-full overflow-hidden relative">
                  <Component {...pageProps} />
                </div>
                <FeedbackWidget />
                <AppUpdateToast />
                
                {mounted && (
                  <>
                    <SettingsModal 
                      isOpen={isSettingsOpen} 
                      onClose={() => setIsSettingsOpen(false)} 
                    />
                  </>
                )}
              </div>
            </IDBProvider>
        </PollsProvider>
      </ThemeProvider>
    </LogSystemProvider>
  );
}
