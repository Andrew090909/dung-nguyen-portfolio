<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SeoMeta extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'seoable_type', 'seoable_id', 'meta_title', 'meta_description', 'canonical_url',
        'og_title', 'og_description', 'og_image', 'twitter_card', 'robots', 'schema',
    ];

    protected function casts(): array
    {
        return [
            'meta_title' => 'array', 'meta_description' => 'array', 'og_title' => 'array',
            'og_description' => 'array', 'schema' => 'array',
        ];
    }

    /** @return MorphTo<Model, $this> */
    public function seoable(): MorphTo
    {
        return $this->morphTo();
    }
}
