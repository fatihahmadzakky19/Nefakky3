<?php

// Namespace penempat Seeder dalam struktur folder Laravel Database Seeders
namespace Database\Seeders;

// Mengimpor kelas dasar Seeder dari framework Laravel
use Illuminate\Database\Seeder;
// Mengimpor Model ProductItem untuk seeding master produk makanan & minuman
use App\Models\ProductItem;
// Mengimpor Model Voucher untuk seeding kode voucher diskon promo
use App\Models\Voucher;
// Mengimpor Model Order untuk seeding header transaksi pesanan
use App\Models\Order;
// Mengimpor Model OrderItem untuk seeding rincian item pesanan
use App\Models\OrderItem;
// Mengimpor Model Review untuk seeding ulasan & rating hidangan kuliner
use App\Models\Review;
// Mengimpor Model SalesReport untuk seeding data statistik laporan penjualan
use App\Models\SalesReport;

// Class DatabaseSeeder untuk mengisi data awal (seeding) database sistem Nefakky Marketplace
class DatabaseSeeder extends Seeder
{
    /**
     * Menjalankan seluruh proses seeding data awal ke database MySQL/PostgreSQL
     */
    public function run(): void
    {
        // ==========================================
        // 1. SEEDING MASTER DATA PRODUK KULINER
        // ==========================================

        // Data Produk 1: Ayam Bakar Madu Spesial (Best Seller)
        ProductItem::create([
            'item_id' => 'PROD-001', // ID unik produk
            'sku' => 'NK-AYM-01', // SKU produk unik
            'name' => 'Ayam Bakar Madu Spesial Dapur Nefakky', // Nama menu makanan
            'category' => 'Makanan Utama', // Kategori menu
            'price' => 38000, // Harga jual per porsi (Rp)
            'discount' => 10.00, // Persen diskon promosi (10%)
            'stock' => 50, // Jumlah sisa stok siap saji
            'visibility' => true, // Tampilkan di katalog publik pengunjung
            'status' => 'Active', // Status stok aktif
            'rating' => 4.9, // Rata-rata rating pembeli
            'reviews_count' => 120, // Total ulasan
            'sold_count' => '150 Terjual', // Jumlah akumulasi penjualan
            'image' => '/images/ayam_bakar.jpg', // Path gambar hidangan
            'description' => 'Ayam bakar pilihan diolah dengan bumbu rempah pilihan khas Jawa dan olesan madu murni.', // Deskripsi rasa
            'badge' => 'BEST SELLER', // Lencana penanda produk unggulan
            'ingredients' => 'Ayam Kampung, Madu Murni, Rempah Nusantara', // Bahan baku utama
            'calories' => '420 kcal', // Info kalori
            'fat' => '14g', // Info lemak
            'sugar' => '5g', // Info gula
        ]);

        // Data Produk 2: Jus Segar 3-Varian
        ProductItem::create([
            'item_id' => 'PROD-002', // ID unik produk minuman
            'sku' => 'NK-JUS-01', // SKU produk unik
            'name' => 'Jus Segar 3-Varian (Mangga, Sirsak, Jambu)', // Nama menu minuman
            'category' => 'Minuman', // Kategori menu minuman
            'price' => 18000, // Harga jual per botol (Rp)
            'discount' => 0.00, // Tanpa potongan diskon
            'stock' => 100, // Stok minuman tersedia
            'visibility' => true, // Tampilkan di katalog
            'status' => 'Active', // Status stok aktif
            'rating' => 5.0, // Rating bintang 5
            'reviews_count' => 85, // Total ulasan
            'sold_count' => '210 Terjual', // Jumlah terjual
            'image' => '/images/jus_mangga.jpg', // Path gambar minuman
            'description' => 'Jus buah segar asli tanpa pemanis buatan. Pilih 3 varian rasa favorit dalam 1 halaman modal.', // Deskripsi minuman
            'badge' => 'TERPOPULER', // Lencana populer
            'ingredients' => 'Buah Asli, Gula Murni, Es Batu', // Komposisi
            'calories' => '180 kcal', // Info kalori
            'fat' => '0g', // Bebas lemak
            'sugar' => '12g', // Info gula alami
        ]);

        // ==========================================
        // 2. SEEDING VOUCHER PROMO DISKON
        // ==========================================

        // Voucher 1: Diskon Pembeli Baru (10%)
        Voucher::create([
            'voucher_id' => 'VOUCH-01', // ID unik voucher
            'code' => 'NEFAKKY10', // Kode kupon promo
            'name' => 'Diskon 10% Spesial Pembeli Baru', // Nama voucher
            'discount_percent' => 10.00, // Potongan 10%
            'min_spend' => 50000, // Minimal belanja Rp 50.000
            'expiry' => '31 Des 2026', // Masa berlaku voucher
            'status' => 'Active', // Status keaktifan voucher
            'is_active' => true, // Flag aktif boolean
        ]);

        // Voucher 2: Voucher Bazar Spesial Juni (15%)
        Voucher::create([
            'voucher_id' => 'VOUCH-02', // ID unik voucher
            'code' => 'BAZARJUNI', // Kode kupon promo
            'name' => 'Voucher Bazar Spesial Juni', // Nama voucher
            'discount_percent' => 15.00, // Potongan 15%
            'min_spend' => 60000, // Minimal belanja Rp 60.000
            'expiry' => '31 Des 2026', // Masa berlaku voucher
            'status' => 'Active', // Status keaktifan voucher
            'is_active' => true, // Flag aktif boolean
        ]);

        // ==========================================
        // 3. SEEDING TRANSAKSI PESANAN DUMMY (ORDER)
        // ==========================================

        // Buat record header pesanan utama
        $order = Order::create([
            'order_id' => 'ORD-88219', // Nomor order ID unik
            'customer_name' => 'Fatih Ahmad Zakky', // Nama pembeli
            'customer_email' => 'fatih@example.com', // Email pembeli
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatih', // URL Avatar Dicebear
            'address' => 'Puri Bojong Lestari AF No 41, Bojong Gede, Bogor', // Alamat pengiriman
            'phone' => '081234567890', // Nomor telepon aktif
            'item_count' => 2, // Total 2 jenis makanan dibeli
            'payment_method' => 'Midtrans QRIS / GoPay', // Metode pembayaran Snap
            'payment_badge' => 'PAID', // Status pembayaran Lunas
            'delivery_type' => 'Biaya Pengiriman Standard', // Tipe ekspedisi
            'status' => 'COOKING', // Tahap live tracker: Sedang Dimasak
            'subtotal' => 56000, // Subtotal harga barang
            'shipping_cost' => 10000, // Tarif ongkir
            'discount' => 5600, // Potongan voucher
            'total' => 60400, // Total bayar akhir
            'customer_confirmed' => false, // Belum konfirmasi selesai
        ]);

        // Detail Rincian Item 1 pada Order ORD-88219
        OrderItem::create([
            'order_id' => $order->order_id, // Foreign key ke order utama
            'product_id' => 'PROD-001', // ID produk makanan
            'name' => 'Ayam Bakar Madu Spesial', // Nama item
            'price' => 38000, // Harga satuan
            'quantity' => 1, // Kuantitas 1 porsi
            'image' => '/images/ayam_bakar.jpg', // Foto hidangan
        ]);

        // Detail Rincian Item 2 pada Order ORD-88219
        OrderItem::create([
            'order_id' => $order->order_id, // Foreign key ke order utama
            'product_id' => 'PROD-002', // ID produk minuman
            'name' => 'Jus Segar 3-Varian', // Nama item
            'price' => 18000, // Harga satuan
            'quantity' => 1, // Kuantitas 1 botol
            'image' => '/images/jus_mangga.jpg', // Foto minuman
        ]);

        // ==========================================
        // 4. SEEDING ULASAN & TESTIMONI PELANGGAN
        // ==========================================

        Review::create([
            'review_id' => 'REV-001', // ID unik ulasan
            'author_name' => 'Siti Rahmawati', // Nama reviewer
            'author_email' => 'siti@example.com', // Email reviewer
            'author_badge' => 'PLATINUM', // Lencana loyalitas
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti', // Avatar
            'rating' => 5, // Rating bintang 5
            'date' => 'Kemarin', // Teks tanggal
            'product_name' => 'Ayam Bakar Madu Spesial', // Produk yang diulas
            'product_image' => '/images/ayam_bakar.jpg', // Foto produk
            'comment' => 'Daging ayamnya empuk dan bumbu madunya manis gurih pas sekali! Pengiriman cepat.', // Ulasan rasa
            'likes_count' => 12, // Jumlah like
            'status' => 'PUBLISHED', // Status terbit
        ]);

        // ==========================================
        // 5. SEEDING DATA LAPORAN KEUANGAN PENJUALAN
        // ==========================================

        SalesReport::create([
            'month_year' => 'Juni 2026', // Periode bulan & tahun
            'gross_revenue' => 12500000, // Omzet kotor Rp 12.500.000
            'net_profit' => 5000000, // Laba bersih Rp 5.000.000
            'total_orders' => 240, // Total 240 pesanan sukses
            'event_tag' => 'Event Bazar >10 Juta', // Label event promosi
        ]);
    }
}
