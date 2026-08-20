<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => 'nullable|string|unique:orders,order_id',
            'user_id' => 'nullable|exists:users,id',
            'customer_name' => 'required|string|max:150',
            'customer_email' => 'required|email|max:150',
            'avatar' => 'nullable|string',
            'address' => 'required|string',
            'phone' => 'nullable|string|max:30',
            'item_count' => 'nullable|integer|min:1',
            'payment_method' => 'nullable|string|max:50',
            'payment_badge' => 'nullable|string|max:20',
            'delivery_type' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:20',
            'subtotal' => 'required|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'voucher_code' => 'nullable|string|max:50',
            'applied_promo' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|string',
            'items.*.id' => 'nullable|string',
            'items.*.name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.image' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_name.required' => 'Nama pelanggan wajib diisi.',
            'customer_email.required' => 'Email pelanggan wajib diisi.',
            'address.required' => 'Alamat pengiriman wajib diisi.',
            'subtotal.required' => 'Subtotal belanja wajib diisi.',
            'total.required' => 'Total pembayaran wajib diisi.',
            'items.required' => 'Daftar item pesanan wajib disertakan.',
            'items.min' => 'Pesanan harus berisi minimal 1 item.',
        ];
    }
}
