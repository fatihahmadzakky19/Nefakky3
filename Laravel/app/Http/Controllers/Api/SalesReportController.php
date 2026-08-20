<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSalesReportRequest;
use App\Http\Resources\SalesReportResource;
use App\Models\SalesReport;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller SalesReportController
 * Mengelola Laporan Finansial, Omset Penjualan Bulanan, dan Analisis Performa Bazar Kuliner.
 */
class SalesReportController extends Controller
{
    use ApiResponseTrait;

    /**
     * Menampilkan laporan omset dan keuangan berdasarkan filter tahun
     */
    public function index(Request $request): JsonResponse
    {
        $year = $request->query('year', '2026');

        $reports = SalesReport::where('year', $year)->orderBy('id', 'asc')->get();

        // Jika belum ada data sama sekali pada tahun tersebut, inisialisasi data default
        if ($reports->isEmpty()) {
            $defaultMonths = [
                ['month_year' => "Juni {$year}", 'gross' => 10500000, 'net' => 4750000, 'orders' => 210, 'is_bazar' => true, 'event' => "Event Bazar Pembukaan Juni (>10Jt Omset)"],
                ['month_year' => "Juli {$year}", 'gross' => 11200000, 'net' => 5100000, 'orders' => 235, 'is_bazar' => true, 'event' => "Event Bazar Kuliner Juli (>10Jt Omset)"],
                ['month_year' => "Agustus {$year} (Live)", 'gross' => 13800000, 'net' => 6900000, 'orders' => 260, 'is_bazar' => true, 'event' => "Event Bazar Merdeka + Live Web Realtime"],
                ['month_year' => "September {$year}", 'gross' => 0, 'net' => 0, 'orders' => 0, 'is_bazar' => false, 'event' => "Periode Mendatang"],
                ['month_year' => "Oktober {$year}", 'gross' => 0, 'net' => 0, 'orders' => 0, 'is_bazar' => false, 'event' => "Periode Mendatang"],
                ['month_year' => "November {$year}", 'gross' => 0, 'net' => 0, 'orders' => 0, 'is_bazar' => false, 'event' => "Periode Mendatang"],
                ['month_year' => "Desember {$year}", 'gross' => 0, 'net' => 0, 'orders' => 0, 'is_bazar' => false, 'event' => "Periode Mendatang"],
            ];

            foreach ($defaultMonths as $m) {
                SalesReport::create([
                    'year' => $year,
                    'month_year' => $m['month_year'],
                    'gross_revenue' => $m['gross'],
                    'net_profit' => $m['net'],
                    'total_orders' => $m['orders'],
                    'event_tag' => $m['event'],
                    'is_bazar' => $m['is_bazar'],
                ]);
            }

            $reports = SalesReport::where('year', $year)->orderBy('id', 'asc')->get();
        }

        $totalGross = (float) $reports->sum('gross_revenue');
        $totalNet = (float) $reports->sum('net_profit');
        $totalOrders = (int) $reports->sum('total_orders');
        $aov = $totalOrders > 0 ? round($totalGross / $totalOrders) : 0;

        $bazarGross = (float) $reports->where('is_bazar', true)->sum('gross_revenue');
        $bazarOrders = (int) $reports->where('is_bazar', true)->sum('total_orders');

        return response()->json([
            'success' => true,
            'status' => 'success',
            'code' => 200,
            'year' => $year,
            'summary' => [
                'total_gross_revenue' => $totalGross,
                'total_net_profit' => $totalNet,
                'total_orders' => $totalOrders,
                'aov' => $aov,
                'total_bazar_revenue' => $bazarGross,
                'total_bazar_orders' => $bazarOrders,
            ],
            'data' => SalesReportResource::collection($reports),
        ]);
    }

    /**
     * Mengambil daftar tahun yang tersedia di database
     */
    public function years(): JsonResponse
    {
        $years = SalesReport::select('year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        $currentYear = date('Y');
        if (!in_array($currentYear, $years)) {
            array_unshift($years, $currentYear);
        }

        return response()->json([
            'success' => true,
            'status' => 'success',
            'code' => 200,
            'years' => array_values(array_unique($years)),
        ]);
    }

    /**
     * Menyimpan / Memperbarui data omset bulanan
     */
    public function store(StoreSalesReportRequest $request): JsonResponse
    {
        $data = $request->validated();
        $year = $data['year'] ?? '2026';

        $report = SalesReport::updateOrCreate(
            [
                'year' => $year,
                'month_year' => $data['month_year']
            ],
            [
                'gross_revenue' => $data['gross_revenue'],
                'net_profit' => $data['net_profit'],
                'total_orders' => $data['total_orders'],
                'event_tag' => $data['event_tag'] ?? null,
                'is_bazar' => $data['is_bazar'] ?? false,
            ]
        );

        return $this->createdResponse(new SalesReportResource($report), 'Laporan omset penjualan berhasil disimpan!');
    }

    /**
     * Menghapus baris laporan
     */
    public function destroy($id): JsonResponse
    {
        $report = SalesReport::find($id);

        if (!$report) {
            return $this->notFoundResponse('Data laporan tidak ditemukan');
        }

        $report->delete();

        return $this->successResponse(null, 'Laporan berhasil dihapus');
    }
}