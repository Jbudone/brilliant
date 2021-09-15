<template>
  <node-view-wrapper class="vue-component">
    <span class="label" contenteditable="false">KaTex</span>
    <node-view-content class="content" />
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '@tiptap/vue-3'
export default {
  components: {
    NodeViewWrapper, NodeViewContent
  },
  props: nodeViewProps,
  methods: {
    increase() {
      this.updateAttributes({
        count: this.node.attrs.count + 1,
      })
    },
  },
}
</script>

<style lang="scss">
.vue-component {
  display:inline-block;
  margin: 1rem 0;
  position: relative;

  height:24px;
}

.vue-component:target {
  background: #FAF594;
  border: 3px solid #0D0D0D;
  border-radius: 0.5rem;
}


.label {
    display:none;
    background-color: #0D0D0D;
    font-size: 0.6rem;
    letter-spacing: 1px;
    font-weight: bold;
    text-transform: uppercase;
    color: #fff;
    position: absolute;
    top: -24px;
    padding: 0.25rem 0.75rem;
    border-radius: 0;
    height: 24px;
    left: 0px;
}

.vue-component:active .label {
display:block;
}

.content {
  min-width:100px;
  /*margin-top: 1.5rem;*/
  /*padding: 1rem;*/
}
</style>
