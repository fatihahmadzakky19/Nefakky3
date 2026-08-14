<?php

// Namespace penempat Model dalam struktur folder Laravel Eloquent
namespace App\Models;

// Mengimpor kelas dasar Model dari Eloquent ORM Laravel
use Illuminate\Database\Eloquent\Model;

// Class Model OrderItem yang merepresentasikan rincian barang di tabel 'order_items'
class OrderItem extends Model
{
    // Kolom-kolom yang diizinkan untuk diisi secara massal
    protected $fillable = [
        'order_id', // ID pesanan tempat item ini terikat (Foreign Key)
        'product_id', // ID produk makanan/minuman (Foreign Key)
        'name', // Nama produk saat dipesan
        'price', // Harga satuan item (Rp)
        'quantity', // Jumlah barang yang dipesan
        'image', // URL/Path foto produk
    ];

    // Casting tipe data kolom
    protected $casts = [
        'price' => 'float', // Konversi harga ke desimal/float
        'quantity' => 'integer', // Konversi kuantitas ke integer
    ];

    /**
     * Metode PBO: Menghitung subtotal harga item (Harga x Kuantitas)
     */
    public function getSubtotal(): float
    {
        // Kalikan harga satuan dengan jumlah item yang dipesan
        return $this->price * $this->quantity;
    }
}

