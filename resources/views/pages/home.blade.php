@extends('layouts.app')

@push('head')
<link rel="preload" as="image" href="{{ asset('images/hero/ai-earth-emerald-560.webp') }}" imagesrcset="{{ asset('images/hero/ai-earth-emerald-560.webp') }} 560w, {{ asset('images/hero/ai-earth-emerald.webp') }} 1000w" imagesizes="(max-width: 760px) 90vw, 50vw" fetchpriority="high">
@endpush

@section('content')
<section class="hero" data-hero>
    <div class="container hero-grid">
        <div class="hero-copy reveal">
            <p class="eyebrow">{{ __('site.home.eyebrow') }}</p>
            <h1>{!! __('site.home.title') !!}</h1>
            <p class="hero-lead">{{ __('site.home.lead') }}</p>
            <div class="hero-actions">
                <a class="button button-primary" href="{{ route('contact.index', ['locale' => app()->getLocale()]) }}">{{ __('site.common.book_assessment') }} <span>→</span></a>
                <a class="button button-ghost" href="{{ route('portfolio.index', ['locale' => app()->getLocale()]) }}">{{ __('site.common.explore_portfolio') }} <span>⌘</span></a>
            </div>
            <p class="assessment-note">{{ __('site.home.assessment_note') }}</p>
            <div class="proof-row">
                @foreach (__('site.home.proof') as $key => $proof)
                    <span><i aria-hidden="true">{{ ['consult' => '◉', 'diagnostic' => '▥', 'data' => '◇', 'scope' => '⌁'][$key] }}</i>{{ $proof }}</span>
                @endforeach
            </div>
        </div>
        <div class="hero-visual reveal" data-globe-root>
            <div class="globe-shell">
                <img class="globe-fallback" src="{{ asset('images/hero/ai-earth-emerald.webp') }}" srcset="{{ asset('images/hero/ai-earth-emerald-560.webp') }} 560w, {{ asset('images/hero/ai-earth-emerald.webp') }} 1000w" sizes="(max-width: 760px) 90vw, 50vw" alt="{{ __('site.home.earth_alt') }}" width="1000" height="1000" fetchpriority="high" decoding="async">
                <canvas class="globe-canvas" data-globe aria-hidden="true"></canvas>
                <div class="globe-core"><span>DN</span><small>GROWTH OS</small></div>
                <div class="orbit-label orbit-label-1">AI</div><div class="orbit-label orbit-label-2">DATA</div><div class="orbit-label orbit-label-3">CRM</div><div class="orbit-label orbit-label-4">GROWTH</div>
            </div>
            <div class="metric-grid">
                @foreach (__('site.home.metrics') as $metric)
                    <article class="metric-card"><span>{{ $metric['label'] }}</span><strong>{{ $metric['value'] }}</strong><small>{{ $metric['note'] }}</small><i aria-hidden="true"></i></article>
                @endforeach
            </div>
        </div>
    </div>
</section>

<section class="section services-section">
    <div class="container panel reveal">
        <div class="section-head split">
            <div><p class="eyebrow">{{ __('site.home.services_kicker') }}</p><h2>{!! __('site.home.services_title') !!}</h2></div>
            <p>{{ __('site.home.services_lead') }}</p>
        </div>
        <div class="service-grid">
            @foreach ($services as $service)
                <article class="service-card tilt-card">
                    <div class="service-icon" aria-hidden="true">{{ ['◌','◇','↗','▦'][$loop->index] ?? '✦' }}</div>
                    <h3>{{ localized($service->name) }}</h3>
                    <p>{{ localized($service->summary) }}</p>
                    <a href="{{ route('pricing', ['locale' => app()->getLocale()]) }}">{{ __('site.common.learn_more') }} <span>→</span></a>
                </article>
            @endforeach
        </div>
    </div>
</section>

<section class="section story-section" data-story>
    <div class="container section-head centered reveal">
        <p class="eyebrow">{{ __('site.home.story_kicker') }}</p>
        <h2>{{ __('site.home.story_title') }}</h2>
        <p>{{ __('site.home.story_lead') }}</p>
    </div>
    <div class="container story-grid">
        <div class="story-visual" aria-hidden="true">
            <div class="story-orbit"><div class="story-earth"><img src="{{ asset('images/hero/ai-earth-emerald.webp') }}" alt="" width="700" height="700" loading="lazy"></div><span class="story-ring ring-a"></span><span class="story-ring ring-b"></span><span class="story-ring ring-c"></span></div>
            <div class="phase-indicator"><span data-phase-number>01</span><strong data-phase-title>{{ __('site.home.phases.0.title') }}</strong></div>
        </div>
        <div class="phase-list">
            @foreach (__('site.home.phases') as $phase)
                <article class="phase-card reveal" data-phase="{{ $loop->index }}" data-phase-title="{{ $phase['title'] }}">
                    <span>{{ $phase['number'] }}</span><div><h3>{{ $phase['title'] }}</h3><p>{{ $phase['text'] }}</p></div>
                </article>
            @endforeach
        </div>
    </div>
</section>

<section class="section trusted-section">
    <div class="container panel reveal">
        <p class="eyebrow">{{ __('site.home.trusted') }}</p>
        <div class="logo-strip" aria-label="Selected clients"><span>ADEVA</span><span>KOI SERVICE</span><span>PHÊ LY COFFEE</span><span>PHONG CÁCH MỘC</span><span>PHÚC ĐẠI NAM</span><span>TMT MACHINE</span></div>
    </div>
</section>

<section class="section case-section">
    <div class="container case-grid">
        <div class="case-copy reveal"><p class="eyebrow">{{ __('site.home.case_kicker') }}</p><h2>{{ __('site.home.case_title') }}</h2><p>{{ __('site.home.case_text') }}</p><a class="button button-outline" href="{{ route('portfolio.index', ['locale' => app()->getLocale()]) }}">{{ __('site.common.view_case') }} <span>→</span></a></div>
        <div class="case-chart reveal"><div class="chart-grid"></div><div class="chart-bars">@foreach ([24,34,43,58,76,92] as $height)<i style="--bar:{{ $height }}%"></i>@endforeach</div><svg viewBox="0 0 600 240" role="img" aria-label="Illustrative growth trend"><path d="M20 210 C110 205 120 185 185 180 S280 150 330 130 S430 90 580 20" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="580" cy="20" r="8"/></svg><span class="chart-badge">+38.7%</span></div>
    </div>
</section>

<section class="section insights-section">
    <div class="container panel reveal">
        <div class="section-head split"><div><p class="eyebrow">{{ __('site.home.insights_kicker') }}</p><h2>{{ __('site.home.insights_title') }}</h2></div><a href="{{ route('insights.index', ['locale' => app()->getLocale()]) }}">{{ __('site.nav.insights') }} <span>→</span></a></div>
        <p class="section-intro">{{ __('site.home.insights_lead') }}</p>
        <div class="insight-grid insight-grid-home">
            @foreach ($posts as $post)
                <article class="insight-card">
                    <a class="insight-image" href="{{ route('insights.show', ['locale' => app()->getLocale(), 'slug' => $post->slug]) }}"><img src="{{ asset($post->cover_image) }}" alt="{{ localized($post->title) }}" width="560" height="360" loading="lazy"></a>
                    <div><span>{{ localized($post->category?->name) }}</span><h3><a href="{{ route('insights.show', ['locale' => app()->getLocale(), 'slug' => $post->slug]) }}">{{ localized($post->title) }}</a></h3><small>{{ __('site.common.minutes', ['count' => reading_time(localized($post->body))]) }} →</small></div>
                </article>
            @endforeach
        </div>
    </div>
</section>
@endsection
