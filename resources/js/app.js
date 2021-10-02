require('./bootstrap');

require('alpinejs');

//import Vue from 'vue';
//import Dropdown from './dropdown.vue';
//
//new Vue({
//    el: 'Dropdown',
//    components: { Dropdown }
//});

const Katex = require('katex');

const axios = require('axios').default;



const Vue = require('vue');
//const Dropdown = require('./dropdown.vue');

import TipTapKatex from './tiptap-katex.vue';
window['KatexView'] = TipTapKatex;


import { VueNodeViewRenderer } from '@tiptap/vue-3'
window['VueNodeViewRenderer'] = VueNodeViewRenderer;

import Vote from './vote.vue';
import Dropdown from './dropdown.vue';
import EditableSolutions from './editablesolutions.vue';
import TipTapForm from './tiptapform.vue';
import { generateHTML, generateJSON } from '@tiptap/html'; 

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italics from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import HardBreak from '@tiptap/extension-hard-break'
import Blockquote from '@tiptap/extension-blockquote'
import Image from '@tiptap/extension-image'
import Heading from '@tiptap/extension-heading'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Link from '@tiptap/extension-link'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Code from '@tiptap/extension-code'

import StarterKit from '@tiptap/starter-kit'

import { Katex as ExtKatex } from './tiptap-katex.js'
import { Mention as ExtMention } from './tiptap-mention.js'


// load all highlight.js languages
import lowlight from 'lowlight'

// load specific languages only
// import lowlight from 'lowlight/lib/core'
// import javascript from 'highlight.js/lib/languages/javascript'
// lowlight.registerLanguage('javascript', javascript)



window['Vue'] = Vue;
window['VueComponents'] = {
    Dropdown,
    EditableSolutions,
    TipTapForm,
    Vote
};
window['VueHTMLExtensions'] = [
    Document,
    Paragraph,
    Text,
    Bold,
    Italics,
    Underline,
    HardBreak,
    Blockquote,
    Image,
    Heading,
    CodeBlockLowlight,
    HorizontalRule,
    Link,
    BulletList,
    OrderedList,
    ListItem,
    Table, TableRow, TableCell, TableHeader,
    Code,

    ExtKatex,
    ExtMention,
];
window['TipTapExtensions'] = [
    StarterKit,
    Document,
    Paragraph,
    Text,
    Bold,
    Italics,
    Underline,
    HardBreak,
    Blockquote,
    Image,
    Heading,
    CodeBlockLowlight.configure({
      lowlight,
    }),
    HorizontalRule,
    Link,
    BulletList,
    OrderedList,
    ListItem,
    Table, TableRow, TableCell, TableHeader,
    Code,

    ExtKatex,
    ExtMention,
];
window['GenerateHTML'] = generateHTML;
window['GenerateJSON'] = generateJSON;
window['Katex'] = Katex;
window['axios'] = axios;

// FIXME: export default from app.js so we can  import { Dropdown } from '/js/app.js'  instead of window export
