<?php

// Namespace penempat controller dalam struktur folder Laravel API
namespace App\Http\Controllers\Api;

// Mengimpor controller induk dari Laravel
use App\Http\Controllers\Controller;
// Mengimpor Model Voucher untuk membaca dan kalkulasi diskon
use App\Models\Voucher;
// Mengimpor Request untuk menangani HTTP request dari client
use Illuminate\Http\Request;

// Class Controller untuk mengelola validasi voucher promo dan daftar voucher
class VoucherController extends Controller
{
    /**
     * Menampilkan daftar semua voucher promo yang sedang aktif
     */
    public function index()
    {
        // Filter voucher yang is_active = true dan status = 'Active'
        $vouchers = Voucher::where('is_active', true)
            ->where('status', 'Active')
            ->get();

        // Mengembalikan daftar voucher aktif dalam bentuk response JSON
        return response()->json([
            'status' => 'success',
            'data' => $vouchers
        ]);
    }

    /**
     * Memvalidasi kode voucher dan menghitung besaran nominal potongan harga
     */
    public function validateVoucher(Request $request)
    {
        // Validasi input: kode voucher wajib diisi, subtotal belanja wajib angka >= 0
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        // Cari voucher di database berdasarkan kode (disamakan huruf besar) dan status aktif
        $voucher = Voucher::where('code', strtoupper($request->code))
            ->where('is_active', true)
            ->first();

        // Jika voucher tidak ditemukan atau sudah tidak aktif
        if (!$voucher) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode voucher tidak ditemukan atau sudah tidak aktif.'
            ], 404);
        }

        // Panggil metode PBO calculateDiscountAmount() pada model Voucher untuk menghitung jumlah diskon
        $discountAmount = $voucher->calculateDiscountAmount($request->subtotal);

        // Jika nominal diskon 0 (artinya belum mencapai min_spend minimal belanja)
        if ($discountAmount <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Minimal belanja untuk voucher ini adalah Rp ' . number_format($voucher->min_spend, 0, ',', '.')
            ], 400);
        }

        // Kembalikan rincian potongan diskon dan harga akhir setelah diskon
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

