<template>
    <div class="h-6 w-12" v-bind:class="[{ 'inline': this.inline, 'grid grid-cols-3': !this.inline }]">
        <a ref="upvote" href="#" class="text-xl h-4" v-bind:class="[{ 'text-green-600': this.vote === 1 }]" @click.prevent="doVote(true)"><span class="inline-block transform -rotate-90">➜</span></a>
        <span class="text-center h-4 pt-1" ref="votes">{{ this.points }}</span>
        <a ref="downvote" href="#" class="text-xl h-4" v-bind:class="[{ 'text-red-600': this.vote === 2 }]" @click.prevent="doVote(false)"><span class="inline-block transform rotate-90">➜</span></a>
    </div>
</template>

<script>
export default {
    name: 'Vote',
    template: 'Vote',
    components: { },
    emits: [ 'vote' ],
    props: {
        name: {
            type: String,
        },
        inline: {
            type: Boolean,
            required: false,
            default: false,
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false,
        },
        initialvote: {
            type: Number,
            required: false,
            default: 0
        },
        initialpoints: {
            type: Number,
            required: false,
            default: 0
        },

        id: {
            type: Number,
            required: false,
            default: 0
        },
    },
    data() {
        return {
            vote:   this.initialvote,
            points: this.initialpoints,
        }
    },
    methods: {
        doVote(upvote) {

            const prev = this.vote;
            let next;
            if (prev === 1 && upvote) {
                // Undo upvote
                next = 0;
                --this.points;
            } else if (prev === 1 && !upvote) {
                // Swap upvote -> downvote
                next = 2;
                this.points -= 2;
            } else if (prev === 2 && upvote) {
                // Swap downvote -> upvote
                next = 1;
                this.points += 2;
            } else if (prev === 2 && !upvote) {
                // Undo downvote
                next = 0;
                ++this.points;
            } else if (upvote) {
                // Upvote
                next = 1;
                ++this.points;
            } else if (!upvote) {
                // Downvote
                next = 2;
                --this.points;
            }

            this.$emit('vote', prev, next, this.id);
            this.vote = next;
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
