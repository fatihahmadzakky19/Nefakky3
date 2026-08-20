<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model Voucher
 * 
 * Model Eloquent ini merepresentasikan tabel 'vouchers' di database.
 * Berfungsi sebagai mesin validasi kupon promo belanja: memverifikasi syarat
 * minimal pembelanjaan, batas maksimal diskon, kuota penggunaan,
 * aturan hari (Weekend vs Weekday), dan auto-reset kuota mingguan (ISO Week).
 */
class Voucher extends Model
{
    use SoftDeletes;

    // Mengatur Primary Key menggunakan string custom (contoh: "VOUCH-01")
    protected $primaryKey = 'voucher_id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'voucher_id',         // ID unik voucher (contoh: "VOUCH-01")
        'code',               // Kode kupon unik yang diinputkan pengguna (contoh: "NEFAKKY10")
        'name',               // Nama/judul promosi voucher
        'type',               // Jenis potongan: "percent" (persentase) atau "fixed" (nominal tetap)
        'discount_percent',   // Besaran diskon persen jika type="percent"
        'discount_value',     // Besaran nominal diskon langsung jika type="fixed"
        'min_spend',          // Syarat minimal total belanja untuk dapat menggunakan voucher
        'max_discount',       // Batas nominal diskon maksimal yang bisa didapatkan
        'used_count',         // Jumlah voucher yang telah berhasil digunakan
        'total_limit',        // Batas kuota total pemakaian
        'redemptions',        // Label rasio penggunaan (contoh: "24/500")
        'expiry',             // Teks keterangan masa berlaku voucher
        'valid_days',         // Aturan hari berlaku ("Weekend (Sabtu & Minggu)", "All Days", dll)
        'event',              // Label nama event promosi
        'status',             // Status operasional ("Active", "Expired")
        'is_active',          // Status sakelar aktif (true/false)
        'auto_reset_weekly',  // Boolean: apakah kuota pemakaian di-reset tiap minggu baru
        'last_reset_week',    // Format minggu ISO saat terakhir di-reset (contoh: "2026-W34")
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'discount_percent' => 'float',
        'discount_value' => 'float',
        'min_spend' => 'float',
        'max_discount' => 'float',
        'used_count' => 'integer',
        'total_limit' => 'integer',
        'is_active' => 'boolean',
        'auto_reset_weekly' => 'boolean',
    ];

    /**
     * Helper Static PBO: Mengambil representasi string minggu ISO saat ini (contoh: "2026-W34").
     *
     * @return string
     */
    public static function getCurrentISOWeek(): string
    {
        return date('o-\WW');
    }

    /**
     * Metode Bisnis PBO: Memeriksa dan mereset kuota penggunaan voucher secara otomatis
     * jika opsi auto_reset_weekly aktif dan minggu kalender ISO telah berganti.
     *
     * @return void
     */
    public function checkAndResetWeekly(): void
    {
        if ($this->auto_reset_weekly) {
            $currentWeek = self::getCurrentISOWeek();
            if ($this->last_reset_week !== $currentWeek) {
                $this->used_count = 0;
                $this->last_reset_week = $currentWeek;
                $this->redemptions = "0/{$this->total_limit}";
                $this->save();
            }
        }
    }

    /**
     * Metode Bisnis PBO: Menghitung nominal diskon yang berhak didapatkan berdasarkan subtotal belanja.
     *
     * @param float $subtotal Total belanjaan kotor
     * @return float Nominal potongan harga
     */
    public function calculateDiscountAmount(float $subtotal): float
    {
        if ($this->type === 'percent') {
            $discount = ($subtotal * ($this->discount_percent / 100));
            // Terapkan batas maksimal diskon jika ditentukan
            if ($this->max_discount > 0 && $discount > $this->max_discount) {
                return (float) $this->max_discount;
            }
            return (float) $discount;
        }

        // Jika type='fixed'
        $discount = (float) $this->discount_value;
        if ($discount > $subtotal) {
            return (float) $subtotal;
        }
        return $discount;
    }

    /**
     * Metode Bisnis PBO: Memeriksa kelayakan kupon voucher terhadap nominal transaksi dan waktu pemakaian.
     *
     * @param float $subtotal
     * @return array<string, mixed> Hasil validasi [valid, message, discount_amount]
     */
    public function checkValidity(float $subtotal): array
    {
        $this->checkAndResetWeekly();

        // 1. Cek status keaktifan voucher
        if (!$this->is_active || $this->status !== 'Active') {
            return [
                'valid' => false,
                'message' => 'Voucher saat ini sedang tidak aktif atau sudah dinonaktifkan.',
                'discount_amount' => 0,
            ];
        }

        // 2. Cek kuota pemakaian
        if ($this->total_limit > 0 && $this->used_count >= $this->total_limit) {
            return [
                'valid' => false,
                'message' => 'Kuota penukaran voucher ini telah habis.',
                'discount_amount' => 0,
            ];
        }

        // 3. Cek syarat minimal belanja
        if ($this->min_spend > 0 && $subtotal < $this->min_spend) {
            $kurang = number_format($this->min_spend - $subtotal, 0, ',', '.');
            return [
                'valid' => false,
                'message' => "Minimal belanja untuk voucher ini adalah Rp " . number_format($this->min_spend, 0, ',', '.') . " (Kurang Rp {$kurang}).",
                'discount_amount' => 0,
            ];
        }

        // 4. Cek aturan hari (Weekend vs Weekday)
        if (!empty($this->valid_days) && str_contains(strtolower($this->valid_days), 'weekend')) {
            $dayOfWeek = (int) date('N'); // 1 (Senin) - 7 (Minggu)
            if ($dayOfWeek < 6) { // Bukan hari Sabtu (6) atau Minggu (7)
                return [
                    'valid' => false,
                    'message' => 'Voucher ini hanya berlaku pada akhir pekan (Sabtu & Minggu).',
                    'discount_amount' => 0,
                ];
            }
        }

        // Hitung nominal potongan
        $discountAmount = $this->calculateDiscountAmount($subtotal);

        return [
            'valid' => true,
            'message' => "Voucher berhasil digunakan! Anda hemat Rp " . number_format($discountAmount, 0, ',', '.'),
            'discount_amount' => $discountAmount,
        ];
    }
}
