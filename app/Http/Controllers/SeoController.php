<?php

namespace App\Http\Controllers;

use App\Services\SitemapService;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function sitemap(SitemapService $service): Response
    {
        return response()
            ->view('seo.sitemap', ['urls' => $service->urls()])
            ->header('Content-Type', 'application/xml; charset=UTF-8')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    public function robots(): Response
    {
        $content = "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /*/portfolio/*\nSitemap: ".route('sitemap')."\n";

        return response($content, 200)->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
