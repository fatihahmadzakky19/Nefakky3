<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event: OrderPlacedEvent
 * Dipancarkan saat ada pesanan baru yang dibuat oleh pelanggan.
 * Mengirimkan notifikasi realtime ke admin dashboard dan channel pesanan.
 */
class OrderPlacedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;
    public $message;
    public $timestamp;

    public function __construct(Order $order)
    {
        $this->order = $order->loadMissing('items');
        $this->message = "Pesanan baru #{$order->order_id} dari {$order->customer_name} telah diterima!";
        $this->timestamp = now()->toIso8601String();
    }

    /**
     * Tentukan channel broadcast.
     * Menggunakan public channel 'orders' dan 'activity-feed'.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('orders'),
            new Channel('activity-feed'),
        ];
    }

    /**
     * Nama event yang akan ditangkap oleh Laravel Echo.
     */
    public function broadcastAs(): string
    {
        return 'order.placed';
    }

    /**
     * Data payload yang dikirim melalui WebSocket.
     */
    public function broadcastWith(): array
    {
        return [
            'type' => 'ORDER_PLACED',
            'order_id' => $this->order->order_id,
            'customer_name' => $this->order->customer_name,
            'total_amount' => $this->order->total_amount,
            'status' => $this->order->status,
            'items_count' => $this->order->items ? count($this->order->items) : 0,
            'message' => $this->message,
            'timestamp' => $this->timestamp,
            'order' => $this->order,
        ];
    }
}
