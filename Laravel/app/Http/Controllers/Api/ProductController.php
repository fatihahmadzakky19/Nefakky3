<?php

// Namespace penempat controller dalam struktur folder Laravel API
namespace App\Http\Controllers\Api;

// Mengimpor controller induk dari Laravel
use App\Http\Controllers\Controller;
// Mengimpor Model ProductItem untuk berinteraksi dengan tabel produk di database
use App\Models\ProductItem;
// Mengimpor Request untuk menangani HTTP request dari client
use Illuminate\Http\Request;

// Class Controller untuk mengelola endpoint data Produk (Menu Kuliner)
class ProductController extends Controller
{
    /**
     * Menampilkan semua data produk dari database
     */
    public function index()
    {
        // Ambil semua data produk dan kembalikan sebagai format JSON
        return response()->json(ProductItem::all());
    }

    /**
     * Menampilkan produk yang status visibility-nya aktif (true) untuk Katalog Pengunjung
     */
    public function visible()
    {
        // Filter produk dimana kolom 'visibility' bernilai true
        $products = ProductItem::where('visibility', true)->get();
        // Kembalikan daftar produk aktif dalam bentuk JSON
        return response()->json($products);
    }

    /**
     * Menampilkan detail satu produk berdasarkan ID produk (item_id)
     */
    public function show($id)
    {
        // Cari produk berdasarkan primary key (item_id)
        $product = ProductItem::find($id);
        // Jika produk tidak ditemukan di database
        if (!$product) {
            // Kembalikan pesan error 404 (Not Found)
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }
        // Jika ditemukan, kembalikan detail data produk
        return response()->json($product);
    }

    /**
     * Menyimpan data produk baru ke dalam database
     */
    public function store(Request $request)
    {
        // Validasi input HTTP request sesuai aturan skema database
        $validated = $request->validate([
            'item_id' => 'required|string|unique:product_items,item_id', // ID item wajib unik
            'sku' => 'required|string|unique:product_items,sku', // SKU produk wajib unik
            'name' => 'required|string|max:150', // Nama produk wajib string max 150 karakter
            'category' => 'nullable|string', // Kategori opsional
            'price' => 'required|numeric|min:0', // Harga wajib angka positif
            'discount' => 'nullable|numeric|min:0', // Diskon persen opsional
            'stock' => 'nullable|integer|min:0', // Stok barang opsional
            'visibility' => 'nullable|boolean', // Status visibilitas opsional
            'status' => 'nullable|string', // Status stok (In Stock/Low Stock/Inactive)
            'rating' => 'nullable|numeric', // Rating rata-rata opsional
            'reviews_count' => 'nullable|integer', // Jumlah ulasan opsional
            'sold_count' => 'nullable|string', // Jumlah terjual opsional
            'image' => 'required|string', // URL/Path Gambar wajib diisi
            'description' => 'required|string', // Deskripsi produk wajib diisi
            'badge' => 'nullable|string', // Badge promo (cth: Best Seller)
            'ingredients' => 'nullable|string', // Komposisi bahan opsional
            'usage_advice' => 'nullable|string', // Saran penyajian opsional
            'calories' => 'nullable|string', // Informasi kalori opsional
            'fat' => 'nullable|string', // Informasi lemak opsional
            'sugar' => 'nullable|string', // Informasi gula opsional
        ]);

        // Buat record produk baru di database menggunakan data terverifikasi
        $product = ProductItem::create($validated);
        // Kembalikan response JSON berisi produk yang dibuat beserta HTTP status code 201 (Created)
        return response()->json($product, 201);
    }

    /**
     * Memperbarui data produk yang sudah ada di database
     */
    public function update(Request $request, $id)
    {
        // Cari produk berdasarkan ID
        $product = ProductItem::find($id);
        // Jika produk tidak ditemukan
        if (!$product) {
            // Kembalikan response error 404
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }

        // Perbarui atribut produk sesuai input dari request
        $product->update($request->all());
        // Kembalikan data produk setelah diupdate
        return response()->json($product);
    }

    /**
     * Menghapus produk dari database berdasarkan ID
     */
    public function destroy($id)
    {
        // Cari produk berdasarkan ID
        $product = ProductItem::find($id);
        // Jika produk tidak ditemukan
        if (!$product) {
            // Kembalikan response error 404
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }

        // Hapus data produk dari database
        $product->delete();
        // Kembalikan pesan sukses penghapusan
        return response()->json(['message' => 'Produk berhasil dihapus']);
    }
}

