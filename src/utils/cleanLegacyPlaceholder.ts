/**
 * Sanitiza e remove permanentemente qualquer resquício do texto placeholder
 * "Nota vazia. Clique na caneta acima para editar." e suas variações em Markdown ou HTML.
 */
export function cleanLegacyPlaceholder(content?: string): string {
  if (!content) return '';
  return content
    .replace(/<([a-zA-Z0-9]+)[^>]*>[\s\S]*?Nota vazia[\s\S]*?<\/\1>/gi, '')
    .replace(/<([a-zA-Z0-9]+)[^>]*>[\s\S]*?Clique na caneta[\s\S]*?<\/\1>/gi, '')
    .replace(/[*_~`>#]*\s*Nota vazia\.?\s*Clique na caneta acima para editar\.?\s*[*_~`>]*/gi, '')
    .replace(/Nota vazia\.?\s*Clique na caneta acima para editar\.?/gi, '')
    .replace(/Nota vazia\.?/gi, '')
    .replace(/Clique na caneta acima para editar\.?/gi, '')
    .trim();
}
