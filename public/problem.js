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
                discussion: [],
                users: {},
                
                solved: false,
                showingAddSolutionContainer: false
            };
        },
        methods: {

            questionOwner() { return (this.author.id === UserJson.id); },
            editQuestionUrl() { return ('/edit/' + this.id); },

            save(el) {
                if (el === 'replyto') {
                    let body = window['mountedEditor-editorreplyto'].getJSON();
                    body = JSON.stringify(body);
                    $('#prblm-replyto-form [name="comment"]').val(body);
                    $('#prblm-replyto-form').submit();

                } else if (el === 'replyedit') {
                    let body = window['mountedEditor-editorreplyedit'].getJSON();
                    body = JSON.stringify(body);
                    $('#prblm-replyedit-form [name="comment"]').val(body);
                    $('#prblm-replyedit-form').submit();
                } else if (el === 'addsolution') {
                    let body = window['mountedEditor-editoraddsolution'].getJSON();
                    body = JSON.stringify(body);
                    $('#prblm-addsol-form [name="comment"]').val(body);
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
                $('#prblm-solve-selected').val(idx);
                $('#prblm-form-solve').submit();
            }
        },
        beforeMount: function() {
            this.jsonData = ProblemJson;

            this.id    = this.jsonData.id;
            this.title = this.jsonData.title;
            this.topic = this.jsonData.topic;
            this.level = this.jsonData.level;
            this.author = {
                id: this.jsonData.author,
                name: this.jsonData.users[this.jsonData.author].name
            };
            this.users = this.jsonData.users;
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

            this.question = this.jsonData.body.substr(solutionLen + solutionStart);
            this.question = JSON_TO_HTML(this.question);

            // Build discussions from flattened comments
            this.discussions = [];
            const discussionComments = {};
            for (let i = 0; i < this.jsonData.comments.length; ++i) {
                const comment = this.jsonData.comments[i],
                    author = this.users[comment.author];

                console.log(comment.body);
                const discussionComment = {
                    id: comment.id,
                    rawcontent: comment.body,
                    content: JSON_TO_HTML(comment.body),
                    author: comment.author,
                    date: comment.date,

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
                this.solutions[SolveJson.solution].selected = true;
                this.solved = true;
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
                el.innerHTML = Katex.renderToString(el.innerHTML, {});
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
