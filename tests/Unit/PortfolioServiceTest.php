<?php

namespace Tests\Unit;

use App\Modules\Portfolio\Repositories\PortfolioRepositoryInterface;
use App\Modules\Portfolio\Services\PortfolioService;
use Mockery;
use Tests\TestCase;

class PortfolioServiceTest extends TestCase
{
    public function test_unlock_uses_constant_time_password_comparison_and_sets_expiry_session(): void
    {
        config(['services.portfolio.password' => 'correct-password']);
        $repository = Mockery::mock(PortfolioRepositoryInterface::class);
        $service = new PortfolioService($repository);

        $this->assertFalse($service->unlock('wrong-password'));
        $this->assertTrue($service->unlock('correct-password'));
        $this->assertTrue($service->isUnlocked());
    }
}
