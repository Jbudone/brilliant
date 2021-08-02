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

window['Vue'] = Vue;
window['VueComponents'] = {
    Dropdown,
    EditableSolutions,
    TipTapForm
};

// FIXME: export default from app.js so we can  import { Dropdown } from '/js/app.js'  instead of window export
