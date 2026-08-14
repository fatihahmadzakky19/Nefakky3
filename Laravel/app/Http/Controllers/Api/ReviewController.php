<?php

// Namespace penempat controller dalam struktur folder Laravel API
namespace App\Http\Controllers\Api;

// Mengimpor controller induk dari Laravel
use App\Http\Controllers\Controller;
// Mengimpor Model Review untuk berinteraksi dengan tabel ulasan
use App\Models\Review;
// Mengimpor Request untuk membaca data input HTTP
use Illuminate\Http\Request;

// Class Controller untuk mengelola ulasan dan rating produk
class ReviewController extends Controller
{
    /**
     * Menampilkan daftar ulasan pelanggan (bisa difilter per produk jika parameter product_id ada)
     */
    public function index(Request $request)
    {
        // Buat objek query builder awal untuk Model Review
        $query = Review::query();

        // Jika terdapat parameter 'product_id' pada request, tambahkan filter kondisi
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Eksekusi query dengan urutan ulasan terbaru (created_at desc)
        $reviews = $query->orderBy('created_at', 'desc')->get();

        // Kembalikan response JSON berisi daftar ulasan, rata-rata rating, dan total ulasan
        return response()->json([
            'status' => 'success',
            'data' => $reviews, // Array daftar ulasan
            'average_rating' => round($reviews->avg('rating'), 1) ?: 5.0, // Hitung rata-rata rating (default 5.0)
            'total_reviews' => $reviews->count() // Total jumlah ulasan
        ]);
    }

    /**
     * Menyimpan ulasan dan rating baru dari pelanggan
     */
    public function store(Request $request)
    {
        // Validasi input request ulasan pelanggan
        $validated = $request->validate([
            'product_id' => 'required|string', // ID produk wajib string
            'customer_name' => 'required|string|max:255', // Nama pelanggan wajib diisi
            'customer_email' => 'nullable|email', // Email opsional
            'rating' => 'required|integer|min:1|max:5', // Rating wajib angka 1-5
            'comment' => 'required|string', // Komentar ulasan wajib diisi
            'image_url' => 'nullable|string', // URL foto ulasan opsional
        ]);

        // Simpan record ulasan baru ke tabel reviews di database
        $review = Review::create($validated);

        // Kembalikan response JSON sukses beserta data ulasan yang dibuat (Status HTTP 201 Created)
        return response()->json([
            'status' => 'success',
            'message' => 'Terima kasih! Ulasan hidangan Anda berhasil disimpan.',
            'data' => $review
        ], 201);
    }
}

