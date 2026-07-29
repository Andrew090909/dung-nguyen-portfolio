<?php

namespace App\Modules\Admin\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasRole('super_admin', 'editor') ?? false; }

    public function rules(): array
    {
        $id = $this->route('category')?->id ?? $this->route('category');

        return [
            'name' => ['required', 'array'], 'name.*' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'alpha_dash', 'max:190', Rule::unique('categories', 'slug')->ignore($id)],
            'description' => ['nullable', 'array'], 'description.*' => ['nullable', 'string', 'max:600'],
            'type' => ['required', Rule::in(['post', 'product'])],
            'is_active' => ['nullable', 'boolean'], 'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
