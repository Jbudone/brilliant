<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Typesense\Client;

class Typesense extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'typesense:run {--create} {--seed}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {

        // scout:flush
        // scout:import
        //Artisan::call('scout:flush App\\\\Models\\\\Problem');
        //dump(trim(Artisan::output()));

        //Artisan::call('scout:flush App\\\\Models\\\\User');
        //dump(trim(Artisan::output()));

        //Artisan::call('scout:import App\\\\Models\\\\User');
        //dump(trim(Artisan::output()));

        //Artisan::call('scout:import App\\\\Models\\\\Problem');
        //dump(trim(Artisan::output()));
        //dd(Artisan::output());
        //$this->call('scout:flush', ['App\Models\Problem']);//, 'App\\Models\\User']);
        //$this->call('scout:import', ['App\Models\Problem']);//, 'App\\Models\\User']);

        // FIXME: run this step automatically and store api key in config for client

        $client = new Client(config('scout.typesense'));

        $key = $client->keys->create([
            'description' => 'User readonly key',
            'collections' => ['*'],
            'actions' => ['documents:search'],
            'collections' => ['title']
        ]);
        var_dump($key);


        return 0;
    }
}
