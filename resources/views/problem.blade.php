<x-app-layout>

    @section('pageTitle', $problem['title'])
    @push('scripts')
        <script type="text/javascript" src="{{ asset('problem.js?' . Str::random(40)) }}"></script>
        <script>
            window.BladeGlobals = {
                ProblemJson: @json($problem, JSON_PRETTY_PRINT),
                UserJson: @json($user, JSON_PRETTY_PRINT),

                SolveJson:     @isset($solve)      @json($solve, JSON_PRETTY_PRINT) @else null @endisset ,
                VoteJson:      @isset($vote)       @json($vote, JSON_PRETTY_PRINT) @else null @endisset ,
                ReportJson:    @isset($report)     @json($report, JSON_PRETTY_PRINT) @else null @endisset ,
                AllReportJson: @isset($allReports) @json($allReports, JSON_PRETTY_PRINT) @else null @endisset ,

                p1: @isset($p1) @json($p1, JSON_PRETTY_PRINT) @else null @endisset ,
                potwList: @isset($weeks) @json($weeks, JSON_PRETTY_PRINT) @else null @endisset ,
            };
        </script>
    @endpush

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Problem') }}
        </h2>
    </x-slot>

    <!-- Content -->

    <div class="sm:w-3/5 m-auto font-serif">
        <div id="app" class="ctnt-main prblm-container" style="padding: 0px 0px 16px 0px;">

        @isset($weeks)
        <div id="problemsoftheweek" class="bg-sky-600 p-6 pb-14">

            <h1 class="float-left mr-8 text-2xl font-bold text-white">Problems of the Week</h1>
            <div class="filter-container difficulty float-left">
                <span
                    class="dropdown"
                    v-bind:class="{
                        'open bg-white': potwDropdownFilter == 'weeks',
                        'bg-sky-600 text-white': potwDropdownFilter != 'weeks'
                    }">
                    <a href='#' class="" @click.stop.prevent="potwDropdownFilter = (potwDropdownFilter == 'weeks') ? '' : 'weeks'">
                        <strong class="pl-4 font-sans font-semibold">@{{filterPotwListActiveTitle}}</strong>
                        <span class="arrow"></span>
                    </a>
                    <ul class="dropdown-menu">
                        <template v-for="(potwItem,idx) in potwList">
                            <li><a href='#'
                                    v-bind:class="{ active: potwItem.week == potwCurrent.week }"
                                    class="btn-link filter-link"
                                    @click.prevent="potwSetWeek(potwItem.week)">
                                    @{{potwItem.weekTitle}}
                            </a></li>
                        </template>
                    </ul>
                </span>
            </div>
            <div class="float-right">
                <div class="text-right">
                    <template v-for="(level,idx) in ['Basic', 'Intermediate', 'Advanced']">
                        <a href=""
                            class="text-white py-1 px-4 inline-block border border-white"
                            v-bind:class="{
                                'active bg-white leading-7 text-sky-600 font-bold': potwCurrent.level == (idx + 1),
                                'hover:bg-sky-800': potwCurrent.level != (idx + 1),
                                'rounded-l': idx == 0,
                                'rounded-r': idx == 2
                            }"
                            @click.prevent="potwSetLevel(idx + 1)">
                            @{{level}}
                        </a>
                    </template>
                </div>
            </div>
        </div>
        @endif
            <div class="ctnt-sections mt-6 ">
                <div class="px-4">
                <div class="prblm-header">

                    @isset($weeks)
                    <div class="float-right pr-8 w-72 flex items-center">
                        <a href=""
                            class="fas fa-solid fa-chevron-left"
                            v-bind:class="{
                                'inactive opacity-10': potwCurrent.num == 0,
                                'opacity-70': potwCurrent.num != 0
                            }"
                            @click.prevent="potwDecNum()"
                            style="flex: 0 0 20px;">
                        </a>
                        <div class="flex justify-around items-center h-6" style="flex-grow: 1;">
                        <template v-for="idx in potwCurrent.count">
                            <a href=""
                                class="border h-full"
                                v-bind:class="{ 'active bg-yellow-300 p-1': potwCurrent.num == (idx - 1) }"
                                @click.prevent="potwSetNum(idx - 1)"
                                style="flex-grow: 1;">
                            </a>
                        </template>
                        </div>
                        <a href=""
                            class="fas fa-solid fa-chevron-right text-right"
                            v-bind:class="{
                                'inactive opacity-10': potwCurrent.num == (potwCurrent.count - 1),
                                'opacity-70': potwCurrent.num != (potwCurrent.count - 1)
                            }"
                            @click.prevent="potwIncNum()"
                            style="flex: 0 0 20px;">
                        </a>
                    </div>
                    @endif


                    <div class="block text-red-500 text-2xl text-center">
                        <template v-if="isHidden">
                            PROBLEM HAS BEEN HIDDEN
                        </template>
                        <template v-else-if="hasReport && Global.UserJson.canmoderate">
                            PROBLEM HAS BEEN REPORTED
                        </template>

                        <template v-if="archived">
                            THIS IS AN ARCHIVED PROBLEM
                        </template>
                    </div>

                    <span class="prblm-title" v-html="this.titleHtml"></span>

                    @if($source)
                    <template v-if="Global.isDiscussion">
                        <a href="/brilliantexport/discussions/thread/{{ $source }}/{{ $source }}.html" class="prblm-original">original</a>
                    </template><template v-else>
                        <a href="/brilliantexport/problems/{{ $source }}/{{ $source }}.html" class="prblm-original">original</a>
                    </template>
                    <Report class="float-right mr-4" ref="report" :inline="true" :initialreport="this.reported" :id="0" v-on:report="this.report" v-on:unreport="this.unreport"></Report>
                    <br/>
                    @endif
                    </template>
                    <!--
                    <div class="float-right text-right -mt-6">
                        <Vote ref="vote" :initialvote="this.voted" :initialpoints="this.points" :id="0" v-on:vote="this.vote"></Vote>
                        <Report ref="report" :inline="true" :initialreport="this.reported" :id="0" v-on:report="this.report" v-on:unreport="this.unreport"></Report>
@can('moderate')
                        <div class="inline">
                            <a href="" class="" v-bind:class="[{ 'text-red-600': this.isHidden }]" @click.prevent="adminAction(this.isHidden ? 'unhide' : 'hide', 0)">@{{ this.isHidden ? "👁":  this.hasReport ? "👁⨂" : "👁" }}</a>
                        </div>
@endcan
                    </div>
                    -->
                    <div class="prblm-topiclevel">
                        <span class="prblm-topic">@{{ this.topic }}</span>
                        <span class="prblm-level">Level @{{ this.level }}</span>
                    </div>
                </div>

                <div class="prblm-question md:grid md:grid-cols-7 md:gap-4">

                    <!-- Question Body -->
                    <div class="prblm-question-content md:col-span-5" v-bind:class="[{ 'md:col-span-7': Global.isDiscussion }]" v-html="this.question"></div>

                    <!-- Answers -->
                    <div v-if="!Global.isDiscussion" class="prblm-question-solution md:col-span-2 md:px-4">
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

                <template v-if="Global.isDiscussion || solved">
                <hr/>

                <DiscussionSection
                    :discussions="this.discussions"
                ></DiscussionSection>
            </div>
        <template v-if="Global.potwList"></div></template>
        </div>
    </div>
</x-app-layout>
