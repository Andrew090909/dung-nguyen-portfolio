@extends('layouts.app')
@section('content')
<section class="case-hero"><div class="container"><p class="eyebrow">{{ localized($project->industry) }} · {{ $project->year }}</p><h1>{{ localized($project->title) }}</h1><p>{{ localized($project->context) }}</p></div></section>
<x-breadcrumbs :seo="$seo" />
<section class="section case-detail"><div class="container case-detail-grid"><aside class="case-sidebar"><p class="eyebrow">{{ __('site.portfolio.role') }}</p><p>{{ localized($project->role) }}</p></aside><div class="case-content"><section><p class="eyebrow">{{ __('site.portfolio.problem') }}</p><h2>{{ localized($project->problem) }}</h2></section><section><p class="eyebrow">{{ __('site.portfolio.approach') }}</p><p>{{ localized($project->approach) }}</p></section><section><p class="eyebrow">{{ __('site.portfolio.deliverables') }}</p><ul>@foreach(($project->deliverables[app()->getLocale()] ?? $project->deliverables['en']) as $item)<li>{{ $item }}</li>@endforeach</ul></section></div></div>
<div class="container project-gallery">@foreach($project->images as $image)<figure class="reveal"><img src="{{ asset('images/portfolio/'.$image) }}" alt="{{ localized($project->title) }} — image {{ $loop->iteration }}" width="1200" height="820" loading="lazy"></figure>@endforeach</div></section>
@endsection
