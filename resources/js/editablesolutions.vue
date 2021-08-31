<template>
<div class="prblm-edit-solutions">

    <p>
    <label class="edit-solution">
        <input class="with-gap edit-solution-radio" name="group1" type="radio" id="solution1" v-model="picked" />
        <input class="edit-solution-input" type="text" name="solution1" placeholder="Solution Option" />
    </label>
    </p>
    <p>
    <label class="edit-solution">
        <input class="with-gap edit-solution-radio" name="group1" type="radio" id="solution2" v-model="picked" />
        <input class="edit-solution-input" type="text" name="solution2" placeholder="Solution Option" />
    </label>
    </p>
    <p>
    <label class="edit-solution">
        <input class="with-gap edit-solution-radio" name="group1" type="radio" id="solution3" v-model="picked" />
        <input class="edit-solution-input" type="text" name="solution3" placeholder="Solution Option" />
    </label>
    </p>
    <p>
    <label class="edit-solution">
        <input class="with-gap edit-solution-radio" name="group1" type="radio" id="solution4" v-model="picked" />
        <input class="edit-solution-input" type="text" name="solution4" placeholder="Solution Option" />
    </label>
    </p>

</div>
</template>

<script>
export default {
    name: 'EditableSolutions',
    template: 'EditableSolutions',
    props: {
    },
    data() {
        return {
            solutions: ["", "", "", ""],
            solutionIndex: 0,
            picked: ''
        }
    },
    methods: {
    },
    computed: {

    },
};
</script>

<style>
</style>
