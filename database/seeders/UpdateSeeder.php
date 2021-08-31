<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\Problem;
use App\Models\Category;
use App\Models\Comment;
use App\Models\User;

class UpdateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        if
        (
            Category::count() == 0 ||
            User::count() == 0 ||
            Problem::count() == 0 ||
            Comment::count() == 0
        )
        {
            echo "Fresh run -- skipping update\n";
            return;
        }


        ini_set('memory_limit','256M');
        $users = [];
        
        function addUser($user, &$users) {
            //echo "    AddUser: '" . $user['name'] . "'\n";


            // {"profile":"https://brilliant.org/profile/anubhav-ztron7/","name":"Anubhav Jain","age":40,"location":"India"}
            // {"avatar":"../../brioche/avatars-2/resized/45/0a1a51a5f35d416e94e432d77f28b0ae.68411d626d-i7YKfyq5cI.jpg?width=45","profile":"https://brilliant.org/profile/nihar-pd4fyq/","name":"Nihar Mahajan"}
            $userProfile = $user['profile'];
            if (array_key_exists($userProfile, $users)) {
                // FIXME: Check if updated (from current value in obj), and update if so
                $userId = $users[$userProfile]->id;
                return;
            }


            $userId = $user['id'];
            $userName = $user['name'];

            $userDoc = tap(User::where('archive_id', $userId))->update([
                'name' => $userName,
            ])->first();

            $users[$userProfile] = $userDoc;
            return $userDoc->id;


            //$userDoc = \App\Models\User::factory()->make();
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
        }

        function addComment($comment, $problemId, $parentCommentId, &$users) {
            $body = $comment['body'];
            $commentId = $comment['id'];

            $author = $comment['author'];
            $authorId = addUser($author, $users);

            $commentDoc = tap(Comment::where('archive_id', $commentId))->update([
                //'author_id' => $authorId,
                //'problem_id' => $problemId,
                'body' => $body,
                //'parent_comment_id' => $parentCommentId,
            ])->first();

            $replies = $comment['replies'];
            foreach ($replies as $replyIdx => &$reply) {
                addComment($reply, $problemId, $commentDoc->id, $users);
            }
        }


        // Master list
        $jsonMasterStr = file_get_contents("./brilliant.parsed/problems.json");
        $jsonMaster = json_decode($jsonMasterStr);

//{"versionParse":0,"versionTransport":0,"batchIdx":0,"parsedList":"./brilliant.parsed/brilliant.parsed-0.json","transportedList":"./brilliant.parsed/brilliant.local-0.json"}
        $problemBatchList = $jsonMaster->processed;
        foreach ($problemBatchList as $idx => &$problemBatch) {

            $jsonFile = $problemBatch->transportedList;
            echo "Loading batch: $jsonFile\n";

            // Seed from json file
            $jsonStr = file_get_contents($jsonFile);
            $json = json_decode($jsonStr, true);

            // Problems
            foreach ($json as $key => &$val) {
                $problem = $val;

                $problemId = $problem['id'];
                $source = $problem['source'];
                echo "$source\n";

                $category = $problem['category'];
                $level = $problem['level'];
                $title = $problem['title'];
                $questionBody = $problem['body'];
    // $solutions = json_encode(['solutions' => [['correct' => 1, 'text' => 'True'], ['text' => 'False']]]);
                $solutions = json_encode(['solutions' => $problem['answers']]);
                $body = strlen($solutions) . $solutions . $questionBody;

                $author = $problem['author'];
                addUser($author, $users);

                $problemDoc = tap(Problem::where("archive_id", $problemId))->update([
                    'title' => $title,
                    'body' => $body,
                    'category_id' => $category,
                    'level' => 1, // FIXME: Transport level -> levelId
                    //'author_id' => $authorId,
                    'solution' => 0, // FIXME: Transport get solution idx
                    //'source' => $source
                ])->first();


                // Discussion
                $discussions = $problem['discussions'];
                foreach ($discussions as $discussionIdx => &$discussion) {
                    $discussionId = $discussion['id'];
                    $discussionBody = $discussion['body'];
                    $discussionReactions = $discussion['reactions'];

                    $discussionAuthor = $discussion['author'];
                    addUser($discussionAuthor, $users);

                    $discussionDoc = tap(Comment::where("archive_id", $discussionId))->update([
                        //'author_id' => $discussionAuthorId,
                        //'problem_id' => $problemDoc->id,
                        'body' => $discussionBody,
                        //'parent_comment_id' => null
                    ])->first();

                    $discussionComments = $discussion['comments'];
                    foreach ($discussionComments as $commentIdx => &$comment) {
                        addComment($comment, $problemDoc->id, $discussionDoc->id, $users);
                    }

                }
            }
        }
    }
}
