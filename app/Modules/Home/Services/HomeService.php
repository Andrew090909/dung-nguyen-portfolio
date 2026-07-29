<?php

namespace App\Modules\Home\Services;

use App\Modules\Home\Repositories\HomeRepositoryInterface;
use Illuminate\Support\Facades\Cache;

class HomeService
{
    public function __construct(private readonly HomeRepositoryInterface $repository) {}

    /** @return array<string, mixed> */
    public function data(string $locale): array
    {
        return Cache::remember("home:{$locale}", now()->addMinutes(15), fn (): array => $this->repository->overview($locale));
    }
}
