import { PropType } from 'vue';
export declare const BubbleMenu: import("vue").DefineComponent<{
    editor: {
        type: PropType<import("@tiptap/core").Editor>;
        required: true;
    };
    tippyOptions: {
        type: PropType<Partial<import("tippy.js").Props> | undefined>;
        default: () => {};
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    editor?: unknown;
    tippyOptions?: unknown;
} & {
    editor: import("@tiptap/core").Editor;
    tippyOptions: Partial<import("tippy.js").Props> | undefined;
} & {}>, {
    tippyOptions: Partial<import("tippy.js").Props> | undefined;
}>;
