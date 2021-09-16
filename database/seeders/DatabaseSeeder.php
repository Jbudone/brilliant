<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\Problem;
use App\Models\Category;
use App\Models\Comment;
use App\Models\User;

use Illuminate\Support\Facades\Artisan;

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

        // FIXME: Default user for easy login


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


        // Run command for fresh seed
        Artisan::call('archive:update --seed');
    }
}

