<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event: ChatMessageSentEvent
 * Dipancarkan saat ada pesan chat live baru dari pelanggan atau admin.
 */
class ChatMessageSentEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chatMessage;
    public $timestamp;

    public function __construct(ChatMessage $chatMessage)
    {
        $this->chatMessage = $chatMessage;
        $this->timestamp = now()->toIso8601String();
    }

    public function broadcastOn(): array
    {
        $cleanEmail = str_replace(['@', '.'], ['_', '_'], $this->chatMessage->user_email);

        return [
            new Channel('chat'),
            new Channel('chat.' . $cleanEmail),
        ];
    }

    public function broadcastAs(): string
    {
        return 'chat.message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'type' => 'CHAT_MESSAGE_SENT',
            'chat_id' => $this->chatMessage->chat_id,
            'user_email' => $this->chatMessage->user_email,
            'user_name' => $this->chatMessage->user_name,
            'sender' => $this->chatMessage->sender,
            'text' => $this->chatMessage->text,
            'timestamp' => $this->chatMessage->timestamp ?? now()->format('H:i A'),
            'message' => $this->chatMessage,
        ];
    }
}
