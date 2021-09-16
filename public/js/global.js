import './sharedGlobals.js';

window['globals'] = {
    ProblemCategories: [
        { name: 'Algebra', id: 1 },
        { name: 'Geometry', id: 2 },
        { name: 'Number Theory', id: 3 },
        { name: 'Calculus', id: 4 },
        { name: 'Logic', id: 5 },
        { name: 'Classical Mechanics', id: 6 },
        { name: 'Electricity and Magnetism', id: 7 },
        { name: 'Computer Science', id: 8 },
        { name: 'Quantitative Finance', id: 9 },
        { name: 'Chemistry', id: 10 },
        { name: 'Biology', id: 11 },
        { name: 'Probability', id: 12 },
        { name: 'Basic Mathematics', id: 13 },
        { name: 'SAT® Math', id: 14 },
    ],

    ProblemLevels: [
        { name: 'Level 1', id: 1 },
        { name: 'Level 2', id: 2 },
        { name: 'Level 3', id: 3 },
        { name: 'Level 4', id: 4 },
        { name: 'Level 5', id: 5 },
    ],
};

window['Assert'] = (expr, msg) => {
    if (!expr) {
        console.error(msg);
        debugger;
    }
};

window['ENCODED_TO_JSON'] = (deflatedStr) => {
    // Inflate encoded body -> json
    const deflatedJson = JSON.parse(deflatedStr),
        inflatedJson = {
            type: "doc",
            content: []
        };

    const READ_META = (meta) => {
        let start = 0,
            end = 1,
            last = meta.indexOf(':') + 1,// meta.length + 1,
            metaList = [],
            postMeta = [], // meta bodies to read post-meta
            postMetaObj = {},
            readTo = 0;

        if(meta.indexOf(':') === -1) last = meta.length + 1;

        while (end < last) {
            const str = meta.substr(start, end - start),
                strUp = str.toUpperCase(),
                lastChar = str[str.length - 1];

            // Multi-char encodings begin w/ all uppercase and end w/ single lowercase
            if (strUp === str) {
                ++end;
                continue;
            }

            // Last char is lowercase, so str is a complete encoding
            Assert(lastChar.toLowerCase() === lastChar, `Unexpected encoding: ${str}`);

            // If we don't find a match here then there's a missing encoding
            Assert(META_MAP_REVERSE[str], `Could not find encoding: ${str}`);

            const metaEl = META_MAP_REVERSE[str];
            if (metaEl === "mention") {
                postMeta.push("profile");
            } else if (metaEl === "heading") {
                postMeta.push("level");
            } else if (metaEl === "link") {
                postMeta.push("href");
            }

            metaList.push(metaEl);
            readTo = end;
            start = readTo;
            ++end;
        }

        Assert(end === last, `Missed part of encoding: ${meta}`);

        for (let i = 0; i < postMeta.length; ++i) {
            let fromPoint = end;
            if (meta.indexOf("http:") === fromPoint) fromPoint += "http:".length;
            else if (meta.indexOf("https:") === fromPoint) fromPoint += "https:".length;

            last = meta.indexOf(':', fromPoint) + 1;
            const str = meta.substr(end, last - end - 1);
            postMetaObj[postMeta[i]] = str;
            end = last + 1;
        }

        return { metaList, metaObj: postMetaObj, metaLength: last-1 };
    };

    const DEFLATED_PARSE = (deflatedStr) => {
        //const endOfMeta = deflatedStr.indexOf(':'),
        //    meta = deflatedStr.substr(0, endOfMeta),
        //    body = deflatedStr.substr(endOfMeta + 1),
        //    inflated = {};

        const { metaList, metaObj, metaLength } = READ_META(deflatedStr),
            body = deflatedStr.substr(metaLength + 1),
            inflated = {},
            metaType = metaList[0];

        if (metaType === 'text') {
            inflated.type = "text";
            inflated.body = body;
            inflated.marks = [];
            for (let i = 1; i < metaList.length; ++i) {
                if (metaList[i] === "link") {
                    metaList[i] = {
                        type: "link",
                        attrs: { href: metaObj['href'], target: "_blank" }
                    };
                } else {
                    metaList[i] = {
                        type: metaList[i]
                    };
                }

                inflated.marks.push(metaList[i]);
            }

        } else if (metaType === 'katex') {
            inflated.type = "katex";
            inflated.inline = metaList.indexOf("inline") > 0;
            inflated.body = body;
        } else if (metaType === 'mention') {
            inflated.type = "mention";
            inflated.profile = metaObj['profile'];
            inflated.body = body;
        } else if (metaType === 'blockquote') {
            inflated.type = "blockquote";
            inflated.count = parseInt(body);
        } else if (metaType === 'codeBlock') {
            inflated.type = "codeBlock";
            inflated.count = parseInt(body);
        } else if (metaType === "heading") {
            inflated.type = "heading";
            inflated.level = metaObj['level'];
            inflated.count = parseInt(body);
        } else if (metaType === "image") {
            inflated.type = "image";
            inflated.src = body;
        } else if (metaType === "horizontalRule") {
            inflated.type = "horizontalRule";
        } else if (metaType === "hardBreak") {
            inflated.type = "hardBreak";
        } else if (metaType === "bulletList") {
            inflated.type = "bulletList";
            inflated.count = parseInt(body);
        } else if (metaType === "orderedList") {
            inflated.type = "orderedList";
            inflated.count = parseInt(body);
        } else if (metaType === "listItem") {
            inflated.type = "listItem";
            inflated.count = parseInt(body);
        } else if (metaType === "table") {
            inflated.type = "table";
            inflated.count = parseInt(body);
        } else if (metaType === "tableRow") {
            inflated.type = "tableRow";
            inflated.count = parseInt(body);
        } else if (metaType === "tableCell") {
            inflated.type = "tableCell";
            inflated.body = body;
        } else if (metaType === "paragraph") {
            inflated.type = "paragraph";
            inflated.count = parseInt(body);
        } else {
            Assert(false, `Unexpected deflated meta type: ${metaType}`);
        }

        return inflated;
    };
    
    const doc = inflatedJson;

    let elStack = [doc],
        childCount = [];

    const pushChildEl = (el) => {

        let parentEl = elStack[elStack.length - 1];
        /*
        if (parentEl.type === "bulletList" || parentEl.type === "orderedList") {
            const intermediaryParentEl = {
                type: "listItem",
                content: []
            };

            parentEl.content.push(intermediaryParentEl);
            parentEl = intermediaryParentEl;
        } else if (parentEl.type === "tableRow") {
            const intermediaryParentEl = {
                type: "tableCell",
                content: []
            };

            parentEl.content.push(intermediaryParentEl);
            parentEl = intermediaryParentEl;
        //} else if (parentEl.type === "paragraph" && el.type === "text") {
        //    el = {
        //        type: "paragraph",
        //        content: [el]
        //    };
        }
        */

        parentEl.content.push(el);
    };


    for (let i = 0; i < deflatedJson.length; ++i) {
        const deflated = deflatedJson[i],
            inflated = DEFLATED_PARSE(deflated);

        if (inflated.type === "text") {
            const el = {
                type: "text",
                text: inflated.body
            };

            if (inflated.marks) el.marks = inflated.marks;

            pushChildEl(el);
        } else if (inflated.type === "katex") {
            const el = {
                type: "katex",
                attrs: {},
                content: []
            };

            if (inflated.inline) el.attrs.inline = true;
            el.content.push({
                type: "text",
                text: inflated.body
            });

            pushChildEl(el);
        } else if (inflated.type === "mention") {
            const el = {
                type: "mention",
                attrs: { profile: inflated.profile },
                content: []
            };

            el.content.push({
                type: "text",
                text: inflated.body
            });

            pushChildEl(el);
        } else if (inflated.type === "blockquote") {
            const el = {
                type: "blockquote",
                content: []
            };

            childCount.push(inflated.count);
            pushChildEl(el);
            elStack.push(el);
        } else if (inflated.type === "codeBlock") {
            const el = {
                type: "pre",
                content: [{
                    type: "codeBlock",
                    content: []
                }]
            };

            childCount.push(inflated.count);
            pushChildEl(el.content[0]);
            elStack.push(el.content[0]);
        } else if (inflated.type === "heading") {
            const el = {
                type: "heading",
                attrs: { level: inflated.level },
                content: []
            };

            childCount.push(inflated.count);
            pushChildEl(el);
            elStack.push(el);
        } else if (inflated.type === "image") {
            const el = {
                type: "image",
                attrs: {
                    src: inflated.src
                }
            };

            pushChildEl(el);
        } else if (["horizontalRule", "hardBreak"].indexOf(inflated.type) >= 0) {
            const el = {
                type: inflated.type,
            };

            pushChildEl(el);
        } else if (["paragraph", "bulletList", "orderedList", "listItem", "table", "tableRow", "tableCell"].indexOf(inflated.type) >= 0) {
            const el = {
                type: inflated.type,
                content: []
            };

            childCount.push(inflated.count);
            pushChildEl(el);
            elStack.push(el);
        } else {
            Assert(false, `Unexpected inflated type: ${inflated.type}`);
        }


        // Predetermined count of children to element
        // NOTE: This hits once on setup
        while (childCount.length > 0) {
            if (--childCount[childCount.length-1] === -1) {
                elStack.pop();
                childCount.pop();
            } else {
                break;
            }
        }
    }

    return inflatedJson;
};

// Same as encoded, but stripped down (for title, solutions, one-liners)
window['INLINE_TO_JSON'] = (raw) => {
    // abc {{ katex }} abc

    const inflatedJson = {
            type: "doc",
            content: [{
                type: "paragraph",
                content: []
            }]
        };

    let html = raw;
    do {
        let idxStart = html.indexOf('\\('),
            idxEnd = html.indexOf('\\)');

        if (idxStart === -1 || idxEnd <= idxStart) break;

        // add left (raw text)
        let start = html.substr(0, idxStart);
        if (start.trim() !== "") {
            inflatedJson.content[0].content.push({
                type: "text",
                text: start
            });
        }

        // add katex
        let katexRaw = html.substr(idxStart + 2, (idxEnd - idxStart) - 2);
        inflatedJson.content[0].content.push({
            type: "katex",
            attrs: { inline: true },
            content: [{ type: "text", text: katexRaw }]
        });

        // update html to right-onward
        html = html.substr(idxEnd + 2);
    } while (true);

    // add remaining text
    if (html.trim() !== "") {
        inflatedJson.content[0].content.push({
            type: "text",
            text: html
        });
    }

    return inflatedJson;
};

window['JSON_TO_HTML'] = (json) => {
    // FIXME: Temp for switching to json
    if (json instanceof Object) {
        return GenerateHTML(json, VueHTMLExtensions);
    } else {

        try {
            json = JSON.parse(json);
        } catch(e) {
            return json;
        }

        return GenerateHTML(json, VueHTMLExtensions);
    }
};

// JSON -> convert text \( ... \) to katex
// Use with Editor
window['JSON_TRANSLATE_INLINE_KATEX'] = (json) => {

    if (json.content) {

        for (let i = 0; i < json.content.length; ++i) {
            const revised = JSON_TRANSLATE_INLINE_KATEX(json.content[i]);
            if (revised instanceof Array) {
                json.content.splice(i, 1, ...revised);
                i += revised.length;
            }
        }
    } else if (json.type === "text") {
        // Look for KaTex and replace here

        let text = json.text;
        let readFrom = 0;
        let split = [];
        do {
            let idxStart = text.indexOf('\\(', readFrom),
                idxEnd = text.indexOf('\\)', idxStart);

            if (idxStart === -1 || idxEnd <= idxStart) break;


            let t = text.substr(readFrom, idxStart - readFrom);
            if (t.trim().length > 0) {
                split.push({
                    type: "text",
                    text: text.substr(readFrom, idxStart - readFrom)
                });
            }

            t = text.substr(idxStart + 2, (idxEnd - idxStart) - 2);
            if (t.trim().length > 0) {
                split.push({
                    type: "katex",
                    attrs: { inline: true },
                    content: [{ type: "text", text: t }]
                });
            }

            readFrom = idxEnd + 2

        } while (true);

        if (split.length === 0) {
            // Nothing changed, no need to revise
            return json;
        }

        let t = text.substr(readFrom);
        if (t.trim().length > 0) {
            split.push({
                type: "text",
                text: text.substr(readFrom)
            });
        }

        return split;
    }

    return json;
};

window['TITLE_TO_HTML'] = (title) => {
    // title with {{ katex }} elements {{ katex }} involved
    let html = "";
    let runningEl = "";
    let inKatex = false;
    for (let i = 0; i < title.length; ++i) {
        if (!inKatex && i < (title.length - 1) && title[i] === '{' && title[i+1] === '{') {
            inKatex = true;
            if (runningEl.length > 0) html += `<span>${runningEl}</span>`;
            runningEl = "";
            i += 1;
            continue;
        }

        if (inKatex && i < (title.length - 1) && title[i] === '}' && title[i+1] === '}') {
            inKatex = false;
            if (runningEl.length > 0) html += `<katex inline>${runningEl}</katex>`;
            runningEl = "";
            i += 1;
            continue;
        }

        runningEl += title[i];
    }

    if (inKatex) {
        html += `<katex inline>${runningEl}</katex>`;
    } else {
        html += `<span>${runningEl}</span>`;
    }

    return html;
};
