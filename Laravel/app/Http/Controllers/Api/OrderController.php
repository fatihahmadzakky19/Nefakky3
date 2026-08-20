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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controller OrderController
 * Mengelola Transaksi Pesanan Pelanggan, Validasi Stok ACID, Live Tracking 5-Tahap, dan Konfirmasi Pesanan.
 */
class OrderController extends Controller
{
    use ApiResponseTrait;

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

        $newStage = $order->advanceStatus();

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

        $order->customer_confirmed = true;
        $order->confirmed_at = now();
        $order->status = 'COMPLETED';

        if ($request->filled('proof_photo')) {
            $order->proof_photo = $request->proof_photo;
        }

        $order->save();

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

        $order->cancelOrder();

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
