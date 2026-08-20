<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->chat_id ?: 'chat-' . $this->id,
            'sender' => $this->sender,
            'userEmail' => $this->user_email,
            'userName' => $this->user_name,
            'userAvatar' => $this->user_avatar,
            'text' => $this->text,
            'timestamp' => $this->timestamp ?? $this->created_at?->translatedFormat('H:i A'),
            'readByAdmin' => (bool) $this->read_by_admin,
            'readByUser' => (bool) $this->read_by_user,
            'mediaUrl' => $this->media_url,
            'mediaType' => $this->media_type,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
