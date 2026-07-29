@extends('layouts.app')
@section('content')
<article class="article-page"><header class="article-hero"><div class="container article-head"><p class="eyebrow">{{ localized($post->category?->name) }}</p><h1>{{ localized($post->title) }}</h1><p>{{ localized($post->excerpt) }}</p><div class="article-meta"><span>{{ __('site.insights.published', ['date' => $post->published_at?->format('d/m/Y')]) }}</span><span>{{ __('site.common.minutes', ['count' => reading_time(localized($post->body))]) }}</span></div></div><div class="container article-cover"><img src="{{ asset($post->cover_image) }}" alt="{{ localized($post->title) }}" width="1400" height="800" fetchpriority="high"></div></header>
<x-breadcrumbs :seo="$seo" />
<div class="container article-layout"><aside class="article-aside"><span>DN / INSIGHT</span><p>{{ __('site.footer.tagline') }}</p></aside><div class="prose">{!! localized($post->body) !!}</div></div></article>
@endsection
