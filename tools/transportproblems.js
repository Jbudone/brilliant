const fs = require('fs');

let INPUT = 'out';
let OUTPUT = null;
let verbose = false;
let DISCUSSION = false;


// TODO:
//  - category -> categoryId
//  - level -> levelId
//  - source -> name
//  - copy images/assets in problem asset list  (problem['assets'])
//  - parse dates -> epoch


// Parse arguments
for (let i = 2; i < process.argv.length; ++i) {
    const arg = process.argv[i];
    if (arg === '--verbose') {
        verbose = true;
    } else if (arg === '--input') {
        INPUT = process.argv[++i];
    } else if (arg === '--output') {
        OUTPUT = process.argv[++i];
    } else if (arg === '--discussion') {
        DISCUSSION = true;
    } else {
        console.log(`Unexpected argument: ${arg}`);
        process.exit();
    }
}

const inputStr = fs.readFileSync(INPUT, 'utf8'),
    input = JSON.parse(inputStr);



const Assert = (expr, errOutput) => {
    if (!expr) {
        console.error(errOutput);
        debugger;
        process.exit(1);
    }
};

const CountElementsIn = (elements, inObj) => {
    let total = 0;
    for (let i = 0; i < elements.length; ++i) {
        if (inObj[elements[i]]) ++total;
    }

    return total;
};

//import { META_MAP } from '../public/js/sharedGlobals.mjs';
//const sharedGlobals = require('../public/js/sharedGlobals.mjs');


// FIXME: This is an absolutely bonkers way to import module, but couldn't find a better way just yet
const window = global;
let sharedGlobalsStr = fs.readFileSync('public/js/sharedGlobals.js', 'utf8');
sharedGlobalsStr = sharedGlobalsStr.split('\n');
sharedGlobalsStr.pop();
sharedGlobalsStr.pop();
sharedGlobalsStr = sharedGlobalsStr.join('\n');
eval(sharedGlobalsStr);


/*
const META_MAP = {

    // nodes
    'text': 'T',
    'katex': 'K',
    'image': 'I',
    'mention': 'M',
    'blockquote': 'B',
    'bulletList': 'BL',
    'orderedList': 'OL',
    'heading': 'H',
    'codeBlock': 'CB',
    'horizontalRule': 'HR',

    // attributes
    'inline': 'i',
    'src': 's',
};
*/

const RECURSIVE_ADJUST_DISCUSSION = (discussion) => {

    let rawBody = discussion['body'] || "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\" \"}]}]}";

    let bodyJSON = JSON.parse(rawBody);
    let {child,elements} = JSON_BODY_TO_HTML(bodyJSON);
    let bodyHTML = child;
    discussion.body = JSON.stringify(bodyHTML);

    if (discussion.replies) {
        for (let i = 0; i < discussion.replies.length; ++i) {
            RECURSIVE_ADJUST_DISCUSSION(discussion.replies[i]);
        }
    } else if (discussion.comments) {
        for (let i = 0; i < discussion.comments.length; ++i) {
            RECURSIVE_ADJUST_DISCUSSION(discussion.comments[i]);
        }
    }
};


const output = [];
for (let i = 0; i < input.length; ++i) {
    const problemIn = input[i];

    const problemOut = problemIn;


    let problemSource = problemIn['source'];
    problemSource = problemSource.match(/([^\/]*).html$/)[1];
    problemOut['source'] = problemSource;


    if (DISCUSSION) {
        //Assert(false, "Dscussion setup");
    } else {

        // Parse category
        const categoryName = problemIn['category'];
        let categoryId = -1;
        if (categoryName === 'Algebra') categoryId = 1;
        else if (categoryName === 'uncategorized') categoryId = 1;
        else if (categoryName === 'Geometry') categoryId = 2;
        else if (categoryName === 'Number Theory') categoryId = 3;
        else if (categoryName === 'Number Theory and Algebra') categoryId = 3;
        else if (categoryName === 'Calculus') categoryId = 4;
        else if (categoryName === 'Logic') categoryId = 5;
        else if (categoryName === 'Classical Mechanics') categoryId = 6;
        else if (categoryName === 'Electricity and Magnetism') categoryId = 7;
        else if (categoryName === 'Computer Science') categoryId = 8;
        else if (categoryName === 'Quantitative Finance') categoryId = 9;
        else if (categoryName === 'Chemistry') categoryId = 10;
        else if (categoryName === 'Biology') categoryId = 11;
        else if (categoryName === 'Probability') categoryId = 12;
        else if (categoryName === 'Basic Mathematics') categoryId = 13;
        else if (categoryName === 'SAT® Math') categoryId = 14;
        else Assert(false, `Unexpected category ${categoryName}`);
        problemOut['category'] = categoryId;

        // Flatten html bodies
        let bodyJSON = JSON.parse(problemIn['body']),
            { child } = JSON_BODY_TO_HTML(bodyJSON),
            bodyHTML = child;
        problemOut['body'] = JSON.stringify(bodyHTML);


        // Discussion
        problemOut.discussions = [];
        problemIn.discussion.forEach((discussion) => {
            RECURSIVE_ADJUST_DISCUSSION(discussion);
            problemOut.discussions.push(discussion);
        });
        delete problemOut.discussion;


        // Solutions
        for (let j = 0; j < problemIn.answers.length; ++j) {
            let answerRaw;
            if (`${parseInt(problemIn.answers[j].text)}` === `${problemIn.answers[j].text}`) {
                answerRaw = parseInt(problemIn.answers[j].text);
            } else {
                try {
                    answerRaw = JSON.parse(problemIn.answers[j].text);
                } catch(e) {
                    // String
                    answerRaw = problemIn.answers[j].text;
                }

                if (answerRaw instanceof Object) {
                    let { child } = JSON_BODY_TO_HTML(answerRaw);
                    answerRaw = child;
                    answerRaw = BODY_HTML_TO_INLINE(answerRaw);
                }
            }

            Assert(!isNaN(answerRaw) && !(answerRaw === undefined || answerRaw === null), `Bad parse on answer: ${problemIn.answers[j].text}`);
            problemOut.answers[j].text = answerRaw;
        }

    }

    output.push(problemOut);
}


if (OUTPUT) {
    const out = JSON.stringify(output);
    fs.writeFileSync(OUTPUT, out);
} else {
    console.log(output);
}
