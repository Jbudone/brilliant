<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Problem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    //

    public function store(Request $request)
    {
        $attributes = $request->validate([
            'comment' => 'required|max:255|min:3', // FIXME: Validate problem_id
        ]);

        // Confirm post is NOT archived
        $problemId = $request->input('id');
        $problem = Problem::where('id', (int)$problemId)->first();
        if (!$problem || $problem->archive_id > 0) {
            return back();
        }

        // FIXME: Check parent comment under same post

        Comment::create([
            'body' =>     $request->input('comment'),
            'author_id' =>   Auth::id(),
            'problem_id' => $problemId,
            'parent_comment_id' => $request->input('parent_comment_id')
        ]);

        return back();
        //return back()->withErrors([
        //    'email' => 'The provided credentials do not match our records.',
        //]);
    }

    public function change(Request $request)
    {
        $attributes = $request->validate([
            'comment' => 'required|max:255|min:3',
        ]);

        $commentId = $request->input('id');

        $comment = Comment::where('id', (int)$commentId)->get()[0];

        if ($comment->author_id !== Auth::id())
        {
            return back();
        }

        $comment->body = $request->input('comment');
        $comment->save();

        if ($comment->wasChanged())
        {
            return back();
        }
        else
        {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ]);
        }
    }
}
