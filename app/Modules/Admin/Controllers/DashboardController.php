<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Admin\Services\AdminDashboardService;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __construct(private readonly AdminDashboardService $service) {}

    public function __invoke(): View
    {
        return view('admin.dashboard', [
            'metrics' => $this->service->metrics(),
            'activities' => $this->service->recentActivities(),
        ]);
    }
}
