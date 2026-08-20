<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Class UserSeeder
 * 
 * Seeder ini bertanggung jawab untuk membuat akun pengguna default (Administrator dan Pelanggan Demo)
 * beserta alamat pengiriman awal untuk keperluan pengujian sistem dan login awal aplikasi.
 */
class UserSeeder extends Seeder
{
    /**
     * Menjalankan proses seeding akun pengguna dan data alamat pengiriman.
     *
     * @return void
     */
    public function run(): void
    {
        // 1. Akun Administrator Utama Toko
        $admin = User::updateOrCreate(
            ['email' => 'fatihahmadzakky19@gmail.com'], // Kriteria pencarian email admin
            [
                'name' => 'Fatih Ahmad Zakky (Admin)', // Nama lengkap administrator
                'phone' => '+6281234567890', // Nomor WhatsApp resmi admin
                'role' => 'admin', // Hak akses level administrator
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatih', // Avatar profil default
                'password' => Hash::make('Fatih123'), // Enkripsi password menggunakan algoritma Bcrypt
            ]
        );

        // Alamat Utama Administrator
        UserAddress::updateOrCreate(
            ['user_id' => $admin->id, 'label' => 'Rumah (Utama)'],
            [
                'receiver_name' => 'Fatih Ahmad Zakky',
                'receiver_phone' => '+6281234567890',
                'address' => 'Puri Bojong Lestari AF No 41, Bojong Gede, Bogor',
                'is_default' => true, // Menandai sebagai alamat pengiriman default
            ]
        );

        // Alamat Kantor / Dapur Pusat Administrator
        UserAddress::updateOrCreate(
            ['user_id' => $admin->id, 'label' => 'Kantor / Dapur Pusat'],
            [
                'receiver_name' => 'Fatih Ahmad Zakky',
                'receiver_phone' => '+6281234567890',
                'address' => 'Jl. Jend. Sudirman No. 52, SCBD, Jakarta Selatan',
                'is_default' => false,
            ]
        );

        // 2. Akun Pelanggan Demo 1: Nizar Azzuhra
        $cust1 = User::updateOrCreate(
            ['email' => 'nizarazzuhra@gmail.com'],
            [
                'name' => 'Nizar Azzuhra',
                'phone' => '+6285712345678',
                'role' => 'customer', // Hak akses level pelanggan
                'avatar' => 'https://ui-avatars.com/api/?name=Nizar+Azzuhra&background=5C3D28&color=ffffff',
                'password' => Hash::make('password123'),
            ]
        );

        UserAddress::updateOrCreate(
            ['user_id' => $cust1->id, 'label' => 'Rumah'],
            [
                'receiver_name' => 'Nizar Azzuhra',
                'receiver_phone' => '+6285712345678',
                'address' => 'Jl. Margonda Raya No. 100, Beji, Kota Depok',
                'is_default' => true,
            ]
        );

        // 3. Akun Pelanggan Demo 2: Siti Rahmawati
        $cust2 = User::updateOrCreate(
            ['email' => 'siti@example.com'],
            [
                'name' => 'Siti Rahmawati',
                'phone' => '+6281987654321',
                'role' => 'customer',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
                'password' => Hash::make('password123'),
            ]
        );

        UserAddress::updateOrCreate(
            ['user_id' => $cust2->id, 'label' => 'Apartemen'],
            [
                'receiver_name' => 'Siti Rahmawati',
                'receiver_phone' => '+6281987654321',
                'address' => 'Apartemen Taman Rasuna Tower 8 Lt 15, Kuningan, Jakarta Selatan',
                'is_default' => true,
            ]
        );
    }
}
