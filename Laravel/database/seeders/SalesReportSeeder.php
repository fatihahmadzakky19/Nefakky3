<?php

namespace Database\Seeders;

use App\Models\SalesReport;
use Illuminate\Database\Seeder;

/**
 * Class SalesReportSeeder
 * 
 * Seeder ini bertanggung jawab untuk mengisi data historis laporan omset kotor,
 * laba bersih, total volume pesanan, dan penanda event bazar kuliner tahun 2026.
 */
class SalesReportSeeder extends Seeder
{
    /**
     * Menjalankan proses seeding data laporan finansial penjualan.
     *
     * @return void
     */
    public function run(): void
    {
        // Daftar data rekapitulasi penjualan per bulan untuk visualisasi grafik dan analisis finansial
        $months2026 = [
            ['month_year' => 'Juni 2026', 'gross' => 10500000, 'net' => 4750000, 'orders' => 210, 'is_bazar' => true, 'event' => 'Event Bazar Pembukaan Juni (>10Jt Omset)'],
            ['month_year' => 'Juli 2026', 'gross' => 11200000, 'net' => 5100000, 'orders' => 235, 'is_bazar' => true, 'event' => 'Event Bazar Kuliner Juli (>10Jt Omset)'],
            ['month_year' => 'Agustus 2026 (Live)', 'gross' => 13800000, 'net' => 6900000, 'orders' => 260, 'is_bazar' => true, 'event' => 'Event Bazar Merdeka + Live Web Realtime'],
            ['month_year' => 'September 2026', 'gross' => 0, 'net' => 0, 'orders' => 0, 'is_bazar' => false, 'event' => 'Belum Ada Data (Periode Mendatang)'],
            ['month_year' => 'Oktober 2026', 'gross' => 0, 'net' => 0, 'orders' => 0, 'is_bazar' => false, 'event' => 'Belum Ada Data (Periode Mendatang)'],
            ['month_year' => 'November 2026', 'gross' => 0, 'net' => 0, 'orders' => 0, 'is_bazar' => false, 'event' => 'Belum Ada Data (Periode Mendatang)'],
            ['month_year' => 'Desember 2026', 'gross' => 0, 'net' => 0, 'orders' => 0, 'is_bazar' => false, 'event' => 'Belum Ada Data (Periode Mendatang)'],
        ];

        // Menyimpan atau memperbarui data laporan keuangan per bulan
        foreach ($months2026 as $m) {
            SalesReport::updateOrCreate(
                [
                    'year' => '2026',
                    'month_year' => $m['month_year'],
                ],
                [
                    'gross_revenue' => $m['gross'], // Pendapatan kotor
                    'net_profit' => $m['net'], // Laba bersih operasional
                    'total_orders' => $m['orders'], // Jumlah pesanan terselesaikan
                    'is_bazar' => $m['is_bazar'], // Penanda apakah dari event bazar
                    'event_tag' => $m['event'], // Catatan / nama event bazar
                ]
            );
        }
    }
}
