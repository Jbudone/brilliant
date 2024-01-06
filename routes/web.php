<?php

use Illuminate\Support\Facades\Route;

use App\Models\Problem;
use App\Models\User;
use App\Models\Solve;
use App\Models\Report;
use App\Models\ProblemsOfTheWeek;

use App\Http\Controllers\ProblemController;
use App\Http\Controllers\SolveController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ProblemsOfTheWeekController;

use Illuminate\Database\Eloquent\ModelNotFoundException;

use Typesense\Client;
use Carbon\Carbon;

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

Route::get('/weeklyproblems/{weekId}/{level}/{num}', function ($weekId, $level, $num) {

    $weeks = ProblemsOfTheWeek::get(['week', 'level', 'count']); // FIXME: this is never changing and always going out, lets cache

    $week = ProblemsOfTheWeek::where('week', $weekId)->where('level', $level)->first();
    $p = Problem::where('problemsoftheweek_id', $week['id'])->get()[$num];

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
            'uid' => $p->uid,
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


    $json['weeks'] = $weeks;
    return view('problem', $json);
})->name('weeklyproblems_weeklevelnum')
  ->where('weekId', '(2017|2018)-(0[1-9]|1[0-2])-\d\d')
  ->where('level', '[1-3]')
  ->where('num', '[0-4]');

Route::get('/weeklyproblems/{weekId}/{level}', function ($weekId, $level) {
    return redirect()->route('weeklyproblems_weeklevelnum', ['weekId' => $weekId, 'level' => $level, 'num' => 0]);
})->name('weeklyproblems_weeklevel');

Route::get('/weeklyproblems/{weekId}', function ($weekId) {
    return redirect()->route('weeklyproblems_weeklevel', ['weekId' => $weekId, 'level' => 1]);
})->name('weeklyproblems_week');

Route::get('/weeklyproblems', function () {


    function findClosestDate($currentDate, $dates) {
        $closestDate = null;
        $minDiff = PHP_INT_MAX;

        foreach ($dates as $date) {
            $diff = $currentDate->diffInDays(Carbon::parse($date), false);
            if ($diff >= 0 && $diff < $minDiff) {
                $minDiff = $diff;
                $closestDate = $date;
            }
        }

        return $closestDate;
    }

    // List of dates
    $dates = [
        "2018-12-17",
        "2018-12-10",
        "2018-12-03",
        "2018-11-26",
        "2018-11-19",
        "2018-11-12",
        "2018-11-05",
        "2018-10-29",
        "2018-10-22",
        "2018-10-15",
        "2018-10-08",
        "2018-10-01",
        "2018-09-24",
        "2018-09-17",
        "2018-09-10",
        "2018-09-03",
        "2018-08-27",
        "2018-08-20",
        "2018-08-13",
        "2018-08-06",
        "2018-07-30",
        "2018-07-23",
        "2018-07-16",
        "2018-07-09",
        "2018-07-02",
        "2018-06-25",
        "2018-06-18",
        "2018-06-11",
        "2018-06-04",
        "2018-05-28",
        "2018-05-21",
        "2018-05-14",
        "2018-05-07",
        "2018-04-30",
        "2018-04-23",
        "2018-04-16",
        "2018-04-09",
        "2018-04-02",
        "2018-03-26",
        "2018-03-19",
        "2018-03-12",
        "2018-03-05",
        "2018-02-26",
        "2018-02-19",
        "2018-02-12",
        "2018-02-05",
        "2018-01-29",
        "2018-01-22",
        "2018-01-15",
        "2018-01-08",
        "2018-01-01",
        "2017-12-18",
        "2017-12-11",
        "2017-12-04",
        "2017-11-27",
        "2017-11-20",
        "2017-11-13",
        "2017-11-06",
        "2017-10-30",
        "2017-10-23",
        "2017-10-16",
        "2017-10-09",
        "2017-10-02",
        "2017-09-25",
        "2017-09-18",
        "2017-09-11",
        "2017-09-04",
        "2017-08-28",
        "2017-08-21",
        "2017-08-14",
        "2017-08-07",
        "2017-07-31",
        "2017-07-24",
        "2017-07-17",
        "2017-07-10",
        "2017-07-03",
        "2017-06-26",
        "2017-06-19",
        "2017-06-12",
        "2017-06-05",
        "2017-05-29",
        "2017-05-22",
        "2017-05-15",
        "2017-05-08",
        "2017-05-01",
        "2017-04-24",
        "2017-04-17",
        "2017-04-10",
        "2017-04-03",
        "2017-03-27",
        "2017-03-20",
        "2017-03-13",
        "2017-03-06",
        "2017-02-27",
        "2017-02-20",
        "2017-02-13",
        "2017-02-06"
    ];



    // Attempt to find a best-match week within the potw archive range [2017-02-06, 2018-12-17]
    $currentDate = Carbon::now();
    $timeTravelYear = 2017 + ($currentDate->year % 2);
    $timeTravelDate = Carbon::parse($timeTravelYear . '-' . $currentDate->month . '-' . $currentDate->day);
    $startDate = Carbon::parse('2017-02-06');
    $endDate = Carbon::parse('2018-12-17');


    if ($currentDate->lt($startDate)) {
        // If current date is before the start date, use the last date
        $closestDate = end($dates);
    } elseif ($currentDate->gt($endDate)) {
        // If current date is after the end date, loop back to the start
        $closestDate = findClosestDate($currentDate, $dates);
    } else {
        // Find the closest date within the range
        $closestDate = findClosestDate($currentDate, $dates);
    }


    return redirect()->route('weeklyproblems_week', ['weekId' => "2018-12-17"]);
})->name('weeklyproblems');

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
            'uid' => $p->uid,
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


Route::get('/randomproblem', function() {
    $count = intval(Problem::count());
    $randomIdx = rand(1, $count);
    return redirect('/problem/' . $randomIdx);
})->name('randomproblem');

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
    Route::post('/report', [ReportController::class, 'store']);
    Route::post('/unreport', [ReportController::class, 'destroy']);
});


Route::get('/typesense/problems', function(){
    // FIXME: Find a better way than makeHidden all (we only want to return certain values since this is for search)
    return Problem::search('Test')->get()->makeHidden(['created_at','author_id','archive_id','discussion','body','level','solution','source','archive_meta','hidden','votes','points','coins','stars','updated_at']);
});


Route::get('/typesense/user', function(){
    // FIXME: Find a better way than makeHidden all (we only want to return certain values since this is for search)
    return User::search('Test')->get()->makeHidden(['created_at','email','email_verified_at','archive_id','status','role','badges','stars','coins','points','stars_awarded','age','location','avatar','blurb','created_at','updated_at']);
});

require __DIR__.'/auth.php';
