<?php

namespace App\Modules\Admin\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use App\Modules\Admin\Services\AdminContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ContactSubmissionController extends Controller
{
    public function __construct(private readonly AdminContentService $service) {}

    public function index(): View
    {
        return view('admin.contacts.index', ['items' => $this->service->paginate(ContactSubmission::class)]);
    }

    public function show(ContactSubmission $contact): View
    {
        if ($contact->status === 'new') {
            $this->service->update($contact, ['status' => 'reviewed']);
        }

        return view('admin.contacts.show', compact('contact'));
    }

    public function destroy(ContactSubmission $contact): RedirectResponse
    {
        $this->service->delete($contact);
        return redirect()->route('admin.contacts.index')->with('status', 'Đã xóa yêu cầu liên hệ.');
    }
}
