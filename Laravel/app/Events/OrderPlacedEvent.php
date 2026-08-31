<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan class Event ke dalam namespace App\Events.
// Konsep PBO: Pengorganisasian arsitektur Event-Driven (Pub/Sub).
// -----------------------------------------------------------------------------
namespace App\Events;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor class Model Order dan komponen broadcasting Laravel.
// Konsep PBO: Pola Pewarisan, Dependency Injection, & Implementasi Antarmuka (Interface).
// -----------------------------------------------------------------------------
use App\Models\Order;                                         // Objek Model Pesanan
use Illuminate\Broadcasting\Channel;                           // Representasi Channel Publik WebSocket
use Illuminate\Broadcasting\InteractsWithSockets;             // Trait interaksi socket
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;     // INTERFACE KONTRAK: Broadcast instan tanpa antrean
use Illuminate\Foundation\Events\Dispatchable;                // Trait agar event bisa dipanggil via ::dispatch()
use Illuminate\Queue\SerializesModels;                        // Trait untuk serialisasi objek model Eloquent

/**
 * =============================================================================
 * CLASS: OrderPlacedEvent (Pemrograman Berorientasi Objek / PBO)
 * =============================================================================
 * Blueprint event notifikasi saat ada pesanan baru yang dibuat oleh pelanggan.
 *
 * Konsep PBO yang Diterapkan:
 * 1. INTERFACE REALIZATION: Mengimplementasikan kontrak 'ShouldBroadcastNow'.
 * 2. TRAIT COMPOSITION    : Menggunakan Dispatchable, InteractsWithSockets, SerializesModels.
 * 3. DEPENDENCY INJECTION : Menerima objek Order pada Constructor (__construct).
 * 4. METHOD OVERRIDING    : Meng-override broadcastOn(), broadcastAs(), dan broadcastWith().
 * =============================================================================
 */
class OrderPlacedEvent implements ShouldBroadcastNow
{
    // Komposisi trait bawaan Laravel
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // -------------------------------------------------------------------------
    // PROPERTI PUBLIK OBJEK (State): Data yang siap diserialisasi ke JSON
    // -------------------------------------------------------------------------
    public $order;      // Objek Order transaksi pesanan
    public $message;    // Teks pesan notifikasi ringkas
    public $timestamp;  // Waktu ISO8601 pembuatan event

    /**
     * =========================================================================
     * CONSTRUCTOR PBO: __construct(Order $order)
     * =========================================================================
     * Konstruktor objek: Menerima instansiasi objek Order via Type-Hinting.
     *
     * @param Order $order Objek model transaksi pesanan
     */
    public function __construct(Order $order)
    {
        // 1. Muat relasi daftar menu hidangan (items) jika belum termuat
        $this->order = $order->loadMissing('items');
        
        // 2. Bentuk teks pesan notifikasi dinamis
        $this->message = "Pesanan baru #{$order->order_id} dari {$order->customer_name} telah diterima!";
        
        // 3. Rekam timestamp waktu sekarang dalam format ISO 8601
        $this->timestamp = now()->toIso8601String();
    }

    /**
     * =========================================================================
     * METHOD OVERRIDING PBO: broadcastOn()
     * =========================================================================
     * Menentukan channel WebSocket tujuan pengiriman broadcast realtime.
     *
     * @return array<Channel> Daftar objek channel WebSocket
     */
    public function broadcastOn(): array
    {
        // Mengirimkan event ke 2 channel publik secara bersamaan:
        return [
            new Channel('orders'),        // Channel khusus pantauan pesanan
            new Channel('activity-feed'), // Channel linimasa aktivitas admin resto
        ];
    }

    /**
     * =========================================================================
     * METHOD OVERRIDING PBO: broadcastAs()
     * =========================================================================
     * Menentukan nama event kustom yang akan ditangkap oleh Laravel Echo di frontend.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        // Nama event yang didengarkan oleh React/Next.js: 'order.placed'
        return 'order.placed';
    }

    /**
     * =========================================================================
     * METHOD OVERRIDING PBO: broadcastWith()
     * =========================================================================
     * Menentukan payload data JSON yang dikirimkan melalui WebSocket Reverb.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'type'          => 'ORDER_PLACED',                                      // Tipe event
            'order_id'      => $this->order->order_id,                              // ID pesanan
            'customer_name' => $this->order->customer_name,                          // Nama pelanggan
            'total_amount'  => $this->order->total ?? $this->order->total_amount,   // Total tagihan
            'status'        => $this->order->status,                                // Status ('RECEIVED')
            'items_count'   => $this->order->items ? count($this->order->items) : 0,// Total porsi menu
            'message'       => $this->message,                                      // Pesan teks
            'timestamp'     => $this->timestamp,                                    // Timestamp waktu
            'order'         => $this->order,                                        // Payload objek Order utuh
        ];
    }
}

