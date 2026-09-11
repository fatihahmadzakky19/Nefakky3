<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan class Form Request ke dalam namespace App\Http\Requests.
// -----------------------------------------------------------------------------
namespace App\Http\Requests;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor class dasar FormRequest Laravel.
// -----------------------------------------------------------------------------
use Illuminate\Foundation\Http\FormRequest; // Superclass Validasi Request

/**
 * =============================================================================
 * CLASS: StoreOrderRequest (Lapisan Validasi Form Pembuatan Pesanan)
 * =============================================================================
 * Bertanggung jawab memvalidasi seluruh payload data checkout dari frontend
 * sebelum data diizinkan masuk dan diproses oleh OrderController.
 * =============================================================================
 */
class StoreOrderRequest extends FormRequest
{
    /**
     * Menentukan hak otorisasi pengguna untuk menjalankan request ini.
     *
     * @return bool True mengizinkan seluruh pengunjung (termasuk tamu/guest) melakukan checkout
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan validasi ketat untuk setiap kolom payload checkout pesanan.
     *
     * @return array<string, string>
     */
    public function rules(): array
    {
        return [
            // Validasi ID Pesanan: boleh kosong (jika kosong diisi otomatis di controller), jika diisi harus string unik
            'order_id'       => 'nullable|string|unique:orders,order_id',
            
            // Validasi User ID: boleh kosong (untuk guest checkout), jika diisi wajib terdaftar di tabel users
            'user_id'        => 'nullable|exists:users,id',
            
            // Validasi Identitas Pembeli
            'customer_name'  => 'required|string|max:150', // Wajib diisi, string teks maks 150 karakter
            'customer_email' => 'required|email|max:150',  // Wajib diisi, format email valid
            'avatar'         => 'nullable|string',         // Boleh kosong, URL avatar
            'phone'          => 'nullable|string|max:30',  // Nomor HP / WhatsApp
            
            // Validasi Alamat Pengantaran
            'address'        => 'required|string',         // Wajib diisi, teks alamat lengkap
            
            // Validasi Nilai Finansial Transaksi
            'subtotal'       => 'required|numeric|min:0',  // Wajib angka numerik >= 0 (harga makanan)
            'shipping_cost'  => 'nullable|numeric|min:0',  // Ongkos kirim
            'discount'       => 'nullable|numeric|min:0',  // Diskon promo
            'total'          => 'required|numeric|min:0',  // Wajib angka numerik >= 0 (total akhir)
            
            // Validasi Metode & Kurir
            'payment_method' => 'nullable|string|max:50',  // Metode pembayaran (QRIS/BCA/COD)
            'payment_badge'  => 'nullable|string|max:20',  // Status pembayaran (UNPAID/PAID)
            'delivery_type'  => 'nullable|string|max:50',  // Jenis kurir (STANDARD/EXPRESS)
            'status'         => 'nullable|string|max:20',  // Status pesanan ('RECEIVED')
            'item_count'     => 'nullable|integer|min:1',  // Total kuantitas porsi
            
            // Validasi Voucher & Catatan
            'voucher_code'   => 'nullable|string|max:50',  // Kode kupon promo
            'applied_promo'  => 'nullable|string|max:100', // Label nama promo
            'notes'          => 'nullable|string',         // Catatan instruksi koki/kurir
            
            // Validasi Array Daftar Menu Makanan (Nested Array Validation)
            'items'              => 'required|array|min:1',    // Wajib berupa array dan minimal ada 1 hidangan
            'items.*.product_id' => 'nullable|string',         // ID unik produk hidangan
            'items.*.id'         => 'nullable|string',         // Fallback ID produk
            'items.*.name'       => 'required|string',         // Wajib ada nama hidangan
            'items.*.price'      => 'required|numeric|min:0',  // Wajib harga berupa angka non-negatif
            'items.*.quantity'   => 'required|integer|min:1',  // Wajib kuantitas porsi berupa integer minimal 1
            'items.*.image'      => 'nullable|string',         // URL foto thumbnail produk
        ];
    }

    /**
     * Pesan kesalahan khusus berbahasa Indonesia jika validasi gagal.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'customer_name.required' => 'Nama pelanggan wajib diisi.',
            'customer_email.required' => 'Email pelanggan wajib diisi.',
            'customer_email.email'    => 'Format alamat email tidak valid.',
            'address.required'        => 'Alamat pengiriman wajib diisi.',
            'subtotal.required'       => 'Subtotal belanja wajib diisi.',
            'total.required'          => 'Total tagihan pembayaran wajib diisi.',
            'items.required'          => 'Daftar item pesanan wajib disertakan.',
            'items.min'               => 'Pesanan harus berisi minimal 1 menu hidangan.',
            'items.*.quantity.min'    => 'Jumlah porsi setiap menu minimal adalah 1.',
        ];
    }
}

