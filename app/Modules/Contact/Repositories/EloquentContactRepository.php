<?php

namespace App\Modules\Contact\Repositories;

use App\Models\ContactSubmission;

class EloquentContactRepository implements ContactRepositoryInterface
{
    public function create(array $data): ContactSubmission
    {
        return ContactSubmission::query()->create($data);
    }
}
