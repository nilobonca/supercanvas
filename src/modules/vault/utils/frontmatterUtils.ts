import yaml from 'js-yaml';

export interface ParsedDocument {
  data: Record<string, any>;
  content: string;
  hasFrontmatter: boolean;
}

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/;

/**
 * Parses frontmatter YAML block from the beginning of a markdown document
 */
export function parseFrontmatter(raw: string): ParsedDocument {
  if (!raw) return { data: {}, content: '', hasFrontmatter: false };

  const match = raw.match(FRONTMATTER_REGEX);
  if (!match) {
    return { data: {}, content: raw, hasFrontmatter: false };
  }

  try {
    const rawYaml = match[1];
    const parsed = (yaml.load(rawYaml) as Record<string, any>) || {};
    const content = raw.slice(match[0].length);
    return {
      data: typeof parsed === 'object' && parsed !== null ? parsed : {},
      content,
      hasFrontmatter: true,
    };
  } catch (err) {
    console.warn('Failed to parse YAML frontmatter:', err);
    return { data: {}, content: raw, hasFrontmatter: false };
  }
}

/**
 * Serializes data object and markdown content back into markdown with frontmatter
 */
export function stringifyFrontmatter(data: Record<string, any>, content: string): string {
  const cleanData: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined && val !== null && val !== '') {
      if (Array.isArray(val) && val.length === 0) continue;
      cleanData[key] = val;
    }
  }

  if (Object.keys(cleanData).length === 0) {
    return content.trimStart();
  }

  try {
    const yamlString = yaml.dump(cleanData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      skipInvalid: true,
    }).trim();

    return `---\n${yamlString}\n---\n\n${content.trimStart()}`;
  } catch (err) {
    console.warn('Failed to serialize YAML frontmatter:', err);
    return content;
  }
}
