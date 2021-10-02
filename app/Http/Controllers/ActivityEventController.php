<?php

namespace App\Http\Controllers;

use App\Models\ActivityEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityEventController extends Controller
{
    //
    public function store(Request $request)
    {
        // FIXME: Validate problem/comment
        // FIXME: Validate (user,problem,comment) trio is unique
        ActivityEvent::create([
            'user_id' => Auth::id(),
            'problem_id' => $request->input('id'),
            'comment_id' => $request->input('comment_id'),
            'event' => $request->input('event')
        ]);

    }
}
