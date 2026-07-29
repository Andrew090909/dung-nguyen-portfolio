<title>{{ $data['title'] }}</title>
<meta name="description" content="{{ $data['description'] }}">
<meta name="robots" content="{{ $data['robots'] }}">
<link rel="canonical" href="{{ $data['canonical'] }}">
<meta property="og:locale" content="{{ ['vi' => 'vi_VN', 'en' => 'en_US', 'zh' => 'zh_CN'][app()->getLocale()] ?? 'vi_VN' }}">
<meta property="og:type" content="{{ $data['type'] }}">
<meta property="og:title" content="{{ $data['og_title'] }}">
<meta property="og:description" content="{{ $data['og_description'] }}">
<meta property="og:url" content="{{ $data['canonical'] }}">
<meta property="og:image" content="{{ $data['image'] }}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="Dũng Nguyễn">
<meta name="twitter:card" content="{{ $data['twitter_card'] }}">
<meta name="twitter:title" content="{{ $data['og_title'] }}">
<meta name="twitter:description" content="{{ $data['og_description'] }}">
<meta name="twitter:image" content="{{ $data['image'] }}">
@foreach ($data['alternates'] ?? [] as $alternateLocale => $alternateUrl)
<link rel="alternate" hreflang="{{ $alternateLocale }}" href="{{ $alternateUrl }}">
@endforeach
@if (!empty(($data['alternates'] ?? [])['vi']))
<link rel="alternate" hreflang="x-default" href="{{ $data['alternates']['vi'] }}">
@endif
@foreach ($data['schema'] ?? [] as $schema)
<script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) !!}</script>
@endforeach
