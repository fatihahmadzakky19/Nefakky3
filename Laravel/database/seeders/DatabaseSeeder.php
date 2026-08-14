<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Voucher;
use App\Models\Review;
use App\Models\SalesReport;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Vouchers
        Voucher::create([
            'code' => 'NEFAKKY10',
            'title' => 'Diskon 10% Spesial Pembeli Baru',
            'description' => 'Potongan 10% untuk seluruh pesanan makanan artisanal.',
            'type' => 'percent',
            'discount_value' => 10,
            'min_spend' => 50000,
            'max_discount' => 20000,
            'quota' => 50,
            'is_active' => true,
        ]);

        Voucher::create([
            'code' => 'BAZARJUNI',
            'title' => 'Voucher Bazar Spesial Juni',
            'description' => 'Potongan Rp 15.000 untuk pembelian Jus 3-Varian.',
            'type' => 'fixed',
            'discount_value' => 15000,
            'min_spend' => 60000,
            'quota' => 100,
            'is_active' => true,
        ]);

        Voucher::create([
            'code' => 'HEMAT20',
            'title' => 'Hemat 20% Paket Keluarga',
            'description' => 'Diskon 20% khusus kategori Makanan Berat.',
            'type' => 'percent',
            'discount_value' => 20,
            'min_spend' => 100000,
            'max_discount' => 50000,
            'quota' => 30,
            'is_active' => true,
        ]);

        // Seed Sales Reports
        SalesReport::create([
            'month_year' => 'Juni 2026',
            'gross_revenue' => 12500000,
            'net_profit' => 5000000,
            'total_orders' => 240,
            'event_tag' => 'Event Bazar >10 Juta',
        ]);

        SalesReport::create([
            'month_year' => 'Juli 2026',
            'gross_revenue' => 15800000,
            'net_profit' => 6320000,
            'total_orders' => 310,
            'event_tag' => 'Promo Midtrans Snap',
        ]);

        SalesReport::create([
            'month_year' => 'Agustus 2026',
            'gross_revenue' => 18200000,
            'net_profit' => 7280000,
            'total_orders' => 365,
            'event_tag' => 'Kampanye Jus 3-Varian',
        ]);

        // Seed Sample Reviews
        Review::create([
            'product_id' => 'm6',
            'customer_name' => 'Fatih Ahmad',
            'customer_email' => 'fatih@example.com',
            'rating' => 5,
            'comment' => 'Jus sirsak dan mangganya sangat segar! Pengiriman via GPS pinpoint tepat waktu.',
        ]);

        Review::create([
            'product_id' => 'm1',
            'customer_name' => 'Siti Rahma',
            'customer_email' => 'siti@example.com',
            'rating' => 5,
            'comment' => 'Makanan berat artisanalnya bumbu meresap sempurna. Sangat direkomendasikan!',
        ]);
    }
}
