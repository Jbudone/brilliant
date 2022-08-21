<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

use App\Models\Problem;
use App\Models\Category;
use App\Models\Comment;
use App\Models\User;

class UpdateArchive extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'archive:update {--seed} {--discussion} {--batch=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update the database archived problem set (or discussions)';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    public static $users = [];
    public function init()
    {
        ini_set('memory_limit','256M');
        $users = [];
    }

    public static function addUser($user) {
        $userProfile = $user['profile'];
        if (array_key_exists($userProfile, UpdateArchive::$users)) {
            // FIXME: Check if updated (from current value in obj), and update if so
            $userId = UpdateArchive::$users[$userProfile];
            //echo "    existing id: $userId\n";
            return $userId;
        }

        // FIXME: We could be seeding discussions but already seeded problems and run into the same users
        $existingUser = User::where('archive_id', $user['id'])->first();
        if ($existingUser) {
            UpdateArchive::$users[$userProfile] = $existingUser->id;
            $userId = UpdateArchive::$users[$userProfile];
            return $userId;
        }

        if (!$user['id']) {
            echo "No archive user.id found\n";
            exit;
        }


        // FIXME: Can't use factory since we're may be running after there's already update, so possibly duplicate of email
        $userDoc = User::create([
            'name' => $user['name'], // FIXME: validation, escape?
            'archive_id' => $user['id'],
            'status' => 0,
            'email' => $user['profile'] . '@example.com',
            'email_verified_at' => now(),
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            'remember_token' => Str::random(10),
        ]);

        //$userDoc = \App\Models\User::factory()->state([
        //    'name' => $user['name'], // FIXME: validation, escape?
        //    'archive_id' => $user['id']
        //])->create();
        //$userDoc['name'] = $user['name'];
        //'profile' => $user['profile']

            /*
            if (isset($user['age'])) {
                $userDoc['age'] = intval($user['age']); // FIXME: validation
            }

            if (isset($user['location'])) {
                $userDoc['location'] = $user['location']; // FIXME: validation
            }
             */

        $userId = $userDoc->id;
        UpdateArchive::$users[$userProfile] = $userId;
        return $userId;
    }

    public static function updateUser($user) {
        $userProfile = $user['profile'];
        if (array_key_exists($userProfile, UpdateArchive::$users)) {
            // FIXME: Check if updated (from current value in obj), and update if so
            $userId = UpdateArchive::$users[$userProfile];
            return;
        }


        $userId = $user['id'];
        $userName = $user['name'];

        $userDoc = tap(User::where('archive_id', $userId))->update([
            'name' => $userName,
        ])->first();

        $userId = $userDoc->id;
        UpdateArchive::$users[$userProfile] = $userId;
        return $userId;
    }

    public static function addComment($comment, $problemId, $parentCommentId) {
        $body = $comment['body'];
        $commentId = $comment['id'];

        $author = $comment['author'];
        $authorId = UpdateArchive::addUser($author, UpdateArchive::$users);

        if (!$commentId) {
            echo "No archive comment.id found\n";
            exit;
        }

        $commentDoc = Comment::create([
            'author_id' => $authorId,
            'problem_id' => $problemId,
            'body' => $body,
            'parent_comment_id' => $parentCommentId,
            'archive_id' => $commentId
        ]);

        $replies = $comment['replies'];
        foreach ($replies as $replyIdx => &$reply) {
            UpdateArchive::addComment($reply, $problemId, $commentDoc->id);
        }

        return 1;
    }

    public static function updateComment($comment, $problemId, $parentCommentId) {
        $body = $comment['body'];
        $commentId = $comment['id'];

        $author = $comment['author'];
        $authorId = UpdateArchive::updateUser($author, UpdateArchive::$users);

        $commentDoc = tap(Comment::where('archive_id', $commentId))->update([
            'body' => $body,
        ])->first();

        $replies = $comment['replies'];
        foreach ($replies as $replyIdx => &$reply) {
            UpdateArchive::updateComment($reply, $problemId, $commentDoc->id);
        }
    }

    public static function addProblem($problem)
    {
        $source = $problem['source'];
        echo "$source\n";

        if (!$problem['id']) {
            echo "No archive problem.id found\n";
            exit;
        }

        $archiveId = $problem['id'];
        $questionBody = $problem['body'];
        $solutions = json_encode(['solutions' => $problem['answers']]);
        $body = strlen($solutions) . $solutions . $questionBody;

        $author = $problem['author'];
        $authorId = UpdateArchive::addUser($author);

        $problemDoc = Problem::create([
            'uid' => $problem['uid'],
            'title' => $problem['title'],
            'body' => $body,
            'category_id' => $problem['category'],
            'level' => $problem['level'],
            'author_id' => $authorId,
            'solution' => 0, // FIXME: Transport get solution idx
            'source' => $problem['source'],
            'archive_id' => $archiveId,
            'archive_meta' => "", // FIXME: Meta
            'discussion' => FALSE
        ]);


        // Comments discussion
        $discussions = $problem['discussions'];
        foreach ($discussions as $discussionIdx => &$discussion) {
            //$discussionReactions = $discussion['reactions'];
            $discussionAuthorId = UpdateArchive::addUser($discussion['author']);

            $discussionDoc = Comment::create([
                'author_id' => $discussionAuthorId,
                'problem_id' => $problemDoc->id,
                'body' => $discussion['body'],
                'parent_comment_id' => null,
                'archive_id' => $discussion['id']
            ]);

            $discussionComments = $discussion['comments'];
            foreach ($discussionComments as $commentIdx => &$comment) {
                UpdateArchive::addComment($comment, $problemDoc->id, $discussionDoc->id);
            }
        }
    }

    public function addDiscussion($problem)
    {
        $source = $problem['source'];
        echo "$source\n";


        $body = $problem['body'];

        $archiveId = $problem['id'] + 100000; // just under 100,000 problems, discussions go after
        $author = $problem['author'];
        $authorId = UpdateArchive::addUser($author);


        if (!$problem['id']) {
            echo "No archive discussion.id found\n";
            exit;
        }

        $problemDoc = Problem::create([
            'title' => $problem['title'],
            'body' => $body,
            'author_id' => $authorId,
            'source' => $problem['source'],
            'archive_id' => $archiveId,
            'archive_meta' => "", // FIXME: Meta
            'discussion' => TRUE
        ]);


        // Discussion
        $discussions = $problem['discussions'];
        foreach ($discussions as $discussionIdx => &$discussion) {
            //$discussionReactions = $discussion['reactions'];
            $discussionAuthorId = UpdateArchive::addUser($discussion['author']);

            $discussionDoc = Comment::create([
                'author_id' => $discussionAuthorId,
                'problem_id' => $problemDoc->id,
                'body' => $discussion['body'],
                'parent_comment_id' => null,
                'archive_id' => $discussion['id']
            ]);

            $discussionComments = $discussion['comments'];
            foreach ($discussionComments as $commentIdx => &$comment) {
                UpdateArchive::addComment($comment, $problemDoc->id, $discussionDoc->id);
            }
        }
    }

    public static function updateProblem($problem)
    {
        $problemId = $problem['id'];
        $source = $problem['source'];
        echo "$source\n";


        $uid = $problem['uid'];
        $category = $problem['category'];
        $level = $problem['level'];
        $title = $problem['title'];
        $questionBody = $problem['body'];
        $solutions = json_encode(['solutions' => $problem['answers']]);
        $body = strlen($solutions) . $solutions . $questionBody;
        $author = $problem['author'];
        $archiveMeta = $problem['meta'];

        $authorId = UpdateArchive::updateUser($author);

        $problemDoc = tap(Problem::where("archive_id", $problemId))->update([
            'uid' => $uid,
            'title' => $title,
            'body' => $body,
            'category_id' => $category,
            'level' => $level,
            'solution' => 0, // FIXME: Transport get solution idx
            'archive_meta' => $archiveMeta
        ])->first();

        if (!$problemDoc) {
            print "Could not find Problem::archive_id=$problemId\n";
            exit;
        }

        // Comment discussion
        $discussions = $problem['discussions'];
        foreach ($discussions as $discussionIdx => &$discussion) {
            $discussionId = $discussion['id'];
            $discussionAuthor = $discussion['author'];
            $discussionBody = $discussion['body'];
            $discussionReactions = $discussion['reactions'];

            $discussionAuthorId = UpdateArchive::updateUser($discussionAuthor);

            $discussionDoc = tap(Comment::where("archive_id", $discussionId))->update([
                'body' => $discussionBody,
            ])->first();

            $discussionComments = $discussion['comments'];
            foreach ($discussionComments as $commentIdx => &$comment) {
                UpdateArchive::updateComment($comment, $problemDoc->id, $discussionDoc->id);
            }
        }
    }

    public function updateDiscussion($problem)
    {
        $problemId = $problem['id'];
        $source = $problem['source'];
        echo "$source\n";


        $body = $problem['body'];

        $author = $problem['author'];
        $authorId = UpdateArchive::updateUser($author);

        $problemDoc = tap(Problem::where("archive_id", $problemId))->update([
            'title' => $problem['title'],
            'body' => $body,
            'archive_meta' => "", // FIXME: Meta
        ])->first();

        if (!$problemDoc) {
            print "Could not find Problem::archive_id=$problemId\n";
            exit;
        }


        // Discussion
        $discussions = $problem['discussions'];
        foreach ($discussions as $discussionIdx => &$discussion) {
            $discussionId = $discussion['id'];
            $discussionAuthor = $discussion['author'];
            $discussionBody = $discussion['body'];

            $discussionAuthorId = UpdateArchive::updateUser($discussion['author']);

            $discussionDoc = tap(Comment::where("archive_id", $discussionId))->update([
                'body' => $discussionBody,
            ])->first();

            $discussionComments = $discussion['comments'];
            foreach ($discussionComments as $commentIdx => &$comment) {
                UpdateArchive::updateComment($comment, $problemDoc->id, $discussionDoc->id);
            }
        }
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // Check that we're up to date on migrations first
        $migrationPath = database_path('migrations/');
        $migrationFiles = glob("$migrationPath/*.php");
        foreach ($migrationFiles as &$value) {
            $migrationId = basename($value, '.php');
            $hasRun = DB::table('migrations')->where('migration', $migrationId)->exists();
            if (!$hasRun) {
                echo "Error: You aren't up to date on migrations;  `php artisan migrate:status`\n";
                echo "Missing migration: $migrationId\n";
                return -1;
            }
        }

        $seed = $this->option('seed');
        $singleBatchIdx = $this->option('batch');

        ini_set('memory_limit','256M');

        if ($this->option('discussion')) {
            $this->info("Updating discussion");

            $jsonMasterStr = file_get_contents("./brilliant.parsed/master.discussions.json");
            $jsonMaster = json_decode($jsonMasterStr);

            $problemBatchList = $jsonMaster->processed;

            if ($seed) {
                echo "Deleting existing discussions";
                Problem::where('discussion', TRUE)->delete();
            }

            foreach ($problemBatchList as $idx => &$problemBatch) {
                if ($singleBatchIdx != null && $singleBatchIdx != $idx) continue;

                $jsonFile = $problemBatch->transportedList;
                echo "Loading batch: $jsonFile\n";

                // Seed from json file
                $jsonStr = file_get_contents($jsonFile);
                $json = json_decode($jsonStr, true);

                // Problems
                foreach ($json as $key => &$val) {
                    $discussion = $val;

                    if ($seed) {
                        UpdateArchive::addDiscussion($discussion);
                    } else {
                        UpdateArchive::updateDiscussion($discussion);
                    }
                }
            }

        } else {
            $this->info("Updating problems");

            $jsonMasterStr = file_get_contents("./brilliant.parsed/master.problems.json");
            $jsonMaster = json_decode($jsonMasterStr);

            $problemBatchList = $jsonMaster->processed;

            if ($seed) {
                echo "Deleting existing problems";
                Problem::where('discussion', FALSE)->delete();
            }

            foreach ($problemBatchList as $idx => &$problemBatch) {
                if ($singleBatchIdx && $singleBatchIdx != $idx) continue;

                $jsonFile = $problemBatch->transportedList;
                echo "Loading batch: $jsonFile\n";

                // Seed from json file
                $jsonStr = file_get_contents($jsonFile);
                $json = json_decode($jsonStr, true);

                // Problems
                foreach ($json as $key => &$val) {
                    $problem = $val;

                    if ($seed) {
                        UpdateArchive::addProblem($problem);
                    } else {
                        UpdateArchive::updateProblem($problem);
                    }
                }
            }
        }

        $users = []; // Unset so GC can tackle
        return 0;
    }
}
