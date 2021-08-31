
$(document).ready(() => {
    const ProblemsApp = Vue.createApp({
        data: function() {
            return {
                jsonData: [],
                page: 1,
                dropdownFilter: '', // which filter dropdown is open

                filter: {
                    difficulty: 0, // 0 all, 1 easy [1], 2 medium [2,3], 3 hard [4,5]
                    category: 0, // 0 all, 1 algebra, 2 geometry, 3 number theory, 4 calculus,
                                 // 5 discrete, 6 logic, 7 mechanics, 8 electricity, 9 compsci,
                                 // 10 finance, 11 chemistry
                },

                // FIXME: move these into filter
                filteredProblems: null, // problem list from filter
                filteredProblemsCount: null, // count of problem list for filter
                curDisplayedPosts: [],

                maxPages: 1,
                loadingProblems: true,

                // FIXME: Hardcoded -- does this belong in props?
                filterCategories: [
                    "All",
                    "Algebra",
                    "Geometry",
                    "Number Theory",
                    "Calculus",
                    //"Discrete Math", // FIXME: Where is this?
                    "Logic",
                    "Classical Mechanics",
                    "Electricity and Magnetism",
                    "Computer Science",
                    "Quantitative Finance",
                    "Chemistry"
                ],

                filterDifficulties: [
                    "All",
                    "Easy",
                    "Medium",
                    "Hard"
                ]
            };
        },

        methods: {
            async getProblems() {

                /*
                // For debugging, only seeded questions
                let res = await fetch('/newproblems'),
                    data = await res.json();
                for (let i = 0; i < data.length; ++i) {
                    const catId = data[i].c,
                        catEl = globals.ProblemCategories.find((el) => el.id === catId);
                    data[i].c = catEl.name;
                }
                this.jsonData = data;
                this.applyFilters();
                this.loadingProblems = false;
                */



                // Async new problems in background
                let res = await fetch('/newproblems'),
                    data = await res.json();
                this.jsonData = [];
                const existingProblems = {};
                for (let i = 0; i < data.length; ++i) {
                    const catId = data[i].c,
                        catEl = globals.ProblemCategories.find((el) => el.id === catId);
                    data[i].c = catEl.name;

                    this.jsonData.push(data[i]);
                    existingProblems[data[i].title] = true;
                }
                this.applyFilters();


                /*
                // Fetch larger/common problem set
                res = await fetch('/initialproblems');
                data = await res.json();

                for (let i = 0; i < data.length; ++i) {
                    const catId = data[i].c,
                        catEl = globals.ProblemCategories.find((el) => el.id === catId);
                    data[i].c = catEl.name;

                    if (!existingProblems[data[i].title]) {
                        this.jsonData.push(data[i]);
                        existingProblems[data[i].title] = true;
                    }
                }
                this.applyFilters();


                // Async all problems in background
                res = await fetch('/allproblems');
                data = await res.json();

                for (let i = 0; i < data.length; ++i) {
                    const catId = data[i].c,
                        catEl = globals.ProblemCategories.find((el) => el.id === catId);
                    data[i].c = catEl.name;

                    if (!existingProblems[data[i].title]) {
                        this.jsonData.push(data[i]);
                    }
                }

                this.applyFilters();
                */
                this.loadingProblems = false;
            },

            showPaginationEllipses() { let pages = this.getPages(); return(this.loadingProblems && (pages[pages.length-1] === this.maxPages)); },
            setPage(page) { this.page = page; this.paginate(); },
            setCategory(cat) { this.filter.category = cat; this.applyFilters(true); },
            setDifficulty(diff) { this.filter.difficulty = diff; this.applyFilters(true); },

            applyFilters(resetPage) {

                this.filteredProblems = null;
                this.filteredProblemsCount = null;
                this.curDisplayedPosts = [];

                // No filter? Just use entire problem list
                if (this.filter.difficulty === 0 && this.filter.category === 0) {
                    this.filteredProblems = this.jsonData;
                    this.maxPages = Math.ceil(this.filteredProblems.length / 15);

                    if (resetPage) this.setPage(1);
                    else this.paginate();
                    return;
                }

                const problemCategoryIndex = {
                    "Algebra": 1,
                    "Biology": 1000,
                    "Geometry": 2,
                    "Number Theory": 3,
                    "Calculus": 4,
                    "Probability": 1001,
                    "Basic Mathematics": 1002,
                    "Logic": 6,
                    "Classical Mechanics": 7,
                    "Electricity and Magnetism": 8,
                    "Computer Science": 9,
                    "Quantitative Finance": 10,
                    "Chemistry": 11,
                    "Number Theory and Algebra": 3,
                    "SAT® Math": 1003,
                };

                const problemDifficultyRange = {
                    1: 1,
                    2: 2,
                    3: 2,
                    4: 3,
                    5: 3
                };

                const problems = [];
                for (let i = 0; i < this.jsonData.length; ++i) {
                    const problem = this.jsonData[i];
                    
                    // Match category
                    if (this.filter.category != 0 && problemCategoryIndex[problem.c] != this.filter.category) continue;
                    if (this.filter.difficulty != 0 && problemDifficultyRange[problem.l] != this.filter.difficulty) continue;
                    problems.push(problem);
                }
                this.filteredProblems = problems;
                this.maxPages = Math.ceil(this.filteredProblems.length / 15);
                console.log("Max pages: " + this.maxPages);

                if (resetPage) this.setPage(1);
                else this.paginate();
            },

            async paginate() {

                const categoryId = this.filter.category,
                    level = this.filter.difficulty, // FIXME: dififculty is range of levels
                    offset = 0; // FIXME: offset

                // Total count of filtered problems
                if (this.filteredProblemsCount === null) {
                    let res = await fetch(`/problemspaginatecount/${categoryId}/${level}`);
                    let data = await res.json();

                    this.filteredProblemsCount = data['count'];
                    this.maxPages = this.filteredProblemsCount / 15;
                }

                let fromIdx = (this.page - 1) * 15,
                    toIdx = Math.min(fromIdx + 15, this.filteredProblemsCount);

                let fetchProblems = false;
                if (!this.filteredProblems) {
                    fetchProblems = true;
                } else {
                    for (let i = fromIdx; i < toIdx; ++i) {
                        if (!this.filteredProblems[i]) {
                            fetchProblems = true;
                            break;
                        }
                    }
                }

                // Fetch paginated problems
                if (fetchProblems) {
                    let res = await fetch(`/problemspaginate/${categoryId}/${level}/${offset}`);
                    let data = await res.json();

                    if (!this.filteredProblems) this.filteredProblems = [];
                    for (let i = fromIdx, j = 0; j < data.length; ++i, ++j) {

                        const catId = data[j].c,
                            catEl = globals.ProblemCategories.find((el) => el.id === catId);
                        data[j].c = catEl.name;

                        this.filteredProblems[i] = data[j];
                    }
                }

                if (!this.filteredProblems) return [];
                const problems = [];
                for (let i = fromIdx; i < toIdx; ++i) {
                    problems.push(this.filteredProblems[i]);
                }

                this.curDisplayedPosts = problems;
            },

            getPages() {
                let pages = [],
                    minPage = this.page - 2,
                    maxPage = this.page + 2;

                if (minPage < 1) {
                    maxPage += 1 - minPage;
                    minPage = 1;
                }

                if (maxPage > this.maxPages) {
                    minPage -= maxPage - this.maxPages;
                    maxPage = this.maxPages;
                }

                minPage = Math.max(minPage, 1);
                maxPage = Math.min(maxPage, this.maxPages);

                for (let i = minPage; i <= maxPage; ++i) {
                    pages.push(i);
                }

                return pages;
            }
        },
        beforeMount: function() {
            this.getProblems();
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
});
