<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Modules\Admin\Requests\PageRequest;
use App\Modules\Admin\Services\AdminContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class PageController extends Controller
{
    public function __construct(private readonly AdminContentService $service) {}

    public function index(): View
    {
        return view('admin.pages.index', ['items' => $this->service->paginate(Page::class, [])]);
    }

    public function create(): View
    {
        return view('admin.pages.form', ['item' => new Page(), ...[]]);
    }

    public function store(PageRequest $request): RedirectResponse
    {
        $this->service->create(Page::class, $request->validated());
        return redirect()->route('admin.pages.index')->with('status', 'Đã tạo dữ liệu thành công.');
    }

    public function edit(Page $page): View
    {
        return view('admin.pages.form', ['item' => $page, ...[]]);
    }

    public function update(PageRequest $request, Page $page): RedirectResponse
    {
        $this->service->update($page, $request->validated());
        return redirect()->route('admin.pages.index')->with('status', 'Đã cập nhật dữ liệu.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $this->service->delete($page);
        return back()->with('status', 'Đã chuyển dữ liệu vào thùng rác.');
    }
}
