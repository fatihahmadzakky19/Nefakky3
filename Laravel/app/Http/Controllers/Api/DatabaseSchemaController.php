<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Controller DatabaseSchemaController
 * Menyediakan inspeksi skema tabel database, daftar kolom, tipe data eksplisit (ENUM, DATETIME, DECIMAL, dll),
 * serta data baris aktif untuk keperluan dokumentasi dan pengujian sistem.
 */
class DatabaseSchemaController extends Controller
{
    use ApiResponseTrait;

    /**
     * Daftar tabel utama dalam arsitektur aplikasi Nefakky Marketplace
     */
    protected array $targetTables = [
        'users' => [
            'name' => 'users',
            'label' => 'Tabel Pengguna (Users)',
            'description' => 'Akun pengguna, hak akses level admin/customer/staff, tanggal lahir, dan status aktif.',
            'model' => \App\Models\User::class,
        ],
        'user_addresses' => [
            'name' => 'user_addresses',
            'label' => 'Buku Alamat (User Addresses)',
            'description' => 'Multi-alamat pengiriman pelanggan, tipe label, dan koordinat GPS decimal(10, 7).',
            'model' => \App\Models\UserAddress::class,
        ],
        'categories' => [
            'name' => 'categories',
            'label' => 'Kategori Menu (Categories)',
            'description' => 'Master kategori kuliner, enum jenis kategori, dan urutan prioritas tampil.',
            'model' => \App\Models\Category::class,
        ],
        'product_items' => [
            'name' => 'product_items',
            'label' => 'Katalog Menu & Stok (Product Items)',
            'description' => 'Master menu, harga decimal(12,2), stok unsigned int, status enum, kalori, dan waktu masak.',
            'model' => \App\Models\ProductItem::class,
        ],
        'vouchers' => [
            'name' => 'vouchers',
            'label' => 'Voucher & Promo Engine (Vouchers)',
            'description' => 'Kupon promo diskon, batas min spend decimal, date & time aktif, dan auto-reset mingguan.',
            'model' => \App\Models\Voucher::class,
        ],
        'orders' => [
            'name' => 'orders',
            'label' => 'Transaksi Pesanan (Orders)',
            'description' => 'Header transaksi, alur 5-tahap enum, metode bayar enum, datetime tracking, dan total decimal.',
            'model' => \App\Models\Order::class,
        ],
        'order_items' => [
            'name' => 'order_items',
            'label' => 'Rincian Item Pesanan (Order Items)',
            'description' => 'Snapshot nama hidangan, harga satuan decimal(12,2), dan kuantitas porsi belanja.',
            'model' => \App\Models\OrderItem::class,
        ],
        'user_reviews' => [
            'name' => 'user_reviews',
            'label' => 'Ulasan & Rating (User Reviews)',
            'description' => 'Testimoni pelanggan, rating unsigned tinyint (1-5), review datetime, moderasi enum, dan balasan json.',
            'model' => \App\Models\Review::class,
        ],
        'sales_reports' => [
            'name' => 'sales_reports',
            'label' => 'Laporan Omset & Finansial (Sales Reports)',
            'description' => 'Rekap omset kotor decimal(15,2), laba bersih, metrik AOV, tanggal periode date, dan status enum.',
            'model' => \App\Models\SalesReport::class,
        ],
        'promotions' => [
            'name' => 'promotions',
            'label' => 'Banner Promosi (Promotions)',
            'description' => 'Banner promosi visual, status enum, tipe penempatan enum, dan datetime masa aktif.',
            'model' => \App\Models\Promotion::class,
        ],
        'chat_messages' => [
            'name' => 'chat_messages',
            'label' => 'Live Chat Support (Chat Messages)',
            'description' => 'Pesan percakapan pelanggan dan admin, sender enum, datetime terkirim & dibaca, media enum.',
            'model' => \App\Models\ChatMessage::class,
        ],
        'store_settings' => [
            'name' => 'store_settings',
            'label' => 'Pengaturan Toko (Store Settings)',
            'description' => 'Parameter konfigurasi operasional, group enum, type enum, koordinat Central Kitchen.',
            'model' => \App\Models\StoreSetting::class,
        ],
    ];

    /**
     * Mengambil ringkasan skema seluruh tabel database beserta tipe data kolom
     */
    public function getFullSchema(): JsonResponse
    {
        $schemaData = [];

        foreach ($this->targetTables as $key => $tableInfo) {
            $tableName = $tableInfo['name'];
            
            // Ambil definisi kolom dari Laravel Schema
            $rawColumns = Schema::getColumns($tableName);
            $totalRows = DB::table($tableName)->count();
            $sampleRows = DB::table($tableName)->limit(3)->get();

            $formattedColumns = array_map(function ($col) {
                return [
                    'name' => $col['name'],
                    'type_name' => $col['type_name'] ?? $col['type'],
                    'type_full' => $col['type'],
                    'nullable' => $col['nullable'] ?? false,
                    'default' => $col['default'] ?? null,
                ];
            }, $rawColumns);

            $schemaData[] = [
                'table_name' => $tableName,
                'label' => $tableInfo['label'],
                'description' => $tableInfo['description'],
                'total_columns' => count($formattedColumns),
                'total_rows' => $totalRows,
                'columns' => $formattedColumns,
                'samples' => $sampleRows,
            ];
        }

        return $this->successResponse([
            'database_driver' => config('database.default'),
            'total_tables' => count($schemaData),
            'tables' => $schemaData,
        ], 'Struktur skema dan ragam tipe data database berhasil diambil');
    }

    /**
     * Mengambil detail dan sampel baris satu tabel tertentu
     */
    public function getTableDetails(string $tableName): JsonResponse
    {
        if (!array_key_exists($tableName, $this->targetTables)) {
            return $this->notFoundResponse("Tabel '{$tableName}' tidak terdaftar dalam modul sistem");
        }

        $tableInfo = $this->targetTables[$tableName];
        $columns = Schema::getColumns($tableName);
        $rows = DB::table($tableName)->limit(10)->get();

        return $this->successResponse([
            'table_name' => $tableName,
            'label' => $tableInfo['label'],
            'description' => $tableInfo['description'],
            'columns' => $columns,
            'data' => $rows,
        ], "Data tabel '{$tableName}' berhasil dimuat");
    }
}
