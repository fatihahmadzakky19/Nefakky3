<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'product_id' => $this->product_id,
            'name' => $this->name,
            'price' => (float) $this->price,
            'quantity' => (int) $this->quantity,
            'subtotal' => $this->getSubtotal(),
            'image' => $this->image,
            'notes' => $this->notes,
        ];
    }
}
