import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const markdownRevealPluginKey = new PluginKey('markdownSyntaxReveal');

export const MarkdownSyntaxReveal = Extension.create({
  name: 'markdownSyntaxReveal',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: markdownRevealPluginKey,
        props: {
          decorations(state) {
            try {
              const { doc, selection } = state;
              const { $from } = selection;
              const decorations: Decoration[] = [];

              // Native, safe focus check directly from the TipTap editor instance
              const isFocused = editor ? editor.isFocused : true;
              const selFrom = isFocused ? selection.from : -999;
              const selTo = isFocused ? selection.to : -999;

              // 1. Heading & Blockquote syntax markers reveal (# , ## , ### , > ) - only when focused!
              if (isFocused) {
                let depth = $from.depth;
                while (depth > 0) {
                  const node = $from.node(depth);
                  if (node.type.name === 'heading') {
                    const startPos = $from.start(depth);
                    const level = node.attrs.level || 1;
                    const markerText = '#'.repeat(level) + ' ';

                    const firstText = node.firstChild?.text || '';
                    if (!firstText.startsWith('#'.repeat(level))) {
                      decorations.push(
                        Decoration.widget(startPos, () => {
                          const span = document.createElement('span');
                          span.className = 'md-raw-syntax text-violet-400 font-mono font-medium select-none mr-1.5 opacity-80 text-sm';
                          span.textContent = markerText;
                          return span;
                        }, { side: -1 })
                      );
                    }
                    break;
                  } else if (node.type.name === 'blockquote') {
                    const startPos = $from.start(depth);
                    decorations.push(
                      Decoration.widget(startPos, () => {
                        const span = document.createElement('span');
                        span.className = 'md-raw-syntax text-violet-400 font-mono font-medium select-none mr-1 opacity-80';
                        span.textContent = '> ';
                        return span;
                      }, { side: -1 })
                    );
                    break;
                  }
                  depth--;
                }
              }

              // 2. Wikilinks Real Brackets Editing & Live Preview Syntax Hiding
              doc.descendants((node, pos) => {
                if (!node.isTextblock) return;

                const text = node.textBetween(0, node.content.size, undefined, '\0');
                const regex = /\[\[([^[\]|]+)(?:\|([^\]]+))?\]\]/g;
                let match;

                while ((match = regex.exec(text)) !== null) {
                  const matchStart = pos + 1 + match.index;
                  const matchEnd = matchStart + match[0].length;
                  const targetTitle = match[1].trim();
                  const alias = match[2] ? match[2].trim() : null;

                  // Check if cursor/selection is touching or inside this wikilink
                  const isEditingThisLink = isFocused && (selFrom <= matchEnd && selTo >= matchStart);

                  if (isEditingThisLink) {
                    // USER IS EDITING THIS WIKILINK:
                    // The brackets [[ and ]] are 100% REAL editable characters!
                    decorations.push(
                      Decoration.inline(matchStart, matchEnd, {
                        class: 'md-wikilink-raw-editing'
                      })
                    );
                  } else {
                    // USER IS NOT EDITING THIS WIKILINK:
                    // Hide [[ and ]], render the note title as a clean badge!
                    if (!alias) {
                      // [[Title]]
                      decorations.push(
                        Decoration.inline(matchStart, matchStart + 2, {
                          class: 'md-hidden-bracket'
                        })
                      );
                      if (matchEnd - 2 > matchStart + 2) {
                        decorations.push(
                          Decoration.inline(matchStart + 2, matchEnd - 2, {
                            class: 'vault-wikilink',
                            'data-wikilink-title': targetTitle
                          })
                        );
                      }
                      decorations.push(
                        Decoration.inline(matchEnd - 2, matchEnd, {
                          class: 'md-hidden-bracket'
                        })
                      );
                    } else {
                      // [[Title|Alias]]
                      const pipeIdx = match[0].indexOf('|');
                      decorations.push(
                        Decoration.inline(matchStart, matchStart + pipeIdx + 1, {
                          class: 'md-hidden-bracket'
                        })
                      );
                      if (matchEnd - 2 > matchStart + pipeIdx + 1) {
                        decorations.push(
                          Decoration.inline(matchStart + pipeIdx + 1, matchEnd - 2, {
                            class: 'vault-wikilink',
                            'data-wikilink-title': targetTitle
                          })
                        );
                      }
                      decorations.push(
                        Decoration.inline(matchEnd - 2, matchEnd, {
                          class: 'md-hidden-bracket'
                        })
                      );
                    }
                  }
                }
              });

              // 3. Inline marks syntax reveal for bold, italic, strike, code (when focused)
              if (isFocused && $from.depth > 0) {
                const parent = $from.parent;
                const parentStart = $from.start();

                parent.descendants((childNode, childOffset) => {
                  if (childNode.isText && childNode.marks && childNode.marks.length > 0) {
                    const nodeStart = parentStart + childOffset;
                    const nodeEnd = nodeStart + childNode.nodeSize;

                    const isInside = selection.from <= nodeEnd && selection.to >= nodeStart;
                    if (isInside) {
                      for (const mark of childNode.marks) {
                        let activeClass = '';

                        switch (mark.type.name) {
                          case 'bold':
                            activeClass = 'md-bold-active';
                            break;
                          case 'italic':
                            activeClass = 'md-italic-active';
                            break;
                          case 'strike':
                            activeClass = 'md-strike-active';
                            break;
                          case 'code':
                            activeClass = 'md-code-active';
                            break;
                          case 'highlight':
                            activeClass = 'md-highlight-active';
                            break;
                        }

                        if (activeClass) {
                          decorations.push(
                            Decoration.inline(nodeStart, nodeEnd, {
                              class: activeClass
                            })
                          );
                        }
                      }
                    }
                  }
                });
              }

              // 4. Highlight the block currently being edited (when focused)
              if (isFocused && $from.depth > 0) {
                const from = $from.before($from.depth);
                const to = $from.after($from.depth);
                if (from >= 0 && to <= doc.content.size && from < to) {
                  decorations.push(
                    Decoration.node(from, to, {
                      class: 'md-active-block'
                    })
                  );
                }
              }

              return DecorationSet.create(doc, decorations);
            } catch (err) {
              console.warn('Error calculating Markdown syntax reveal decorations:', err);
              return DecorationSet.empty;
            }
          }
        }
      })
    ];
  }
});
