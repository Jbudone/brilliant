
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
    ],

    ProblemLevels: [
        { name: 'Level 1', id: 1 },
        { name: 'Level 2', id: 2 },
        { name: 'Level 3', id: 3 },
        { name: 'Level 4', id: 4 },
        { name: 'Level 5', id: 5 },
    ],
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
