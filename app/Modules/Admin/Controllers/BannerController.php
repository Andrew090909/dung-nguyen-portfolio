<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Modules\Admin\Requests\BannerRequest;
use App\Modules\Admin\Services\AdminContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class BannerController extends Controller
{
    public function __construct(private readonly AdminContentService $service) {}

    public function index(): View
    {
        return view('admin.banners.index', ['items' => $this->service->paginate(Banner::class, [])]);
    }

    public function create(): View
    {
        return view('admin.banners.form', ['item' => new Banner(), ...[]]);
    }

    public function store(BannerRequest $request): RedirectResponse
    {
        $this->service->create(Banner::class, $request->validated(), 'image', 'banners');
        return redirect()->route('admin.banners.index')->with('status', 'Đã tạo dữ liệu thành công.');
    }

    public function edit(Banner $banner): View
    {
        return view('admin.banners.form', ['item' => $banner, ...[]]);
    }

    public function update(BannerRequest $request, Banner $banner): RedirectResponse
    {
        $this->service->update($banner, $request->validated(), 'image', 'banners');
        return redirect()->route('admin.banners.index')->with('status', 'Đã cập nhật dữ liệu.');
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        $this->service->delete($banner);
        return back()->with('status', 'Đã chuyển dữ liệu vào thùng rác.');
    }
}
