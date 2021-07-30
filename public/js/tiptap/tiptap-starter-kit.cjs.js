'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Dropcursor = require('@tiptap/extension-dropcursor');
var Gapcursor = require('@tiptap/extension-gapcursor');
var Document = require('@tiptap/extension-document');
var Paragraph = require('@tiptap/extension-paragraph');
var Text = require('@tiptap/extension-text');
var History = require('@tiptap/extension-history');
var Bold = require('@tiptap/extension-bold');
var Italic = require('@tiptap/extension-italic');
var Code = require('@tiptap/extension-code');
var CodeBlock = require('@tiptap/extension-code-block');
var Heading = require('@tiptap/extension-heading');
var HardBreak = require('@tiptap/extension-hard-break');
var Strike = require('@tiptap/extension-strike');
var Blockquote = require('@tiptap/extension-blockquote');
var HorizontalRule = require('@tiptap/extension-horizontal-rule');
var BulletList = require('@tiptap/extension-bullet-list');
var OrderedList = require('@tiptap/extension-ordered-list');
var ListItem = require('@tiptap/extension-list-item');
var core = require('@tiptap/core');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Dropcursor__default = /*#__PURE__*/_interopDefaultLegacy(Dropcursor);
var Gapcursor__default = /*#__PURE__*/_interopDefaultLegacy(Gapcursor);
var Document__default = /*#__PURE__*/_interopDefaultLegacy(Document);
var Paragraph__default = /*#__PURE__*/_interopDefaultLegacy(Paragraph);
var Text__default = /*#__PURE__*/_interopDefaultLegacy(Text);
var History__default = /*#__PURE__*/_interopDefaultLegacy(History);
var Bold__default = /*#__PURE__*/_interopDefaultLegacy(Bold);
var Italic__default = /*#__PURE__*/_interopDefaultLegacy(Italic);
var Code__default = /*#__PURE__*/_interopDefaultLegacy(Code);
var CodeBlock__default = /*#__PURE__*/_interopDefaultLegacy(CodeBlock);
var Heading__default = /*#__PURE__*/_interopDefaultLegacy(Heading);
var HardBreak__default = /*#__PURE__*/_interopDefaultLegacy(HardBreak);
var Strike__default = /*#__PURE__*/_interopDefaultLegacy(Strike);
var Blockquote__default = /*#__PURE__*/_interopDefaultLegacy(Blockquote);
var HorizontalRule__default = /*#__PURE__*/_interopDefaultLegacy(HorizontalRule);
var BulletList__default = /*#__PURE__*/_interopDefaultLegacy(BulletList);
var OrderedList__default = /*#__PURE__*/_interopDefaultLegacy(OrderedList);
var ListItem__default = /*#__PURE__*/_interopDefaultLegacy(ListItem);

const StarterKit = core.Extension.create({
    name: 'starterKit',
    addExtensions() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const extensions = [];
        if (this.options.blockquote !== false) {
            extensions.push(Blockquote__default['default'].configure((_a = this.options) === null || _a === void 0 ? void 0 : _a.blockquote));
        }
        if (this.options.bold !== false) {
            extensions.push(Bold__default['default'].configure((_b = this.options) === null || _b === void 0 ? void 0 : _b.bold));
        }
        if (this.options.bulletList !== false) {
            extensions.push(BulletList__default['default'].configure((_c = this.options) === null || _c === void 0 ? void 0 : _c.bulletList));
        }
        if (this.options.code !== false) {
            extensions.push(Code__default['default'].configure((_d = this.options) === null || _d === void 0 ? void 0 : _d.code));
        }
        if (this.options.codeBlock !== false) {
            extensions.push(CodeBlock__default['default'].configure((_e = this.options) === null || _e === void 0 ? void 0 : _e.codeBlock));
        }
        if (this.options.document !== false) {
            extensions.push(Document__default['default'].configure((_f = this.options) === null || _f === void 0 ? void 0 : _f.document));
        }
        if (this.options.dropcursor !== false) {
            extensions.push(Dropcursor__default['default'].configure((_g = this.options) === null || _g === void 0 ? void 0 : _g.dropcursor));
        }
        if (this.options.gapcursor !== false) {
            extensions.push(Gapcursor__default['default'].configure((_h = this.options) === null || _h === void 0 ? void 0 : _h.gapcursor));
        }
        if (this.options.hardBreak !== false) {
            extensions.push(HardBreak__default['default'].configure((_j = this.options) === null || _j === void 0 ? void 0 : _j.hardBreak));
        }
        if (this.options.heading !== false) {
            extensions.push(Heading__default['default'].configure((_k = this.options) === null || _k === void 0 ? void 0 : _k.heading));
        }
        if (this.options.history !== false) {
            extensions.push(History__default['default'].configure((_l = this.options) === null || _l === void 0 ? void 0 : _l.history));
        }
        if (this.options.horizontalRule !== false) {
            extensions.push(HorizontalRule__default['default'].configure((_m = this.options) === null || _m === void 0 ? void 0 : _m.horizontalRule));
        }
        if (this.options.italic !== false) {
            extensions.push(Italic__default['default'].configure((_o = this.options) === null || _o === void 0 ? void 0 : _o.italic));
        }
        if (this.options.listItem !== false) {
            extensions.push(ListItem__default['default'].configure((_p = this.options) === null || _p === void 0 ? void 0 : _p.listItem));
        }
        if (this.options.orderedList !== false) {
            extensions.push(OrderedList__default['default'].configure((_q = this.options) === null || _q === void 0 ? void 0 : _q.orderedList));
        }
        if (this.options.paragraph !== false) {
            extensions.push(Paragraph__default['default'].configure((_r = this.options) === null || _r === void 0 ? void 0 : _r.paragraph));
        }
        if (this.options.strike !== false) {
            extensions.push(Strike__default['default'].configure((_s = this.options) === null || _s === void 0 ? void 0 : _s.strike));
        }
        if (this.options.text !== false) {
            extensions.push(Text__default['default'].configure((_t = this.options) === null || _t === void 0 ? void 0 : _t.text));
        }
        return extensions;
    },
});

function defaultExtensions(options) {
    console.warn('[tiptap warn]: defaultExtensions() is deprecated. please use the default export "StarterKit". "StarterKit" is a regular extension that contains all other extensions.');
    return [
        Document__default['default'],
        Paragraph__default['default'].configure(options === null || options === void 0 ? void 0 : options.paragraph),
        Text__default['default'],
        Bold__default['default'].configure(options === null || options === void 0 ? void 0 : options.bold),
        Italic__default['default'].configure(options === null || options === void 0 ? void 0 : options.italic),
        Code__default['default'].configure(options === null || options === void 0 ? void 0 : options.code),
        Strike__default['default'].configure(options === null || options === void 0 ? void 0 : options.strike),
        HardBreak__default['default'].configure(options === null || options === void 0 ? void 0 : options.hardBreak),
        Heading__default['default'].configure(options === null || options === void 0 ? void 0 : options.heading),
        Blockquote__default['default'].configure(options === null || options === void 0 ? void 0 : options.blockquote),
        BulletList__default['default'].configure(options === null || options === void 0 ? void 0 : options.bulletList),
        OrderedList__default['default'].configure(options === null || options === void 0 ? void 0 : options.orderedList),
        ListItem__default['default'].configure(options === null || options === void 0 ? void 0 : options.listItem),
        HorizontalRule__default['default'].configure(options === null || options === void 0 ? void 0 : options.horizontalRule),
        CodeBlock__default['default'].configure(options === null || options === void 0 ? void 0 : options.codeBlock),
        History__default['default'].configure(options === null || options === void 0 ? void 0 : options.history),
        Dropcursor__default['default'].configure(options === null || options === void 0 ? void 0 : options.dropcursor),
        Gapcursor__default['default'],
    ];
}

exports.default = StarterKit;
exports.defaultExtensions = defaultExtensions;
//# sourceMappingURL=tiptap-starter-kit.cjs.js.map
