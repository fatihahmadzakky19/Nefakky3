<?php

namespace App\Traits;

use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Trait BroadcastSafelyTrait
 * Memancarkan event broadcast WebSocket Reverb secara aman dan tangguh (resilient).
 * Menjamin endpoint REST API tetap berjalan sukses meskipun WebSocket Reverb sedang tidak aktif.
 */
trait BroadcastSafelyTrait
{
    /**
     * Memancarkan event realtime ke Laravel Reverb
     */
    protected function safeBroadcast(object $event): void
    {
        try {
            event($event);
        } catch (BroadcastException $e) {
            Log::warning('[Reverb WebSocket Warning] Gagal mengirim event (jalankan "php artisan reverb:start"): ' . $e->getMessage());
        } catch (Throwable $e) {
            Log::warning('[Reverb WebSocket Error]: ' . $e->getMessage());
        }
    }
}
