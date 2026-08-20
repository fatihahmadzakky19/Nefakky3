<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller HaversineController
 * Mengukur jarak linier titik koordinat geografis pelanggan dari Central Kitchen Nefakky (Bojong Gede, Bogor).
 */
class HaversineController extends Controller
{
    use ApiResponseTrait;

    /**
     * Koordinat Default Dapur Utama (Central Kitchen):
     * Puri Bojong Lestari AF No 41, Bojong Gede, Bogor
     */
    private const DEFAULT_KITCHEN_LAT = -6.4789;
    private const DEFAULT_KITCHEN_LON = 106.7912;
    private const DEFAULT_KITCHEN_ADDR = 'Puri Bojong Lestari AF No 41, Bojong Gede, Bogor';
    private const MAX_SAFE_RANGE_KM = 25.0;

    /**
     * Mengukur jarak KM dari Dapur Utama ke lokasi pembeli dan menghitung estimasi menit pengiriman & ongkir
     */
    public function calculateDistance(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lon' => 'required|numeric|between:-180,180',
        ]);

        $lat = (float) $request->lat;
        $lon = (float) $request->lon;

        // Ambil koordinat Dapur Utama dari setting jika ada
        $kitchenLat = (float) StoreSetting::get('kitchen_lat', self::DEFAULT_KITCHEN_LAT);
        $kitchenLon = (float) StoreSetting::get('kitchen_lon', self::DEFAULT_KITCHEN_LON);
        $kitchenAddress = StoreSetting::get('kitchen_address', self::DEFAULT_KITCHEN_ADDR);

        // Kalkulasi jarak menggunakan Formula Haversine
        $distanceKm = $this->haversineFormula($kitchenLat, $kitchenLon, $lat, $lon);
        $distanceKmRounded = round($distanceKm, 2);

        // Estimasi durasi: 15 menit penyiapan dasar + 4 menit per KM
        $estimatedMinutes = max(15, round($distanceKm * 4 + 15));

        // Kalkulasi ongkos kirim: Rp 8.000 dasar (0-3 km) + Rp 2.000 per KM berikutnya
        $shippingFee = $distanceKm <= 3.0 ? 8000 : round(8000 + (($distanceKm - 3.0) * 2000));

        $isSafeRange = $distanceKm <= self::MAX_SAFE_RANGE_KM;

        $data = [
            'distance_km' => $distanceKmRounded,
            'distanceKm' => $distanceKmRounded,
            'estimated_delivery_minutes' => $estimatedMinutes,
            'estimatedDeliveryMinutes' => $estimatedMinutes,
            'estimated_delivery_text' => "{$estimatedMinutes} Menit",
            'estimatedDeliveryText' => "{$estimatedMinutes} Menit",
            'shipping_cost' => (float) $shippingFee,
            'shippingCost' => (float) $shippingFee,
            'is_safe_range' => $isSafeRange,
            'isSafeRange' => $isSafeRange,
            'max_delivery_km' => self::MAX_SAFE_RANGE_KM,
            'kitchen_location' => $kitchenAddress,
        ];

        return $this->successResponse($data, 'Kalkulasi jarak pengiriman berhasil dihitung');
    }

    /**
     * Metode Matematika Haversine Formula untuk menghitung jarak 2 titik koordinat bumi (KM)
     */
    private function haversineFormula($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadiusKm = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadiusKm * $c;
    }
}
