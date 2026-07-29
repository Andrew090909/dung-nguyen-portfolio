<?php

namespace App\Modules\Portfolio\Repositories;

use App\Models\PortfolioProject;
use Illuminate\Database\Eloquent\Collection;

class EloquentPortfolioRepository implements PortfolioRepositoryInterface
{
    public function published(): Collection
    {
        return PortfolioProject::query()->where('is_published', true)->orderBy('sort_order')->get();
    }

    public function bySlug(string $slug): PortfolioProject
    {
        return PortfolioProject::query()->where('slug', $slug)->where('is_published', true)->firstOrFail();
    }
}
