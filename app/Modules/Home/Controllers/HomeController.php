<?php

namespace App\Modules\Home\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Home\Services\HomeService;
use App\Services\PageSeoService;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function __construct(
        private readonly HomeService $service,
        private readonly PageSeoService $pageSeo,
    ) {}

    public function __invoke(string $locale): View
    {
        return view('pages.home', [
            ...$this->service->data($locale),
            'seo' => $this->pageSeo->forPage('home', [
                'title' => __('site.home.meta_title'),
                'description' => __('site.home.meta_description'),
                'canonical' => route('home', ['locale' => $locale]),
                'schema' => [[
                    '@context' => 'https://schema.org',
                    '@type' => 'Person',
                    'name' => 'Dũng Nguyễn',
                    'jobTitle' => 'Commercial Growth Architect',
                    'url' => route('home', ['locale' => $locale]),
                    'knowsAbout' => ['Commercial strategy', 'Marketing systems', 'AI', 'CRM', 'Growth marketing'],
                ]],
            ]),
        ]);
    }
}
