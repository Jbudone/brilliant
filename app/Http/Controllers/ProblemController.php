<?php

namespace App\Http\Controllers;

use App\Models\Problem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProblemController extends Controller
{
    //

    public function create(Request $request)
    {
        $isDiscussion = $request->route()->named('adddiscussion');
        return view('addproblem', ['editProblem' => 0, 'addProblem' => 1, 'isDiscussion' => $isDiscussion]);
    }

    public function getRules($isDiscussion, $existingProblem)
    {
        // TODO: Fix max length to specify MEDIUMTEXT length
        $rules = [
            'title' => 'required|unique:App\Models\Problem,title|max:255|min:3',
            'body' => 'required|min:3|max:16000000'
        ];

        if ($existingProblem) {
            $rules['title'] = ['required', 'max:255', 'min:3',
                Rule::unique('problems', 'title')->ignore($existingProblem->id)
            ];
        }

        if (!$isDiscussion) {
            $rules = array_merge($rules, [
                'category_id' => 'required|integer|between:1,14',
                'level_id' => 'required|integer|between:1,5',
                'solution' => 'required',
                'solutions' => 'required|max:777000'
            ]);
        }

        return $rules;
    }

    public function validateSolutions(&$validated)
    {
        $solutionsJson = $validated['solutions'];
        $solutions = json_decode($solutionsJson);


        // Check:
        //  - Only one correct
        //  - Solutions unique
        //  - No empty solutions
        $foundCorrect = 0;
        $emptySolution = false;
        $nonUnique = false;
        foreach ($solutions->solutions as $idx => &$solution) {
            if (isset($solution->correct)) ++$foundCorrect;

            $text = trim($solution->text);
            if (empty($text)) $emptySolution = true;

            // Unique?
            foreach ($solutions->solutions as $prevIdx => &$prevSolution) {
                if ($prevIdx == $idx) break;
                $prevText = trim($prevSolution->text);
                if ($prevText === $text) $nonUnique = true;
            }
        }

        $errors = [];
        if ($foundCorrect === 0) $errors[] = "At least one solution needs to be marked as correct";
        if ($foundCorrect > 1) $errors[] = "Only one solution can be marked as correct";
        if ($emptySolution) $errors[] = "Cannot include empty solutions";
        if ($nonUnique) $errors[] = "Solutions must be unique";

        if ($errors) {
            return $errors;
        }

        $body = strlen($solutionsJson) . $solutionsJson . $validated['body'];
        $validated['body'] = $body;
    }

    public function store(Request $request)
    {
        $isDiscussion = $request->route()->named('storediscussion');
        $rules = self::getRules($isDiscussion, null);

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->messages()]);
        }

        $validated = $validator->validated();

        // Check solutions + merge w/ JSON
        if (!$isDiscussion) {
            $errors = self::validateSolutions($validated);
            if ($errors) {
                $errors = ['errors' => ['solutions' => $errors]];
                return response()->json($errors);
            }
        }

        $postDoc = [
            'title'      => $validated['title'],
            'body'       => $validated['body'],
            'author_id'  => Auth::id(),
            'discussion' => $isDiscussion
        ];

        if (!$isDiscussion) {
            $postDoc = array_merge($postDoc, [
                'category_id' => $validated['category_id'],
                'level'       => $validated['level_id'],
                'solution'    => $validated['solution']
            ]);
        }

        $problem = Problem::create($postDoc);
        if (!$problem->id) {
            // Failed to created
            return response()->json(['errors' => ['server' => 'unexpected error']], 418);
        }

        return response()->json(['id' => $problem->id]);
    }

    public function edit(Request $request, $problemId)
    {
        $p = Problem::where('id', (int)$problemId)->get()[0];
        if ($p->author_id !== Auth::id())
        {
            return redirect('/problem/' . $problemId);
        }

        $isDiscussion = $p->discussion;

        $json;
        if ($isDiscussion) {
            $json = ['problem' => [
                'id' => $p->id,
                'title' => $p->title,
                'body' => $p->body,
                'author' => $p->author_id,
                'discussion' => $p->discussion
            ], 'user' => [
                'id' => Auth::id()
            ], 'editProblem' => 1, 'addProblem' => 0, 'isDiscussion' => $isDiscussion];
        } else {
            $json = ['problem' => [
                'id' => $p->id,
                'title' => $p->title,
                'topic' => $p->topic->id,
                'body' => $p->body,
                'level' => $p->level,
                'author' => $p->author_id,
                'discussion' => $p->discussion
            ], 'user' => [
                'id' => Auth::id()
            ], 'editProblem' => 1, 'addProblem' => 0, 'isDiscussion' => $isDiscussion];
        }

        return view('addproblem', $json);
    }

    public function change(Request $request)
    {
        $isDiscussion = $request->route()->named('changediscussion');

        // Find problem
        $problemId = $request->input('id');
        $problem = Problem::where('id', (int)$problemId)->get()[0];
        if (!$problem || $problem->author_id !== Auth::id())
        {
            return response()->json(['errors' => ['server' => 'unexpected error']], 418);
        }

        // Validate
        $rules = self::getRules($isDiscussion, $problem);
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->messages()]);
        }

        $validated = $validator->validated();

        // Check solutions + merge w/ JSON
        if (!$isDiscussion) {
            $errors = self::validateSolutions($validated);
            if ($errors) {
                $errors = ['errors' => ['solutions' => $errors]];
                return response()->json($errors);
            }
        }

        $problem->title = $validated['title'];
        $problem->body = $validated['body'];

        if (!$isDiscussion) {
            $problem->category_id = $validated['category_id'];
            $problem->level = $validated['level_id'];
            $problem->solution = $validated['solution'];
        }

        $saved = $problem->save();
        if ($saved)
        {
            return response()->json(['id' => $problem->id]);
        }
        else
        {
            return response()->json(['errors' => ['server' => 'unexpected error']], 418);
        }
    }
}
