<?php

namespace App\Events;

use App\Models\ProductItem;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event: ProductStockUpdatedEvent
 * Dipancarkan saat stok produk berubah atau status ketersediaan diubah.
 */
class ProductStockUpdatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $product;
    public $message;
    public $timestamp;

    public function __construct(ProductItem $product, ?string $message = null)
    {
        $this->product = $product;
        $this->message = $message ?? "Stok produk {$product->name} telah diperbarui menjadi {$product->stock}";
        $this->timestamp = now()->toIso8601String();
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('products'),
            new Channel('activity-feed'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'product.stock.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'type' => 'PRODUCT_STOCK_UPDATED',
            'product_id' => $this->product->id,
            'name' => $this->product->name,
            'stock' => $this->product->stock,
            'status' => $this->product->status,
            'visibility' => (bool) $this->product->visibility,
            'message' => $this->message,
            'timestamp' => $this->timestamp,
            'product' => $this->product,
        ];
    }
}
