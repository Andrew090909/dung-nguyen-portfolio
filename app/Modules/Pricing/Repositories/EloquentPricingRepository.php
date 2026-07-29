<?php

namespace App\Modules\Pricing\Repositories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class EloquentPricingRepository implements PricingRepositoryInterface
{
    public function activeServices(): Collection
    {
        return Product::query()->where('is_active', true)->with('category')->orderBy('sort_order')->get();
    }
}
