<?php

namespace App\Modules\Insight\Controllers;

use App\Helpers\SeoHelper;
use App\Http\Controllers\Controller;
use App\Modules\Insight\Services\InsightService;
use App\Services\PageSeoService;
use Illuminate\View\View;

class InsightController extends Controller
{
    public function __construct(
        private readonly InsightService $service,
        private readonly PageSeoService $pageSeo,
    ) {}

    public function index(string $locale): View
    {
        $breadcrumbs = [
            ['name' => __('site.nav.home'), 'url' => route('home', compact('locale'))],
            ['name' => __('site.nav.insights'), 'url' => route('insights.index', compact('locale'))],
        ];

        return view('pages.insights.index', [
            'posts' => $this->service->paginate(),
            'seo' => $this->pageSeo->forPage('insights', [
                'title' => __('site.insights.meta_title'),
                'description' => __('site.insights.meta_description'),
                'canonical' => route('insights.index', compact('locale')),
                'breadcrumbs' => $breadcrumbs,
                'schema' => [SeoHelper::breadcrumbSchema($breadcrumbs)],
            ]),
        ]);
    }

    public function show(string $locale, string $slug): View
    {
        $post = $this->service->post($slug);
        $breadcrumbs = [
            ['name' => __('site.nav.home'), 'url' => route('home', compact('locale'))],
            ['name' => __('site.nav.insights'), 'url' => route('insights.index', compact('locale'))],
            ['name' => localized($post->title), 'url' => route('insights.show', compact('locale', 'slug'))],
        ];

        return view('pages.insights.show', [
            'post' => $post,
            'seo' => $this->pageSeo->merge($post->seo, [
                'title' => localized($post->seo?->meta_title) ?: localized($post->title),
                'description' => localized($post->seo?->meta_description) ?: localized($post->excerpt),
                'canonical' => $post->seo?->canonical_url ?: route('insights.show', compact('locale', 'slug')),
                'image' => $post->seo?->og_image ?: asset($post->cover_image),
                'type' => 'article',
                'breadcrumbs' => $breadcrumbs,
                'schema' => [
                    SeoHelper::breadcrumbSchema($breadcrumbs),
                    [
                        '@context' => 'https://schema.org',
                        '@type' => 'Article',
                        'headline' => localized($post->title),
                        'description' => localized($post->excerpt),
                        'image' => [asset($post->cover_image)],
                        'datePublished' => $post->published_at?->toAtomString(),
                        'dateModified' => $post->updated_at?->toAtomString(),
                        'author' => ['@type' => 'Person', 'name' => $post->author?->name ?? 'Dũng Nguyễn'],
                        'publisher' => ['@type' => 'Person', 'name' => 'Dũng Nguyễn'],
                    ],
                ],
            ]),
        ]);
    }
}
