
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
                filteredProblems: null,

                maxPages: 1,
                loadingProblems: true,

                // FIXME: Hardcoded -- does this belong in props?
                filterCategories: [
                    "All",
                    "Algebra",
                    "Geometry",
                    "Number Theory",
                    "Calculus",
                    "Discrete Math", // FIXME: Where is this?
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


                /*


                // Fetch initial problems first
                let res = await fetch('/initialproblems'),
                    data = await res.json();
                this.jsonData = data;
                this.applyFilters();

                const existingProblems = {};
                for (let i = 0; i < this.jsonData.length; ++i) {
                    existingProblems[this.jsonData[i].title] = true;
                }

                // Async new problems in background
                res = await fetch('/newproblems');
                data = await res.json();
                this.applyFilters();

                for (let i = 0; i < data.length; ++i) {
                    if (!existingProblems[data[i].title]) {
                        this.jsonData.push(data[i]);
                        existingProblems[data[i].title] = true;

                        this.jsonData.push(data[i]);
                    }
                }


                // Async all problems in background
                res = await fetch('/allproblems');
                data = await res.json();

                for (let i = 0; i < data.length; ++i) {
                    if (!existingProblems[data[i].title]) {
                        this.jsonData.push(data[i]);
                    }
                }

                this.applyFilters();
                this.loadingProblems = false;
                */
            },

            showPaginationEllipses() { let pages = this.getPages(); return(this.loadingProblems && (pages[pages.length-1] === this.maxPages)); },
            setPage(page) { this.page = page; },
            setCategory(cat) { this.filter.category = cat; this.applyFilters(true); },
            setDifficulty(diff) { this.filter.difficulty = diff; this.applyFilters(true); },

            applyFilters(resetPage) {
                if (resetPage) this.setPage(1);

                // No filter? Just use entire problem list
                if (this.filter.difficulty === 0 && this.filter.category === 0) {
                    this.filteredProblems = this.jsonData;
                    this.maxPages = Math.ceil(this.filteredProblems.length / 15);
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
            },

            paginate() {
                if (!this.filteredProblems) return [];
                const problems = [],
                    fromIdx = (this.page - 1) * 15,
                    toIdx = Math.min(fromIdx + 15, this.filteredProblems.length);
                for (let i = fromIdx; i < toIdx; ++i) {
                    problems.push(this.filteredProblems[i]);
                }

                return problems;
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
                return this.paginate();
            },
        },
    });

    const mountedProblems = ProblemsApp.mount('#problems');

    $(window).click(() => {
        mountedProblems.dropdownFilter = '';
    });
});
