<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan class Review ke dalam namespace App\Models.
// Konsep PBO: Isolasi nama class ulasan pelanggan.
// -----------------------------------------------------------------------------
namespace App\Models;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor class dasar Eloquent & tipe relasi database.
// Konsep PBO: Pola Pewarisan (Inheritance) & Asosiasi Objek.
// -----------------------------------------------------------------------------
use Illuminate\Database\Eloquent\Model;               // Superclass Model Eloquent
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Tipe relasi Many-to-One

/**
 * =============================================================================
 * CLASS: Review (Pemrograman Berorientasi Objek / PBO)
 * =============================================================================
 * Blueprint objek ulasan & penilaian (rating) kepuasan pelanggan atas hidangan.
 *
 * Konsep PBO yang Diterapkan:
 * 1. INHERITANCE   : Mewarisi operasi database dari parent class 'Model'.
 * 2. ENKAPSULASI   : Mengamankan properti, casting tipe data, & status moderasi.
 * 3. ASOSIASI/RELASI: Menghubungkan ulasan ke ProductItem dan User.
 * 4. BUSINESS LOGIC: Pengelolaan balasan resmi admin (addReply) & counter like.
 * =============================================================================
 */
class Review extends Model
{
    // -------------------------------------------------------------------------
    // ENKAPSULASI TABEL & PRIMARY KEY:
    // -------------------------------------------------------------------------
    // Menentukan nama tabel khusus di database (bukan default 'reviews')
    protected $table = 'user_reviews';

    // Mengatur Primary Key menggunakan string custom (contoh: "REV-001")
    protected $primaryKey = 'review_id';
    
    // Memberitahu Eloquent bahwa primary key ini bukan integer auto-increment
    public $incrementing = false;
    
    // Menetapkan tipe data primary key sebagai string
    protected $keyType = 'string';

    /**
     * ENKAPSULASI MASS ASSIGNMENT ($fillable):
     * Kolom-kolom yang diizinkan untuk diisi secara massal saat Review::create().
     *
     * @var list<string>
     */
    protected $fillable = [
        'review_id',      // String (30) Primary Key Unik (e.g. "REV-001")
        'product_id',     // Foreign Key ID produk yang diulas (e.g. "PROD-001")
        'user_id',        // Foreign Key ID Pengguna yang menulis ulasan
        'order_id',       // ID Transaksi pesanan terkait
        'author_name',    // Nama lengkap penulis ulasan
        'author_email',   // Email penulis ulasan
        'author_badge',   // ENUM Lencana: 'PLATINUM', 'GOLD', 'SILVER', 'VERIFIED BUYER', 'CUSTOMER'
        'avatar',         // URL foto avatar pelanggan
        'rating',         // UNSIGNED TINYINTEGER Skor bintang kepuasan (1 - 5)
        'date',           // String format tanggal display
        'review_date',    // DATETIME Timestamp ulasan dibuat
        'product_name',   // Snapshot nama produk saat diulas
        'product_image',  // Snapshot foto produk saat diulas
        'comment',        // TEXT Isi pesan ulasan dan testimoni rasa
        'likes_count',    // UNSIGNED INTEGER Total jumlah like dari komunitas
        'status',         // ENUM Status moderasi: 'PUBLISHED', 'PENDING', 'FLAGGED', 'APPROVED', 'REJECTED'
        'flagged_reason', // Alasan pelaporan jika ulasan ditandai melanggar
        'is_pinned',      // BOOLEAN Penanda disematkan di urutan teratas
        'is_hidden',      // BOOLEAN Penanda disembunyikan oleh admin
        'photos',         // JSON Array kumpulan URL foto hidangan dari pelanggan
        'replies',        // JSON Array balasan resmi dari tim resto
        'replied_at',     // DATETIME Timestamp balasan terakhir diberikan
    ];

    /**
     * ENKAPSULASI CASTING TIPE DATA ($casts):
     * Otomatis mengonversi kolom JSON tabel ke array PHP dan tanggal ke objek DateTime.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rating'      => 'integer',   // Otomatis dikonversi ke integer
        'likes_count' => 'integer',   // Otomatis dikonversi ke integer
        'is_pinned'   => 'boolean',   // Otomatis dikonversi ke boolean
        'is_hidden'   => 'boolean',   // Otomatis dikonversi ke boolean
        'review_date' => 'datetime',  // Dikonversi ke objek DateTime Carbon
        'replied_at'  => 'datetime',  // Dikonversi ke objek DateTime Carbon
        'photos'      => 'array',     // Otomatis didekode dari JSON menjadi Array PHP
        'replies'     => 'array',     // Otomatis didekode dari JSON menjadi Array PHP
    ];

    /**
     * =========================================================================
     * RELASI PBO: BelongsTo (Many-to-One) ke Model ProductItem
     * =========================================================================
     * Menghubungkan objek ulasan ke hidangan yang dinilai.
     *
     * @return BelongsTo
     */
    public function product(): BelongsTo
    {
        // Relasi: Banyak ulasan (Review) ditujukan untuk Satu produk hidangan (ProductItem)
        return $this->belongsTo(ProductItem::class, 'product_id', 'item_id');
    }

    /**
     * =========================================================================
     * RELASI PBO: BelongsTo (Many-to-One) ke Model User
     * =========================================================================
     * Menghubungkan objek ulasan ke akun pengguna pembuatnya.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        // Relasi: Banyak ulasan (Review) ditulis oleh Satu pengguna (User)
        return $this->belongsTo(User::class);
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: addReply()
     * =========================================================================
     * Mengenkapsulasi penambahan balasan apresiasi resmi dari resto ke dalam ulasan.
     *
     * @param string $authorName Nama staf/admin yang membalas
     * @param string $comment Isi balasan
     * @param string|null $authorEmail Surel resmi admin
     * @return bool
     */
    public function addReply(string $authorName, string $comment, ?string $authorEmail = null): bool
    {
        // 1. Ambil daftar balasan saat ini atau inisialisasi array kosong
        $currentReplies = $this->replies ?? [];
        
        // 2. Tambahkan objek balasan baru ke array
        $currentReplies[] = [
            'id'          => 'reply-' . (count($currentReplies) + 1),
            'authorName'  => $authorName,
            'authorEmail' => $authorEmail ?? 'admin@nefakky.com',
            'comment'     => $comment,
            'date'        => now()->translatedFormat('d M Y, H:i'),
        ];

        // 3. Perbarui properti state internal objek
        $this->replies = $currentReplies;
        $this->replied_at = now();
        
        // 4. Simpan ke database
        return $this->save();
    }

    /**
     * =========================================================================
     * METODE LOGIKA BISNIS PBO: incrementLikes()
     * =========================================================================
     * Mengenkapsulasi penambahan respon 'Suka' (Like) pada ulasan.
     *
     * @return int Jumlah total like terbaru
     */
    public function incrementLikes(): int
    {
        // Tambahkan counter like sebanyak 1
        $this->likes_count = ($this->likes_count ?? 0) + 1;
        // Simpan perubahan ke database
        $this->save();
        // Kembalikan nilai total like terbaru
        return $this->likes_count;
    }
}

