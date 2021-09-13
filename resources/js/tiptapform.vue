<template>
<div class="border">
    <div class="relative z-10 top-1" v-if="editor">
        <div class="-mb-6 flex flex-row justify-center items-center">

<!--
            <Dropdown
                    :options="headingList()"
                    :disabled="false"
                    :style="'toolbar'"
                    class="w-24 h-6 mx-4"
                    class-input="w-24 h-6"
                    class-list=""
                    class-option=""

                    name="category"
                    placeholder="Heading"
                    v-on:selected="setHeading">
            </Dropdown>
-->

            <div class="mx-4 space-x-4">
                <a href="#" class="fas fa-heading hover:text-purple-700" @click.prevent="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'text-purple-800': editor.isActive('heading', { level: 1 }) }"></a>
                <!--<a href="#" class="fas fa-heading hover:text-purple-700" @click.prevent="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'text-purple-800': editor.isActive('heading', { level: 2 }) }"></a>
                <a href="#" class="fas fa-heading hover:text-purple-700" @click.prevent="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'text-purple-800': editor.isActive('heading', { level: 3 }) }"></a>-->
            </div>

            <div class="mx-4 space-x-4">
                <a href="#" class="fas fa-bold hover:text-purple-700" @click.prevent="editor.chain().focus().toggleBold().run()" :class="{ 'text-purple-800': editor.isActive('bold') }"></a>
                <a href="#" class="fas fa-italic hover:text-purple-700" @click.prevent="editor.chain().focus().toggleItalic().run()" :class="{ 'text-purple-800': editor.isActive('italic') }"></a>
                <a href="#" class="fas fa-underline hover:text-purple-700" @click.prevent="editor.chain().focus().toggleUnderline().run()" :class="{ 'text-purple-800': editor.isActive('underline') }"></a>
            </div>

            <div class="mx-4 space-x-4">
                <a href="#" class="fas fa-list-ul hover:text-purple-700" @click.prevent="editor.chain().focus().toggleBulletList().run()" :class="{ 'text-purple-800': editor.isActive('bulletList') }"></a>
                <a href="#" class="fas fa-list-ol hover:text-purple-700" @click.prevent="editor.chain().focus().toggleOrderedList().run()" :class="{ 'text-purple-800': editor.isActive('orderedList') }"></a>
            </div>

            <div class="mx-4 space-x-4">
                <a href="#" class="fas fa-slash hover:text-purple-700" style="transform: rotate(322deg);" @click.prevent="editor.chain().focus().setHorizontalRule().run()"></a>
            </div>

            <div class="mx-4 space-x-4">
                <a href="#" class="fas fa-block-quote hover:text-purple-700" @click.prevent="editor.chain().focus().toggleBlockquote().run()"></a>
                <a href="#" class="fas fa-link hover:text-purple-700"></a>
                <a href="#" class="fas fa-square-root-alt hover:text-purple-700" @click.prevent="editor.chain().focus().insertContent('{{ }}').run()"></a>
                <a href="#" class="fas fa-table hover:text-purple-700 disabled"></a>
                <a href="#" class="fas fa-code hover:text-purple-700" @click.prevent="editor.chain().focus().toggleCodeBlock().run()"></a>
                <!-- <a href="#" class="fas fa-image hover:text-purple-700"></a> -->
            </div>
        </div>
    </div>
    <div>
    <editor-content class="editor border-t-0" v-bind:id="name" v-bind:editor="editor" />
    </div>
</div>
<div>
<div class="preview" v-bind:id="namepreview" v-if="haspreview">
    <div ref="previewTitle"></div>

    <div class="grid grid-cols-7 gap-4">
        <div class="col-span-5">
            <div ref="previewContent"></div>
        </div>
        <div class="col-span-2">
            <div ref="previewSolutions"></div>
        </div>
    </div>
</div>
</div>
</template>


<script>
import Dropdown from './dropdown.vue';
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'


export default {
    name: 'Textbox',
    template: 'Textbox',
    components: { Editor, EditorContent, Dropdown },
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
            default: false,
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
            let html = editor.getHTML();

            // FIXME: Replace {{ }} w/ katex tag ; run katex
            const katexText = (html) => {
                let readFrom = 0;
                do {
                    let idxStart = html.indexOf('{{', readFrom),
                        idxEnd = html.indexOf('}}', readFrom);

                    if (idxStart === -1 || idxEnd <= idxStart) break;

                    let katexRaw = html.substr(idxStart + 2, (idxEnd - idxStart) - 2);
                    let katexHtml = Katex.renderToString(katexRaw, {
                        displayMode: false, // inline
                    });

                    let end = html.substr(idxEnd + 2);
                    html = html.substr(0, idxStart) + katexHtml;
                    readFrom = html.length;
                    html += end;

                } while (true);

                return html;
            };
            
            html = katexText(html);
            this.$refs.previewContent.innerHTML = html;
        },

        setInput(input) {
            const inputHTML = JSON_TO_HTML(input);
            this.editor.commands.setContent(inputHTML);

            if (this.haspreview) {
                this.updatePreview(this.editor);
            }
        },

        headingList() {
            return [
                { name: 'h0', id: 4, style: "<p>Normal</p>" },
                { name: 'h1', id: 1, style: "<h1>Heading 1</h1>" },
                { name: 'h2', id: 2, style: "<h2>Heading 2</h2>" },
                { name: 'h3', id: 3, style: "<h3>Heading 3</h3>" },
            ];
        },

        setHeading({id}) {
            this.editor.chain().focus().toggleHeading({ level: id }).run()
        }
    },
    mounted() {

        const _this = this;
        this.editor = new Editor({
            content: this.value || '',
            extensions: TipTapExtensions,

            onUpdate({ editor }) {

                _this.$emit('update', _this.editor.getJSON());
                if (_this.haspreview) {
                    // The content has changed.
                    _this.updatePreview(editor);
                }
            },
        });

        if (this.haspreview) {
            this.preview = document.getElementById(this.namepreview);
        }

        // FIXME: Use Vuex or something to avoid this
        window['mountedEditor-'+this.name] = this.editor;
    },
    computed: {

    },

    beforeUnmount() {
        this.editor.destroy();
    },
};
</script>

<style>
.editor .ProseMirror {
    padding-top: 1.8rem;
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 10px;
    width: 100%;
    min-height: 128px;
    line-height: 1.6em;
}

.ProseMirror ul,ol {
    margin-left: 12px;
}

.preview {
    margin-left: 20px;
    padding-top: 1.8rem;
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 10px;
    line-height: 1.6em;
}

.ProseMirror:focus {
    /*outline: none;*/
}

.ProseMirror:focus-visible {
    /*outline: none;*/
}

.ProseMirror .tiptap-katex-edit {
    border-radius: 0.5rem;
    position: relative;
    display: inline;
}

.ProseMirror .tiptap-katex-edit .label {
    background-color: #0D0D0D;
    font-size: 0.6rem;
    letter-spacing: 1px;
    font-weight: bold;
    text-transform: uppercase;
    color: #fff;
    position: absolute;
    bottom: -30px;
    padding: 0.25rem 0.75rem;
    border-radius: 0 0 0.5rem 0.5rem;
    width: 100%;
    min-width: 100px;
}

.ProseMirror .tiptap-katex-edit .content {
    padding: 0.1rem 0.2rem;
    border: 2px dashed #0D0D0D20;
    border-radius: 0.5rem;
    display: inline;
    background: #FAF594;
}

.ProseMirror pre {
    background: #0D0D0D;
    color: #FFF;
    font-family: 'JetBrainsMono', monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
}

.ProseMirror pre code {
    color: inherit;
    padding: 0;
    background: none;
    font-size: 0.8rem;
}

.ProseMirror pre code .hljs-comment,.hljs-quote {
    color: #616161;
}

.ProseMirror pre code 
    .hljs-variable,
    .hljs-template-variable,
    .hljs-attribute,
    .hljs-tag,
    .hljs-name,
    .hljs-regexp,
    .hljs-link,
    .hljs-name,
    .hljs-selector-id,
    .hljs-selector-class {
      color: #F98181;
    }

.ProseMirror pre code 
    .hljs-number,
    .hljs-meta,
    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-literal,
    .hljs-type,
    .hljs-params {
    color: #FBBC88;
}

.ProseMirror pre code 
    .hljs-string,
    .hljs-symbol,
    .hljs-bullet {
    color: #B9F18D;
}

.ProseMirror pre code 
    .hljs-title,
    .hljs-section {
    color: #FAF594;
}

.ProseMirror pre code 
    .hljs-keyword,
    .hljs-selector-tag {
    color: #70CFF8;
}

.ProseMirror pre code 
    .hljs-emphasis {
    font-style: italic;
}

.ProseMirror pre code 
    .hljs-strong {
    font-weight: 700;
}
</style>
