<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Page;
use App\Models\PortfolioProject;
use App\Models\Post;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use RuntimeException;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $categories = collect($this->readJson('categories.json'));
        $categories->each(fn (array $item) => Category::query()->updateOrCreate(['slug' => $item['slug']], [...$item, 'is_active' => true]));

        $admin = User::query()->where('role', 'super_admin')->firstOrFail();
        $postCategories = Category::query()->where('type', 'post')->get()->keyBy('slug');

        foreach (File::files(database_path('data/posts')) as $file) {
            $item = json_decode($file->getContents(), true, 512, JSON_THROW_ON_ERROR);
            $categorySlug = match ($item['slug']) {
                'marketing-system-before-ad-spend' => 'strategy',
                'brand-trust-in-b2b' => 'brand',
                default => 'ai-operations',
            };
            Post::query()->updateOrCreate(['slug' => $item['slug']], [
                'category_id' => $postCategories[$categorySlug]->id,
                'author_id' => $admin->id,
                'title' => ['vi' => $item['vi']['title'], 'en' => $item['en']['title'], 'zh' => $item['zh']['title']],
                'excerpt' => ['vi' => $item['vi']['excerpt'], 'en' => $item['en']['excerpt'], 'zh' => $item['zh']['excerpt']],
                'body' => ['vi' => $item['vi']['body'], 'en' => $item['en']['body'], 'zh' => $item['zh']['body']],
                'cover_image' => $item['cover'],
                'status' => 'published',
                'is_featured' => (bool) ($item['featured'] ?? false),
                'published_at' => $item['date'],
            ]);
        }

        $serviceCategory = Category::query()->where('slug', 'commercial-services')->firstOrFail();
        foreach ($this->readJson('services.json') as $item) {
            Product::query()->updateOrCreate(['slug' => $item['slug']], [...$item, 'category_id' => $serviceCategory->id, 'is_active' => true]);
        }

        foreach (File::files(database_path('data/portfolio')) as $file) {
            $item = json_decode($file->getContents(), true, 512, JSON_THROW_ON_ERROR);
            PortfolioProject::query()->updateOrCreate(['slug' => $item['id']], [
                'title' => ['vi' => $item['vi']['title'], 'en' => $item['en']['title'], 'zh' => $item['zh']['title']],
                'industry' => ['vi' => $item['vi']['industry'], 'en' => $item['en']['industry'], 'zh' => $item['zh']['industry']],
                'year' => $item['year'],
                'context' => ['vi' => $item['vi']['context'], 'en' => $item['en']['context'], 'zh' => $item['zh']['context']],
                'role' => ['vi' => $item['vi']['role'], 'en' => $item['en']['role'], 'zh' => $item['zh']['role']],
                'problem' => ['vi' => $item['vi']['problem'], 'en' => $item['en']['problem'], 'zh' => $item['zh']['problem']],
                'approach' => ['vi' => $item['vi']['approach'], 'en' => $item['en']['approach'], 'zh' => $item['zh']['approach']],
                'deliverables' => ['vi' => $item['vi']['deliverables'], 'en' => $item['en']['deliverables'], 'zh' => $item['zh']['deliverables']],
                'images' => $item['images'],
                'is_featured' => true,
                'is_published' => true,
                'sort_order' => (int) ($item['order'] ?? 0),
            ]);
        }

        foreach ($this->readJson('pages.json') as $item) {
            Page::query()->updateOrCreate(['key' => $item['key']], $item);
        }
        foreach ($this->readJson('banners.json') as $item) {
            Banner::query()->updateOrCreate(['key' => $item['key']], $item);
        }
    }

    /** @return array<int, array<string, mixed>> */
    private function readJson(string $path): array
    {
        $fullPath = database_path('data/'.$path);
        if (! File::exists($fullPath)) {
            throw new RuntimeException("Seed data file not found: {$fullPath}");
        }

        return json_decode(File::get($fullPath), true, 512, JSON_THROW_ON_ERROR);
    }
}
