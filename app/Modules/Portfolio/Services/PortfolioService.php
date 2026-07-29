<?php

namespace App\Modules\Portfolio\Services;

use App\Models\PortfolioProject;
use App\Modules\Portfolio\Repositories\PortfolioRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class PortfolioService
{
    public function __construct(private readonly PortfolioRepositoryInterface $repository) {}

    /** @return Collection<int, PortfolioProject> */
    public function projects(): Collection
    {
        return Cache::remember('portfolio:published', now()->addMinutes(30), fn (): Collection => $this->repository->published());
    }

    public function project(string $slug): PortfolioProject
    {
        return Cache::remember("portfolio:{$slug}", now()->addMinutes(30), fn (): PortfolioProject => $this->repository->bySlug($slug));
    }

    public function unlock(string $password): bool
    {
        $valid = hash_equals((string) config('services.portfolio.password'), $password);

        if ($valid) {
            session(['portfolio_unlocked' => true, 'portfolio_unlocked_at' => now()->timestamp]);
        }

        return $valid;
    }

    public function isUnlocked(): bool
    {
        $unlockedAt = (int) session('portfolio_unlocked_at', 0);

        return (bool) session('portfolio_unlocked', false) && $unlockedAt > now()->subHours(8)->timestamp;
    }
}
