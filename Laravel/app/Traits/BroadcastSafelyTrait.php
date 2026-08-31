<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan Trait ke dalam namespace App\Traits.
// Konsep PBO: Isolasi logic reusable agar bisa di-inject ke berbagai class Controller.
// -----------------------------------------------------------------------------
namespace App\Traits;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor exception broadcasting dan logger Laravel.
// Konsep PBO: Penanganan eksepsi bertingkat (Polymorphic Exception Handling).
// -----------------------------------------------------------------------------
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * =============================================================================
 * TRAIT: BroadcastSafelyTrait (Pemrograman Berorientasi Objek / PBO)
 * =============================================================================
 * Trait pembantu untuk memancarkan objek event realtime ke WebSocket Reverb
 * dengan proteksi error (Fault-Tolerant & Resilient).
 *
 * Konsep PBO yang Diterapkan:
 * 1. TRAIT COMPOSITION : Menempelkan kapabilitas broadcast aman ke controller.
 * 2. EXCEPTION HANDLING: Mengenkapsulasi blok try-catch agar transaksi utama
 *                        tetap sukses walaupun server WebSocket offline.
 * =============================================================================
 */
trait BroadcastSafelyTrait
{
    /**
     * =========================================================================
     * METODE PBO (Protected): safeBroadcast()
     * =========================================================================
     * Memancarkan objek event realtime ke antrean event broadcaster.
     * Hak akses 'protected' menjamin metode ini hanya bisa dipanggil oleh
     * class controller yang mengadopsi trait ini.
     *
     * @param object $event Objek Event (misal: OrderPlacedEvent, OrderStatusUpdatedEvent)
     * @return void
     */
    protected function safeBroadcast(object $event): void
    {
        try {
            // 1. Pancarkan event menggunakan helper global Laravel event()
            event($event);
        } catch (BroadcastException $e) {
            // 2. Tangkap exception khusus WebSocket tanpa membatalkan transaksi utama
            Log::warning('[Reverb WebSocket Warning] Gagal mengirim event (jalankan "php artisan reverb:start"): ' . $e->getMessage());
        } catch (Throwable $e) {
            // 3. Tangkap generic throwable exception untuk proteksi fatal error
            Log::warning('[Reverb WebSocket Error]: ' . $e->getMessage());
        }
    }
}

