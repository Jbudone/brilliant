<x-app-layout>

    @push('scripts')
        <script type="text/javascript" src="{{ asset('problems.js') }}"></script>
    @endpush

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Problems') }}
        </h2>
    </x-slot>

    <!-- Content -->
    <div class="w-3/5 m-auto mt-6 font-serif">
        <div id="problems" class="container ctnt-main">
            <div class="ctnt-sections row">
                <span class="ctnt-btn active"><a href='#'>Problems</a></span>
                <span class="ctnt-btn"><a href='#'>Needs Solution</a></span>
                <span class="ctnt-btn"><a href='#'>Discussions</a></span>
            </div>
            <table class="container mt-6">
                <thead class="text-left">
                    <tr>
                        <th class="filter-container pl-4 font-sans font-semibold title">Title</th>
                        <th class="filter-container category">
                            <span class="dropdown" v-bind:class="{ open: (dropdownFilter == 'category') }">
                                <a href='#' class="filter-btn" @click.stop.prevent="dropdownFilter = (dropdownFilter == 'category') ? '' : 'category'">
                                    <strong class="pl-4 font-sans font-semibold">Topic</strong>
                                    <span class="arrow"></span>
                                </a>
                                <ul class="dropdown-menu">
                                    <template v-for="(cat,idx) in filterCategories">
                                        <li><a href='#' class="btn-link filter-link active" @click.prevent="setCategory(idx)">@{{cat}}</a></li>
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
                                    <li><a href='#' class="btn-link filter-link">New</a></li>
                                    <li><a href='#' class="btn-link filter-link active">Popular</a></li>
                                    <li><a href='#' class="btn-link filter-link">Following</a></li>
                                </ul>
                            </span>
                        </th>
                        <th class="filter-container difficulty">
                            <span class="dropdown" v-bind:class="{ open: (dropdownFilter == 'difficulty') }">
                                <a href='#' class="filter-btn" @click.stop.prevent="dropdownFilter = (dropdownFilter == 'difficulty') ? '' : 'difficulty'">
                                    <strong class="pl-4 font-sans font-semibold">Difficulty</strong>
                                    <span class="arrow"></span>
                                </a>
                                <ul class="dropdown-menu">
                                    <template v-for="(diff,idx) in filterDifficulties">
                                        <li><a href='#' class="btn-link filter-link active" @click.prevent="setDifficulty(idx)">@{{diff}}</a></li>
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
                            <td class="prblmsnp-difficulty">Level @{{ problem.l }}</td>
                        </tr>
                    </template>
                </tbody>
            </table>
            <ul class="pagination mt-4">
                <li class="page-item">
                    <a href='#' class="page-link" v-bind:class="{ disabled: (page == 1) }" @click.prevent="page--"> Previous </a>
                </li>
                <li class="page-item page-num" v-for="(pageNumber, index) in getPages()" v-bind:class="{ active: (page == pageNumber) }">
                    <a href='#' class="page-link" @click.prevent="page = pageNumber"> @{{pageNumber}} </a>
                </li>
                <li v-if="showPaginationEllipses()" class="page-item">
                    <div id="wave">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </div>
                </li>
                <li class="page-item">
                    <a href='#' class="page-link" v-bind:class="{ disabled: page >= maxPages }" @click.prevent="page++"> Next </a>
                </li>
            </ul>
        </div>
    </div>
</x-app-layout>
