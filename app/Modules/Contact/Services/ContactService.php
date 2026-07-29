<?php

namespace App\Modules\Contact\Services;

use App\Mail\ContactReceived;
use App\Models\ContactSubmission;
use App\Modules\Contact\Repositories\ContactRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ContactService
{
    public function __construct(private readonly ContactRepositoryInterface $repository) {}

    /** @param array<string, mixed> $data */
    public function submit(array $data, Request $request): ContactSubmission
    {
        $submission = DB::transaction(fn (): ContactSubmission => $this->repository->create([
            ...$data,
            'locale' => app()->getLocale(),
            'status' => 'new',
            'source_url' => $request->headers->get('referer'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]));

        try {
            Mail::to(config('services.contact.notification_email'))->queue(new ContactReceived($submission));
        } catch (Throwable $exception) {
            Log::warning('Contact notification email could not be queued.', [
                'submission_id' => $submission->id,
                'message' => $exception->getMessage(),
            ]);
        }

        return $submission;
    }
}
