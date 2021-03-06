
// Encoding for attribute
// Multi-char encodings prefixed w/ capital and ONLY the last element is lowercase
const META_MAP = {

    // nodes -- 2 char
    'paragraph': 'Pa',
    'text': 'Tx',
    'katex': 'Ka',
    'image': 'Im',
    'mention': 'Me',
    'blockquote': 'Bq',
    'bulletList': 'Bl',
    'orderedList': 'Ol',
    'listItem': 'Li',
    'heading': 'Hd',
    'codeBlock': 'Cb',
    'horizontalRule': 'Hr',
    'hardBreak': 'Hb',
    'table': 'Tb',
    'tableRow': 'Tr',
    'tableCell': 'Tc',

    'em': 'Em',
    'strong': 'St',
    'a': 'Ah',
    'code': 'Co',

    // attributes
    'inline': 'i',
    'src': 's',
    'italic': 'e',
    'bold': 'b',
    'link': 'l',
    'underline': 'u'
};

const META_MAP_REVERSE = {};
for (const key in META_MAP) {
    const val = META_MAP[key];
    if (META_MAP_REVERSE[val]) {
        throw "Duplicated key in META_MAP";
    }

    META_MAP_REVERSE[val] = key;
}

// Inflated JSON -> Deflated
const JSON_BODY_TO_HTML = (json) => {

    if (json.type === "doc") {
        // top level
        let contents = [];
        const contentLen = json.content ? json.content.length : 0;
        for (let i = 0; i < contentLen; ++i) {
            let { child, elements } = JSON_BODY_TO_HTML(json.content[i]);
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

        return { child: contents, elements: 1 };
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
                } else if (['italic', 'bold', 'underline', 'code'].indexOf(mark.type) >= 0) {
                    meta += META_MAP[mark.type];
                } else {
                    Assert(false, `Unexpected mark type for text: ${mark.type}`);
                }
            }

            meta += postMeta;
        }

        return { child: `${meta}:${text}`, elements: 1 };
    } else if (json.type === "katex") {
        let meta = META_MAP['katex'],
            body = "";

        if (json.attrs) {
            Object.keys(json.attrs).forEach((key) => {
                if (key === "inline") {
                    if (json.attrs['inline'] === true) {
                        meta += META_MAP['inline'];
                    }
                } else {
                    Assert(false, `Unexpected katex attr key: ${key}`);
                }
            });
        }

        Assert(json.content.length === 1, `Unexpected katex content`);
        Assert(json.content[0].type === "text", `Unexpected katex content element`);
        body += json.content[0].text;

        return { child: `${meta}:${body}`, elements: 1 };
    } else if (json.type === "image") {
        let meta = META_MAP['image'],
            body = "";

        if (json.attrs) {
            Object.keys(json.attrs).forEach((key) => {
                if (key === "src") {
                    body += json.attrs[key];
                } else {
                    Assert(false, `Unexpected image attr key: ${key}`);
                }
            });
        }

        return { child: `${meta}:${body}`, elements: 1 };
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

        return { child: `${meta}:${body}`, elements: 1 };
    } else if (json.type === "horizontalRule" || json.type === "hardBreak") {
        let meta = META_MAP[json.type];
        return { child: `${meta}`, elements: 1 };
    } else if (["em", "strong", "code", "a"].indexOf(json.type) >= 0) {

        // Leave out em/strong/code/a tag since those are set in Marks on text elements
        let contents = [];
        let immediateChildren = 0;
        for (let i = 0; i < json.content.length; ++i) {
            let { child, elements } = JSON_BODY_TO_HTML(json.content[i]);
            immediateChildren += elements;
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
        return { child: contents, elements: immediateChildren };
    } else if (["paragraph","bulletList", "orderedList", "blockquote", "heading", "codeBlock", "table", "tableRow", "listItem", "tableCell"].indexOf(json.type) >= 0) {
        let meta = META_MAP[json.type];

        if (json.type === "heading") {
            let foundLevel = false;
            if ('level' in json.attrs) {
                // TODO: Inconsistency here, sometimes array sometimes obj
                meta += ':' + json.attrs.level;
                foundLevel = true;
            } else {
                for (let i = 0; i < json.attrs.length; ++i) {
                    const attr = json.attrs[i];
                    if (attr.level) {
                        meta += ':' + attr.level;
                        foundLevel = true;
                    } else {
                        Assert(false, `Unexpected heading attr key: ${key}`);
                    }
                }
            }

            Assert(foundLevel, `Couldn't find level of heading`);
        }

        let contents = [];
        let contentLen = (json && json.content) ? json.content.length : 0;
        let immediateChildren = 0;
        for (let i = 0; i < contentLen; ++i) {
            let { child, elements } = JSON_BODY_TO_HTML(json.content[i]);
            immediateChildren += elements;
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

        contents.unshift(`${meta}:${immediateChildren}`);
        return { child: contents, elements: 1 };
    } else {
        Assert(false, `Unexpected type: ${json.type}  - ${JSON.stringify(json)}`);
    }
};

// Deflated w/ separated katex -> raw text w/ inlined katex \( \)
const BODY_HTML_TO_INLINE = (list) => {

    let inline = "";
    for (let i = 0; i < list.length; ++i) {
        const el = list[i];
        const elType = el.substr(0, 2), // Intentionally ignore marks
            elText = el.substr(el.indexOf(':') + 1);

        // Unfortunately Brilliant allowed some odd content for solutions; just ignore these
        const ignoredWhitelist = [META_MAP['horizontalRule'], META_MAP['orderedList'], META_MAP['bulletList'], META_MAP['blockquote'], META_MAP['heading'], META_MAP['listItem']];

        Assert(elType === META_MAP['text'] || elType === META_MAP['katex'] || ignoredWhitelist.indexOf(elType) !== -1, `Unexpected elType in: ${el}`);
        if (elType === META_MAP['text']) {
            inline += elText.trim();
        } else if (elType === META_MAP['katex']) {
            // FIXME: Block? \[ \] otherwise inline \( \)
            inline += " \\(" + elText.trim() + "\\) ";
        }
    }

    return inline.trim();
};

// Take raw text -> split to text/katex
const SPLIT_TEXT_AND_KATEX = (text) => {
    let parts = [];
    let html = text;

    const delimiters = [
        [ '\\[', '\\]', false ], // block
        [ '\\(', '\\)', true ],  // inline
    ];

    do {
        let idxStart = null, delim;
        for (let i = 0; i < delimiters.length; ++i) {
            let idx = html.indexOf(delimiters[i][0]);
            if (idx >= 0 && (idxStart === null || idx < idxStart)) {
                idxStart = idx;
                delim = delimiters[i];
            }
        }

        if (!delim) break;

        let idxEnd = html.indexOf(delim[1]);
        if (idxStart === -1 || idxEnd <= idxStart) break;

        // add left (raw text)
        let start = html.substr(0, idxStart);
        if (start.trim() !== "") {
            parts.push({ type: "text", text: start });
        }

        // add katex
        let katexRaw = html.substr(idxStart + 2, (idxEnd - idxStart) - 2);
        parts.push({ type: "katex", text: katexRaw, inline: delim[2] });

        // update html to right-onward
        html = html.substr(idxEnd + 2);
    } while (true);

    if (html.trim() !== "") {
        parts.push({ type: "text", text: html });
    }

    return parts;
};


// Reverse pregenerated html -> inflated json
const PROBLEM_PARSE_BODY = (body, env) => {
    const { filepath, $ } = env;
    const html = $.parseHTML(body);

    const RECURSIVE_RUN_ON_NODES = (node, fn) => {
        fn(node);
        if (node.content) {
            for (let i = 0; i < node.content.length; ++i) {
                RECURSIVE_RUN_ON_NODES(node.content[i], fn);
            }
        }
    };

    const recursiveGetInputFromEl = (el) => {

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
                    text: processText(el.textContent)
                };
                json.content.push(contentChild);
            }
        } else if (el.nodeName === "#text") {
            // text fragment
            // FIXME: Some places exports aren't pre-rendered from KaTex (eg. http://brilliant.laravel:8000/brilliantexport/discussions/thread/12-13-15-17-111-113/12-13-15-17-111-113.html) -- have to search and separate those katex nodes out manually
            const rawText = processText(el.textContent);
            const textParts = SPLIT_TEXT_AND_KATEX(rawText);

            if (textParts.length <= 1) {
                json.type = "text";
                json.text = processText(el.textContent);
            } else {
                json.type = "paragraph";
                json.content = [];
                for (let i = 0; i < textParts.length; ++i) {

                    const textPart = textParts[i];
                    if (textPart.type === "text") {
                        json.content.push({
                            type: "text",
                            text: processText(textPart.text)
                        });
                    } else {
                        json.content.push({
                            type: "katex",
                            attrs: { inline: textPart.inline },
                            content: [{ type: "text", text: processText(textPart.text) }]
                        });
                    }
                }
            }

        } else if (el.nodeName === "SPAN") {

            let isInlineKatex = true;
            if (el.classList.length === 1 && el.classList[0] === "katex-display") {
                Assert(el.childNodes.length === 1, `katex-display has not 1 child: ${filepath}`);
                el = el.childNodes[0]; // katex
                isInlineKatex = false;
            }

            if (el.classList.length >= 1 && el.classList[0] === "katex") {
                const mathmlEl = el.childNodes[0];
                Assert(el.childNodes.length === 2, `katex has not 2 children: ${filepath}`);
                Assert(mathmlEl.classList[0] === "katex-mathml", `katex mathml unexpected: ${filepath}`);
                Assert(mathmlEl.childNodes.length === 1, `katex-mathml has unexpected children: ${filepath}`);
                Assert(mathmlEl.childNodes[0].childNodes.length === 1, `math has unexpected children: ${filepath}`);
                Assert(mathmlEl.childNodes[0].childNodes[0].childNodes.length === 2, `semantics has unexpected children: ${filepath}`);
                const annotationEl = mathmlEl.childNodes[0].childNodes[0].childNodes[1];
                Assert(annotationEl.nodeName === "annotation", `unexpected annotation: ${filepath}`);

                // NOTE: textContent &   innerHTML &amp;
                //Assert(annotationEl.innerHTML === annotationEl.textContent, `Unexpected <span> innerHTML != el.textContent: ${filepath}`);
                json.type = "katex";
                json.content = [{ type: "text", text: processText(annotationEl.textContent) }];
                json.attrs = { inline: isInlineKatex };
            } else if (el.classList.length >= 1 && el.classList[0] === "katex-error") {
                json.type = "katex";
                json.content = [{ type: "text", text: processText(el.textContent) }];
                json.attrs = { inline: isInlineKatex };
            } else if (el.classList.length >= 1 && el.classList[0] === "image-caption") {
                // FIXME: Other classes include "center"
                //const zoomableEl = el.childNodes[1];

                // #text .zoomable-image #text   \n \n
                // #text img #text span.caption
                //Assert((el.childNodes.length === 1) || (el.childNodes.length === 3) || (el.childNodes.length === 4), `image-caption has not 1/3/4 children: ${filepath}`); // #text .zoomable-image #text    \n \n

                if (el.childNodes.length === 1) {
                    const videoEl = el.childNodes[0];
                    Assert(videoEl.nodeName === "VIDEO", `Unexpected node for image-caption: ${filepath}`);
                    console.log("FIXME: Handle Video element");

                    json.type = "image";
                    json.attrs = { src: "" };
                } else {

                    let captionEl = null, imgEl = null;
                    for (let childNodeIdx = 0; childNodeIdx < el.childNodes.length; ++childNodeIdx) {
                        let childNodeEl = el.childNodes[childNodeIdx];
                        if (childNodeEl.nodeName === "#text") {
                            continue;
                        } else if (childNodeEl.nodeName === "SPAN") {

                            Assert(childNodeEl.classList.length === 1, `Unexpected classlist for .image-caption child: ${filepath}`);
                            if (childNodeEl.classList[0] === "zoomable-image") {
                                imgEl = $('img', $(childNodeEl))[0];
                            } else if (childNodeEl.classList[0] === "caption") {
                                captionEl = childNodeEl;
                            }
                        } else if (childNodeEl.nodeName === "IMG") {
                            imgEl = childNodeEl;
                        } else {
                            Assert(false, `Unexpected element in .image-caption: ${filepath}`);
                        }
                    }


                    Assert(imgEl.attributes['src'] || imgEl.attributes['alt'], `unexpected attribute on img: ${filepath}`);
                    Assert(CountElementsIn(['src', 'srcset', 'alt', 'title', 'style'], imgEl.attributes) === Object.keys(imgEl.attributes).length, `unexpected attributes on img: ${filepath}`);
                    const imgSrc = imgEl.attributes['src'].value;

                    json.type = "image";

                    let src;
                    if (imgSrc.indexOf('http') === 0) {
                        // outside src
                        src = imgSrc;
                    } else {
                        let srcMatch = imgSrc.match(/(https?(\:\/\/)?)?(\.\.\/)*([^?]*)/);
                        Assert(srcMatch.length === 5 && srcMatch[4].length, `Unexpected imgSrc '${imgSrc}': ${filepath}`);
                        src = '/brilliantexport/' + srcMatch[4];
                    }
                    json.attrs = { src: src };

                    if (captionEl) {
                        Assert(captionEl.nodeName === "SPAN" && captionEl.classList.length === 1 && captionEl.classList[0] === "caption", `Unexpected caption: ${filepath}`);
                        console.log("FIXME: Handle image caption");
                    }
                }
            } else if (el.classList.length === 1 && el.classList[0] === "reply-to") {
                Assert(el.childNodes.length === 3, `reply-to has not 3 children: ${filepath}`); // #text .reply-to #text    \n \n
                const replyEl = el.childNodes[1];

                // FIXME: <a href="00-is-indeterminate.html#comment-a3f5128804e92"> @Prasun Biswas</a>
                json.type = "mention";
                json.content = [{ type: "text", text: el.innerHTML }];
                json.attrs = [{ profile: "" }];
            } else if (el.classList.length >= 1 && el.classList[0] === "glossary") {
                console.log("FIXME: glossary");
                json.type = "paragraph";
                json.content = [{ type: "text", text: el.textContent }];
            } else {
                Assert(false, `ProcessBody - unexpected class for <span> '${el.classList[0]}' ${filepath}`);
            }
        } else if (el.nodeName === "A") {
            if (el.classList.length >= 1 && el.classList[0] === "at-mention") {
                Assert(el.attributes.length === 4 && el.attributes[3].name === 'href', `Unexpected <a> attributes format: ${filepath}`);
                json.type = "mention";
                json.content = [{ type: "text", text: processText(el.textContent) }];
                json.attrs = [{ profile: el.attributes[3].textContent }];
            } else if ((el.classList.length >= 1 && el.classList[0] === "wiki_link") || el.classList.length === 0) {
                let isWikiLink = (el.classList.length >= 1 && el.classList[0] === "wiki_link");
                console.log("FIXME: Handle wiki_link");
                //json.type = "text";
                //json.text = processText(el.textContent);
                //json.marks = [{ attrs: { href: "", target: "_blank" }, type: "link" }]; // FIXME: Link
                json.type = "a"
                json.content = [];
                const children = el.childNodes;
                if (children.length > 0) {
                    for (let i = 0; i < children.length; ++i) {
                        const contentChild = recursiveGetInputFromEl(children[i]);
                        json.content.push(contentChild);
                    }
                }

                let href = "";
                for (let i = 0; i < el.attributes.length; ++i) {
                    const attr = el.attributes[i];
                    if (attr.nodeName === "href") {
                        href = attr.value;
                        break;
                    }
                }

                // Apply marks recursively to children
                RECURSIVE_RUN_ON_NODES(json, (child) => {
                    if (child.type === "text") {
                        if (!child.marks) child.marks = [];
                        child.marks.push({ attrs: { href: href, target: "_blank" }, type: "link" });
                    }
                });

            } else {
                Assert(false, `ProcessBody - unexpected class for <a> '${el.classList[0]}' ${filepath}`);
            }
        } else if (["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8"].indexOf(el.nodeName) >= 0) {
            Assert(el.classList.length === 0, `Unexpected class in <h1>: ${filepath}`);
            json.type = "heading";
            const headingLevels = { "H1": 1, "H2": 2, "H3": 3, "H4": 4, "H5": 5, "H6": 6, "H7": 7, "H8": 8 };
            json.attrs = [{ level: headingLevels[el.nodeName] }];
            //json.content = [{ type: "text", text: processText(el.textContent) }];
            json.content = [];
            const children = el.childNodes;
            if (children.length > 0) {
                for (let i = 0; i < children.length; ++i) {
                    const contentChild = recursiveGetInputFromEl(children[i]);
                    json.content.push(contentChild);
                }
            }
        } else if (["EM", "STRONG", "CODE"].indexOf(el.nodeName) >= 0) {
            Assert(el.classList.length === 0, `Unexpected class in <${el.nodeName}>: ${filepath}`);
            json.type = el.nodeName.toLowerCase();
            json.content = [];
            const children = el.childNodes;
            if (children.length > 0) {
                for (let i = 0; i < children.length; ++i) {
                    const contentChild = recursiveGetInputFromEl(children[i]);
                    json.content.push(contentChild);
                }
            }

            // Apply marks recursively to children
            RECURSIVE_RUN_ON_NODES(json, (child) => {
                if (child.type === "text") {
                    if (!child.marks) child.marks = [];

                    if (json.type === "em") {
                        child.marks.push({ type: "italic" });
                    } else if (json.type === "strong") {
                        child.marks.push({ type: "bold" });
                    } else if (json.type === "code") {
                        child.marks.push({ type: "code" });
                    }
                }
            });
        } else if (el.nodeName === "PRE") {
            Assert(el.childNodes.length === 1, `pre has not 1 child: ${filepath}`);
            const codeEl = el.childNodes[0];
            Assert(codeEl.nodeName === "CODE", `Unexpected element ${codeEl.nodeName} in <pre>: ${filepath}`); // If this hits then just recursively handle children
            json.type = "codeBlock";
            json.content = [{ type: "text", text: processText(el.textContent) }];
            json.attrs = [{ text: codeEl.textContent, language: null }]; // FIXME: Get language?
        } else if (el.nodeName === "BLOCKQUOTE") {
            json.type = "blockquote";
            json.content = [];
            const children = el.childNodes;
            if (children.length > 0) {
                for (let i = 0; i < children.length; ++i) {
                    const contentChild = recursiveGetInputFromEl(children[i]);
                    json.content.push(contentChild);
                }
            }
        } else if (el.nodeName === "HR") {
            Assert(el.classList.length === 0, `Unexpected class in <hr>: ${filepath}`);
            json.type = "horizontalRule";
        } else if (el.nodeName === "BR") {
            Assert(el.classList.length === 0, `Unexpected class in <br>: ${filepath}`);
            json.type = "hardBreak";
        } else if (el.nodeName === "UL") {
            json.type = "bulletList";
            json.content = [];
            const children = el.childNodes;
            if (children.length > 0) {
                for (let i = 0; i < children.length; ++i) {
                    if (children[i].nodeName === "LI") { // skip #text
                        const contentChild = recursiveGetInputFromEl(children[i]);
                        json.content.push(contentChild);
                    }
                }
            }
        } else if (el.nodeName === "OL") {
            json.type = "orderedList";
            json.content = [];
            const children = el.childNodes;
            if (children.length > 0) {
                for (let i = 0; i < children.length; ++i) {
                    if (children[i].nodeName === "LI") { // skip #text
                        const contentChild = recursiveGetInputFromEl(children[i]);
                        json.content.push(contentChild);
                    }
                }
            }
        } else if (el.nodeName === "LI") {
            json.type = "listItem";
            json.content = [];
            const children = el.childNodes;
            if (children.length > 0) {
                for (let i = 0; i < children.length; ++i) {
                    const contentChild = recursiveGetInputFromEl(children[i]);
                    json.content.push(contentChild);
                }
            }
        } else if (el.nodeName === "DIV") {
            if (el.classList.length === 1 && el.classList[0] === "table-wrapper") {
                json.type = "paragraph";
                json.content = [];
                const children = el.childNodes;
                for (let i = 0; i < children.length; ++i) {
                    const contentChild = recursiveGetInputFromEl(children[i]);
                    json.content.push(contentChild);
                }
            } else if (el.classList.length === 1 && el.classList[0] === "codex-static-code") {
                const codeEl = $('code', el).eq(0)[0];
                Assert(codeEl.nodeName === "CODE", `Unexpected element ${codeEl.nodeName} in <pre>: ${filepath}`); // If this hits then just recursively handle children
                json.type = "codeBlock";
                json.content = [{ type: "text", text: processText(codeEl.textContent) }];
                json.attrs = [{ text: codeEl.textContent, language: null }]; // FIXME: Get language?
            } else if (el.classList.length >= 1 && el.classList[0] === "cmp_codex_page_id") {
                console.log("FIXME: Runnable code");

                const codeEl = $('textarea', el).eq(0)[0];
                json.type = "codeBlock";
                json.content = [{ type: "text", text: processText(codeEl.textContent) }];
                json.attrs = [{ text: codeEl.textContent, language: null }]; // FIXME: Get language?
            } else if (el.classList.length >= 1 && el.classList[0] === "viz-wrapper") {
                console.log("FIXME: snapsvg");
                json.type = "paragraph";
                json.content = [{type: "#text", text: "FIXME: IMPLEMENT SnapSVG"}];
            } else if (el.classList.length >= 1 && el.classList[0] === "glossary-container") {
                console.log("FIXME: glossary");
                json.type = "paragraph";
                json.content = [{type: "#text", text: "FIXME: IMPLEMENT Glossary"}];
            } else if (el.classList.length === 0 && el.style.display === "none") {
                console.log("FIXME: blank div, unnecessary to include");
                json.type = "paragraph";
                json.content = [{type: "#text", text: " "}];
            } else if (el.classList.length >= 1 && (el.classList[0] === "center" || el.classList[0] === "left" || el.classList[0] === "right")) {
                json.type = "paragraph";
                json.content = [];
                const children = el.childNodes;
                for (let i = 0; i < children.length; ++i) {
                    const contentChild = recursiveGetInputFromEl(children[i]);
                    json.content.push(contentChild);
                }
            } else if (el.classList.length >= 1 && el.classList[0] === "video-container") {
                console.log("FIXME: Handle Video element");

                json.type = "image";
                json.attrs = { src: "" };
            } else if (el.classList.length >= 1 && el.classList[0] === "show-hide-btn-container") {
                console.log("FIXME: Handle show/hide buttons");

                json.type = "paragraph";
                json.content = [{type: "#text", text: "FIXME: IMPLEMENT Show/Hide buttons"}];
            } else if (el.classList.length >= 1 && el.classList[0] === "problem-modal-container") {
                console.log("FIXME: Handle Problem modal container");

                json.type = "paragraph";
                json.content = [{type: "#text", text: "FIXME: IMPLEMENT Problem Modal Reference"}];
            }  else {
                console.log(el.classList[0]);
                Assert(false, `Unexpected class list for <div>: ${filepath}`);
            }
        } else if (el.nodeName === "TABLE") {
            json.type = "table";
            json.content = [];
            const children = el.childNodes;
            for (let i = 0; i < children.length; ++i) {
                if (children[i].nodeName === "TBODY") {
                    const bodyChildren = children[i].childNodes;
                    for (let j = 0; j < bodyChildren.length; ++j) {
                        const contentChild = recursiveGetInputFromEl(bodyChildren[j]);
                        json.content.push(contentChild);
                    }
                } else if (children[i].nodeName === "#text") { // ignore
                } else {
                    Assert(false, `Unexpected child for <table>: ${filepath}`);
                }
            }
        } else if (el.nodeName === "TR") {
            json.type = "tableRow";
            json.content = [];
            const children = el.childNodes;
            for (let i = 0; i < children.length; ++i) {
                const contentChild = recursiveGetInputFromEl(children[i]);
                json.content.push(contentChild);
            }
        } else if (el.nodeName === "TD") {
            json.type = "tableCell";
            json.content = [];
            const children = el.childNodes;
            for (let i = 0; i < children.length; ++i) {
                const contentChild = recursiveGetInputFromEl(children[i]);
                json.content.push(contentChild);
            }
        } else if (el.nodeName === 'IMG') {
            // NOTE: Discussions -- "zoomable" is attached at runtime
            const imgEl = el;
            Assert(imgEl.attributes['src'] || imgEl.attributes['alt'], `unexpected attribute on img: ${filepath}`);
            Assert(CountElementsIn(['src', 'srcset', 'alt', 'title', 'style'], imgEl.attributes) === Object.keys(imgEl.attributes).length, `unexpected attributes on img [${Object.keys(imgEl.attributes)}]: ${filepath}`);
            const imgSrc = imgEl.attributes['src'].value;

            json.type = "image";

            let src;
            if (imgSrc.indexOf('http') === 0) {
                // outside src
                src = imgSrc;
            } else {
                let srcMatch = imgSrc.match(/(https?(\:\/\/)?)?(\.\.\/)*([^?]*)/);
                Assert(srcMatch.length === 5 && srcMatch[4].length, `Unexpected imgSrc '${imgSrc}': ${filepath}`);
                src = '/brilliantexport/' + srcMatch[4];
            }
            json.attrs = { src: src };
        } else if (el.nodeName === '#comment') {
            // <!-- comment -->
            // FIXME: No need for actual element here
            json.type = "#text";
            json.text = " ";
        } else if (el.nodeName === 'IFRAME') {
            console.log("FIXME: Handle iframe video");
            json.type = "#text";
            json.text = "FIXME: Handle iframe video";
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





const _exports = { META_MAP, META_MAP_REVERSE, JSON_BODY_TO_HTML, BODY_HTML_TO_INLINE, PROBLEM_PARSE_BODY };

if (typeof global !== "undefined") {
    for (const key in _exports) {
        global[key] = _exports[key];
    }
} else {
    // FIXME: This is goofy and shouldn't be needed
    window['META_MAP'] = META_MAP;
    window['META_MAP_REVERSE'] = META_MAP_REVERSE;
    window['JSON_BODY_TO_HTML'] = JSON_BODY_TO_HTML;
    window['BODY_HTML_TO_INLINE'] = BODY_HTML_TO_INLINE;
    window['PROBLEM_PARSE_BODY'] = PROBLEM_PARSE_BODY;
}


export default _exports;
