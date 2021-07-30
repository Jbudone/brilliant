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


        $solutions = json_encode(['solutions' => [['correct' => 1, 'text' => 'True'], ['text' => 'False']]]);
        $problem = Problem::create([
            'title' => "0.9 = 1",
            'body' => strlen($solutions) . $solutions . "0.9999999 (keeps on going for ever, recurring) is equal to 1.",
            'category_id' => $algebra->id,
            'level' => 1,
            'author_id' => 1,
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
    }
}
