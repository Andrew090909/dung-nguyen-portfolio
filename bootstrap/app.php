<?php

use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(SecurityHeaders::class);
        $middleware->alias([
            'locale' => SetLocale::class,
            'role' => EnsureRole::class,
        ]);
        $middleware->validateCsrfTokens(except: []);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->report(function (Throwable $exception): void {
            Log::error('Unhandled application exception', [
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
                'url' => request()?->fullUrl(),
                'user_id' => auth()->id(),
            ]);
        });

        $exceptions->render(function (Throwable $exception, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => app()->isProduction()
                        ? 'An unexpected error occurred.'
                        : $exception->getMessage(),
                ], 500);
            }

            return null;
        });
    })->create();
