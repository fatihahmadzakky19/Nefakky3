<?php

namespace Database\Seeders;

use App\Models\Voucher;
use Illuminate\Database\Seeder;

/**
 * Class VoucherSeeder
 * 
 * Seeder ini bertanggung jawab untuk mengisi data awal kupon promo diskon belanja
 * yang tersinkronisasi dengan kode kupon di aplikasi web Nefakky.
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
        $vouchers = [
            [
                'voucher_id' => 'promo-1',
                'code' => 'WEEKENDSERU',
                'name' => 'Weekend Promo Diskon 15%',
                'type' => 'percent',
                'discount_percent' => 15.00,
                'discount_value' => 0.00,
                'min_spend' => 50000,
                'max_discount' => 25000,
                'used_count' => 142,
                'total_limit' => 500,
                'redemptions' => '142/500',
                'expiry' => '01 Mei - 31 Des',
                'valid_days' => 'Weekend (Sabtu & Minggu)',
                'event' => 'Promo Akhir Pekan',
                'status' => 'Active',
                'is_active' => true,
                'auto_reset_weekly' => true,
                'last_reset_week' => Voucher::getCurrentISOWeek(),
                'image_url' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'voucher_id' => 'promo-2',
                'code' => 'FLASHSALE',
                'name' => 'Flash Sale: Gudeg Komplit Jogja',
                'type' => 'percent',
                'discount_percent' => 20.00,
                'discount_value' => 0.00,
                'min_spend' => 30000,
                'max_discount' => 20000,
                'used_count' => 98,
                'total_limit' => 1000,
                'redemptions' => '98/1000',
                'expiry' => 'Akhir Pekan',
                'valid_days' => 'Weekend Only',
                'event' => 'Flash Sale',
                'status' => 'Active',
                'is_active' => true,
                'auto_reset_weekly' => true,
                'last_reset_week' => Voucher::getCurrentISOWeek(),
                'image_url' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'voucher_id' => 'promo-3',
                'code' => 'HEMAT50',
                'name' => 'Hemat Nasi Bakar Cumi (BOGO)',
                'type' => 'percent',
                'discount_percent' => 50.00,
                'discount_value' => 0.00,
                'min_spend' => 45000,
                'max_discount' => 25000,
                'used_count' => 45,
                'total_limit' => 100,
                'redemptions' => '45/100',
                'expiry' => '01 Juni - 31 Des',
                'event' => 'Tanggal Kembar',
                'status' => 'Active',
                'is_active' => true,
                'auto_reset_weekly' => false,
                'image_url' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'voucher_id' => 'v4',
                'code' => 'NEFAKKY10',
                'name' => 'Voucher Pelanggan Baru 10%',
                'type' => 'percent',
                'discount_percent' => 10.00,
                'discount_value' => 0.00,
                'min_spend' => 30000,
                'max_discount' => 15000,
                'used_count' => 1,
                'total_limit' => 500,
                'redemptions' => '1x Per Pengguna Baru',
                'expiry' => 'Selamanya',
                'event' => 'Pelanggan Baru',
                'status' => 'Active',
                'is_active' => true,
                'auto_reset_weekly' => false,
                'image_url' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'voucher_id' => 'v5',
                'code' => 'BAZARJUNI',
                'name' => 'Voucher Bazar Spesial Kuliner',
                'type' => 'percent',
                'discount_percent' => 15.00,
                'discount_value' => 0.00,
                'min_spend' => 50000,
                'max_discount' => 30000,
                'used_count' => 88,
                'total_limit' => 500,
                'redemptions' => '88/500',
                'expiry' => '31 Des 2026',
                'event' => 'Bazar Kuliner',
                'status' => 'Active',
                'is_active' => true,
                'auto_reset_weekly' => false,
                'image_url' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
            ],
        ];

        foreach ($vouchers as $v) {
            Voucher::updateOrCreate(
                ['voucher_id' => $v['voucher_id']],
                $v
            );
        }
    }
}
