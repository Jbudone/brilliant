const { Dropdown } = VueComponents;

$(document).ready(() => {

    const ProfileApp = Vue.createApp({
        components: {
            Dropdown
        },
        data: function() {
            return {
                globals: window.globals,
                ProblemsJson: ProblemsJson
            };
        },
        methods: {
        },
        computed: {
        },

        beforeMount: function() {
            //if (ProblemsJson) {
            //    for (let i = 0; i < ProblemsJson.length; ++i) {

            //    }
            //}
        },
        mounted() {
        },
        beforeUnmount() {
        },
    });

    const mountedProblem = ProfileApp.mount('#app');


    // FIXME: Use Vuex or something to avoid this
    window['mountedProblem'] = mountedProblem;
});

