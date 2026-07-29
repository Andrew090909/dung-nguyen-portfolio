<?php

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

if (! function_exists('localized')) {
    /**
     * Resolve a translated JSON value using the active locale and configured fallback.
     *
     * @param  array<string, mixed>|string|null  $value
     */
    function localized(array|string|null $value, ?string $locale = null, string $fallback = ''): string
    {
        if (is_string($value)) {
            return $value;
        }

        if (! is_array($value)) {
            return $fallback;
        }

        $locale ??= app()->getLocale();
        $fallbackLocale = config('app.fallback_locale', 'en');

        return (string) ($value[$locale] ?? $value[$fallbackLocale] ?? Arr::first($value) ?? $fallback);
    }
}

if (! function_exists('locale_url')) {
    /**
     * Generate a localized route while preserving the requested route parameters.
     *
     * @param  array<string, mixed>  $parameters
     */
    function locale_url(string $routeName, array $parameters = [], ?string $locale = null): string
    {
        $locale ??= app()->getLocale();

        return route($routeName, ['locale' => $locale, ...$parameters]);
    }
}

if (! function_exists('alternate_locale_urls')) {
    /** @return array<string, string> */
    function alternate_locale_urls(): array
    {
        $routeName = Route::currentRouteName();
        $parameters = request()->route()?->parameters() ?? [];
        $urls = [];

        if (! $routeName || str_starts_with($routeName, 'admin.')) {
            return $urls;
        }

        foreach (['vi', 'en', 'zh'] as $locale) {
            $urls[$locale] = route($routeName, [...$parameters, 'locale' => $locale]);
        }

        return $urls;
    }
}

if (! function_exists('reading_time')) {
    /** Estimate reading time for HTML content, including CJK text. */
    function reading_time(?string $html): int
    {
        $plainText = trim(strip_tags((string) $html));
        $latinWords = str_word_count($plainText);
        preg_match_all('/[\x{4e00}-\x{9fff}]/u', $plainText, $cjkMatches);
        $equivalentWords = $latinWords + (int) ceil(count($cjkMatches[0]) / 2);

        return max(1, (int) ceil($equivalentWords / 220));
    }
}

if (! function_exists('safe_html_id')) {
    /** Create a stable, accessible HTML id. */
    function safe_html_id(string $value): string
    {
        return Str::slug($value) ?: 'section';
    }
}
