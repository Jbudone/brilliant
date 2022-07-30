const { InstantSearch } = VueComponents;

$(document).ready(() => {



    const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
        server: {
            apiKey: "xyz", // Be sure to use an API key that only allows search operations
            nodes: [
                {
                    host: "54.176.38.254",
                    port: "8109",
                    protocol: "http",
                },
            ],
            cacheSearchResultsForSeconds: 2 * 60, // Cache search results from server. Defaults to 2 minutes. Set to 0 to disable caching.
        },
        // The following parameters are directly passed to Typesense's search API endpoint.
        //  So you can pass any parameters supported by the search endpoint below.
        //  query_by is required.
        additionalSearchParameters: {
            query_by: "name",
        },
    });

    const searchClient = typesenseInstantsearchAdapter.searchClient;

    const search = InstantSearchJS({
        searchClient,
        indexName: 'title',
    });


    window['ReceivedInstantSearch'] = (problems) => {
        ProblemsApp.setProblems(problems);
        return problems;
    }

    const renderMenuSelect = (renderOptions, isFirstRender) => {
        const { items, canRefine, refine, widgetParams } = renderOptions;

        if (isFirstRender) {
            if (widgetParams.attribute === 'category') {
                ProblemsApp.setCategoriesFacetCb(refine);
            } else if (widgetParams.attribute === 'level') {
                ProblemsApp.setLevelsFacetCb(refine);
            }
        }

        if (widgetParams.attribute === 'category') {
            ProblemsApp.setCategoriesFacet(items);
        } else if (widgetParams.attribute === 'level') {
            ProblemsApp.setLevelsFacet(items);
        }
    };

    const renderPagination = (renderOptions, isFirstRender) => {
        const { pages, nbHits, nbPages, isFirstPage, isLastPage, currentRefinement, refine } = renderOptions;

        if (isFirstRender) {
            ProblemsApp.setPageCb(refine);
        }

        ProblemsApp.setPagination(pages, nbHits, nbPages, isFirstPage, isLastPage, currentRefinement);
    };

    const renderToggleRefinement = (renderOptions, isFirstRender) => {
        const { value, canRefine, refine } = renderOptions;

        if (isFirstRender) {
            ProblemsApp.setDiscussionFacetCb(refine);
        }

        ProblemsApp.setDiscussionFacet(value);
    };

    const customMenuSelect = AisConnectMenu(renderMenuSelect);
    const customPagination = AisConnectPagination(renderPagination);
    const customToggleRefinement = AisConnectToggleRefinement(renderToggleRefinement);

    search.addWidgets([
        InstantSearchWidgets.searchBox({
            container: "#searchbox",
            autofocus: true,
            cssClasses: {
                'input': 'rounded',
                'submit': 'black'
            }
        }),

        // FIXME: Don't render this! What a waste of time -- we're transforming manually anyways
        InstantSearchWidgets.hits({
            container: "#hits",
            transformItems: ReceivedInstantSearch
        }),

        customMenuSelect({
            container: document.querySelector("#problems"),
            attribute: "category"
        }),

        customMenuSelect({
            container: document.querySelector("#problems"),
            attribute: "level"
        }),

        customPagination({
            container: document.querySelector("#problems"),
        }),

        customToggleRefinement({
            container: document.querySelector("#problems"),
            attribute: "discussion",
            on: true,
            off: false,
        }),
    ]);

    search.start();
});
