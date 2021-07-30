<?php

use Illuminate\Support\Facades\Route;

use App\Models\Problem;
use App\Http\Controllers\ProblemController;
use App\Http\Controllers\CommentController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('home');
});

Route::get('/initialproblems', function () {
    $problems = file_get_contents('../../initialproblems.json');
    return json_decode($problems);
});

// Generated nightly/weekly
Route::get('/allproblems', function () {
    $problems = file_get_contents('../../sortedproblems.json');
    return json_decode($problems);
});

Route::get('/newproblems', function () {
    $p = Problem::where('created_at', '>=', now()->subWeek())->get();
    $problems = [];
    foreach ($p as $problem) {
        $problems[] = [
            'n' => $problem->title,
            'p' => "problems/" . 1,
            'c' => $problem->topic->name,
            'l' => $problem->level,
        ];
    }

    return json_encode($problems);
});

Route::get('/problems/{problem}', function ($problemId) {
    $p = Problem::where('id', (int)$problemId)->with(['topic', 'author', 'comments.author:id,name,created_at'])->get()[0];
    $users[$p->author->id] = ['name' => $p->author->name];
    $comments = [];
    foreach ($p->comments as $comment) {

        if (!array_key_exists($comment->author_id, $users)) {
            $users[$comment->author_id] = ['name' => $comment->author->name];
        }

        $comments[] = [
            'id' => $comment->id,
            'author' => $comment->author_id,
            'body' => $comment->body,
            'parent_comment_id' => $comment->parent_comment_id,
            'date' => $comment->created_at
        ];
    }



    $json = ['problem' => [
        'id' => $p->id,
        'title' => $p->title,
        'topic' => $p->topic->name,
        'body' => $p->body,
        'level' => $p->level,
        'author' => $p->author_id,
        'users' => $users,
        'comments' => $comments
    ], 'user' => [
        'id' => Auth::id()
    ]];

    return view('problem', $json);
    //return view('problem', ['problem' => Problem::find(1)->with(['topic', 'author', 'comments.author:name'])->get()]);
})->whereNumber('problem');


Route::get('/addproblem', [ProblemController::class, 'create'])->middleware(['auth']);
//    return view('addproblem');
//})->middleware(['auth']);

Route::post('/addproblem', [ProblemController::class, 'store'])->middleware(['auth']);
Route::get('/edit/{problem}', [ProblemController::class, 'edit'])->middleware(['auth'])->whereNumber('problem');
Route::post('/edit', [ProblemController::class, 'change'])->middleware(['auth']);
Route::post('/comment', [CommentController::class, 'store'])->middleware(['auth']);
Route::post('/editcomment', [CommentController::class, 'change'])->middleware(['auth']);

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth'])->name('dashboard');

require __DIR__.'/auth.php';