const { Dropdown, EditableSolutions, TipTapForm } = VueComponents;

$(document).ready(() => {

    const isAdd = (addedit === 'add');
    const isEdit = (addedit === 'edit');

    const AddProblemApp = Vue.createApp({
        components: {
            Dropdown, EditableSolutions, TipTapForm
        },
        data: function() {
            return {
                globals: window.globals,

                id: 0,
                title: "",
                topic: 0,
                level: 0,
                question: "",
                solutions: [],
                checked: ''
            };
        },
        methods: {
            checkedSolution(idx) {
                for (let i = 0; i < this.solutions.length; ++i) {
                    if (this.solutions[i].correct) {
                        return (i === idx);
                    }
                }

                return false;
            },

            selectCategory(selection) {
                this.topic = selection.id;
            },

            selectLevel(selection) {
                this.level = selection.id;
            },

            setCorrectSolution(idx) {
                for (let i = 0; i < this.solutions.length; ++i) {
                    delete this.solutions[i].correct;
                }

                this.solutions[idx].correct = true;
            },

            solutionIndex() {
                for (let i = 0; i < this.solutions.length; ++i) {
                    if (this.solutions[i].correct) {
                        return i;
                    }
                }
            },

            cancel() {
                if (isEdit) {
                    window.location = '/problem/' + this.id;
                } else {
                    window.location = '/problems';
                }
            },

            setQuestionBody(json) {
                this.question = json;
            },

            getQuestionBody() {
                return this.question;
            },

            save() {

                let body = JSON.stringify(this.question);
                let solutions = [];
                for (let i = 0; i < this.solutions.length; ++i) {
                    const solution = {};
                    solution.text = this.solutions[i].text;
                    if (this.solutions[i].correct) {
                        $('#hiddenSolution').val(i);
                        solution.correct = true;
                    }
                    solutions.push(solution);
                }
                let solutionsStr = JSON.stringify({solutions: solutions});
                body = solutionsStr.length + solutionsStr + body;
                this.$refs.formBody.value = body;

                this.$refs.form.submit();
            }
        },
        computed: {
        },

        beforeMount: function() {

            // FIXME: can we use props instead of window global?
            if (isEdit) {
                this.jsonData = ProblemJson;

                this.id    = this.jsonData.id;
                this.title = this.jsonData.title;
                this.topic = this.jsonData.topic;
                this.level = this.jsonData.level;
                //this.author = this.jsonData.author_id;

                const solutionStart = this.jsonData.body.indexOf('{'),
                    solutionLen = parseInt(this.jsonData.body.substr(0, solutionStart)),
                    solutionString = this.jsonData.body.substr(solutionStart, solutionLen),
                    solutionJson = JSON.parse(solutionString);
                this.solutions = solutionJson.solutions;
                this.question = this.jsonData.body.substr(solutionLen + solutionStart);

                for (let i = this.solutions.length; i < 4; ++i) {
                    this.solutions.push({
                        correct: false,
                        text: ""
                    });
                }

                console.log(ProblemJson);
            } else {

                for (let i = 0; i < 4; ++i) {
                    this.solutions.push({
                        correct: i === 0,
                        text: ""
                    });
                }
            }

            // FIXME: Apply Old here
        },
        mounted() {
            this.$refs.editor.setInput(this.question);
        },
        beforeUnmount() {
        },
    });

    const mountedProblem = AddProblemApp.mount('#app');


    // FIXME: Use Vuex or something to avoid this
    window['mountedProblem'] = mountedProblem;
});

