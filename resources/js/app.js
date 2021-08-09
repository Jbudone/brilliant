require('./bootstrap');

require('alpinejs');

//import Vue from 'vue';
//import Dropdown from './dropdown.vue';
//
//new Vue({
//    el: 'Dropdown',
//    components: { Dropdown }
//});

//import katex from 'https://cdn.jsdelivr.net/npm/katex@0.13.13/dist/katex.mjs';
//const Katex = require('https://cdn.jsdelivr.net/npm/katex@0.13.13/dist/katex.js');
const Katex = require('katex');



const Vue = require('vue');
//const Dropdown = require('./dropdown.vue');
import Dropdown from './dropdown.vue';
import EditableSolutions from './editablesolutions.vue';
import TipTapForm from './tiptapform.vue';
import { generateHTML } from '@tiptap/html'; 

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italics from '@tiptap/extension-italic'
import HardBreak from '@tiptap/extension-hard-break'

import { Katex as ExtKatex } from './tiptap-katex.js'
import { Mention as ExtMention } from './tiptap-mention.js'

window['Vue'] = Vue;
window['VueComponents'] = {
    Dropdown,
    EditableSolutions,
    TipTapForm,

};
window['VueHTMLExtensions'] = [
    Document,
    Paragraph,
    Text,
    Bold,
    Italics,
    HardBreak,

    ExtKatex,
    ExtMention
];
window['GenerateHTML'] = generateHTML;
window['Katex'] = Katex;

// FIXME: export default from app.js so we can  import { Dropdown } from '/js/app.js'  instead of window export
