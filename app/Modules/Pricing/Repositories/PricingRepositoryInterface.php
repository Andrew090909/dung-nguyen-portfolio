<?php

namespace App\Modules\Pricing\Repositories;

use Illuminate\Database\Eloquent\Collection;

interface PricingRepositoryInterface
{
    /** @return Collection<int, \App\Models\Product> */
    public function activeServices(): Collection;
}
