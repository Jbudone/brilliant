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

let SINGLE_PROBLEM = null; // for debugging -- process a single problem


// FIXME:
//  Parse
//   - Total solution answers, "78% answered correctly", ..
//   - Relevant wiki
//
//   - Date from first post (otherwise preset beginning?)
//   - Moderator Note: http://brilliant.laravel:8000/brilliantexport/problems/00-is-indeterminate/00-is-indeterminate.html

let verbose = false;
let OUTPUT = null;
let DISCUSSION = false; // Parsing discussion, not problem
let UPDATE_IDX = null;


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
    } else if (arg === '--single-problem') {
        SINGLE_PROBLEM = process.argv[++i];
    } else if (arg === '--index') {
        UPDATE_IDX = parseInt(process.argv[++i]);
    } else if (arg === '--discussion') {
        DISCUSSION = true;
    } else {
        console.log(`Unexpected argument: ${arg}`);
        process.exit(1);
    }
}

if (MAX_PROBLEMS > 0) MAX_PROBLEMS += PROBLEM_OFFSET;

const Assert = (expr, errOutput) => {
    if (!expr) {
        console.error(errOutput);
        debugger;
        process.exit(1);
    }

    if (errOutput === undefined && (typeof expr === "string")) {
        Assert(false, "Bad use of Assert");
    }
};


let rawproblemsList = null;
let SINGLE_PROBLEM_IDX = -1;
if (SINGLE_PROBLEM) {

    let rawproblems = fs.readFileSync(PROBLEM_LIST_PATH, 'utf8');
    rawproblemsList = rawproblems.split('\n');

    let prefixPath = 'problems';
    if (DISCUSSION) {
        prefixPath = 'discussions/thread';
    }

    for (let i = 0; i < rawproblemsList.length; ++i) {
        if (rawproblemsList[i].indexOf(`${prefixPath}/${SINGLE_PROBLEM}/${SINGLE_PROBLEM} `) === 0) {
            SINGLE_PROBLEM_IDX = i;
            rawproblemsList = [rawproblemsList[i]];
            break;
        }
    }

    if (SINGLE_PROBLEM_IDX === -1) {
        Assert(false, `Couldn't find problem: ${SINGLE_PROBLEM}`);
    }

    //rawproblemsList = [
    //    `problems/${SINGLE_PROBLEM}/${SINGLE_PROBLEM} PROBLEMNAME`
    //];
    // problems/_______________/_______________ Untitled problem
} else {
    let rawproblems = fs.readFileSync(PROBLEM_LIST_PATH, 'utf8');
    rawproblemsList = rawproblems.split('\n');
}


const CountElementsIn = (elements, inObj) => {
    let total = 0;
    for (let i = 0; i < elements.length; ++i) {
        if (inObj[elements[i]]) ++total;
    }

    return total;
};

const processText = (text) => {
    if (text) return text;
    return " ";
};

const outProblems = [];


// FIXME: This is an absolutely bonkers way to import module, but couldn't find a better way just yet
const window = global;
let sharedGlobalsStr = fs.readFileSync('public/js/sharedGlobals.js', 'utf8');
sharedGlobalsStr = sharedGlobalsStr.split('\n');
sharedGlobalsStr.pop();
sharedGlobalsStr.pop();
sharedGlobalsStr = sharedGlobalsStr.join('\n');
eval(sharedGlobalsStr);


const finishParsingProblems = () => {
    const out = JSON.stringify(outProblems);

    if (OUTPUT) {
        console.log("WRITING TO " + OUTPUT);
        fs.writeFileSync(OUTPUT, out);
    } else {
        console.log(out);
    }
};

const parseDiscussion = (id, env) => {

    let { $, filepath, problemName, problemFile } = env;

    const outProblem = {};
    outProblem.id = id;
    outProblem.source = filepath;

    if (verbose) {
        console.log(id + "   " + problemName + "   " + problemFile);
    }

    const postContainerEl = $('#cmp_discussions_single_id'),
        votesContainerEl = $('#cmp_discussions_post_vote_id'),
        commentsContainerEl = $('#cmp_discussions_comments_id');
    Assert(postContainerEl.length === 1 && votesContainerEl.length === 1 && commentsContainerEl.length === 1, `Unexpected container els: ${filepath}`);

    const postEl = $('#disc-post-single', postContainerEl),
        postHeaderEl = $('.nf-content-header', postEl),
        postBodyEl = $('.body', postEl),
        postBodyContentEl = $('.content', postBodyEl),
        postAuthorEl = $('.disc-author', postContainerEl);
    Assert(postEl.length === 1 && postHeaderEl.length === 1 && postBodyEl.length === 1 && postBodyContentEl.length === 1 && postAuthorEl.length === 1, `Unexpected post els: ${filepath}`);

    const postTagsEl = $('.tags', postBodyEl);
    if (postTagsEl.length === 1) {
        // FIXME: Tags
    }

    // FIXME: #mentions-data
    // FIXME: Upvotes?


    // Body
    const postBody = postBodyContentEl.html().trim('\n');
    outProblem.body = PROBLEM_PARSE_BODY(postBody, env);


    // Author
    const avatarEl = $('.avatar img', postAuthorEl),
        userEl = $('.btn-profile', postAuthorEl),
        userTimeEl = $('.time', postAuthorEl),
        userId = userEl.attr('data-id');
    Assert(avatarEl.length === 1 && userEl.length === 1 && userTimeEl.length === 1, `Unexpected author els: ${filepath}`);

    // FIXME: Confirm  "Note by [name] [date]"
    const avatarSrc = avatarEl.attr('src'),
        profileLink = userEl.attr('href'),
        profileName = profileLink.match(/\/profile\/([^\/]*)\//)[1],
        userName    = userEl.text(),
        postTime    = userTimeEl.attr('title');


    outProblem.author = {
        avatar: avatarSrc,
        profile: profileName,
        name: userName,
        id: userId,
    };

    outProblem.date = postTime;



    // Title
    const titleEl = $('.nf-content-header', postEl);
    Assert( titleEl.length === 1 , `$(.nf-content-header).length != 1: ${filepath}` );
    let problemTitle = "";
    {
        // Title can contain Katex elements
        // FIXME: Abstract this for discussion/problem

        const titleH1El = titleEl[0].childNodes[1];
        Assert(titleH1El.nodeName === "H1", `Unexpected H1 title child: ${filepath}`);
        for (let k = 0; k < titleH1El.childNodes.length; ++k) {
            const titleH1ChildEl = titleH1El.childNodes[k];
            if (titleH1ChildEl.nodeName === "SPAN" && titleH1ChildEl.classList.length === 1 && (titleH1ChildEl.classList[0] === "katex" || titleH1ChildEl.classList[0] === "katex-display")) {
                const annotationEl = $('.katex-mathml annotation', titleH1ChildEl);
                Assert(annotationEl.length === 1, `Katex Title has unexpected annotation element: ${filepath}`);
                problemTitle += "\\(" + processText(annotationEl[0].textContent) + "\\)";
            } else if (titleH1ChildEl.nodeName === "SPAN" && titleH1ChildEl.classList.length === 1 && titleH1ChildEl.classList[0] === "katex-error") {
                problemTitle += "\\(" + processText(titleH1ChildEl.textContent) + "\\)";
            } else if (titleH1ChildEl.nodeName === "#text") {
                problemTitle += titleH1ChildEl.textContent;
            } else {
                Assert(false, `Unexpected element in title: ${filepath}`);
            }
        }
    }
    outProblem.title = problemTitle.trim();


    // FIXME: Comments
    // Comments
    const commentsContainerInnerEl = $('.disc-comments', commentsContainerEl),
        commentEls = $('.comment-item', commentsContainerInnerEl),
        comments = [];
    for (let commentIdx = 0; commentIdx < commentEls.length; ++commentIdx) {
        const commentEl = commentEls.eq(commentIdx),
            commentContainerEl = commentEl.parent(),
            commentId = parseInt(commentEl.attr('data-comment')),
            commentLevel = commentContainerEl.attr('data-level');

        Assert(commentContainerEl.hasClass('cmmnt-container'), `Comment is not immediately contained inside .cmmnt-container: ${filepath}`);
        const comment = {
            el: commentEl,
            id: commentId,
            level: parseInt(commentLevel),
            replies: [],
            parent: null
        }

        // Which comment is this a reply to?
        // NOTE: Need to check from the end -> start to find child-most comment
        let parentComment = null;
        for (let parentCommentIdx = comments.length - 1; parentCommentIdx >= 0; --parentCommentIdx) {
            // comment-level0 [comment-id=6140]
            // replies
            //   reply-to .unhide_new_reply_6140
            //   comment-level1
            //   replies
            // comment-level0
            // comment-level0
            // ...
            if(commentEl.siblings(`.unhide_new_reply_${comments[parentCommentIdx].id}`).length > 0) {
                parentComment = comments[parentCommentIdx];

                // TODO: This assert works on problems but breaks on discussion: http://brilliant.laravel:8000/brilliantexport/discussions/thread/marathi-science-blog/marathi-science-blog.html  (even though the parentComment/child is correct)
                //Assert(comment.level > parentComment.level, `Wrong comment parent found (level mismatch): ${filepath}`);

                parentComment.replies.push(comment);
                comment.parent = parentComment;

                break;
            }
        }

        // Comment author
        const commentFooterEl = $('.meta', commentEl);
        Assert(commentFooterEl.length === 1, `Comment footer el != 1: ${filepath}`);

        const commentNameEl = $('.author', commentFooterEl),
            commentDateEl = $('.ts', commentFooterEl);

        const commentProfileLink = commentNameEl.attr('href'),
            commentProfileName = commentProfileLink.match(/\/profile\/([^\/]*)\//)[1],
            commentUserName = commentNameEl.text(),
            commentUserId = commentNameEl.attr('data-id'),
            commentDate = commentDateEl.text();

        comment.author = {
            profile: commentProfileName,
            name: commentUserName.trim(),
            id: commentUserId
        };
        comment.date = commentDate.trim();



        // Comment content
        // WARNING: We have to process this AFTER the author since we need to remove the .meta el to process the entire block as the comment body
        //const commentContentContainerEl = commentEl.children('.text', commentEl);
        const commentContentContainerEl = commentEl.children('.comment-content').children('.comment-text-wrapper').children('.text');
        Assert(commentContentContainerEl.length === 1, `$(.text, .comment-item).length != 1: ${filepath}`);
        //const commentContentEl = $('p', commentContentContainerEl).first(); // FIXME: Multiple <p>'s
        //Assert(commentContentEl.length === 1, `$(p, commentContentContainerEl).length != 1: ${filepath}`);
        //const commentContent = PROBLEM_PARSE_BODY(commentContentEl.html(), env);
        $('.meta', commentContentContainerEl).remove();
        const commentContent = PROBLEM_PARSE_BODY(commentContentContainerEl.html(), env);
        comment.body = commentContent;

        comments.push(comment);
    }

    outProblem.discussion = [];

    // Nuke non-JSON parts from comments
    for (let commentIdx = comments.length - 1; commentIdx >= 0; --commentIdx) {
        const comment = comments[commentIdx];
        if (comment.parent) {
            comments.splice(commentIdx, 1);
        } else {
            // FIXME: This is to be in line w/ problems -- this sucks tohugh cleanup better
            outProblem.discussion.push(comment);
            comment.comments = comment.replies;
            delete comment.replies;
        }

        delete comment.el;
        delete comment.parent;
    }


    return outProblem;
};

const parseProblem = (id, env) => {

    let { $, filepath, problemName, problemFile } = env;

    const outProblem = {};
    outProblem.id = id;
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
            if (isNaN(categoryLevel)) categoryLevel = 1; // Level Pending
        } else {
            categoryName = matchCat[1];
            categoryLevel = parseInt(matchCat[2]);
            if (isNaN(categoryLevel)) categoryLevel = 1; // Level Pending
        }



        //console.log( $('.topic-level-info').text() );
    }

    if (verbose) {
        console.log(id + "   " + categoryName + " " + categoryLevel + " " + problemName + "   " + problemFile);
    }

    outProblem.category = categoryName;
    outProblem.level = categoryLevel;

    // Title
    const titleEl = $('.old-title-display');
    Assert( titleEl.length === 1 , `$(.old-title-display).length != 1: ${filepath}` );
    let problemTitle = "";// processText(titleEl.text().trim());
    {
        // Title can contain Katex elements

        const titleH1El = titleEl[0].childNodes[1];
        Assert(titleH1El.nodeName === "H1", `Unexpected H1 title child: ${filepath}`);
        for (let k = 0; k < titleH1El.childNodes.length; ++k) {
            const titleH1ChildEl = titleH1El.childNodes[k];
            if (titleH1ChildEl.nodeName === "SPAN" && titleH1ChildEl.classList.length === 1 && (titleH1ChildEl.classList[0] === "katex" || titleH1ChildEl.classList[0] === "katex-display")) {
                const annotationEl = $('.katex-mathml annotation', titleH1ChildEl);
                Assert(annotationEl.length === 1, `Katex Title has unexpected annotation element: ${filepath}`);
                problemTitle += "\\(" + processText(annotationEl[0].textContent) + "\\)";
            } else if (titleH1ChildEl.nodeName === "SPAN" && titleH1ChildEl.classList.length === 1 && titleH1ChildEl.classList[0] === "katex-error") {
                problemTitle += "\\(" + processText(titleH1ChildEl.textContent) + "\\)";
            } else if (titleH1ChildEl.nodeName === "#text") {
                problemTitle += titleH1ChildEl.textContent;
            } else {
                Assert(false, `Unexpected element in title: ${filepath}`);
            }
        }
    }
    outProblem.title = problemTitle.trim();

    // Question
    const questionBodyEl = $('.question-text');
    Assert( questionBodyEl.length === 1 , `$(.question-text).length != 1: ${filepath}` );
    const questionBody = questionBodyEl.html().trim('\n');
    outProblem.body = PROBLEM_PARSE_BODY(questionBody, env);

    // Solutions
    const answerScriptEl = $('#ir_template_holder');
    Assert( answerScriptEl.length === 1 , `$(#ir_template_holder).length != 1: ${filepath}` );
    const answer = answerScriptEl.attr('data-answers-list');
    let multipleChoice = answerScriptEl.attr('data-has-multiple-options') === "true";

    const answers = [];
    if (multipleChoice) {
        const answerContainerEl = $('.solv-mcq-wrapper');
        Assert( answerContainerEl.length === 1 , `$(.solv-mcq-wrapper).length != 1: ${filepath}` );

        const answerEls = $('.btn-mcq', $('.solv-mcq-wrapper'));

        // NOTE: People can post multiple choice problems but only have 1 option
        // FIXME: Transport these to non-multiple choice?
        Assert( answerEls.length >= 1 , `$('.btn-mcq', $('.solv-mcq-wrapper')).length <= 1: ${filepath}` );

        for (let answerIdx = 0; answerIdx < answerEls.length; ++answerIdx) {
            const answerOutEl = $('.btn-mcq', $('.solv-mcq-wrapper')).eq(answerIdx);
            Assert(answerOutEl[0].childNodes.length === 5, `Unexpected solution children: ${filepath}`); // #text span.bg #text span #text
            //const answer = $('.btn-mcq', $('.solv-mcq-wrapper')).eq(answerIdx).text().trim();//[answerIdx].innerText;
            const answerEl = answerOutEl[0].childNodes[3];
            Assert(answerEl.nodeName === "SPAN", `Unexpected solution child: ${filepath}`);
            Assert( answerEl.textContent.length > 0 , `Empty answer: ${filepath}` );
            const answer = PROBLEM_PARSE_BODY($(answerEl).html(), env);

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
    const avatarEl = $('.avatar img', authorEl),
        userEl = $('.btn-profile', authorEl),
        userId = userEl.attr('data-id');

    const avatarSrc = avatarEl.attr('src'),
        profileLink = userEl.attr('href'),
        profileName = profileLink.match(/\/profile\/([^\/]*)\//)[1],
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
        profile: profileName,
        name: userTitle,
        age: userAge,
        id: userId,
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
                solutionNoteEl = solutionEl.siblings('.solution-note'),
                solutionHeaderEl = $('.solution-header', solutionEl),
                solutionFooterEl = $('.solution-footer', solutionEl);

            // Solution Id
            const solutionParentEl = solutionEl[0].parentNode,
                solutionElId = solutionParentEl.attributes['id'].value,
                solutionIdMatch = solutionElId.match(/post-(\d+)/);
            Assert(solutionIdMatch && solutionIdMatch.length === 2, `Unexpected solution Id: ${filepath}`);
            const solutionId = parseInt(solutionIdMatch[1]);
            Assert(!isNaN(solutionId) && solutionId > 0, `Unexpected solution id value: ${filepath}`);
            discussionBit.id = solutionId;

            // Note
            if (solutionNoteEl.length > 0) {
                console.log(`  FIXME: Solution Note ${filepath}`);
                // eg. http://brilliant.laravel:8000/brilliantexport/problems/-49/-49.html
                // eg. http://brilliant.laravel:8000/brilliantexport/problems/freefall/freefall.html
            }

            // Header
            const avatarEl = $('.avatar img', solutionHeaderEl),
                userEl = $('.btn-profile', solutionHeaderEl),
                dateEl = $('span', solutionHeaderEl).last(); // NOTE: Could have [Staff] title

            const avatarSrc = avatarEl.attr('src'),
                profileLink = userEl.attr('href'),
                profileName = profileLink.match(/\/profile\/([^\/]*)\//)[1],
                userName    = userEl.text().trim(),
                userId      = userEl.attr('data-id'),
                datePosted  = dateEl.attr('title');

            Assert(avatarSrc.length > 0, `No avatar for user: ${filepath}`);
            Assert(profileLink.length > 0, `No profile for user: ${filepath}`);
            Assert(userName.length > 0, `No name for user: ${filepath}`);
            Assert(datePosted.length > 0, `No date post for user: ${filepath}`);

            discussionBit.author = {
                avatar: avatarSrc,
                profile: profileName,
                name: userName,
                id: userId
            };

            discussionBit.date = datePosted;


            // Content
            const solutionBody = $('.comment-content .text', solutionEl).html();
            if (!solutionBody) {
                console.log("FIXME: No solution provided -- please confirm");
                discussionBit.body = "";
            } else {
                Assert(solutionBody.length > 0, `No solution provided: ${filepath}`);
                discussionBit.body = PROBLEM_PARSE_BODY(solutionBody, env);
            }


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
                    commentContainerEl = commentEl.parent(),
                    commentId = parseInt(commentEl.attr('data-comment')),
                    commentLevel = commentContainerEl.attr('data-level');

                Assert(commentContainerEl.hasClass('cmmnt-container'), `Comment is not immediately contained inside .cmmnt-container: ${filepath}`);
                const comment = {
                    el: commentEl,
                    id: commentId,
                    level: parseInt(commentLevel),
                    replies: [],
                    parent: null
                }

                // Which comment is this a reply to?
                // NOTE: Need to check from the end -> start to find child-most comment
                let parentComment = null;
                for (let parentCommentIdx = comments.length - 1; parentCommentIdx >= 0; --parentCommentIdx) {
                    // comment-level0 [comment-id=6140]
                    // replies
                    //   reply-to .unhide_new_reply_6140
                    //   comment-level1
                    //   replies
                    // comment-level0
                    // comment-level0
                    // ...
                    if(commentEl.siblings(`.unhide_new_reply_${comments[parentCommentIdx].id}`).length > 0) {
                        parentComment = comments[parentCommentIdx];
                        Assert(comment.level > parentComment.level, `Wrong comment parent found (level mismatch): ${filepath}`);

                        parentComment.replies.push(comment);
                        comment.parent = parentComment;

                        break;
                    }
                }

                // Comment author
                const commentFooterEl = $('.meta', commentEl);
                Assert(commentFooterEl.length === 1, `Comment footer el != 1: ${filepath}`);

                const commentNameEl = $('.author', commentFooterEl),
                    commentDateEl = $('.ts', commentFooterEl);

                const commentProfileLink = commentNameEl.attr('href'),
                    commentProfileName = commentProfileLink.match(/\/profile\/([^\/]*)\//)[1],
                    commentUserName = commentNameEl.text(),
                    commentUserId = commentNameEl.attr('data-id'),
                    commentDate = commentDateEl.text();

                comment.author = {
                    profile: commentProfileName,
                    name: commentUserName.trim(),
                    id: commentUserId
                };
                comment.date = commentDate.trim();



                // Comment content
                // WARNING: We have to process this AFTER the author since we need to remove the .meta el to process the entire block as the comment body
                //const commentContentContainerEl = commentEl.children('.text', commentEl);
                const commentContentContainerEl = commentEl.children('.comment-content').children('.comment-text-wrapper').children('.text');
                Assert(commentContentContainerEl.length === 1, `$(.text, .comment-item).length != 1: ${filepath}`);
                //const commentContentEl = $('p', commentContentContainerEl).first(); // FIXME: Multiple <p>'s
                //Assert(commentContentEl.length === 1, `$(p, commentContentContainerEl).length != 1: ${filepath}`);
                //const commentContent = PROBLEM_PARSE_BODY(commentContentEl.html(), env);
                $('.meta', commentContentContainerEl).remove();
                const commentContent = PROBLEM_PARSE_BODY(commentContentContainerEl.html(), env);
                comment.body = commentContent;

                comments.push(comment);
            }

            // Nuke non-JSON parts from comments
            for (let commentIdx = comments.length - 1; commentIdx >= 0; --commentIdx) {
                const comment = comments[commentIdx];
                if (comment.parent) {
                    comments.splice(commentIdx, 1);
                }

                delete comment.el;
                delete comment.parent;
            }
        }
    }

    outProblem.discussion = discussion;

    // Metadata
    const metaScript = $('#ir_template_holder');
    const archiveMeta = {
        answered: -1
    };
    if (metaScript.length > 0) {
        let correctAnswersMatch = metaScript[0].text.match(/(\d+)\% of people got this right/);
        if (correctAnswersMatch && correctAnswersMatch.length === 2) {
            let correctAnswersPct = parseInt(correctAnswersMatch[1]);
            archiveMeta.answered = correctAnswersPct;
        }
    }

    outProblem.meta = archiveMeta;
    return outProblem;
};

const parseProblemsBatch = (i) => {

    for (let j = 0; j < BATCH_HANDLE; ++j) {

        if ((i+j) >= rawproblemsList.length || (MAX_PROBLEMS > 0 && (i+j) >= MAX_PROBLEMS)) {
            finishParsingProblems();
            return;
        }
        const problem = rawproblemsList[i + j];
        if (problem.length === 0) {
            finishParsingProblems();
            return; // Last line
        }

        const match = problem.match(/^([^\s]+) (.*)$/),
            problemName = match[2],
            problemFile = match[1];


        const filepath = PATH_TO_PROBLEMS + '/../' + problemFile + '.html';
        //console.log(filepath);
        const data = fs.readFileSync(filepath, 'utf8');
        const dom = new JSDOM(data);
        const $ = jQuery(dom.window);

        const env = {
            $, filepath, problemName, problemFile
        };

        let outProblem;
        if (DISCUSSION) {
            outProblem = parseDiscussion((SINGLE_PROBLEM_IDX > -1 ? SINGLE_PROBLEM_IDX : i+j) + 1, env);
        } else {
            outProblem = parseProblem((SINGLE_PROBLEM_IDX > -1 ? SINGLE_PROBLEM_IDX : i+j) + 1, env);
        }

        outProblems.push(outProblem);

        delete $;
        delete dom;
        delete data;
    }
    
    setTimeout(() => { parseProblemsBatch(i + BATCH_HANDLE); }, BATCH_TIMER);
};

if (UPDATE_IDX) {
    // FIXME: Read output file, then update only this one index

    Assert(OUTPUT);

    let prevParseRaw = fs.readFileSync(OUTPUT);
    let prevParse = JSON.parse(prevParseRaw);

    let prevProblemParse = prevParse[UPDATE_IDX];

    const offIdx = UPDATE_IDX + PROBLEM_OFFSET; 
    const problem = rawproblemsList[offIdx];
    const match = problem.match(/^([^\s]+) (.*)$/),
                    problemName = match[2],
                    problemFile = match[1];

    console.log(`Updating: ${prevProblemParse.source} -- ${problemName}`);


    const filepath = prevProblemParse.source;
    const data = fs.readFileSync(filepath, 'utf8');
    const dom = new JSDOM(data);
    const $ = jQuery(dom.window);

    const env = {
        $, filepath, problemName, problemFile
    };

    let outProblem;
    if (DISCUSSION) {
        outProblem = parseDiscussion(offIdx + 1, env);
    } else {
        outProblem = parseProblem(offIdx + 1, env);
    }

    delete $;
    delete dom;
    delete data;

    prevParse[UPDATE_IDX] = outProblem;
    const out = JSON.stringify(prevParse);
    fs.writeFileSync(OUTPUT, out);
} else {
    parseProblemsBatch(PROBLEM_OFFSET);
}
