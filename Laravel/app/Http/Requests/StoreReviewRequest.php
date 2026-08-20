<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'review_id' => 'nullable|string|unique:user_reviews,review_id',
            'product_id' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
            'author_name' => 'required|string|max:150',
            'author_email' => 'nullable|email|max:150',
            'author_badge' => 'nullable|string|max:50',
            'avatar' => 'nullable|string',
            'rating' => 'required|integer|min:1|max:5',
            'product_name' => 'nullable|string|max:150',
            'product_image' => 'nullable|string',
            'comment' => 'required|string',
            'photos' => 'nullable|array',
            'photos.*' => 'string',
        ];
    }

    public function messages(): array
    {
        return [
            'author_name.required' => 'Nama pengulas wajib diisi.',
            'rating.required' => 'Nilai rating bintang wajib dipilih (1-5).',
            'rating.min' => 'Rating minimal 1 bintang.',
            'rating.max' => 'Rating maksimal 5 bintang.',
            'comment.required' => 'Tuliskan komentar atau ulasan Anda.',
        ];
    }
}
