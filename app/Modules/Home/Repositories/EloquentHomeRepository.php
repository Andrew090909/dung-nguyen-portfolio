<?php

namespace App\Modules\Home\Repositories;

use App\Models\Banner;
use App\Models\PortfolioProject;
use App\Models\Post;
use App\Models\Product;

class EloquentHomeRepository implements HomeRepositoryInterface
{
    public function overview(string $locale): array
    {
        return [
            'projects' => PortfolioProject::query()->where('is_published', true)->where('is_featured', true)->orderBy('sort_order')->limit(5)->get(),
            'posts' => Post::query()->published()->with('category')->latest('published_at')->limit(5)->get(),
            'services' => Product::query()->where('is_active', true)->orderBy('sort_order')->limit(4)->get(),
            'banner' => Banner::query()->where('key', 'home-cta')->where('is_active', true)->first(),
        ];
    }
}
