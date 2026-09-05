import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X, Tag, Hash, Calendar, CheckSquare, Type, Trash2 } from 'lucide-react';

interface VaultFrontmatterEditorProps {
  data: Record<string, any>;
  onChange: (newData: Record<string, any>) => void;
}

export const VaultFrontmatterEditor: React.FC<VaultFrontmatterEditorProps> = ({ data, onChange }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newPropKey, setNewPropKey] = useState('');
  const [newPropType, setNewPropType] = useState<'text' | 'number' | 'checkbox' | 'date'>('text');
  const [isAddingProp, setIsAddingProp] = useState(false);

  const tags: string[] = Array.isArray(data.tags)
    ? data.tags
    : typeof data.tags === 'string'
    ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const aliases: string[] = Array.isArray(data.aliases)
    ? data.aliases
    : typeof data.aliases === 'string'
    ? data.aliases.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      const updatedTags = [...tags, trimmed];
      onChange({ ...data, tags: updatedTags });
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(t => t !== tagToRemove);
    onChange({ ...data, tags: updatedTags });
  };

  const handleAddProp = () => {
    const key = newPropKey.trim();
    if (!key || data[key] !== undefined) return;

    let defaultVal: any = '';
    if (newPropType === 'number') defaultVal = 0;
    if (newPropType === 'checkbox') defaultVal = false;
    if (newPropType === 'date') defaultVal = new Date().toISOString().split('T')[0];

    onChange({ ...data, [key]: defaultVal });
    setNewPropKey('');
    setIsAddingProp(false);
  };

  const handleUpdateProp = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleDeleteProp = (key: string) => {
    const next = { ...data };
    delete next[key];
    onChange(next);
  };

  // Filter out keys already handled specifically (tags, aliases)
  const customKeys = Object.keys(data).filter(k => k !== 'tags' && k !== 'aliases');
  const totalPropsCount = (tags.length > 0 ? 1 : 0) + (aliases.length > 0 ? 1 : 0) + customKeys.length;

  return (
    <div className="mb-6 rounded-xl border border-stone-200/80 dark:border-white/10 bg-stone-50/60 dark:bg-white/[0.02] p-3 text-xs">
      {/* Header / Toggle */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none py-1 group"
      >
        <div className="flex items-center gap-2 text-stone-600 dark:text-neutral-400 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span>Propriedades (Frontmatter)</span>
          {totalPropsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-white/10 text-[10px] font-mono">
              {totalPropsCount}
            </span>
          )}
        </div>

        {isOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAddingProp(true);
            }}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-stone-200/70 dark:hover:bg-white/10 text-stone-500 hover:text-stone-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Adicionar propriedade</span>
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="mt-3 space-y-2.5 pt-2 border-t border-stone-200/60 dark:border-white/5">
          {/* Tags */}
          <div className="flex items-start gap-3">
            <div className="w-24 shrink-0 flex items-center gap-1.5 text-stone-500 dark:text-neutral-400 pt-1 font-medium">
              <Tag className="w-3.5 h-3.5" />
              <span>Tags</span>
            </div>
            <div className="flex-1 flex flex-wrap items-center gap-1.5">
              {tags.map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 text-[11px]"
                >
                  <Hash className="w-3 h-3 opacity-60" />
                  {tag}
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-500 p-0.5 rounded"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}

              {isAddingTag ? (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="nova-tag"
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddTag();
                      if (e.key === 'Escape') setIsAddingTag(false);
                    }}
                    onBlur={handleAddTag}
                    className="bg-white dark:bg-black/40 border border-purple-400 rounded px-2 py-0.5 text-[11px] outline-none w-24 text-stone-800 dark:text-neutral-200"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingTag(true)}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-dashed border-stone-300 dark:border-white/20 hover:border-purple-400 text-stone-400 hover:text-purple-600 dark:hover:text-purple-300 text-[11px] transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>tag</span>
                </button>
              )}
            </div>
          </div>

          {/* Custom Properties */}
          {customKeys.map(key => {
            const val = data[key];
            const isBool = typeof val === 'boolean';
            const isNum = typeof val === 'number';

            return (
              <div key={key} className="flex items-center gap-3 group/prop">
                <div className="w-24 shrink-0 flex items-center gap-1.5 text-stone-500 dark:text-neutral-400 font-medium truncate" title={key}>
                  {isBool ? <CheckSquare className="w-3.5 h-3.5" /> : isNum ? <Hash className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
                  <span className="truncate">{key}</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  {isBool ? (
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={e => handleUpdateProp(key, e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  ) : isNum ? (
                    <input
                      type="number"
                      value={val}
                      onChange={e => handleUpdateProp(key, parseFloat(e.target.value) || 0)}
                      className="bg-white dark:bg-black/30 border border-stone-200 dark:border-white/10 rounded px-2 py-0.5 text-xs outline-none focus:border-purple-400 text-stone-800 dark:text-neutral-200 w-32"
                    />
                  ) : (
                    <input
                      type="text"
                      value={val || ''}
                      onChange={e => handleUpdateProp(key, e.target.value)}
                      className="bg-white dark:bg-black/30 border border-stone-200 dark:border-white/10 rounded px-2 py-0.5 text-xs outline-none focus:border-purple-400 text-stone-800 dark:text-neutral-200 flex-1 max-w-sm"
                    />
                  )}
                  <button
                    onClick={() => handleDeleteProp(key)}
                    className="opacity-0 group-hover/prop:opacity-100 p-1 hover:text-rose-500 text-stone-400 rounded transition-opacity"
                    title="Remover propriedade"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add property form modal/inline */}
          {isAddingProp && (
            <div className="flex items-center gap-2 pt-2 border-t border-stone-200/40 dark:border-white/5 animate-in fade-in duration-100">
              <input
                type="text"
                autoFocus
                placeholder="Nome da propriedade"
                value={newPropKey}
                onChange={e => setNewPropKey(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddProp();
                  if (e.key === 'Escape') setIsAddingProp(false);
                }}
                className="bg-white dark:bg-black/40 border border-purple-400 rounded px-2 py-1 text-xs outline-none text-stone-800 dark:text-neutral-200 w-40"
              />
              <select
                value={newPropType}
                onChange={e => setNewPropType(e.target.value as any)}
                className="bg-white dark:bg-[#16161D] border border-stone-200 dark:border-white/10 rounded px-2 py-1 text-xs text-stone-700 dark:text-neutral-300 outline-none"
              >
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="checkbox">Caixa de Seleção</option>
                <option value="date">Data</option>
              </select>
              <button
                onClick={handleAddProp}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium"
              >
                Adicionar
              </button>
              <button
                onClick={() => setIsAddingProp(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
