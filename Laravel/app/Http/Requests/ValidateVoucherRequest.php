<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidateVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Kode voucher wajib diisi.',
            'subtotal.required' => 'Subtotal belanja wajib diisi.',
            'subtotal.min' => 'Subtotal belanja tidak boleh negatif.',
        ];
    }
}
