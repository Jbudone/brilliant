const core = require('@tiptap/core');

const Mention = core.Node.create({
  name: 'mention',

  priority: 1000,

  defaultOptions: {
    HTMLAttributes: {},
    renderLabel({ options, node }) {
      return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
    },
    suggestion: {
      char: '@',
    },
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }

          return {
            'data-id': attributes.id,
          }
        },
      },

      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label'),
        renderHTML: attributes => {
          if (!attributes.label) {
            return {}
          }

          return {
            'data-label': attributes.label,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'mention[data-mention]' },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['mention', core.mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), this.options.renderLabel({ options: this.options, node })]
  },

  renderText({ node }) {
    return this.options.renderLabel({
      options: this.options,
      node,
    })
  },

  addCommands() {
    return {
      setMention: () => ({ commands }) => {
        return commands.toggleNode('mention', 'mention')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => this.editor.commands.setMention(),
    }
  },
});


exports.Mention = Mention;
exports.default = Mention;

