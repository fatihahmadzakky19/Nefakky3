<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $itemId = $this->route('product') ?? $this->route('id');

        return [
            'sku' => 'nullable|string|unique:product_items,sku,' . $itemId . ',item_id',
            'name' => 'nullable|string|max:150',
            'category' => 'nullable|string|max:100',
            'price' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'stock' => 'nullable|integer|min:0',
            'visibility' => 'nullable|boolean',
            'status' => 'nullable|string',
            'rating' => 'nullable|numeric|min:1|max:5',
            'reviews_count' => 'nullable|integer|min:0',
            'sold_count' => 'nullable|string',
            'image' => 'nullable|string',
            'gallery' => 'nullable|array',
            'description' => 'nullable|string',
            'badge' => 'nullable|string|max:50',
            'ingredients' => 'nullable|string',
            'usage_advice' => 'nullable|string',
            'calories' => 'nullable|string|max:30',
            'fat' => 'nullable|string|max:30',
            'sugar' => 'nullable|string|max:30',
            'sat_fat' => 'nullable|string|max:30',
            'max_delivery_km' => 'nullable|integer|min:1',
            'is_coming_soon' => 'nullable|boolean',
            'release_date' => 'nullable|string|max:50',
        ];
    }
}
