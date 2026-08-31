<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan class Order ke dalam ruang lingkup model aplikasi.
// Konsep PBO: Pengorganisasian modular untuk menghindari tabrakan nama class.
// -----------------------------------------------------------------------------
namespace App\Models;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor class & trait dasar dari framework Laravel.
// Konsep PBO: Penggunaan kembali kode (Code Reusability) & Kontrak Abstraksi.
// -----------------------------------------------------------------------------
use Illuminate\Database\Eloquent\Model;                    // Superclass Eloquent ORM (Pewarisan/Inheritance)
use Illuminate\Database\Eloquent\Relations\BelongsTo;      // Representasi relasi objek Many-to-One
use Illuminate\Database\Eloquent\Relations\HasMany;        // Representasi relasi objek One-to-Many

/**
 * =============================================================================
 * CLASS: Order (Pemrograman Berorientasi Objek / PBO)
 * =============================================================================
 * Blueprint objek transaksi pesanan pelanggan di platform kuliner Nefakky.
 *
 * Konsep PBO yang Diterapkan:
 * 1. INHERITANCE   : Mewarisi seluruh kemampuan database query dari 'Model'.
 * 2. ENKAPSULASI   : Mengamankan properti via $fillable, $casts, & state methods.
 * 3. STATE MACHINE : Mengelola perubahan status pesanan melalui metode internal.
 * 4. ASOSIASI      : Menghubungkan objek Order dengan objek User dan OrderItem.
 * =============================================================================
 */
class Order extends Model
{
    // -------------------------------------------------------------------------
    // ENKAPSULASI PRIMARY KEY: Menentukan kunci utama tabel secara custom
    // -------------------------------------------------------------------------
    // Menetapkan nama kolom primary key tabel menjadi 'order_id' (bukan default 'id')
    protected $primaryKey = 'order_id';
    
    // Memberitahu Eloquent bahwa primary key ini TIDAK auto-incrementing integer
    public $incrementing = false;
    
    // Menetapkan tipe data primary key sebagai string (misal: "ORD-88219")
    protected $keyType = 'string';

    /**
     * KONSTANTA KELAS (PBO Constant):
     * Urutan alur 5-tahap pemrosesan pesanan dari dapur hingga diterima pelanggan.
     */
    public const STAGES = [
        'RECEIVED',   // Tahap 1: Pesanan baru diterima server & masuk antrean dapur
        'COOKING',    // Tahap 2: Sedang dimasak & diracik dengan higienis oleh chef
        'READY',      // Tahap 3: Hidangan telah siap & dikemas rapi (packaging)
        'DELIVERING', // Tahap 4: Sedang diantar oleh kurir menuju alamat pembeli
        'COMPLETED',  // Tahap 5: Pesanan telah tiba di lokasi & dikonfirmasi selesai
    ];

    /**
     * ENKAPSULASI MASS ASSIGNMENT ($fillable):
     * Daftar atribut/kolom yang diizinkan untuk diisi secara massal saat Order::create().
     * Berfungsi sebagai proteksi keamanan data (Data Protection) terhadap input liar.
     *
     * @var list<string>
     */
    protected $fillable = [
        'order_id',                   // ID Unik Pesanan bertipe String (e.g. "ORD-12345")
        'user_id',                    // Foreign Key ID Pengguna pemilik transaksi
        'customer_name',              // Nama lengkap pemesan hidangan
        'customer_email',             // Alamat surel aktif pelanggan untuk invoice
        'avatar',                     // URL foto profil pemesan hidangan
        'address',                    // Alamat lengkap tujuan pengantaran makanan
        'phone',                      // Nomor kontak/WhatsApp pembeli yang dapat dihubungi
        'item_count',                 // Total kuantitas seluruh porsi menu yang dibeli
        'payment_method',             // Metode bayar (e.g. 'QRIS', 'BCA_VA', 'COD', 'MIDTRANS')
        'payment_badge',              // Status pembayaran (e.g. 'PAID', 'UNPAID', 'REFUND')
        'delivery_type',              // Jenis kurir pengantaran (e.g. 'KURIR_TOKO', 'EXPRESS')
        'status',                     // Status pesanan saat ini ('RECEIVED', 'COOKING', dll)
        'subtotal',                   // Total harga hidangan sebelum diskon dan ongkir (Rp)
        'shipping_cost',              // Biaya ongkos kirim berdasarkan jarak Haversine (Rp)
        'discount',                   // Total potongan harga promo/voucher yang didapat (Rp)
        'tax_amount',                 // Nominal pajak restoran (PB1 10% / PPN) (Rp)
        'total',                      // Total tagihan akhir yang wajib dibayar pelanggan (Rp)
        'distance_km',                // Jarak pengantaran dari dapur utama ke lokasi pembeli (Km)
        'estimated_delivery_minutes', // Estimasi durasi waktu tiba pengiriman (dalam menit)
        'customer_confirmed',         // Penanda boolean apakah pembeli sudah konfirmasi terima
        'order_datetime',             // Tanggal dan waktu pesanan dibuat (Timestamp)
        'confirmed_at',               // Tanggal dan waktu pesanan dikonfirmasi oleh pelanggan
        'paid_at',                    // Tanggal dan waktu pelunasan pembayaran diverifikasi
        'delivered_at',               // Tanggal dan waktu kurir sukses mengantar makanan
        'proof_photo',                // URL foto bukti serah terima pesanan di lokasi tujuan
        'payment_proof_photo',        // URL foto bukti transfer pembayaran pelanggan
        'voucher_code',               // Kode voucher diskon yang digunakan saat checkout
        'applied_promo',              // Judul / label promo promosi yang aktif
        'notes',                      // Catatan tambahan dari pembeli untuk juru masak
    ];

    /**
     * ENKAPSULASI CASTING TIPE DATA ($casts):
     * Mengonversi tipe data dari database string mentah menjadi tipe data PHP murni secara otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subtotal' => 'float',                     // Otomatis dikonversi ke tipe bilangan pecahan (float)
        'shipping_cost' => 'float',                 // Otomatis dikonversi ke tipe pecahan (float)
        'discount' => 'float',                      // Otomatis dikonversi ke tipe pecahan (float)
        'tax_amount' => 'float',                    // Otomatis dikonversi ke tipe pecahan (float)
        'total' => 'float',                         // Otomatis dikonversi ke tipe pecahan (float)
        'distance_km' => 'float',                   // Otomatis dikonversi ke tipe pecahan (float)
        'item_count' => 'integer',                  // Otomatis dikonversi ke bilangan bulat (integer)
        'estimated_delivery_minutes' => 'integer',  // Otomatis dikonversi ke bilangan bulat (integer)
        'customer_confirmed' => 'boolean',          // Otomatis dikonversi ke nilai benar/salah (true/false)
        'order_datetime' => 'datetime',             // Dikonversi ke objek DateTime Carbon
        'confirmed_at' => 'datetime',               // Dikonversi ke objek DateTime Carbon
        'paid_at' => 'datetime',                    // Dikonversi ke objek DateTime Carbon
        'delivered_at' => 'datetime',               // Dikonversi ke objek DateTime Carbon
    ];

    /**
     * =========================================================================
     * RELASI PBO: BelongsTo (Many-to-One) ke Model User
     * =========================================================================
     * Mengaitkan objek pesanan ini dengan objek User yang membuatnya.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        // Relasi: Banyak transaksi pesanan (Order) dimiliki oleh Satu Pengguna (User)
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * =========================================================================
     * RELASI PBO: HasMany (One-to-Many) ke Model OrderItem
     * =========================================================================
     * Mengaitkan objek pesanan ini dengan daftar menu makanan yang dipesan.
     *
     * @return HasMany
     */
    public function items(): HasMany
    {
        // Relasi: Satu pesanan induk (Order) memiliki Banyak rincian hidangan (OrderItem)
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: advanceStatus()
     * =========================================================================
     * Mengenkapsulasi alur perpindahan status pesanan secara bertahap
     * (RECEIVED -> COOKING -> READY -> DELIVERING -> COMPLETED).
     *
     * @return string Status baru setelah dimajukan
     */
    public function advanceStatus(): string
    {
        // Cari index urutan status pesanan saat ini di dalam array konstanta STAGES
        $currentIndex = array_search($this->status, self::STAGES);

        // Validasi: pastikan status ditemukan dan belum mencapai tahap akhir (COMPLETED)
        if ($currentIndex !== false && $currentIndex < count(self::STAGES) - 1) {
            // Dapatkan status tahap berikutnya
            $nextStatus = self::STAGES[$currentIndex + 1];
            // Ubah properti status objek internal
            $this->status = $nextStatus;

            // Jika status telah mencapai 'COMPLETED', tandai otomatis selesai & rekam waktu
            if ($nextStatus === 'COMPLETED') {
                $this->customer_confirmed = true;
                $this->confirmed_at = now();
                $this->delivered_at = now();
            }

            // Simpan perubahan state objek ke database
            $this->save();
            return $nextStatus;
        }

        // Jika sudah di tahap akhir, kembalikan status saat ini tanpa perubahan
        return $this->status;
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: markAsPaid()
     * =========================================================================
     * Mengenkapsulasi proses pelunasan tagihan pembayaran pesanan (e.g. via Midtrans).
     *
     * @return bool
     */
    public function markAsPaid(): bool
    {
        // Ubah badge pembayaran menjadi 'PAID' (Lunas)
        $this->payment_badge = 'PAID';
        // Rekam timestamp waktu pembayaran berhasil diverifikasi
        $this->paid_at = now();
        
        // Jika sebelumnya status masih 'PENDING', majukan ke 'RECEIVED' agar masuk antrean dapur
        if ($this->status === 'PENDING') {
            $this->status = 'RECEIVED';
        }
        
        // Simpan perubahan ke database dan kembalikan status boolean sukses
        return $this->save();
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: confirmReceived()
     * =========================================================================
     * Mengenkapsulasi aksi konfirmasi penerimaan hidangan oleh pelanggan.
     *
     * @return bool
     */
    public function confirmReceived(): bool
    {
        $this->customer_confirmed = true; // Tandai pembeli telah menerima pesanan
        $this->confirmed_at = now();       // Rekam waktu konfirmasi
        $this->delivered_at = now();       // Rekam waktu pengantaran selesai
        $this->status = 'COMPLETED';       // Ubah status transaksi menjadi selesai
        
        // Simpan perubahan ke database
        return $this->save();
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: cancelOrder()
     * =========================================================================
     * Mengenkapsulasi pembatalan pesanan serta memulihkan kuantitas stok produk
     * yang sebelumnya telah dipesan agar kembali tersedia untuk pelanggan lain.
     *
     * @return bool
     */
    public function cancelOrder(): bool
    {
        // Validasi: Pesanan yang sudah selesai atau sudah dibatalkan tidak dapat dibatalkan lagi
        if ($this->status !== 'CANCELLED' && $this->status !== 'COMPLETED') {
            // Ubah status pesanan menjadi dibatalkan
            $this->status = 'CANCELLED';

            // Lakukan perulangan untuk setiap item makanan yang ada di pesanan ini
            foreach ($this->items as $item) {
                // Temukan objek master produk berdasarkan product_id
                $product = ProductItem::find($item->product_id);
                if ($product) {
                    // Panggil metode PBO restoreStock() pada objek ProductItem untuk memulihkan stok
                    $product->restoreStock($item->quantity);
                }
            }

            // Simpan perubahan status transaksi ke database
            return $this->save();
        }

        // Kembalikan false jika pesanan tidak memenuhi syarat pembatalan
        return false;
    }
}

