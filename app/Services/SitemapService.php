<?php

namespace App\Services;

use App\Models\PortfolioProject;
use App\Models\Post;
use Illuminate\Support\Collection;

class SitemapService
{
    /** @return Collection<int, array<string, string>> */
    public function urls(): Collection
    {
        $urls = collect();
        $locales = ['vi', 'en', 'zh'];

        foreach ($locales as $locale) {
            foreach (['home', 'pricing', 'portfolio.index', 'insights.index', 'contact.index'] as $routeName) {
                $urls->push([
                    'loc' => route($routeName, compact('locale')),
                    'lastmod' => now()->toDateString(),
                    'changefreq' => $routeName === 'home' ? 'weekly' : 'monthly',
                    'priority' => $routeName === 'home' ? '1.0' : '0.8',
                ]);
            }

            Post::query()->published()->select(['slug', 'updated_at'])->cursor()->each(function (Post $post) use ($urls, $locale): void {
                $urls->push([
                    'loc' => route('insights.show', ['locale' => $locale, 'slug' => $post->slug]),
                    'lastmod' => $post->updated_at->toDateString(),
                    'changefreq' => 'monthly',
                    'priority' => '0.7',
                ]);
            });
        }

        return $urls;
    }
}
