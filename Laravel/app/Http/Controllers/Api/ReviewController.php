<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\ProductItem;
use App\Models\Review;
use App\Events\RealtimeActivityEvent;
use App\Traits\ApiResponseTrait;
use App\Traits\BroadcastSafelyTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller ReviewController
 * Mengelola Ulasan Hidangan, Rating Bintang, Moderasi Ulasan, Balasan Penjual, dan Statistik Ulasan.
 */
class ReviewController extends Controller
{
    use ApiResponseTrait, BroadcastSafelyTrait;

    /**
     * Menampilkan daftar ulasan pelanggan
     */
    public function index(Request $request): JsonResponse
    {
        $query = Review::query();

        // 1. Filter per Produk
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // 2. Filter Status Moderasi
        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        } elseif (!$request->has('admin_view')) {
            // Default untuk publik: Hanya yang aktif/published/approved dan tidak disembunyikan
            $query->whereIn('status', ['PUBLISHED', 'APPROVED'])
                  ->where('is_hidden', false);
        }

        // 3. Pengurutan: Ulasan yang di-Pin selalu di atas, kemudian diurutkan dari yang terbaru
        $reviews = $query->orderBy('is_pinned', 'desc')
                         ->orderBy('created_at', 'desc')
                         ->get();

        $avgRating = $reviews->count() > 0 ? round($reviews->avg('rating'), 1) : 5.0;

        return response()->json([
            'success' => true,
            'status' => 'success',
            'code' => 200,
            'message' => 'Daftar ulasan berhasil diambil',
            'average_rating' => $avgRating,
            'averageRating' => $avgRating,
            'total_reviews' => $reviews->count(),
            'totalReviews' => $reviews->count(),
            'data' => ReviewResource::collection($reviews),
        ]);
    }

    /**
     * Menampilkan detail satu ulasan
     */
    public function show($id): JsonResponse
    {
        $review = Review::find($id);

        if (!$review) {
            return $this->notFoundResponse('Ulasan tidak ditemukan');
        }

        return $this->successResponse(new ReviewResource($review), 'Detail ulasan berhasil diambil');
    }

    /**
     * Menyimpan ulasan hidangan dan rating baru dari pelanggan
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (empty($data['review_id'])) {
            $data['review_id'] = 'REV-' . rand(10000, 99999);
        }

        if (empty($data['avatar'])) {
            $data['avatar'] = 'https://ui-avatars.com/api/?name=' . urlencode($data['author_name']) . '&background=5C3D28&color=ffffff';
        }

        if (empty($data['date'])) {
            $data['date'] = 'Hari ini';
        }

        $review = Review::create($data);

        // Update rating rata-rata pada produk terkait jika ada product_id
        if (!empty($review->product_id)) {
            $prod = ProductItem::find($review->product_id);
            if ($prod) {
                $prod->recalculateRating();
            }
        }

        // Pancarkan event realtime ke WebSocket Reverb
        $this->safeBroadcast(new RealtimeActivityEvent(
            'Ulasan Baru',
            "{$review->author_name} memberikan rating {$review->rating}★ untuk " . ($review->product_name ?? 'hidangan'),
            'review',
            ['review_id' => $review->review_id, 'rating' => $review->rating, 'author' => $review->author_name]
        ));

        return $this->createdResponse(new ReviewResource($review), 'Terima kasih! Ulasan hidangan Anda berhasil disimpan.');
    }

    /**
     * Menambah jumlah suka (Like) pada ulasan
     */
    public function like($id): JsonResponse
    {
        $review = Review::find($id);

        if (!$review) {
            return $this->notFoundResponse('Ulasan tidak ditemukan');
        }

        $review->incrementLikes();

        return $this->successResponse([
            'review_id' => $review->review_id,
            'likes_count' => $review->likes_count,
        ], 'Suka berhasil ditambahkan');
    }

    /**
     * Menambahkan balasan (Reply) dari Penjual / Admin pada ulasan
     */
    public function reply(Request $request, $id): JsonResponse
    {
        $request->validate([
            'comment' => 'required|string',
            'author_name' => 'nullable|string',
            'author_email' => 'nullable|email',
        ]);

        $review = Review::find($id);

        if (!$review) {
            return $this->notFoundResponse('Ulasan tidak ditemukan');
        }

        $authorName = $request->input('author_name', 'Admin CS Nefakky');
        $authorEmail = $request->input('author_email', 'admin@nefakky.com');
        $authorAvatar = 'https://ui-avatars.com/api/?name=Admin+CS&background=5C3D28&color=ffffff';

        $review->addReply($authorName, $request->comment, $authorEmail, $authorAvatar);

        return $this->successResponse(new ReviewResource($review), 'Balasan berhasil dikirimkan!');
    }

    /**
     * Moderasi ulasan (Status, Pin, Hide) oleh Admin
     */
    public function moderate(Request $request, $id): JsonResponse
    {
        $review = Review::find($id);

        if (!$review) {
            return $this->notFoundResponse('Ulasan tidak ditemukan');
        }

        if ($request->has('status')) $review->status = $request->status;
        if ($request->has('flagged_reason')) $review->flagged_reason = $request->flagged_reason;
        if ($request->has('is_pinned')) $review->is_pinned = (bool) $request->is_pinned;
        if ($request->has('is_hidden')) $review->is_hidden = (bool) $request->is_hidden;

        $review->save();

        // Update rating produk jika status berubah
        if (!empty($review->product_id)) {
            $prod = ProductItem::find($review->product_id);
            if ($prod) {
                $prod->recalculateRating();
            }
        }

        return $this->successResponse(new ReviewResource($review), 'Status moderasi ulasan berhasil diperbarui');
    }

    /**
     * Menghapus ulasan
     */
    public function destroy($id): JsonResponse
    {
        $review = Review::find($id);

        if (!$review) {
            return $this->notFoundResponse('Ulasan tidak ditemukan');
        }

        $productId = $review->product_id;
        $review->delete();

        if (!empty($productId)) {
            $prod = ProductItem::find($productId);
            if ($prod) {
                $prod->recalculateRating();
            }
        }

        return $this->successResponse(null, 'Ulasan berhasil dihapus');
    }

    /**
     * Ringkasan statistik rating toko (Rating breakdown 5/4/3/2/1 bintang)
     */
    public function summary(): JsonResponse
    {
        $total = Review::count();
        $avg = $total > 0 ? round(Review::avg('rating'), 1) : 5.0;

        $distribution = [
            '5_star' => Review::where('rating', 5)->count(),
            '4_star' => Review::where('rating', 4)->count(),
            '3_star' => Review::where('rating', 3)->count(),
            '2_star' => Review::where('rating', 2)->count(),
            '1_star' => Review::where('rating', 1)->count(),
        ];

        return $this->successResponse([
            'average_rating' => $avg,
            'total_reviews' => $total,
            'star_breakdown' => $distribution,
        ], 'Ringkasan rating berhasil diambil');
    }
}
