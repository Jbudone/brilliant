<x-app-layout>

    @section('pageTitle', 'Add Problem')
    @push('scripts')
        @if($addProblem)
        <script>window['addedit'] = 'add';</script>
        <script type="module" src="{{ asset('addproblem.js?' . Str::random(40)) }}"></script>
        <script>
            var isDiscussion = {{ $isDiscussion ? "true" : "false" }};
        </script>
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
            var isDiscussion = {{ $isDiscussion  ? "true" : "false" }};
        </script>
        @endif
    @endpush

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            @if($addProblem)
            {{ __('Add Problem') }}
            @else
            {{ __('Edit Problem') }}
            @endif
        </h2>
    </x-slot>


    <!-- Content -->
    <div class="md:w-9/12 lg:w-8/12 m-auto mt-6 font-serif ctnt-container">
        <div class="pt-6 px-4 pb-4 ctnt-main prblm-container">
            <div class="ctnt-sections">
                @if($addProblem)
                <div id="app" :type="add">
                @else
                <div id="app" :type="edit">
                @endif

                    @if($addProblem)
                        @if($isDiscussion)
                        <form method="POST" action="/adddiscussion" ref="form">
                        @else
                        <form method="POST" action="/addproblem" ref="form">
                        @endif
                    @else
                        @if($isDiscussion)
                        <form method="POST" action="/editdiscussion" ref="form">
                            <input type="text" name="id" v-bind:value="this.id" style="display: none;" />
                        @else
                        <form method="POST" action="/editproblem" ref="form">
                            <input type="text" name="id" v-bind:value="this.id" style="display: none;" />
                        @endif
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

                                @if(!$isDiscussion)
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
                                @endif

                                <span class="prblm-edit-header">Question Body</span>
                                <tip-tap-form :name="`editor`" :value="getQuestionBody()" ref="editor" v-on:update="setQuestionBody"></tip-tap-form>
                                @error('body')
                                <div class="alert alert-danger">{{ $message }}</div>
                                @enderror
                            </div>
                            @if(!$isDiscussion)
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
                            @endif
                        </div>
                    </form>
                    <div>
                        <div class="preview">
                            <div ref="previewTitle"></div>

                            <div class="">
                                <div class="pl-4">
                                    <div ref="previewContent"></div>
                                </div>
                                @if(!$isDiscussion)
                                <div class="" style="width:80%">
                                    <div ref="previewSolutions"></div>
                                </div>
                                @endif
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
