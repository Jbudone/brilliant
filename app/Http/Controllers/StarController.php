<?php

namespace App\Http\Controllers;

use App\Models\Star;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StarController extends Controller
{
    //
    public function store(Request $request)
    {
        // FIXME: Validate problem/comment
        // FIXME: Validate (user,problem) trio is unique
        Star::create([
            'user_id' => Auth::id(),
            'problem_id' => $request->input('id')
        ]);

    }

    public function destroy(Request $request)
    {
        // FIXME: Validate problem
        Star::where([
            'user_id' => Auth::id(),
            'problem_id' => $request->input('id')
        ])->delete();
    }
}
