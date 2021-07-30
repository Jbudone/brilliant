$(document).ready(() => {
    const problem = Vue.createApp({
        data: function() {
            return {
                jsonData: [],

                id: 0,
                title: "",
                topic: "",
                level: 0,
                author: {},
                question: "",
                solutions: {},
                discussion: [],
                users: {}
            };
        },
        methods: {

            questionOwner() { return (this.author.id === UserJson.id); },
            editQuestionUrl() { return ('/edit/' + this.id); },
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
            this.question = this.jsonData.body.substr(solutionLen + solutionStart);

            // Build discussions from flattened comments
            this.discussions = [];
            const discussionComments = {};
            for (let i = 0; i < this.jsonData.comments.length; ++i) {
                const comment = this.jsonData.comments[i],
                    author = this.users[comment.author];

                const discussionComment = {
                    id: comment.id,
                    content: comment.body,
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


            console.log(this.discussions);
            console.log(ProblemJson);


            let showingAddSolutionContainer = false;
            $('#addSolutionContainer').hide();
            $('#addSolution').click(() => {
                showingAddSolutionContainer = !showingAddSolutionContainer;
                if (showingAddSolutionContainer) {
                    $('#addSolutionContainer').show();
                } else {
                    $('#addSolutionContainer').hide();
                }

                return false;
            });
        },
        computed: {
        },
        mounted: function() {
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

            $('.reply-edit-link').click((el) => {

                const cont = $('#replyEditContainer');
                cont.remove();
                cont.appendTo( $(el.target).parent() );
                cont.show();

                const commentId = $(el.target).attr('comment-id');
                $('#replyEditContainer [name="id"]').val(commentId);

                $('#replyToContainer').hide();
                return false;
            });
        },
    });

    problem.component('reply', {
        props: {
            reply: Object
        },
        data() {
            return {
                id: 0,
                text: "",
                author: {},
            }
        },
        beforeMount: function() {
            this.id = this.id;
            this.text = this.reply.content;
            this.author = ProblemJson.users[this.reply.author];
            this.date = this.reply.date;

            this.showReplyButton = function(){ return(UserJson.id && UserJson.id != this.reply.author); };
            this.showEditButton = function(){ return(UserJson.id && UserJson.id === this.reply.author); };
        },
        template: `
        <div class="prblm-discussion-reply">
            <div class="prblm-discussion-reply-content">{{ reply.content }}</div>
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

    const mountedProblem = problem.mount('#app');
});
