<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Admin\Requests\UserRequest;
use App\Modules\Admin\Services\AdminContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class UserController extends Controller
{
    public function __construct(private readonly AdminContentService $service) {}

    public function index(): View
    {
        return view('admin.users.index', ['items' => $this->service->paginate(User::class, [])]);
    }

    public function create(): View
    {
        return view('admin.users.form', ['item' => new User(), ...[]]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        $this->service->create(User::class, $request->validated());
        return redirect()->route('admin.users.index')->with('status', 'Đã tạo dữ liệu thành công.');
    }

    public function edit(User $user): View
    {
        return view('admin.users.form', ['item' => $user, ...[]]);
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $this->service->update($user, $request->validated());
        return redirect()->route('admin.users.index')->with('status', 'Đã cập nhật dữ liệu.');
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_if(auth()->id() === $user->id, 422, 'Bạn không thể xóa tài khoản đang đăng nhập.');
        $this->service->delete($user);
        return back()->with('status', 'Đã chuyển dữ liệu vào thùng rác.');
    }
}
