<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->voucher_id,
            'voucher_id' => $this->voucher_id,
            'code' => $this->code,
            'name' => $this->name,
            'title' => $this->name,
            'description' => "Diskon " . ($this->type === 'percent' ? "{$this->discount_percent}%" : "Rp " . number_format($this->discount_value, 0, ',', '.')) . " min belanja Rp " . number_format($this->min_spend, 0, ',', '.'),
            'type' => $this->type ?? 'percent',
            'discount_percent' => (float) $this->discount_percent,
            'discountPercent' => (float) $this->discount_percent,
            'discount_value' => (float) $this->discount_value,
            'min_spend' => (float) $this->min_spend,
            'minSpend' => (float) $this->min_spend,
            'max_discount' => $this->max_discount ? (float) $this->max_discount : null,
            'used_count' => (int) $this->used_count,
            'usedCount' => (int) $this->used_count,
            'total_limit' => (int) $this->total_limit,
            'totalLimit' => (int) $this->total_limit,
            'redemptions' => $this->redemptions ?? "{$this->used_count}/{$this->total_limit}",
            'expiry' => $this->expiry,
            'valid_from' => $this->valid_from?->toIso8601String(),
            'valid_until' => $this->valid_until?->toIso8601String(),
            'validUntil' => $this->valid_until?->toIso8601String(),
            'valid_days' => $this->valid_days,
            'auto_reset_weekly' => (bool) $this->auto_reset_weekly,
            'event' => $this->event,
            'status' => $this->status,
            'is_active' => (bool) $this->is_active,
            'isActive' => (bool) $this->is_active,
            'image_url' => $this->image_url,
            'imageUrl' => $this->image_url,
        ];
    }
}
