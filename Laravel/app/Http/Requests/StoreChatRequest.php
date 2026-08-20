<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'chat_id' => 'nullable|string',
            'sender' => 'required|string|in:user,admin',
            'user_email' => 'required|email|max:150',
            'user_name' => 'required|string|max:150',
            'user_avatar' => 'nullable|string',
            'text' => 'required|string',
            'timestamp' => 'nullable|string',
            'media_url' => 'nullable|string',
            'media_type' => 'nullable|string|in:image,video',
        ];
    }
}
