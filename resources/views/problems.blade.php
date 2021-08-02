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
    <div class="row">
    <div class="col s8 offset-s2 ctnt-container">
        <div id="problems" class="ctnt-main">
            <div class="ctnt-sections row">
                <span class="ctnt-btn active"><a href='#'>Problems</a></span>
                <span class="ctnt-btn"><a href='#'>Needs Solution</a></span>
                <span class="ctnt-btn"><a href='#'>Discussions</a></span>
            </div>
            <table class="">
                <thead>
                    <tr>
                        <th class="filter-container title"><strong>Title</strong></th>
                        <th class="filter-container category">
                            <span class="dropdown" v-bind:class="{ open: (dropdownFilter == 'category') }">
                                <a href='#' class="filter-btn" @click.stop.prevent="dropdownFilter = (dropdownFilter == 'category') ? '' : 'category'">
                                    <strong>Topic</strong>
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
                                    <strong>Popularity</strong>
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
                                    <strong>Difficulty</strong>
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
                        <tr class="prblmsnp-main">
                            <td class="prblmsnp-title"><a v-bind:href='problem.p'>@{{ problem.n }}</a></td>
                            <td class="prblmsnp-category">@{{ problem.c }}</td>
                            <td class="prblmsnp-popularity">Popular</td>
                            <td class="prblmsnp-difficulty">@{{ problem.l }}</td>
                        </tr>
                    </template>
                </tbody>
            </table>
            <ul class="pagination">
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
    </div>
</x-app-layout>
