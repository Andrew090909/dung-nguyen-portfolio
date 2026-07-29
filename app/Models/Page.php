<?php

namespace App\Models;

use App\Traits\HasSeo;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Page extends Model
{
    use HasFactory, HasSeo, LogsActivity, SoftDeletes;

    protected $fillable = ['key', 'slug', 'title', 'content', 'settings', 'is_published'];

    protected function casts(): array
    {
        return ['slug' => 'array', 'title' => 'array', 'content' => 'array', 'settings' => 'array', 'is_published' => 'boolean'];
    }
}
