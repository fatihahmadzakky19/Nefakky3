<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Class OrderSeeder
 * 
 * Seeder ini bertanggung jawab untuk membuat data transaksi pesanan pelanggan awal
 * dengan berbagai kondisi status alur pengiriman (COOKING, DELIVERING, COMPLETED)
 * beserta rincian item hidangan otentik yang dipesan.
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
                'payment_badge' => 'PAID',
                'delivery_type' => 'STANDARD',
                'status' => 'COOKING',
                'subtotal' => 40000,
                'shipping_cost' => 8000,
                'discount' => 4000,
                'total' => 44000,
                'customer_confirmed' => false,
                'voucher_code' => 'NEFAKKY10',
                'applied_promo' => 'Voucher Pelanggan Baru 10%',
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $order1->order_id, 'product_id' => 'm1'],
            [
                'name' => 'Ayam Bakar',
                'price' => 35000,
                'quantity' => 1,
                'image' => '/images/ayam_bakar.jpg',
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $order1->order_id, 'product_id' => 'm6'],
            [
                'name' => 'Jus Segar (Jambu, Sirsak, Mangga)',
                'price' => 5000,
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
                'item_count' => 2,
                'payment_method' => 'Transfer BCA',
                'payment_badge' => 'PAID',
                'delivery_type' => 'EXPRESS',
                'status' => 'DELIVERING',
                'subtotal' => 30000,
                'shipping_cost' => 12000,
                'discount' => 4500,
                'total' => 37500,
                'customer_confirmed' => false,
                'voucher_code' => 'BAZARJUNI',
                'applied_promo' => 'Voucher Bazar Spesial Kuliner',
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $order2->order_id, 'product_id' => 'm2'],
            [
                'name' => 'Nasi Bakar',
                'price' => 10000,
                'quantity' => 1,
                'image' => '/images/nasi_bakar.jpg',
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $order2->order_id, 'product_id' => 'm3'],
            [
                'name' => 'Krecek',
                'price' => 20000,
                'quantity' => 1,
                'image' => '/images/krecek.jpg',
            ]
        );

        // 3. Pesanan Contoh 3: Status Telah Selesai & Dikonfirmasi (COMPLETED)
        $order3 = Order::updateOrCreate(
            ['order_id' => 'ORD-10982'],
            [
                'user_id' => $userId,
                'customer_name' => 'Siti Rahmawati',
                'customer_email' => 'siti@example.com',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
                'address' => 'Apartemen Taman Rasuna Tower 8, Kuningan, Jakarta Selatan',
                'phone' => '081987654321',
                'item_count' => 2,
                'payment_method' => 'Midtrans GoPay',
                'payment_badge' => 'PAID',
                'delivery_type' => 'STANDARD',
                'status' => 'COMPLETED',
                'subtotal' => 45000,
                'shipping_cost' => 15000,
                'discount' => 0,
                'total' => 60000,
                'customer_confirmed' => true,
                'confirmed_at' => now()->subHours(5),
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $order3->order_id, 'product_id' => 'm1'],
            [
                'name' => 'Ayam Bakar',
                'price' => 35000,
                'quantity' => 1,
                'image' => '/images/ayam_bakar.jpg',
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $order3->order_id, 'product_id' => 'm4'],
            [
                'name' => 'Gudeg',
                'price' => 10000,
                'quantity' => 1,
                'image' => '/images/gudeg.jpg',
            ]
        );
    }
}
