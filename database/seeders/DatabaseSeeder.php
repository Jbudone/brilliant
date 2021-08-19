<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\Problem;
use App\Models\Category;
use App\Models\Comment;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        //Problem::truncate();
        //Category::truncate();
        \App\Models\User::factory(10)->create();

        $TEST_ONE_BATCH = null;


        $algebra = Category::create([ 'name' => 'Algebra' ]);
        $geometry = Category::create([ 'name' => "Geometry" ]);
        $numberTheory = Category::create([ 'name' => "Number Theory" ]);
        $calculus = Category::create([ 'name' => "Calculus" ]);
        $logic = Category::create([ 'name' => "Logic" ]);
        Category::create([ 'name' => "Classical Mechanics" ]);
        Category::create([ 'name' => "Electricity and Magnetism" ]);
        Category::create([ 'name' => "Computer Science" ]);
        Category::create([ 'name' => "Quantitative Finance" ]);
        Category::create([ 'name' => "Chemistry" ]);
        Category::create([ 'name' => "Biology" ]);
        Category::create([ 'name' => "Probability" ]);
        Category::create([ 'name' => "Basic Mathematics" ]);
        Category::create([ 'name' => "SAT® Math" ]);


        /*
        $solutions = json_encode(['solutions' => [['correct' => 1, 'text' => 'True'], ['text' => 'False']]]);
        $problem = Problem::create([
            'title' => "0.9 = 1",
            'body' => strlen($solutions) . $solutions . "0.9999999 (keeps on going for ever, recurring) is equal to 1.",
            'category_id' => $algebra->id,
            'level' => 1,
            'author_id' => 1,
            'solution' => 0
        ]);

        $comment = Comment::create([
            'author_id' => 2,
            'problem_id' => $problem->id,
            'body' => "\dfrac {1}{9} = 0.11111.........\n1 =9\times (0.11111......) = 0.9999.......\n0.9999.......=1\nANSWER:\boxed {TRUE}",
        ]);

        Comment::create([
            'author_id' => 3,
            'problem_id' => $problem->id,
            'body' => "x=0.9999...\n10x=9.9999...\n9x=9",
            'parent_comment_id' => $comment->id
        ]);



        $solutions = json_encode(['solutions' => [['correct' => 1, 'text' => '>'], ['text' => '<'], ['text' => '=']]]);
        $problem = Problem::create([
            'title' => "Roots Always Become Smaller, Right?",
            'body' => strlen($solutions) . $solutions . "Which of the following mathematical symbol should we place in the box below to make the following statement true?\n \large \sqrt{0.99} \; \Box \; 0.99 ",
            'category_id' => $algebra->id,
            'level' => 1,
            'author_id' => 1,
            'solution' => 0
        ]);

        $comment = Comment::create([
            'author_id' => 2,
            'problem_id' => $problem->id,
            'body' => "For positive values xx with the range x > 1x>1:\n \sqrt{x} < x\n Eg. x=4,\;\sqrt{4}=2,\;2<4x=4, \n For positive values xx with the range 0 < x < 10<x<1:\n \sqrt{x} > {x}\n Eg. x=0.01,\;\sqrt{0.01} = 0.1,\; 0.1 > 0.01x=0.01, \n 0.990.99 falls into the second category, therefore \sqrt{0.99}\; \boxed{>} \,0.99 \n >"
        ]);

        $comment = Comment::create([
            'author_id' => 3,
            'problem_id' => $problem->id,
            'body' => "Perfect, beautiful solution +1 :-)",
            'parent_comment_id' => $comment->id
        ]);

        Comment::create([
            'author_id' => 2,
            'problem_id' => $problem->id,
            'body' => "Thanks!",
            'parent_comment_id' => $comment->id
        ]);
*/

        // FIXME: Unsure if there's a better way to do this, but users cache adds up and bursts at 130mb
        ini_set('memory_limit','256M');
        $users = [];

        function addUser($user, &$users) {
            //echo "    AddUser: '" . $user['name'] . "'\n";


            // {"profile":"https://brilliant.org/profile/anubhav-ztron7/","name":"Anubhav Jain","age":40,"location":"India"}
            // {"avatar":"../../brioche/avatars-2/resized/45/0a1a51a5f35d416e94e432d77f28b0ae.68411d626d-i7YKfyq5cI.jpg?width=45","profile":"https://brilliant.org/profile/nihar-pd4fyq/","name":"Nihar Mahajan"}
            $userProfile = $user['profile'];
            if (array_key_exists($userProfile, $users)) {
                $userId = $users[$userProfile]->id;
                //echo "    existing id: $userId\n";
                return $userId;
            }

            //$userDoc = \App\Models\User::factory()->make();
            $userDoc = \App\Models\User::factory()->state([
                'name' => $user['name'] // FIXME: validation, escape?
            ])->create();
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

            //ddd($userDoc);
            //$userId = $userDoc->create();
            $userId = $userDoc->id;
            $users[$userProfile] = $userDoc;
            //echo "    id: $userId\n";
            return $userId;
        }

        function addComment($comment, $problemId, $parentCommentId, &$users) {
            //echo "AddComment\n";
            $body = $comment['body'];
            $commentId = $comment['id'];
            //echo "  id: $commentId\n";

            $author = $comment['author'];
            $authorId = addUser($author, $users);




            $commentDoc = Comment::create([
                'author_id' => $authorId,
                'problem_id' => $problemId,
                'body' => $body,
                'parent_comment_id' => $parentCommentId
            ]);

            //echo "  Author: $authorId\n";

            $replies = $comment['replies'];
            foreach ($replies as $replyIdx => &$reply) {
                //$replyAuthor = $reply['author'];
                //$replyBody = $reply['body'];

                //$replyAuthorId = addUser($replyAuthor, $users);
                addComment($reply, $problemId, $commentDoc->id, $users);
            }

            return 1;
        }


        // Master list
        $jsonMasterStr = file_get_contents("./brilliant.parsed/problems.json");
        $jsonMaster = json_decode($jsonMasterStr);

//{"versionParse":0,"versionTransport":0,"batchIdx":0,"parsedList":"./brilliant.parsed/brilliant.parsed-0.json","transportedList":"./brilliant.parsed/brilliant.local-0.json"}
        $problemBatchList = $jsonMaster->processed;
        foreach ($problemBatchList as $idx => &$problemBatch) {
            if ($TEST_ONE_BATCH != null && $idx != $TEST_ONE_BATCH) continue;

            $jsonFile = $problemBatch->transportedList;
            echo "Loading batch: $jsonFile\n";

            // Seed from json file
            $jsonStr = file_get_contents($jsonFile);
            $json = json_decode($jsonStr, true);


            // Problems
            foreach ($json as $key => &$val) {
                $problem = $val;

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

                $authorId = addUser($author, $users);

                $problemDoc = Problem::create([
                    'title' => $title,
                    'body' => $body,
                    'category_id' => $category,
                    'level' => 1, // FIXME: Transport level -> levelId
                    'author_id' => $authorId,
                    'solution' => 0, // FIXME: Transport get solution idx
                    'source' => $source
                ]);


                // Discussion
                $discussions = $problem['discussion'];
                foreach ($discussions as $discussionIdx => &$discussion) {
                    $discussionAuthor = $discussion['author'];
                    $discussionBody = $discussion['body'];
                    $discussionReactions = $discussion['reactions'];

                    $discussionAuthorId = addUser($discussionAuthor, $users);

                    $discussionDoc = Comment::create([
                        'author_id' => $discussionAuthorId,
                        'problem_id' => $problemDoc->id,
                        'body' => $discussionBody,
                        'parent_comment_id' => null
                    ]);

                    $discussionComments = $discussion['comments'];
                    foreach ($discussionComments as $commentIdx => &$comment) {
                        addComment($comment, $problemDoc->id, $discussionDoc->id, $users);
                    }

                }


            }
        }
    }
}
