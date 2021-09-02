
// Encoding for attribute
// Multi-char encodings prefixed w/ capital and ONLY the last element is lowercase
const META_MAP = {

    // nodes -- 2 char
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
    'link': 'l'
};

const META_MAP_REVERSE = {};
for (const key in META_MAP) {
    const val = META_MAP[key];
    if (META_MAP_REVERSE[val]) {
        throw "Duplicated key in META_MAP";
    }

    META_MAP_REVERSE[val] = key;
}

const _exports = { META_MAP, META_MAP_REVERSE };

if (typeof global !== "undefined") {
    for (const key in _exports) {
        global[key] = _exports[key];
    }
} else {
    // FIXME: This is goofy and shouldn't be needed
    window['META_MAP'] = META_MAP;
    window['META_MAP_REVERSE'] = META_MAP_REVERSE;
}

export default _exports;
