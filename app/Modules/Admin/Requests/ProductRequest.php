<?php

namespace App\Modules\Admin\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasRole('super_admin', 'editor') ?? false; }

    public function rules(): array
    {
        $id = $this->route('product')?->id ?? $this->route('product');

        return [
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'slug' => ['required', 'alpha_dash', 'max:190', Rule::unique('products', 'slug')->ignore($id)],
            'name' => ['required', 'array'], 'name.*' => ['required', 'string', 'max:255'],
            'summary' => ['required', 'array'], 'summary.*' => ['required', 'string', 'max:600'],
            'description' => ['nullable', 'array'], 'description.*' => ['nullable', 'string'],
            'features' => ['required', 'array'], 'features.*' => ['array'], 'features.*.*' => ['string', 'max:255'],
            'price_from' => ['nullable', 'numeric', 'min:0'],
            'price_unit' => ['nullable', 'string', 'max:80'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'is_active' => ['nullable', 'boolean'], 'is_featured' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
