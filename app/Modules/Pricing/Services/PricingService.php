<?php

namespace App\Modules\Pricing\Services;

use App\Modules\Pricing\Repositories\PricingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class PricingService
{
    public function __construct(private readonly PricingRepositoryInterface $repository) {}

    /** @return Collection<int, \App\Models\Product> */
    public function packages(): Collection
    {
        return Cache::remember('pricing:services', now()->addMinutes(30), fn (): Collection => $this->repository->activeServices());
    }
}
