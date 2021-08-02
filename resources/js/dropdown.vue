<template>
  <div class="dropdown" v-if="options">

    <input class="dropdown-input"
    autocomplete="off"
      :name="name"
      @focus="showOptions()"
      @blur="exit()"
      @keyup="keyMonitor"
      :disabled="disabled"
      :placeholder="placeholder"
      :value="value" />

    <div class="dropdown-list" v-show="optionsShown">
      <div
        class="dropdown-item"
        @mousedown="selectOption(option)"
        v-for="(option, index) in options"
        :key="index">
          {{ option.name || option.id || '-' }}
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Dropdown',
    template: 'Dropdown',
    props: {
      name: {
        type: String,
        required: false,
        default: 'dropdown',
        note: 'Input name'
      },
      options: {
        type: Array,
        required: true,
        default: [],
        note: 'Options of dropdown. An array of options with id and name',
      },
      placeholder: {
        type: String,
        required: false,
        default: 'Please select an option',
        note: 'Placeholder of dropdown'
      },
      disabled: {
        type: Boolean,
        required: false,
        default: false,
        note: 'Disable the dropdown'
      },
      initial: {
        type: String,
        required: false,
        default: '',
        note: 'Initial value'
      }
    },
    data() {
      return {
        selected: {},
        optionsShown: false,
        value: ""
     }
    },
    created() {
      this.$emit('selected', this.selected);

      if (this.initial) {
        for (let i = 0; i < this.options.length; ++i) {
            if (this.options[i].id == this.initial) {
                this.value = this.options[i].name;
                this.selected = this.options[i];
                break;
            }
        }
      }
    },
    computed: {
    },
    methods: {
      selectOption(option) {
        this.selected = option;
        this.optionsShown = false;
        this.$emit('selected', this.selected);

        this.value = option.name;
      },
      showOptions(){
        if (!this.disabled) {
          this.optionsShown = true;
        }
      },
      exit() {
        if (!this.selected.id) {
          this.selected = {};
        }
        this.$emit('selected', this.selected);
        this.optionsShown = false;
      },
      // Selecting when pressing Enter
      keyMonitor: function(event) {
        if (event.key === "Enter" && this.filteredOptions[0])
          this.selectOption(this.filteredOptions[0]);
      }
    },
    watch: {
    }
  };
</script>


<style lang="scss" scoped>
  .dropdown {
    position: relative;
    display: block;
    border: none;
    .dropdown-input {
      background: #fff;
      cursor: pointer;
      border: 1px solid #e7ecf5;
      border-radius: 3px;
      color: #333;
      display: block;
      font-size: .8em;
      padding: 0px 2px;
      height: 20px;
      padding: 0px 4px;
      width: 150px;
      &:hover {
        background: #f8f8fa;
      }
    }
    .dropdown-list {
      position: absolute;
      background-color: #fff;
      min-width: 248px;
      max-width: 248px;
      max-height: 248px;
      border: 1px solid #e7ecf5;
      box-shadow: 0px -8px 34px 0px rgba(0,0,0,0.05);
      overflow: auto;
      z-index: 1;
      .dropdown-item {
        color: black;
        font-size: .7em;
        line-height: 1em;
        padding: 8px;
        text-decoration: none;
        display: block;
        cursor: pointer;
        &:hover {
          background-color: #e7ecf5;
        }
      }
    }
    .dropdown:hover .dropdown-list {
      display: block;
    }
  }
</style>
