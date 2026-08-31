<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan Controller ke dalam namespace App\Http\Controllers\Api.
// Konsep PBO: Struktur hierarki direktori & pengelompokan class Controller REST API.
// -----------------------------------------------------------------------------
namespace App\Http\Controllers\Api;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor basis Controller, Model setting, & HTTP handler.
// Konsep PBO: Pewarisan, Dependency, & Abstraksi Permintaan HTTP.
// -----------------------------------------------------------------------------
use App\Http\Controllers\Controller; // Superclass Controller Laravel
use App\Models\StoreSetting;          // Objek Model Pengaturan Toko
use App\Traits\ApiResponseTrait;     // Trait standardisasi respon API
use Illuminate\Http\JsonResponse;    // Tipe respon JSON
use Illuminate\Http\Request;         // Objek penampung HTTP Request

/**
 * =============================================================================
 * CLASS: HaversineController (Pemrograman Berorientasi Objek / PBO)
 * =============================================================================
 * Controller untuk mengukur jarak linier geografis dari Dapur Pusat (Central Kitchen)
 * ke titik lokasi GPS pelanggan, menghitung durasi estimasi tiba, & ongkos kirim.
 *
 * Konsep PBO yang Diterapkan:
 * 1. INHERITANCE   : Mewarisi kapabilitas dasar controller via 'extends Controller'.
 * 2. COMPOSITION   : Mengadopsi 'ApiResponseTrait' untuk keseragaman output JSON.
 * 3. ENKAPSULASI   : Menyembunyikan konstanta & metode matematika (private method).
 * =============================================================================
 */
class HaversineController extends Controller
{
    // Komposisi Trait Respon API Standar
    use ApiResponseTrait;

    // -------------------------------------------------------------------------
    // ENKAPSULASI KONSTANTA PRIVATE: Nilai baku koordinat dapur pusat
    // -------------------------------------------------------------------------
    private const DEFAULT_KITCHEN_LAT = -6.4789;                                              // Garis Lintang (Latitude) Dapur
    private const DEFAULT_KITCHEN_LON = 106.7912;                                             // Garis Bujur (Longitude) Dapur
    private const DEFAULT_KITCHEN_ADDR = 'Puri Bojong Lestari AF No 41, Bojong Gede, Bogor'; // Alamat fisik dapur
    private const MAX_SAFE_RANGE_KM = 25.0;                                                   // Batas radius pengantaran maksimal (Km)

    /**
     * =========================================================================
     * METODE PBO PUBLIK: calculateDistance()
     * =========================================================================
     * Mengorkestrasi input koordinat GPS pembeli, mengambil konfigurasi toko,
     * memanggil rumus Haversine, dan menghitung tarif ongkir serta estimasi menit.
     *
     * @param Request $request Objek HTTP Request yang membawa nilai lat & lon
     * @return JsonResponse
     */
    public function calculateDistance(Request $request): JsonResponse
    {
        // 1. Validasi tipe data dan jangkauan sudut koordinat bumi
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lon' => 'required|numeric|between:-180,180',
        ]);

        // 2. Konversi input ke bilangan pecahan float murni
        $lat = (float) $request->lat;
        $lon = (float) $request->lon;

        // 3. Ambil koordinat Dapur Pusat dari database (StoreSetting) atau gunakan fallback constant
        $kitchenLat = (float) StoreSetting::get('kitchen_lat', self::DEFAULT_KITCHEN_LAT);
        $kitchenLon = (float) StoreSetting::get('kitchen_lon', self::DEFAULT_KITCHEN_LON);
        $kitchenAddress = StoreSetting::get('kitchen_address', self::DEFAULT_KITCHEN_ADDR);

        // 4. Hitung jarak menggunakan private method haversineFormula()
        $distanceKm = $this->haversineFormula($kitchenLat, $kitchenLon, $lat, $lon);
        $distanceKmRounded = round($distanceKm, 2); // Bulatkan 2 angka desimal

        // 5. Kalkulasi estimasi durasi pengiriman: 15 menit penyiapan + 4 menit per KM
        $estimatedMinutes = max(15, round($distanceKm * 4 + 15));

        // 6. Kalkulasi ongkos kirim: Rp 8.000 dasar (0-3 km) + Rp 2.000 per KM berikutnya
        $shippingFee = $distanceKm <= 3.0 ? 8000 : round(8000 + (($distanceKm - 3.0) * 2000));

        // 7. Evaluasi apakah lokasi pembeli masih dalam jangkauan radius aman
        $isSafeRange = $distanceKm <= self::MAX_SAFE_RANGE_KM;

        // 8. Susun dictionary data hasil kalkulasi
        $data = [
            'distance_km'                => $distanceKmRounded,
            'distanceKm'                 => $distanceKmRounded,
            'estimated_delivery_minutes' => $estimatedMinutes,
            'estimatedDeliveryMinutes'   => $estimatedMinutes,
            'estimated_delivery_text'    => "{$estimatedMinutes} Menit",
            'estimatedDeliveryText'      => "{$estimatedMinutes} Menit",
            'shipping_cost'              => (float) $shippingFee,
            'shippingCost'               => (float) $shippingFee,
            'is_safe_range'              => $isSafeRange,
            'isSafeRange'                => $isSafeRange,
            'max_delivery_km'            => self::MAX_SAFE_RANGE_KM,
            'kitchen_location'           => $kitchenAddress,
        ];

        // 9. Kembalikan respon sukses terenkapsulasi menggunakan trait
        return $this->successResponse($data, 'Kalkulasi jarak pengiriman berhasil dihitung');
    }

    /**
     * =========================================================================
     * METODE PBO PRIVATE: haversineFormula()
     * =========================================================================
     * Mengenkapsulasi algoritma matematika trigonometri bola bumi (Spherical Trigonometry)
     * untuk menghitung jarak lingkaran besar antara dua pasang koordinat lintang & bujur.
     * Hak akses 'private' memastikan metode internal ini tidak dapat dipanggil dari luar class.
     *
     * @param float $lat1 Latitude titik asal (Dapur)
     * @param float $lon1 Longitude titik asal (Dapur)
     * @param float $lat2 Latitude titik tujuan (Pembeli)
     * @param float $lon2 Longitude titik tujuan (Pembeli)
     * @return float Jarak dalam satuan Kilometer
     */
    private function haversineFormula($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadiusKm = 6371; // Radius rata-rata planet Bumi dalam Kilometer

        // Hitung selisih derajat dan ubah ke satuan Radian
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        // Rumus inti Haversine: a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        // Menghitung sudut lengkungan sentral (c): 2 * atan2(√a, √(1−a))
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        // Jarak (d) = Radius Bumi * Sudut Lengkungan (c)
        return $earthRadiusKm * $c;
    }
}

