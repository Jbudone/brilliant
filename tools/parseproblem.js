const fs = require('fs'),
    jsdom = require('jsdom'),
    jQuery = require('jquery');

const JSDOM = jsdom.JSDOM;

let PROBLEM_LIST_PATH = '../rawproblems';
let PATH_TO_PROBLEMS = '../brilliantexport/problems';


//import TipTapForm from './tiptapform.vue';
//import { generateJSON } from '@tiptap/html'; 

const tiptap = require('tiptap');
const { generateJSON } = require('@tiptap/html');



const {Document} = require( '@tiptap/extension-document'  );
const {Paragraph} = require(  '@tiptap/extension-paragraph' );
const {Text} = require(  '@tiptap/extension-text' );
const {Bold} = require(  '@tiptap/extension-bold' );
const {Italics} = require(  '@tiptap/extension-italic' );
const {HardBreak} = require( '@tiptap/extension-hard-break' );


const tiptapExtensions = [Document, Paragraph, Text]


// DEBGGING: Test tiptap html -> json generates
/*
var json = generateJSON("<a class='katex'>test</a>", tiptapExtensions);
console.log(JSON.stringify(json));
process.exit();
*/


// DEBUGGING: To add jQuery in console for testing
/*
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://code.jquery.com/jquery-3.6.0.js';
document.head.appendChild(script);
*/

// Handle in batches to allow GC to clear DOM
let BATCH_HANDLE = 100,
    BATCH_TIMER = 2000;

let PROBLEM_OFFSET = 0; // for debugging -- start at this offset
let MAX_PROBLEMS = 0;


// FIXME:
//  Parse
//   - Text: image, solution
//   - Total solution answers, "78% answered correctly", ..
//   - Relevant wiki
//
//   - Date from first post (otherwise preset beginning?)

let verbose = false;
let OUTPUT = null;


// Parse arguments
for (let i = 2; i < process.argv.length; ++i) {
    const arg = process.argv[i];
    if (arg === '--verbose') {
        verbose = true;
    } else if (arg === '--path-to-problems') {
        PATH_TO_PROBLEMS = process.argv[++i];
    } else if (arg === '--problem-list') {
        PROBLEM_LIST_PATH = process.argv[++i];
    } else if (arg === '--output') {
        OUTPUT = process.argv[++i];
    } else if (arg === '--offset') {
        PROBLEM_OFFSET = parseInt(process.argv[++i]);
    } else if (arg === '--batch-size') {
        MAX_PROBLEMS = parseInt(process.argv[++i]);
    } else {
        console.log(`Unexpected argument: ${arg}`);
        process.exit(1);
    }
}

if (MAX_PROBLEMS > 0) MAX_PROBLEMS += PROBLEM_OFFSET;


const rawproblems = fs.readFileSync(PROBLEM_LIST_PATH, 'utf8'),
    rawproblemsList = rawproblems.split('\n');


const Assert = (expr, errOutput) => {
    if (!expr) {
        console.error(errOutput);
        debugger;
        process.exit(1);
    }
};

const outProblems = [];


const finishParsingProblems = () => {
    const out = JSON.stringify(outProblems);

    if (OUTPUT) {
        fs.writeFileSync(OUTPUT, out);
    } else {
        console.log(out);
    }
};

// Reverse generated html -> markdown/latex
const processBody = (body, env) => {
    const { filepath, $ } = env;
    const html = $.parseHTML(body);

    const recursiveGetInputFromEl = (el) => {

        /*
        if (el.nodeName === "P") {
            // <p>..</p>
            const children = el.children;
            if (children.length > 0) {
                for (let i = 0; i < children.length; ++i) {
                    input += recursiveGetInputFromEl(children[i]);
                }
            } else {
                // plain text
                input += el.innerHTML;
            }
        } else if (el.nodeName === "#text") {
            // text fragment
            input += el.textContent;
        } else if (el.nodeName === "SPAN") {
            if (el.classList.length >= 1 && el.classList[0] === "katex") {
                const mathmlEl = el.children[0];
                Assert(el.children.length === 2, `katex has not 2 children: ${filepath}`);
                Assert(mathmlEl.classList[0] === "katex-mathml", `katex mathml unexpected: ${filepath}`);
                Assert(mathmlEl.children.length === 1, `katex-mathml has unexpected children: ${filepath}`);
                Assert(mathmlEl.children[0].children.length === 1, `math has unexpected children: ${filepath}`);
                Assert(mathmlEl.children[0].children[0].children.length === 2, `semantics has unexpected children: ${filepath}`);
                const annotationEl = mathmlEl.children[0].children[0].children[1];
                Assert(annotationEl.nodeName === "annotation", `unexpected annotation: ${filepath}`);
                return annotationEl.innerHTML;
            } else {
                Assert(false, `ProcessBody - unexpected class for <span> '${el.classList[0]}' ${filepath}`);
            }
        } else if (el.nodeName === "A") {
            if (el.classList.length >= 1 && el.classList[0] === "at-mention") {
                // FIXME: Could include attributes for profile
                input += el.innerHTML;
            } else {
                Assert(false, `ProcessBody - unexpected class for <a> '${el.classList[0]}' ${filepath}`);
            }
        } else {
            Assert(false, `ProcessBody - unexpected nodeName '${el.nodeName}' ${filepath}`);
        }

        Assert(input && input !== "undefined" && input.length > 0, `Unexpected input "${input}": ${filepath}`);
        */


        let json = {};
        if (el.nodeName === "P") {
            // <p>..</p>
            json.type = "paragraph";
            json.content = [];
            const children = el.childNodes;
            if (children.length > 0) {
                for (let i = 0; i < children.length; ++i) {
                    const contentChild = recursiveGetInputFromEl(children[i]);
                    json.content.push(contentChild);
                }
            } else {
                // plain text
                Assert(el.innerHTML === el.textContent, `Unexpected <p> innerHTML != el.textContent: ${filepath}`);
                const contentChild = {
                    type: "text",
                    text: el.textContent
                };
                json.content.push(contentChild);
            }
        } else if (el.nodeName === "#text") {
            // text fragment
            json.type = "text";
            json.text = el.textContent;
        } else if (el.nodeName === "SPAN") {
            if (el.classList.length >= 1 && el.classList[0] === "katex") {
                const mathmlEl = el.childNodes[0];
                Assert(el.childNodes.length === 2, `katex has not 2 children: ${filepath}`);
                Assert(mathmlEl.classList[0] === "katex-mathml", `katex mathml unexpected: ${filepath}`);
                Assert(mathmlEl.childNodes.length === 1, `katex-mathml has unexpected children: ${filepath}`);
                Assert(mathmlEl.childNodes[0].childNodes.length === 1, `math has unexpected children: ${filepath}`);
                Assert(mathmlEl.childNodes[0].childNodes[0].childNodes.length === 2, `semantics has unexpected children: ${filepath}`);
                const annotationEl = mathmlEl.childNodes[0].childNodes[0].childNodes[1];
                Assert(annotationEl.nodeName === "annotation", `unexpected annotation: ${filepath}`);

                Assert(annotationEl.innerHTML === annotationEl.textContent, `Unexpected <span> innerHTML != el.textContent: ${filepath}`);
                json.type = "katex";
                json.content = [{ type: "text", text: annotationEl.innerHTML }];
            } else {
                Assert(false, `ProcessBody - unexpected class for <span> '${el.classList[0]}' ${filepath}`);
            }
        } else if (el.nodeName === "A") {
            if (el.classList.length >= 1 && el.classList[0] === "at-mention") {
                Assert(el.attributes.length === 4 && el.attributes[3].name === 'href', `Unexpected <a> attributes format: ${filepath}`);
                Assert(el.innerHTML === el.textContent, `Unexpected <a> innerHTML != el.textContent: ${filepath}`);
                json.type = "mention";
                json.content = [{ type: "text", text: el.innerHTML }];
                json.attributes = [{ profile: el.attributes[3].textContent }];
            } else {
                Assert(false, `ProcessBody - unexpected class for <a> '${el.classList[0]}' ${filepath}`);
            }
        } else {
            Assert(false, `ProcessBody - unexpected nodeName '${el.nodeName}' ${filepath}`);
        }

        Assert(json && Object.entries(json).length > 0, `Unexpected json parse: ${filepath}`);
        return json;
    };

    // Generate JSON rather than HTML since we could have <> in codeblocks which may break html parsing
    let doc = {
        type: "doc",
        content: []
    };
    for (let i = 0; i < html.length; ++i) {
        const el = html[i];
        const elJson = recursiveGetInputFromEl(el);
        if (elJson) doc.content.push(elJson);
    }

    //let json = generateJSON(input, tiptapExtensions);
    let jsonStr = JSON.stringify(doc);
    return jsonStr;
};

const parseProblemsBatch = (i) => {

    for (let j = 0; j < BATCH_HANDLE; ++j) {

        if ((i+j) >= rawproblemsList.length || (MAX_PROBLEMS > 0 && (i+j) >= MAX_PROBLEMS)) {
            finishParsingProblems();
            return;
        }
        const problem = rawproblemsList[i + j];
        if (problem.length === 0) return; // Last line

        const match = problem.match(/^([^\s]+) (.*)$/),
            problemName = match[2],
            problemFile = match[1];


        const filepath = PATH_TO_PROBLEMS + '/../' + problemFile + '.html';
        //console.log(filepath);
        const data = fs.readFileSync(filepath, 'utf8');
        const dom = new JSDOM(data);
        const $ = jQuery(dom.window);

        const env = {
            $, filepath
        };

        const outProblem = {};
        outProblem.source = filepath;
        //console.log(data);

        const categoryAndLevel = $('.topic-level-info').text();

        // Category / Level
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
                categoryLevel = parseInt(matchCat[1]);
            } else {
                categoryName = matchCat[1];
                categoryLevel = parseInt(matchCat[2]);
            }



            //console.log( $('.topic-level-info').text() );
        }

        if (verbose) {
            console.log((i+j) + "   " + categoryName + " " + categoryLevel + " " + problemName + "   " + problemFile);
        }

        outProblem.category = categoryName;
        outProblem.level = categoryLevel;
        outProblem.title = problemName;

        // Question
        const questionBodyEl = $('.question-text');
        Assert( questionBodyEl.length === 1 , `$(.question-text).length != 1: ${filepath}` );
        const questionBody = questionBodyEl.html().trim('\n');
        outProblem.body = processBody(questionBody, env);

        // Solutions
        const answerScriptEl = $('#ir_template_holder');
        Assert( answerScriptEl.length === 1 , `$(#ir_template_holder).length != 1: ${filepath}` );
        const answer = answerScriptEl.attr('data-answers-list'),
            multipleChoice = answerScriptEl.attr('data-has-multiple-options') === "true";

        const answers = [];
        if (multipleChoice) {
            const answerContainerEl = $('.solv-mcq-wrapper');
            Assert( answerContainerEl.length === 1 , `$(.solv-mcq-wrapper).length != 1: ${filepath}` );

            const answerEls = $('.btn-mcq', $('.solv-mcq-wrapper'));
            Assert( answerEls.length > 1 , `$('.btn-mcq', $('.solv-mcq-wrapper')).length <= 1: ${filepath}` );

            // FIXME: processBody for answers
            for (let answerIdx = 0; answerIdx < answerEls.length; ++answerIdx) {
                const answer = $('.btn-mcq', $('.solv-mcq-wrapper')).eq(answerIdx).text().trim();//[answerIdx].innerText;
                Assert( answer.length > 0 , `Empty answer: ${filepath}` );

                const correct = $( $('.btn-mcq', $('.solv-mcq-wrapper'))[answerIdx] ).hasClass('correct')
                answers.push({ correct: correct, text: answer });
            }
        } else {
            answers.push({ correct: true, text: answer });
        }

        outProblem.answers = answers;

        // Author
        const authorEl = $('.solv-author');
        Assert(authorEl.length === 1, `authorEl !== 1: ${filepath}`);
        const avatarEl = $('avatar img', authorEl),
            userEl = $('.btn-profile', authorEl);

        const avatarSrc = avatarEl.attr('src'),
            profileLink = userEl.attr('href'),
            userName    = userEl.text(),
            userText    = userEl.parent().text(),
            userTitle   = userEl.attr('title');

        Assert(userTitle.length > 0 && userTitle.indexOf('\\') === -1 && userTitle.indexOf('"') === -1, `Bad user title: ${filepath}`);

        /*
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }

        const escapedUserTitle = escapeRegExp(userTitle);

        const userMatch   = userText.match(new RegExp("^\\s*by\\s+("+ escapedUserTitle +"),?\\s*(\\d+)?,?\\s*(.*)?\\s*$"));
        Assert(userMatch, `Bad user match: ${filepath}`);

        let userAge = null, userLocation = null;
        if (userMatch.length > 2 && userMatch[2] !== undefined) {
            // age or location included
            Assert(userMatch.length === 4, "FIX Age/Location");
            const userAge = parseInt(userMatch[2]);
            Assert(userAge >= 0 && userAge < 100, `Bad user age: ${filepath}`);
            const userLocation = userMatch[3].trim();
            Assert(userLocation.length > 0, `Bad user location: ${filepath}`);
        }
        */

        let userAge = null, userLocation = null;
        const userTextChunks = $.parseHTML($('.solv-author .text').html());
        if (userTextChunks.length >= 4) {
            Assert(userTextChunks.length === 5, `Unexpected userText chunks: ${filepath}`); // Expect ends w/ #text "\n\n\n"
            const userAgeParts = userTextChunks[2].textContent.match(/^,?\s*(\d+),?\s*$/);
            userAge = parseInt(userAgeParts[1]);
            userLocation = userTextChunks[3].textContent.trim();
        } else if (userTextChunks.length === 3) {
            let ageOrLocation = userTextChunks[2].textContent;
            if (parseInt(ageOrLocation) > 0) {
                userAge = ageOrLocation;
            } else {
                userLocation = ageOrLocation.trim();
            }
        }


        outProblem.author = {
            avatar: avatarSrc,
            profile: profileLink,
            name: userTitle,
            age: userAge,
            location: userLocation
        };


        // Discussion
        const discussionContainerEl = $('.discsol-list');
        Assert( discussionContainerEl.length === 1 , `$(.discsol-list).length != 1: ${filepath}` );
        const solutionEls = $('.solution', discussionContainerEl);
        const discussion = [];
        if (solutionEls.length > 0) {
            for (let solutionIdx = 0; solutionIdx < solutionEls.length; ++solutionIdx) {
                
                const discussionBit = {};
                discussion.push(discussionBit);

                const solutionEl = $('.solution-main', solutionEls.eq(solutionIdx)),
                    solutionHeaderEl = $('.solution-header', solutionEl),
                    solutionFooterEl = $('.solution-footer', solutionEl);

                // Header
                const avatarEl = $('.avatar img', solutionHeaderEl),
                    userEl = $('.btn-profile', solutionHeaderEl),
                    dateEl = $('span', solutionHeaderEl).last(); // NOTE: Could have [Staff] title

                const avatarSrc = avatarEl.attr('src'),
                    profileLink = userEl.attr('href'),
                    userName    = userEl.text().trim(),
                    datePosted  = dateEl.attr('title');

                Assert(avatarSrc.length > 0, `No avatar for user: ${filepath}`);
                Assert(profileLink.length > 0, `No profile for user: ${filepath}`);
                Assert(userName.length > 0, `No name for user: ${filepath}`);
                Assert(datePosted.length > 0, `No date post for user: ${filepath}`);

                discussionBit.author = {
                    avatar: avatarSrc,
                    profile: profileLink,
                    name: userName
                };

                discussionBit.date = datePosted;


                // Content
                const solutionBody = $('.comment-content .text', solutionEl).html();
                Assert(solutionBody.length > 0, `No solution provided: ${filepath}`);
                discussionBit.body = processBody(solutionBody, env);


                // Footer
                const helpfulEl   = $('.reactions .helpful', solutionFooterEl),
                    interestingEl = $('.reactions .interesting', solutionFooterEl),
                    brilliantEl   = $('.reactions .brilliant', solutionFooterEl),
                    confusedEl    = $('.reactions .confused', solutionFooterEl);
                
                const helpfulCount   = parseInt(helpfulEl.text().match(/^\d+/)[0]),
                    interestingCount = parseInt(interestingEl.text().match(/^\d+/)[0]),
                    brilliantCount   = parseInt(brilliantEl.text().match(/^\d+/)[0]),
                    confusedCount    = parseInt(confusedEl.text().match(/^\d+/)[0]);

                discussionBit.reactions = [helpfulCount, interestingCount, brilliantCount, confusedCount];


                // Comments
                const solutionContainerEl = solutionEl.parent().parent(),
                    commentsContainerEl = $('.discsol-comments', solutionContainerEl),
                    commentEls = $('.comment-item', commentsContainerEl),
                    comments = [];
                discussionBit.comments = comments;
                for (let commentIdx = 0; commentIdx < commentEls.length; ++commentIdx) {
                    const commentEl = commentEls.eq(commentIdx),
                        commentContainerEl = commentEl.parent();

                    Assert(commentContainerEl.hasClass('cmmnt-container'), `Comment is not immediately contained inside .cmmnt-container: ${filepath}`);
                    const comment = {
                        el: commentEl,
                        replies: [],
                        parent: null
                    }

                    // Which comment is this a reply to?
                    // NOTE: Need to check from the end -> start to find child-most comment
                    let parentComment = null;
                    for (let parentCommentIdx = comments.length - 1; parentCommentIdx >= 0; --parentCommentIdx) {
                        if (comments[parentCommentIdx].el.has(commentEl)) {
                            parentComment = comments[parentCommentIdx];
                            parentComment.replies.push(comment);
                            comment.parent = parentComment;
                            break;
                        }
                    }

                    // Comment content
                    const commentContentContainerEl = $('.text', commentEl);
                    Assert(commentContentContainerEl.length === 1, `$(.text, .comment-item).length != 1: ${filepath}`);
                    const commentContentEl = $('p', commentContentContainerEl).first();
                    Assert(commentContentEl.length === 1, `$(p, commentContentContainerEl).length != 1: ${filepath}`);
                    const commentContent = processBody(commentContentEl.html(), env);
                    comment.body = commentContent;

                    // Comment author
                    const commentFooterEl = $('.meta', commentEl);
                    Assert(commentFooterEl.length === 1, `Comment footer el != 1: ${filepath}`);

                    const commentNameEl = $('.author', commentFooterEl),
                        commentDateEl = $('.ts', commentFooterEl);

                    const commentProfileLink = commentNameEl.attr('href'),
                        commentUserName = commentNameEl.text(),
                        commentDate = commentDateEl.text();

                    comment.author = {
                        profile: commentProfileLink,
                        name: commentUserName.trim()
                    };
                    comment.date = commentDate.trim();
                    comments.push(comment);
                }

                // Nuke non-JSON parts from comments
                for (let commentIdx = 0; commentIdx < comments.length; ++commentIdx) {
                    const comment = comments[commentIdx];
                    delete comment.el;
                    delete comment.parent;
                }
            }
        }

        outProblem.discussion = discussion;


        outProblems.push(outProblem);

        delete $;
        delete dom;
        delete data;
    }
    
    setTimeout(() => { parseProblemsBatch(i + BATCH_HANDLE); }, BATCH_TIMER);
};

parseProblemsBatch(PROBLEM_OFFSET);
