@if (!empty($seo['breadcrumbs']))
<nav class="breadcrumbs container" aria-label="Breadcrumb">
    <ol>
        @foreach ($seo['breadcrumbs'] as $item)
            <li><a href="{{ $item['url'] }}">{{ $item['name'] }}</a></li>
        @endforeach
    </ol>
</nav>
@endif
