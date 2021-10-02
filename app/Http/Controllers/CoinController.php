<?php

namespace App\Http\Controllers;

use App\Models\Coin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CoinController extends Controller
{
    //
    public function store(Request $request)
    {
        // FIXME: Validate problem/comment
        // FIXME: Validate (user,problem,comment) trio is unique
        Coin::create([
            'user_id' => Auth::id(),
            'problem_id' => $request->input('id'),
            'comment_id' => $request->input('comment_id'),
            'coin' => $request->input('coin')
        ]);
    }

    public function destroy(Request $request)
    {
        // FIXME: Validate problem/comment
        Coin::where([
            'user_id' => Auth::id(),
            'problem_id' => $request->input('id'),
            'comment_id' => $request->input('comment_id')
        ])->delete();
    }
}
