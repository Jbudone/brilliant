require('./bootstrap');

require('alpinejs');

//import Vue from 'vue';
//import Dropdown from './dropdown.vue';
//
//new Vue({
//    el: 'Dropdown',
//    components: { Dropdown }
//});

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
import Italics from '@tiptap/extension-bold'
import HardBreak from '@tiptap/extension-hard-break'

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
    HardBreak
];
window['GenerateHTML'] = generateHTML;

// FIXME: export default from app.js so we can  import { Dropdown } from '/js/app.js'  instead of window export
