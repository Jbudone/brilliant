<x-app-layout>

    @section('pageTitle', 'Dashboard')
    @push('scripts')
    <script type="module" src="{{ asset('profile.js?' . Str::random(40)) }}"></script>
    <script>
        var ProblemsJson = @json($authoredProblems, JSON_PRETTY_PRINT);
    </script>
    @endpush

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 bg-white border-b border-gray-200">
                    You're logged in!

                    <br/> <br/>

                    <div id="app">

                        <h3>Your Problems and Discussions:</h3>
                        <template v-if="ProblemsJson.length > 0">
                            <template v-for="(problem, idx) in ProblemsJson">
                                <a v-bind:href="'/problem/' + problem.id" class="">@{{ problem.title }}</a>
                            </template>
                        </template>


                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
