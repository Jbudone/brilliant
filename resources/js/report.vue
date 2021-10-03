<template>
    <a ref="report" href="#" v-bind:class="[{ 'text-red-600': this.reported }]" @click.prevent="report()">{{ this.reported ? "⚑" : "⚑" }}</a>
</template>

<script>
export default {
    name: 'Report',
    template: 'Report',
    components: { },
    emits: [ 'report', 'unreport' ],
    props: {
        inline: {
            type: Boolean,
            required: false,
            default: false,
        },
        initialreport: {
            type: Boolean,
            required: false,
            default: false
        },
        id: {
            type: Number,
            required: false,
            default: 0
        },
    },
    data() {
        return {
            reported: this.initialreport,
        }
    },
    methods: {
        report(upvote) {

            this.reported = !this.reported;

            if (this.reported) {
                this.$emit('report', this.id);
            } else {
                this.$emit('unreport', this.id);
            }
        }
    },
    mounted() {

    },
    computed: {

    },

    beforeUnmount() {

    },
};
</script>

<style>
</style>
