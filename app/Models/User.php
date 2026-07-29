<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory;
    use LogsActivity;
    use Notifiable;
    use SoftDeletes;

    /** @var list<string> */
    protected $fillable = ['name', 'email', 'password', 'role', 'is_active', 'last_login_at'];

    /** @var list<string> */
    protected $hidden = ['password', 'remember_token'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /** Determine whether the user may access the requested administrative role. */
    public function hasRole(string ...$roles): bool
    {
        return $this->is_active && in_array($this->role, $roles, true);
    }
}
