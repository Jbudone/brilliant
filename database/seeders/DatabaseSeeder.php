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
        \App\Models\User::factory(10)->create();

        // FIXME: Default user for easy login


        Category::create([ 'name' => 'Algebra' ]);
        Category::create([ 'name' => "Geometry" ]);
        Category::create([ 'name' => "Number Theory" ]);
        Category::create([ 'name' => "Calculus" ]);
        Category::create([ 'name' => "Logic" ]);
        Category::create([ 'name' => "Classical Mechanics" ]);
        Category::create([ 'name' => "Relativistic Mechanics" ]);
        Category::create([ 'name' => "Electricity and Magnetism" ]);
        Category::create([ 'name' => "Computer Science" ]);
        Category::create([ 'name' => "Quantitative Finance" ]);
        Category::create([ 'name' => "Chemistry" ]);
        Category::create([ 'name' => "Biology" ]);
        Category::create([ 'name' => "Probability" ]);
        Category::create([ 'name' => "Basic Mathematics" ]);
        Category::create([ 'name' => "Contest Math" ]);
        Category::create([ 'name' => "Multi-topic" ]);
        Category::create([ 'name' => "Others" ]);


        // Run command for fresh seed
        Artisan::call('archive:update --seed');
        gc_collect_cycles(); // Force garbage collector
        Artisan::call('archive:update --seed --discussion');
    }
}

