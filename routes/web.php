<?php

use App\Http\Controllers\SeoController;
use App\Modules\Admin\Controllers\ActivityLogController;
use App\Modules\Admin\Controllers\AuthController;
use App\Modules\Admin\Controllers\BannerController;
use App\Modules\Admin\Controllers\CategoryController;
use App\Modules\Admin\Controllers\ContactSubmissionController;
use App\Modules\Admin\Controllers\DashboardController;
use App\Modules\Admin\Controllers\PageController;
use App\Modules\Admin\Controllers\PostController;
use App\Modules\Admin\Controllers\ProductController;
use App\Modules\Admin\Controllers\SeoMetaController;
use App\Modules\Admin\Controllers\UserController;
use App\Modules\Contact\Controllers\ContactController;
use App\Modules\Home\Controllers\HomeController;
use App\Modules\Insight\Controllers\InsightController;
use App\Modules\Portfolio\Controllers\PortfolioController;
use App\Modules\Pricing\Controllers\PricingController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('home', ['locale' => config('app.locale')], 301));
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('robots');

Route::pattern('locale', 'vi|en|zh');

Route::prefix('{locale}')->middleware('locale')->group(function (): void {
    Route::get('/', HomeController::class)->name('home');
    Route::get('/pricing', PricingController::class)->name('pricing');
    Route::get('/bao-gia', static fn (string $locale) => redirect()->route('pricing', compact('locale'), 301));

    Route::get('/portfolio', [PortfolioController::class, 'index'])->name('portfolio.index');
    Route::post('/portfolio/unlock', [PortfolioController::class, 'unlock'])->middleware('throttle:portfolio')->name('portfolio.unlock');
    Route::get('/portfolio/{slug}', [PortfolioController::class, 'show'])->name('portfolio.show');

    Route::get('/insights', [InsightController::class, 'index'])->name('insights.index');
    Route::get('/insights/{slug}', [InsightController::class, 'show'])->name('insights.show');

    Route::get('/contact', [ContactController::class, 'index'])->name('contact.index');
    Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact')->name('contact.store');
    Route::get('/lien-he', static fn (string $locale) => redirect()->route('contact.index', compact('locale'), 301));
});

Route::prefix('admin')->name('admin.')->group(function (): void {
    Route::middleware('guest')->group(function (): void {
        Route::get('/login', [AuthController::class, 'create'])->name('login');
        Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:login')->name('login.store');
    });

    Route::middleware(['auth', 'role:super_admin,editor,analyst'])->group(function (): void {
        Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
        Route::get('/', DashboardController::class)->name('dashboard');
        Route::get('/activity', [ActivityLogController::class, 'index'])->name('activity.index');
        Route::get('/contacts', [ContactSubmissionController::class, 'index'])->name('contacts.index');
        Route::get('/contacts/{contact}', [ContactSubmissionController::class, 'show'])->name('contacts.show');
    });

    Route::middleware(['auth', 'role:super_admin,editor'])->group(function (): void {
        Route::resources([
            'posts' => PostController::class,
            'products' => ProductController::class,
            'categories' => CategoryController::class,
            'banners' => BannerController::class,
            'pages' => PageController::class,
            'seo' => SeoMetaController::class,
        ])->except(['show']);
    });

    Route::middleware(['auth', 'role:super_admin'])->group(function (): void {
        Route::resource('users', UserController::class)->except(['show']);
        Route::delete('/contacts/{contact}', [ContactSubmissionController::class, 'destroy'])->name('contacts.destroy');
    });
});
