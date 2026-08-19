<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesReport;
use Illuminate\Http\Request;

class SalesReportController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->query('year', date('Y'));
        
        $reports = SalesReport::where('year', $year)
            ->orderBy('id', 'asc')
            ->get();

        if ($reports->isEmpty()) {
            $monthNames = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];

            foreach ($monthNames as $monthName) {
                SalesReport::create([
                    'year' => $year,
                    'month_year' => "{$monthName} {$year}",
                    'gross_revenue' => 0,
                    'net_profit' => 0,
                    'total_orders' => 0,
                    'event_tag' => "Belum Ada Data (Periode Tahun {$year})",
                    'is_bazar' => false,
                ]);
            }

            $reports = SalesReport::where('year', $year)->orderBy('id', 'asc')->get();
        }

        $totalGross = $reports->sum('gross_revenue');
        $totalNet = $reports->sum('net_profit');
        $totalOrders = $reports->sum('total_orders');

        return response()->json([
            'status' => 'success',
            'year' => $year,
            'summary' => [
                'total_gross_revenue' => $totalGross,
                'total_net_profit' => $totalNet,
                'total_orders' => $totalOrders,
                'aov' => $totalOrders > 0 ? round($totalGross / $totalOrders) : 0,
            ],
            'data' => $reports
        ]);
    }

    public function years()
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
            'status' => 'success',
            'years' => array_values(array_unique($years))
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'year' => 'nullable|string',
            'month_year' => 'required|string',
            'gross_revenue' => 'required|numeric|min:0',
            'net_profit' => 'required|numeric|min:0',
            'total_orders' => 'required|integer|min:0',
            'event_tag' => 'nullable|string',
            'is_bazar' => 'nullable|boolean',
        ]);

        $year = $validated['year'] ?? date('Y');

        $report = SalesReport::updateOrCreate(
            [
                'year' => $year,
                'month_year' => $validated['month_year']
            ],
            [
                'gross_revenue' => $validated['gross_revenue'],
                'net_profit' => $validated['net_profit'],
                'total_orders' => $validated['total_orders'],
                'event_tag' => $validated['event_tag'] ?? null,
                'is_bazar' => $validated['is_bazar'] ?? false,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan penjualan berhasil disimpan!',
            'data' => $report
        ]);
    }
}