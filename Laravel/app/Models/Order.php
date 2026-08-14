<?php

// Namespace penempat Model dalam struktur folder Laravel Eloquent
namespace App\Models;

// Mengimpor kelas dasar Model dari Eloquent ORM Laravel
use Illuminate\Database\Eloquent\Model;
// Mengimpor kelas relasi HasMany (Satu ke Banyak) untuk mendefinisikan relasi pesanan ke items
use Illuminate\Database\Eloquent\Relations\HasMany;

// Class Model Order yang merepresentasikan tabel 'orders' di database
class Order extends Model
{
    // Mengatur nama Primary Key khusus yaitu 'order_id' (cth: "ORD-12345")
    protected $primaryKey = 'order_id';
    // Menandakan bahwa primary key berbentuk string/custom, bukan auto-increment integer
    public $incrementing = false;
    // Menentukan tipe data dari Primary Key adalah string
    protected $keyType = 'string';

    // Daftar kolom tabel yang diizinkan untuk diisi secara massal (Mass Assignment)
    protected $fillable = [
        'order_id', // ID unik pesanan
        'customer_name', // Nama lengkap pelanggan
        'customer_email', // Alamat email pelanggan
        'avatar', // URL/Path foto profil/avatar pelanggan
        'address', // Alamat lengkap tujuan pengiriman
        'phone', // Nomor telepon/WhatsApp aktif pelanggan
        'item_count', // Total jumlah barang yang dibeli dalam pesanan
        'payment_method', // Metode pembayaran (Midtrans, COD, QRIS, Transfer Bank)
        'payment_badge', // Badge status pembayaran ("PAID", "UNPAID", "PENDING")
        'delivery_type', // Jenis layanan pengiriman ("EXPRESS", "STANDARD")
        'status', // Tahap alur pengiriman ("RECEIVED", "COOKING", "READY", "DELIVERING", "COMPLETED")
        'subtotal', // Total harga kotor barang sebelum ongkir dan diskon
        'shipping_cost', // Biaya ongkos kirim (Rp)
        'discount', // Nominal potongan diskon (Rp)
        'total', // Total tagihan pembayaran bersih (Rp)
        'customer_confirmed', // Konfirmasi penerimaan barang dari pelanggan (true/false)
    ];

    // Konversi tipe data otomatis (Casting) saat membaca data dari database
    protected $casts = [
        'item_count' => 'integer', // Konversi jumlah barang ke tipe integer
        'subtotal' => 'float', // Konversi subtotal ke tipe desimal/float
        'shipping_cost' => 'float', // Konversi ongkir ke tipe desimal/float
        'discount' => 'float', // Konversi diskon ke tipe desimal/float
        'total' => 'float', // Konversi total bayar ke tipe desimal/float
        'customer_confirmed' => 'boolean', // Konversi status konfirmasi ke boolean
    ];

    /**
     * Definisi relasi One-to-Many: Satu Order memiliki banyak OrderItem
     */
    public function items(): HasMany
    {
        // Menghubungkan Model Order ke Model OrderItem melalui foreign key 'order_id'
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    /**
     * Metode PBO: Pembaruan Status Alur Pengiriman Live 5-Tahap
     * (RECEIVED -> COOKING -> READY -> DELIVERING -> COMPLETED)
     */
    public function advanceStatus(): string
    {
        // Urutan alur tahapan status pengiriman pesanan secara bertahap
        $statusFlow = ['RECEIVED', 'COOKING', 'READY', 'DELIVERING', 'COMPLETED'];
        // Cari indeks posisi status pesanan saat ini di dalam alur status
        $currIdx = array_search($this->status, $statusFlow);
        // Jika status valid dan belum mencapai tahap akhir ('COMPLETED')
        if ($currIdx !== false && $currIdx < count($statusFlow) - 1) {
            // Naikkan status ke tahap berikutnya dalam array
            $this->status = $statusFlow[$currIdx + 1];
            // Simpan pembaruan status ke database
            $this->save();
        }
        // Kembalikan nama status terbaru pesanan
        return $this->status;
    }
}

