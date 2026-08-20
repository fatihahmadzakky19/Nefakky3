<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'name' => 'nullable|string|max:150',
            'phone' => 'nullable|string|max:30',
            'avatar' => 'nullable|string',
            'email' => 'nullable|email|unique:users,email,' . $userId,
        ];
    }
}
