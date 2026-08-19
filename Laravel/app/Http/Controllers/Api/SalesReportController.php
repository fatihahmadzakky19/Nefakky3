<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesReport;
use Illuminate\Http\Request;

class SalesReportController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->query('year', '2026');
        
        $reports = SalesReport::where('year', $year)
            ->orderBy('id', 'asc')
            ->get();

        if ($reports->isEmpty()) {
            // Default 3 bulan berjalan (Juni - Agustus 2026) jika belum ada data
            $defaultMonths = [
                ['month_year' => "Juni {$year}", 'gross' => 10500000, 'net' => 4750000, 'orders' => 210, 'is_bazar' => true, 'event' => "🎪 Event Bazar Pembukaan Juni"],
                ['month_year' => "Juli {$year}", 'gross' => 11200000, 'net' => 5100000, 'orders' => 235, 'is_bazar' => true, 'event' => "🎪 Event Bazar Kuliner Juli"],
                ['month_year' => "Agustus {$year} (Live)", 'gross' => 13200000, 'net' => 6600000, 'orders' => 260, 'is_bazar' => true, 'event' => "🎪 Event Bazar Merdeka + Live Web"],
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

        $year = $validated['year'] ?? '2026';

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