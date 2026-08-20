<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'nullable|string|in:RECEIVED,COOKING,READY,DELIVERING,COMPLETED,CANCELLED,PENDING',
            'payment_badge' => 'nullable|string|in:PAID,AWAITING,REFUNDED,FAILED',
            'customer_confirmed' => 'nullable|boolean',
            'proof_photo' => 'nullable|string',
            'payment_proof_photo' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
    }
}
