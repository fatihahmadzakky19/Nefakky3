<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->item_id,
            'item_id' => $this->item_id,
            'sku' => $this->sku,
            'name' => $this->name,
            'category' => $this->category,
            'price' => (float) $this->price,
            'discount' => (float) $this->discount,
            'final_price' => $this->getFinalPrice(),
            'stock' => (int) $this->stock,
            'visibility' => (bool) $this->visibility,
            'status' => $this->status,
            'rating' => (float) $this->rating,
            'reviews_count' => (int) $this->reviews_count,
            'sold_count' => $this->sold_count ?? '0 Terjual',
            'image' => $this->image,
            'gallery' => $this->gallery ?? [],
            'description' => $this->description,
            'badge' => $this->badge,
            'ingredients' => $this->ingredients,
            'usage_advice' => $this->usage_advice,
            'usageAdvice' => $this->usage_advice,
            'origin' => $this->origin ?? 'Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia',
            'calories' => $this->calories,
            'fat' => $this->fat,
            'sugar' => $this->sugar,
            'sat_fat' => $this->sat_fat,
            'satFat' => $this->sat_fat,
            'reviewsCount' => (int) $this->reviews_count,
            'soldCount' => $this->sold_count ?? '0 Terjual',
            'maxDeliveryKm' => (int) ($this->max_delivery_km ?? 25),
            'max_delivery_km' => (int) ($this->max_delivery_km ?? 25),
            'is_coming_soon' => (bool) ($this->is_coming_soon ?? false),
            'isComingSoon' => (bool) ($this->is_coming_soon ?? false),
            'release_date' => $this->release_date,
            'releaseDate' => $this->release_date,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
