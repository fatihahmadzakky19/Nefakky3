<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Class DatabaseSeeder
 * 
 * Seeder utama aplikasi yang bertindak sebagai orkestrator pemanggilan seluruh sub-seeder
 * secara terurut berdasarkan ketergantungan relasi database (User -> Category -> Product -> ...).
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Menjalankan seluruh seeder aplikasi dalam urutan yang tepat.
     *
     * @return void
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,         // 1. Akun Pengguna & Multi-Alamat
            CategorySeeder::class,     // 2. Master Kategori Menu
            ProductSeeder::class,      // 3. Master Produk & Nutrisi
            VoucherSeeder::class,      // 4. Kupon Promo & Aturan Diskon
            OrderSeeder::class,        // 5. Riwayat Transaksi Pesanan & Items
            ReviewSeeder::class,       // 6. Ulasan, Rating & Balasan Penjual
            SalesReportSeeder::class,  // 7. Laporan Finansial & Omset Bulanan
            WeeklySalesRecapSeeder::class, // 7b. Rekapitulasi Penjualan Mingguan & Bazar
            PromotionSeeder::class,    // 8. Banner Promosi & Event Bazar
            StoreSettingSeeder::class, // 9. Konfigurasi Toko & Dapur Utama
        ]);
    }
}