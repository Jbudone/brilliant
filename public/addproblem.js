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
                topic: "",
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
                this.topic_id = 1; // FIXME
                this.level = this.jsonData.level;
                //this.author = this.jsonData.author_id;

                const solutionStart = this.jsonData.body.indexOf('{') - 1,
                    solutionLen = parseInt(this.jsonData.body.substr(0, solutionStart)),
                    solutionString = this.jsonData.body.substr(solutionStart, solutionLen),
                    solutionJson = JSON.parse(solutionString);
                this.solutions = solutionJson;
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

            $('.prblm-edit-cancel').click(() => {
                if (isEdit) {
                    window.location = '/problem/' + this.id;
                } else {
                    window.location = '/problems';
                }

                return false;
            });

            var _this = this;
            $('.prblm-edit-save').click(() => {

                let body = mountedEditor.getHTML();
                let solutions = [];
                for (let i = 0; i < this.solutions.length; ++i) {
                    // FIXME: Look into Vuetex or data store
                    let text = $('[name="solution'+i+'"]').val(),
                        correct = $('#solution'+i).prop('checked');
                    if (!text) break;
                    
                    const solution = {};
                    if (correct) solution.correct = 1;
                    solution.text = text
                    solutions.push(solution);
                }
                let solutionsStr = JSON.stringify(solutions);
                body = solutionsStr.length + solutionsStr + body;
                $('#hiddenBody').val(body);

                let topic = $('[name="category"]').val(); // FIXME: Look into Vuetex or data store
                let categoryId = 0;
                for (let i = 0; i < globals.ProblemCategories.length; ++i) {
                    if (topic === globals.ProblemCategories[i].name) {
                        categoryId = globals.ProblemCategories[i].id;
                        break;
                    }
                }
                $('#hiddenCategory').val(categoryId);

                let level = $('[name="level"]').val(); // FIXME: Look into Vuetex or data store
                let levelId = 0;
                for (let i = 0; i < globals.ProblemLevels.length; ++i) {
                    if (level === globals.ProblemLevels[i].name) {
                        levelId = globals.ProblemLevels[i].id;
                        break;
                    }
                }
                $('#hiddenLevel').val(levelId);

                $('form').submit();
                return false;
            });
        },
        beforeUnmount() {
        },
    });

    const mountedProblem = AddProblemApp.mount('#app');


    // FIXME: Use Vuex or something to avoid this
    window['mountedProblem'] = mountedProblem;
});

