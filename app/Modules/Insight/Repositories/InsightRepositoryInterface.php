<?php

namespace App\Modules\Insight\Repositories;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface InsightRepositoryInterface
{
    /** @return LengthAwarePaginator<Post> */
    public function paginate(int $perPage = 9): LengthAwarePaginator;

    public function bySlug(string $slug): Post;
}
