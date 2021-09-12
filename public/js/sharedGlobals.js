
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

const JSON_BODY_TO_HTML = (json) => {

    if (json.type === "doc" || json.type === "listItem" || json.type === "tableCell") {
        // top level
        let contents = [];
        let immediateChildren = 0;
        const contentLen = json.content ? json.content.length : 0;
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

        // FIXME: Merge terms (texts, nuke '\n' #text's, etc.)

        return { child: contents, elements: immediateChildren };
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
                } else if (mark.type === "underline") {
                    meta += META_MAP['underline'];
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
    } else if (["em", "strong", "a"].indexOf(json.type) >= 0) {

        // Leave out em/strong/a tag since those are set in Marks on text elements
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
    } else if (["paragraph","bulletList", "orderedList", "blockquote", "heading", "codeBlock", "table", "tableRow", "em", "strong", "a"].indexOf(json.type) >= 0) {
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

const BODY_HTML_TO_INLINE = (list) => {

    let inline = "";
    for (let i = 0; i < list.length; ++i) {
        const el = list[i];
        const elType = el.substr(0, 2), // Intentionally ignore marks
            elText = el.substr(el.indexOf(':') + 1);

        Assert(elType === META_MAP['text'] || elType === META_MAP['katex'], `Unexpected elType in: ${el}`);
        if (elType === META_MAP['text']) {
            inline += elText.trim();
        } else if (elType === META_MAP['katex']) {
            inline += " {{" + elText.trim() + "}} ";
        }
    }

    return inline.trim();
};


// Reverse generated html -> markdown/latex
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
            json.type = "text";
            json.text = processText(el.textContent);
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


                    Assert(imgEl.attributes['src'] && imgEl.attributes['alt'], `unexpected attribute on img: ${filepath}`);
                    Assert(CountElementsIn(['src', 'srcset', 'alt', 'title', 'style'], imgEl.attributes) === Object.keys(imgEl.attributes).length, `unexpected attributes on img: ${filepath}`);
                    const imgSrc = imgEl.attributes['src'].value;

                    json.type = "image";

                    let src = imgSrc;
                    if (imgSrc.substr(0, 3) != "htt") {
                        src = '/brilliantexport/' + imgSrc.substr(6); // ../../
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
                debugger;
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
        } else if (["EM", "STRONG"].indexOf(el.nodeName) >= 0) {
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
        } else if (el.nodeName === "CODE") {
            // inline code block
            Assert(el.classList.length === 0, `Unexpected class list for <code>: ${filepath}`);
            json.type = "codeBlock";
            json.content = [{ type: "text", text: processText(el.textContent) }];
            json.attrs = [{ text: el.textContent, language: null }];
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
