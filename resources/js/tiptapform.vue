<template>
<div>
<editor-content class="editor" v-bind:id="name" v-bind:editor="editor" />
</div>
<div>
<editor-content class="preview" v-bind:id="namepreview" v-bind:editor="preview" v-if="haspreview" />
</div>
</template>

<script>
//import { Editor, EditorContent } from 'https://cdn.skypack.dev/@tiptap/vue-3?min';
//import StarterKit from 'https://cdn.skypack.dev/@tiptap/starter-kit?min'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

export default {
    name: 'Textbox',
    template: 'Textbox',
    components: { Editor, EditorContent },
    props: {
        name: {
            type: String,
        },
        namepreview: {
            type: String
        },
        haspreview: {
            type: Boolean,
            required: false,
            default: true,
            note: 'Has preview window'
        },
        value: {
            type: String,
            required: false,
            default: ""
        }
    },
    data() {
        return {
            editor: null,
            preview: null,
        }
    },
    methods: {
        updatePreview(editor) {
            this.preview.commands.setContent(editor.getHTML());
        }
    },
    mounted() {

        const _this = this;
        this.editor = new Editor({
            //element: document.querySelector('#editor'), // FIXME: Only select within template
            content: this.value || '',
            extensions: [ StarterKit, ],

            onUpdate({ editor }) {

                if (_this.haspreview) {
                    // The content has changed.
                    _this.updatePreview(editor);
                }
            },
        });

        if (this.haspreview) {
            this.preview = new Editor({
                //element: document.querySelector('#preview'),
                content: this.editor.getHTML(),
                extensions: [ StarterKit, ],
                editable: false
            });
        }

        // FIXME: Use Vuex or something to avoid this
        window['mountedEditor-'+this.name] = this.editor;
    },
    computed: {

    },

    beforeUnmount() {
        this.editor.destroy();
        this.preview.destroy();
    },
};
</script>

<style>
.editor .ProseMirror {
    border: 1px solid #e1e1e1 !important;
    padding: 10px 12px !important;
    width: 100%;
    min-height: 128px;
    line-height: 12px;
}
</style>
