<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item_id' => 'required|string|unique:product_items,item_id',
            'sku' => 'required|string|unique:product_items,sku',
            'name' => 'required|string|max:150',
            'category' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'stock' => 'nullable|integer|min:0',
            'visibility' => 'nullable|boolean',
            'status' => 'nullable|string',
            'rating' => 'nullable|numeric|min:1|max:5',
            'reviews_count' => 'nullable|integer|min:0',
            'sold_count' => 'nullable|string',
            'image' => 'required|string',
            'gallery' => 'nullable|array',
            'description' => 'required|string',
            'badge' => 'nullable|string|max:50',
            'ingredients' => 'nullable|string',
            'usage_advice' => 'nullable|string',
            'calories' => 'nullable|string|max:30',
            'fat' => 'nullable|string|max:30',
            'sugar' => 'nullable|string|max:30',
            'sat_fat' => 'nullable|string|max:30',
            'max_delivery_km' => 'nullable|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'item_id.required' => 'ID Produk (item_id) wajib diisi.',
            'item_id.unique' => 'ID Produk ini sudah terdaftar.',
            'sku.required' => 'SKU produk wajib diisi.',
            'sku.unique' => 'SKU produk sudah digunakan.',
            'name.required' => 'Nama produk wajib diisi.',
            'price.required' => 'Harga produk wajib diisi.',
            'image.required' => 'Gambar produk wajib diisi.',
            'description.required' => 'Deskripsi produk wajib diisi.',
        ];
    }
}
