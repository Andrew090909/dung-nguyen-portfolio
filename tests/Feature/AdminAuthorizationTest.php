<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_analyst_cannot_manage_users(): void
    {
        $analyst = User::query()->create([
            'name' => 'Analyst',
            'email' => 'analyst@example.com',
            'password' => 'a-secure-password',
            'role' => 'analyst',
            'is_active' => true,
        ]);

        $this->actingAs($analyst)->get('/admin/users')->assertForbidden();
    }
}
