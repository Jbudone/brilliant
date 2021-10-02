<?php

namespace App\Http\Controllers;

use App\Models\AdminEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminEventController extends Controller
{
    //
    public function store(Request $request)
    {
        // FIXME: How to fetch issue_id?
        AdminEvent::create([
            'issue_id' => $request->input('issue_id'),
            'event' => $request->input('event')
        ]);
    }

    public function destroy(Request $request)
    {
        // FIXME: Deletes ALL entries on issue; is this okay?
        Vote::where([
            'issue_id' => $request->input('id')
        ])->delete();
    }
}
