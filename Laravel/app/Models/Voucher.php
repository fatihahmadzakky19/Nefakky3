<?php

// Namespace penempat Model dalam struktur folder Laravel Eloquent
namespace App\Models;

// Mengimpor kelas dasar Model dari Eloquent ORM Laravel
use Illuminate\Database\Eloquent\Model;

// Class Model Voucher yang merepresentasikan tabel 'vouchers' di database
class Voucher extends Model
{
    // Mengatur nama Primary Key khusus yaitu 'voucher_id'
    protected $primaryKey = 'voucher_id';
    // Menandakan bahwa primary key berbentuk string/custom, bukan auto-increment integer
    public $incrementing = false;
    // Menentukan tipe data dari Primary Key adalah string
    protected $keyType = 'string';

    // Kolom-kolom yang diizinkan untuk diisi secara massal
    protected $fillable = [
        'voucher_id', // ID unik voucher (cth: "vch-001")
        'code', // Kode promo voucher (cth: "PROMO50", "NEFAKKY20")
        'name', // Nama deskriptif promo voucher
        'discount_percent', // Persentase diskon (%)
        'min_spend', // Syarat minimal total belanja untuk klaim voucher (Rp)
        'expiry', // Tanggal kedaluwarsa voucher ("31 Des 2026", "Selamanya")
        'event', // Kategori/Event promo ("Pelanggan Baru", "Flash Sale", etc)
        'redemptions', // Kuota penggunaan ("0/500", "Tanpa Batas")
        'status', // Status keaktifan voucher ("Active", "Expired")
        'is_active', // Flag boolean status aktif (true/false)
    ];

    // Casting tipe data kolom
    protected $casts = [
        'discount_percent' => 'float', // Konversi persen diskon ke desimal/float
        'min_spend' => 'float', // Konversi minimal belanja ke desimal/float
        'is_active' => 'boolean', // Konversi status aktif ke boolean (true/false)
    ];

    /**
     * Metode PBO: Validasi & Hitung Potongan Diskon Berdasarkan Subtotal Belanja
     */
    public function calculateDiscountAmount(float $subtotal): float
    {
        // Periksa apakah subtotal memenuhi syarat min_spend, voucher aktif, dan statusnya 'Active'
        if ($subtotal >= $this->min_spend && $this->is_active && $this->status === 'Active') {
            // Hitung nominal potongan harga (Subtotal x Persen Diskon / 100) dan bulatkan
            return round($subtotal * ($this->discount_percent / 100));
        }
        // Jika syarat tidak terpenuhi, kembalikan nominal potongan 0.0
        return 0.0;
    }
}

