<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event: OrderStatusUpdatedEvent
 * Dipancarkan saat tahapan status pengiriman pesanan berubah (5-Tahap) atau dibatalkan/dikonfirmasi.
 */
class OrderStatusUpdatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;
    public $oldStatus;
    public $newStatus;
    public $message;
    public $timestamp;

    public function __construct(Order $order, ?string $oldStatus = null, ?string $customMessage = null)
    {
        $this->order = $order->loadMissing('items');
        $this->oldStatus = $oldStatus;
        $this->newStatus = $order->status;
        $this->message = $customMessage ?? "Status pesanan #{$order->order_id} diperbarui menjadi {$order->status}";
        $this->timestamp = now()->toIso8601String();
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('orders'),
            new Channel('order.' . $this->order->order_id),
            new Channel('activity-feed'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'type' => 'ORDER_STATUS_UPDATED',
            'order_id' => $this->order->order_id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'customer_name' => $this->order->customer_name,
            'message' => $this->message,
            'timestamp' => $this->timestamp,
            'order' => $this->order,
        ];
    }
}
