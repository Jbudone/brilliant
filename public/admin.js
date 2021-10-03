const { Dropdown, EditableSolutions, TipTapForm } = VueComponents;

$(document).ready(() => {

    const AdminApp = Vue.createApp({
        components: {
            Dropdown
        },

        data: function() {
            return {
                unhandledReports: [],
                handledReports: [],
                handledNonReports: []
            }
        },

        methods: {

        },

        computed: {
        },

        beforeMount: function() {

            let allReports = {};
            for (let i = 0; i < HiddenProblemsJson.length; ++i) {
                const id = HiddenProblemsJson[i].id + ".0";
                allReports[id] = {
                    problem_id: HiddenProblemsJson[i].id,
                    title: HiddenProblemsJson[i].title,
                };
            }

            for (let i = 0; i < HiddenCommentsJson.length; ++i) {
                const id = HiddenCommentsJson[i].problem_id + "." + HiddenCommentsJson[i].id;
                allReports[id] = {
                    problem_id: HiddenCommentsJson[i].problem_id,
                    title: "Comment",
                }
            }

            for (let i = 0; i < ReportsJson.length; ++i) {
                const id = ReportsJson[i].problem_id + "." + (ReportsJson[i].comment_id ? ReportsJson[i].comment_id : "0");
                if (allReports[id]) {
                    allReports[id].report = ReportsJson[i];
                } else {
                    ReportsJson[i].title = "[[ missing title: " + (ReportsJson[i].comment_id ? "comment" : "problem") + " ]]";
                    this.unhandledReports.push(ReportsJson[i]);
                }
            }

            for (let id in allReports) {
                const report = allReports[id];
                if (report.report) {
                    this.handledReports.push(report);
                } else {
                    this.handledNonReports.push(report);
                }
            }
        },
        mounted() {
        },
        beforeUnmount() {
        },
    });

    const mountedProblem = AdminApp.mount('#app');


    // FIXME: Use Vuex or something to avoid this
    window['mountedProblem'] = mountedProblem;
});

