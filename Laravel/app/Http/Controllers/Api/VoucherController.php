<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVoucherRequest;
use App\Http\Requests\UpdateVoucherRequest;
use App\Http\Requests\ValidateVoucherRequest;
use App\Http\Resources\VoucherResource;
use App\Models\Voucher;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller VoucherController
 * Mengelola Kupon Promo Diskon, Mesin Validasi Voucher Belanja, dan Auto-Reset Kuota Mingguan.
 */
class VoucherController extends Controller
{
    use ApiResponseTrait;

    /**
     * Menampilkan daftar semua voucher promo yang sedang aktif (Untuk Etalase Promo Pengunjung)
     */
    public function index(): JsonResponse
    {
        $vouchers = Voucher::where('is_active', true)
            ->where('status', 'Active')
            ->orderBy('created_at', 'desc')
            ->get();

        // Jalankan pengecekan auto-reset mingguan untuk setiap voucher
        foreach ($vouchers as $v) {
            $v->checkAndResetWeekly();
        }

        return $this->successResponse(VoucherResource::collection($vouchers), 'Daftar promo aktif berhasil diambil');
    }

    /**
     * Menampilkan seluruh voucher promo (Untuk Manajemen Admin)
     */
    public function all(Request $request): JsonResponse
    {
        $query = Voucher::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('event', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $vouchers = $query->orderBy('created_at', 'desc')->get();

        return $this->successResponse(VoucherResource::collection($vouchers), 'Seluruh data voucher berhasil diambil');
    }

    /**
     * Menampilkan detail satu voucher
     */
    public function show($id): JsonResponse
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return $this->notFoundResponse('Voucher tidak ditemukan');
        }

        $voucher->checkAndResetWeekly();

        return $this->successResponse(new VoucherResource($voucher), 'Detail voucher berhasil diambil');
    }

    /**
     * Menyimpan voucher promo baru
     */
    public function store(StoreVoucherRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['code'] = strtoupper($data['code']);
        
        $limit = $data['total_limit'] ?? 500;
        $data['total_limit'] = $limit;
        $data['used_count'] = 0;
        $data['redemptions'] = "0/{$limit}";

        $voucher = Voucher::create($data);

        return $this->createdResponse(new VoucherResource($voucher), 'Voucher promo berhasil dibuat!');
    }

    /**
     * Memperbarui data voucher promo
     */
    public function update(UpdateVoucherRequest $request, $id): JsonResponse
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return $this->notFoundResponse('Voucher tidak ditemukan');
        }

        $data = $request->validated();
        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $voucher->update($data);

        return $this->successResponse(new VoucherResource($voucher), 'Data voucher berhasil diperbarui');
    }

    /**
     * Menghapus voucher promo (Soft Delete)
     */
    public function destroy($id): JsonResponse
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return $this->notFoundResponse('Voucher tidak ditemukan');
        }

        $voucher->delete();

        return $this->successResponse(null, 'Voucher promo berhasil dihapus');
    }

    /**
     * Mengaktifkan / Menutup keaktifan voucher promo
     */
    public function toggleStatus($id): JsonResponse
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return $this->notFoundResponse('Voucher tidak ditemukan');
        }

        $voucher->is_active = !$voucher->is_active;
        $voucher->status = $voucher->is_active ? 'Active' : 'Expired';
        $voucher->save();

        return $this->successResponse(new VoucherResource($voucher), 'Status keaktifan voucher berhasil diubah');
    }

    /**
     * Memvalidasi kode voucher promo saat checkout belanja
     */
    public function validateVoucher(ValidateVoucherRequest $request): JsonResponse
    {
        $code = strtoupper(trim($request->code));
        $subtotal = (float) $request->subtotal;

        $voucher = Voucher::where('code', $code)->first();

        if (!$voucher) {
            return $this->errorResponse('Kode promo tidak ditemukan.', 404);
        }

        // Panggil metode PBO validasi komprehensif
        $validation = $voucher->checkValidity($subtotal);

        if (!$validation['valid']) {
            return $this->errorResponse($validation['reason'], 400);
        }

        $discountAmount = $validation['discount_amount'];
        $finalPrice = max(0, $subtotal - $discountAmount);

        return $this->successResponse([
            'voucher_id' => $voucher->voucher_id,
            'code' => $voucher->code,
            'name' => $voucher->name,
            'type' => $voucher->type,
            'discount_percent' => (float) $voucher->discount_percent,
            'discount_value' => (float) $voucher->discount_value,
            'discount_amount' => $discountAmount,
            'discountAmount' => $discountAmount,
            'final_price' => $finalPrice,
            'finalPrice' => $finalPrice,
            'min_spend' => (float) $voucher->min_spend,
        ], "Voucher {$voucher->code} berhasil digunakan! Potongan hemat Rp " . number_format($discountAmount, 0, ',', '.'));
    }
}
