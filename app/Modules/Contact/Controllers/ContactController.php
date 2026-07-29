<?php

namespace App\Modules\Contact\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Contact\Requests\StoreContactRequest;
use App\Modules\Contact\Services\ContactService;
use App\Services\PageSeoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ContactController extends Controller
{
    public function __construct(
        private readonly ContactService $service,
        private readonly PageSeoService $pageSeo,
    ) {}

    public function index(string $locale): View
    {
        $breadcrumbs = [
            ['name' => __('site.nav.home'), 'url' => route('home', compact('locale'))],
            ['name' => __('site.nav.contact'), 'url' => route('contact.index', compact('locale'))],
        ];

        return view('pages.contact', [
            'seo' => $this->pageSeo->forPage('contact', [
                'title' => __('site.contact.meta_title'),
                'description' => __('site.contact.meta_description'),
                'canonical' => route('contact.index', compact('locale')),
                'breadcrumbs' => $breadcrumbs,
                'schema' => [SeoHelper::breadcrumbSchema($breadcrumbs)],
            ]),
        ]);
    }

    public function store(StoreContactRequest $request, string $locale): RedirectResponse
    {
        $data = $request->safe()->except('website');
        $this->service->submit($data, $request);

        return redirect()->route('contact.index', compact('locale'))->with('status', __('site.contact.success'));
    }
}
