<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    //
    public function store(Request $request)
    {
        // FIXME: Validate problem/comment
        // FIXME: Validate (user,problem,comment) trio is unique
        Report::create([
            'user_id' => Auth::id(),
            'problem_id' => $request->input('id'),
            'comment_id' => $request->input('comment_id'),
            'reason' => $request->input('reason')
        ]);

    }

    public function destroy(Request $request)
    {
        // FIXME: Validate user/id
        Report::where([
            'user_id' => Auth::id(),
            'id' => $request->input('id'),
        ])->delete();
    }
}
