'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@tiptap/core');
var vue = require('vue');
var extensionBubbleMenu = require('@tiptap/extension-bubble-menu');
var extensionFloatingMenu = require('@tiptap/extension-floating-menu');

const BubbleMenu = vue.defineComponent({
    name: 'BubbleMenu',
    props: {
        editor: {
            type: Object,
            required: true,
        },
        tippyOptions: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { slots }) {
        const root = vue.ref(null);
        vue.onMounted(() => {
            const { editor, tippyOptions } = props;
            editor.registerPlugin(extensionBubbleMenu.BubbleMenuPlugin({
                editor,
                element: root.value,
                tippyOptions,
            }));
        });
        vue.onBeforeUnmount(() => {
            const { editor } = props;
            editor.unregisterPlugin(extensionBubbleMenu.BubbleMenuPluginKey);
        });
        return () => { var _a; return vue.h('div', { ref: root }, (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots)); };
    },
});

function useDebouncedRef(value) {
    return vue.customRef((track, trigger) => {
        return {
            get() {
                track();
                return value;
            },
            set(newValue) {
                // update state
                value = newValue;
                // update view as soon as possible
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        trigger();
                    });
                });
            },
        };
    });
}
class Editor extends core.Editor {
    constructor(options = {}) {
        super(options);
        this.vueRenderers = vue.reactive(new Map());
        this.contentComponent = null;
        this.reactiveState = useDebouncedRef(this.view.state);
        this.on('transaction', () => {
            this.reactiveState.value = this.view.state;
        });
        return vue.markRaw(this);
    }
    get state() {
        return this.reactiveState
            ? this.reactiveState.value
            : this.view.state;
    }
    /**
     * Register a ProseMirror plugin.
     */
    registerPlugin(plugin, handlePlugins) {
        super.registerPlugin(plugin, handlePlugins);
        this.reactiveState.value = this.view.state;
    }
    /**
     * Unregister a ProseMirror plugin.
     */
    unregisterPlugin(nameOrPluginKey) {
        super.unregisterPlugin(nameOrPluginKey);
        this.reactiveState.value = this.view.state;
    }
}

const EditorContent = vue.defineComponent({
    name: 'EditorContent',
    props: {
        editor: {
            default: null,
            type: Object,
        },
    },
    setup(props) {
        const rootEl = vue.ref();
        const instance = vue.getCurrentInstance();
        vue.watchEffect(() => {
            const editor = props.editor;
            if (editor && editor.options.element && rootEl.value) {
                vue.nextTick(() => {
                    if (!rootEl.value || !editor.options.element.firstChild) {
                        return;
                    }
                    const element = vue.unref(rootEl.value);
                    rootEl.value.append(...editor.options.element.childNodes);
                    // @ts-ignore
                    editor.contentComponent = instance.ctx._;
                    editor.setOptions({
                        element,
                    });
                    editor.createNodeViews();
                });
            }
        });
        vue.onBeforeUnmount(() => {
            const editor = props.editor;
            if (!editor) {
                return;
            }
            // destroy nodeviews before vue removes dom element
            if (!editor.isDestroyed) {
                editor.view.setProps({
                    nodeViews: {},
                });
            }
            editor.contentComponent = null;
            if (!editor.options.element.firstChild) {
                return;
            }
            const newElement = document.createElement('div');
            newElement.append(...editor.options.element.childNodes);
            editor.setOptions({
                element: newElement,
            });
        });
        return { rootEl };
    },
    render() {
        const vueRenderers = [];
        if (this.editor) {
            this.editor.vueRenderers.forEach(vueRenderer => {
                const node = vue.h(vue.Teleport, {
                    to: vueRenderer.teleportElement,
                    key: vueRenderer.id,
                }, vue.h(vueRenderer.component, {
                    ref: vueRenderer.id,
                    ...vueRenderer.props,
                }));
                vueRenderers.push(node);
            });
        }
        return vue.h('div', {
            ref: (el) => { this.rootEl = el; },
        }, ...vueRenderers);
    },
});

const FloatingMenu = vue.defineComponent({
    name: 'FloatingMenu',
    props: {
        editor: {
            type: Object,
            required: true,
        },
        tippyOptions: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, { slots }) {
        const root = vue.ref(null);
        vue.onMounted(() => {
            const { editor, tippyOptions } = props;
            editor.registerPlugin(extensionFloatingMenu.FloatingMenuPlugin({
                editor,
                element: root.value,
                tippyOptions,
            }));
        });
        vue.onBeforeUnmount(() => {
            const { editor } = props;
            editor.unregisterPlugin(extensionFloatingMenu.FloatingMenuPluginKey);
        });
        return () => { var _a; return vue.h('div', { ref: root }, (_a = slots.default) === null || _a === void 0 ? void 0 : _a.call(slots)); };
    },
});

const useEditor = (options = {}) => {
    const editor = vue.ref();
    vue.onMounted(() => {
        editor.value = new Editor(options);
    });
    vue.onBeforeUnmount(() => {
        var _a;
        (_a = editor.value) === null || _a === void 0 ? void 0 : _a.destroy();
    });
    return editor;
};

class VueRenderer {
    constructor(component, { props = {}, editor }) {
        this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString();
        this.editor = editor;
        this.component = vue.markRaw(component);
        this.teleportElement = document.createElement('div');
        this.element = this.teleportElement;
        this.props = vue.reactive(props);
        this.editor.vueRenderers.set(this.id, this);
        if (this.editor.contentComponent) {
            this.editor.contentComponent.update();
            if (this.teleportElement.children.length !== 1) {
                throw Error('VueRenderer doesn’t support multiple child elements.');
            }
            this.element = this.teleportElement.firstElementChild;
        }
    }
    get ref() {
        var _a;
        return (_a = this.editor.contentComponent) === null || _a === void 0 ? void 0 : _a.refs[this.id];
    }
    updateProps(props = {}) {
        Object
            .entries(props)
            .forEach(([key, value]) => {
            this.props[key] = value;
        });
    }
    destroy() {
        this.editor.vueRenderers.delete(this.id);
    }
}

const nodeViewProps = {
    editor: {
        type: Object,
        required: true,
    },
    node: {
        type: Object,
        required: true,
    },
    decorations: {
        type: Object,
        required: true,
    },
    selected: {
        type: Boolean,
        required: true,
    },
    extension: {
        type: Object,
        required: true,
    },
    getPos: {
        type: Function,
        required: true,
    },
    updateAttributes: {
        type: Function,
        required: true,
    },
    deleteNode: {
        type: Function,
        required: true,
    },
};
class VueNodeView extends core.NodeView {
    mount() {
        const props = {
            editor: this.editor,
            node: this.node,
            decorations: this.decorations,
            selected: false,
            extension: this.extension,
            getPos: () => this.getPos(),
            updateAttributes: (attributes = {}) => this.updateAttributes(attributes),
            deleteNode: () => this.deleteNode(),
        };
        const onDragStart = this.onDragStart.bind(this);
        this.decorationClasses = vue.ref(this.getDecorationClasses());
        const extendedComponent = vue.defineComponent({
            extends: { ...this.component },
            props: Object.keys(props),
            setup: () => {
                var _a, _b;
                vue.provide('onDragStart', onDragStart);
                vue.provide('decorationClasses', this.decorationClasses);
                return (_b = (_a = this.component).setup) === null || _b === void 0 ? void 0 : _b.call(_a, props);
            },
        });
        this.renderer = new VueRenderer(extendedComponent, {
            editor: this.editor,
            props,
        });
    }
    get dom() {
        if (!this.renderer.element.hasAttribute('data-node-view-wrapper')) {
            throw Error('Please use the NodeViewWrapper component for your node view.');
        }
        return this.renderer.element;
    }
    get contentDOM() {
        if (this.node.isLeaf) {
            return null;
        }
        const contentElement = this.dom.querySelector('[data-node-view-content]');
        return contentElement || this.dom;
    }
    update(node, decorations) {
        const updateProps = (props) => {
            this.decorationClasses.value = this.getDecorationClasses();
            this.renderer.updateProps(props);
        };
        if (typeof this.options.update === 'function') {
            const oldNode = this.node;
            const oldDecorations = this.decorations;
            this.node = node;
            this.decorations = decorations;
            return this.options.update({
                oldNode,
                oldDecorations,
                newNode: node,
                newDecorations: decorations,
                updateProps: () => updateProps({ node, decorations }),
            });
        }
        if (node.type !== this.node.type) {
            return false;
        }
        if (node === this.node && this.decorations === decorations) {
            return true;
        }
        this.node = node;
        this.decorations = decorations;
        updateProps({ node, decorations });
        return true;
    }
    selectNode() {
        this.renderer.updateProps({
            selected: true,
        });
    }
    deselectNode() {
        this.renderer.updateProps({
            selected: false,
        });
    }
    getDecorationClasses() {
        return this.decorations
            // @ts-ignore
            .map(item => item.type.attrs.class)
            .flat()
            .join(' ');
    }
    destroy() {
        this.renderer.destroy();
    }
}
function VueNodeViewRenderer(component, options) {
    return (props) => {
        // try to get the parent component
        // this is important for vue devtools to show the component hierarchy correctly
        // maybe it’s `undefined` because <editor-content> isn’t rendered yet
        if (!props.editor.contentComponent) {
            return {};
        }
        return new VueNodeView(component, props, options);
    };
}

const NodeViewWrapper = vue.defineComponent({
    props: {
        as: {
            type: String,
            default: 'div',
        },
    },
    inject: ['onDragStart', 'decorationClasses'],
    render() {
        var _a, _b;
        return vue.h(this.as, {
            // @ts-ignore
            class: this.decorationClasses.value,
            style: {
                whiteSpace: 'normal',
            },
            'data-node-view-wrapper': '',
            // @ts-ignore (https://github.com/vuejs/vue-next/issues/3031)
            onDragStart: this.onDragStart,
        }, (_b = (_a = this.$slots).default) === null || _b === void 0 ? void 0 : _b.call(_a));
    },
});

const NodeViewContent = vue.defineComponent({
    props: {
        as: {
            type: String,
            default: 'div',
        },
    },
    render() {
        return vue.h(this.as, {
            style: {
                whiteSpace: 'pre-wrap',
            },
            'data-node-view-content': '',
        });
    },
});

exports.BubbleMenu = BubbleMenu;
exports.Editor = Editor;
exports.EditorContent = EditorContent;
exports.FloatingMenu = FloatingMenu;
exports.NodeViewContent = NodeViewContent;
exports.NodeViewWrapper = NodeViewWrapper;
exports.VueNodeViewRenderer = VueNodeViewRenderer;
exports.VueRenderer = VueRenderer;
exports.nodeViewProps = nodeViewProps;
exports.useEditor = useEditor;
Object.keys(core).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () {
      return core[k];
    }
  });
});
//# sourceMappingURL=tiptap-vue-3.cjs.js.map
