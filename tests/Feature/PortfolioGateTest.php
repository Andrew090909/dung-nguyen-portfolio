<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioGateTest extends TestCase
{
    use RefreshDatabase;

    public function test_portfolio_details_are_protected(): void
    {
        $this->get('/vi/portfolio/example')->assertForbidden();
    }

    public function test_correct_password_unlocks_portfolio_session(): void
    {
        config(['services.portfolio.password' => 'secure-test-password']);

        $this->post('/vi/portfolio/unlock', ['password' => 'secure-test-password'])
            ->assertRedirect(route('portfolio.index', ['locale' => 'vi']));

        $this->assertTrue((bool) session('portfolio_unlocked'));
    }
}
