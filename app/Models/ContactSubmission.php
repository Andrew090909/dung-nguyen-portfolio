<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactSubmission extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'name', 'company', 'email', 'phone', 'need', 'budget', 'timeline', 'message',
        'locale', 'status', 'source_url', 'ip_address', 'user_agent',
    ];
}
