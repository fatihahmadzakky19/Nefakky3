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
 * CLASS: OrderResource (Data Transfer Object / API Resource Pesanan)
 * =============================================================================
 * Bertanggung jawab mengubah objek Model Eloquent 'Order' menjadi format JSON
 * terstandar, mendukung penamaan camelCase & snake_case untuk Frontend Next.js.
 * =============================================================================
 */
class OrderResource extends JsonResource
{
    /**
     * Mengubah resource objek model menjadi array data JSON.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // Identitas Kunci Transaksi
            'id'            => $this->order_id, // ID Pesanan (e.g. "ORD-88219")
            'order_id'      => $this->order_id, // Alias snake_case
            'user_id'       => $this->user_id,  // ID Pengguna pemilik pesanan
            
            // Informasi Pembeli (Disediakan dalam snake_case & camelCase)
            'customer_name'  => $this->customer_name,
            'customerName'   => $this->customer_name,
            'customer_email' => $this->customer_email,
            'customerEmail'  => $this->customer_email,
            'avatar'         => $this->avatar,
            'address'        => $this->address,
            'phone'          => $this->phone,
            
            // Kuantitas & Metode
            'item_count'     => (int) $this->item_count,
            'itemCount'      => (int) $this->item_count,
            'payment_method' => $this->payment_method,
            'paymentMethod'  => $this->payment_method,
            'payment_badge'  => $this->payment_badge,
            'paymentBadge'   => $this->payment_badge,
            'delivery_type'  => $this->delivery_type,
            'deliveryType'   => $this->delivery_type,
            'status'         => $this->status, // Status alur dapur: 'RECEIVED', 'COOKING', dll
            
            // Nilai Finansial (Dikonversi ke Float agar bertipe angka di JavaScript)
            'subtotal'       => (float) $this->subtotal,
            'shipping_cost'  => (float) $this->shipping_cost,
            'shippingCost'   => (float) $this->shipping_cost,
            'discount'       => (float) $this->discount,
            'total'          => (float) $this->total,
            
            // Konfirmasi & Tanggal (Format ISO 8601 & Teks Bahasa Indonesia)
            'customer_confirmed'  => (bool) $this->customer_confirmed,
            'customerConfirmed'   => (bool) $this->customer_confirmed,
            'confirmed_at'        => $this->confirmed_at?->toIso8601String(),
            'confirmedAt'         => $this->confirmed_at?->toIso8601String(),
            
            // Foto Bukti & Promo
            'proof_photo'         => $this->proof_photo,
            'proofPhoto'          => $this->proof_photo,
            'payment_proof_photo' => $this->payment_proof_photo,
            'paymentProofPhoto'   => $this->payment_proof_photo,
            'voucher_code'        => $this->voucher_code,
            'voucherCode'         => $this->voucher_code,
            'applied_promo'       => $this->applied_promo,
            'appliedPromo'        => $this->applied_promo,
            'notes'               => $this->notes,
            
            // Nested Relasi: Memuat daftar menu hidangan hanya jika relasi 'items' telah di-load
            'items'               => OrderItemResource::collection($this->whenLoaded('items')),
            
            // Format Tanggal Display Ramah Pengguna
            'date'                => $this->created_at?->translatedFormat('d M Y, H:i'),
            'created_at'          => $this->created_at?->toIso8601String(),
        ];
    }
}

