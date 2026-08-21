<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model Review
 * 
 * Model Eloquent ini merepresentasikan tabel 'user_reviews' di database.
 * Menyimpan ulasan kepuasan pelanggan, rating bintang (1-5), lencana status,
 * moderasi admin, timestamp review (datetime), dan balasan penjual.
 */
class Review extends Model
{
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
        'review_id',      // String (30)
        'product_id',     // String (30)
        'user_id',        // Foreign Key
        'order_id',       // String (30)
        'author_name',    // String (100)
        'author_email',   // String (150)
        'author_badge',   // ENUM: 'PLATINUM', 'GOLD', 'SILVER', 'VERIFIED BUYER', 'CUSTOMER'
        'avatar',         // String (500)
        'rating',         // UNSIGNED TINYINTEGER (1 - 5)
        'date',           // String (50)
        'review_date',    // DATETIME
        'product_name',   // String (150)
        'product_image',  // String (500)
        'comment',        // TEXT
        'likes_count',    // UNSIGNED INTEGER
        'status',         // ENUM: 'PUBLISHED', 'PENDING', 'FLAGGED', 'APPROVED', 'REJECTED'
        'flagged_reason', // String (255)
        'is_pinned',      // BOOLEAN
        'is_hidden',      // BOOLEAN
        'photos',         // JSON Array
        'replies',        // JSON Array
        'replied_at',     // DATETIME
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
        'review_date' => 'datetime',
        'replied_at' => 'datetime',
        'photos' => 'array',
        'replies' => 'array',
    ];

    /**
     * Relasi Many-to-One ke ProductItem.
     *
     * @return BelongsTo
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(ProductItem::class, 'product_id', 'item_id');
    }

    /**
     * Relasi Many-to-One ke User.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Metode Bisnis PBO: Menambahkan tanggapan/balasan resmi dari penjual.
     *
     * @param string $authorName
     * @param string $comment
     * @param string|null $authorEmail
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
        $this->replied_at = now();
        return $this->save();
    }

    /**
     * Metode Bisnis PBO: Menambah jumlah respon suka (Like).
     *
     * @return int
     */
    public function incrementLikes(): int
    {
        $this->likes_count = ($this->likes_count ?? 0) + 1;
        $this->save();
        return $this->likes_count;
    }
}
