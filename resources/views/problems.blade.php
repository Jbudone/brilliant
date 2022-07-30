<x-app-layout>

    @section('pageTitle', 'Front Page')
    @push('scripts')
        <script type="text/javascript" src="{{ asset('problems.js?' . Str::random(40)) }}"></script>
        <script type="text/javascript" src="{{ asset('instantsearch.js?' . Str::random(40)) }}"></script>
    @endpush

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Problems') }}
        </h2>
    </x-slot>

    <!-- Content -->
    <div class="sm:w-3/5 m-auto mt-6 font-serif">

        <div id="searchbox"></div>
        <div id="hits" class="hidden"></div>

        <div id="problems" class="container ctnt-main">
            <div class="ctnt-sections row">
                <span class="ctnt-btn" v-bind:class="{ active: !filterDiscussion }"><a href='#'  @click.stop.prevent="setDiscussion(false)">Problems (@{{filterProblemsCount}})</a></span>
                <span class="ctnt-btn" v-bind:class="{ active: filterDiscussion }"><a href='#'  @click.stop.prevent="setDiscussion(true)">Discussions (@{{filterDiscussionCount}})</a></span>
            </div>
            <table class="container mt-6">
                <thead class="text-left">
                    <tr>
                        <th class="filter-container pl-4 font-sans font-semibold title">Title</th>
                        <th class="filter-container category">
                            <span class="dropdown" v-bind:class="{ open: (dropdownFilter == 'category') }">
                                <a href='#' class="filter-btn" @click.stop.prevent="dropdownFilter = (dropdownFilter == 'category') ? '' : 'category'">
                                    <strong class="pl-4 font-sans font-semibold">@{{filterCategoriesActiveTitle}}</strong>
                                    <span class="arrow"></span>
                                </a>
                                <ul class="dropdown-menu">
                                    <template v-for="(cat,idx) in filterCategories">
                                        <li><a href='#' class="btn-link filter-link active" @click.prevent="setCategory(cat)">@{{cat.t}} (@{{cat.c}})</a></li>
                                    </template>
                                </ul>
                            </span>
                        </th>
                        <th class="filter-container popularity">
                            <span class="dropdown" v-bind:class="{ open: (dropdownFilter == 'popularity') }">
                                <a href='#' class="filter-btn" @click.stop.prevent="dropdownFilter = (dropdownFilter == 'popularity') ? '' : 'popularity'">
                                    <strong class="pl-4 font-sans font-semibold">Popularity</strong>
                                    <span class="arrow"></span>
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a href='#' class="btn-link filter-link active">Popular</a></li>
                                </ul>
                            </span>
                        </th>
                        <th class="filter-container difficulty">
                            <span class="dropdown" v-bind:class="{ open: (dropdownFilter == 'difficulty') }">
                                <a href='#' class="filter-btn" @click.stop.prevent="dropdownFilter = (dropdownFilter == 'difficulty') ? '' : 'difficulty'">
                                    <strong class="pl-4 font-sans font-semibold">@{{filterLevelsActiveTitle}}</strong>
                                    <span class="arrow"></span>
                                </a>
                                <ul class="dropdown-menu">
                                    <template v-for="(diff,idx) in filterLevels">
                                        <li><a href='#' class="btn-link filter-link active" @click.prevent="setLevel(diff)">@{{diff.t}} (@{{diff.c}})</a></li>
                                    </template>
                                </ul>
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody v-if="displayedPosts">
                    <template v-if="displayedPosts && displayedPosts.length > 0 && displayedPosts[0] && displayedPosts[0].p" v-for="problem in displayedPosts">
                        <tr class="prblmsnp-main border-dotted border border-cool-gray-100">
                            <td class="prblmsnp-title"><a v-bind:href='problem.p'>@{{ problem.n }}</a></td>
                            <td class="prblmsnp-category">@{{ problem.c }}</td>
                            <td class="prblmsnp-popularity">Popular</td>
                            <td class="prblmsnp-difficulty">@{{ problem.l }}</td>
                        </tr>
                    </template>
                </tbody>
            </table>
            <ul class="pagination mt-4 list-none">
                <li class="page-item">
                    <a href='#' class="page-link" v-bind:class="{ disabled: isFirstPage }" @click.prevent="setPage(pageIdx-1)"> Previous </a>
                </li>
                <li class="page-item page-num" v-for="(pageNumber, index) in pagesCur" v-bind:class="{ active: (pageIdx == pageNumber) }">
                    <a href='#' class="page-link" @click.prevent="setPage(pageNumber)"> @{{pageNumber+1}} </a>
                </li>
                <li v-if="showPaginationEllipses()" class="page-item">
                    <div id="wave">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </div>
                </li>
                <li class="page-item">
                    <a href='#' class="page-link" v-bind:class="{ disabled: isLastPage }" @click.prevent="setPage(pageIdx+1)"> Next </a>
                </li>
            </ul>
        </div>
    </div>
</x-app-layout>
