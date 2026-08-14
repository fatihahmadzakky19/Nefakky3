<?php

// Namespace penempat controller dalam struktur folder Laravel API
namespace App\Http\Controllers\Api;

// Mengimpor controller induk dari Laravel
use App\Http\Controllers\Controller;
// Mengimpor Model Order (Header Pesanan)
use App\Models\Order;
// Mengimpor Model OrderItem (Rincian Item Pesanan)
use App\Models\OrderItem;
// Mengimpor Model ProductItem untuk melakukan pengecekan & pengurangan stok
use App\Models\ProductItem;
// Mengimpor Request dari Laravel untuk membaca data input HTTP
use Illuminate\Http\Request;

// Class Controller untuk mengelola transaksi pesanan dan alur status pengiriman live
class OrderController extends Controller
{
    /**
     * Menampilkan semua daftar pesanan beserta rincian item (diurutkan dari yang terbaru)
     */
    public function index()
    {
        // Mengambil data pesanan relasi 'items' diurutkan berdasarkan tanggal dibuat (terbaru)
        $orders = Order::with('items')->orderBy('created_at', 'desc')->get();
        // Mengembalikan daftar pesanan dalam format JSON
        return response()->json($orders);
    }

    /**
     * Menampilkan detail satu pesanan berdasarkan ID pesanan
     */
    public function show($id)
    {
        // Cari pesanan berdasarkan order_id beserta relasi item-itemnya
        $order = Order::with('items')->find($id);
        // Jika pesanan tidak ditemukan
        if (!$order) {
            // Kembalikan pesan error 404
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }
        // Kembalikan detail pesanan dalam format JSON
        return response()->json($order);
    }

    /**
     * Menyimpan transaksi pesanan baru, membuat order items, dan mengaplikasikan PBO pengurangan stok
     */
    public function store(Request $request)
    {
        // Ambil semua array input dari request HTTP
        $data = $request->all();
        // Pisahkan data items dari header pesanan (default ke array kosong jika tidak ada)
        $itemsData = $data['items'] ?? [];
        // Hapus kunci 'items' dari array data header pesanan
        unset($data['items']);

        // Jika nomor order_id tidak dikirim dari client, buat nomor otomatis
        if (empty($data['order_id'])) {
            $data['order_id'] = 'ORD-' . rand(10000, 99999);
        }

        // 1. Simpan record header pesanan utama ke tabel orders
        $order = Order::create($data);

        // 2. Iterasi setiap item pesanan untuk disimpan dan dikurangi stoknya
        foreach ($itemsData as $item) {
            // Tentukan ID produk dari key id atau product_id
            $productId = $item['id'] ?? $item['product_id'] ?? '';
            // Tentukan kuantitas pesanan (default 1)
            $qty = $item['quantity'] ?? 1;

            // Simpan detail item pesanan ke tabel order_items
            OrderItem::create([
                'order_id' => $order->order_id, // Foreign key merujuk ke order_id utama
                'product_id' => $productId, // ID produk yang dibeli
                'name' => $item['name'] ?? 'Menu Makanan', // Nama item makanan
                'price' => $item['price'] ?? 0, // Harga satuan item
                'quantity' => $qty, // Jumlah yang dipesan
                'image' => $item['image'] ?? '', // URL/Path gambar makanan
            ]);

            // Pengurangan stok otomatis menggunakan metode Pemrograman Berorientasi Objek (PBO) di ProductItem
            $prod = ProductItem::find($productId);
            if ($prod) {
                // Panggil metode encapsulation PBO reduceStock() untuk mengurangi stok produk
                $prod->reduceStock($qty);
            }
        }

        // Kembalikan data pesanan baru beserta rincian item dengan HTTP status 201 Created
        return response()->json($order->load('items'), 201);
    }

    /**
     * Memajukan tahap alur pengiriman live 5-Tahap (RECEIVED -> COOKING -> READY -> DELIVERING -> COMPLETED)
     */
    public function advanceStage($id)
    {
        // Cari pesanan berdasarkan ID
        $order = Order::find($id);
        // Jika pesanan tidak ada
        if (!$order) {
            // Kembalikan response 404
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        // Panggil metode PBO advanceStatus() pada model Order untuk memproses transisi tahap berikutnya
        $newStage = $order->advanceStatus();
        // Kembalikan response JSON berisi status terbaru pesanan
        return response()->json([
            'status' => 'success',
            'new_stage' => $newStage
        ]);
    }

    /**
     * Memperbarui data informasi pesanan
     */
    public function update(Request $request, $id)
    {
        // Cari pesanan berdasarkan ID
        $order = Order::find($id);
        // Jika pesanan tidak ditemukan
        if (!$order) {
            // Kembalikan response error 404
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        // Perbarui atribut pesanan berdasarkan data request
        $order->update($request->all());
        // Kembalikan pesanan terbaru beserta item yang terhubung
        return response()->json($order->load('items'));
    }

    /**
     * Menghapus data pesanan dari database
     */
    public function destroy($id)
    {
        // Cari pesanan berdasarkan ID
        $order = Order::find($id);
        // Jika pesanan tidak ada
        if (!$order) {
            // Kembalikan error 404
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        // Hapus pesanan dari database
        $order->delete();
        // Kembalikan pesan konfirmasi sukses
        return response()->json(['message' => 'Pesanan berhasil dihapus']);
    }
}

