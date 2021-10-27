<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Problem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CommentController extends Controller
{
    public function getRules()
    {
        $rules = [
            'comment' => 'required|min:12',
        ];
        return $rules;
    }

    public function store(Request $request)
    {
        $rules = self::getRules();
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->messages()]);
        }

        $validated = $validator->validated();

        // Confirm post is NOT archived
        $problemId = (int)$request['problem_id'];
        $problem = Problem::where('id', $problemId)->first();
        if (!$problem || $problem->archive_id > 0) {
            return response()->json(['errors' => ['server' => 'unexpected error']], 418);
        }

        // Confirm parent comment under same post
        $parentId = (int)$request['parent_comment_id'];
        if ($parentId) {
            $parentComment = Comment::where('id', $parentId)->first();
            if (!$parentComment || $parentComment->problem_id != $problem->id) {
                return response()->json(['errors' => ['server' => 'unexpected error']], 418);
            }
        }

        $commentDoc = [
            'body'       => $validated['comment'],
            'author_id'  => Auth::id(),
            'problem_id' => $problemId,
        ];

        if ($parentId) {
            $commentDoc['parent_comment_id'] = $parentId;
        }

        $comment = Comment::create($commentDoc);
        if (!$comment->id) {
            // Failed to created
            return response()->json(['errors' => ['server' => 'unexpected error']], 418);
        }

        return response()->json(['id' => $comment->id]);
    }

    public function change(Request $request)
    {
        $commentId = (int)$request->input('id');
        $comment = Comment::where('id', $commentId)->get()[0];
        if (!$comment || $comment->author_id !== Auth::id())
        {
            return response()->json(['errors' => ['server' => 'unexpected error']], 418);
        }


        $rules = self::getRules();
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->messages()]);
        }

        $validated = $validator->validated();

        $comment->body = $validated['comment'];
        $saved = $comment->save();
        if ($saved)
        {
            return response()->json(['id' => $comment->id]);
        }
        else
        {
            return response()->json(['errors' => ['server' => 'unexpected error']], 418);
        }
    }
}
