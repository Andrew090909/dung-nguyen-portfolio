<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');

        $connectSources = app()->isLocal() ? "'self' ws: http://localhost:*" : "'self'";
        $upgradeDirective = app()->isProduction() ? '; upgrade-insecure-requests' : '';
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src {$connectSources}; object-src 'none'{$upgradeDirective}",
        );

        if (app()->isProduction() && $request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // Only cache pages that have neither a form token nor session-dependent content.
        if ($request->isMethod('GET') && $request->routeIs('home', 'pricing', 'insights.*')) {
            $response->headers->set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
        } else {
            $response->headers->set('Cache-Control', 'private, no-store');
        }

        return $response;
    }
}
