import { NodeViewRenderer, NodeViewRendererOptions } from '@tiptap/core';
import { PropType, Component } from 'vue';
import { Decoration } from 'prosemirror-view';
import { Node as ProseMirrorNode } from 'prosemirror-model';
export declare const nodeViewProps: {
    editor: {
        type: PropType<import("@tiptap/core").Editor>;
        required: boolean;
    };
    node: {
        type: PropType<ProseMirrorNode<any>>;
        required: boolean;
    };
    decorations: {
        type: PropType<Decoration<{
            [key: string]: any;
        }>[]>;
        required: boolean;
    };
    selected: {
        type: PropType<boolean>;
        required: boolean;
    };
    extension: {
        type: PropType<import("@tiptap/core").Node<any>>;
        required: boolean;
    };
    getPos: {
        type: PropType<() => number>;
        required: boolean;
    };
    updateAttributes: {
        type: PropType<(attributes: Record<string, any>) => void>;
        required: boolean;
    };
    deleteNode: {
        type: PropType<() => void>;
        required: boolean;
    };
};
export interface VueNodeViewRendererOptions extends NodeViewRendererOptions {
    update: ((props: {
        oldNode: ProseMirrorNode;
        oldDecorations: Decoration[];
        newNode: ProseMirrorNode;
        newDecorations: Decoration[];
        updateProps: () => void;
    }) => boolean) | null;
}
export declare function VueNodeViewRenderer(component: Component, options?: Partial<VueNodeViewRendererOptions>): NodeViewRenderer;
