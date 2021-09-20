const { TipTapForm } = VueComponents;

$(document).ready(() => {
    const ProblemApp = Vue.createApp({
        components: {
            TipTapForm
        },
        data: function() {
            return {
                globals: window.globals,
                jsonData: [],

                id: 0,
                title: "",
                topic: "",
                level: 0,
                author: {},
                question: "",
                solutions: {},
                discussions: [],
                users: {},
                
                isDiscussion: false,
                solved: 0,
                showingAddSolutionContainer: false
            };
        },
        methods: {

            questionOwner() { return (this.author.id === UserJson.id); },
            editQuestionUrl() { return ('/edit/' + this.id); },

            save(el) {


                // FIXME: Inject katex in texts w/ {{ }}
                const recurseEl = (el) => {
                    if (el.content instanceof Array) {
                        for (let i = 0; i < el.content.length; ++i) {
                            if (el.content[i].type === "text") {
                                let textParts = [];
                                let textHtml = el.content[i].text;

                                let readFrom = 0;
                                do {
                                    let idxStart = textHtml.indexOf('\\(', readFrom),
                                        idxEnd = textHtml.indexOf('\\)', readFrom);

                                    if (idxStart === -1 || idxEnd <= idxStart) break;

                                    let katexRaw = textHtml.substr(idxStart + 2, (idxEnd - idxStart) - 2);
                                    // FIXME: Inline?

                                    let start = textHtml.substr(readFrom, idxStart);
                                    if (start.trim() !== "") {
                                        textParts.push({
                                            type: "text",
                                            text: start
                                        });
                                    }

                                    if (katexRaw.trim() !== "") {
                                        textParts.push({
                                            type: "katex",
                                            content: [{ type: "text", text: katexRaw }],
                                            attrs: { inline: true }
                                        });
                                    }

                                    readFrom = idxEnd + 2;
                                } while (true);

                                let end = textHtml.substr(readFrom);
                                if (end.trim() !== "") {
                                    textParts.push({
                                        type: "text",
                                        text: end
                                    });
                                }

                                if (el.content[i].marks) {
                                    for (let j = 0; j < textParts.length; ++j) {
                                        textParts[j].marks = el.content[i].marks;
                                    }
                                }

                                if (textParts.length > 0) {
                                    el.content.splice(i, 1, ...textParts);
                                }
                            } else {
                                recurseEl(el.content[i]);
                            }
                        }
                    }
                };





                if (el === 'replyto') {
                    let body = window['mountedEditor-editorreplyto'].getJSON();
                    recurseEl(body);
                    let bodyInflatedJson = body;
                    let { child, elements } = JSON_BODY_TO_HTML(bodyInflatedJson);
                    let bodyDeflatedHtml = child,
                        bodyDeflatedJson = JSON.stringify(bodyDeflatedHtml);

                    $('#prblm-replyto-form [name="comment"]').val(bodyDeflatedJson);
                    $('#prblm-replyto-form').submit();

                } else if (el === 'replyedit') {
                    let body = window['mountedEditor-editorreplyedit'].getJSON();
                    recurseEl(body);
                    let bodyInflatedJson = body;
                    let { child, elements } = JSON_BODY_TO_HTML(bodyInflatedJson);
                    let bodyDeflatedHtml = child,
                        bodyDeflatedJson = JSON.stringify(bodyDeflatedHtml);

                    $('#prblm-replyedit-form [name="comment"]').val(bodyDeflatedJson);
                    $('#prblm-replyedit-form').submit();
                } else if (el === 'addsolution') {
                    let body = window['mountedEditor-editoraddsolution'].getJSON();
                    recurseEl(body);
                    let bodyInflatedJson = body;
                    let { child, elements } = JSON_BODY_TO_HTML(bodyInflatedJson);
                    let bodyDeflatedHtml = child,
                        bodyDeflatedJson = JSON.stringify(bodyDeflatedHtml);

                    $('#prblm-addsol-form [name="comment"]').val(bodyDeflatedJson);
                    $('#prblm-addsol-form').submit();
                }
            },

            cancel() {
                this.showingAddSolutionContainer = false;
                $('#addSolutionContainer').hide();
                $('#replyToContainer').hide();
                $('#replyEditContainer').hide();
            },

            solve(idx) {
                if (this.solutions.length > 1) {
                    this.$refs.formAnswer.value = idx;
                } else {
                    let input = this.$refs.solutionInput.value;
                    this.$refs.formAnswer.value = input.trim();
                }

                this.$refs.formSolve.submit();
            },

            unsolve() {
                this.$refs.formUnsolve.submit();
            }
        },
        beforeMount: function() {
            this.jsonData = ProblemJson;

            this.id    = this.jsonData.id;
            this.title = this.jsonData.title;
            this.titleHtml = TITLE_TO_HTML(this.title);
            this.topic = this.jsonData.topic;
            this.level = this.jsonData.level;
            this.author = {
                id: this.jsonData.author,
                name: this.jsonData.users[this.jsonData.author].name
            };
            this.users = this.jsonData.users;
            this.isDiscussion = this.jsonData.discussion;



            if (this.isDiscussion) {

                this.question = this.jsonData.body;
                this.question = ENCODED_TO_JSON(this.question);
                this.question = JSON_TO_HTML(this.question);
            } else {



                console.log(this.solutions);

                const solutionStart = this.jsonData.body.indexOf('{'),
                    solutionLen = parseInt(this.jsonData.body.substr(0, solutionStart)),
                    solutionString = this.jsonData.body.substr(solutionStart, solutionLen),
                    solutionJson = JSON.parse(solutionString);
                this.solutions = solutionJson.solutions;

                // Hide correct until solved
                if (!SolveJson) {
                    for (let i = 0; i < this.solutions.length; ++i) {
                        if (this.solutions[i].correct) {
                            delete this.solutions[i].correct;
                        }
                    }
                }

                // JSON -> HTML for solutions ONLY if its multiple choice, since you can't latex/img an input solution
                if (this.solutions.length > 1) {
                    for (let i = 0; i < this.solutions.length; ++i) {
                        const solutionJson = INLINE_TO_JSON(this.solutions[i].text);
                        this.solutions[i].html = JSON_TO_HTML(solutionJson);
                    }
                }

                this.question = this.jsonData.body.substr(solutionLen + solutionStart);
                this.question = ENCODED_TO_JSON(this.question);
                this.question = JSON_TO_HTML(this.question);

            }

            // Build discussions from flattened comments
            this.discussions = [];
            const discussionComments = {};
            for (let i = 0; i < this.jsonData.comments.length; ++i) {
                const comment = this.jsonData.comments[i],
                    author = this.users[comment.author];

                console.log(comment.body);
                let commentBody = null;

                commentBody = ENCODED_TO_JSON(comment.body);
                commentBody = JSON_TO_HTML(commentBody);
                const discussionComment = {
                    id: comment.id,
                    rawcontent: comment.body,
                    content: commentBody,
                    author: comment.author,
                    date: (new Date(comment.date)).toDateString(),

                    showReplyButton: function(){ return(UserJson.id && UserJson.id != comment.author); },
                    showEditButton: function(){ return(UserJson.id && UserJson.id === comment.author); },
                };

                discussionComments[comment.id] = discussionComment;

                if (comment.parent_comment_id) {
                    const parent = discussionComments[comment.parent_comment_id];
                    if (!parent.replies) parent.replies = [];
                    parent.replies.push(discussionComment);
                } else {
                    this.discussions.push(discussionComment);

                    discussionComment.reactions = [0,0,0,0];
                }
            }

            if (SolveJson) {
                if (this.solutions.length > 1) {
                    this.solutions[SolveJson.solution].selected = true;

                    if (this.solutions[SolveJson.solution].correct) {
                        this.solved = 1;
                    } else {
                        this.solved = 2;
                    }
                } else {
                    this.solutions[0].guessed = SolveJson.solution;

                    // FIXME: Should we just keep this as a string always?
                    if ((""+this.solutions[0].text) === SolveJson.solution) {
                        this.solved = 1;
                    } else {
                        this.solved = 2;
                    }
                }
            }

            console.log(this.discussions);
            console.log(ProblemJson);
        },
        computed: {
        },
        mounted: function() {

            this.showingAddSolutionContainer = false;
            $('#addSolutionContainer').hide();
            $('#addSolution').click(() => {
                this.showingAddSolutionContainer = !this.showingAddSolutionContainer;
                if (this.showingAddSolutionContainer) {
                    $('#addSolutionContainer').show();
                } else {
                    $('#addSolutionContainer').hide();
                }

                return false;
            });


            $('.reply-to-link').click((el) => {

                const cont = $('#replyToContainer');
                cont.remove();
                cont.appendTo( $(el.target).parent() );
                cont.show();

                const commentId = $(el.target).attr('comment-id');
                $('#replyToContainer [name="id"]').val(ProblemJson.id);
                $('#replyToContainer [name="parent_comment_id"]').val(commentId);

                $('#replyEditContainer').hide();
                return false;
            });

            // FIXME: use  @click.prevent="edit(...)"
            $('.reply-edit-link').click((el) => {

                const cont = $('#replyEditContainer');
                cont.remove();
                cont.appendTo( $(el.target).parent() );
                cont.show();

                const commentId = $(el.target).attr('comment-id');
                $('#replyEditContainer [name="id"]').val(commentId);

                let comment = $('.prblm-discussion-reply-content', $(el.target).parent().parent());
                if (comment.length === 0) {
                    comment = $('.prblm-discussion-content', $(el.target).parent().parent());
                }

                window['mountedEditor-editorreplyedit'].commands.clearContent();
                let jsonStr = comment.attr('rawcontent');
                if (jsonStr) {
                    json = JSON.parse(jsonStr);
                    window['mountedEditor-editorreplyedit'].commands.setContent( json );
                }

                //window['mountedEditor-editorreplyedit'].commands.setContent( comment.text() );

                $('#replyToContainer').hide();
                return false;
            });

            $('katex').each((idx, el) => {
                let isInline = el.attributes.length > 0 && el.attributes[0].nodeName === "inline";
                el.innerHTML = Katex.renderToString(el.textContent, {
                    displayMode: !isInline
                });
            });
        },
    });

    ProblemApp.component('reply', {
        props: {
            reply: Object
        },
        data() {
            return {
                id: 0,
                text: "",
                author: {},
                textRaw: ""
            }
        },
        beforeMount: function() {
            this.id = this.id;
            this.text = JSON_TO_HTML(this.reply.content);
            this.rawcontent = this.reply.content;
            this.author = ProblemJson.users[this.reply.author];
            this.date = this.reply.date;

            this.showReplyButton = function(){ return(UserJson.id && UserJson.id != this.reply.author); };
            this.showEditButton = function(){ return(UserJson.id && UserJson.id === this.reply.author); };
        },
        template: `
        <div class="prblm-discussion-reply">
            <div class="prblm-discussion-reply-content" v-html="reply.content" v-bind:rawcontent="reply.rawcontent"></div>
            <div class="reply-author">
                <span class="reply-author-name">{{ author.name }}</span>
                <span class="reply-author-date"> - {{ date }}</span>
            </div>
            <div class="reply-to">
                <a href="#" class='reply-to-link' v-bind:comment-id="reply.id" v-if="reply.showReplyButton()">Reply</a>
                <a href="#" class='reply-edit-link' v-bind:comment-id="reply.id" v-if="reply.showEditButton()">Edit</a>
            </div>
            <template v-if="reply.replies">
                <reply v-for="r in reply.replies" :reply="r"></reply>
            </template>
        </div>
        `
    });

    ProblemApp.component('replyTo', {

        template: `
        
        `
    });

    const mountedProblem = ProblemApp.mount('#app');
});
