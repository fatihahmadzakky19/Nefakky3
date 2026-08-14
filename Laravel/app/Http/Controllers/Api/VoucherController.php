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
            ->where('status', 'Active')
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

        $discountAmount = $voucher->calculateDiscountAmount($request->subtotal);

        if ($discountAmount <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Minimal belanja untuk voucher ini adalah Rp ' . number_format($voucher->min_spend, 0, ',', '.')
            ], 400);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Voucher berhasil digunakan!',
            'data' => [
                'voucher_id' => $voucher->voucher_id,
                'code' => $voucher->code,
                'name' => $voucher->name,
                'discount_percent' => $voucher->discount_percent,
                'discount_amount' => $discountAmount,
                'final_price' => max(0, $request->subtotal - $discountAmount),
            ]
        ]);
    }
}
