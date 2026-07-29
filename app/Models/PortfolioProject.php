<?php

namespace App\Models;

use App\Traits\HasSeo;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PortfolioProject extends Model
{
    use HasFactory, HasSeo, LogsActivity, SoftDeletes;

    protected $fillable = [
        'slug', 'title', 'industry', 'year', 'context', 'role', 'problem', 'approach',
        'deliverables', 'images', 'is_featured', 'is_published', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array', 'industry' => 'array', 'context' => 'array', 'role' => 'array',
            'problem' => 'array', 'approach' => 'array', 'deliverables' => 'array',
            'images' => 'array', 'is_featured' => 'boolean', 'is_published' => 'boolean',
        ];
    }
}
