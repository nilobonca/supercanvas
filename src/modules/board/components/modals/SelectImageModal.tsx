import React from 'react';
import { useIDB } from '@/utils/indexedDB';
import { Image as ImageIcon, Upload, X, Check } from 'lucide-react';
import { ImageData } from '../../types';

interface SelectImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageData: ImageData) => void;
}

export const SelectImageModal: React.FC<SelectImageModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { savedImages, saveImage } = useIDB();

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let base64: string | undefined;
      try {
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } catch (readErr) {
        console.warn('Erro ao ler base64 da imagem:', readErr);
      }

      const saved = await saveImage(file);
      if (saved) {
        onSelect({
          imageId: saved.id,
          name: saved.name || file.name,
          src: base64 || saved.url,
          base64,
        });
        onClose();
      }
    } catch (err) {
      console.error('Erro ao salvar imagem:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#14141B] border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 text-stone-900 dark:text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/40 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-white">Adicionar Imagem</h3>
              <p className="text-[11px] text-stone-500 dark:text-neutral-400">Escolha da galeria ou envie uma foto</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-100 dark:hover:bg-white/10 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload direto */}
        <label className="border-2 border-dashed border-stone-200 dark:border-white/10 hover:border-sky-400 dark:hover:border-sky-500/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-stone-50/50 dark:bg-white/[0.02] hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-all group">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 group-hover:bg-sky-100 dark:group-hover:bg-sky-600/20 text-stone-400 dark:text-neutral-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 flex items-center justify-center transition-colors shadow-xs">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-stone-700 dark:text-neutral-300 group-hover:text-sky-600 dark:group-hover:text-white transition-colors">
            Enviar imagem do computador (PNG, JPG, WebP)
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        {/* Galeria de imagens salvas */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-stone-700 dark:text-neutral-400">Imagens Salvas</span>
          <div className="max-h-56 overflow-y-auto grid grid-cols-3 gap-2 pr-1 custom-scrollbar">
            {savedImages.length === 0 ? (
              <p className="col-span-3 text-xs text-stone-400 dark:text-neutral-500 text-center py-4">Nenhuma imagem salva ainda.</p>
            ) : (
              savedImages.map((img) => (
                <div
                  key={img.id}
                  onClick={async () => {
                    let base64: string | undefined;
                    if (img.file) {
                      try {
                        base64 = await new Promise<string>((resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result as string);
                          reader.onerror = reject;
                          reader.readAsDataURL(img.file);
                        });
                      } catch {}
                    }
                    onSelect({
                      imageId: img.id,
                      name: img.name,
                      src: base64 || img.url,
                      base64,
                    });
                    onClose();
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-stone-200 dark:border-white/10 hover:border-sky-500 cursor-pointer transition-all bg-stone-100 dark:bg-neutral-800/40 shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
