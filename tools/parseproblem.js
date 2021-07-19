const fs = require('fs'),
    jsdom = require('jsdom'),
    jQuery = require('jquery');

const JSDOM = jsdom.JSDOM;
//const dom = new jsdom.JSDOM('');
//const $ = jQuery(dom.window);

fs.readFile('../problems/10000000-accounts-puzzle-and-maybe-1000-followers/10000000-accounts-puzzle-and-maybe-1000-followers.html', 'utf8', (err, data) => {

    if (err) throw err;

    const dom = new JSDOM(data);
    const $ = jQuery(dom.window);

    //console.log(data);

    const categoryAndLevel = $('.topic-level-info').text(),
        match = categoryAndLevel.match(/^\s*(Algebra|Geometry|Number Theory|Calculus|Probability|Basic Mathematics|Logic|Classical Mechanics|Electricity and Magnetism|Computer Science|Quantitative Finance|Chemistry)\s*Level\s*(\d*)/);

    //console.log( $('.topic-level-info').text() );

    console.log("Category: " + match[1]);
    console.log("Level: " + match[2]);
    
});
