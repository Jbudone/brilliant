import { Editor, EditorContent } from 'https://cdn.skypack.dev/@tiptap/vue-3?min';
import StarterKit from 'https://cdn.skypack.dev/@tiptap/starter-kit?min'

$(document).ready(() => {
    const problem = Vue.createApp({
        components: {
            EditorContent
        },
        data: function() {
            return {
                editor: null,
                preview: null
            };
        },
        methods: {

            updatePreview(editor) {
                this.preview.commands.setContent(editor.getHTML());
            }
        },
        beforeMount: function() {
        },
        computed: {
        },

        mounted() {

            const _this = this;
            this.editor = new Editor({
                element: document.querySelector('#editor'),
                content: '<p>I’m running tiptap with Vue.js. 🎉</p>',
                extensions: [
                    StarterKit,
                ],

                onUpdate({ editor }) {
                    // The content has changed.
                    _this.updatePreview(editor);
                },
            });

            this.preview = new Editor({
                element: document.querySelector('#preview'),
                content: '<p>I’m running tiptap with Vue.js. 🎉</p>',
                extensions: [
                    StarterKit,
                ],
                editable: false
            });
        },

        beforeUnmount() {
            this.editor.destroy();
            this.preview.destroy();
        },
    });

    const mountedProblem = problem.mount('#app');


});

