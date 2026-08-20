<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePromotionRequest;
use App\Http\Resources\PromotionResource;
use App\Models\Promotion;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller PromotionController
 * Mengelola Banner Promosi dan Banner Event Bazar Toko.
 */
class PromotionController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $query = Promotion::query();

        if ($request->has('active_only')) {
            $query->where('is_active', true)->where('badge', '!=', 'Ended');
        }

        $promotions = $query->orderBy('created_at', 'desc')->get();

        return $this->successResponse(PromotionResource::collection($promotions), 'Daftar banner promosi berhasil diambil');
    }

    public function show($id): JsonResponse
    {
        $promo = Promotion::find($id);

        if (!$promo) {
            return $this->notFoundResponse('Promosi tidak ditemukan');
        }

        return $this->successResponse(new PromotionResource($promo), 'Detail promosi berhasil diambil');
    }

    public function store(StorePromotionRequest $request): JsonResponse
    {
        $promo = Promotion::create($request->validated());
        return $this->createdResponse(new PromotionResource($promo), 'Banner promosi berhasil dibuat');
    }

    public function update(Request $request, $id): JsonResponse
    {
        $promo = Promotion::find($id);

        if (!$promo) {
            return $this->notFoundResponse('Promosi tidak ditemukan');
        }

        $promo->update($request->all());

        return $this->successResponse(new PromotionResource($promo), 'Promosi berhasil diperbarui');
    }

    public function toggleStatus($id): JsonResponse
    {
        $promo = Promotion::find($id);

        if (!$promo) {
            return $this->notFoundResponse('Promosi tidak ditemukan');
        }

        $promo->is_active = !$promo->is_active;
        $promo->save();

        return $this->successResponse(new PromotionResource($promo), 'Status promosi berhasil diubah');
    }

    public function destroy($id): JsonResponse
    {
        $promo = Promotion::find($id);

        if (!$promo) {
            return $this->notFoundResponse('Promosi tidak ditemukan');
        }

        $promo->delete();

        return $this->successResponse(null, 'Banner promosi berhasil dihapus');
    }
}
