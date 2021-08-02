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
    <div class="row ctnt-container">
        <div class="col s8 push-s2 ctnt-main prblm-container">
            <div class="ctnt-sections row">
                @if(Route::is('addproblem'))
                <div id="app" :type="add">
                @else
                <div id="app" :type="edit">
                @endif

                    @if(Route::is('addproblem'))
                    <form method="POST" action="/addproblem">
                    @else
                    <form method="POST" action="/edit">
                        <input type="text" name="id" v-bind:value="this.id" style="display: none;" />
                    @endif

                        <input type=text" name="body" id="hiddenBody" style="display: none;" v-bind:value="this.question" />
                        <input type=text" name="category_id" id="hiddenCategory" style="display: none;" />
                        <input type=text" name="level_id" id="hiddenLevel" style="display: none;" />

                        @csrf

                        <div class="row">
                            <div class="col s7">

                        <span class="prblm-edit-header">Title</span>
                        <input class="prblm-edit-title form-edit-input" type="text" name="title" v-bind:value="this.title" placeholder="Title" autocomplete="off" />
                        @error('title')
                        <div class="alert alert-danger">{{ $message }}</div>
                        @enderror


                        <div class="prblm-edit-topiclevel">

                            <Dropdown
                                    :options="globals.ProblemCategories"
                                    :initial="this.topic_id"
                                    :disabled="false"
                                    name="category"
                                    placeholder="Problem Category"
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
                            >
                            </Dropdown>
                            @error('level')
                            <div class="alert alert-danger">{{ $message }}</div>
                            @enderror
                        </div>

                        <span class="prblm-edit-header">Question Body</span>
                        <tip-tap-form :name="`editor`" :namepreview="`preveditor`" :haspreview="true" :value="this.question"></tip-tap-form>
                        @error('body')
                        <div class="alert alert-danger">{{ $message }}</div>
                        @enderror



                        <div class="prblm-edit-footer">
                            <a href="#" class="prblm-edit-cancel">Cancel</a>
                            <a href="#" class="prblm-edit-save">Save</a>
                        </div>
                            </div>
                            <div class="col offset-s1 s4">
                                <span class="prblm-edit-header">Solutions</span>
                                <div class="prblm-edit-solutions">

                                    <template v-for="(solution, idx) in solutions">
                                    <p>
                                    <label>
                                        <input class="with-gap edit-solution-radio" name="solutionsGroup" type="radio" v-bind:id="'solution' + idx" v-bind:checked="checkedSolution(idx)" />
                                        <input class="edit-solution-input" type="text" v-bind:name="'solution' + idx" placeholder="Solution Option" v-bind:value="solution.text" />
                                    </label>
                                    </p>
                                    </template>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>



            </div>
        </div>
    </div>
</x-app-layout>
