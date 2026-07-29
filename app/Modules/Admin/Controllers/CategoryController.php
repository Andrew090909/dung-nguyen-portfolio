<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Modules\Admin\Requests\CategoryRequest;
use App\Modules\Admin\Services\AdminContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class CategoryController extends Controller
{
    public function __construct(private readonly AdminContentService $service) {}

    public function index(): View
    {
        return view('admin.categories.index', ['items' => $this->service->paginate(Category::class, [])]);
    }

    public function create(): View
    {
        return view('admin.categories.form', ['item' => new Category(), ...[]]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $this->service->create(Category::class, $request->validated());
        return redirect()->route('admin.categories.index')->with('status', 'Đã tạo dữ liệu thành công.');
    }

    public function edit(Category $category): View
    {
        return view('admin.categories.form', ['item' => $category, ...[]]);
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $this->service->update($category, $request->validated());
        return redirect()->route('admin.categories.index')->with('status', 'Đã cập nhật dữ liệu.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $this->service->delete($category);
        return back()->with('status', 'Đã chuyển dữ liệu vào thùng rác.');
    }
}
