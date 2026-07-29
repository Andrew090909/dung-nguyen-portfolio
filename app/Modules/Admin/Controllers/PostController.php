<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Modules\Admin\Requests\PostRequest;
use App\Modules\Admin\Services\AdminContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class PostController extends Controller
{
    public function __construct(private readonly AdminContentService $service) {}

    public function index(): View
    {
        return view('admin.posts.index', ['items' => $this->service->paginate(Post::class, ['category','author'])]);
    }

    public function create(): View
    {
        return view('admin.posts.form', ['item' => new Post(), ...['categories' => $this->service->options(\App\Models\Category::class)->where('type', 'post'), 'users' => $this->service->options(\App\Models\User::class)]]);
    }

    public function store(PostRequest $request): RedirectResponse
    {
        $this->service->create(Post::class, $request->validated(), 'cover_image', 'insights');
        return redirect()->route('admin.posts.index')->with('status', 'Đã tạo dữ liệu thành công.');
    }

    public function edit(Post $post): View
    {
        return view('admin.posts.form', ['item' => $post, ...['categories' => $this->service->options(\App\Models\Category::class)->where('type', 'post'), 'users' => $this->service->options(\App\Models\User::class)]]);
    }

    public function update(PostRequest $request, Post $post): RedirectResponse
    {
        $this->service->update($post, $request->validated(), 'cover_image', 'insights');
        return redirect()->route('admin.posts.index')->with('status', 'Đã cập nhật dữ liệu.');
    }

    public function destroy(Post $post): RedirectResponse
    {
        $this->service->delete($post);
        return back()->with('status', 'Đã chuyển dữ liệu vào thùng rác.');
    }
}
