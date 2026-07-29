<?php

namespace App\Providers;

use App\Models\Post;
use App\Observers\PostObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Application services are bound by RepositoryServiceProvider.
    }

    public function boot(): void
    {
        Post::observe(PostObserver::class);
        Paginator::useBootstrapFive();

        RateLimiter::for('contact', static fn (Request $request): Limit => Limit::perHour(5)->by($request->ip()));
        RateLimiter::for('portfolio', static fn (Request $request): Limit => Limit::perMinute(6)->by($request->ip()));
        RateLimiter::for('login', static fn (Request $request): Limit => Limit::perMinute(5)->by(Str::lower((string) $request->input('email')).'|'.$request->ip()));
    }
}
