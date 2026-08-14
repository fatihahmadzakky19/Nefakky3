<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesReport;
use Illuminate\Http\Request;

class SalesReportController extends Controller
{
    public function index()
    {
        $reports = SalesReport::orderBy('id', 'asc')->get();

        $totalGross = $reports->sum('gross_revenue');
        $totalNet = $reports->sum('net_profit');
        $totalOrders = $reports->sum('total_orders');

        return response()->json([
            'status' => 'success',
            'summary' => [
                'total_gross_revenue' => $totalGross,
                'total_net_profit' => $totalNet,
                'total_orders' => $totalOrders,
                'aov' => $totalOrders > 0 ? round($totalGross / $totalOrders) : 0,
            ],
            'data' => $reports
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'month_year' => 'required|string',
            'gross_revenue' => 'required|numeric|min:0',
            'net_profit' => 'required|numeric|min:0',
            'total_orders' => 'required|integer|min:0',
            'event_tag' => 'nullable|string',
        ]);

        $report = SalesReport::updateOrCreate(
            ['month_year' => $validated['month_year']],
            $validated
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan penjualan berhasil diperbarui!',
            'data' => $report
        ]);
    }
}
