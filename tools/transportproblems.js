const fs = require('fs');

let INPUT = 'out';
let OUTPUT = null;
let verbose = false;


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
let sharedGlobalsStr = fs.readFileSync('public/js/sharedGlobals.mjs', 'utf8');
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

const JSON_BODY_TO_HTML = (json) => {

    if (json.type === "doc" || json.type === "paragraph" || json.type === "listItem" || json.type === "tableCell") {
        // top level
        let contents = [];
        for (let i = 0; i < json.content.length; ++i) {
            let child = JSON_BODY_TO_HTML(json.content[i]);
            if (child) {
                if (child instanceof Array) {
                    for (let j = 0; j < child.length; ++j) {
                        contents.push(child[j]);
                    }
                } else {
                    contents.push(child);
                }
            }
        }

        // FIXME: Merge terms (texts, nuke '\n' #text's, etc.)

        return contents;
    } else if (json.type === "text" || json.type === "#text") {
        let meta = META_MAP['text'],
            text = json.text;

        if (json.marks) {
            let postMeta = "";
            for (let i = 0; i < json.marks.length; ++i) {
                const mark = json.marks[i];
                if (mark.type === "link") {
                    meta += META_MAP['link'];
                    postMeta += ":" + mark.attrs.href;
                } else if (mark.type === "italic") {
                    meta += META_MAP['italic'];
                } else if (mark.type === "bold") {
                    meta += META_MAP['bold'];
                } else {
                    Assert(false, `Unexpected mark type for text: ${mark.type}`);
                }
            }

            meta += postMeta;
        }

        return `${meta}:${text}`;
    } else if (json.type === "katex") {
        let meta = META_MAP['katex'],
            body = "";

        if (json.attrs) {
            for (key in json.attrs) {
                if (key === "inline") {
                    if (json.attrs['inline'] === true) {
                        meta += META_MAP['inline'];
                    }
                } else {
                    Assert(false, `Unexpected katex attr key: ${key}`);
                }
            }
        }

        Assert(json.content.length === 1, `Unexpected katex content`);
        Assert(json.content[0].type === "text", `Unexpected katex content element`);
        body += json.content[0].text;

        return `${meta}:${body}`;
    } else if (json.type === "image") {
        let meta = META_MAP['image'],
            body = "";

        if (json.attrs) {
            for (key in json.attrs) {
                if (key === "src") {
                    body += json.attrs[key];
                } else {
                    Assert(false, `Unexpected image attr key: ${key}`);
                }
            }
        }

        return `${meta}:${body}`;
    } else if (json.type === "mention") {
        let meta = META_MAP['mention'],
            body = "";

        for (let i = 0; i < json.attrs.length; ++i) {
            const attr = json.attrs[i];
            if (attr.hasOwnProperty('profile')) {
                if (attr.profile === "") {
                } else {
                    const profileMatch = attr.profile.match(/https:\/\/brilliant.org\/profile\/(.*)\/$/);
                    Assert(profileMatch && profileMatch.length === 2, `Unexpected profile: ${attr.profile}`);
                    const profile = profileMatch[1];
                    Assert(profile, `Could not parse profile: ${attr.profile}`);
                    Assert(profile.indexOf(':') === -1, `Bad profile parse: ${profile}`);
                    meta += ':' + profile;
                }
            } else {
                Assert(false, `Unexpected profile attr key: ${Object.keys(attr)[0]}`);
            }
        }

        Assert(json.content.length === 1, `Unexpected contennt for mention`);
        Assert(json.content[0].type === "text", `Unexpected content type for mention`);
        body += json.content[0].text;

        return `${meta}:${body}`;
    } else if (json.type === "horizontalRule" || json.type === "hardBreak") {
        let meta = META_MAP[json.type];
        return `${meta}`;
    } else if (["em", "strong", "a"].indexOf(json.type) >= 0) {

        // Leave out em/strong/a tag since those are set in Marks on text elements
        let contents = [];
        for (let i = 0; i < json.content.length; ++i) {
            let child = JSON_BODY_TO_HTML(json.content[i]);
            if (child) {
                if (child instanceof Array) {
                    for (let j = 0; j < child.length; ++j) {
                        contents.push(child[j]);
                    }
                } else {
                    contents.push(child);
                }
            }
        }
        return contents;
    } else if (["bulletList", "orderedList", "blockquote", "heading", "codeBlock", "table", "tableRow", "em", "strong", "a"].indexOf(json.type) >= 0) {
        let meta = META_MAP[json.type];

        if (json.type === "heading") {
            for (let i = 0; i < json.attrs.length; ++i) {
                const attr = json.attrs[i];
                if (attr.level) {
                    meta += ':' + attr.level;
                } else {
                    Assert(false, `Unexpected heading attr key: ${key}`);
                }
            }
        }

        let contents = [];
        for (let i = 0; i < json.content.length; ++i) {
            let child = JSON_BODY_TO_HTML(json.content[i]);
            if (child) {
                if (child instanceof Array) {
                    for (let j = 0; j < child.length; ++j) {
                        contents.push(child[j]);
                    }
                } else {
                    contents.push(child);
                }
            }
        }

        // FIXME: em/strong/link recursively go through children and set marks
        /* NOTE: Can't do it here because its already encoded string
        if (json.type === "em") {
            const setMarks = (child) => {
                if (child.type === "text") {
                    if (!child.marks) child.marks = [];

                    if (json.type === "em") {
                        child.marks.push({ type: "italic" });
                    }
                }
            };

            const RUN_ON_CHILDREN = (child, fn) => {
                fn(child);
                if (child.contents) {
                    for (let i = 0; i < child.contents.length; ++i) {
                        RUN_ON_CHILDREN(child.contents[i], fn);
                    }
                }
            };

            for (let i = 0; i < contents.length; ++i) {
                RUN_ON_CHILDREN(contents[i], setMarks);
            }
        }
        */

        // FIXME: Merge terms (texts, nuke '\n' #text's, etc.)

        contents.unshift(`${meta}:${contents.length}`);
        return contents;
    } else {
        Assert(false, `Unexpected type: ${json.type}  - ${JSON.stringify(json)}`);
    }
};

const RECURSIVE_ADJUST_DISCUSSION = (discussion) => {

    let rawBody = discussion['body'] || "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\" \"}]}]}";

    let bodyJSON = JSON.parse(rawBody),
        bodyHTML = JSON_BODY_TO_HTML(bodyJSON);
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

    const problemOut = problemIn;
    problemOut['category'] = categoryId;


    let problemSource = problemIn['source'];
    problemSource = problemSource.match(/([^\/]*).html$/)[1];
    problemOut['source'] = problemSource;

    //ProblemCategories: [
    //    { name: 'Algebra', id: 1 },
    //    { name: 'Geometry', id: 2 },
    //    { name: 'Number Theory', id: 3 },
    //    { name: 'Calculus', id: 4 },
    //    { name: 'Logic', id: 5 },
    //    { name: 'Classical Mechanics', id: 6 },
    //    { name: 'Electricity and Magnetism', id: 7 },
    //    { name: 'Computer Science', id: 8 },
    //    { name: 'Quantitative Finance', id: 9 },
    //    { name: 'Chemistry', id: 10 },
    //],

    // Flatten html bodies
    let bodyJSON = JSON.parse(problemIn['body']),
        bodyHTML = JSON_BODY_TO_HTML(bodyJSON);
    problemOut['body'] = JSON.stringify(bodyHTML);


    problemOut.discussions = [];
    problemIn.discussion.forEach((discussion) => {
        RECURSIVE_ADJUST_DISCUSSION(discussion);
        problemOut.discussions.push(discussion);
    });
    delete problemOut.discussion;


    output.push(problemOut);
}


if (OUTPUT) {
    const out = JSON.stringify(output);
    fs.writeFileSync(OUTPUT, out);
} else {
    console.log(output);
}
