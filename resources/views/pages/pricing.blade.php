@extends('layouts.app')
@section('content')
@include('partials.page-hero', ['eyebrow' => __('site.pricing.eyebrow'), 'title' => __('site.pricing.title'), 'lead' => __('site.pricing.lead')])
<x-breadcrumbs :seo="$seo" />
<section class="section pricing-section"><div class="container pricing-grid">
@foreach ($packages as $package)
<article class="pricing-card reveal @if($loop->index===1) featured @endif">
    <div class="pricing-number">0{{ $loop->iteration }}</div><p class="eyebrow">{{ __('site.pricing.starting') }}</p><h2>{{ localized($package->name) }}</h2><p>{{ localized($package->summary) }}</p>
    <div class="price"><span>{{ __('site.common.from') }}</span><strong>{{ number_format((float)$package->price_from/1000000, 0) }}</strong><small>triệu VND<br>{{ $package->price_unit }}</small></div>
    <h3>{{ __('site.pricing.details') }}</h3><ul>@foreach (($package->features[app()->getLocale()] ?? $package->features['en'] ?? []) as $feature)<li>{{ $feature }}</li>@endforeach</ul>
    <a class="button @if($loop->index===1) button-primary @else button-outline @endif" href="{{ route('contact.index', ['locale' => app()->getLocale()]) }}">{{ __('site.pricing.cta') }} <span>→</span></a>
</article>
@endforeach
</div><div class="container pricing-note reveal"><p>{{ __('site.pricing.diagnostic_note') }}</p></div></section>
<section class="section performance-section"><div class="container panel split-card reveal"><div><p class="eyebrow">{{ __('site.pricing.performance_kicker') }}</p><h2>{{ __('site.pricing.performance_title') }}</h2></div><p>{{ __('site.pricing.performance_text') }}</p></div></section>
<section class="section process-section"><div class="container"><div class="section-head centered reveal"><p class="eyebrow">{{ __('site.pricing.process_kicker') }}</p><h2>{{ __('site.pricing.process_title') }}</h2></div><div class="process-grid">@foreach(__('site.pricing.steps') as $step)<article class="process-card reveal"><span>{{ $step['number'] }}</span><h3>{{ $step['title'] }}</h3><p>{{ $step['text'] }}</p></article>@endforeach</div></div></section>
@endsection
