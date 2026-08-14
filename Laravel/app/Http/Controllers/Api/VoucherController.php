<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    public function index()
    {
        $vouchers = Voucher::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $vouchers
        ]);
    }

    public function validateVoucher(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $voucher = Voucher::where('code', strtoupper($request->code))
            ->where('is_active', true)
            ->first();

        if (!$voucher) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode voucher tidak ditemukan atau sudah tidak aktif.'
            ], 404);
        }

        if ($voucher->expires_at && $voucher->expires_at->isPast()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher sudah kadaluarsa.'
            ], 400);
        }

        if ($voucher->quota > 0 && $voucher->used_count >= $voucher->quota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kuota penggunaan voucher ini sudah habis.'
            ], 400);
        }

        if ($request->subtotal < $voucher->min_spend) {
            return response()->json([
                'status' => 'error',
                'message' => 'Minimal belanja untuk voucher ini adalah Rp ' . number_format($voucher->min_spend, 0, ',', '.')
            ], 400);
        }

        // Calculate discount
        $discountAmount = 0;
        if ($voucher->type === 'percent') {
            $discountAmount = ($request->subtotal * $voucher->discount_value) / 100;
            if ($voucher->max_discount && $discountAmount > $voucher->max_discount) {
                $discountAmount = $voucher->max_discount;
            }
        } else {
            $discountAmount = $voucher->discount_value;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Voucher berhasil digunakan!',
            'data' => [
                'code' => $voucher->code,
                'title' => $voucher->title,
                'type' => $voucher->type,
                'discount_value' => $voucher->discount_value,
                'discount_amount' => round($discountAmount),
                'final_price' => max(0, $request->subtotal - round($discountAmount)),
            ]
        ]);
    }
}
