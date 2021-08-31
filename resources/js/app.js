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



const Vue = require('vue');
//const Dropdown = require('./dropdown.vue');
import Dropdown from './dropdown.vue';
import EditableSolutions from './editablesolutions.vue';
import TipTapForm from './tiptapform.vue';
import { generateHTML, generateJSON } from '@tiptap/html'; 

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italics from '@tiptap/extension-italic'
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

    ExtKatex,
    ExtMention,
];
window['GenerateHTML'] = generateHTML;
window['GenerateJSON'] = generateJSON;
window['Katex'] = Katex;

// FIXME: export default from app.js so we can  import { Dropdown } from '/js/app.js'  instead of window export
