<?php

namespace App\Mail;

use App\Models\ContactSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactReceived extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public readonly ContactSubmission $submission) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'New commercial assessment request — '.$this->submission->name);
    }

    public function content(): Content
    {
        return new Content(view: 'mail.contact-received');
    }
}
