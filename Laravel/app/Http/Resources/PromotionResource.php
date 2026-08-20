<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PromotionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->promotion_id,
            'promotion_id' => $this->promotion_id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'tag' => $this->tag,
            'badge' => $this->badge,
            'image' => $this->image,
            'duration' => $this->duration,
            'type' => $this->type,
            'used_count' => (int) $this->used_count,
            'usedCount' => (int) $this->used_count,
            'total_limit' => (int) $this->total_limit,
            'totalLimit' => (int) $this->total_limit,
            'is_active' => (bool) $this->is_active,
            'isActive' => (bool) $this->is_active,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
