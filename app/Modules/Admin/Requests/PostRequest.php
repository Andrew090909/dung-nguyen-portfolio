<?php

namespace App\Modules\Admin\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PostRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasRole('super_admin', 'editor') ?? false; }

    public function rules(): array
    {
        $postId = $this->route('post')?->id ?? $this->route('post');

        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'author_id' => ['required', 'integer', 'exists:users,id'],
            'slug' => ['required', 'alpha_dash', 'max:190', Rule::unique('posts', 'slug')->ignore($postId)],
            'title' => ['required', 'array'],
            'title.vi' => ['required', 'string', 'max:255'],
            'title.en' => ['required', 'string', 'max:255'],
            'title.zh' => ['required', 'string', 'max:255'],
            'excerpt' => ['required', 'array'],
            'excerpt.*' => ['required', 'string', 'max:600'],
            'body' => ['required', 'array'],
            'body.*' => ['required', 'string'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'is_featured' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
