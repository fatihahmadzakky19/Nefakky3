<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->review_id,
            'review_id' => $this->review_id,
            'product_id' => $this->product_id,
            'user_id' => $this->user_id,
            'author_name' => $this->author_name,
            'authorName' => $this->author_name,
            'author_email' => $this->author_email,
            'authorEmail' => $this->author_email,
            'author_badge' => $this->author_badge,
            'avatar' => $this->avatar,
            'rating' => (int) $this->rating,
            'date' => $this->date ?? $this->created_at?->translatedFormat('d M Y'),
            'product_name' => $this->product_name,
            'productName' => $this->product_name,
            'product_image' => $this->product_image,
            'productImage' => $this->product_image,
            'comment' => $this->comment,
            'likes_count' => (int) $this->likes_count,
            'likesCount' => (int) $this->likes_count,
            'status' => $this->status,
            'flagged_reason' => $this->flagged_reason,
            'is_pinned' => (bool) $this->is_pinned,
            'isPinned' => (bool) $this->is_pinned,
            'is_hidden' => (bool) $this->is_hidden,
            'isHidden' => (bool) $this->is_hidden,
            'photos' => $this->photos ?? [],
            'replies' => $this->replies ?? [],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
