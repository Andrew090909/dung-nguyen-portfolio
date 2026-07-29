@extends('layouts.app')
@section('content')
@include('partials.page-hero', ['eyebrow' => __('site.portfolio.eyebrow'), 'title' => __('site.portfolio.title'), 'lead' => __('site.portfolio.lead')])
<x-breadcrumbs :seo="$seo" />
<section class="section portfolio-section"><div class="container">
@if(session('status'))<div class="alert success">{{ session('status') }}</div>@endif
@if(!$unlocked)
<div class="portfolio-gate panel reveal"><div class="gate-icon">⌁</div><p class="eyebrow">{{ __('site.portfolio.gate_kicker') }}</p><h2>{{ __('site.portfolio.gate_title') }}</h2><p>{{ __('site.portfolio.gate_text') }}</p>
<form method="post" action="{{ route('portfolio.unlock', ['locale' => app()->getLocale()]) }}" class="gate-form">@csrf<label><span>{{ __('site.portfolio.password') }}</span><input type="password" name="password" autocomplete="current-password" required></label><button class="button button-primary" type="submit">{{ __('site.portfolio.unlock') }} →</button></form>
@error('password')<p class="field-error">{{ $message }}</p>@enderror</div>
@else
<div class="portfolio-grid">@foreach($projects as $project)<article class="project-card reveal"><a href="{{ route('portfolio.show', ['locale' => app()->getLocale(), 'slug' => $project->slug]) }}"><div class="project-image"><img src="{{ asset('images/portfolio/'.($project->images[0] ?? 'portfolio-placeholder.webp')) }}" alt="{{ localized($project->title) }}" width="760" height="520" loading="lazy"></div><div class="project-meta"><span>{{ $project->year }}</span><span>{{ localized($project->industry) }}</span></div><h2>{{ localized($project->title) }}</h2><p>{{ localized($project->context) }}</p><span class="project-link">{{ __('site.common.view_case') }} →</span></a></article>@endforeach</div>
@endif
</div></section>
@endsection
