<?php

namespace App\Modules\Portfolio\Controllers;

use App\Helpers\SeoHelper;
use App\Http\Controllers\Controller;
use App\Modules\Portfolio\Requests\UnlockPortfolioRequest;
use App\Modules\Portfolio\Services\PortfolioService;
use App\Services\PageSeoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class PortfolioController extends Controller
{
    public function __construct(
        private readonly PortfolioService $service,
        private readonly PageSeoService $pageSeo,
    ) {}

    public function index(string $locale): View
    {
        $breadcrumbs = [
            ['name' => __('site.nav.home'), 'url' => route('home', compact('locale'))],
            ['name' => __('site.nav.portfolio'), 'url' => route('portfolio.index', compact('locale'))],
        ];

        return view('pages.portfolio.index', [
            'projects' => $this->service->isUnlocked() ? $this->service->projects() : collect(),
            'unlocked' => $this->service->isUnlocked(),
            'seo' => $this->pageSeo->forPage('portfolio', [
                'title' => __('site.portfolio.meta_title'),
                'description' => __('site.portfolio.meta_description'),
                'canonical' => route('portfolio.index', compact('locale')),
                'breadcrumbs' => $breadcrumbs,
                'schema' => [SeoHelper::breadcrumbSchema($breadcrumbs)],
            ]),
        ]);
    }

    public function unlock(UnlockPortfolioRequest $request, string $locale): RedirectResponse
    {
        if (! $this->service->unlock((string) $request->validated('password'))) {
            return back()->withErrors(['password' => __('site.portfolio.invalid_password')])->withInput();
        }

        return redirect()->route('portfolio.index', compact('locale'))->with('status', __('site.portfolio.unlocked'));
    }

    public function show(string $locale, string $slug): View
    {
        abort_unless($this->service->isUnlocked(), 403);
        $project = $this->service->project($slug);
        $breadcrumbs = [
            ['name' => __('site.nav.home'), 'url' => route('home', compact('locale'))],
            ['name' => __('site.nav.portfolio'), 'url' => route('portfolio.index', compact('locale'))],
            ['name' => localized($project->title), 'url' => route('portfolio.show', compact('locale', 'slug'))],
        ];

        return view('pages.portfolio.show', [
            'project' => $project,
            'seo' => SeoHelper::make([
                'title' => localized($project->title).' — Dũng Nguyễn',
                'description' => localized($project->context),
                'canonical' => route('portfolio.show', compact('locale', 'slug')),
                'robots' => 'noindex,nofollow,noarchive',
                'image' => asset('images/portfolio/'.($project->images[0] ?? 'portfolio-placeholder.webp')),
                'breadcrumbs' => $breadcrumbs,
                'schema' => [SeoHelper::breadcrumbSchema($breadcrumbs)],
            ]),
        ]);
    }
}
