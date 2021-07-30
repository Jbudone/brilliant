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
                preview: null,

                id: 0,
                title: "",
                topic: "",
                level: 0,
                author: {},
                question: "",
                solutions: {},
            };
        },
        methods: {

            updatePreview(editor) {
                this.preview.commands.setContent(editor.getHTML());
            }
        },
        beforeMount: function() {
            this.jsonData = ProblemJson;

            this.id    = this.jsonData.id;
            this.title = this.jsonData.title;
            this.topic = this.jsonData.topic;
            this.topic_id = 1; // FIXME
            this.level = this.jsonData.level;
            this.author = this.jsonData.author_id;

            const solutionStart = this.jsonData.body.indexOf('{'),
                solutionLen = parseInt(this.jsonData.body.substr(0, solutionStart)),
                solutionString = this.jsonData.body.substr(solutionStart, solutionLen),
                solutionJson = JSON.parse(solutionString);
            this.solutions = solutionJson.solutions;// [{'selected': false, correct: false, text: 'true'}, {'selected':true, correct: true, text:'false'}];//this.jsonData.solutions;
            this.question = this.jsonData.body.substr(solutionLen + solutionStart);

            console.log(ProblemJson);
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

