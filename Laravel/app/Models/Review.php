<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model Review
 * 
 * Model Eloquent ini merepresentasikan tabel 'user_reviews' di database.
 * Bertanggung jawab menyimpan ulasan kepuasan pelanggan, rating bintang (1-5),
 * lencana pengulas, moderasi admin (Approved, Pinned, Hidden), jumlah like,
 * foto hidangan, serta balasan penjual.
 */
class Review extends Model
{
    use SoftDeletes;

    // Menentukan nama tabel secara eksplisit pada database
    protected $table = 'user_reviews';

    // Mengatur Primary Key menggunakan string custom (contoh: "REV-001")
    protected $primaryKey = 'review_id';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * Kolom-kolom yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'review_id',     // ID unik ulasan (contoh: "REV-001")
        'product_id',    // ID produk kuliner yang diulas (contoh: "PROD-001")
        'author_name',   // Nama pembuat ulasan
        'author_email',  // Alamat email pembuat ulasan
        'author_badge',  // Lencana status pemesan ("PLATINUM", "GOLD", "VERIFIED BUYER")
        'avatar',        // URL foto profil pembuat ulasan
        'rating',        // Penilaian rating bintang (1 sampai 5)
        'date',          // Teks tanggal ulasan ("Kemarin", "2 hari yang lalu", dsb)
        'product_name',  // Nama produk saat diulas
        'product_image', // Foto produk saat diulas
        'comment',       // Isi teks testimoni ulasan pelanggan
        'likes_count',   // Jumlah respon suka (Like) yang didapat
        'status',        // Status moderasi ulasan ("PUBLISHED", "APPROVED", "PENDING", "REJECTED")
        'is_pinned',     // Boolean: apakah ulasan dipin di urutan teratas
        'is_hidden',     // Boolean: apakah ulasan disembunyikan oleh admin
        'photos',        // Array JSON foto lampiran ulasan dari pelanggan
        'replies',       // Array JSON balasan resmi dari pihak admin/penjual
    ];

    /**
     * Konversi tipe data otomatis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'integer',
        'likes_count' => 'integer',
        'is_pinned' => 'boolean',
        'is_hidden' => 'boolean',
        'photos' => 'array',
        'replies' => 'array',
    ];

    /**
     * Relasi Many-to-One: Ulasan terhubung ke produk kuliner (ProductItem).
     *
     * @return BelongsTo
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(ProductItem::class, 'product_id', 'item_id');
    }

    /**
     * Metode Bisnis PBO: Menambahkan tanggapan/balasan dari pihak penjual ke ulasan.
     *
     * @param string $authorName Nama perwakilan penjual/admin
     * @param string $comment Isi pesan tanggapan
     * @param string|null $authorEmail Email admin
     * @return bool
     */
    public function addReply(string $authorName, string $comment, ?string $authorEmail = null): bool
    {
        $currentReplies = $this->replies ?? [];
        $currentReplies[] = [
            'id' => 'reply-' . (count($currentReplies) + 1),
            'authorName' => $authorName,
            'authorEmail' => $authorEmail ?? 'admin@nefakky.com',
            'comment' => $comment,
            'date' => now()->translatedFormat('d M Y, H:i'),
        ];

        $this->replies = $currentReplies;
        return $this->save();
    }

    /**
     * Metode Bisnis PBO: Menambah jumlah respon suka (Like) pada ulasan.
     *
     * @return int Jumlah likes terbaru
     */
    public function incrementLikes(): int
    {
        $this->likes_count = ($this->likes_count ?? 0) + 1;
        $this->save();
        return $this->likes_count;
    }
}
