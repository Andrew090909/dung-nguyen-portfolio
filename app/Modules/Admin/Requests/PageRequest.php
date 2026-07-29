<?php

namespace App\Modules\Admin\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PageRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasRole('super_admin', 'editor') ?? false; }

    public function rules(): array
    {
        return [
            'key' => ['required', 'alpha_dash', 'max:100'],
            'slug' => ['required', 'array'], 'slug.*' => ['required', 'string', 'max:190'],
            'title' => ['required', 'array'], 'title.*' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'array'], 'content.*' => ['nullable', 'string'],
            'settings' => ['nullable', 'array'],
            'is_published' => ['nullable', 'boolean'],
        ];
    }
}
