<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\ProductItem;
use App\Events\ProductStockUpdatedEvent;
use App\Traits\ApiResponseTrait;
use App\Traits\BroadcastSafelyTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller ProductController
 * Mengelola Master Menu Kuliner, Stok Real-time, Visibilitas Katalog, dan Pencarian.
 */
class ProductController extends Controller
{
    use ApiResponseTrait, BroadcastSafelyTrait;

    /**
     * Menampilkan daftar semua produk dengan filter, pencarian, dan pengurutan
     */
    public function index(Request $request): JsonResponse
    {
        $query = ProductItem::query();

        // 1. Filter Pencarian Keyword (Nama, SKU, Deskripsi)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // 2. Filter Kategori
        if ($request->filled('category') && $request->category !== 'Semua') {
            $query->where('category', $request->category);
        }

        // 3. Filter Status Stok
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // 4. Filter Visibilitas (Publik / Admin)
        if ($request->has('visibility')) {
            $query->where('visibility', filter_var($request->visibility, FILTER_VALIDATE_BOOLEAN));
        }

        // 4.1 Filter Coming Soon
        if ($request->has('is_coming_soon')) {
            $query->where('is_coming_soon', filter_var($request->is_coming_soon, FILTER_VALIDATE_BOOLEAN));
        }

        // 5. Pengurutan Data (Sorting)
        $sortBy = $request->query('sort', 'newest');
        switch ($sortBy) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'popular':
                $query->orderBy('reviews_count', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Paginasi atau Semua Data
        if ($request->has('per_page')) {
            $perPage = (int) $request->query('per_page', 12);
            $paginator = $query->paginate($perPage);
            return response()->json([
                'success' => true,
                'status' => 'success',
                'code' => 200,
                'message' => 'Daftar produk berhasil diambil',
                'data' => ProductResource::collection($paginator->items()),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ]
            ]);
        }

        $products = $query->get();
        return $this->successResponse(ProductResource::collection($products), 'Daftar produk berhasil diambil');
    }

    /**
     * Menampilkan menu aktif untuk katalog pengunjung / etalase toko
     */
    public function visible(): JsonResponse
    {
        $products = ProductItem::where('visibility', true)
            ->where('status', '!=', 'Inactive')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse(ProductResource::collection($products), 'Katalog menu aktif berhasil diambil');
    }

    /**
     * Menampilkan detail satu produk berdasarkan item_id
     */
    public function show($id): JsonResponse
    {
        $product = ProductItem::with('reviews')->find($id);

        if (!$product) {
            return $this->notFoundResponse('Produk tidak ditemukan');
        }

        return $this->successResponse(new ProductResource($product), 'Detail produk berhasil diambil');
    }

    /**
     * Menyimpan produk menu kuliner baru
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $product = ProductItem::create($data);
        $product->updateStockStatus();
        $product->save();

        return $this->createdResponse(new ProductResource($product), 'Produk berhasil ditambahkan ke katalog');
    }

    /**
     * Memperbarui data produk
     */
    public function update(UpdateProductRequest $request, $id): JsonResponse
    {
        $product = ProductItem::find($id);

        if (!$product) {
            return $this->notFoundResponse('Produk tidak ditemukan');
        }

        $product->update($request->validated());
        $product->updateStockStatus();
        $product->save();

        return $this->successResponse(new ProductResource($product), 'Data produk berhasil diperbarui');
    }

    /**
     * Menghapus produk
     */
    public function destroy($id): JsonResponse
    {
        $product = ProductItem::find($id);

        if (!$product) {
            return $this->notFoundResponse('Produk tidak ditemukan');
        }

        $product->delete();

        return $this->successResponse(null, 'Produk berhasil dihapus');
    }

    /**
     * Mengubah status tampil/sembunyi produk di katalog
     */
    public function toggleVisibility($id): JsonResponse
    {
        $product = ProductItem::find($id);

        if (!$product) {
            return $this->notFoundResponse('Produk tidak ditemukan');
        }

        $product->visibility = !$product->visibility;
        $product->save();

        // Pancarkan event realtime ke WebSocket Reverb
        $statusMsg = $product->visibility ? "Produk {$product->name} sekarang ditampilkan" : "Produk {$product->name} disembunyikan";
        $this->safeBroadcast(new ProductStockUpdatedEvent($product, $statusMsg));

        return $this->successResponse(new ProductResource($product), 'Status visibilitas produk berhasil diubah');
    }

    /**
     * Memperbarui kuantitas stok produk secara langsung
     */
    public function updateStock(Request $request, $id): JsonResponse
    {
        $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $product = ProductItem::find($id);

        if (!$product) {
            return $this->notFoundResponse('Produk tidak ditemukan');
        }

        $product->stock = (int) $request->stock;
        $product->updateStockStatus();
        $product->save();

        // Pancarkan event realtime ke WebSocket Reverb
        $this->safeBroadcast(new ProductStockUpdatedEvent($product, "Stok produk {$product->name} diperbarui menjadi {$product->stock}"));

        return $this->successResponse(new ProductResource($product), 'Jumlah stok produk berhasil diperbarui');
    }
}
