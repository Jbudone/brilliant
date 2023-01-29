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

        $client = new Client(config('scout.typesense'));


        // Check for our existing Typesense client key
        $expectedKey = env('TYPESENSE_CLIENT_KEY', '');
        $res = $client->keys->retrieve();
        $keys = $res['keys'];
        $foundKey = false;
        if (count($keys) > 0)
        {
            for ($i = 0; $i < count($keys); ++$i)
            {
                $keyPrefix = $keys[$i]['value_prefix'];
                $prefixLen = strlen($keyPrefix);
                if (strncmp($expectedKey, $keyPrefix, $prefixLen) == 0)
                {
                    print($expectedKey . " == " . $keyPrefix . "  [" . $prefixLen . "]\n");
                    $foundKey = true;
                    break;
                }
                else
                {
                    print($expectedKey . " != " . $keyPrefix . "  [" . $prefixLen . "]\n");
                }
            }
        }

        // Create Typesense client key if needed
        if ($foundKey)
        {
            print("Environment key exists on Typesense server.. no need to create a new one\n");
        }
        else
        {
            print("Environment key does not exist on Typesense server\n");
            print("Need to create a new key and update environment\n");

            $createResults = $client->keys->create([
                'description' => 'User readonly key',
                'collections' => ['*'],
                'actions' => ['documents:search'],
                'collections' => ['title']
            ]);

            if
            (
                !$createResults ||
                !is_array($createResults) ||
                !array_key_exists('value', $createResults) ||
                !is_string($createResults['value']) ||
                strlen($createResults['value']) != 32
            )
            {
                print("Error creating key!\n");
                var_dump($createResults);
                exit;
            }

            $key = $createResults['value'];
            print("Created key: " . $key . "\n");

            $envPath = app()->environmentFilePath();
            $envKey = 'TYPESENSE_CLIENT_KEY';
            $envVal = env('TYPESENSE_CLIENT_KEY', '');
            print("Updating Environment key: " . $envPath . "\n");
            print("Replacing\n");
            print("    " . $envKey . "=" . $envVal . "\n");
            print("With\n");
            print("    " . $envKey . "=" . $key . "\n");
            $result = file_put_contents($envPath, str_replace(
                $envKey . '=' . $envVal,
                $envKey . '=' . $key,
                file_get_contents($envPath)
            ));

            if ($result === FALSE)
            {
                print("Error updating env with new key!\n");
                var_dump($result);
                exit;
            }
        }

        // Import
        print("Importing Typesense through Scout\n");
        $this->call('scout:import', [
            "model" => "\\App\\Models\\Problem"
        ]);

        return 0;
    }
}
