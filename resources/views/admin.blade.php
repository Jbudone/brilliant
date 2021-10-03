<x-app-layout>

    @section('pageTitle', 'Admin Page')
    @push('scripts')
        <script type="module" src="{{ asset('admin.js?' . Str::random(40)) }}"></script>
        <script>
            var ReportsJson = @json($reports, JSON_PRETTY_PRINT);
            var HiddenProblemsJson = @json($hiddenProblems, JSON_PRETTY_PRINT);
            var HiddenCommentsJson = @json($hiddenComments, JSON_PRETTY_PRINT);
        </script>
    @endpush

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Admin Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 bg-white border-b border-gray-200">

@can('admin')
    Hello, Admin!
@elsecan('moderate')
    Hello, Moderator!
@endcan

                    <br/> <br/>

                    <div id="app">

                        <h3>Unhandled Reports:</h3>
                        <template v-if="unhandledReports.length > 0">
                            <template v-for="(report, idx) in unhandledReports">
                                <div class="">
                                    <span class="">Report: </span>
                                    <a v-bind:href="'/problem/' + report.problem_id" class="">@{{ report.title }}</a>
                                </div>
                            </template>
                        </template>
                        <template v-else>
                            None. You've all done great work!
                        </template>

                        <br/><br/>


                        <h3>Handled Reports:</h3>
                        <template v-if="handledReports.length > 0">
                            <template v-for="(report, idx) in handledReports">
                                <div class="">
                                    <span class="">Report: </span>
                                    <a v-bind:href="'/problem/' + report.problem_id" class="">@{{ report.title }}</a>
                                </div>
                            </template>
                        </template>


                        <br/><br/>

                        <h3>Handled Non Reports:</h3>
                        <template v-if="handledNonReports.length > 0">
                            <template v-for="(report, idx) in handledNonReports">
                                <div class="">
                                    <span class="">Report: </span>
                                    <a v-bind:href="'/problem/' + report.problem_id" class="">@{{ report.title }}</a>
                                </div>
                            </template>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
