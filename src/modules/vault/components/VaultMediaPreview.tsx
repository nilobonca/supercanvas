import React, { useEffect, useState, useRef } from 'react';
import { useVaultStore } from '../hooks/useVaultStore';
import { Music, Image as ImageIcon, Play, Pause, Volume2, Repeat, Download, RefreshCw } from 'lucide-react';
import { AudioVisualizer } from '@/components/ui/AudioVisualizer';
import clsx from 'clsx';

interface VaultMediaPreviewProps {
  path: string;
  type: 'audio' | 'image';
}

export const VaultMediaPreview: React.FC<VaultMediaPreviewProps> = ({ path, type }) => {
  const { getFileUrl } = useVaultStore();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoop, setIsLoop] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fileName = path.split('/').pop() || 'Arquivo de mídia';

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    getFileUrl(path)
      .then((objectUrl) => {
        if (!isCancelled) {
          setUrl(objectUrl);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Erro ao carregar URL do arquivo de mídia:', err);
          setError('Não foi possível carregar a pré-visualização do arquivo.');
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [path, getFileUrl]);

  useEffect(() => {
    if (type === 'audio' && url) {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.loop = isLoop;
      audio.onloadedmetadata = () => setDuration(audio.duration || 0);
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime || 0);
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;

      return () => {
        audio.pause();
        audio.src = '';
        audioRef.current = null;
      };
    }
  }, [type, url]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = isLoop;
    }
  }, [volume, isLoop]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) audioRef.current.currentTime = target;
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 gap-2 p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-[#7F95FF]" />
        <span className="text-xs">Carregando mídia...</span>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-red-400 gap-2 p-8 text-center">
        <p className="text-sm font-semibold">{error || 'Arquivo inacessível.'}</p>
        <span className="text-xs text-neutral-500">{path}</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden bg-neutral-950 select-none">
      <div className="w-full max-w-xl bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-6">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5 truncate">
            {type === 'audio' ? (
              <Music className="w-5 h-5 text-cyan-400 shrink-0" />
            ) : (
              <ImageIcon className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div className="truncate">
              <h3 className="text-sm font-semibold text-neutral-100 truncate">{fileName}</h3>
              <p className="text-[11px] text-neutral-400 font-mono truncate">{path}</p>
            </div>
          </div>
          <a
            href={url}
            download={fileName}
            className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-100 transition-colors"
            title="Baixar arquivo"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>

        {/* Content Preview */}
        {type === 'image' ? (
          <div className="relative max-h-[60vh] max-w-full overflow-hidden rounded-xl border border-neutral-800/60 bg-black/40 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={fileName}
              className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
            />
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4 py-4">
            <div className="flex items-center justify-center py-4">
              <AudioVisualizer isPlaying={isPlaying} barCount={24} color="rgb(6, 182, 212)" />
            </div>

            {/* Play controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-0.5" />}
              </button>

              <div className="flex-1 flex flex-col gap-1.5">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <button
                onClick={() => setIsLoop(!isLoop)}
                className={clsx(
                  "p-2 rounded-lg transition-colors shrink-0",
                  isLoop ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40" : "text-neutral-400 hover:text-neutral-200"
                )}
                title={isLoop ? "Loop Ativado" : "Ativar Loop"}
              >
                <Repeat className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 shrink-0" title={`Volume: ${Math.round(volume * 100)}%`}>
                <Volume2 className="w-4 h-4 text-neutral-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
