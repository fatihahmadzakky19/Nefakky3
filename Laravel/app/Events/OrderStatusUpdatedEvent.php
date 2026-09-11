<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan class Event ke dalam namespace App\Events.
// -----------------------------------------------------------------------------
namespace App\Events;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor model Order dan interface broadcasting Laravel.
// -----------------------------------------------------------------------------
use App\Models\Order;                                         // Model entitas Pesanan
use Illuminate\Broadcasting\Channel;                         // Representasi Channel Publik WebSocket
use Illuminate\Broadcasting\InteractsWithSockets;             // Trait interaksi socket
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;    // Interface Realtime Broadcast Instan (tanpa antrean queue)
use Illuminate\Foundation\Events\Dispatchable;               // Trait pemicu event
use Illuminate\Queue\SerializesModels;                       // Trait serialisasi model Eloquent

/**
 * =============================================================================
 * CLASS EVENT: OrderStatusUpdatedEvent (Pemancar Perubahan Status Pesanan)
 * =============================================================================
 * Dipancarkan saat tahapan status pesanan berubah (5-Tahap Dapur) atau dibatalkan,
 * menyiarkan data secara live ke WebSocket Reverb agar UI client terupdate otomatis.
 * =============================================================================
 */
class OrderStatusUpdatedEvent implements ShouldBroadcastNow
{
    // Komposisi Trait Laravel untuk Event Broadcasting
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // Deklarasi Properti Publik (Akan otomatis diserialisasi ke payload broadcast)
    public $order;       // Objek pesanan lengkap beserta rincian itemnya
    public $oldStatus;   // Status sebelum perubahan (misal: 'RECEIVED')
    public $newStatus;   // Status baru setelah perubahan (misal: 'COOKING')
    public $message;     // Teks notifikasi ramah pengguna
    public $timestamp;   // Waktu ISO 8601 terjadinya perubahan status

    /**
     * Konstruktor Event: Menyiapkan data sebelum disiarkan ke WebSocket.
     *
     * @param Order $order Objek model pesanan
     * @param string|null $oldStatus Status lama
     * @param string|null $customMessage Pesan khusus (opsional)
     */
    public function __construct(Order $order, ?string $oldStatus = null, ?string $customMessage = null)
    {
        $this->order = $order->loadMissing('items'); // Memuat relasi item jika belum ter-load
        $this->oldStatus = $oldStatus;
        $this->newStatus = $order->status;
        $this->message = $customMessage ?? "Status pesanan #{$order->order_id} diperbarui menjadi {$order->status}";
        $this->timestamp = now()->toIso8601String();
    }

    /**
     * Menentukan channel WebSocket tujuan pemancaran event.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('orders'),                          // Channel publik umum pesanan
            new Channel('order.' . $this->order->order_id), // Channel spesifik pesanan ini untuk live tracking pembeli
            new Channel('activity-feed'),                  // Channel activity feed dashboard admin
        ];
    }

    /**
     * Menentukan nama event kustom yang didengarkan oleh frontend (Laravel Echo).
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'order.status.updated';
    }

    /**
     * Menentukan struktur payload data JSON yang dikirimkan ke WebSocket.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'type'          => 'ORDER_STATUS_UPDATED',
            'order_id'      => $this->order->order_id,
            'old_status'    => $this->oldStatus,
            'new_status'    => $this->newStatus,
            'customer_name' => $this->order->customer_name,
            'message'       => $this->message,
            'timestamp'     => $this->timestamp,
            'order'         => $this->order,
        ];
    }
}

