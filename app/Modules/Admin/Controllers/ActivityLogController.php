<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Modules\Admin\Services\AdminContentService;
use Illuminate\View\View;

class ActivityLogController extends Controller
{
    public function __construct(private readonly AdminContentService $service) {}

    public function index(): View
    {
        return view('admin.activity.index', [
            'items' => $this->service->paginate(ActivityLog::class, ['user']),
        ]);
    }
}
