<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $voucherId = $this->route('voucher') ?? $this->route('id');

        return [
            'code' => 'nullable|string|max:50|unique:vouchers,code,' . $voucherId . ',voucher_id',
            'name' => 'nullable|string|max:150',
            'type' => 'nullable|string|in:percent,fixed',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'discount_value' => 'nullable|numeric|min:0',
            'min_spend' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'total_limit' => 'nullable|integer|min:1',
            'expiry' => 'nullable|string|max:50',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date',
            'valid_days' => 'nullable|string|max:50',
            'auto_reset_weekly' => 'nullable|boolean',
            'event' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:Active,Expired',
            'is_active' => 'nullable|boolean',
            'image_url' => 'nullable|string',
        ];
    }
}
