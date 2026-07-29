<?php

namespace App\Helpers;

use Illuminate\Support\Str;

final class SeoHelper
{
    /**
     * Normalize an SEO payload for the Blade SEO component.
     *
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    public static function make(array $overrides = []): array
    {
        $defaults = [
            'title' => config('app.name'),
            'description' => __('site.seo.default_description'),
            'canonical' => url()->current(),
            'image' => asset('images/og/og-v11.webp'),
            'type' => 'website',
            'og_title' => null,
            'og_description' => null,
            'twitter_card' => 'summary_large_image',
            'robots' => 'index,follow,max-image-preview:large',
            'schema' => [],
            'breadcrumbs' => [],
            'alternates' => alternate_locale_urls(),
        ];

        $seo = array_replace($defaults, array_filter($overrides, static fn (mixed $value): bool => $value !== null));
        $seo['title'] = Str::limit(strip_tags((string) $seo['title']), 64, '');
        $seo['description'] = Str::limit(strip_tags((string) $seo['description']), 158, '');
        $seo['og_title'] = Str::limit(strip_tags((string) ($seo['og_title'] ?: $seo['title'])), 100, '');
        $seo['og_description'] = Str::limit(strip_tags((string) ($seo['og_description'] ?: $seo['description'])), 200, '');

        return $seo;
    }

    /**
     * Create a BreadcrumbList schema object.
     *
     * @param  array<int, array{name:string,url:string}>  $items
     * @return array<string, mixed>
     */
    public static function breadcrumbSchema(array $items): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => array_map(
                static fn (array $item, int $index): array => [
                    '@type' => 'ListItem',
                    'position' => $index + 1,
                    'name' => $item['name'],
                    'item' => $item['url'],
                ],
                $items,
                array_keys($items),
            ),
        ];
    }
}
