<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocaleRoutingTest extends TestCase
{
    use RefreshDatabase;

    public function test_root_redirects_to_the_default_locale(): void
    {
        $this->get('/')->assertRedirect('/vi');
    }

    public function test_unsupported_locale_is_not_routable(): void
    {
        $this->get('/fr')->assertNotFound();
    }
}
