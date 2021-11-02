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
                checked: '',
                errors: {}
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
                this.updatePreview();
            },

            updatePreview() {

                //let html = this.$refs.editor.editor.getHTML();

                // FIXME: Replace {{ }} w/ katex tag ; run katex
                const katexText = (html) => {
                    let readFrom = 0;
                    do {
                        let idxStart = html.indexOf('\\(', readFrom),
                            idxEnd = html.indexOf('\\)', readFrom);

                        if (idxStart === -1 || idxEnd <= idxStart) break;

                        let katexRaw = html.substr(idxStart + 2, (idxEnd - idxStart) - 2);
                        let katexHtml = Katex.renderToString(katexRaw, {
                            displayMode: false, // inline
                            throwOnError: false
                        });

                        let end = html.substr(idxEnd + 2);
                        html = html.substr(0, idxStart) + katexHtml;
                        readFrom = html.length;
                        html += end;

                    } while (true);

                    return html;
                };

                // FIXME: Get title from addproblem app
                let title = $('.prblm-edit-title').first().val();

                let bodyJson = this.$refs.editor.editor.getJSON();
                JSON_TRANSLATE_INLINE_KATEX(bodyJson);
                let bodyHtml = JSON_TO_HTML(bodyJson);

                title = katexText(title);

                this.$refs.previewTitle.innerHTML = title;
                this.$refs.previewContent.innerHTML = bodyHtml;

                if (!isDiscussion)
                {
                    let solutions = [];
                    $('.edit-solution-input').each((i, el) => {
                        solutions.push({
                            text: el.value
                        });
                    });

                    // FIXME: Should vueify this better
                    let solutionsContent = "";
                    for (let i = 0; i < solutions.length; ++i) {
                        let solution = solutions[i].text;
                        solution = '<span class="text-lg m-1 p-1 pl-2 w-full h-8 block bg-gray-100 truncate">' + katexText(solution) + '</span>';
                        solutionsContent += solution + "\n";
                    }

                    this.$refs.previewSolutions.innerHTML = solutionsContent;
                }

                // FIXME: Find a better way to do this
                $('katex', this.$refs.previewContent).each((idx, el) => {
                    let isInline = el.attributes.length > 0 && el.attributes[0].nodeName === "inline";
                    el.innerHTML = Katex.renderToString(el.textContent, {
                        displayMode: !isInline
                    });
                });
            },

            getQuestionBody() {
                return (this.question ? GenerateHTML(this.question, VueHTMLExtensions) : "");
            },

            save() {

                let bodyDeflated = this.$refs.editor.deflated();

                const req = {};
                req[this.$refs.form_title.name] = this.$refs.form_title.value;
                req['body'] = bodyDeflated;
                req['category_id'] = this.topic;
                req['level_id'] = this.level;
                req['solution'] = this.solutionIndex();

                if (!isDiscussion) {
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
                    req['solutions'] = solutionsStr;
                }

                if (isEdit) {
                    req['id'] = this.id;
                }

                let action = this.$refs.form.action;
                axios.post(action, req)
                    .then((response) => {
                        if (response.data.id) {
                            window.location = `/problem/${response.data.id}`;
                        } else {
                            this.errors = response.data.errors;
                            console.log(response);
                        }
                    })
                    .catch((err) => {
                        // This happens if we return non-successful status code
                        console.error(err);
                    });
            },

            error(name) {
                return this.errors[name];
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

                if (!isDiscussion) {
                    this.topic = this.jsonData.topic;
                    this.level = this.jsonData.level;
                    //this.author = this.jsonData.author_id;

                    const solutionStart = this.jsonData.body.indexOf('{'),
                        solutionLen = parseInt(this.jsonData.body.substr(0, solutionStart)),
                        solutionString = this.jsonData.body.substr(solutionStart, solutionLen),
                        solutionJson = JSON.parse(solutionString);
                    this.solutions = solutionJson.solutions;

                    let question = this.jsonData.body.substr(solutionLen + solutionStart);
                    this.question = ENCODED_TO_JSON(question);
                } else {
                    let question = this.jsonData.body;
                    this.question = ENCODED_TO_JSON(question);
                }

                // FIXME: There's probably a better way to do this
                // Replace Katex tags w/  {{ text }}
                const recurseEl = (el) => {
                    if (el.content instanceof Array) {
                        for (let i = 0; i < el.content.length; ++i) {
                            if (el.content[i].type === "katex") {
                                // FIXME: Inline?
                                el.content[i] = el.content[i].content[0];
                                Assert(el.content[i].type === "text");
                                el.content[i].text = '\\( ' + el.content[i].text + ' \\)';
                            } else {
                                recurseEl(el.content[i]);
                            }
                        }
                    }
                };

                recurseEl(this.question);

                if (!isDiscussion) {
                    for (let i = this.solutions.length; i < 4; ++i) {
                        this.solutions.push({
                            correct: false,
                            text: ""
                        });
                    }
                }

                console.log(ProblemJson);
            } else {

                if (!isDiscussion) {
                    for (let i = 0; i < 4; ++i) {
                        this.solutions.push({
                            correct: i === 0,
                            text: ""
                        });
                    }
                }
            }

            // FIXME: Apply Old here
        },
        mounted() {
            this.$refs.editor.setInput(this.question);
            this.updatePreview();
        },
        beforeUnmount() {
        },
    });

    const mountedProblem = AddProblemApp.mount('#app');


    // FIXME: Use Vuex or something to avoid this
    window['mountedProblem'] = mountedProblem;
});

