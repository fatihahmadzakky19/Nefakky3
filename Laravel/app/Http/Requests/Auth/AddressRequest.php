<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class AddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => 'nullable|string|max:50',
            'receiver_name' => 'required|string|max:100',
            'receiver_phone' => 'required|string|max:30',
            'address' => 'required|string|max:500',
            'is_default' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'receiver_name.required' => 'Nama penerima wajib diisi.',
            'receiver_phone.required' => 'Nomor telepon penerima wajib diisi.',
            'address.required' => 'Alamat lengkap wajib diisi.',
        ];
    }
}
