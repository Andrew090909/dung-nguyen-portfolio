<?php

namespace Tests\Unit;

use App\Models\SeoMeta;
use App\Services\PageSeoService;
use Tests\TestCase;

class PageSeoServiceTest extends TestCase
{
    public function test_admin_metadata_overrides_defaults_without_dropping_default_schema(): void
    {
        app()->setLocale('vi');
        $meta = new SeoMeta([
            'meta_title' => ['vi' => 'Tiêu đề quản trị', 'en' => 'Admin title', 'zh' => '管理标题'],
            'meta_description' => ['vi' => 'Mô tả quản trị', 'en' => 'Admin description', 'zh' => '管理描述'],
            'og_title' => ['vi' => 'OG quản trị'],
            'robots' => 'index,follow',
            'twitter_card' => 'summary',
        ]);

        $seo = (new PageSeoService())->merge($meta, [
            'title' => 'Mặc định',
            'description' => 'Mô tả mặc định',
            'canonical' => 'https://example.com/vi',
            'schema' => [['@context' => 'https://schema.org', '@type' => 'WebSite']],
        ]);

        $this->assertSame('Tiêu đề quản trị', $seo['title']);
        $this->assertSame('OG quản trị', $seo['og_title']);
        $this->assertSame('summary', $seo['twitter_card']);
        $this->assertCount(1, $seo['schema']);
    }
}
