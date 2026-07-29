<?php

namespace App\Models;

use App\Traits\HasSeo;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, HasSeo, LogsActivity, SoftDeletes;

    protected $fillable = [
        'category_id', 'slug', 'name', 'summary', 'description', 'features', 'price_from',
        'price_unit', 'image', 'is_active', 'is_featured', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'name' => 'array', 'summary' => 'array', 'description' => 'array',
            'features' => 'array', 'price_from' => 'decimal:2',
            'is_active' => 'boolean', 'is_featured' => 'boolean',
        ];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
