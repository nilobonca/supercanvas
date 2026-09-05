import React, { useState } from 'react';
import { useIDB } from '@/utils/indexedDB';
import { Music, Upload, X, Play, Pause, Check } from 'lucide-react';
import { AudioData } from '../../types';

interface SelectAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (audioData: AudioData) => void;
}

export const SelectAudioModal: React.FC<SelectAudioModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { savedAudios, saveAudio } = useIDB();
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioPreviewRef = React.useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const saved = await saveAudio(file);
      if (saved) {
        onSelect({
          audioId: saved.id,
          name: saved.name || file.name,
          url: saved.url,
          volume: 1,
          loop: false,
        });
        onClose();
      }
    } catch (err) {
      console.error('Erro ao salvar áudio:', err);
    }
  };

  const handleTogglePreview = (e: React.MouseEvent, id: number, url: string) => {
    e.stopPropagation();
    if (playingId === id) {
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      setPlayingId(null);
    } else {
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      const a = new Audio(url);
      a.play().catch(console.error);
      a.onended = () => setPlayingId(null);
      audioPreviewRef.current = a;
      setPlayingId(id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Adicionar Áudio</h3>
              <p className="text-[11px] text-neutral-400">Escolha da biblioteca ou envie um arquivo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload direto */}
        <label className="border-2 border-dashed border-neutral-800 hover:border-violet-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-violet-500/5 transition-all group">
          <div className="w-10 h-10 rounded-full bg-neutral-800 group-hover:bg-violet-600/20 text-neutral-400 group-hover:text-violet-400 flex items-center justify-center transition-colors">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-neutral-300 group-hover:text-white">
            Enviar arquivo do computador (.mp3, .wav, .ogg)
          </span>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        {/* Lista de áudios existentes */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-neutral-400">Biblioteca do Projeto</span>
          <div className="max-h-56 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {savedAudios.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-4">Nenhum áudio salvo na biblioteca ainda.</p>
            ) : (
              savedAudios.map((audio) => (
                <div
                  key={audio.id}
                  onClick={() => {
                    if (audioPreviewRef.current) audioPreviewRef.current.pause();
                    onSelect({
                      audioId: audio.id,
                      name: audio.name,
                      url: audio.url,
                      volume: 1,
                      loop: false,
                    });
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-xl bg-neutral-800/40 hover:bg-violet-600/15 border border-neutral-800 hover:border-violet-500/30 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <button
                      onClick={(e) => handleTogglePreview(e, audio.id, audio.url)}
                      className="w-7 h-7 rounded-lg bg-neutral-800 group-hover:bg-violet-600 text-neutral-300 group-hover:text-white flex items-center justify-center shrink-0 transition-colors"
                      title="Pré-escutar"
                    >
                      {playingId === audio.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-xs font-medium truncate text-neutral-300 group-hover:text-white">
                      {audio.name}
                    </span>
                  </div>
                  <button className="text-xs text-violet-400 font-medium px-2 py-1 rounded bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Usar</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
