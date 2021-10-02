<?php

namespace App\Http\Controllers;

use App\Models\Vote;
use App\Models\Problem;
use App\Models\Comment;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VoteController extends Controller
{
    //
    public function store(Request $request)
    {
        $problemId = $request->input('problem_id');
        $commentId = $request->input('comment_id');
        $isUpvote  = $request->input('upvote');

        $vote = Vote::where([
            'user_id' => Auth::id(),
            'problem_id' => $problemId,
            'comment_id' => $commentId,
        ])->first();

        $addVotes = 0;
        $addPoints = ($isUpvote ? 1 : -1);

        if ($vote) {
            if ($vote->upvote == $isUpvote) {
                // Already  have this vote recorded
                return;
            }

            $vote->update(['upvote' => $isUpvote]);
            $addPoints += ($isUpvote ? 1 : -1); // To undo previous vote
        } else {
            // FIXME: Validate problem/comment
            // FIXME: Validate (user,problem,comment) trio is unique
            Vote::create([
                'user_id' => Auth::id(),
                'problem_id' => $problemId,
                'comment_id' => $commentId,
                'upvote' => $isUpvote
            ]);

            $addVotes = 1;
        }


        // FIXME: Abstract comment/problem fetch to shared file
        if ($commentId) {
            $comment = Comment::find($commentId);
            // FIXME: Validate comment belongs to problem
            $comment->timestamps = false;
            $comment->increment('votes', $addVotes);
            $comment->increment('points', $addPoints);
            dd($comment);
            $comment->save();
        } else {
            $problem = Problem::find($problemId);
            $problem->timestamps = false;
            $problem->increment('votes', $addVotes);
            $problem->increment('points', $addPoints);
            $problem->save();
        }
    }

    public function destroy(Request $request)
    {
        $problemId = $request->input('problem_id');
        $commentId = $request->input('comment_id');

        // FIXME: Validate problem/comment
        $vote = Vote::where([
            'user_id' => Auth::id(),
            'problem_id' => $problemId,
            'comment_id' => $commentId,
        ])->first();

        $isUpvote = $vote->upvote;

        // NOTE: Can't delete instance since Eloquent requires primary key
        Vote::where([
            'user_id' => Auth::id(),
            'problem_id' => $problemId,
            'comment_id' => $commentId,
        ])->delete();

        // FIXME: Abstract comment/problem fetch to shared file
        if ($commentId) {
            $comment = Comment::find($commentId);
            // FIXME: Validate comment belongs to problem
            $comment->timestamps = false;
            $comment->decrement('votes');
            if ($isUpvote) $comment->decrement('points');
            else $comment->increment('points');
            $comment->save();
        } else {
            $problem = Problem::find($problemId);
            $problem->timestamps = false;
            $problem->decrement('votes');
            if ($isUpvote) $problem->decrement('points');
            else $problem->increment('points');
            $problem->save();
        }
    }
}
