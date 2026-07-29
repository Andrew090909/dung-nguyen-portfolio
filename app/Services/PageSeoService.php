<?php

namespace App\Services;

use App\Helpers\SeoHelper;
use App\Models\Page;
use App\Models\SeoMeta;
use Illuminate\Support\Facades\Cache;

class PageSeoService
{
    /**
     * Merge editable SEO metadata from Admin into safe controller defaults.
     *
     * @param  array<string, mixed>  $defaults
     * @return array<string, mixed>
     */
    public function forPage(string $pageKey, array $defaults): array
    {
        $page = Cache::remember(
            "page-seo:{$pageKey}",
            now()->addMinutes(30),
            static fn (): ?Page => Page::query()->with('seo')->where('key', $pageKey)->first(),
        );

        return $this->merge($page?->seo, $defaults);
    }

    /**
     * @param  array<string, mixed>  $defaults
     * @return array<string, mixed>
     */
    public function merge(?SeoMeta $meta, array $defaults): array
    {
        if (! $meta) {
            return SeoHelper::make($defaults);
        }

        $adminSchema = is_array($meta->schema) ? $meta->schema : [];
        if (isset($adminSchema['@context']) || isset($adminSchema['@type'])) {
            $adminSchema = [$adminSchema];
        }
        $defaultSchema = is_array($defaults['schema'] ?? null) ? $defaults['schema'] : [];

        return SeoHelper::make([
            ...$defaults,
            'title' => localized($meta->meta_title) ?: ($defaults['title'] ?? null),
            'description' => localized($meta->meta_description) ?: ($defaults['description'] ?? null),
            'canonical' => $meta->canonical_url ?: ($defaults['canonical'] ?? null),
            'image' => $meta->og_image ?: ($defaults['image'] ?? null),
            'og_title' => localized($meta->og_title) ?: ($defaults['og_title'] ?? null),
            'og_description' => localized($meta->og_description) ?: ($defaults['og_description'] ?? null),
            'twitter_card' => $meta->twitter_card ?: ($defaults['twitter_card'] ?? 'summary_large_image'),
            'robots' => $meta->robots ?: ($defaults['robots'] ?? null),
            'schema' => [...$defaultSchema, ...$adminSchema],
        ]);
    }
}
