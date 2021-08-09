const core = require('@tiptap/core');

const Mention = core.Node.create({
  name: 'mention',

  priority: 1000,

  defaultOptions: {
    HTMLAttributes: {},
  },

  group: 'block',
  //group: 'inline',

    //inline: true,
  content: 'inline*',

  parseHTML() {
    return [
      { tag: 'mention' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mention', core.mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
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

