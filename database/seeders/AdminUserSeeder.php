<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@dungnguyen.local')],
            [
                'name' => env('ADMIN_NAME', 'Dũng Nguyễn'),
                'password' => env('ADMIN_PASSWORD', 'ChangeMeNow!2026'),
                'role' => 'super_admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
    }
}
