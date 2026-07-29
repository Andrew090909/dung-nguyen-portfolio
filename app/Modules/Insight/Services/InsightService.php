<?php

namespace App\Modules\Insight\Services;

use App\Models\Post;
use App\Modules\Insight\Repositories\InsightRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InsightService
{
    public function __construct(private readonly InsightRepositoryInterface $repository) {}

    /** @return LengthAwarePaginator<Post> */
    public function paginate(int $perPage = 9): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage);
    }

    public function post(string $slug): Post
    {
        return $this->repository->bySlug($slug);
    }
}
