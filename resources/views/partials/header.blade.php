<header class="site-header" data-header>
    <div class="container header-inner">
        <a class="brand" href="{{ route('home', ['locale' => app()->getLocale()]) }}" aria-label="Dũng Nguyễn home">
            <span>DŨNG NGUYỄN</span><i aria-hidden="true"></i>
        </a>
        <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="primary-navigation" aria-label="{{ __('site.nav.menu') }}">
            <span></span><span></span>
        </button>
        <nav id="primary-navigation" class="primary-nav" data-nav>
            <a @class(['active' => request()->routeIs('home')]) href="{{ route('home', ['locale' => app()->getLocale()]) }}">{{ __('site.nav.home') }}</a>
            <a @class(['active' => request()->routeIs('portfolio.*')]) href="{{ route('portfolio.index', ['locale' => app()->getLocale()]) }}">{{ __('site.nav.portfolio') }}</a>
            <a @class(['active' => request()->routeIs('pricing')]) href="{{ route('pricing', ['locale' => app()->getLocale()]) }}">{{ __('site.nav.pricing') }}</a>
            <a @class(['active' => request()->routeIs('insights.*')]) href="{{ route('insights.index', ['locale' => app()->getLocale()]) }}">{{ __('site.nav.insights') }}</a>
        </nav>
        <div class="header-actions">
            <div class="language-switcher" aria-label="Language selector">
                @foreach (['vi' => 'VI', 'en' => 'EN', 'zh' => '中文'] as $code => $label)
                    <a @class(['active' => app()->getLocale() === $code]) href="{{ ($seo['alternates'][$code] ?? url('/'.$code)) }}" hreflang="{{ $code }}">{{ $label }}</a>
                @endforeach
            </div>
            <a class="button button-sm button-outline" href="{{ route('contact.index', ['locale' => app()->getLocale()]) }}">{{ __('site.nav.contact') }} <span>↗</span></a>
        </div>
    </div>
</header>
