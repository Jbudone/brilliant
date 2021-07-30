import { Ref, PropType, DefineComponent } from 'vue';
import { Editor } from './Editor';
export declare const EditorContent: DefineComponent<{
    editor: {
        default: null;
        type: PropType<Editor>;
    };
}, {
    rootEl: Ref<Element | undefined>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    editor?: unknown;
} & {
    editor: Editor;
} & {}>, {
    editor: Editor;
}>;
