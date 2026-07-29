<footer class="site-footer">
    <div class="container">
        <section class="footer-cta reveal">
            <div class="footer-cta-icon" aria-hidden="true">✦</div>
            <div>
                <h2>{{ __('site.home.cta_title') }}</h2>
                <p>{{ __('site.home.cta_text') }}</p>
            </div>
            <a class="button button-primary" href="{{ route('contact.index', ['locale' => app()->getLocale()]) }}">{{ __('site.common.book_assessment') }} <span>→</span></a>
        </section>
        <div class="footer-grid">
            <div class="footer-brand">
                <a class="brand brand-large" href="{{ route('home', ['locale' => app()->getLocale()]) }}">DŨNG<br>NGUYỄN</a>
                <p>{{ __('site.footer.tagline') }}</p>
                <span>{{ __('site.footer.location') }}</span>
            </div>
            <div><h3>{{ __('site.footer.navigation') }}</h3><a href="{{ route('home', ['locale' => app()->getLocale()]) }}">{{ __('site.nav.home') }}</a><a href="{{ route('portfolio.index', ['locale' => app()->getLocale()]) }}">{{ __('site.nav.portfolio') }}</a><a href="{{ route('pricing', ['locale' => app()->getLocale()]) }}">{{ __('site.nav.pricing') }}</a><a href="{{ route('insights.index', ['locale' => app()->getLocale()]) }}">{{ __('site.nav.insights') }}</a></div>
            <div><h3>{{ __('site.footer.services') }}</h3>@foreach(__('site.footer.service_items') as $service)<span>{{ $service }}</span>@endforeach</div>
            <div><h3>{{ __('site.footer.contact') }}</h3><a href="mailto:nguyendhungdung@gmail.com">nguyendhungdung@gmail.com</a><a href="https://zaloapp.com/qr/p/1ute4cg6xoom2" rel="noopener" target="_blank">Zalo ↗</a></div>
        </div>
        <div class="footer-bottom"><span>{{ __('site.footer.rights') }}</span><div><a href="{{ route('robots') }}">Robots</a><a href="{{ route('sitemap') }}">Sitemap</a></div></div>
    </div>
</footer>
