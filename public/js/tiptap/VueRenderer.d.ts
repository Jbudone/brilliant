import { Component } from 'vue';
import { Editor } from '@tiptap/core';
import { Editor as ExtendedEditor } from './Editor';
export interface VueRendererOptions {
    editor: Editor;
    props?: Record<string, any>;
}
export declare class VueRenderer {
    id: string;
    editor: ExtendedEditor;
    component: Component;
    teleportElement: Element;
    element: Element;
    props: Record<string, any>;
    constructor(component: Component, { props, editor }: VueRendererOptions);
    get ref(): any;
    updateProps(props?: Record<string, any>): void;
    destroy(): void;
}
