<?php

// Namespace penempat controller dalam struktur folder Laravel API
namespace App\Http\Controllers\Api;

// Mengimpor controller induk dari Laravel
use App\Http\Controllers\Controller;
// Mengimpor Request dari Laravel untuk membaca koordinat latitude & longitude
use Illuminate\Http\Request;

// Class Controller untuk menghitung jarak titik koordinat lokasi (Haversine Formula)
class HaversineController extends Controller
{
    /**
     * Koordinat Tetap Dapur Utama (Central Kitchen): Puri Bojong Lestari AF No 41, Bojong Gede, Bogor
     */
    private const KITCHEN_LAT = -6.4789; // Latitude Dapur Utama
    private const KITCHEN_LON = 106.7912; // Longitude Dapur Utama

    /**
     * Mengukur jarak KM dari Dapur Utama ke lokasi pembeli dan menghitung estimasi menit pengiriman
     */
    public function calculateDistance(Request $request)
    {
        // Ambil nilai latitude pembeli dari request (default latitude Monas Jakarta jika tidak diisi)
        $lat = (float) $request->input('lat', -6.2088);
        // Ambil nilai longitude pembeli dari request (default longitude Monas Jakarta jika tidak diisi)
        $lon = (float) $request->input('lon', 106.8456);

        // Hitung jarak linier (garis lengkung bumi) menggunakan metode PBO haversineFormula
        $distanceKm = $this->haversineFormula(self::KITCHEN_LAT, self::KITCHEN_LON, $lat, $lon);
        // Estimasi menit pengiriman: 15 menit persiapan dasar + 4 menit per KM jarak
        $estimatedMinutes = max(15, round($distanceKm * 4 + 15));

        // Kembalikan response JSON hasil kalkulasi jarak dan estimasi waktu pengiriman
        return response()->json([
            'status' => 'success',
            'distance_km' => round($distanceKm, 2), // Jarak dalam kilometer (dibulatkan 2 desimal)
            'estimated_delivery_minutes' => $estimatedMinutes, // Estimasi waktu dalam menit (angka)
            'estimated_delivery_text' => "{$estimatedMinutes} Menit", // Teks durasi estimasi pengiriman
            'is_safe_range' => $distanceKm <= 25.0, // Batas jangkauan pengiriman aman (maksimal 25 km)
            'kitchen_location' => 'Puri Bojong Lestari AF No 41, Bojong Gede, Bogor', // Alamat fisik Dapur Utama
        ]);
    }

    /**
     * Metode Matematika Haversine Formula untuk menghitung jarak antara 2 titik koordinat bumi (dalam KM)
     */
    private function haversineFormula($lat1, $lon1, $lat2, $lon2): float
    {
        // Jari-jari rata-rata planet Bumi dalam satuan kilometer
        $earthRadiusKm = 6371;

        // Konversi selisih latitude dari derajat ke radian
        $dLat = deg2rad($lat2 - $lat1);
        // Konversi selisih longitude dari derajat ke radian
        $dLon = deg2rad($lon2 - $lon1);

        // Perhitungan rumus trigonometri Haversine bagian 'a'
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        // Perhitungan sudut kelengkungan 'c' menggunakan atan2 dan sqrt
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        // Kalikan jari-jari bumi dengan sudut kelengkungan untuk mendapatkan jarak linier KM
        return $earthRadiusKm * $c;
    }
}

