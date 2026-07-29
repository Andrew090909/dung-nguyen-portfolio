<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /** @var list<string> */
    private const SUPPORTED = ['vi', 'en', 'zh'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = (string) $request->route('locale', config('app.locale'));

        abort_unless(in_array($locale, self::SUPPORTED, true), 404);

        app()->setLocale($locale);
        view()->share('currentLocale', $locale);
        view()->share('supportedLocales', self::SUPPORTED);

        return $next($request);
    }
}
