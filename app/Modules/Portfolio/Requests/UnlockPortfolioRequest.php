<?php

namespace App\Modules\Portfolio\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UnlockPortfolioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return ['password' => ['required', 'string', 'min:4', 'max:128']];
    }
}
