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
        <script src="/problems.js"></script>
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
        <div id="problems" class="col s5 ctnt-main">
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
    </body>
</html>
