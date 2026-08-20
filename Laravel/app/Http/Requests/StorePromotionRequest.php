<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePromotionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'promotion_id' => 'required|string|unique:promotions,promotion_id',
            'title' => 'required|string|max:150',
            'subtitle' => 'nullable|string|max:200',
            'tag' => 'nullable|string|max:50',
            'badge' => 'nullable|string|in:Active,Scheduled,Ended',
            'image' => 'required|string',
            'duration' => 'nullable|string|max:100',
            'type' => 'nullable|string|max:50',
            'total_limit' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ];
    }
}
