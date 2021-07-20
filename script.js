
$(document).ready(() => {

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
        problemsList.children().remove()
    };

    const searchProblems = () => {
        problemsTableSettings.indexOffset = 0;
        clearProblems();

        let j = 0; // Fill 15
        let i;
        for (i = problemsTableSettings.indexOffset; i < problemSet.length; ++i) {
            const problem = problemSet[i];
            const catIdx = problemCategoryIndex[ problem.c ];
            if
            (
                (
                    (problemsTableSettings.category === 0) ||
                    (catIdx === problemsTableSettings.category)
                )
                &&
                (
                    (problemsTableSettings.difficulty === 0) ||
                    (problemsTableSettings.difficulty === 1 && problem.l <= 1) ||
                    (problemsTableSettings.difficulty === 2 && problem.l <= 3 && problem.l >= 2) ||
                    (problemsTableSettings.difficulty === 3 && problem.l <= 5 && problem.l >= 4)
                )
            )
            {
                addProblem(problem);
                if(++j >= 15) break;
            }
        }

        problemsTableSettings.indexOffset = i; // pageination
    };

    let problemSet = null;
    $.getJSON('sortedproblems.json', {}, (data) => {
        clearProblems();
        problemSet = data;

        for (let i = 0; i < 15; ++i) {
            addProblem(data[i]);
        }
    });
});
