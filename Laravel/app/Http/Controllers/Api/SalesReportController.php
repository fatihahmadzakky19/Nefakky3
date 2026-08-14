<?php

// Namespace penempat controller dalam struktur folder Laravel API
namespace App\Http\Controllers\Api;

// Mengimpor controller induk dari Laravel
use App\Http\Controllers\Controller;
// Mengimpor Model SalesReport untuk mengelola data laporan keuangan penjualan
use App\Models\SalesReport;
// Mengimpor Request untuk membaca data input HTTP
use Illuminate\Http\Request;

// Class Controller untuk statistik laporan penjualan & perhitungan AOV (Average Order Value)
class SalesReportController extends Controller
{
    /**
     * Menampilkan ringkasan statistik total omzet, laba bersih, total order, dan AOV
     */
    public function index()
    {
        // Ambil semua data laporan penjualan diurutkan berdasarkan ID terlama ke terbaru
        $reports = SalesReport::orderBy('id', 'asc')->get();

        // Hitung total kotor (omzet) dari seluruh bulan
        $totalGross = $reports->sum('gross_revenue');
        // Hitung total laba bersih dari seluruh bulan
        $totalNet = $reports->sum('net_profit');
        // Hitung akumulasi total jumlah pesanan dari seluruh bulan
        $totalOrders = $reports->sum('total_orders');

        // Kembalikan response JSON berisi statistik ringkasan dan rincian data bulanan
        return response()->json([
            'status' => 'success',
            'summary' => [
                'total_gross_revenue' => $totalGross, // Total pendapatan kotor
                'total_net_profit' => $totalNet, // Total keuntungan bersih
                'total_orders' => $totalOrders, // Total jumlah transaksi
                'aov' => $totalOrders > 0 ? round($totalGross / $totalOrders) : 0, // Hitung AOV (Rata-rata nilai per order)
            ],
            'data' => $reports // Array rincian laporan per bulan
        ]);
    }

    /**
     * Menyimpan atau memperbarui (updateOrCreate) data laporan penjualan bulanan
     */
    public function store(Request $request)
    {
        // Validasi input data laporan penjualan
        $validated = $request->validate([
            'month_year' => 'required|string', // Bulan dan Tahun (cth: "Agu 2026") wajib diisi
            'gross_revenue' => 'required|numeric|min:0', // Pendapatan kotor wajib angka >= 0
            'net_profit' => 'required|numeric|min:0', // Keuntungan bersih wajib angka >= 0
            'total_orders' => 'required|integer|min:0', // Total pesanan wajib integer >= 0
            'event_tag' => 'nullable|string', // Tag event promo opsional (cth: "Promo Merdeka")
        ]);

        // Cari berdasarkan month_year, jika sudah ada maka update, jika belum ada maka buat record baru
        $report = SalesReport::updateOrCreate(
            ['month_year' => $validated['month_year']],
            $validated
        );

        // Kembalikan response JSON konfirmasi sukses
        return response()->json([
            'status' => 'success',
            'message' => 'Laporan penjualan berhasil diperbarui!',
            'data' => $report
        ]);
    }
}

