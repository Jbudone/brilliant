
$(document).ready(() => {


    const initializePage = () => {

        $('button.dropdown-toggle').click((e) => {

            const el = $(e.currentTarget);
            const parent = $( el.parent()[0] );

            // Close all other dropdowns first
            $('button.dropdown-toggle').each((i, t) => {
                const tEl = $(t);
                if (t === el[0]) return;

                const tParent = $( tEl.parent()[0] );
                tParent.removeClass('open');
            });


            const isOpen = parent.hasClass('open');
            if(isOpen) { parent.removeClass('open'); } else { parent.addClass('open'); }
        });

        $(window).click((e) => {
            const el = $(e.target);
            $('button.dropdown-toggle').each((i, t) => {
                const tEl = $(t);
                if (t === el[0]) return;

                const tParent = $( tEl.parent()[0] );
                tParent.removeClass('open');
            });
        });


        const pagePrev = $('#paginate_previous'),
            pageNext = $('#paginate_next'),
            pageList = $('.pagination'),
            pageEllipses = $('#paginate_ellipses');
        
        let paginate = () => {},
            pageNumEls = [],
            curPage = 0,
            loadableMaxPages = 9,
            knowMaxPage = false,
            pageLoad = null,
            checkForProblems = null;

        const setPage = (pageIdx, isUpdate) => {

            if (isUpdate && problemSet === initialProblems) {
                // Still loading problem set..
                checkForProblems = setTimeout(() => { setPage(pageIdx, true) ; }, 100);
                return;
            }

            if (checkForProblems) {
                // Cancel previous load
                clearTimeout(checkForProblems);
                checkForProblems = null;
            }

            if (pageIdx === 0) {
                pagePrev.addClass('disabled');
            } else {
                pagePrev.removeClass('disabled');
            }

            let searched = false;
            if (pageIdx === loadableMaxPages) {

                const curPageNumEl = pageNumEls.findIndex((el) => el.data('page') === curPage);
                pageNumEls[curPageNumEl].removeClass('active');

                curPage = pageIdx;
                if (!knowMaxPage) {

                    if (problemSet === initialProblems) {
                        // Show loading indicator while we load full problem set

                        curPage = pageIdx;
                        clearProblems();
                        pageLoad = $('<div/>').addClass('loader').appendTo(problemsList);

                        pageNext.addClass('disabled');

                        checkForProblems = setTimeout(() => { setPage(pageIdx, true); }, 100);

                        return false;
                    }

                    // Otherwise, we may or may not have enough results to load another page
                    searched = true;
                    const { reachedEnd, count } = paginate();
                    console.log((reachedEnd ? "Reached end" : "more..") + " fetched " + count);
                    if (reachedEnd) {
                        pageNext.addClass('disabled');
                        if (count === 0) { // nothing else, our last page is the current last page
                            pageIdx = loadableMaxPages - 1;
                        } else {
                            //loadableMaxPages++;
                            pageIdx = loadableMaxPages;
                        }

                        knowMaxPage = true;
                    } else {
                        curPage = pageIdx;
                        loadableMaxPages++;
                        pageNext.removeClass('disabled');
                    }
                } else {
                    pageNext.addClass('disabled');
                }

            } else {
                pageNext.removeClass('disabled');
            }


            pageNumEls.forEach((el) => el.remove());
            pageNumEls = [];
            let lastEl = pagePrev,
                minPage = Math.max(0, pageIdx - 2),
                maxPage = Math.min(loadableMaxPages, Math.max(4, pageIdx + 2));
            if ((maxPage - minPage) < 4) minPage = Math.max(0, pageIdx - 2);
            for (let i = minPage; i <= maxPage; ++i) {
                //<li class='paginate_button page-item'>
                //    <a href='#' class='page-link'>4</a>
                //</li>
                const pageItemEl = $('<li/>')
                    .addClass('pageinate_button')
                    .addClass('page-item')
                    .data('page', i)
                    .append( $('<a/>')
                        .attr('href', '#')
                        .addClass('page-link')
                        .text(i + 1)
                        .click(() => {
                            console.log("Load page: " + i);
                            setPage(i);
                            return false;
                        })
                    )
                    .insertAfter(lastEl);

                lastEl = pageItemEl;
                pageNumEls.push(pageItemEl);
            }

            curPage = pageIdx;
            const curPageNumEl = pageNumEls.findIndex((el) => el.data('page') === curPage);
            pageNumEls[curPageNumEl].addClass('active');

            if(!searched) paginate();
        };

        const resetPages = (pageIdx, maxPages, knowMax) => {
            curPage = 0;
            loadableMaxPages = maxPages;
            knowMaxPage = knowMax;

            pagePrev.addClass('disabled');
            if (maxPages === 1) pageNext.addClass('disabled');
            
            if (knowMax) {
                pageEllipses.removeClass('hidden');
            } else {
                pageEllipses.addClass('hidden');
            }

            setPage(0);
        };

        pagePrev.click(() => {
            if (curPage === 0) return;
            setPage(curPage - 1);
            return false;
        });

        pageNext.click(() => {

            if (curPage === loadableMaxPages) return; // Already at max

            setPage(curPage + 1);

            return false;
        });


        const problemsList = $('#problemsList');

        const addProblem = (problem) => {

            const path = problem.p + '.html',
                title = problem.n,
                category = problem.c,
                difficulty = problem.l;

            let difficultyTitle = "";
            if (difficulty <= 1) {
                difficultyTitle = "Easy";
            } else if (difficulty <= 3) {
                difficultyTitle = "Medium";
            } else {
                difficultyTitle = "Hard";
            }


            const problemContainer = $('<div/>')
                .addClass('nf-feed-item-wrapper')
                .addClass('modal-feed-item')
                .addClass('feed-section-row')
                .addClass('row')
                .addClass('inited')
                .append( $('<div/>')
                    .addClass('nf-feed-item')
                    .addClass('nf-feeditem-type-2')
                    .addClass('nf-listitem-1')
                    .append( $('<a/>')
                        .attr('href', path)
                        .addClass('content')
                        .addClass('modal-link')
                        .addClass('ax-click')
                        .addClass('td')
                        .append( $('<span/>')
                            .append( $('<span/>').text(title) )
                            .append( $('<span/>').addClass('css-sprite-newsfeed').addClass('icon') )
                        )
                    )
                    .append( $('<span/>')
                        .addClass('td')
                        .text(category)
                    )
                    .append( $('<span/>')
                        .addClass('td')
                        .text('Popular')
                    )
                    .append( $('<span/>')
                        .addClass('td')
                        .text(difficultyTitle)
                    )
                )
                .appendTo( problemsList );
        };

        const problemsTableSettings = {
            difficulty: 0, // 0 all, 1 easy [1], 2 medium [2,3], 3 hard [4,5]
            category: 0, // 0 all, 1 algebra, 2 geometry, 3 number theory, 4 calculus,
                         // 5 discrete, 6 logic, 7 mechanics, 8 electricity, 9 compsci,
                         // 10 finance, 11 chemistry

            indexOffset: 0
        };

        $('[data-choice=easy]').click(() => { problemsTableSettings.difficulty = 1; searchProblems(); });
        $('[data-choice=medium]').click(() => { problemsTableSettings.difficulty = 2; searchProblems(); });
        $('[data-choice=hard]').click(() => { problemsTableSettings.difficulty = 3; searchProblems(); });

        $('[data-choice=algebra]').click(() => { problemsTableSettings.category = 1; searchProblems(); });
        $('[data-choice=geometry]').click(() => { problemsTableSettings.category = 2; searchProblems(); });
        $('[data-choice="number-theory"]').click(() => { problemsTableSettings.category = 3; searchProblems(); });
        $('[data-choice=calculus]').click(() => { problemsTableSettings.category = 4; searchProblems(); });
        $('[data-choice="discrete-mathematics"]').click(() => { problemsTableSettings.category = 5; searchProblems(); });
        $('[data-choice=logic]').click(() => { problemsTableSettings.category = 6; searchProblems(); });
        $('[data-choice=mechanics]').click(() => { problemsTableSettings.category = 7; searchProblems(); });
        $('[data-choice="electricity-and-magnetism"]').click(() => { problemsTableSettings.category = 8; searchProblems(); });
        $('[data-choice="computer-science"]').click(() => { problemsTableSettings.category = 9; searchProblems(); });
        $('[data-choice="quantitative-finance"]').click(() => { problemsTableSettings.category = 10; searchProblems(); });
        $('[data-choice=chemistry]').click(() => { problemsTableSettings.category = 11; searchProblems(); });

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

        const clearProblems = () => {
            if (pageLoad) pageLoad = null;
            problemsList.children().remove()
        };

        const fetchProblemsByFilter = (category, difficulty, offset, count) => {

            let problems = [];
            let i;
            for (i = offset; i < problemSet.length; ++i) {
                const problem = problemSet[i];
                const catIdx = problemCategoryIndex[ problem.c ];
                if
                (
                    (
                        (category === 0) ||
                        (catIdx === category)
                    )
                    &&
                    (
                        (difficulty === 0) ||
                        (difficulty === 1 && problem.l <= 1) ||
                        (difficulty === 2 && problem.l <= 3 && problem.l >= 2) ||
                        (difficulty === 3 && problem.l <= 5 && problem.l >= 4)
                    )
                )
                {
                    problems.push(problem);
                    if(--count === 0) break;
                }
            }

            return { problems, indexOffset: i };
        };

        /*
        // Fetch initial problem set
        const initialProblemSet = [];
        const initialProblemMap = {};
        const INITIAL_PROBLEM_SET_SIZE = 15 * 10; // 5 pages worth for each filter
        for (let catKey in problemCategoryIndex) {
            let catIdx = problemCategoryIndex[catKey];
            for (let difficulty = 0; difficulty < 3; ++difficulty) {
                let { problems, indexOffset } = fetchProblemsByFilter(catIdx, difficulty, 0, INITIAL_PROBLEM_SET_SIZE);
                
                // strip out already added problems
                problems = problems.filter((e) => !(e.p in initialProblemMap));
                problems.forEach((e) => { initialProblemMap[e.p] = 1; initialProblemSet.push(e); });
            }
        }
        window['initialProblemSet'] = initialProblemSet;
        */

        const searchProblems = () => {
            resetPages(0, 10, false);
            paginate();
        };

        paginate = () => {
            problemsTableSettings.indexOffset = 0;
            clearProblems();

            console.log(`Fetching problems for page ${curPage}`);
            const count = (curPage + 1) * 15,
                startFrom = curPage * 15;
            const { problems, indexOffset } = fetchProblemsByFilter(problemsTableSettings.category, problemsTableSettings.difficulty, 0, count);

            let fetched = 0;
            for (let i = startFrom; i < count; ++i) {
                if (i >= problems.length) break;
                addProblem(problems[i]);
                ++fetched;
            }

            problemsTableSettings.indexOffset = indexOffset; // pageination
            let reachedEnd = (indexOffset >= problemSet.length);

            if (!reachedEnd && fetched < 15) debugger;
            
            return { reachedEnd, count: fetched };
        };


        // Initial problems
        resetPages(0, 10, false);
        paginate();
    };

    let problemSet = null;
    $.getJSON('sortedproblems.json', {}, (data) => {
        problemSet = data;
    });

    // speed up startup by loading initial problem set (subset of entire problemset)
    problemSet = initialProblems;
    initializePage();
});
