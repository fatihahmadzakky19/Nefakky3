<?php

namespace Database\Seeders;

use App\Models\Voucher;
use Illuminate\Database\Seeder;

/**
 * Class VoucherSeeder
 * 
 * Seeder ini bertanggung jawab untuk mengisi data awal kupon promo diskon belanja,
 * aturan batas minimal belanja (min spend), kuota pemakaian, dan promo auto-reset mingguan.
 */
class VoucherSeeder extends Seeder
{
    /**
     * Menjalankan proses seeding data voucher promo ke database.
     *
     * @return void
     */
    public function run(): void
    {
        // Daftar data voucher promo dengan variasi jenis persen, potongan tetap, dan aturan hari
        $vouchers = [
            [
                'voucher_id' => 'VOUCH-01', // Primary key custom string
                'code' => 'NEFAKKY10', // Kode kupon promo yang diinputkan pembeli
                'name' => 'Diskon 10% Spesial Pembeli Baru', // Judul promo
                'type' => 'percent', // Jenis potongan: persen ('percent')
                'discount_percent' => 10.00, // Besaran potongan 10%
                'discount_value' => 0.00,
                'min_spend' => 50000, // Syarat minimal belanja Rp 50.000
                'max_discount' => 20000, // Batas potongan maksimal Rp 20.000
                'used_count' => 24, // Jumlah yang telah diklaim / digunakan
                'total_limit' => 500, // Kuota maksimal pemakaian
                'redemptions' => '24/500', // Format tampilan rasio penggunaan
                'expiry' => '31 Des 2026', // Teks masa berlaku promo
                'event' => 'Pelanggan Baru', // Kategori event promo
                'status' => 'Active', // Status keaktifan (Active / Expired)
                'is_active' => true, // Flag sakelar aktif
                'auto_reset_weekly' => false, // Tidak di-reset tiap minggu
            ],
            [
                'voucher_id' => 'VOUCH-02',
                'code' => 'BAZARJUNI',
                'name' => 'Voucher Bazar Spesial Kuliner',
                'type' => 'percent',
                'discount_percent' => 15.00,
                'discount_value' => 0.00,
                'min_spend' => 60000,
                'max_discount' => 30000,
                'used_count' => 88,
                'total_limit' => 500,
                'redemptions' => '88/500',
                'expiry' => '31 Des 2026',
                'event' => 'Bazar Kuliner',
                'status' => 'Active',
                'is_active' => true,
                'auto_reset_weekly' => false,
            ],
            [
                'voucher_id' => 'VOUCH-03',
                'code' => 'WEEKENDHEMAT',
                'name' => 'Promo Akhir Pekan Ceria (Sabtu & Minggu)',
                'type' => 'percent',
                'discount_percent' => 20.00,
                'discount_value' => 0.00,
                'min_spend' => 75000,
                'max_discount' => 35000,
                'used_count' => 15,
                'total_limit' => 200,
                'redemptions' => '15/200',
                'expiry' => 'Setiap Akhir Pekan',
                'valid_days' => 'Weekend (Sabtu & Minggu)', // Hanya aktif pada hari Sabtu dan Minggu
                'event' => 'Akhir Pekan',
                'status' => 'Active',
                'is_active' => true,
                'auto_reset_weekly' => true, // Kuota otomatis di-reset menjadi 0 saat berganti minggu ISO
                'last_reset_week' => Voucher::getCurrentISOWeek(),
            ],
            [
                'voucher_id' => 'VOUCH-04',
                'code' => 'POTONGAN10RB',
                'name' => 'Potongan Langsung Rp 10.000',
                'type' => 'fixed', // Jenis potongan: nominal tetap ('fixed')
                'discount_percent' => 0.00,
                'discount_value' => 10000, // Potongan flat Rp 10.000
                'min_spend' => 50000,
                'max_discount' => 10000,
                'used_count' => 45,
                'total_limit' => 300,
                'redemptions' => '45/300',
                'expiry' => '31 Des 2026',
                'event' => 'Diskon Langsung',
                'status' => 'Active',
                'is_active' => true,
                'auto_reset_weekly' => false,
            ],
        ];

        // Menyimpan data voucher promo ke tabel database
        foreach ($vouchers as $v) {
            Voucher::updateOrCreate(
                ['voucher_id' => $v['voucher_id']],
                $v
            );
        }
    }
}
