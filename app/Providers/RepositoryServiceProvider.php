<?php

namespace App\Providers;

use App\Modules\Admin\Repositories\AdminRepositoryInterface;
use App\Modules\Admin\Repositories\EloquentAdminRepository;
use App\Modules\Contact\Repositories\ContactRepositoryInterface;
use App\Modules\Contact\Repositories\EloquentContactRepository;
use App\Modules\Home\Repositories\EloquentHomeRepository;
use App\Modules\Home\Repositories\HomeRepositoryInterface;
use App\Modules\Insight\Repositories\EloquentInsightRepository;
use App\Modules\Insight\Repositories\InsightRepositoryInterface;
use App\Modules\Portfolio\Repositories\EloquentPortfolioRepository;
use App\Modules\Portfolio\Repositories\PortfolioRepositoryInterface;
use App\Modules\Pricing\Repositories\EloquentPricingRepository;
use App\Modules\Pricing\Repositories\PricingRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /** @var array<class-string, class-string> */
    public array $bindings = [
        AdminRepositoryInterface::class => EloquentAdminRepository::class,
        HomeRepositoryInterface::class => EloquentHomeRepository::class,
        PricingRepositoryInterface::class => EloquentPricingRepository::class,
        PortfolioRepositoryInterface::class => EloquentPortfolioRepository::class,
        InsightRepositoryInterface::class => EloquentInsightRepository::class,
        ContactRepositoryInterface::class => EloquentContactRepository::class,
    ];
}
