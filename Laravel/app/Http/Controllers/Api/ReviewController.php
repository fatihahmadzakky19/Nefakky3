<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::query();

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $reviews = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $reviews,
            'average_rating' => round($reviews->avg('rating'), 1) ?: 5.0,
            'total_reviews' => $reviews->count()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|string',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
            'image_url' => 'nullable|string',
        ]);

        $review = Review::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Terima kasih! Ulasan hidangan Anda berhasil disimpan.',
            'data' => $review
        ], 201);
    }
}
