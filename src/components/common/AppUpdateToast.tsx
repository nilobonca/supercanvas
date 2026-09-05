import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, CheckCircle2, AlertCircle, X, ArrowUpCircle } from 'lucide-react';
import { UpdateStatusPayload } from '@/interfaces/electron';

export const AppUpdateToast: React.FC = () => {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatusPayload | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI?.onUpdateStatus) {
      return;
    }

    const unsubscribe = window.electronAPI.onUpdateStatus((payload: UpdateStatusPayload) => {
      setUpdateStatus(payload);

      if (payload.status === 'downloading' || payload.status === 'downloaded' || payload.status === 'available') {
        setIsVisible(true);
        setDismissed(false);
      } else if (payload.status === 'error' && isVisible) {
        // Auto-hide error after 6 seconds
        const timer = setTimeout(() => setIsVisible(false), 6000);
        return () => clearTimeout(timer);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isVisible]);

  if (typeof window === 'undefined' || !window.electronAPI || !isVisible || dismissed || !updateStatus) {
    return null;
  }

  const handleRestart = () => {
    window.electronAPI?.quitAndInstall();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="fixed bottom-5 right-5 z-[99999] max-w-sm w-full select-none"
      >
        <div className="bg-stone-900/95 dark:bg-neutral-900/95 text-white backdrop-blur-xl border border-stone-700/60 dark:border-white/15 rounded-2xl shadow-2xl p-4 overflow-hidden relative">
          {/* Subtle gradient glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                {updateStatus.status === 'downloaded' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : updateStatus.status === 'downloading' ? (
                  <Download className="w-5 h-5 text-purple-400 animate-bounce" />
                ) : updateStatus.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-purple-400" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold tracking-tight text-stone-100 flex items-center gap-1.5">
                  {updateStatus.status === 'downloaded' && 'Atualização Pronta!'}
                  {updateStatus.status === 'downloading' && 'Baixando Nova Versão...'}
                  {updateStatus.status === 'available' && 'Nova Versão Disponível'}
                  {updateStatus.status === 'error' && 'Falha na Atualização'}
                  {updateStatus.version && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-purple-300">
                      v{updateStatus.version}
                    </span>
                  )}
                </h4>
                <p className="text-xs text-stone-400 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  {updateStatus.status === 'downloaded' && 'Reinicie agora para aplicar as melhorias e novos recursos.'}
                  {updateStatus.status === 'downloading' && `${updateStatus.percent || 0}% concluído em segundo plano.`}
                  {updateStatus.status === 'available' && 'Uma versão mais recente está sendo transferida.'}
                  {updateStatus.status === 'error' && (updateStatus.message || 'Não foi possível baixar a atualização.')}
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar for Downloading */}
          {updateStatus.status === 'downloading' && (
            <div className="mt-3 w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${updateStatus.percent || 5}%` }}
                transition={{ ease: 'easeOut', duration: 0.3 }}
              />
            </div>
          )}

          {/* Action buttons */}
          {updateStatus.status === 'downloaded' && (
            <div className="mt-3.5 flex items-center justify-end gap-2 pt-1">
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Depois
              </button>
              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowUpCircle className="w-3.5 h-3.5" />
                Reiniciar Agora
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
