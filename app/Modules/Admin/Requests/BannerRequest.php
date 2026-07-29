<?php

namespace App\Modules\Admin\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BannerRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasRole('super_admin', 'editor') ?? false; }

    public function rules(): array
    {
        return [
            'key' => ['required', 'alpha_dash', 'max:100'],
            'title' => ['required', 'array'], 'title.*' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'array'], 'subtitle.*' => ['nullable', 'string', 'max:600'],
            'cta_label' => ['nullable', 'array'], 'cta_label.*' => ['nullable', 'string', 'max:120'],
            'cta_url' => ['nullable', 'string', 'max:500'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'is_active' => ['nullable', 'boolean'], 'starts_at' => ['nullable', 'date'], 'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
