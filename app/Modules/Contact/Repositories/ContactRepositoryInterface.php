<?php

namespace App\Modules\Contact\Repositories;

use App\Models\ContactSubmission;

interface ContactRepositoryInterface
{
    /** @param array<string, mixed> $data */
    public function create(array $data): ContactSubmission;
}
