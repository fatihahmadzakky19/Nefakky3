<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductItem;
use App\Models\Voucher;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\SalesReport;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Product Items
        ProductItem::create([
            'item_id' => 'PROD-001',
            'sku' => 'NK-AYM-01',
            'name' => 'Ayam Bakar Madu Spesial Dapur Nefakky',
            'category' => 'Makanan Utama',
            'price' => 38000,
            'discount' => 10.00,
            'stock' => 50,
            'visibility' => true,
            'status' => 'Active',
            'rating' => 4.9,
            'reviews_count' => 120,
            'sold_count' => '150 Terjual',
            'image' => '/images/ayam_bakar.jpg',
            'description' => 'Ayam bakar pilihan diolah dengan bumbu rempah pilihan khas Jawa dan olesan madu murni.',
            'badge' => 'BEST SELLER',
            'ingredients' => 'Ayam Kampung, Madu Murni, Rempah Nusantara',
            'calories' => '420 kcal',
            'fat' => '14g',
            'sugar' => '5g',
        ]);

        ProductItem::create([
            'item_id' => 'PROD-002',
            'sku' => 'NK-JUS-01',
            'name' => 'Jus Segar 3-Varian (Mangga, Sirsak, Jambu)',
            'category' => 'Minuman',
            'price' => 18000,
            'discount' => 0.00,
            'stock' => 100,
            'visibility' => true,
            'status' => 'Active',
            'rating' => 5.0,
            'reviews_count' => 85,
            'sold_count' => '210 Terjual',
            'image' => '/images/jus_mangga.jpg',
            'description' => 'Jus buah segar asli tanpa pemanis buatan. Pilih 3 varian rasa favorit dalam 1 halaman modal.',
            'badge' => 'TERPOPULER',
            'ingredients' => 'Buah Asli, Gula Murni, Es Batu',
            'calories' => '180 kcal',
            'fat' => '0g',
            'sugar' => '12g',
        ]);

        // 2. Seed Vouchers
        Voucher::create([
            'voucher_id' => 'VOUCH-01',
            'code' => 'NEFAKKY10',
            'name' => 'Diskon 10% Spesial Pembeli Baru',
            'discount_percent' => 10.00,
            'min_spend' => 50000,
            'expiry' => '31 Des 2026',
            'status' => 'Active',
            'is_active' => true,
        ]);

        Voucher::create([
            'voucher_id' => 'VOUCH-02',
            'code' => 'BAZARJUNI',
            'name' => 'Voucher Bazar Spesial Juni',
            'discount_percent' => 15.00,
            'min_spend' => 60000,
            'expiry' => '31 Des 2026',
            'status' => 'Active',
            'is_active' => true,
        ]);

        // 3. Seed Orders
        $order = Order::create([
            'order_id' => 'ORD-88219',
            'customer_name' => 'Fatih Ahmad Zakky',
            'customer_email' => 'fatih@example.com',
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatih',
            'address' => 'Puri Bojong Lestari AF No 41, Bojong Gede, Bogor',
            'phone' => '081234567890',
            'item_count' => 2,
            'payment_method' => 'Midtrans QRIS / GoPay',
            'payment_badge' => 'PAID',
            'delivery_type' => 'Biaya Pengiriman Standard',
            'status' => 'COOKING',
            'subtotal' => 56000,
            'shipping_cost' => 10000,
            'discount' => 5600,
            'total' => 60400,
            'customer_confirmed' => false,
        ]);

        OrderItem::create([
            'order_id' => $order->order_id,
            'product_id' => 'PROD-001',
            'name' => 'Ayam Bakar Madu Spesial',
            'price' => 38000,
            'quantity' => 1,
            'image' => '/images/ayam_bakar.jpg',
        ]);

        OrderItem::create([
            'order_id' => $order->order_id,
            'product_id' => 'PROD-002',
            'name' => 'Jus Segar 3-Varian',
            'price' => 18000,
            'quantity' => 1,
            'image' => '/images/jus_mangga.jpg',
        ]);

        // 4. Seed Reviews
        Review::create([
            'review_id' => 'REV-001',
            'author_name' => 'Siti Rahmawati',
            'author_email' => 'siti@example.com',
            'author_badge' => 'PLATINUM',
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
            'rating' => 5,
            'date' => 'Kemarin',
            'product_name' => 'Ayam Bakar Madu Spesial',
            'product_image' => '/images/ayam_bakar.jpg',
            'comment' => 'Daging ayamnya empuk dan bumbu madunya manis gurih pas sekali! Pengiriman cepat.',
            'likes_count' => 12,
            'status' => 'PUBLISHED',
        ]);

        // 5. Seed Sales Reports: Juni-Agustus memuat data omset, September-Desember 0 (Placeholder Mendatang)
        $months2026 = [
            ['month_year' => 'Juni 2026', 'gross' => 10500000, 'net' => 4750000, 'orders' => 210, 'is_bazar' => true, 'event' => '🎪 Event Bazar Pembukaan Juni (>10Jt Omset)'],
            ['month_year' => 'Juli 2026', 'gross' => 11200000, 'net' => 5100000, 'orders' => 235, 'is_bazar' => true, 'event' => '🎪 Event Bazar Kuliner Juli (>10Jt Omset)'],
            ['month_year' => 'Agustus 2026 (Live)', 'gross' => 13800000, 'net' => 6900000, 'orders' => 260, 'is_bazar' => true, 'event' => '🎪 Event Bazar Merdeka + Live Web Realtime'],
            ['month_year' => 'September 2026', 'gross' => 0, 'net' => 0, 'orders' => 0, 'is_bazar' => false, 'event' => 'Belum Ada Data (Periode Mendatang)'],
            ['month_year' => 'Oktober 2026', 'gross' => 0, 'net' => 0, 'orders' => 0, 'is_bazar' => false, 'event' => 'Belum Ada Data (Periode Mendatang)'],
            ['month_year' => 'November 2026', 'gross' => 0, 'net' => 0, 'orders' => 0, 'is_bazar' => false, 'event' => 'Belum Ada Data (Periode Mendatang)'],
            ['month_year' => 'Desember 2026', 'gross' => 0, 'net' => 0, 'orders' => 0, 'is_bazar' => false, 'event' => 'Belum Ada Data (Periode Mendatang)'],
        ];

        foreach ($months2026 as $m) {
            SalesReport::create([
                'year' => '2026',
                'month_year' => $m['month_year'],
                'gross_revenue' => $m['gross'],
                'net_profit' => $m['net'],
                'total_orders' => $m['orders'],
                'is_bazar' => $m['is_bazar'],
                'event_tag' => $m['event'],
            ]);
        }
    }
}