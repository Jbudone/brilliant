<?php

use Illuminate\Support\Facades\Route;

use App\Models\Problem;
use App\Models\Solve;
use App\Models\Comment;
use App\Models\Vote;
use App\Models\Star;
use App\Models\Coin;
use App\Models\Report;
use App\Models\AdminEvent;
use App\Models\ActivityEvent;

use App\Http\Controllers\ProblemController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\SolveController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\StarController;
use App\Http\Controllers\CoinController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AdminEventController;
use App\Http\Controllers\ActivityEventController;
use App\Http\Controllers\AdminActionController;

use Illuminate\Database\Eloquent\ModelNotFoundException;

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
    return view('problems');
});

// Generate periodically
Route::get('/initialproblems', function () {
    // FIXME: If doesn't exist then trigger generate and wait until generated
    $problems = file_get_contents('../../initialproblems.json');
    return json_decode($problems);
});

// Generated nightly/weekly
Route::get('/allproblems', function () {
    // FIXME: If doesn't exist then trigger generate and wait until generated
    // FIXME: Split into multiple jsons of 10k size, order by date, fetch older sets on request (pagination)
    //$problems = file_get_contents('../../sortedproblems.json');
    //return json_decode($problems);
    $p = Problem::get(['id', 'title', 'category_id', 'level']);
    $problems = [];
    foreach ($p as $problem) {
        if(!$problem) continue;
        $problems[] = [
            'n' => $problem->title,
            'p' => "problem/" . $problem->id,
            'c' => $problem->category_id,
            'l' => $problem->level,
        ];
    }

    $output = json_encode($problems);
    return $output;
});

Route::get('/problemspaginatecount/{categoryId}/{level}', function ($categoryId, $level) {
    // FIXME: There's gotta be a cleaner way to do this
    if ($categoryId > 0 && $level > 0) {
        $count = Problem::where('category_id', $categoryId)->where('level', $level)->where('hidden', false)->count();
    } else if ($categoryId > 0) {
        $count = Problem::where('category_id', $categoryId)->where('hidden', false)->count();
    } else if ($level > 0) {
        $count = Problem::where('level', $level)->where('hidden', false)->count();
    } else {
        $count = Problem::count();
    }

    return json_encode(['count' => $count]);
})->where(['categoryId' => '[0-9]', 'level' => '[0-9]']);


Route::get('/problemspaginate/{categoryId}/{level}/{offset}', function ($categoryId, $level, $offset) {
    $query = Problem::orderBy('id', 'desc');
    if ($categoryId > 0) {
        $query = $query->where('category_id', $categoryId);
    } else {
        $query = $query->whereNotNull('category_id');
    }

    if ($level > 0) {
        $query = $query->where('level', $level);
    }

    // offset as offset within filter
    if ($offset > 0) {
        $query = $query->offset($offset);
    }

    $p = $query->limit(1000)->get(['id', 'title', 'category_id', 'level']);
    // FIXME: Return as json w/out manual json_encode
    $problems = [];
    foreach ($p as $problem) {
        $problems[] = [
            'n' => $problem->title,
            'p' => "problem/" . $problem->id,
            'c' => $problem->category_id,
            'l' => $problem->level,
        ];
    }

    return json_encode($problems);
})->where(['categoryId' => '[0-9]', 'level' => '[0-9]', 'offset' => '[0-9]+']);

Route::get('/newproblems', function () {
    $p = Problem::where('created_at', '>=', now()->subWeek())->whereNotNull('category_id')->where('hidden', false)->limit(1000)->orderBy('created_at', 'DESC')->get(['id', 'title', 'category_id', 'level']);
    $problems = [];
    foreach ($p as $problem) {
        $problems[] = [
            'n' => $problem->title,
            'p' => "problem/" . $problem->id,
            'c' => $problem->category_id,
            'l' => $problem->level,
        ];
    }

    return json_encode($problems);
});

Route::get('/problems', function() {
    return view('problems');
})->name('problems');

Route::get('/brilliantexport/problems/{problemFirst}/{problem}', function ($problemId) {
    return File::get(public_path() . "/brilliantexport/problems/$problemId/$problemId.html");
})->where('problem', '[A-Za-z0-9_-]+');

Route::get('/brilliantexport/discussions/thread/{problemFirst}/{problem}', function ($problemId) {
    return File::get(public_path() . "/brilliantexport/discussions/thread/$problemId/$problemId.html");
})->where('problem', '[A-Za-z0-9_-]+');


// FIXME: Put this in ProblemController::index
Route::get('/problem/{problem}', function ($problemId) {
    $p = Problem::where('id', (int)$problemId)->with(['topic', 'author', 'comments.author:id,name,created_at'])->first();

    if (!$p) {
        throw new ModelNotFoundException();
    }

    //$p = $p[0];
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
            'date' => $comment->created_at,

            'points' => $comment->points,
            'votes' => $comment->votes,
            'coins' => $comment->coins,
            'hidden' => $comment->hidden
        ];
    }


    $json;
    if ($p->discussion) {

        $json = ['problem' => [
            'id' => $p->id,
            'title' => $p->title,
            'body' => $p->body,
            'author' => $p->author_id,
            'users' => $users,
            'comments' => $comments,
            'source' => $p->source,
            'discussion' => true,
            'hidden' => $p->hidden,

            'points' => $p->points,
            'votes' => $p->votes,
            'coins' => $p->coins,
            'stars' => $p->stars,
        ], 'source' => $p->source,
        'user' => [
            'id' => Auth::id(),
            'canmoderate' => Gate::allows('moderate')
        ]];

    } else {

        $json = ['problem' => [
            'id' => $p->id,
            'title' => $p->title,
            'topic' => $p->topic->name,
            'body' => $p->body,
            'level' => $p->level,
            'author' => $p->author_id,
            'users' => $users,
            'comments' => $comments,
            'source' => $p->source,
            'discussion' => false,
            'hidden' => $p->hidden,

            'points' => $p->points,
            'votes' => $p->votes,
            'coins' => $p->coins,
            'stars' => $p->stars,
        ], 'source' => $p->source,
        'user' => [
            'id' => Auth::id(),
            'canmoderate' => Gate::allows('moderate')
        ]];


        if (Auth::id()) {
            $solve = Solve::where('problem_id', (int)$problemId)->where('user_id', Auth::id())->first();
            if ($solve) {
                $json['solve'] = [
                    'solution' => $solve->solution,
                    'correct' => $solve->correct,
                    'date' => $solve->created_at
                ];
            }

            $vote = Vote::where('problem_id', (int)$problemId)->where('user_id', Auth::id())->select('upvote', 'comment_id')->get();
            if ($vote) {
                $json['vote'] = $vote;
            }

            $report = Report::where('problem_id', (int)$problemId)->where('user_id', Auth::id())->select('comment_id')->get();
            if ($report) {
                $json['report'] = $report;
            }

            if (Gate::allows('moderate')) {
                // Include all reports in problem
                $allReports = Report::where('problem_id', (int)$problemId)->select('comment_id')->groupBy('comment_id')->get();
                if ($allReports) {
                    $json['allReports'] = $allReports;
                }
            }
        }
    }


    return view('problem', $json);
    //return view('problem', ['problem' => Problem::find(1)->with(['topic', 'author', 'comments.author:name'])->get()]);
})->whereNumber('problem');


Route::get('/addproblem', [ProblemController::class, 'create'])->middleware(['auth'])->name('addproblem');
Route::get('/edit/{problem}', [ProblemController::class, 'edit'])->middleware(['auth'])->whereNumber('problem')->name('editproblem');
Route::get('/adddiscussion', [ProblemController::class, 'create'])->middleware(['auth'])->name('adddiscussion');

Route::middleware(['auth', 'throttle:post'])->group(function(){
    Route::post('/addproblem', [ProblemController::class, 'store'])->name('storeproblem');
    Route::post('/editproblem', [ProblemController::class, 'change'])->name('changeproblem');
    Route::post('/editdiscussion', [ProblemController::class, 'change'])->name('changediscussion');
    Route::post('/adddiscussion', [ProblemController::class, 'store'])->name('storediscussion');
});


Route::get('/randomproblem', function() {
    $count = intval(Problem::count());
    $randomIdx = rand(1, $count);
    return redirect('/problem/' . $randomIdx);
})->name('randomproblem');

Route::middleware(['auth', 'throttle:comment'])->group(function(){
    Route::post('/comment', [CommentController::class, 'store']);
    Route::post('/editcomment', [CommentController::class, 'change']);
});

Route::middleware(['auth', 'throttle:solve'])->group(function(){
    Route::post('/solve', [SolveController::class, 'store']);
    Route::post('/unsolve', [SolveController::class, 'destroy']);
    Route::post('/giveup', [SolveController::class, 'store']);
});

Route::get('/dashboard', function () {

    $problems = Problem::where('author_id', Auth::id())->get();

    return view('dashboard', [
        'authoredProblems' => $problems
    ]);
})->middleware(['auth'])->name('dashboard');

Route::get('/admin', function() {
    if (!Gate::allows('moderate')) {
        return redirect('/');
    }

    $reports = Report::select('user_id', 'problem_id', 'comment_id')->get();
    $hiddenProblems = Problem::where('hidden', true)->select('id', 'title')->get();
    $hiddenComments = Comment::where('hidden', true)->select('id', 'author_id', 'problem_id', 'body')->get();

    $json = ['reports' => $reports, 'hiddenProblems' => $hiddenProblems, 'hiddenComments' => $hiddenComments];
    return view('admin', $json);
})->middleware(['auth'])->name('admin');


Route::middleware(['auth', 'throttle:interaction'])->group(function(){
    Route::post('/vote', [VoteController::class, 'store']);
    Route::post('/unvote', [VoteController::class, 'destroy']);

    Route::post('/star', [StarController::class, 'store']);
    Route::post('/unstar', [StarController::class, 'destroy']);

    Route::post('/coin', [CoinController::class, 'store']);
    Route::post('/uncoin', [CoinController::class, 'destroy']);

    Route::post('/report', [ReportController::class, 'store']);
    Route::post('/unreport', [ReportController::class, 'destroy']);

    Route::post('/adminaction', [AdminActionController::class, 'store']);
});


require __DIR__.'/auth.php';
