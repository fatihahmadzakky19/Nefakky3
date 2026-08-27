<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductItem;
use App\Models\Voucher;
use App\Traits\ApiResponseTrait;
use App\Traits\BroadcastSafelyTrait;
use App\Events\OrderPlacedEvent;
use App\Events\OrderStatusUpdatedEvent;
use App\Events\ProductStockUpdatedEvent;
use App\Events\RealtimeActivityEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controller OrderController
 * Mengelola Transaksi Pesanan Pelanggan, Validasi Stok ACID, Live Tracking 5-Tahap, dan Konfirmasi Pesanan.
 */
class OrderController extends Controller
{
    use ApiResponseTrait, BroadcastSafelyTrait;

    /**
     * Menampilkan daftar pesanan dengan filter status, email, dan paginasi
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with('items');

        // 1. Filter Status Pengiriman
        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        // 2. Filter Status Pembayaran
        if ($request->filled('payment_badge')) {
            $query->where('payment_badge', $request->payment_badge);
        }

        // 3. Filter Email Pelanggan (Pesanan Saya)
        if ($request->filled('customer_email')) {
            $query->where('customer_email', $request->customer_email);
        }

        // 4. Filter User ID
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // 5. Pencarian Keyword (ID Pesanan, Nama, Telepon)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_id', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Pengurutan pesanan terbaru
        $query->orderBy('created_at', 'desc');

        if ($request->has('per_page')) {
            $perPage = (int) $request->query('per_page', 10);
            $paginator = $query->paginate($perPage);
            return response()->json([
                'success' => true,
                'status' => 'success',
                'code' => 200,
                'message' => 'Daftar pesanan berhasil diambil',
                'data' => OrderResource::collection($paginator->items()),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ]
            ]);
        }

        $orders = $query->get();
        return $this->successResponse(OrderResource::collection($orders), 'Daftar pesanan berhasil diambil');
    }

    /**
     * Menampilkan detail satu pesanan beserta item-itemnya
     */
    public function show($id): JsonResponse
    {
        $order = Order::with('items')->find($id);

        if (!$order) {
            return $this->notFoundResponse('Pesanan tidak ditemukan');
        }

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
    public function advanceStage($id): JsonResponse
    {
        $order = Order::with('items')->find($id);

        if (!$order) {
            return $this->notFoundResponse('Pesanan tidak ditemukan');
        }

        $oldStage = $order->status;
        $newStage = $order->advanceStatus();

        // Pancarkan event realtime pembaruan status pesanan ke WebSocket Reverb
        $this->safeBroadcast(new OrderStatusUpdatedEvent($order, $oldStage, "Status pesanan #{$order->order_id} diperbarui menjadi: {$newStage}"));

        return $this->successResponse([
            'order_id' => $order->order_id,
            'new_stage' => $newStage,
            'status' => $newStage,
            'order' => new OrderResource($order),
        ], "Status pesanan berhasil ditingkatkan menjadi: {$newStage}");
    }

    /**
     * Konfirmasi penerimaan pesanan oleh pelanggan
     */
    public function confirmReceived(Request $request, $id): JsonResponse
    {
        $order = Order::with('items')->find($id);

        if (!$order) {
            return $this->notFoundResponse('Pesanan tidak ditemukan');
        }

        $oldStatus = $order->status;
        $order->customer_confirmed = true;
        $order->confirmed_at = now();
        $order->status = 'COMPLETED';

        if ($request->filled('proof_photo')) {
            $order->proof_photo = $request->proof_photo;
        }

        $order->save();

        // Pancarkan event realtime pesanan selesai ke WebSocket Reverb
        $this->safeBroadcast(new OrderStatusUpdatedEvent($order, $oldStatus, "Pesanan #{$order->order_id} telah diterima oleh pelanggan dan selesai!"));

        return $this->successResponse(new OrderResource($order), 'Terima kasih atas konfirmasi Anda. Pesanan telah selesai!');
    }

    /**
     * Mengupload bukti foto serah terima / pembayaran pesanan
     */
    public function uploadProof(Request $request, $id): JsonResponse
    {
        $request->validate([
            'proof_photo' => 'nullable|string',
            'payment_proof_photo' => 'nullable|string',
        ]);

        $order = Order::find($id);

        if (!$order) {
            return $this->notFoundResponse('Pesanan tidak ditemukan');
        }

        if ($request->filled('proof_photo')) $order->proof_photo = $request->proof_photo;
        if ($request->filled('payment_proof_photo')) $order->payment_proof_photo = $request->payment_proof_photo;

        $order->save();

        // Pancarkan event realtime update pesanan
        $this->safeBroadcast(new OrderStatusUpdatedEvent($order, $order->status, "Bukti foto untuk pesanan #{$order->order_id} telah diunggah"));

        return $this->successResponse(new OrderResource($order->load('items')), 'Foto bukti pesanan berhasil diunggah');
    }

    /**
     * Membatalkan pesanan dan mengembalikan stok barang
     */
    public function cancel($id): JsonResponse
    {
        $order = Order::with('items')->find($id);

        if (!$order) {
            return $this->notFoundResponse('Pesanan tidak ditemukan');
        }

        $oldStatus = $order->status;
        $order->cancelOrder();

        // Pancarkan event realtime pembatalan pesanan ke WebSocket Reverb
        $this->safeBroadcast(new OrderStatusUpdatedEvent($order, $oldStatus, "Pesanan #{$order->order_id} telah dibatalkan"));

        return $this->successResponse(new OrderResource($order), 'Pesanan berhasil dibatalkan dan stok telah dikembalikan');
    }

    /**
     * Memperbarui informasi pesanan
     */
    public function update(UpdateOrderRequest $request, $id): JsonResponse
    {
        $order = Order::with('items')->find($id);

        if (!$order) {
            return $this->notFoundResponse('Pesanan tidak ditemukan');
        }

        $order->update($request->validated());

        return $this->successResponse(new OrderResource($order), 'Data pesanan berhasil diperbarui');
    }

    /**
     * Menghapus pesanan (Soft Delete)
     */
    public function destroy($id): JsonResponse
    {
        $order = Order::find($id);

        if (!$order) {
            return $this->notFoundResponse('Pesanan tidak ditemukan');
        }

        $order->delete();

        return $this->successResponse(null, 'Pesanan berhasil dihapus');
    }

    /**
     * Menghasilkan dan Mengunduh Dokumen Invoice Pesanan Resmi dalam format PDF
     * Menggunakan library Barryvdh DomPDF
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
                        <td>{$item->product_name}</td>
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

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->setPaper('a4', 'portrait');

        return $pdf->download("Invoice_{$order->order_id}.pdf");
    }

    /**
     * Ringkasan statistik jumlah pesanan per status untuk Dashboard Admin
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_orders' => Order::count(),
            'received' => Order::where('status', 'RECEIVED')->count(),
            'cooking' => Order::where('status', 'COOKING')->count(),
            'ready' => Order::where('status', 'READY')->count(),
            'delivering' => Order::where('status', 'DELIVERING')->count(),
            'completed' => Order::where('status', 'COMPLETED')->count(),
            'cancelled' => Order::where('status', 'CANCELLED')->count(),
            'paid' => Order::where('payment_badge', 'PAID')->count(),
            'unpaid' => Order::where('payment_badge', 'AWAITING')->count(),
        ];

        return $this->successResponse($stats, 'Statistik pesanan berhasil diambil');
    }
}
