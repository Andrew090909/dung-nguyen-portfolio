<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Modules\Admin\Requests\ProductRequest;
use App\Modules\Admin\Services\AdminContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ProductController extends Controller
{
    public function __construct(private readonly AdminContentService $service) {}

    public function index(): View
    {
        return view('admin.products.index', ['items' => $this->service->paginate(Product::class, ['category'])]);
    }

    public function create(): View
    {
        return view('admin.products.form', ['item' => new Product(), ...['categories' => $this->service->options(\App\Models\Category::class)->where('type', 'product')]]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $this->service->create(Product::class, $request->validated(), 'image', 'products');
        return redirect()->route('admin.products.index')->with('status', 'Đã tạo dữ liệu thành công.');
    }

    public function edit(Product $product): View
    {
        return view('admin.products.form', ['item' => $product, ...['categories' => $this->service->options(\App\Models\Category::class)->where('type', 'product')]]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $this->service->update($product, $request->validated(), 'image', 'products');
        return redirect()->route('admin.products.index')->with('status', 'Đã cập nhật dữ liệu.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->service->delete($product);
        return back()->with('status', 'Đã chuyển dữ liệu vào thùng rác.');
    }
}
