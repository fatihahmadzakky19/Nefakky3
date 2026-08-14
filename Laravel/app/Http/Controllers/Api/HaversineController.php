<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HaversineController extends Controller
{
    /**
     * Central Kitchen Location: Puri Bojong Lestari AF No 41, Bojong Gede, Bogor
     */
    private const KITCHEN_LAT = -6.4789;
    private const KITCHEN_LON = 106.7912;

    public function calculateDistance(Request $request)
    {
        $lat = (float) $request->input('lat', -6.2088);
        $lon = (float) $request->input('lon', 106.8456);

        $distanceKm = $this->haversineFormula(self::KITCHEN_LAT, self::KITCHEN_LON, $lat, $lon);
        $estimatedMinutes = max(15, round($distanceKm * 4 + 15)); // 15 mins base + 4 mins per KM

        return response()->json([
            'status' => 'success',
            'distance_km' => round($distanceKm, 2),
            'estimated_delivery_minutes' => $estimatedMinutes,
            'estimated_delivery_text' => "{$estimatedMinutes} Menit",
            'is_safe_range' => $distanceKm <= 25.0,
            'kitchen_location' => 'Puri Bojong Lestari AF No 41, Bojong Gede, Bogor',
        ]);
    }

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
