import { Mark, mergeAttributes, InputRule } from '@tiptap/core';

export interface WikilinkOptions {
  HTMLAttributes: Record<string, any>;
  onWikilinkClick?: (title: string, alias?: string) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikilink: {
      setWikilink: (attributes: { targetTitle: string; alias?: string }) => ReturnType;
      unsetWikilink: () => ReturnType;
    };
  }
}

// Input rule matching [[Title]] or [[Title|Alias]]
export const inputRegex = /\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]$/;

export const Wikilink = Mark.create<WikilinkOptions>({
  name: 'wikilink',

  inclusive: false,

  addOptions() {
    return {
      HTMLAttributes: {},
      onWikilinkClick: undefined,
    };
  },

  addAttributes() {
    return {
      targetTitle: {
        default: null,
        parseHTML: element => element.getAttribute('data-wikilink-title'),
        renderHTML: attributes => {
          if (!attributes.targetTitle) return {};
          return {
            'data-wikilink-title': attributes.targetTitle,
          };
        },
      },
      alias: {
        default: null,
        parseHTML: element => element.getAttribute('data-wikilink-alias'),
        renderHTML: attributes => {
          if (!attributes.alias) return {};
          return {
            'data-wikilink-alias': attributes.alias,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-wikilink-title]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'vault-wikilink',
        'data-wikilink': 'true',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setWikilink:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetWikilink:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: inputRegex,
        handler: ({ state, range, match }) => {
          const targetTitle = match[1]?.trim();
          const alias = match[2]?.trim() || targetTitle;
          if (!targetTitle) return;

          const { tr } = state;
          const mark = this.type.create({
            targetTitle,
            alias: match[2]?.trim() || null,
          });

          // Replace the entire "[[target|alias]]" with just the clean alias text having the wikilink mark!
          tr.replaceWith(range.from, range.to, state.schema.text(alias, [mark]));
          tr.insertText(' ');
        },
      }),
    ];
  },
});
