<x-app-layout>

    @section('pageTitle', $problem['title'])
    @push('scripts')
        <script type="text/javascript" src="{{ asset('problem.js?' . Str::random(40)) }}"></script>
        <script>
            var ProblemJson = @json($problem, JSON_PRETTY_PRINT);
            var UserJson = @json($user, JSON_PRETTY_PRINT);

            @isset($solve)
                var SolveJson = @json($solve, JSON_PRETTY_PRINT);
            @else
                var SolveJson = null;
            @endisset

            @isset($vote)
                var VoteJson = @json($vote, JSON_PRETTY_PRINT);
            @else
                var VoteJson = null;
            @endisset

            @isset($report)
                var ReportJson = @json($report, JSON_PRETTY_PRINT);
            @else
                var ReportJson = null;
            @endisset

            @isset($allReports)
                var AllReportJson = @json($allReports, JSON_PRETTY_PRINT);
            @else
                var AllReportJson = null;
            @endisset
        </script>
    @endpush

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Problem') }}
        </h2>
    </x-slot>

    <!-- Content -->
    <div class="sm:w-3/5 m-auto mt-6 font-serif">
        <div id="app" class="ctnt-main prblm-container">
            <div class="ctnt-sections">
                <div class="px-4">
                <div class="prblm-header">
                    <div class="block text-red-500 text-2xl text-center">
                        <template v-if="isHidden">
                            PROBLEM HAS BEEN HIDDEN
                        </template>
                        <template v-else-if="hasReport && global.UserJson.canmoderate">
                            PROBLEM HAS BEEN REPORTED
                        </template>

                        <template v-if="archived">
                            THIS IS AN ARCHIVED PROBLEM
                        </template>
                    </div>

                    <span class="prblm-title" v-html="this.titleHtml"></span>

                    @if($source)
                    <template v-if="isDiscussion">
                        <a href="/brilliantexport/discussions/thread/{{ $source }}/{{ $source }}.html" class="prblm-original -mt-5">original</a>
                    </template><template v-else>
                        <a href="/brilliantexport/problems/{{ $source }}/{{ $source }}.html" class="prblm-original -mt-5">original</a>
                    </template>
                    <br/>
                    @endif
                    </template>
                    <div class="float-right text-right -mt-6">
                        <Vote ref="vote" :initialvote="this.voted" :initialpoints="this.points" :id="0" v-on:vote="this.vote"></Vote>
                        <Report ref="report" :inline="true" :initialreport="this.reported" :id="0" v-on:report="this.report" v-on:unreport="this.unreport"></Report>
@can('moderate')
                        <div class="inline">
                            <a href="" class="" v-bind:class="[{ 'text-red-600': this.isHidden }]" @click.prevent="adminAction(this.isHidden ? 'unhide' : 'hide', 0)">@{{ this.isHidden ? "👁":  this.hasReport ? "👁⨂" : "👁" }}</a>
                        </div>
@endcan
                    </div>
                    <div class="prblm-topiclevel">
                        <span class="prblm-topic">@{{ this.topic }}</span>
                        <span class="prblm-level">Level @{{ this.level }}</span>
                    </div>
                </div>

                <div class="prblm-question md:grid md:grid-cols-7 md:gap-4">

                    <!-- Question Body -->
                    <div class="prblm-question-content md:col-span-5" v-bind:class="[{ 'md:col-span-7': this.isDiscussion }]" v-html="this.question"></div>

                    <!-- Answers -->
                    <div v-if="!this.isDiscussion" class="prblm-question-solution md:col-span-2 md:px-4">
                        <form method="POST" action="/solve" id="prblm-form-solve" ref="formSolve">
                        @csrf
                        <input type="text" id="prblm-solve-selected" name="solution" style="display: none;" ref="formAnswer" />
                        <input type="text" name="id" v-bind:value="this.id" style="display: none;" />

                        <!-- Multiple Choice -->
                        <template v-if="solutions.length > 1">
                            <template v-for="(solution, idx) in solutions">
                                <span class="prblm-solution-btn" v-bind:class="[{ active: solution.selected }, { correct: solution.correct }, { disabled: solved }]" @click.prevent="solve(idx)">
                                    <span v-if="solved" class="prblm-solution-bg">@{{ solution.correct ? "✓" : solution.selected ? "✗" : "" }}</span>
                                    <span v-if="solution.selected" class="prblm-solution-picked"></span>
                                    <span class="prblm-solution-text" v-html="solution.html"></span>
                                </span>
                            </template>
@can('moderate')
                            <template v-if="solved">
                            <a href="" class="inline-block w-full border border-gray-700 rounded shadow bg-gray-100 text-black text-center py-1 my-4" @click.prevent="unsolve()">Unsolve</a>
                            </template>
@endcan
                            <template v-if="!solved">
                            <a href="" class="inline-block w-full border border-gray-700 rounded shadow bg-gray-100 text-black text-center py-1 my-4" @click.prevent="giveup()">View Solutions</a>
                            </template>
                        </template>

                        <!-- Single Answer: Solved -->
                        <template v-else-if="solutions.length == 1 && solved">
                            <span class="block w-full text-2xl">The answer is @{{ solutions[0].text }}.</span>

                            <template v-if="solved == 1">
                                <span class="block w-full text-2xl">You answered correctly.</span>
                            </template>
                            <template v-else>
                                <span class="block w-full text-2xl">You guessed @{{ solutions[0].guessed }}.</span>
                            </template>

@can('moderate')
                            <a href="" class="inline-block w-full border border-gray-700 rounded shadow bg-gray-100 text-black text-center py-1 my-4" @click.prevent="unsolve()">Unsolve</a>
@endcan
                        </template>

                        <!-- Single Answer: Unsolved -->
                        <template v-else>
                            <div class="">
                                <input class="w-full border border-gray-700 shadow-inner bg-gray-50 bg-opacity-50 px-2 py-1 mb-8" placeholder="Your Answer" ref="solutionInput" />

                                <a href="" class="block w-full border border-gray-700 rounded shadow bg-sky-400 text-black text-center py-1 my-4" @click.prevent="solve()">Submit</a>
                                <a href="" class="block w-full border border-gray-700 rounded shadow bg-gray-100 text-black text-center py-1 my-4" @click.prevent="giveup()">View Solutions</a>
                            </div>
                        </template>
                        </form>

                        <template v-if="solved">
                            <form method="POST" action="/unsolve" ref="formUnsolve">
                                @csrf
                                <input type="text" name="id" v-bind:value="this.id" style="display: none;" />
                            </form>
                        </template>
                    </div>
                </div>

                <a v-bind:href="editQuestionUrl()" v-if="questionOwner()">Edit</a>

                <!-- Footer -->
                <div class="prblm-question-footer mt-8">
                    <div class="prblm-question-author flex">
                        <div class="user-avatar">
                            <a href='#' class="avatar">
                                <img src="/sprites/default-avatar-globe.png" />
                            </a>
                        </div>

                        <div class="user-text">
                            <span class="leading-8"> by </span>
                            <a href='#' class="author-name leading-8">@{{ this.author.name }}</a>
                            <template v-if="this.author.age">
                                <span class="leading-8">, </span>
                                <span class="author-age leading-8">@{{ this.author.age }}</span>
                            </template>
                            <template v-if="this.author.place">
                                <span class="leading-8">, </span>
                                <span class="author-place leading-8">@{{ this.author.place }}</span>
                            </template>
                        </div>
                    </div>
                </div>
                </div>

                <template v-if="isDiscussion || solved">
                <hr/>
                <div class="prblm-discussions">
                    <div class="mb-4">
                        <span v-if="isDiscussion" class="solutions text-xl">@{{ this.discussions.length }} Comments</span>
                        <span v-else class="solutions text-xl">@{{ this.discussions.length }} Solutions</span>

                        <span class="block text-grey-800 text-lg" v-if="!isDiscussion && this.discussions.length == 0">No explanations have been posted yet. Check back later!</span>
                        <a v-if="!archived" id='addSolution' href='#'>Add Solution</a>
                    </div>
                    <div id='addSolutionContainer' class='hidden'>
                        <form method="POST" id="prblm-addsol-form" action="/comment">
                            @csrf
                            <input type="text" name="comment" style="display: none;" />

                            <input type="text" name="id" v-bind:value="this.id" style="display: none;" />
                            <input type="text" name="parent_comment_id" value="" style="display: none;" />

                            <tip-tap-form :name="`editoraddsolution`" :namepreview="`prevaddsolution`" :haspreview="true"></tip-tap-form>
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

                            <tip-tap-form :name="`editorreplyto`" :namepreview="`prevreplyto`" :haspreview="true"></tip-tap-form>
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

                            <tip-tap-form :name="`editorreplyedit`" :namepreview="`prevreplyedit`" :haspreview="true"></tip-tap-form>
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

                                <div class="float-right text-right -mt-2">
                                    <Vote ref="vote" :initialvote="(global.VoteJson ? discussion.id in global.VoteJson : 0) ? global.VoteJson[discussion.id] ? 1 : 2 : 0" :initialpoints="discussion.points" :id="discussion.id" v-on:vote="this.vote"></Vote>
                                    <Report :initialreport="global.ReportJson && global.ReportJson[discussion.id] ? true : false" :id="discussion.id" v-on:report="this.report" v-on:unreport="this.unreport"></Report>
                                    <template v-if="global.UserJson.canmoderate">
                                        <a href="" class="inline-block" v-bind:class="[{ 'text-red-500': global.AllReportJson && global.AllReportJson[discussion.id] }]" @click.prevent="this.adminAction(discussion.hidden ? 'unhide' : 'hide', discussion.id)">@{{ discussion.hidden ? "👁":  global.AllReportJson && global.AllReportJson[discussion.id] ? "👁⨂" : "👁" }}</a>
                                    </template>
                                </div>

                                <div class="user-text">
                                    <a href='#' class="author-name">@{{ this.users[discussion.author].name }}</a>
                                    <span class="author-date">@{{ discussion.date }}</span>
                                </div>
                            </div>

                            <div class="prblm-discussion-content" v-html="discussion.hidden ? '<em>Solution has been hidden</em>' : discussion.content" v-bind:rawcontent="discussion.rawcontent"></div>

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
                </template>
            </div>
        </div>
    </div>
</x-app-layout>
