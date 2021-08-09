const core = require('@tiptap/core');

const Katex = core.Node.create({
  name: 'katex',

  priority: 1000,

  defaultOptions: {
    HTMLAttributes: {},
  },

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      { tag: 'katex' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['katex', core.mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setKatex: () => ({ commands }) => {
        return commands.toggleNode('katex', 'katex')
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => this.editor.commands.setKatex(),
    }
  },
});


exports.Katex = Katex;
exports.default = Katex;

