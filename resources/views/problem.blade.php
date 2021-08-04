<x-app-layout>

    @push('scripts')
        <script type="text/javascript" src="{{ asset('problem.js') }}"></script>
        <script>
            var ProblemJson = @json($problem, JSON_PRETTY_PRINT);
            var UserJson = @json($user, JSON_PRETTY_PRINT);

            @isset($solve)
                var SolveJson = @json($solve, JSON_PRETTY_PRINT);
            @else
                var SolveJson = null;
            @endisset
        </script>
    @endpush

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Problem') }}
        </h2>
    </x-slot>

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
                    <div class="prblm-question-content col s9" v-html="this.question"></div>

                    <div class="prblm-question-solution col s3">
                        <form method="POST" action="/solve" id="prblm-form-solve">
                        @csrf
                        <input type="text" id="prblm-solve-selected" name="solution" style="display: none;" />
                        <input type="text" name="id" v-bind:value="this.id" style="display: none;" />
                        <template v-for="(solution, idx) in solutions">
                            <span class="prblm-solution-btn" v-bind:class="[{ active: solution.selected }, { correct: solution.correct }, { disabled: solved }]" @click.prevent="solve(idx)">
                                <span class="prblm-solution-bg">@{{ solution.correct ? "✓" : "" }}</span>
                                <span v-if="solution.selected" class="prblm-solution-picked"></span>
                                <span class="prblm-solution-text">@{{ solution.text }}</span>
                            </span>
                        </template>
                        </form>
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
                    <div id='addSolutionContainer' class='hidden'>
                        <form method="POST" id="prblm-addsol-form" action="/comment">
                            @csrf
                            <input type="text" name="comment" style="display: none;" />

                            <input type="text" name="id" v-bind:value="this.id" style="display: none;" />
                            <input type="text" name="parent_comment_id" value="" style="display: none;" />

                            <tip-tap-form :name="`editoraddsolution`" :namepreview="`prevaddsolution`" :haspreview="false"></tip-tap-form>
                            @error('comment')
                            <div class="alert alert-danger">{{ $message }}</div>
                            @enderror

                            <div class="prblm-edit-footer">
                                <a href="#" class="prblm-edit-cancel" @click.prevent="cancel()">Cancel</a>
                                <a href="#" class="prblm-edit-save" @click.prevent="save('addsolution')">Save</a>
                            </div>
                        </form>
                    </div>

                    <div id='replyToContainer' class='hidden'>
                        <form method="POST" id="prblm-replyto-form" action="/comment">
                            @csrf

                            <input type="text" name="comment" style="display: none;" />
                            <input type="text" name="id" v-bind:value="this.id" style="display: none;" />
                            <input type="text" name="parent_comment_id" value="" style="display: none;" />

                            <tip-tap-form :name="`editorreplyto`" :namepreview="`prevreplyto`" :haspreview="false"></tip-tap-form>
                            @error('comment')
                            <div class="alert alert-danger">{{ $message }}</div>
                            @enderror

                            <div class="prblm-edit-footer">
                                <a href="#" class="prblm-edit-cancel" @click.prevent="cancel()">Cancel</a>
                                <a href="#" class="prblm-edit-save" @click.prevent="save('replyto')">Save</a>
                            </div>
                        </form>
                    </div>

                    <div id='replyEditContainer' class='hidden'>
                        <form method="POST" id="prblm-replyedit-form" action="/editcomment">
                            @csrf

                            <input type="text" name="comment" style="display: none;" />
                            <input type="text" name="id" v-bind:value="this.id" style="display: none;" />

                            <tip-tap-form :name="`editorreplyedit`" :namepreview="`prevreplyedit`" :haspreview="false"></tip-tap-form>
                            @error('comment')
                            <div class="alert alert-danger">{{ $message }}</div>
                            @enderror

                            <div class="prblm-edit-footer">
                                <a href="#" class="prblm-edit-cancel" @click.prevent="cancel()">Cancel</a>
                                <a href="#" class="prblm-edit-save" @click.prevent="save('replyedit')">Save</a>
                            </div>
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

                            <div class="prblm-discussion-content" v-html="discussion.content" v-bind:rawcontent="discussion.rawcontent"></div>

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
</x-app-layout>
