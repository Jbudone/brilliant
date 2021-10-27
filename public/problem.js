const { TipTapForm, Vote, Mention, Report } = VueComponents;

$(document).ready(() => {

    // FIXME: Use Vuex to avoid this
    let onCommentVote, onCommentReport, onCommentUnreport, onAdminAction;

    const Global = {
        isDiscussion: false,
    };

    for (var g in window.globals) {
        Global[g] = window.globals[g];
    }

    for (var g in window.BladeGlobals) {
        Global[g] = window.BladeGlobals[g];
    }

    const ProblemApp = Vue.createApp({
        components: {
            TipTapForm, Vote, Mention, Report
        },
        data: function() {
            return {
                Global: Global,
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
                
                isHidden: false,
                solved: 0,

                points: 0,
                voted: 0,
                reported: false
            };
        },
        methods: {

            questionOwner() { return (this.author.id === Global.UserJson.id); },
            editQuestionUrl() { return ('/edit/' + this.id); },

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
                    id: Global.ProblemJson.id
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
                    problem_id: Global.ProblemJson.id,
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
                    problem_id: Global.ProblemJson.id,
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
            this.jsonData = Global.ProblemJson;

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
            Global.isDiscussion = this.jsonData.discussion;
            this.isHidden = this.jsonData.hidden;
            this.archived = !!this.jsonData.source;

            this.points = this.jsonData.points;
            this.voted = 0;
            if (Global.VoteJson) {

                // Setup VoteJson as map { comment_id: upvote }
                let tmp = {};
                for (let i = 0; i < Global.VoteJson.length; ++i) {
                    const vote = Global.VoteJson[i];
                    let voteId = vote.comment_id || 0;
                    tmp[voteId] = vote.upvote;
                }
                Global.VoteJson = tmp;

                this.voted = (0 in Global.VoteJson) ? (Global.VoteJson[0] ? 1 : 2) : 0;
            }

            this.reported = false;
            if (Global.ReportJson) {

                // Setup ReportJson as map { comment_id }
                let tmp = {};
                for (let i = 0; i < Global.ReportJson.length; ++i) {
                    const report = Global.ReportJson[i];
                    let reportId = report.comment_id || 0;
                    tmp[reportId] = true;
                }
                Global.ReportJson = tmp;

                this.reported = (0 in Global.ReportJson) ? true : false;
            }

            this.hasReport = false;
            if (Global.AllReportJson) {

                // Setup ReportJson as map { comment_id }
                let tmp = {};
                for (let i = 0; i < Global.AllReportJson.length; ++i) {
                    const report = Global.AllReportJson[i];
                    let reportId = report.comment_id || 0;
                    tmp[reportId] = true;
                }
                Global.AllReportJson = tmp;

                this.hasReport = (0 in Global.AllReportJson) ? true : false;
            }

            onCommentVote = this.vote;
            onCommentReport = this.report;
            onCommentUnreport = this.unreport;
            onAdminAction = this.adminAction;


            if (Global.isDiscussion) {

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
                if (!Global.SolveJson) {
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

                    showReplyButton: function(){ return(!Global.ProblemJson.source && Global.UserJson.id && Global.UserJson.id != comment.author); },
                    showEditButton: function(){ return(!Global.ProblemJson.source && Global.UserJson.id && Global.UserJson.id === comment.author); },
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

            if (Global.SolveJson) {
                if (Global.SolveJson.solution === null) {
                    // User gave up
                    this.solved = 2;
                } else {
                    if (this.solutions.length > 1) {
                        this.solutions[Global.SolveJson.solution].selected = true;

                        if (this.solutions[Global.SolveJson.solution].correct) {
                            this.solved = 1;
                        } else {
                            this.solved = 2;
                        }
                    } else {
                        this.solutions[0].guessed = Global.SolveJson.solution;

                        // FIXME: Should we just keep this as a string always?
                        if ((""+this.solutions[0].text) === Global.SolveJson.solution) {
                            this.solved = 1;
                        } else {
                            this.solved = 2;
                        }
                    }
                }
            }

            console.log(this.discussions);
            console.log(Global.ProblemJson);
        },
        computed: {
        },
        mounted: function() {

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

    var DiscussionComponent = ProblemApp.component('discussionsection', {
        components: {
            TipTapForm
        },
        props: {
            discussions: Array,
        },
        data() {
            return {
                errors: {},
                isCommenting: false,

                Global: Global,
            }
        },
        methods: {

            error(name) {
                return this.errors[name];
            },

            doComment: function() {
                this.isCommenting = true;
            },

            cancel: function() {
                this.isCommenting = false;

                this.errors = {};
            },

            save: function() {
                let bodyDeflated = this.$refs.comment.deflated();

                const req = {};
                req['comment'] = bodyDeflated;

                let action = '/comment';
                req['problem_id'] = Global.ProblemJson.id;

                axios.post(action, req)
                    .then((response) => {
                        if (response.data.id) {
                            window.location = `/problem/${Global.ProblemJson.id}`;
                        } else {
                            this.errors = response.data.errors;
                            console.log(response);
                        }
                    })
                    .catch((err) => {
                        // This happens if we return non-successful status code
                        console.error(err);
                    });
            }
        },
        beforeMount: function() {

        },

        // FIXME: Move template to blade and attach this app to the template?
        template: `
<div class="prblm-discussions">
    <div class="mb-4">
        <span v-if="Global.isDiscussion" class="solutions text-xl">{{ this.discussions.length }} Comments</span>
        <span v-else class="solutions text-xl">{{ this.discussions.length }} Solutions</span>

        <span class="block text-grey-800 text-lg" v-if="!Global.isDiscussion && this.discussions.length == 0">No explanations have been posted yet. Check back later!</span>
        <a v-if="!archived" href='#' id="addSolution" @click.prevent="doComment">Add Solution</a>
    </div>
    <div id='addSolutionContainer' v-if="isCommenting">
        <tip-tap-form ref="comment" :haspreview="true"></tip-tap-form>
        <div v-if="errors" class="alert alert-danger">
            <ul>
                <template ref="comment" v-for="(errList, name) in errors"><template v-for="error in errList">
                <li>{{ error }}</li>
                </template></template>
            </ul>
        </div>

        <div class="prblm-edit-footer">
            <a href="#" class="prblm-edit-cancel" @click.prevent="cancel">Cancel</a>
            <a href="#" class="prblm-edit-save" @click.prevent="save">Save</a>
        </div>
    </div>
    <template v-for="discussion in discussions">
        <Comment
            :comment="discussion"
            :parent="{}"
        ></Comment>
    </template>
</div>`
    });


    var Comment = DiscussionComponent.component('Comment', {
        components: {
            Vote, Report, TipTapForm
        },
        props: {
            comment: Object,
            parent: Object
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
                Global: Global,
                errors: {},

                isCommenting: false
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
            },

            error(name) {
                return this.errors[name];
            },

            doComment: function() {
                this.isCommenting = true;
            },

            cancel: function() {
                this.isCommenting = false;

                this.errors = {};
            },

            getCommentEdit: function() {
                if (Global.UserJson.id === this.comment.author) {
                    let json = ENCODED_TO_JSON(this.comment.rawcontent);
                    return GenerateHTML(json, VueHTMLExtensions);
                }

                return "";
            },

            save: function() {
                let bodyDeflated = this.$refs.comment.deflated();

                const req = {};
                req['comment'] = bodyDeflated;

                let action;
                if (Global.UserJson.id === this.comment.author) {
                    action = '/editcomment';
                    req['id'] = this.id;
                } else {
                    action = '/comment';
                    req['problem_id'] = Global.ProblemJson.id;
                    req['parent_comment_id'] = this.id;
                }

                axios.post(action, req)
                    .then((response) => {
                        if (response.data.id) {
                            window.location = `/problem/${Global.ProblemJson.id}`;
                        } else {
                            this.errors = response.data.errors;
                            console.log(response);
                        }
                    })
                    .catch((err) => {
                        // This happens if we return non-successful status code
                        console.error(err);
                    });
            }
        },
        beforeMount: function() {
            this.id = this.comment.id;
            this.text = JSON_TO_HTML(this.comment.content);
            this.rawcontent = this.comment.content;
            this.author = Global.ProblemJson.users[this.comment.author];
            this.date = this.comment.date;

            this.showReplyButton = function(){ return(!Global.ProblemJson.source && Global.UserJson.id && Global.UserJson.id != this.comment.author); };
            this.showEditButton = function(){ return(!Global.ProblemJson.source && Global.UserJson.id && Global.UserJson.id === this.comment.author); };

            this.voted = (Global.VoteJson && this.id in Global.VoteJson) ? (Global.VoteJson[this.id] ? 1 : 2) : 0;
            this.points = this.comment.points;
            this.reported = (Global.ReportJson && this.id in Global.ReportJson) ? true : false;
            this.hasReport = (Global.AllReportJson && this.id in Global.AllReportJson) ? true : false;

            this.hidden = this.comment.hidden;
            if (this.hidden) {
                this.comment.content = "<em>Comment has been hidden</em>";
            }

            this.isAuthor = (Global.UserJson.id && Global.UserJson.id === this.comment.author);
        },

        // FIXME: Move template to blade and attach this app to the template? Otherwise separate to html file?
        template: `
<div class="prblm-discussion">
    <div class="prblm-discussion-author">
        <div class="user-avatar">
            <a href='#' class="avatar">
                <img src="/sprites/default-avatar-globe.png" />
            </a>
        </div>

        <div class="float-right text-right -mt-2">
            <Vote ref="vote" :initialvote="(Global.VoteJson ? comment.id in Global.VoteJson : 0) ? Global.VoteJson[comment.id] ? 1 : 2 : 0" :initialpoints="comment.points" :id="comment.id" v-on:vote="this.vote"></Vote>
            <Report :initialreport="Global.ReportJson && Global.ReportJson[comment.id] ? true : false" :id="comment.id" v-on:report="this.report" v-on:unreport="this.unreport"></Report>
            <template v-if="Global.UserJson.canmoderate">
                <a href="" class="inline-block" v-bind:class="[{ 'text-red-500': Global.AllReportJson && Global.AllReportJson[comment.id] }]" @click.prevent="this.adminAction(hidden ? 'unhide' : 'hide', comment.id)">{{ hidden ? "👁":  Global.AllReportJson && Global.AllReportJson[comment.id] ? "👁⨂" : "👁" }}</a>
            </template>
        </div>

        <div class="user-text">
            <a href='#' class="author-name">{{ Global.ProblemJson.users[comment.author].name }}</a>
            <span class="author-date">{{ comment.date }}</span>
        </div>
    </div>

    <div class="prblm-discussion-content" v-html="hidden ? '<em>Solution has been hidden</em>' : comment.content" v-bind:rawcontent="rawcontent"></div>

    <div v-if="comment.reactions" class="prblm-discussion-reactions">
        <span class="prblm-discussion-reaction reaction-helpful">{{ comment.reactions[0] }} Helpful</span>
        <span class="prblm-discussion-reaction reaction-interesting">{{ comment.reactions[1] }} Interesting</span>
        <span class="prblm-discussion-reaction reaction-brilliant">{{ comment.reactions[2] }} Brilliant</span>
        <span class="prblm-discussion-reaction reaction-confused">{{ comment.reactions[3] }} Confused</span>
    </div>

    <div class="reply-to">
        <template v-if="showReplyButton()">
            <a href="#" class='reply-to-link' v-bind:comment-id="id" @click.prevent="doComment">Reply</a>
        </template><template v-else-if="showEditButton()">
            <a href="#" class='reply-edit-link' v-bind:comment-id="id" @click.prevent="doComment">Edit</a>
        </template>

        <template v-if="isCommenting">
            <tip-tap-form ref="comment" :haspreview="true" :value="getCommentEdit()"></tip-tap-form>
            <div v-if="errors" class="alert alert-danger">
                <ul>
                    <template v-for="(errList, name) in errors"><template v-for="error in errList">
                    <li>{{ error }}</li>
                    </template></template>
                </ul>
            </div>
            <div class="prblm-edit-footer">
                <a href="#" class="prblm-edit-cancel" @click.prevent="cancel">Cancel</a>
                <a href="#" class="prblm-edit-save" @click.prevent="save">Save</a>
            </div>
        </template>
    </div>

    <div class="prblm-discussion-replies" v-if="comment.replies">
        <Comment class="prblm-discussion-reply" v-for="reply in comment.replies" :comment="reply" :parent="{}"></Comment>
    </div>
</div>`
    });

    const mountedProblem = ProblemApp.mount('#app');
});
