<x-app-layout>

    @push('scripts')
        @if(Route::is('addproblem'))
        <script>window['addedit'] = 'add';</script>
        <script type="module" src="{{ asset('addproblem.js') }}"></script>
        @else
        <script>window['addedit'] = 'edit';</script>
        <script type="module" src="{{ asset('addproblem.js') }}"></script>
        <script>
            var ProblemJson = @json($problem, JSON_PRETTY_PRINT);
            var UserJson = @json($user, JSON_PRETTY_PRINT);
            var PrevEdit = {
                title: "{{ old('title') }}",
                category_id: "{{ old('category_id') }}",
                level: "{{ old('level') }}",
                body: "{{ old('body') }}",
            };
        </script>
        @endif
    @endpush

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            @if(Route::is('addproblem'))
            {{ __('Add Problem') }}
            @else
            {{ __('Edit Problem') }}
            @endif
        </h2>
    </x-slot>


    <!-- Content -->
    <div class="sm:w-3/5 m-auto mt-6 font-serif ctnt-container">
        <div class="pt-6 px-4 pb-4 ctnt-main prblm-container">
            <div class="ctnt-sections">
                @if(Route::is('addproblem'))
                <div id="app" :type="add">
                @else
                <div id="app" :type="edit">
                @endif

                    @if(Route::is('addproblem'))
                    <form method="POST" action="/addproblem" ref="form">
                    @else
                    <form method="POST" action="/edit" ref="form">
                        <input type="text" name="id" v-bind:value="this.id" style="display: none;" />
                    @endif

                        <input type=text" name="solution" id="hiddenSolution" style="display: none;" v-bind:value="this.solutionIndex()" />
                        <input type=text" name="body" id="hiddenBody" style="display: none;" ref="formBody" />
                        <input type=text" name="category_id" id="hiddenCategory" style="display: none;" v-bind:value="this.topic" />
                        <input type=text" name="level_id" id="hiddenLevel" style="display: none;" v-bind:value="this.level" />

                        @csrf

                        <div class="md:grid md:grid-cols-7 md:gap-4">
                            <div class="col-span-5 pl-2">

                                <span class="prblm-edit-header">Title</span>
                                <input class="prblm-edit-title form-edit-input" type="text" name="title" v-model="this.title" placeholder="Title" autocomplete="off" @input="updatePreview()" />
                                @error('title')
                                <div class="alert alert-danger">{{ $message }}</div>
                                @enderror


                                <div class="prblm-edit-topiclevel">
                                    <Dropdown
                                            :options="globals.ProblemCategories"
                                            :initial="this.topic"
                                            :disabled="false"
                                            name="category"
                                            placeholder="Problem Category"
                                            v-on:selected="selectCategory"
                                    >
                                    </Dropdown>
                                    @error('category_id')
                                    <div class="alert alert-danger">{{ $message }}</div>
                                    @enderror


                                    <Dropdown
                                            :options="globals.ProblemLevels"
                                            :initial="this.level"
                                            :disabled="false"
                                            name="level"
                                            placeholder="Difficulty Level"
                                            v-on:selected="selectLevel"
                                    >
                                    </Dropdown>
                                    @error('level')
                                    <div class="alert alert-danger">{{ $message }}</div>
                                    @enderror
                                </div>

                                <span class="prblm-edit-header">Question Body</span>
                                <tip-tap-form :name="`editor`" :value="getQuestionBody()" ref="editor" v-on:update="setQuestionBody"></tip-tap-form>
                                @error('body')
                                <div class="alert alert-danger">{{ $message }}</div>
                                @enderror
                            </div>
                            <div class="col-span-2">
                                <span class="prblm-edit-header">Solutions</span>
                                <div class="prblm-edit-solutions">

                                    <template v-for="(solution, idx) in solutions">
                                        <p>
                                        <label class="edit-solution">
                                            <input class="with-gap edit-solution-radio" name="solutionsGroup" type="radio" v-bind:id="'solution' + idx" v-bind:checked="checkedSolution(idx)" @change="setCorrectSolution(idx)" />
                                            <input class="edit-solution-input" type="text" v-bind:name="'solution' + idx" placeholder="Solution Option" v-model="solution.text" autocomplete="off" @input="updatePreview()" />
                                        </label>
                                        </p>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </form>
                    <div>
                        <div class="preview">
                            <div ref="previewTitle"></div>

                            <div class="">
                                <div class="pl-4">
                                    <div ref="previewContent"></div>
                                </div>
                                <div class="" style="width:80%">
                                    <div ref="previewSolutions"></div>
                                </div>
                            </div>
                        </div>

                        <div class="prblm-edit-footer pr-8">
                            <a href="#" class="prblm-edit-cancel" @click.prevent="cancel">Cancel</a>
                            <a href="#" class="prblm-edit-save" @click.prevent="save">Save</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
