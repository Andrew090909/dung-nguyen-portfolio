<?php

namespace Tests\Feature;

use App\Mail\ContactReceived;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_valid_contact_submission_is_persisted(): void
    {
        Mail::fake();

        $response = $this->post('/vi/contact', [
            'name' => 'Nguyen Van A',
            'company' => 'Example Co',
            'email' => 'client@example.com',
            'phone' => '0900000000',
            'need' => 'diagnostic',
            'budget' => '15-60',
            'timeline' => 'quarter',
            'message' => 'We need to diagnose the commercial funnel and revenue leakage.',
            'website' => '',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('contact_submissions', [
            'email' => 'client@example.com',
            'status' => 'new',
            'locale' => 'vi',
        ]);
        Mail::assertQueued(ContactReceived::class);
    }

    public function test_honeypot_rejects_bot_submissions(): void
    {
        $this->post('/vi/contact', [
            'name' => 'Bot',
            'email' => 'bot@example.com',
            'need' => 'other',
            'message' => 'This message is long enough to pass the content rule.',
            'website' => 'https://spam.example',
        ])->assertSessionHasErrors('website');
    }
}
