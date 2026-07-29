<?php

namespace App\Modules\Admin\Services;

use App\Models\ActivityLog;
use App\Models\ContactSubmission;
use App\Models\PortfolioProject;
use App\Models\Post;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class AdminDashboardService
{
    /** @return array<string, int> */
    public function metrics(): array
    {
        return Cache::remember('admin:dashboard:metrics', now()->addMinute(), static fn (): array => [
            'posts' => Post::query()->count(),
            'projects' => PortfolioProject::query()->count(),
            'services' => Product::query()->count(),
            'contacts' => ContactSubmission::query()->where('status', 'new')->count(),
            'users' => User::query()->count(),
        ]);
    }

    /** @return Collection<int, ActivityLog> */
    public function recentActivities(): Collection
    {
        return ActivityLog::query()->with('user')->latest('created_at')->limit(12)->get();
    }
}
