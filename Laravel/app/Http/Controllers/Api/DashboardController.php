<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\ProductItem;
use App\Models\Review;
use App\Models\SalesReport;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

/**
 * Controller DashboardController
 * Menyajikan Ringkasan Eksekutif, Analisis Omset Finansial, Metrik Operasional, dan Alert Stok Menipis.
 */
class DashboardController extends Controller
{
    use ApiResponseTrait;

    /**
     * Mengambil seluruh metrik ringkasan untuk Dashboard Admin
     */
    public function overview(): JsonResponse
    {
        // 1. Data Finansial & Omset
        $reports = SalesReport::where('year', '2026')->get();
        $totalGrossRevenue = (float) $reports->sum('gross_revenue');
        $totalNetProfit = (float) $reports->sum('net_profit');
        $totalHistoricalOrders = (int) $reports->sum('total_orders');

        // Omset dari Pesanan Live yang Berhasil / Lunas
        $liveOrdersGross = (float) Order::where('payment_badge', 'PAID')->sum('total');
        $liveOrdersCount = Order::count();

        // 2. Data Produk & Peringatan Stok
        $totalProducts = ProductItem::count();
        $activeProducts = ProductItem::where('visibility', true)->where('status', 'Active')->count();
        $lowStockProducts = ProductItem::where('stock', '<=', 5)->where('stock', '>', 0)->get();
        $outOfStockProducts = ProductItem::where('stock', '<=', 0)->get();

        // 3. Data Pelanggan
        $totalCustomers = User::where('role', 'customer')->count();

        // 4. Pesanan Terbaru
        $recentOrders = Order::with('items')->orderBy('created_at', 'desc')->take(5)->get();

        // 5. Menu Kuliner Terpopuler / Terlaris
        $topProducts = ProductItem::orderBy('reviews_count', 'desc')->take(5)->get();

        // 6. Rata-rata Kepuasan Pelanggan (Rating)
        $avgRating = Review::count() > 0 ? round(Review::avg('rating'), 1) : 5.0;
        $totalReviews = Review::count();

        // 7. Data Grafik Finansial Bulanan
        $monthlyChart = $reports->map(function ($r) {
            return [
                'month' => $r->month_year,
                'gross' => (float) $r->gross_revenue,
                'net' => (float) $r->net_profit,
                'orders' => (int) $r->total_orders,
                'is_bazar' => (bool) $r->is_bazar,
            ];
        });

        $data = [
            'financial' => [
                'total_gross_revenue' => $totalGrossRevenue + $liveOrdersGross,
                'total_net_profit' => $totalNetProfit,
                'total_orders' => $totalHistoricalOrders + $liveOrdersCount,
                'average_order_value' => ($totalHistoricalOrders + $liveOrdersCount) > 0 ? round(($totalGrossRevenue + $liveOrdersGross) / ($totalHistoricalOrders + $liveOrdersCount)) : 0,
            ],
            'inventory' => [
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'low_stock_count' => $lowStockProducts->count(),
                'out_of_stock_count' => $outOfStockProducts->count(),
                'low_stock_items' => ProductResource::collection($lowStockProducts),
            ],
            'customers' => [
                'total_customers' => $totalCustomers,
                'avg_rating' => $avgRating,
                'total_reviews' => $totalReviews,
            ],
            'recent_orders' => OrderResource::collection($recentOrders),
            'top_products' => ProductResource::collection($topProducts),
            'monthly_chart' => $monthlyChart,
        ];

        return $this->successResponse($data, 'Ringkasan dashboard admin berhasil diambil');
    }
}
