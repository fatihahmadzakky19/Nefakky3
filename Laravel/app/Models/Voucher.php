<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan class Voucher ke dalam namespace model.
// Konsep PBO: Manajemen modularitas dan isolasi ruang lingkup kelas.
// -----------------------------------------------------------------------------
namespace App\Models;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor basis class Eloquent ORM.
// Konsep PBO: Konsep Pewarisan (Inheritance).
// -----------------------------------------------------------------------------
use Illuminate\Database\Eloquent\Model;

/**
 * =============================================================================
 * CLASS: Voucher (Pemrograman Berorientasi Objek / PBO)
 * =============================================================================
 * Blueprint objek kode voucher promosi & diskon belanja di Nefakky Marketplace.
 *
 * Konsep PBO yang Diterapkan:
 * 1. INHERITANCE   : Mewarisi kapabilitas ORM database dari 'Model'.
 * 2. ENKAPSULASI   : Mengamankan aturan validasi kuota, waktu, & nominal promo.
 * 3. STATIC METHOD : Menyediakan helper waktu ISO week independen (Utility).
 * 4. BUSINESS LOGIC: Validasi minimum belanja, diskon persen/nominal, & auto reset.
 * =============================================================================
 */
class Voucher extends Model
{
    // -------------------------------------------------------------------------
    // ENKAPSULASI PRIMARY KEY: Menentukan kunci utama custom tabel
    // -------------------------------------------------------------------------
    // Menetapkan kolom 'voucher_id' sebagai primary key (contoh: "VOUCH-01")
    protected $primaryKey = 'voucher_id';
    
    // Memberitahu Eloquent bahwa ID voucher bukan auto-incrementing integer
    public $incrementing = false;
    
    // Menetapkan tipe data primary key berupa string
    protected $keyType = 'string';

    /**
     * ENKAPSULASI MASS ASSIGNMENT ($fillable):
     * Daftar kolom tabel yang diizinkan untuk diisi secara massal saat pembuatan objek.
     *
     * @var list<string>
     */
    protected $fillable = [
        'voucher_id',         // String (30) Primary Key Unik (e.g. "VOUCH-01")
        'code',               // String (50) Kode voucher unik (e.g. "DISKON50", "NEFAKKY10")
        'name',               // String (150) Nama / judul promosi
        'type',               // ENUM Tipe diskon: 'percent' (persentase) atau 'fixed' (nominal Rp)
        'discount_percent',   // DECIMAL (5, 2) Nilai persentase potongan harga
        'discount_value',     // DECIMAL (12, 2) Nilai nominal potongan tetap (Rupiah)
        'min_spend',          // DECIMAL (12, 2) Syarat minimal total belanja untuk memakai voucher
        'max_discount',       // DECIMAL (12, 2) Batas maksimal diskon maksimal jika tipe persen
        'used_count',         // UNSIGNED INTEGER Jumlah voucher yang sudah terpakai
        'total_limit',        // UNSIGNED INTEGER Batas total kuota pemakaian voucher
        'redemptions',        // String format teks display (e.g. "45/100")
        'expiry',             // String tanggal batas waktu dalam format teks
        'valid_from',         // DATETIME Waktu awal voucher mulai berlaku
        'valid_until',        // DATETIME Waktu batas akhir voucher kadaluarsa
        'start_date',         // DATE Tanggal mulai aktif
        'end_date',           // DATE Tanggal selesai aktif
        'daily_start_time',   // TIME Jam awal aktif harian (e.g. "10:00:00")
        'daily_end_time',     // TIME Jam akhir aktif harian (e.g. "14:00:00")
        'valid_day_type',     // ENUM: 'All Days', 'Weekend Only', 'Weekday Only'
        'valid_days',         // String daftar hari berlaku (e.g. "Saturday,Sunday")
        'auto_reset_weekly',  // BOOLEAN Saklar otomatis reset kuota mingguan (Senin)
        'last_reset_week',    // String penanda minggu reset terakhir (e.g. "2026-W35")
        'event',              // String nama event/musim promo (e.g. "Flash Sale", "Gajian")
        'status',             // ENUM: 'Active', 'Expired', 'Disabled'
        'is_active',          // BOOLEAN Status saklar aktif/nonaktif di aplikasi
        'image_url',          // String URL banner visual promo
    ];

    /**
     * ENKAPSULASI CASTING TIPE DATA ($casts):
     * Mengonversi atribut tabel database menjadi tipe data PHP murni secara otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'discount_percent' => 'float',     // Otomatis dikonversi ke pecahan (float)
        'discount_value' => 'float',       // Otomatis dikonversi ke pecahan (float)
        'min_spend' => 'float',            // Otomatis dikonversi ke pecahan (float)
        'max_discount' => 'float',         // Otomatis dikonversi ke pecahan (float)
        'used_count' => 'integer',         // Otomatis dikonversi ke bilangan bulat (integer)
        'total_limit' => 'integer',        // Otomatis dikonversi ke bilangan bulat (integer)
        'valid_from' => 'datetime',        // Dikonversi ke objek DateTime Carbon
        'valid_until' => 'datetime',       // Dikonversi ke objek DateTime Carbon
        'start_date' => 'date',            // Dikonversi ke objek Date Carbon
        'end_date' => 'date',              // Dikonversi ke objek Date Carbon
        'is_active' => 'boolean',          // Dikonversi ke boolean (true/false)
        'auto_reset_weekly' => 'boolean',  // Dikonversi ke boolean (true/false)
    ];

    /**
     * =========================================================================
     * HELPER STATIC METHOD PBO: getCurrentISOWeek()
     * =========================================================================
     * Mengambil representasi tahun dan nomor minggu ISO saat ini (e.g. "2026-W35").
     * Sebagai static method, fungsi ini dapat dipanggil tanpa instansiasi objek.
     *
     * @return string
     */
    public static function getCurrentISOWeek(): string
    {
        return date('o-\WW');
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: checkAndResetWeekly()
     * =========================================================================
     * Mengenkapsulasi logika reset kuota voucher mingguan jika fitur aktif.
     *
     * @return void
     */
    public function checkAndResetWeekly(): void
    {
        // Periksa apakah konfigurasi auto reset aktif untuk objek voucher ini
        if ($this->auto_reset_weekly) {
            $currentWeek = self::getCurrentISOWeek(); // Panggil static method internal
            // Jika minggu berjalan berbeda dengan minggu reset terakhir
            if ($this->last_reset_week !== $currentWeek) {
                $this->used_count = 0;                          // Reset pemakaian kembali ke 0
                $this->last_reset_week = $currentWeek;          // Rekam minggu reset terbaru
                $this->redemptions = "0/{$this->total_limit}";  // Perbarui teks display kuota
                $this->save();                                  // Simpan ke database
            }
        }
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: calculateDiscountAmount()
     * =========================================================================
     * Menghitung nilai nominal Rupiah potongan harga berdasarkan subtotal belanja.
     *
     * @param float $subtotal Total belanja sebelum diskon
     * @return float Nominal potongan harga dalam Rupiah
     */
    public function calculateDiscountAmount(float $subtotal): float
    {
        // 1. Skema Diskon Persentase
        if ($this->type === 'percent') {
            $discount = ($subtotal * ($this->discount_percent / 100));
            // Batasi dengan batas maksimal diskon (max_discount) jika ditentukan
            if ($this->max_discount > 0 && $discount > $this->max_discount) {
                return (float) $this->max_discount;
            }
            return (float) $discount;
        }

        // 2. Skema Diskon Nominal Tetap (Fixed Value)
        $discount = (float) $this->discount_value;
        // Jika diskon melebihi subtotal, potong maksimal sebesar subtotal
        if ($discount > $subtotal) {
            return (float) $subtotal;
        }
        return $discount;
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: checkValidity()
     * =========================================================================
     * Memvalidasi apakah voucher memenuhi seluruh parameter aturan kelayakan:
     * - Status aktifitas voucher
     * - Kuota batas pemakaian
     * - Syarat minimum belanja (min_spend)
     * - Batasan hari (misal Weekend Only)
     *
     * @param float $subtotal Total belanja pelanggan
     * @return array<string, mixed> Array status validitas, pesan, dan nominal diskon
     */
    public function checkValidity(float $subtotal): array
    {
        // 1. Jalankan pengecekan reset kuota mingguan terlebih dahulu
        $this->checkAndResetWeekly();

        // 2. Validasi status keaktifan voucher
        if (!$this->is_active || $this->status !== 'Active') {
            return [
                'valid' => false,
                'message' => 'Voucher saat ini sedang tidak aktif atau sudah dinonaktifkan.',
                'discount_amount' => 0,
            ];
        }

        // 3. Validasi batas kuota pemakaian
        if ($this->total_limit > 0 && $this->used_count >= $this->total_limit) {
            return [
                'valid' => false,
                'message' => 'Kuota penukaran voucher ini telah habis.',
                'discount_amount' => 0,
            ];
        }

        // 4. Validasi syarat minimal nominal belanja
        if ($this->min_spend > 0 && $subtotal < $this->min_spend) {
            $kurang = number_format($this->min_spend - $subtotal, 0, ',', '.');
            return [
                'valid' => false,
                'message' => "Minimal belanja untuk voucher ini adalah Rp " . number_format($this->min_spend, 0, ',', '.') . " (Kurang Rp {$kurang}).",
                'discount_amount' => 0,
            ];
        }

        // 5. Validasi batasan hari khusus (misal: Weekend Only)
        if (!empty($this->valid_days) && str_contains(strtolower($this->valid_days), 'weekend')) {
            $dayOfWeek = (int) date('N'); // 1 = Senin, ..., 6 = Sabtu, 7 = Minggu
            if ($dayOfWeek < 6) {
                return [
                    'valid' => false,
                    'message' => 'Voucher ini hanya berlaku pada akhir pekan (Sabtu & Minggu).',
                    'discount_amount' => 0,
                ];
            }
        }

        // 6. Hitung total nominal potongan diskon yang berhak didapatkan
        $discountAmount = $this->calculateDiscountAmount($subtotal);

        // 7. Kembalikan respon sukses validasi
        return [
            'valid' => true,
            'message' => "Voucher berhasil digunakan! Anda hemat Rp " . number_format($discountAmount, 0, ',', '.'),
            'discount_amount' => $discountAmount,
        ];
    }
}

