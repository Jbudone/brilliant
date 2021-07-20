
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

    const problemsList = $('#problemsList');

    const addProblem = (problem) => {

        const path = problem.p,
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

    const clearProblems = () => {
        problemsList.children().remove()
    };

    clearProblems();
    addProblem({
        c: 'Geometry',
        l: 1,
        n: "Geometry problem No.3",
        p: "/problems/geometry-problem-no3"
    });

    $.getJSON('sortedproblems.json', {}, (data) => {
        console.log(data);

        clearProblems();

        for (let i = 0; i < 15; ++i) {
            addProblem(data[i]);
        }
    });
});
