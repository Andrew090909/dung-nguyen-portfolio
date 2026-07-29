<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Banner extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = ['key', 'title', 'subtitle', 'cta_label', 'cta_url', 'image', 'is_active', 'starts_at', 'ends_at', 'sort_order'];

    protected function casts(): array
    {
        return [
            'title' => 'array', 'subtitle' => 'array', 'cta_label' => 'array',
            'is_active' => 'boolean', 'starts_at' => 'datetime', 'ends_at' => 'datetime',
        ];
    }
}
