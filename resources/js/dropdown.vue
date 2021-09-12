<template>
  <div class="dropdown" v-if="options" :class="class">

    <input class="dropdown-input" :class="[classInput, optionsShown ? 'opacity-10' : '']"
      style="caret-color: transparent; outline: none;"
      readonly
      autocomplete="off"
      :name="name"
      @focus="showOptions()"
      @blur="exit()"
      @keyup="keyMonitor"
      :disabled="disabled"
      :placeholder="placeholder"
      :value="value" />

    <div class="dropdown-icon absolute top-0 right-4" v-if="showIcon">
        <i class="fas" :class="optionsShown ? 'fa-caret-down' : 'fa-caret-up'"></i>
    </div>

    <div class="dropdown-list" :class="classList" v-show="optionsShown">
        <template v-for="(option, index) in options">

            <div
                v-if="option.style"
                class="dropdown-item" :class="classOption"
                @mousedown="selectOption(option)"
                v-html="option.style">
            </div>
            <div
                v-else
                class="dropdown-item" :class="classOption"
                @mousedown="selectOption(option)">
                {{ option.name || option.id || '-' }}
            </div>

        </template>
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
                type: Number,
                required: false,
                default: 0,
                note: 'Initial id'
            },
            showIcon: {
                type: Boolean,
                required: false,
                default: true
            },

            class: {
                type: String,
                required: false,
                default: "w-36 h-5 -mx-2"
            },
            classInput: {
                type: String,
                required: false,
                default: "w-36 h-5 text-xs"
            },
            classList: {
                type: String,
                required: false,
                default: "z-50"
            },
            classOption: {
                type: String,
                required: false,
                default: ""
            },
        },
        data() {
            return {
                selected: {},
                optionsShown: false,
                value: "",
            }
        },
        created() {
            //this.$emit('selected', this.selected);

            if (this.initial) {
                for (let i = 0; i < this.options.length; ++i) {
                    if (this.options[i].id == this.initial) {
                        this.value = this.options[i].name;
                        this.selected = this.options[i];
                        this.$emit('selected', this.selected);
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
                console.log('emitted selected');

                this.value = option.name;
            },
            showOptions(){
                if (!this.disabled && !this.optionsShown) {
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
            },
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
      color: #333;
      display: block;
      padding: 0px 4px;
      &:hover {
        background: #f8f8fa;
      }
    }
    .dropdown-list {
      position: absolute;
      background-color: #fff;
      min-width: 148px;
      max-width: 148px;
      max-height: 248px;
      /*border: 1px solid #e7ecf5;*/
      /*box-shadow: 0px -8px 34px 0px rgba(0,0,0,0.05);*/
border: 1px solid transparent;
box-shadow: rgb(0 0 0 / 20%) 0 2px 8px;
      overflow: auto;
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
