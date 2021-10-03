<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\AdminEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $problemId = $request->input('problem_id');
        $commentId = $request->input('comment_id');

        $report = Report::where([
            'user_id' => Auth::id(),
            'problem_id' => $problemId,
            'comment_id' => $commentId,
        ])->first();

        // FIXME: Make sure this doesn't exist yet
        if ($report) { return; }

        // FIXME: Validate problem/comment
        // FIXME: Validate (user,problem,comment) trio is unique
        $report = Report::create([
            'user_id' => Auth::id(),
            'problem_id' => $problemId,
            'comment_id' => $commentId,
            'reason' => "None"
        ]);

        #$userId = Auth::id();
        #AdminEvent::create([
        #    'issue_id' => 1,
        #    'event' => "Report: $report->id $userId $problemId $commentId"
        #]);
    }

    public function destroy(Request $request)
    {
        $problemId = $request->input('problem_id');
        $commentId = $request->input('comment_id');

        // FIXME: Validate problem/comment
        $report = Report::where([
            'user_id' => Auth::id(),
            'problem_id' => $problemId,
            'comment_id' => $commentId,
        ])->first();

        // NOTE: Can't delete instance since Eloquent requires primary key
        Report::where([
            'user_id' => Auth::id(),
            'problem_id' => $problemId,
            'comment_id' => $commentId,
        ])->delete();

        // FIXME: Unsure how to remove AdminEvent
    }
}
