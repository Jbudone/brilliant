<template>
<div class="border">
<div class="-mb-6">
Heading Font <div class=""><a class="" href="#">B</a><a class="" href="#">I</a><a class="" href="#">U</a></div> Align
</div>
<div>
<editor-content class="editor border-t-0" v-bind:id="name" v-bind:editor="editor" />
</div>
</div>
<div>
<editor-content class="preview" v-bind:id="namepreview" v-bind:editor="preview" v-if="haspreview" />
</div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

export default {
    name: 'Textbox',
    template: 'Textbox',
    components: { Editor, EditorContent },
    emits: [ 'update' ],
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
        },

        setInput(input) {
            const inputHTML = JSON_TO_HTML(input);
            this.editor.commands.setContent(inputHTML);

            this.updatePreview(this.editor);
        }
    },
    mounted() {

        const _this = this;
        this.editor = new Editor({
            content: this.value || '',
            extensions: [ StarterKit, ],

            onUpdate({ editor }) {

                if (_this.haspreview) {
                    // The content has changed.
                    _this.$emit('update', _this.editor.getJSON());
                    _this.updatePreview(editor);
                }
            },
        });

        if (this.haspreview) {
            this.preview = new Editor({
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
    /*border: 1px solid #e1e1e1 !important;*/
    /*padding: 10px 12px !important;*/
    padding-top: 1.8rem;
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 10px;
    width: 100%;
    min-height: 128px;
    line-height: 12px;
}

.ProseMirror:focus {
    /*outline: none;*/
}

.ProseMirror:focus-visible {
    /*outline: none;*/
}
</style>
