<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan controller ini ke dalam namespace App\Http\Controllers\Api.
// -----------------------------------------------------------------------------
namespace App\Http\Controllers\Api;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor model, request validator, resource DTO, trait, dan event.
// -----------------------------------------------------------------------------
use App\Http\Controllers\Controller;              // Superclass Controller dasar Laravel
use App\Http\Requests\StoreOrderRequest;          // Form Request validasi checkout
use App\Http\Requests\UpdateOrderRequest;         // Form Request validasi update order
use App\Http\Resources\OrderResource;             // Transformasi JSON Resource pesanan
use App\Models\Order;                             // Model Eloquent Header Pesanan
use App\Models\OrderItem;                         // Model Eloquent Rincian Hidangan
use App\Models\ProductItem;                       // Model Eloquent Master Produk Hidangan
use App\Models\Voucher;                           // Model Eloquent Kupon Promo
use App\Traits\ApiResponseTrait;                  // Trait penyeragam struktur respon JSON API
use App\Traits\BroadcastSafelyTrait;              // Trait pemancar aman WebSocket Reverb
use App\Events\OrderPlacedEvent;                  // Event notifikasi pesanan baru
use App\Events\OrderStatusUpdatedEvent;           // Event notifikasi perubahan status 5-tahap
use App\Events\ProductStockUpdatedEvent;          // Event notifikasi perubahan kuantitas stok
use App\Events\RealtimeActivityEvent;             // Event log aktivitas live dashboard
use Illuminate\Http\JsonResponse;                 // Tipe data kembalian respons JSON
use Illuminate\Http\Request;                      // Objek HTTP Request dari client
use Illuminate\Support\Facades\DB;                // Facade Database untuk transaksi ACID

/**
 * =============================================================================
 * CONTROLLER: OrderController (Pengendali Utama Transaksi & Pesanan)
 * =============================================================================
 * Mengelola seluruh siklus hidup pesanan kuliner: pembuatan transaksi ACID,
 * pemotongan stok otomatis, alur 5-tahap dapur, live tracking, dan cetak PDF invoice.
 * =============================================================================
 */
class OrderController extends Controller
{
    // Mengadopsi Trait untuk format balasan API seragam dan pengiriman event WebSocket anti-crash
    use ApiResponseTrait, BroadcastSafelyTrait;

    /**
     * Menampilkan daftar seluruh pesanan dengan filter status, pencarian, dan paginasi.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Membuka query builder dengan teknik Eager Loading untuk memuat relasi 'items' (mencegah N+1 Query Problem)
        $query = Order::with('items');

        // 1. Filter Berdasarkan Status Pengiriman Dapur (RECEIVED, COOKING, READY, dll)
        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        // 2. Filter Berdasarkan Status Verifikasi Pembayaran (PAID, PENDING, AWAITING)
        if ($request->filled('payment_badge')) {
            $query->where('payment_badge', $request->payment_badge);
        }

        // 3. Filter Berdasarkan Email Pelanggan (untuk halaman Riwayat Pesanan Saya)
        if ($request->filled('customer_email')) {
            $query->where('customer_email', $request->customer_email);
        }

        // 4. Filter Berdasarkan User ID pemilik akun
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // 5. Filter Pencarian Multi-Kolom (ID Pesanan, Nama Pelanggan, atau No. Telepon)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_id', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Mengurutkan pesanan dari yang paling baru dibuat
        $query->orderBy('created_at', 'desc');

        // Jika client meminta sistem paginasi (per_page)
        if ($request->has('per_page')) {
            $perPage = (int) $request->query('per_page', 10);
            $paginator = $query->paginate($perPage);
            return response()->json([
                'success' => true,
                'status'  => 'success',
                'code'    => 200,
                'message' => 'Daftar pesanan berhasil diambil',
                'data'    => OrderResource::collection($paginator->items()),
                'meta'    => [
                    'current_page' => $paginator->currentPage(),
                    'per_page'     => $paginator->perPage(),
                    'total'        => $paginator->total(),
                    'last_page'    => $paginator->lastPage(),
                ]
            ]);
        }

        // Mengambil seluruh data pesanan dan mengembalikan respon sukses via ApiResponseTrait
        $orders = $query->get();
        return $this->successResponse(OrderResource::collection($orders), 'Daftar pesanan berhasil diambil');
    }

    /**
     * Menampilkan detail lengkap 1 pesanan berdasarkan ID Pesanan.
     *
     * @param string|int $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        // Mencari pesanan berdasarkan ID sekaligus memuat relasi rincian hidangan 'items'
        $order = Order::with('items')->find($id);

        // Jika pesanan tidak ditemukan di database, kembalikan HTTP 404 Not Found
        if (!$order) {
            return $this->notFoundResponse('Pesanan tidak ditemukan');
        }

        // Kembalikan data pesanan yang dibungkus rapi oleh OrderResource
        return $this->successResponse(new OrderResource($order), 'Detail pesanan berhasil diambil');
    }


    /**
     * Membuat transaksi pesanan baru (dengan Transaksi Database ACID & Pengurangan Stok PBO)
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $data = $request->validated();
        $itemsData = $data['items'];
        unset($data['items']);

        // Generate ID Pesanan otomatis jika kosong
        if (empty($data['order_id'])) {
            $data['order_id'] = 'ORD-' . rand(10000, 99999);
        }

        // Set default user avatar jika tidak ada
        if (empty($data['avatar'])) {
            $data['avatar'] = 'https://ui-avatars.com/api/?name=' . urlencode($data['customer_name']) . '&background=5C3D28&color=ffffff';
        }

        // Eksekusi transaksi database yang aman
        return DB::transaction(function () use ($data, $itemsData) {
            // 1. Simpan Header Pesanan
            $order = Order::create($data);

            // 2. Simpan setiap rincian item & kurangi stok produk
            foreach ($itemsData as $item) {
                $productId = $item['product_id'] ?? $item['id'] ?? '';
                $qty = (int) ($item['quantity'] ?? 1);

                OrderItem::create([
                    'order_id' => $order->order_id,
                    'product_id' => $productId,
                    'name' => $item['name'],
                    'price' => $item['price'],
                    'quantity' => $qty,
                    'image' => $item['image'] ?? '',
                    'notes' => $item['notes'] ?? null,
                ]);

                // Kurangi stok produk secara otomatis
                $prod = ProductItem::find($productId);
                if ($prod) {
                    $prod->reduceStock($qty);
                }
            }

            // 3. Tambah counter kuota jika menggunakan voucher promo
            if (!empty($order->voucher_code)) {
                $voucher = Voucher::where('code', strtoupper($order->voucher_code))->first();
                if ($voucher) {
                    $voucher->incrementUsage();
                }
            }

            // 4. Pancarkan event realtime ke WebSocket Reverb
            $this->safeBroadcast(new OrderPlacedEvent($order));

            return $this->createdResponse(new OrderResource($order->load('items')), 'Pesanan Anda berhasil dibuat!');
        });
    }

    /**
     * Memajukan status live pengiriman pesanan (5-Tahap)
     * (RECEIVED -> COOKING -> READY -> DELIVERING -> COMPLETED)
     */
    /**
     * Memajukan status live pengiriman pesanan (5-Tahap Dapur).
     * Urutan: RECEIVED -> COOKING -> READY -> DELIVERING -> COMPLETED
     *
     * @param string|int $id
     * @return JsonResponse
     */
     public function advanceStage($id): JsonResponse
     {
         // Cari pesanan berdasarkan ID beserta itemnya
         $order = Order::with('items')->find($id);
 
         // Validasi keberadaan data
         if (!$order) {
             return $this->notFoundResponse('Pesanan tidak ditemukan');
         }
 
         // Rekam status lama untuk log notifikasi
         $oldStage = $order->status;
         
         // Panggil metode PBO advanceStatus() pada model Order untuk menaikkan alur status
         $newStage = $order->advanceStatus();
 
         // Pancarkan event realtime ke WebSocket Reverb agar UI live tracking di HP pelanggan langsung bergerak
         $this->safeBroadcast(new OrderStatusUpdatedEvent(
             $order,
             $oldStage,
             "Status pesanan #{$order->order_id} diperbarui menjadi: {$newStage}"
         ));
 
         // Kembalikan respon sukses beserta data status terbaru
         return $this->successResponse([
             'order_id'  => $order->order_id,
             'new_stage' => $newStage,
             'status'    => $newStage,
             'order'     => new OrderResource($order),
         ], "Status pesanan berhasil ditingkatkan menjadi: {$newStage}");
     }
 
     /**
      * Konfirmasi penerimaan pesanan oleh pelanggan secara mandiri.
      *
      * @param Request $request
      * @param string|int $id
      * @return JsonResponse
      */
     public function confirmReceived(Request $request, $id): JsonResponse
     {
         // Cari pesanan berdasarkan ID
         $order = Order::with('items')->find($id);
 
         if (!$order) {
             return $this->notFoundResponse('Pesanan tidak ditemukan');
         }
 
         // Catat status lama
         $oldStatus = $order->status;
         
         // Mutasi atribut konfirmasi penyelesaian transaksi
         $order->customer_confirmed = true;
         $order->confirmed_at = now();
         $order->status = 'COMPLETED';
 
         // Jika pelanggan mengunggah foto serah terima makanan
         if ($request->filled('proof_photo')) {
             $order->proof_photo = $request->proof_photo;
         }
 
         // Simpan perubahan ke database
         $order->save();
 
         // Pancarkan event realtime pesanan selesai ke WebSocket Reverb
         $this->safeBroadcast(new OrderStatusUpdatedEvent(
             $order,
             $oldStatus,
             "Pesanan #{$order->order_id} telah diterima oleh pelanggan dan selesai!"
         ));
 
         return $this->successResponse(new OrderResource($order), 'Terima kasih atas konfirmasi Anda. Pesanan telah selesai!');
     }
 
     /**
      * Mengunggah bukti foto serah terima atau foto bukti transfer manual.
      *
      * @param Request $request
      * @param string|int $id
      * @return JsonResponse
      */
     public function uploadProof(Request $request, $id): JsonResponse
     {
         // Validasi input foto berupa string URL
         $request->validate([
             'proof_photo'         => 'nullable|string',
             'payment_proof_photo' => 'nullable|string',
         ]);
 
         $order = Order::find($id);
 
         if (!$order) {
             return $this->notFoundResponse('Pesanan tidak ditemukan');
         }
 
         // Perbarui URL foto bukti jika dikirim
         if ($request->filled('proof_photo')) $order->proof_photo = $request->proof_photo;
         if ($request->filled('payment_proof_photo')) $order->payment_proof_photo = $request->payment_proof_photo;
 
         $order->save();
 
         // Pancarkan event realtime update pesanan
         $this->safeBroadcast(new OrderStatusUpdatedEvent($order, $order->status, "Bukti foto untuk pesanan #{$order->order_id} telah diunggah"));
 
         return $this->successResponse(new OrderResource($order->load('items')), 'Foto bukti pesanan berhasil diunggah');
     }
 
     /**
      * Membatalkan pesanan dan memulihkan kuantitas stok makanan secara otomatis.
      *
      * @param string|int $id
      * @return JsonResponse
      */
     public function cancel($id): JsonResponse
     {
         $order = Order::with('items')->find($id);
 
         if (!$order) {
             return $this->notFoundResponse('Pesanan tidak ditemukan');
         }
 
         $oldStatus = $order->status;
         
         // Panggil metode PBO cancelOrder() yang merestorasi stok hidangan di ProductItem
         $order->cancelOrder();
 
         // Pancarkan event realtime pembatalan pesanan ke WebSocket Reverb
         $this->safeBroadcast(new OrderStatusUpdatedEvent($order, $oldStatus, "Pesanan #{$order->order_id} telah dibatalkan"));
 
         return $this->successResponse(new OrderResource($order), 'Pesanan berhasil dibatalkan dan stok telah dikembalikan');
     }
 
     /**
      * Memperbarui atribut pesanan dari formulir dashboard admin.
      *
      * @param UpdateOrderRequest $request
      * @param string|int $id
      * @return JsonResponse
      */
     public function update(UpdateOrderRequest $request, $id): JsonResponse
     {
         $order = Order::with('items')->find($id);
 
         if (!$order) {
             return $this->notFoundResponse('Pesanan tidak ditemukan');
         }
 
         // Update data dengan nilai tervalidasi
         $order->update($request->validated());
 
         return $this->successResponse(new OrderResource($order), 'Data pesanan berhasil diperbarui');
     }
 
     /**
      * Menghapus pesanan secara aman menggunakan Soft Delete.
      *
      * @param string|int $id
      * @return JsonResponse
      */
     public function destroy($id): JsonResponse
     {
         $order = Order::find($id);
 
         if (!$order) {
             return $this->notFoundResponse('Pesanan tidak ditemukan');
         }
 
         // Menjalankan soft delete (mengisi kolom deleted_at)
         $order->delete();
 
         return $this->successResponse(null, 'Pesanan berhasil dihapus');
     }
 
     /**
      * Menghasilkan dan Mengunduh Dokumen Invoice Pesanan Resmi dalam format PDF.
      * Menggunakan library DomPDF
      *
      * @param string|int $id
      * @return mixed
      */
     public function invoicePdf($id)
     {
         $order = Order::with('items')->find($id);
 
         if (!$order) {
             return $this->notFoundResponse('Pesanan tidak ditemukan untuk mencetak invoice');
         }
 
         // Susun dokumen HTML Invoice bernuansa profesional
         $html = "
         <html>
         <head>
             <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"/>
             <title>Invoice #{$order->order_id} - Nefakky</title>
             <style>
                 body { font-family: sans-serif; color: #25160E; margin: 20px; font-size: 12px; }
                 .header { text-align: center; border-bottom: 2px solid #25160E; padding-bottom: 15px; margin-bottom: 20px; }
                 .brand { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
                 .subtitle { font-size: 11px; color: #666; margin-top: 4px; }
                 .info-table, .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                 .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                 .items-table th { background-color: #f7f4ef; font-weight: bold; }
                 .total-row td { font-weight: bold; font-size: 13px; background-color: #faf8f5; }
                 .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
             </style>
         </head>
         <body>
             <div class=\"header\">
                 <div class=\"brand\">NEFAKKY ARTISANAL</div>
                 <div class=\"subtitle\">Kuliner Masakan Rumahan Berkualitas UMKM Nusantara</div>
                 <div class=\"subtitle\">Puri Bojong Lestari 1 Blok AF 41, Bojong Gede, Bogor | WA: +62 812 3456 7890</div>
             </div>
 
             <table class=\"info-table\">
                 <tr>
                     <td style=\"width: 50%;\">
                         <strong>No. Pesanan:</strong> #{$order->order_id}<br>
                         <strong>Tanggal:</strong> " . ($order->order_datetime ?? now()->toFormattedDateString()) . "<br>
                         <strong>Status:</strong> " . strtoupper($order->status) . " (" . strtoupper($order->payment_badge) . ")
                     </td>
                     <td style=\"width: 50%; text-align: right;\">
                         <strong>Pelanggan:</strong> {$order->customer_name}<br>
                         <strong>No. Telp:</strong> {$order->phone}<br>
                         <strong>Alamat:</strong> {$order->address}
                     </td>
                 </tr>
             </table>
 
             <table class=\"items-table\">
                 <thead>
                     <tr>
                         <th>No</th>
                         <th>Nama Menu / Hidangan</th>
                         <th style=\"text-align: center;\">Jumlah</th>
                         <th style=\"text-align: right;\">Harga Satuan</th>
                         <th style=\"text-align: right;\">Subtotal</th>
                     </tr>
                 </thead>
                 <tbody>";
 
         $no = 1;
         foreach ($order->items as $item) {
             $sub = $item->price * $item->quantity;
             $html .= "
                     <tr>
                         <td style=\"text-align: center;\">{$no}</td>
                         <td>{$item->name}</td>
                         <td style=\"text-align: center;\">{$item->quantity}</td>
                         <td style=\"text-align: right;\">Rp " . number_format($item->price, 0, ',', '.') . "</td>
                         <td style=\"text-align: right;\">Rp " . number_format($sub, 0, ',', '.') . "</td>
                     </tr>";
             $no++;
         }
 
         $html .= "
                     <tr>
                         <td colspan=\"4\" style=\"text-align: right;\"><strong>Subtotal:</strong></td>
                         <td style=\"text-align: right;\">Rp " . number_format($order->subtotal, 0, ',', '.') . "</td>
                     </tr>
                     <tr>
                         <td colspan=\"4\" style=\"text-align: right;\"><strong>Ongkos Kirim:</strong></td>
                         <td style=\"text-align: right;\">Rp " . number_format($order->shipping_cost, 0, ',', '.') . "</td>
                     </tr>";
 
         if ($order->discount > 0) {
             $html .= "
                     <tr>
                         <td colspan=\"4\" style=\"text-align: right; color: green;\"><strong>Potongan Diskon Promo:</strong></td>
                         <td style=\"text-align: right; color: green;\">-Rp " . number_format($order->discount, 0, ',', '.') . "</td>
                     </tr>";
         }
 
         $html .= "
                     <tr class=\"total-row\">
                         <td colspan=\"4\" style=\"text-align: right;\"><strong>TOTAL DIBAYARKAN:</strong></td>
                         <td style=\"text-align: right; color: #934B19;\"><strong>Rp " . number_format($order->total, 0, ',', '.') . "</strong></td>
                     </tr>
                 </tbody>
             </table>
 
             <div class=\"footer\">
                 <p>Terima kasih telah memesan hidangan lezat di Nefakky Marketplace!</p>
                 <p>Dokumen ini adalah bukti transaksi dan struk pembayaran yang sah.</p>
             </div>
         </body>
         </html>";
 
         // Render dokumen HTML ke file PDF kertas A4 portrait
         $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->setPaper('a4', 'portrait');
 
         // Trigger download file PDF ke browser pengguna
         return $pdf->download("Invoice_{$order->order_id}.pdf");
     }
 
     /**
      * Ringkasan statistik jumlah pesanan per status untuk widget Dashboard Admin.
      *
      * @return JsonResponse
      */
     public function stats(): JsonResponse
     {
         // Menghitung jumlah record pesanan secara real di database
         $stats = [
             'total_orders' => Order::count(),
             'received'     => Order::where('status', 'RECEIVED')->count(),
             'cooking'      => Order::where('status', 'COOKING')->count(),
             'ready'        => Order::where('status', 'READY')->count(),
             'delivering'   => Order::where('status', 'DELIVERING')->count(),
             'completed'    => Order::where('status', 'COMPLETED')->count(),
             'cancelled'    => Order::where('status', 'CANCELLED')->count(),
             'paid'         => Order::where('payment_badge', 'PAID')->count(),
             'unpaid'       => Order::where('payment_badge', 'AWAITING')->count(),
         ];
 
         // Mengembalikan balasan JSON sukses
         return $this->successResponse($stats, 'Statistik pesanan berhasil diambil');
     }
}
