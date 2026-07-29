<?php

namespace App\Modules\Insight\Repositories;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentInsightRepository implements InsightRepositoryInterface
{
    public function paginate(int $perPage = 9): LengthAwarePaginator
    {
        return Post::query()->published()->with(['category', 'author'])->latest('published_at')->paginate($perPage);
    }

    public function bySlug(string $slug): Post
    {
        return Post::query()->published()->with(['category', 'author', 'seo'])->where('slug', $slug)->firstOrFail();
    }
}
