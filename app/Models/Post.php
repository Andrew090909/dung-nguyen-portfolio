<?php

namespace App\Models;

use App\Traits\HasSeo;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, HasSeo, LogsActivity, SoftDeletes;

    protected $fillable = [
        'category_id', 'author_id', 'slug', 'title', 'excerpt', 'body', 'cover_image',
        'status', 'is_featured', 'published_at', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array', 'excerpt' => 'array', 'body' => 'array',
            'is_featured' => 'boolean', 'published_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /** @param Builder<Post> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published')->where('published_at', '<=', now());
    }
}
