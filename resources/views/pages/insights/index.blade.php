@extends('layouts.app')
@section('content')
@include('partials.page-hero', ['eyebrow' => __('site.insights.eyebrow'), 'title' => __('site.insights.title'), 'lead' => __('site.insights.lead')])
<x-breadcrumbs :seo="$seo" />
<section class="section"><div class="container">@if($posts->count())<div class="insight-grid">@foreach($posts as $post)<article class="insight-card reveal"><a class="insight-image" href="{{ route('insights.show', ['locale' => app()->getLocale(), 'slug' => $post->slug]) }}"><img src="{{ asset($post->cover_image) }}" alt="{{ localized($post->title) }}" width="720" height="460" loading="lazy"></a><div><span>{{ localized($post->category?->name) }}</span><h2><a href="{{ route('insights.show', ['locale' => app()->getLocale(), 'slug' => $post->slug]) }}">{{ localized($post->title) }}</a></h2><p>{{ localized($post->excerpt) }}</p><small>{{ __('site.common.minutes', ['count' => reading_time(localized($post->body))]) }} →</small></div></article>@endforeach</div><div class="pagination-wrap">{{ $posts->links() }}</div>@else<p>{{ __('site.insights.empty') }}</p>@endif</div></section>
@endsection
