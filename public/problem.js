const { TipTapForm, Vote, Mention, Report } = VueComponents;

$(document).ready(() => {

    // FIXME: Use Vuex to avoid this
    let onCommentVote, onCommentReport, onCommentUnreport, onAdminAction;


    const ProblemApp = Vue.createApp({
        components: {
            TipTapForm, Vote, Mention, Report
        },
        data: function() {
            return {
                globals: window.globals,
                global: window,
                jsonData: [],

                id: 0,
                archived: false,
                title: "",
                topic: "",
                level: 0,
                author: {},
                question: "",
                solutions: {},
                discussions: [],
                users: {},
                
                isDiscussion: false,
                isHidden: false,
                solved: 0,
                showingAddSolutionContainer: false,

                points: 0,
                voted: 0,
                reported: false
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
            },

            giveup() {
                let post = '/giveup';
                let req = {
                    id: ProblemJson.id
                };

                axios.post(post, req)
                    .then(function (response) {
                        console.log(response);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

                location.reload();
            },

            vote(prev, next, commentId) {
                let upvote = (next === 1);
                let post = '/vote';
                let req = {
                    problem_id: ProblemJson.id,
                    comment_id: commentId ? commentId : null,
                    upvote: upvote
                };


                let unvote = (next === 0);
                if (unvote) {
                    post = '/unvote';
                    delete req.upvote;
                }

                axios.post(post, req)
                    .then(function (response) {
                        console.log(response);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            },

            report(commentId) {
                let post = '/report';
                let req = {
                    problem_id: ProblemJson.id,
                    comment_id: commentId ? commentId : null,
                };

                axios.post(post, req)
                    .then(function (response) {
                        console.log(response);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            },

            unreport(commentId) {
                let post = '/unreport';
                let req = {
                    problem_id: ProblemJson.id,
                    comment_id: commentId ? commentId : null,
                };

                axios.post(post, req)
                    .then(function (response) {
                        console.log(response);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            },

            adminAction(action, commentId) {
                let post = '/adminaction';
                let req = {
                    problem_id: ProblemJson.id,
                    comment_id: commentId ? commentId : null,
                    action: action
                };

                axios.post(post, req)
                    .then(function (response) {
                        console.log(response);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });

                location.reload();
            }
        },
        beforeMount: function() {
            this.jsonData = ProblemJson;

            this.id    = this.jsonData.id;
            this.title = this.jsonData.title;
            this.titleHtml = TITLE_TO_HTML(this.title);
            this.topic = this.jsonData.topic;
            this.level = this.jsonData.level || 1;
            this.author = {
                id: this.jsonData.author,
                name: this.jsonData.users[this.jsonData.author].name
            };
            this.users = this.jsonData.users;
            this.isDiscussion = this.jsonData.discussion;
            this.isHidden = this.jsonData.hidden;
            this.archived = !!this.jsonData.source;

            this.points = this.jsonData.points;
            this.voted = 0;
            if (VoteJson) {

                // Setup VoteJson as map { comment_id: upvote }
                let tmp = {};
                for (let i = 0; i < VoteJson.length; ++i) {
                    const vote = VoteJson[i];
                    let voteId = vote.comment_id || 0;
                    tmp[voteId] = vote.upvote;
                }
                VoteJson = tmp;

                this.voted = (0 in VoteJson) ? (VoteJson[0] ? 1 : 2) : 0;
            }

            this.reported = false;
            if (ReportJson) {

                // Setup ReportJson as map { comment_id }
                let tmp = {};
                for (let i = 0; i < ReportJson.length; ++i) {
                    const report = ReportJson[i];
                    let reportId = report.comment_id || 0;
                    tmp[reportId] = true;
                }
                ReportJson = tmp;

                this.reported = (0 in ReportJson) ? true : false;
            }

            this.hasReport = false;
            if (window['AllReportJson']) {

                // Setup ReportJson as map { comment_id }
                let tmp = {};
                for (let i = 0; i < AllReportJson.length; ++i) {
                    const report = AllReportJson[i];
                    let reportId = report.comment_id || 0;
                    tmp[reportId] = true;
                }
                AllReportJson = tmp;

                this.hasReport = (0 in AllReportJson) ? true : false;
            }

            onCommentVote = this.vote;
            onCommentReport = this.report;
            onCommentUnreport = this.unreport;
            onAdminAction = this.adminAction;


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
                    points: comment.points,
                    coins: comment.coins,
                    hidden: comment.hidden,
                    date: (new Date(comment.date)).toDateString(),

                    showReplyButton: function(){ return(!ProblemJson.source && UserJson.id && UserJson.id != comment.author); },
                    showEditButton: function(){ return(!ProblemJson.source && UserJson.id && UserJson.id === comment.author); },
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
                if (SolveJson.solution === null) {
                    // User gave up
                    this.solved = 2;
                } else {
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

            // FIXME: Is there a way to automate this by making a katex.vue and reactively converting?
            $('katex').each((idx, el) => {
                let isInline = el.attributes.length > 0 && el.attributes[0].nodeName === "inline";
                el.innerHTML = Katex.renderToString(el.textContent, {
                    displayMode: !isInline,
                    throwOnError: false
                });
            });

            // FIXME: This is disgusting
            $('mention').each((idx, el) => {
                el.innerHTML = el.innerText;
                const aEl = $('a', $(el));
                aEl.attr('href', '#');
            });
        },
    });

    ProblemApp.component('reply', {
        components: {
            Vote, Report
        },
        props: {
            reply: Object
        },
        data() {
            return {
                id: 0,
                text: "",
                author: {},
                textRaw: "",
                voted: 0,
                points: 0,
                reported: false,
                hidden: false,
                globals: window // FIXME: Need to access window from template for this
            }
        },
        methods: {
            vote: (prev, next, id) => {
                onCommentVote(prev, next, id);
            },

            report: (id) => {
                onCommentReport(id);
            },

            unreport: (id) => {
                onCommentUnreport(id);
            },

            adminaction: (action, id) => {
                onAdminAction(action, id);
            }
        },
        beforeMount: function() {
            this.id = this.reply.id;
            this.text = JSON_TO_HTML(this.reply.content);
            this.rawcontent = this.reply.content;
            this.author = ProblemJson.users[this.reply.author];
            this.date = this.reply.date;

            this.showReplyButton = function(){ return(!ProblemJson.source && UserJson.id && UserJson.id != this.reply.author); };
            this.showEditButton = function(){ return(!ProblemJson.source && UserJson.id && UserJson.id === this.reply.author); };

            this.voted = (VoteJson && this.id in VoteJson) ? (VoteJson[this.id] ? 1 : 2) : 0;
            this.points = this.reply.points;
            this.reported = (ReportJson && this.id in ReportJson) ? true : false;
            this.hasReport = (AllReportJson && this.id in AllReportJson) ? true : false;

            this.hidden = this.reply.hidden;
            if (this.hidden) {
                this.reply.content = "<em>Comment has been hidden</em>";
            }
        },
        template: `
        <div class="prblm-discussion-reply">
            <div class="prblm-discussion-reply-content" v-html="reply.content" v-bind:rawcontent="reply.rawcontent"></div>
            <div class="reply-author">
                <span class="reply-author-name">{{ author.name }}</span>
                <span class="reply-author-date"> - {{ date }}</span>
                <div class="inline ml-8">
                    <Vote ref="vote" :inline="true" :initialvote="this.voted" :initialpoints="this.points" :id="this.id" v-on:vote="this.vote"></Vote>
                    <Report :inline="true" :initialreport="this.reported" :id="this.id" v-on:report="this.report" v-on:unreport="this.unreport"></Report>
                    <template v-if="globals.UserJson.canmoderate">
                        <a href="" class="inline-block"  v-bind:class="[{ 'text-red-500': this.hasReport }]" @click.prevent="adminaction(this.hidden ? 'unhide' : 'hide', this.id)">{{ this.hidden ? "👁" : this.hasReport ? "👁⨂" : "👁" }}</a>
                    </template>
                </div>
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
