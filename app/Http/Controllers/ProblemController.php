<?php

namespace App\Http\Controllers;

use App\Models\Problem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProblemController extends Controller
{
    //

    public function create()
    {
        return view('addproblem', ['addProblem' => 1]);
    }

    public function store(Request $request)
    {
        $attributes = $request->validate([
            'title' => 'required|unique:problems|max:255',
            'category_id' => 'required',
            'level_id' => 'required',
            'solution' => 'required',
            'body' => 'required'
        ]);

        $body = $request->input('body'); // FIXME: Confirm solutions exist and proper JSON   OR  Discussion

        //Problem::create($attributes);
        $problem = Problem::create([
            'title' =>       $request->input('title'),
            'category_id' => $request->input('category_id'),
            'level' =>       $request->input('level_id'),
            'body' =>        $body,
            'solution' =>    $request->input('solution'),
            'author_id' =>   Auth::id()
        ]);

        // FIXME: Validation checking, successful?
        //return back()->withErrors([
        //    'email' => 'The provided credentials do not match our records.',
        //]);

        return redirect('/problems');
    }

    public function edit(Request $request, $problemId)
    {
        $p = Problem::where('id', (int)$problemId)->with(['topic'])->get()[0];

        if ($p->author_id !== Auth::id())
        {
            return redirect('/problem/' . $problemId);
        }

        $json = ['problem' => [
            'id' => $p->id,
            'title' => $p->title,
            'topic' => $p->topic->name,
            'body' => $p->body,
            'level' => $p->level,
            'author' => $p->author_id,
        ], 'user' => [
            'id' => Auth::id()
        ], 'editProblem' => 1];

        return view('addproblem', $json);
    }

    public function change(Request $request)
    {
        $attributes = $request->validate([
            'title' => 'required|max:255|min:3',
            'category_id' => 'required',
            'level_id' => 'required',
            'solution' => 'required',
            'body' => 'required|min:16'
        ]);


        $problemId = $request->input('id');

        //$solutions = json_encode(['solutions' => [['correct' => 1, 'text' => '>'], ['text' => '<'], ['text' => '=']]]);
        //$body = strlen($solutions) . $solutions . $request->input('body');
        $body = $request->input('body'); // FIXME: Confirm solutions exist and proper JSON   OR  Discussion

        $problem = Problem::where('id', (int)$problemId)->get()[0];

        if ($problem->author_id !== Auth::id())
        {
            return redirect('/problem/' . $problemId);
        }


        //$problem->author_id = Auth::id();
        $problem->title = $request->input('title');
        $problem->category_id = $request->input('category_id');
        $problem->level = $request->input('level_id');
        $problem->body = $body;
        $problem->solution = $request->input('solution');
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
