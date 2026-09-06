import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'light' | 'dark';

type ThemeState = {
  theme: ThemeType;
  isSettingsOpen: boolean;
  audioVizEnabled: boolean;
  audioVizColor: string;
  audioVizIntensity: number; // 0.0 to 2.0, default 1.0
  areaRippleEnabled: boolean;
  pinnedMinigames: string[];
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setAudioVizEnabled: (enabled: boolean) => void;
  setAudioVizColor: (color: string) => void;
  setAudioVizIntensity: (intensity: number) => void;
  setAreaRippleEnabled: (enabled: boolean) => void;
  togglePinnedMinigame: (minigameId: string) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      isSettingsOpen: false,
      audioVizEnabled: true,
      audioVizColor: '#7F95FF',
      audioVizIntensity: 1.0,
      areaRippleEnabled: true,
      pinnedMinigames: [], 
      setTheme: (theme) => set({ theme: theme === 'light' ? 'light' : 'dark' }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      setAudioVizEnabled: (enabled) => set({ audioVizEnabled: enabled }),
      setAudioVizColor: (color) => set({ audioVizColor: color }),
      setAudioVizIntensity: (intensity) => set({ audioVizIntensity: intensity }),
      setAreaRippleEnabled: (enabled) => set({ areaRippleEnabled: enabled }),
      togglePinnedMinigame: (id) => set((state) => ({
        pinnedMinigames: state.pinnedMinigames.includes(id)
          ? state.pinnedMinigames.filter(m => m !== id)
          : [...state.pinnedMinigames, id]
      })),
    }),
    {
      name: 'vsd-theme-storage',
      // Garante migração automática de temas antigos ('ethereal', 'cyber', etc.) para 'dark'
      migrate: (persistedState: any) => {
        if (persistedState && persistedState.theme !== 'light') {
          persistedState.theme = 'dark';
        }
        return persistedState as ThemeState;
      }
    }
  )
);
