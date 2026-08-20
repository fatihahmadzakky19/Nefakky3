<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model Voucher
 * 
 * Model Eloquent ini merepresentasikan tabel 'vouchers' di database.
 * Mengelola aturan voucher belanja, kalkulasi diskon persen/nominal, batas min spend,
 * kuota pemakaian, aturan tanggal (date) & jam (time), serta auto-reset mingguan.
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
        'voucher_id',         // String (30)
        'code',               // String (50) unik
        'name',               // String (150)
        'type',               // ENUM: 'percent', 'fixed'
        'discount_percent',   // DECIMAL (5, 2)
        'discount_value',     // DECIMAL (12, 2)
        'min_spend',          // DECIMAL (12, 2)
        'max_discount',       // DECIMAL (12, 2)
        'used_count',         // UNSIGNED INTEGER
        'total_limit',        // UNSIGNED INTEGER
        'redemptions',        // String (50)
        'expiry',             // String (100)
        'valid_from',         // DATETIME
        'valid_until',        // DATETIME
        'start_date',         // DATE
        'end_date',           // DATE
        'daily_start_time',   // TIME
        'daily_end_time',     // TIME
        'valid_day_type',     // ENUM: 'All Days', 'Weekend Only', 'Weekday Only'
        'valid_days',         // String (100)
        'auto_reset_weekly',  // BOOLEAN
        'last_reset_week',    // String (20)
        'event',              // String (100)
        'status',             // ENUM: 'Active', 'Expired', 'Disabled'
        'is_active',          // BOOLEAN
        'image_url',          // String (500)
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
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'auto_reset_weekly' => 'boolean',
    ];

    /**
     * Helper Static PBO: Mengambil representasi minggu ISO saat ini.
     *
     * @return string
     */
    public static function getCurrentISOWeek(): string
    {
        return date('o-\WW');
    }

    /**
     * Metode Bisnis PBO: Reset kuota mingguan jika auto_reset_weekly aktif.
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
     * Metode Bisnis PBO: Menghitung nominal diskon.
     *
     * @param float $subtotal
     * @return float
     */
    public function calculateDiscountAmount(float $subtotal): float
    {
        if ($this->type === 'percent') {
            $discount = ($subtotal * ($this->discount_percent / 100));
            if ($this->max_discount > 0 && $discount > $this->max_discount) {
                return (float) $this->max_discount;
            }
            return (float) $discount;
        }

        $discount = (float) $this->discount_value;
        if ($discount > $subtotal) {
            return (float) $subtotal;
        }
        return $discount;
    }

    /**
     * Metode Bisnis PBO: Validasi kelayakan voucher.
     *
     * @param float $subtotal
     * @return array<string, mixed>
     */
    public function checkValidity(float $subtotal): array
    {
        $this->checkAndResetWeekly();

        if (!$this->is_active || $this->status !== 'Active') {
            return [
                'valid' => false,
                'message' => 'Voucher saat ini sedang tidak aktif atau sudah dinonaktifkan.',
                'discount_amount' => 0,
            ];
        }

        if ($this->total_limit > 0 && $this->used_count >= $this->total_limit) {
            return [
                'valid' => false,
                'message' => 'Kuota penukaran voucher ini telah habis.',
                'discount_amount' => 0,
            ];
        }

        if ($this->min_spend > 0 && $subtotal < $this->min_spend) {
            $kurang = number_format($this->min_spend - $subtotal, 0, ',', '.');
            return [
                'valid' => false,
                'message' => "Minimal belanja untuk voucher ini adalah Rp " . number_format($this->min_spend, 0, ',', '.') . " (Kurang Rp {$kurang}).",
                'discount_amount' => 0,
            ];
        }

        if (!empty($this->valid_days) && str_contains(strtolower($this->valid_days), 'weekend')) {
            $dayOfWeek = (int) date('N');
            if ($dayOfWeek < 6) {
                return [
                    'valid' => false,
                    'message' => 'Voucher ini hanya berlaku pada akhir pekan (Sabtu & Minggu).',
                    'discount_amount' => 0,
                ];
            }
        }

        $discountAmount = $this->calculateDiscountAmount($subtotal);

        return [
            'valid' => true,
            'message' => "Voucher berhasil digunakan! Anda hemat Rp " . number_format($discountAmount, 0, ',', '.'),
            'discount_amount' => $discountAmount,
        ];
    }
}
