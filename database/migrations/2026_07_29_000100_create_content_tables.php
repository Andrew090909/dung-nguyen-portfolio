<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->json('name');
            $table->string('slug', 190)->unique();
            $table->json('description')->nullable();
            $table->enum('type', ['post', 'product'])->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('posts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('author_id')->constrained('users')->restrictOnDelete();
            $table->string('slug', 190)->unique();
            $table->json('title');
            $table->json('excerpt');
            $table->json('body');
            $table->string('cover_image', 500)->nullable();
            $table->enum('status', ['draft', 'published'])->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'published_at']);
        });

        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('slug', 190)->unique();
            $table->json('name');
            $table->json('summary');
            $table->json('description')->nullable();
            $table->json('features');
            $table->decimal('price_from', 15, 2)->nullable();
            $table->string('price_unit', 80)->nullable();
            $table->string('image', 500)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('portfolio_projects', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 190)->unique();
            $table->json('title');
            $table->json('industry');
            $table->string('year', 40)->nullable();
            $table->json('context');
            $table->json('role');
            $table->json('problem');
            $table->json('approach');
            $table->json('deliverables');
            $table->json('images');
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_published')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('banners', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 100)->index();
            $table->json('title');
            $table->json('subtitle')->nullable();
            $table->json('cta_label')->nullable();
            $table->string('cta_url', 500)->nullable();
            $table->string('image', 500)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('starts_at')->nullable()->index();
            $table->timestamp('ends_at')->nullable()->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('pages', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 100)->unique();
            $table->json('slug');
            $table->json('title');
            $table->json('content')->nullable();
            $table->json('settings')->nullable();
            $table->boolean('is_published')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('seo_meta', function (Blueprint $table): void {
            $table->id();
            $table->morphs('seoable');
            $table->json('meta_title');
            $table->json('meta_description');
            $table->string('canonical_url', 500)->nullable();
            $table->json('og_title')->nullable();
            $table->json('og_description')->nullable();
            $table->string('og_image', 500)->nullable();
            $table->enum('twitter_card', ['summary', 'summary_large_image'])->default('summary_large_image');
            $table->string('robots', 120)->default('index,follow,max-image-preview:large');
            $table->json('schema')->nullable();
            $table->timestamps();
            $table->unique(['seoable_type', 'seoable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_meta');
        Schema::dropIfExists('pages');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('portfolio_projects');
        Schema::dropIfExists('products');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('categories');
    }
};
