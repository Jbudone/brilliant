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
        return view('addproblem');
    }

    public function store(Request $request)
    {
        $attributes = $request->validate([
            'title' => 'required|unique:problems|max:255',
            'category_id' => 'required',
            'level' => 'required',
            'body' => 'required'
        ]);

        //$attributes->author_id = Auth::id();
        $solutions = json_encode(['solutions' => [['correct' => 1, 'text' => '>'], ['text' => '<'], ['text' => '=']]]);
        $body = strlen($solutions) . $solutions . $request->input('body');

        //Problem::create($attributes);
        Problem::create([
            'title' =>       $request->input('title'),
            'category_id' => $request->input('category_id'),
            'level' =>       $request->input('level'),
            'body' =>        $body,
            'author_id' =>   Auth::id()//request()->user->id
        ]);

        // FIXME: Validation checking, successful?
        //return back()->withErrors([
        //    'email' => 'The provided credentials do not match our records.',
        //]);
    }

    public function edit(Request $request, $problemId)
    {
        $p = Problem::where('id', (int)$problemId)->with(['topic'])->get()[0];

        if ($p->author_id !== Auth::id())
        {
            return redirect('/problems/' . $problemId);
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
        ]];

        return view('editproblem', $json);
    }

    public function change(Request $request)
    {
        $attributes = $request->validate([
            'title' => 'required|max:255|min:3',
            'category_id' => 'required',
            'level' => 'required',
            'body' => 'required|min:16'
        ]);

        $problemId = $request->input('id');

        $solutions = json_encode(['solutions' => [['correct' => 1, 'text' => '>'], ['text' => '<'], ['text' => '=']]]);
        $body = strlen($solutions) . $solutions . $request->input('body');

        $problem = Problem::where('id', (int)$problemId)->get()[0];

        if ($problem->author_id !== Auth::id())
        {
            return redirect('/problems/' . $problemId);
        }


        //$problem->author_id = Auth::id();
        $problem->title = $request->input('title');
        $problem->category_id = $request->input('category_id');
        $problem->level = $request->input('level');
        $problem->body = $body;
        $problem->save();

        if ($problem->wasChanged())
        {
            return redirect('/problems/' . $problemId);
        }
        else
        {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ]);
        }
    }
}
