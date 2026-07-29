<?php

namespace App\Modules\Admin\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasRole('super_admin') ?? false; }

    public function rules(): array
    {
        $id = $this->route('user')?->id ?? $this->route('user');

        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($id)],
            'password' => [$id ? 'nullable' : 'required', 'string', 'min:12', 'confirmed'],
            'role' => ['required', Rule::in(['super_admin', 'editor', 'analyst'])],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
