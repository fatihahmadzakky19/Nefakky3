<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->order_id,
            'order_id' => $this->order_id,
            'user_id' => $this->user_id,
            'customer_name' => $this->customer_name,
            'customerName' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'customerEmail' => $this->customer_email,
            'avatar' => $this->avatar,
            'address' => $this->address,
            'phone' => $this->phone,
            'item_count' => (int) $this->item_count,
            'itemCount' => (int) $this->item_count,
            'payment_method' => $this->payment_method,
            'paymentMethod' => $this->payment_method,
            'payment_badge' => $this->payment_badge,
            'paymentBadge' => $this->payment_badge,
            'delivery_type' => $this->delivery_type,
            'deliveryType' => $this->delivery_type,
            'status' => $this->status,
            'subtotal' => (float) $this->subtotal,
            'shipping_cost' => (float) $this->shipping_cost,
            'shippingCost' => (float) $this->shipping_cost,
            'discount' => (float) $this->discount,
            'total' => (float) $this->total,
            'customer_confirmed' => (bool) $this->customer_confirmed,
            'customerConfirmed' => (bool) $this->customer_confirmed,
            'confirmed_at' => $this->confirmed_at?->toIso8601String(),
            'confirmedAt' => $this->confirmed_at?->toIso8601String(),
            'proof_photo' => $this->proof_photo,
            'proofPhoto' => $this->proof_photo,
            'payment_proof_photo' => $this->payment_proof_photo,
            'paymentProofPhoto' => $this->payment_proof_photo,
            'voucher_code' => $this->voucher_code,
            'voucherCode' => $this->voucher_code,
            'applied_promo' => $this->applied_promo,
            'appliedPromo' => $this->applied_promo,
            'notes' => $this->notes,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'date' => $this->created_at?->translatedFormat('d M Y, H:i'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
