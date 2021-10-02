<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
        //Gate::define('update-post', function (User $user, Post $post) {
        //    return $user->id === $post->author_id;
        //});

        Gate::define('admin', function($user) {
            return($user->role === "admin");
        });

        Gate::define('moderate', function($user) {
            return($user->role === "admin" || $user->role === "moderator");
        });

        Gate::define('poweruser', function($user) {
            return($user->role === "admin" || $user->role === "moderator" || $user->role === "poweruser");
        });

        Gate::define('normaluser', function($user) {
            return($user->role === "admin" || $user->role === "moderator" || $user->role === "poweruser" || $user->role === "normaluser");
        });

        Gate::define('basicuser', function($user) {
            return($user->role === "admin" || $user->role === "moderator" || $user->role === "poweruser" || $user->role === "normaluser" || $user->role === "basicuser");
        });
    }
}
