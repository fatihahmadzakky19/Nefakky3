<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StoreSettingResource;
use App\Models\StoreSetting;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller StoreSettingController
 * Mengelola Pengaturan Sistem, Profil Toko, dan Koordinat Dapur Utama.
 */
class StoreSettingController extends Controller
{
    use ApiResponseTrait;

    public function index(): JsonResponse
    {
        $settings = StoreSetting::all();
        $formatted = [];
        foreach ($settings as $s) {
            $formatted[$s->key] = $s->value;
        }

        return $this->successResponse([
            'settings' => $formatted,
            'list' => StoreSettingResource::collection($settings),
        ], 'Pengaturan toko berhasil diambil');
    }

    public function show($key): JsonResponse
    {
        $setting = StoreSetting::where('key', $key)->first();

        if (!$setting) {
            return $this->notFoundResponse("Pengaturan '{$key}' tidak ditemukan");
        }

        return $this->successResponse(new StoreSettingResource($setting), 'Pengaturan berhasil diambil');
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($data['settings'] as $key => $value) {
            StoreSetting::updateOrCreate(
                ['key' => $key],
                ['value' => (string) $value]
            );
        }

        return $this->successResponse(null, 'Pengaturan toko berhasil diperbarui!');
    }
}
