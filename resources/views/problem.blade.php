<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Brilliant Community</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

        <!-- Styles -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css" integrity="sha512-NhSC1YmyruXifcj/KFRWoC561YpHpc5Jtzgvbuzx5VozKpWvQ+4nXhPdFgmx8xqexRcpAglTj9sIBWINXa8x5w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
        <link rel="stylesheet" href="/app.css" />

        <!-- Scripts -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
        <script src="https://unpkg.com/vue@next"></script>
        <script src="/problem.js"></script>
        <script>
            var ProblemJson = @json($problem, JSON_PRETTY_PRINT);
            var UserJson = @json($user, JSON_PRETTY_PRINT);
        </script>
    </head>
    <body class="antialiased">

        <!-- Header -->
        <header class="row hdr-main">
            <div class="col s12 container">
                <div class="col s4 push-s5 hdr-links">
                    <span class="hdr-link"><a href='#'>Today</a></span>
                    <span class="hdr-link"><a href='#'>Courses</a></span>
                    <span class="hdr-link"><a href='#'>Practice</a></span>
                </div>
                <div class="col s4 push-s6 hdr-btns">
                    <span class="hdr-btn login-btn"><a href='#'>Log In</a></span>
                    <span class="hdr-btn signup-btn"><a href='#'>Signup</a></span>
                </div>
            </div>
        </header>

        <!-- Content -->
        <div class="row ctnt-container">
        <div id="app" class="col s8 push-s2 ctnt-main prblm-container">
            <div class="ctnt-sections row">
                <div class="prblm-header">
                    <span class="prblm-title">@{{ this.title }}</span>
                    <div class="prblm-topiclevel">
                        <span class="prblm-topic">@{{ this.topic }}</span>
                        <span class="prblm-level">Level @{{ this.level }}</span>
                    </div>
                </div>

                <div class="prblm-question">
                    <div class="prblm-question-content col s9">
                        @{{ this.question }}
                    </div>

                    <div class="prblm-question-solution col s3">

                        <template v-for="solution in solutions">
                            <span class="prblm-solution-btn disabled" v-bind:class="[{ active: solution.selected }, { correct: solution.correct }]">
                                <span class="prblm-solution-bg">@{{ solution.correct ? "✓" : "" }}</span>
                                <span v-if="solution.selected" class="prblm-solution-picked"></span>
                                <span class="prblm-solution-text">@{{ solution.text }}</span>
                            </span>
                        </template>
                    </div>
                </div>

                <a v-bind:href="editQuestionUrl()" v-if="questionOwner()">Edit</a>

                <div class="prblm-question-footer">
                    <div class="prblm-question-author">
                        <div class="user-avatar">
                            <a href='#' class="avatar">
                                <img src="/sprites/default-avatar-globe.png" />
                            </a>
                        </div>

                        <div class="user-text">
                            <span> by </span>
                            <a href='#' class="author-name">@{{ this.author.name }}</a>
                            <span>, </span>
                            <span class="author-age">@{{ this.author.age }}</span>
                            <span>, </span>
                            <span class="author-place">@{{ this.author.place }}</span>
                        </div>
                    </div>
                </div>

                <hr/>

                <div class="prblm-discussions">
                    <span class="solutions">@{{ this.discussion.length }} Solutions</span>

                    <a id='addSolution' href='#'>Add Solution</a>
                    <div id='addSolutionContainer'>
                        <form method="POST" action="/comment">
                            @csrf

                            <input type="text" name="id" v-bind:value="this.id" style="display: none;" />
                            <input type="text" name="parent_comment_id" value="" style="display: none;" />

                            <input type="text" name="comment" value="{{ old('comment') }}" />
                            @error('comment')
                            <div class="alert alert-danger">{{ $message }}</div>
                            @enderror

                            <button>submit</button>
                        </form>
                    </div>

                    <div id='replyToContainer'>
                        <form method="POST" action="/comment">
                            @csrf

                            <input type="text" name="id" v-bind:value="this.id" style="display: none;" />
                            <input type="text" name="parent_comment_id" value="" style="display: none;" />

                            <input type="text" name="comment" value="{{ old('comment') }}" />
                            @error('comment')
                            <div class="alert alert-danger">{{ $message }}</div>
                            @enderror

                            <button>submit</button>
                        </form>
                    </div>

                    <div id='replyEditContainer'>
                        <form method="POST" action="/editcomment">
                            @csrf

                            <input type="text" name="id" v-bind:value="this.id" style="display: none;" />

                            <input type="text" name="comment" value="{{ old('comment') }}" />
                            @error('comment')
                            <div class="alert alert-danger">{{ $message }}</div>
                            @enderror

                            <button>submit</button>
                        </form>
                    </div>



                    <template v-for="discussion in discussions">
                        <div class="prblm-discussion">
                            <div class="prblm-discussion-author">
                                <div class="user-avatar">
                                    <a href='#' class="avatar">
                                        <img src="/sprites/default-avatar-globe.png" />
                                    </a>
                                </div>

                                <div class="user-text">
                                    <a href='#' class="author-name">@{{ this.users[discussion.author].name }}</a>
                                    <span class="author-date">@{{ discussion.date }}</span>
                                </div>
                            </div>

                            <div class="prblm-discussion-content">@{{ discussion.content }}</div>

                            <div class="prblm-discussion-reactions">
                                <span class="prblm-discussion-reaction reaction-helpful">@{{ discussion.reactions[0] }} Helpful</span>
                                <span class="prblm-discussion-reaction reaction-interesting">@{{ discussion.reactions[1] }} Interesting</span>
                                <span class="prblm-discussion-reaction reaction-brilliant">@{{ discussion.reactions[2] }} Brilliant</span>
                                <span class="prblm-discussion-reaction reaction-confused">@{{ discussion.reactions[3] }} Confused</span>
                            </div>

                            <div class="reply-to">
                                <a href="#" class='reply-to-link' v-bind:comment-id="discussion.id" v-if="discussion.showReplyButton()">Reply</a>
                                <a href="#" class='reply-edit-link' v-bind:comment-id="discussion.id" v-if="discussion.showEditButton()">Edit</a>
                            </div>

                            <div class="prblm-discussion-replies" v-if="discussion.replies">
                                <reply class="prblm-discussion-reply" v-for="reply in discussion.replies" :reply="reply"></reply>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        </div>
    </body>
</html>
