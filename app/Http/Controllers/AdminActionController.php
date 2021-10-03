<?php

namespace App\Http\Controllers;

use App\Models\Problem;
use App\Models\Comment;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AdminActionController extends Controller
{
    //
    public function store(Request $request)
    {
        if (!Gate::allows('moderate')) {
            return redirect('/');
        }

        $attributes = $request->validate([
            'problem_id' => 'required', // FIXME: Validate problem_id
            'action' => 'required'
        ]);

        $problemId = $request->input('problem_id');
        $commentId = $request->input('comment_id');
        $action = $request->input('action');

        if ($action === "hide") {
            if ($commentId) {
                $comment = Comment::find($commentId);
                // FIXME: Validate comment belongs to problem
                $comment->timestamps = false;
                $comment->hidden = true;
                $comment->save();
            } else {
                $problem = Problem::find($problemId);
                $problem->timestamps = false;
                $problem->hidden = true;
                $problem->save();
            }
        } else if ($action === "unhide") {
            if ($commentId) {
                $comment = Comment::find($commentId);
                // FIXME: Validate comment belongs to problem
                $comment->timestamps = false;
                $comment->hidden = false;
                $comment->save();
            } else {
                $problem = Problem::find($problemId);
                $problem->timestamps = false;
                $problem->hidden = false;
                $problem->save();
            }
        }

        return redirect('/problem/' . $problemId);
    }
}
