<?php

namespace App\Modules\Pricing\Controllers;

use App\Helpers\SeoHelper;
use App\Http\Controllers\Controller;
use App\Modules\Pricing\Services\PricingService;
use App\Services\PageSeoService;
use Illuminate\View\View;

class PricingController extends Controller
{
    public function __construct(
        private readonly PricingService $service,
        private readonly PageSeoService $pageSeo,
    ) {}

    public function __invoke(string $locale): View
    {
        $breadcrumbs = [
            ['name' => __('site.nav.home'), 'url' => route('home', compact('locale'))],
            ['name' => __('site.nav.pricing'), 'url' => route('pricing', compact('locale'))],
        ];

        return view('pages.pricing', [
            'packages' => $this->service->packages(),
            'seo' => $this->pageSeo->forPage('pricing', [
                'title' => __('site.pricing.meta_title'),
                'description' => __('site.pricing.meta_description'),
                'canonical' => route('pricing', compact('locale')),
                'breadcrumbs' => $breadcrumbs,
                'schema' => [SeoHelper::breadcrumbSchema($breadcrumbs)],
            ]),
        ]);
    }
}
