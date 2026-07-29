<?php

namespace App\Modules\Admin\Requests;

use App\Models\Page;
use App\Models\PortfolioProject;
use App\Models\Post;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SeoMetaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('super_admin', 'editor') ?? false;
    }

    public function rules(): array
    {
        return [
            'seoable_type' => ['required', Rule::in([Page::class, Post::class, Product::class, PortfolioProject::class])],
            'seoable_id' => ['required', 'integer'],
            'meta_title' => ['required', 'array'], 'meta_title.*' => ['required', 'string', 'max:64'],
            'meta_description' => ['required', 'array'], 'meta_description.*' => ['required', 'string', 'max:160'],
            'canonical_url' => ['nullable', 'url', 'max:500'],
            'og_title' => ['nullable', 'array'], 'og_title.*' => ['nullable', 'string', 'max:100'],
            'og_description' => ['nullable', 'array'], 'og_description.*' => ['nullable', 'string', 'max:200'],
            'og_image' => ['nullable', 'string', 'max:500'],
            'twitter_card' => ['required', Rule::in(['summary', 'summary_large_image'])],
            'robots' => ['required', 'string', 'max:120'],
            'schema' => ['nullable', 'array'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $type = $this->string('seoable_type')->toString();
            $id = $this->integer('seoable_id');

            if (class_exists($type) && ! $type::query()->whereKey($id)->exists()) {
                $validator->errors()->add('seoable_id', 'Đối tượng SEO không tồn tại.');
            }
        }];
    }
}
