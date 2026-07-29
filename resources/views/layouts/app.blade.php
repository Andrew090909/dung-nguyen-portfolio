<!doctype html>
<html lang="{{ app()->getLocale() }}" dir="ltr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#effcf7">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <x-seo :data="$seo" />
    <link rel="icon" href="{{ asset('images/ui/favicon.svg') }}" type="image/svg+xml">
    <link rel="manifest" href="{{ asset('site.webmanifest') }}">
    @stack('head')
    @include('partials.critical-css')
    @vite(['resources/scss/app.scss', 'resources/js/app.js'])
</head>
<body class="page-{{ Route::currentRouteName() }}" data-locale="{{ app()->getLocale() }}">
    <a class="skip-link" href="#main-content">{{ __('site.common.skip_to_content') }}</a>
    @include('partials.header')
    <main id="main-content">
        @yield('content')
    </main>
    @include('partials.footer')
    <div class="cursor-orbit" aria-hidden="true"></div>
</body>
</html>
