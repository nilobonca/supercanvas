import React, { useState, useEffect } from 'react';
import { useVaultStore } from '../hooks/useVaultStore';
import { getUserTemplates, deleteUserTemplate, VaultTemplate } from '../utils/templateStore';
import { LayoutTemplate, X, ChevronRight, Trash2, Plus, FileText, Sparkles } from 'lucide-react';

interface VaultTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VaultTemplateModal: React.FC<VaultTemplateModalProps> = ({ isOpen, onClose }) => {
  const { provider, refreshNodes, openDocument } = useVaultStore();
  const [templates, setTemplates] = useState<VaultTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<VaultTemplate | null>(null);
  const [noteTitle, setNoteTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTemplates(getUserTemplates());
      setSelectedTemplate(null);
      setNoteTitle('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Deseja realmente excluir este template?')) {
      deleteUserTemplate(id);
      setTemplates(getUserTemplates());
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
    }
  };

  const handleCreate = async () => {
    if (!selectedTemplate || !noteTitle.trim() || !provider) return;

    try {
      const cleanTitle = noteTitle.trim().replace(/\.md$/, '');
      const filePath = `${cleanTitle}.md`;
      const content = selectedTemplate.content;

      await provider.createDocument(filePath, content);
      await refreshNodes();
      await openDocument(filePath);

      setSelectedTemplate(null);
      setNoteTitle('');
      onClose();
    } catch (err) {
      console.error('Failed to create document from template:', err);
      alert('Erro ao criar nota a partir do template.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#14141B] border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-stone-900 dark:text-neutral-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-white/10 flex items-center justify-between bg-stone-50/50 dark:bg-black/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1831D7]/10 border border-[#7F95FF]/30 flex items-center justify-center text-[#1831D7] dark:text-[#7F95FF]">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-neutral-100">Modelos de Notas (Templates)</h3>
              <p className="text-[11px] text-stone-500 dark:text-neutral-400">Crie novas anotações a partir de modelos salvos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 dark:hover:bg-white/10 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedTemplate ? (
            templates.length === 0 ? (
              <div className="py-8 px-4 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[#1831D7]/10 border border-[#7F95FF]/30 flex items-center justify-center text-[#1831D7] dark:text-[#7F95FF] mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-stone-800 dark:text-neutral-200 mb-1">Nenhum template salvo</h4>
                <p className="text-xs text-stone-500 dark:text-neutral-400 max-w-xs mb-4 leading-relaxed">
                  Abra qualquer nota no Vault e clique em <strong>"Tornar Template"</strong> ou use o botão direito na barra lateral para salvar seu primeiro modelo.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 text-stone-700 dark:text-neutral-200 transition-colors cursor-pointer"
                >
                  Entendi
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {templates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      setNoteTitle('');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/5 border border-stone-200/90 dark:border-white/10 hover:border-[#7F95FF]/60 dark:hover:border-[#7F95FF]/40 hover:bg-stone-50 dark:hover:bg-white/[0.08] cursor-pointer transition-all shadow-xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#1831D7]/10 border border-[#7F95FF]/30 flex items-center justify-center text-[#1831D7] dark:text-[#7F95FF] shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-stone-800 dark:text-neutral-200 group-hover:text-[#1831D7] dark:group-hover:text-[#7F95FF] transition-colors truncate">
                          {tmpl.name}
                        </h4>
                        <span className="text-[10px] text-stone-400 dark:text-neutral-500">
                          Criado em {new Date(tmpl.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleDelete(e, tmpl.id)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-400 hover:text-rose-600 rounded-md transition-all cursor-pointer"
                        title="Excluir este template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#1831D7] dark:group-hover:text-[#7F95FF] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1831D7]/10 border border-[#7F95FF]/30">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 border border-[#7F95FF]/30 flex items-center justify-center text-[#1831D7] dark:text-[#7F95FF] shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#1831D7] dark:text-[#7F95FF]">{selectedTemplate.name}</h4>
                  <span className="text-[11px] text-[#7F95FF] dark:text-[#B4D3F1]">Modelo selecionado</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-neutral-300 mb-1.5">
                  Nome da Nova Nota
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Ex: Minha Nova Anotação"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                  }}
                  className="w-full bg-white dark:bg-black/30 border border-stone-200 dark:border-white/10 rounded-lg px-3.5 py-2 text-xs text-stone-900 dark:text-neutral-100 placeholder-stone-400 dark:placeholder-neutral-500 outline-none focus:border-[#7F95FF] transition-colors shadow-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!noteTitle.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-[#1831D7] hover:bg-[#1831D7]/90 text-white shadow-xs disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Criar Nota com Template
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
