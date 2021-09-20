<?php

namespace App\Http\Controllers;

use App\Models\Problem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProblemController extends Controller
{
    //

    public function create(Request $request)
    {
        $isDiscussion = $request->route()->named('adddiscussion');
        return view('addproblem', ['editProblem' => 0, 'addProblem' => 1, 'isDiscussion' => $isDiscussion]);
    }

    public function store(Request $request)
    {
        $isDiscussion = $request->route()->named('storediscussion');

        $atributes;
        if ($isDiscussion) {
            $attributes = $request->validate([
                'title' => 'required|unique:problems|max:255',
                'body' => 'required'
            ]);
        } else {
            $attributes = $request->validate([
                'title' => 'required|unique:problems|max:255',
                'category_id' => 'required',
                'level_id' => 'required',
                'solution' => 'required',
                'body' => 'required'
            ]);
        }

        $body = $request->input('body'); // FIXME: Confirm solutions exist and proper JSON   OR  Discussion

        $problem;
        if ($isDiscussion) {
            $problem = Problem::create([
                'title' =>       $request->input('title'),
                'body' =>        $body,
                'author_id' =>   Auth::id(),
                'discussion' =>  TRUE
            ]);
        } else {
            $problem = Problem::create([
                'title' =>       $request->input('title'),
                'category_id' => $request->input('category_id'),
                'level' =>       $request->input('level_id'),
                'body' =>        $body,
                'solution' =>    $request->input('solution'),
                'author_id' =>   Auth::id(),
                'discussion' =>  FALSE
            ]);
        }

        // FIXME: Validation checking, successful?
        //return back()->withErrors([
        //    'email' => 'The provided credentials do not match our records.',
        //]);

        return redirect('/problem/' . $problem->id);
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
        if ($isDiscussion) {
            $attributes = $request->validate([
                'title' => 'required|max:255|min:3',
                'body' => 'required|min:16'
            ]);
        } else {
            $attributes = $request->validate([
                'title' => 'required|max:255|min:3',
                'category_id' => 'required',
                'level_id' => 'required',
                'solution' => 'required',
                'body' => 'required|min:16'
            ]);
        }

        $problemId = $request->input('id');

        //$solutions = json_encode(['solutions' => [['correct' => 1, 'text' => '>'], ['text' => '<'], ['text' => '=']]]);
        //$body = strlen($solutions) . $solutions . $request->input('body');
        $body = $request->input('body'); // FIXME: Confirm solutions exist and proper JSON   OR  Discussion

        $problem = Problem::where('id', (int)$problemId)->get()[0];
        if ($problem->author_id !== Auth::id())
        {
            return redirect('/problem/' . $problemId);
        }


        $problem->title = $request->input('title');
        $problem->body = $body;

        if (!$isDiscussion) {
            $problem->category_id = $request->input('category_id');
            $problem->level = $request->input('level_id');
            $problem->solution = $request->input('solution');
        }

        $problem->save();
        if ($problem->wasChanged())
        {
            return redirect('/problem/' . $problemId);
        }
        else
        {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ]);
        }
    }
}
