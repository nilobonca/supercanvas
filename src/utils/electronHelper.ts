/**
 * RPGSA Electron Safe Integration Helper
 * Safely guards against browser environments where window.electronAPI is undefined.
 */

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);
};

export const getAppVersion = async (): Promise<string | null> => {
  if (typeof window !== 'undefined' && window.electronAPI?.getAppVersion) {
    try {
      return await window.electronAPI.getAppVersion();
    } catch (err) {
      console.warn('[RPGSA] getAppVersion error:', err);
    }
  }
  return null;
};

export const setWindowMode = async (mode: 'launcher' | 'workspace'): Promise<boolean> => {
  if (typeof window !== 'undefined' && window.electronAPI?.setWindowMode) {
    try {
      return await window.electronAPI.setWindowMode(mode);
    } catch (err) {
      console.warn('[RPGSA] Electron setWindowMode error:', err);
    }
  }
  return false;
};

export const setWindowSize = async (width: number, height: number): Promise<boolean> => {
  if (typeof window !== 'undefined' && window.electronAPI?.setWindowSize) {
    try {
      return await window.electronAPI.setWindowSize(width, height);
    } catch (err) {
      console.warn('[RPGSA] Electron setWindowSize error:', err);
    }
  }
  return false;
};

export const minimizeWindow = (): void => {
  if (typeof window !== 'undefined' && window.electronAPI?.minimize) {
    window.electronAPI.minimize();
  }
};

export const maximizeWindow = (): void => {
  if (typeof window !== 'undefined' && window.electronAPI?.maximize) {
    window.electronAPI.maximize();
  }
};

export const closeWindow = (): void => {
  if (typeof window !== 'undefined' && window.electronAPI?.close) {
    window.electronAPI.close();
  }
};

export const isWindowMaximized = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && window.electronAPI?.isMaximized) {
    try {
      return await window.electronAPI.isMaximized();
    } catch (err) {
      console.warn('[RPGSA] isMaximized error:', err);
    }
  }
  return false;
};

export const subscribeToMaximizedChange = (callback: (isMaximized: boolean) => void): (() => void) => {
  if (typeof window !== 'undefined' && window.electronAPI?.onMaximizedChange) {
    return window.electronAPI.onMaximizedChange(callback);
  }
  return () => {};
};

export const trashItem = async (filePath: string): Promise<{ success: boolean; error?: string }> => {
  if (typeof window !== 'undefined' && window.electronAPI?.trashItem) {
    try {
      return await window.electronAPI.trashItem(filePath);
    } catch (err: any) {
      console.warn('[RPGSA] trashItem error:', err);
      return { success: false, error: err?.message || 'Falha ao mover para a lixeira' };
    }
  }
  return { success: false, error: 'Electron não disponível' };
};

export const getPathForFile = (file: File): string => {
  if (typeof window !== 'undefined' && window.electronAPI?.getPathForFile) {
    try {
      return window.electronAPI.getPathForFile(file) || '';
    } catch {
      return (file as any)?.path || '';
    }
  }
  return (file as any)?.path || '';
};

