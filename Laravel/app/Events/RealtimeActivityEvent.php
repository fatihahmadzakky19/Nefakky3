<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event: RealtimeActivityEvent
 * Dipancarkan untuk mempublikasikan notifikasi aktivitas live ke seluruh klien terhubung.
 */
class RealtimeActivityEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $title;
    public $message;
    public $category;
    public $data;
    public $timestamp;

    public function __construct(string $title, string $message, string $category = 'general', array $data = [])
    {
        $this->title = $title;
        $this->message = $message;
        $this->category = $category;
        $this->data = $data;
        $this->timestamp = now()->toIso8601String();
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('activity-feed'),
            new Channel('notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'activity.logged';
    }

    public function broadcastWith(): array
    {
        return [
            'type' => 'ACTIVITY_LOGGED',
            'title' => $this->title,
            'message' => $this->message,
            'category' => $this->category,
            'data' => $this->data,
            'timestamp' => $this->timestamp,
        ];
    }
}
