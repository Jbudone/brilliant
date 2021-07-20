const fs = require('fs'),
    jsdom = require('jsdom'),
    jQuery = require('jquery');

const JSDOM = jsdom.JSDOM;

const rawproblems = fs.readFileSync('../rawproblems', 'utf8'),
    rawproblemsList = rawproblems.split('\n');

// Handle in batches to allow GC to clear DOM
const BATCH_HANDLE = 100,
    BATCH_TIMER = 2000;


const parseProblemsBatch = (i) => {

    for (let j = 0; j < BATCH_HANDLE; ++j) {

        if ((i+j) >= rawproblemsList.length) return;
        const problem = rawproblemsList[i + j];
        if (problem.length === 0) return; // Last line

        const match = problem.match(/^([^\s]+) (.*)$/),
            problemName = match[2],
            problemFile = match[1];


        const filepath = '../' + problemFile + '.html';
        //console.log(filepath);
        const data = fs.readFileSync(filepath, 'utf8');
        const dom = new JSDOM(data);
        const $ = jQuery(dom.window);

        //console.log(data);

        const categoryAndLevel = $('.topic-level-info').text();

        let categoryName, categoryLevel;
        if(categoryAndLevel.replaceAll('\n','').replaceAll(' ','') === "Levelpending") {
            // FIXME: level unset
            categoryName = 'uncategorized';
            categoryLevel = 0;
        } else {
            let matchCat = categoryAndLevel.match(/^\s*(Algebra|Biology|Geometry|Number Theory|Calculus|Probability|Basic Mathematics|Logic|Classical Mechanics|Electricity and Magnetism|Computer Science|Quantitative Finance|Chemistry|Number Theory and Algebra|SAT® Math)\s*Level\s*(\d*)/);

            if (!matchCat) {
                matchCat = categoryAndLevel.match(/^\s*Level\s*(\d*)/);
                if (!matchCat) {
                    console.log(categoryAndLevel);
                    throw "Unexpected level/category";
                }

                categoryName = 'uncategorized';
                categoryLevel = matchCat[1];
            } else {
                categoryName = matchCat[1];
                categoryLevel = matchCat[2];
            }



            //console.log( $('.topic-level-info').text() );
        }
        console.log(categoryName + " " + categoryLevel + " " + problemName + "   " + problemFile);

        delete $;
        delete dom;
        delete data;
    }
    
    setTimeout(() => { parseProblemsBatch(i + BATCH_HANDLE); }, BATCH_TIMER);
};

parseProblemsBatch(0);
