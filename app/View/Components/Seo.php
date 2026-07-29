<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Seo extends Component
{
    /** @param array<string, mixed> $data */
    public function __construct(public array $data) {}

    public function render(): View|Closure|string
    {
        return view('components.seo');
    }
}
