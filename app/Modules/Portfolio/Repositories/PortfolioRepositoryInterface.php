<?php

namespace App\Modules\Portfolio\Repositories;

use App\Models\PortfolioProject;
use Illuminate\Database\Eloquent\Collection;

interface PortfolioRepositoryInterface
{
    /** @return Collection<int, PortfolioProject> */
    public function published(): Collection;

    public function bySlug(string $slug): PortfolioProject;
}
