<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan class API Resource ke dalam namespace App\Http\Resources.
// -----------------------------------------------------------------------------
namespace App\Http\Resources;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor class dasar JsonResource Laravel.
// -----------------------------------------------------------------------------
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource; // Superclass Transformasi JSON

/**
 * =============================================================================
 * CLASS: OrderItemResource (Data Transfer Object / API Resource Rincian Hidangan)
 * =============================================================================
 * Bertanggung jawab mengubah objek Model Eloquent 'OrderItem' menjadi format JSON
 * untuk rincian menu makanan di invoice dan antarmuka checkout.
 * =============================================================================
 */
class OrderItemResource extends JsonResource
{
    /**
     * Mengubah resource objek model item menjadi array JSON.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,                              // ID baris tabel order_items
            'order_id'   => $this->order_id,                        // ID pesanan induk
            'product_id' => $this->product_id,                      // ID master produk hidangan
            'name'       => $this->name,                            // Snapshot nama makanan saat dibeli
            'price'      => (float) $this->price,                   // Snapshot harga satuan (float)
            'quantity'   => (int) $this->quantity,                  // Jumlah porsi yang dipesan (integer)
            'subtotal'   => (float) ($this->price * $this->quantity),// Nilai subtotal baris (price x quantity)
            'image'      => $this->image,                           // URL foto thumbnail hidangan
            'notes'      => $this->notes,                           // Catatan khusus pelanggan per menu
        ];
    }
}

