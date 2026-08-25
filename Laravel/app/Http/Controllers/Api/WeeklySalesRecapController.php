<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeeklySalesRecap;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller WeeklySalesRecapController
 * Mengelola API Laporan Rekap Penjualan Mingguan & Bazar Kuliner (Juli & Agustus 2026).
 */
class WeeklySalesRecapController extends Controller
{
    use ApiResponseTrait;

    /**
     * Menampilkan seluruh rekapitulasi penjualan mingguan
     */
    public function index(Request $request): JsonResponse
    {
        $year = $request->query('year', '2026');
        $month = $request->query('month');

        $query = WeeklySalesRecap::where('year', $year);

        if ($month) {
            $query->where('month', $month);
        }

        $recaps = $query->orderBy('month', 'desc')
                        ->orderBy('week_number', 'asc')
                        ->get();

        // Jika tabel masih kosong, jalankan seeder default otomatis
        if ($recaps->isEmpty()) {
            $seeder = new \Database\Seeders\WeeklySalesRecapSeeder();
            $seeder->run();
            $recaps = $query->orderBy('month', 'desc')
                            ->orderBy('week_number', 'asc')
                            ->get();
        }

        $juliItems = $recaps->where('month', 'Juli')->values();
        $agustusItems = $recaps->where('month', 'Agustus')->values();

        return response()->json([
            'success' => true,
            'status' => 'success',
            'code' => 200,
            'year' => (int)$year,
            'data' => [
                'all' => $recaps,
                'juli' => $juliItems,
                'agustus' => $agustusItems,
            ],
            'message' => 'Data rekap mingguan berhasil diambil',
        ]);
    }

    /**
     * Mengambil rekap berdasarkan nama bulan tertentu ('Juli' atau 'Agustus')
     */
    public function byMonth(Request $request, string $month): JsonResponse
    {
        $year = $request->query('year', '2026');

        $recaps = WeeklySalesRecap::where('year', $year)
            ->whereRaw('LOWER(month) = ?', [strtolower($month)])
            ->orderBy('week_number', 'asc')
            ->get();

        if ($recaps->isEmpty()) {
            $seeder = new \Database\Seeders\WeeklySalesRecapSeeder();
            $seeder->run();
            $recaps = WeeklySalesRecap::where('year', $year)
                ->whereRaw('LOWER(month) = ?', [strtolower($month)])
                ->orderBy('week_number', 'asc')
                ->get();
        }

        return response()->json([
            'success' => true,
            'status' => 'success',
            'code' => 200,
            'month' => ucfirst($month),
            'year' => (int)$year,
            'data' => $recaps,
        ]);
    }

    /**
     * Menyimpan baris rekap baru
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'year' => 'nullable|integer',
            'month' => 'required|string|max:30',
            'week_number' => 'required|integer',
            'week_label' => 'required|string|max:50',
            'sales_category' => 'required|string|max:100',
            'gross_revenue' => 'required|numeric',
            'net_profit' => 'required|numeric',
            'operational_details' => 'nullable|string',
            'is_total_row' => 'nullable|boolean',
        ]);

        $recap = WeeklySalesRecap::create($validated);

        return $this->createdResponse($recap, 'Baris rekap mingguan berhasil ditambahkan!');
    }

    /**
     * Memperbarui baris rekap
     */
    public function update(Request $request, $id): JsonResponse
    {
        $recap = WeeklySalesRecap::find($id);

        if (!$recap) {
            return $this->notFoundResponse('Data rekap mingguan tidak ditemukan');
        }

        $validated = $request->validate([
            'sales_category' => 'sometimes|required|string|max:100',
            'gross_revenue' => 'sometimes|required|numeric',
            'net_profit' => 'sometimes|required|numeric',
            'operational_details' => 'nullable|string',
            'week_label' => 'sometimes|required|string|max:50',
        ]);

        $recap->update($validated);

        return $this->successResponse($recap, 'Data rekap mingguan berhasil diperbarui!');
    }

    /**
     * Menghapus baris rekap
     */
    public function destroy($id): JsonResponse
    {
        $recap = WeeklySalesRecap::find($id);

        if (!$recap) {
            return $this->notFoundResponse('Data rekap tidak ditemukan');
        }

        $recap->delete();

        return $this->successResponse(null, 'Baris rekap berhasil dihapus');
    }
}
