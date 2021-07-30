import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { Editor as CoreEditor, EditorOptions } from '@tiptap/core';
import { ComponentInternalInstance, ComponentPublicInstance } from 'vue';
import { VueRenderer } from './VueRenderer';
export declare type ContentComponent = ComponentInternalInstance & {
    ctx: ComponentPublicInstance;
};
export declare class Editor extends CoreEditor {
    private reactiveState;
    vueRenderers: Map<string, VueRenderer>;
    contentComponent: ContentComponent | null;
    constructor(options?: Partial<EditorOptions>);
    get state(): EditorState<any>;
    /**
     * Register a ProseMirror plugin.
     */
    registerPlugin(plugin: Plugin, handlePlugins?: (newPlugin: Plugin, plugins: Plugin[]) => Plugin[]): void;
    /**
     * Unregister a ProseMirror plugin.
     */
    unregisterPlugin(nameOrPluginKey: string | PluginKey): void;
}
