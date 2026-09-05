import { v4 as uuidv4 } from 'uuid';

export interface VaultTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  createdAt: number;
}

const TEMPLATES_STORAGE_KEY = 'vault_custom_user_templates';

export function getUserTemplates(): VaultTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load user templates:', err);
    return [];
  }
}

export function saveUserTemplate(data: { name: string; content: string; description?: string }): VaultTemplate {
  const templates = getUserTemplates();
  const newTemplate: VaultTemplate = {
    id: uuidv4(),
    name: data.name.trim(),
    description: data.description?.trim() || '',
    content: data.content,
    createdAt: Date.now(),
  };

  // Replace if same name or add new
  const index = templates.findIndex(t => t.name.toLowerCase() === newTemplate.name.toLowerCase());
  if (index >= 0) {
    templates[index] = newTemplate;
  } else {
    templates.unshift(newTemplate);
  }

  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Failed to save user template:', err);
  }

  return newTemplate;
}

export function deleteUserTemplate(id: string): void {
  const templates = getUserTemplates().filter(t => t.id !== id);
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Failed to delete user template:', err);
  }
}
