<?php

namespace App\Observers;

use App\Models\Post;
use Illuminate\Support\Facades\Cache;

class PostObserver
{
    public function saved(Post $post): void
    {
        $this->flush();
    }

    public function deleted(Post $post): void
    {
        $this->flush();
    }

    private function flush(): void
    {
        foreach (['vi', 'en', 'zh'] as $locale) {
            Cache::forget("home:{$locale}");
            Cache::forget("insights:featured:{$locale}");
        }
    }
}
