<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Class OrderSeeder
 * 
 * Seeder ini bertanggung jawab untuk membuat data awal transaksi pesanan pelanggan
 * dengan berbagai kondisi status alur pengiriman (COOKING, DELIVERING, COMPLETED)
 * beserta rincian item produk yang dipesan.
 */
class OrderSeeder extends Seeder
{
    /**
     * Menjalankan proses seeding transaksi pesanan dan detail item.
     *
     * @return void
     */
    public function run(): void
    {
        // Mencari ID akun administrator untuk relasi pesanan contoh
        $user = User::where('email', 'fatihahmadzakky19@gmail.com')->first();
        $userId = $user ? $user->id : null;

        // 1. Pesanan Contoh 1: Status Sedang Dimasak (COOKING)
        $order1 = Order::updateOrCreate(
            ['order_id' => 'ORD-88219'],
            [
                'user_id' => $userId,
                'customer_name' => 'Fatih Ahmad Zakky',
                'customer_email' => 'fatihahmadzakky19@gmail.com',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatih',
                'address' => 'Puri Bojong Lestari AF No 41, Bojong Gede, Bogor',
                'phone' => '081234567890',
                'item_count' => 2,
                'payment_method' => 'Midtrans QRIS / GoPay',
                'payment_badge' => 'PAID', // Status pembayaran lunas
                'delivery_type' => 'STANDARD',
                'status' => 'COOKING', // Tahap alur dapur
                'subtotal' => 56000,
                'shipping_cost' => 10000,
                'discount' => 5600,
                'total' => 60400,
                'customer_confirmed' => false,
                'voucher_code' => 'NEFAKKY10',
                'applied_promo' => 'Diskon 10% Spesial Pembeli Baru',
            ]
        );

        // Rincian Item 1 pada Pesanan 1
        OrderItem::updateOrCreate(
            ['order_id' => $order1->order_id, 'product_id' => 'PROD-001'],
            [
                'name' => 'Ayam Bakar Madu Spesial Dapur Nefakky',
                'price' => 38000,
                'quantity' => 1,
                'image' => '/images/ayam_bakar.jpg',
            ]
        );

        // Rincian Item 2 pada Pesanan 1
        OrderItem::updateOrCreate(
            ['order_id' => $order1->order_id, 'product_id' => 'PROD-002'],
            [
                'name' => 'Jus Segar 3-Varian',
                'price' => 18000,
                'quantity' => 1,
                'image' => '/images/jus_mangga.jpg',
            ]
        );

        // 2. Pesanan Contoh 2: Status Sedang Dalam Perjalanan Kurir (DELIVERING)
        $order2 = Order::updateOrCreate(
            ['order_id' => 'ORD-54120'],
            [
                'user_id' => $userId,
                'customer_name' => 'Nizar Azzuhra',
                'customer_email' => 'nizarazzuhra@gmail.com',
                'avatar' => 'https://ui-avatars.com/api/?name=Nizar+Azzuhra&background=5C3D28&color=ffffff',
                'address' => 'Jl. Margonda Raya No. 100, Beji, Kota Depok',
                'phone' => '085712345678',
                'item_count' => 1,
                'payment_method' => 'Transfer BCA',
                'payment_badge' => 'PAID',
                'delivery_type' => 'EXPRESS',
                'status' => 'DELIVERING', // Tahap kurir mengantar
                'subtotal' => 52000,
                'shipping_cost' => 12000,
                'discount' => 7800,
                'total' => 56200,
                'customer_confirmed' => false,
                'voucher_code' => 'BAZARJUNI',
                'applied_promo' => 'Voucher Bazar Spesial Kuliner',
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $order2->order_id, 'product_id' => 'PROD-005'],
            [
                'name' => 'Paket Hemat Kenyang',
                'price' => 52000,
                'quantity' => 1,
                'image' => '/images/paket_hemat.jpg',
            ]
        );

        // 3. Pesanan Contoh 3: Status Telah Selesai & Dikonfirmasi (COMPLETED)
        $order3 = Order::updateOrCreate(
            ['order_id' => 'ORD-10982'],
            [
                'user_id' => $userId,
                'customer_name' => 'Siti Rahmawati',
                'customer_email' => 'siti@example.com',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
                'address' => 'Apartemen Taman Rasuna Tower 8, Kuningan, Jakarta Selatan',
                'phone' => '081987654321',
                'item_count' => 2,
                'payment_method' => 'Midtrans GoPay',
                'payment_badge' => 'PAID',
                'delivery_type' => 'STANDARD',
                'status' => 'COMPLETED', // Status selesai
                'subtotal' => 67000,
                'shipping_cost' => 15000,
                'discount' => 0,
                'total' => 82000,
                'customer_confirmed' => true, // Pelanggan telah menekan tombol konfirmasi barang diterima
                'confirmed_at' => now()->subHours(5), // Timestamp saat pesanan diselesaikan
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $order3->order_id, 'product_id' => 'PROD-003'],
            [
                'name' => 'Beef Teriyaki Rice Bowl Gurih',
                'price' => 42000,
                'quantity' => 1,
                'image' => '/images/beef_teriyaki.jpg',
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $order3->order_id, 'product_id' => 'PROD-004'],
            [
                'name' => 'Dimsum Ayam Udang Kukus (Isi 4 Pcs)',
                'price' => 25000,
                'quantity' => 1,
                'image' => '/images/dimsum_ayam.jpg',
            ]
        );
    }
}
