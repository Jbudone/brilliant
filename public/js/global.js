import './sharedGlobals.mjs';

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
            content: [{
                type: "paragraph",
                content: []
            }]
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
            inflated.type = "horizontalRule";
        } else if (metaType === "bulletList") {
            inflated.type = "bulletList";
            inflated.count = parseInt(body);
        } else if (metaType === "orderedList") {
            inflated.type = "orderedList";
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
        } else {
            Assert(false, `Unexpected deflated meta type: ${metaType}`);
        }

        return inflated;
    };
    
    const firstParagraph = inflatedJson.content[0];

    let elStack = [firstParagraph],
        childCount = -1;

    const pushChildEl = (el) => {

        let parentEl = elStack[elStack.length - 1];
        if (elStack.type === "bulletList" || elStack.type === "orderedList") {
            const intermediaryParentEl = {
                type: "listItem",
                content: []
            };

            parentEl.content.push(intermediaryParentEl);
            parentEl = intermediaryParentEl;
        } else if (elStack.type === "tableRow") {
            const intermediaryParentEl = {
                type: "tableCell",
                content: []
            };

            parentEl.content.push(intermediaryParentEl);
            parentEl = intermediaryParentEl;
        }

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

            childCount = inflated.count;
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

            childCount = inflated.count;
            pushChildEl(el.content[0]);
            elStack.push(el.content[0]);
        } else if (inflated.type === "heading") {
            const el = {
                type: "heading",
                attrs: { level: inflated.level },
                content: []
            };

            childCount = inflated.count;
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
        } else if (["bulletList", "orderedList", "table", "tableRow"].indexOf(inflated.type) >= 0) {
            const el = {
                type: inflated.type,
                content: []
            };

            childCount = inflated.count;
            pushChildEl(el);
            elStack.push(el);
        } else {
            Assert(false, `Unexpected inflated type: ${inflated.type}`);
        }


        // Predetermined count of children to element
        // NOTE: This hits once on setup
        if (childCount > -1) {
            if (--childCount === -1) {
                elStack.pop();
            }
            
        }
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
