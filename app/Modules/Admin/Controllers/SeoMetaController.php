<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SeoMeta;
use App\Modules\Admin\Requests\SeoMetaRequest;
use App\Modules\Admin\Services\AdminContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class SeoMetaController extends Controller
{
    public function __construct(private readonly AdminContentService $service) {}

    public function index(): View
    {
        return view('admin.seo.index', ['items' => $this->service->paginate(SeoMeta::class, [])]);
    }

    public function create(): View
    {
        return view('admin.seo.form', ['item' => new SeoMeta(), ...[]]);
    }

    public function store(SeoMetaRequest $request): RedirectResponse
    {
        $this->service->create(SeoMeta::class, $request->validated());
        return redirect()->route('admin.seo.index')->with('status', 'Đã tạo dữ liệu thành công.');
    }

    public function edit(SeoMeta $seo): View
    {
        return view('admin.seo.form', ['item' => $seo, ...[]]);
    }

    public function update(SeoMetaRequest $request, SeoMeta $seo): RedirectResponse
    {
        $this->service->update($seo, $request->validated());
        return redirect()->route('admin.seo.index')->with('status', 'Đã cập nhật dữ liệu.');
    }

    public function destroy(SeoMeta $seo): RedirectResponse
    {
        $this->service->delete($seo);
        return back()->with('status', 'Đã chuyển dữ liệu vào thùng rác.');
    }
}
