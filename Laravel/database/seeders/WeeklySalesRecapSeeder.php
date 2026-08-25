<?php

namespace Database\Seeders;

use App\Models\WeeklySalesRecap;
use Illuminate\Database\Seeder;

/**
 * Seeder WeeklySalesRecapSeeder
 * Mengisi data rekapitulasi penjualan mingguan dan laporan bazar untuk Bulan Juli dan Agustus 2026.
 */
class WeeklySalesRecapSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Data Rekap Bulan Juli 2026
        $juliData = [
            [
                'year' => 2026,
                'month' => 'Juli',
                'week_number' => 1,
                'week_label' => 'Minggu 1',
                'sales_category' => 'Bazar (1x) + Reguler',
                'gross_revenue' => 2750000.00,
                'net_profit' => 875000.00,
                'operational_details' => 'Bazar 2jt (Habis) | Jus 375rb (75 cup) + Makanan 375rb',
                'is_total_row' => false,
            ],
            [
                'year' => 2026,
                'month' => 'Juli',
                'week_number' => 2,
                'week_label' => 'Minggu 2',
                'sales_category' => 'Bazar (1x) + Reguler',
                'gross_revenue' => 2750000.00,
                'net_profit' => 875000.00,
                'operational_details' => 'Bazar 2jt (Habis) | Jus 375rb (75 cup) + Makanan 375rb',
                'is_total_row' => false,
            ],
            [
                'year' => 2026,
                'month' => 'Juli',
                'week_number' => 3,
                'week_label' => 'Minggu 3',
                'sales_category' => 'Bazar (1x) + Reguler',
                'gross_revenue' => 2750000.00,
                'net_profit' => 875000.00,
                'operational_details' => 'Bazar 2jt (Habis) | Jus 375rb (75 cup) + Makanan 375rb',
                'is_total_row' => false,
            ],
            [
                'year' => 2026,
                'month' => 'Juli',
                'week_number' => 4,
                'week_label' => 'Minggu 4',
                'sales_category' => 'Bazar (1x) + Reguler',
                'gross_revenue' => 2750000.00,
                'net_profit' => 875000.00,
                'operational_details' => 'Bazar 2jt (Habis) | Jus 375rb (75 cup) + Makanan 375rb',
                'is_total_row' => false,
            ],
            [
                'year' => 2026,
                'month' => 'Juli',
                'week_number' => 5,
                'week_label' => 'TOTAL JULI',
                'sales_category' => '4x Bazar + 4x Reguler',
                'gross_revenue' => 11000000.00,
                'net_profit' => 3500000.00,
                'operational_details' => 'Total 300 Cup Jus Terjual (@ Rp5.000)',
                'is_total_row' => true,
            ],
        ];

        // 2. Data Rekap Bulan Agustus 2026
        $agustusData = [
            [
                'year' => 2026,
                'month' => 'Agustus',
                'week_number' => 1,
                'week_label' => 'Minggu 1',
                'sales_category' => 'Bazar Event 1',
                'gross_revenue' => 3500000.00,
                'net_profit' => 1433333.00,
                'operational_details' => 'Habis Terjual (0% Sisa)',
                'is_total_row' => false,
            ],
            [
                'year' => 2026,
                'month' => 'Agustus',
                'week_number' => 2,
                'week_label' => 'Minggu 2',
                'sales_category' => 'Bazar Event 2',
                'gross_revenue' => 3500000.00,
                'net_profit' => 1433333.00,
                'operational_details' => 'Habis Terjual (0% Sisa)',
                'is_total_row' => false,
            ],
            [
                'year' => 2026,
                'month' => 'Agustus',
                'week_number' => 3,
                'week_label' => 'Minggu 3',
                'sales_category' => 'Bazar Event 3',
                'gross_revenue' => 3500000.00,
                'net_profit' => 1433334.00,
                'operational_details' => 'Habis Terjual (0% Sisa)',
                'is_total_row' => false,
            ],
            [
                'year' => 2026,
                'month' => 'Agustus',
                'week_number' => 4,
                'week_label' => 'Minggu 4',
                'sales_category' => 'Jualan Biasa (Tanpa Bazar)',
                'gross_revenue' => 1500000.00,
                'net_profit' => 700000.00,
                'operational_details' => 'Penjualan Toko Reguler',
                'is_total_row' => false,
            ],
            [
                'year' => 2026,
                'month' => 'Agustus',
                'week_number' => 5,
                'week_label' => 'TOTAL AGUSTUS',
                'sales_category' => '3x Bazar + 1x Reguler',
                'gross_revenue' => 12000000.00,
                'net_profit' => 5000000.00,
                'operational_details' => 'Margin Keuntungan: 41,67%',
                'is_total_row' => true,
            ],
        ];

        foreach (array_merge($juliData, $agustusData) as $item) {
            WeeklySalesRecap::updateOrCreate(
                [
                    'year' => $item['year'],
                    'month' => $item['month'],
                    'week_label' => $item['week_label'],
                ],
                $item
            );
        }
    }
}
