
$(document).ready(() => {
    const ProblemsApp = Vue.createApp({
        data: function() {
            return {
                dropdownFilter: '', // which filter dropdown is open

                filteredProblems: null, // problem list from filter
                curDisplayedPosts: [],

                filterCategoriesActiveTitle: 'Topic',
                filterCategories: [],
                filterLevelsActiveTitle: 'Difficulty',
                filterLevels: [],

                pagesCur: [],
                isFirstPage: false,
                isLastPage: false,
                pagesTotal: 0,
                pagesHits: 0,
                pageIdx: 0,

                filterProblemsCount: 0,
                filterDiscussionCount: 0,
                filterDiscussion: false
            };
        },

        methods: {

            filterCategoriesCb() {},
            filterLevelsCb() {},
            setPageCb() {},
            filterDiscussionCb() {},

            showPaginationEllipses() { false; },
            setPage(page) { this.setPageCb(page); },
            setCategory(cat) { this.filterCategoriesCb("" + cat.id); },
            setLevel(diff) { this.filterLevelsCb("" + diff.id); },
            setDiscussion(disc) { this.filterDiscussion = disc; this.setFilterDiscussionCb({ isRefined: !disc }); },

            setProblems(problems) {
                this.filteredProblems = [];
                this.curDisplayedPosts = [];

                for (let i = 0; i < problems.length; ++i) {
                    const problem = problems[i],
                        categoryName = globals.ProblemCategories.find((a) => a.id == problem.category)?.name || "Misc",
                        levelName = globals.ProblemLevels.find((a) => a.id == problem.level)?.name || "Level 0";

                    this.filteredProblems.push({
                        c: categoryName,
                        l: levelName,
                        n: problem.name,
                        p: `problem/${problem.id}`
                    });
                }

                this.curDisplayedPosts = this.filteredProblems;
            },

            setCategoriesFacet(categories) {
                this.filterCategoriesActiveTitle = 'Topic';
                this.filterCategories = [];
                for (let i = 0; i < categories.length; ++i) {
                    const category = categories[i],
                        id = parseInt(category.label, 10),
                        title = globals.ProblemCategories.find((a) => a.id == id)?.name || "Misc";
                    this.filterCategories.push({
                        id: id,
                        t: title,
                        a: category.isRefined,
                        c: category.count
                    });

                    if (category.isRefined) {
                        this.filterCategoriesActiveTitle = title;
                    }
                }

            },

            setCategoriesFacetCb(cb) {
                this.filterCategoriesCb = cb;
            },

            setLevelsFacet(levels) {
                this.filterLevelsActiveTitle = 'Difficulty';
                this.filterLevels = [];
                for (let i = 0; i < levels.length; ++i) {
                    const level = levels[i],
                        id = parseInt(level.label, 10),
                        title = globals.ProblemLevels.find((a) => a.id == id)?.name || "Level 0";
                    this.filterLevels.push({
                        id: id,
                        t: title,
                        a: level.isRefined,
                        c: level.count
                    });

                    if (level.isRefined) {
                        this.filterLevelsActiveTitle = title;
                    }
                }

            },

            setLevelsFacetCb(cb) {
                this.filterLevelsCb = cb;
            },

            setPagination(curPages, totalHits, totalPages, isFirstPage, isLastPage, pageIdx) {
                this.pagesCur = curPages;
                this.isFirstPage = isFirstPage;
                this.isLastPage = isLastPage;
                this.pagesTotal = totalPages;
                this.pagesHits = totalHits;
                this.pageIdx = pageIdx;
            },

            setPageCb(cb) {
                this.setPageCb = cb;
            },

            setDiscussionFacet(value) {
                this.filterProblemsCount = value.offFacetValue.count || 0;
                this.filterDiscussionCount = value.onFacetValue.count || 0;
            },

            setDiscussionFacetCb(cb) {
                this.setFilterDiscussionCb = cb;
            },
        },
        beforeMount: function() {
        },
        computed: {
            displayedPosts () {
                return this.curDisplayedPosts;
            },
        },
    });

    const mountedProblems = ProblemsApp.mount('#problems');

    $(window).click(() => {
        mountedProblems.dropdownFilter = '';
    });

    window['ProblemsApp'] = mountedProblems;
});
