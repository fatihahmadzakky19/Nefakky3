<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('items')->orderBy('created_at', 'desc')->get();
        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::with('items')->find($id);
        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }
        return response()->json($order);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $itemsData = $data['items'] ?? [];
        unset($data['items']);

        if (empty($data['order_id'])) {
            $data['order_id'] = 'ORD-' . rand(10000, 99999);
        }

        // 1. Create main order record
        $order = Order::create($data);

        // 2. Loop order items & reduce stock
        foreach ($itemsData as $item) {
            $productId = $item['id'] ?? $item['product_id'] ?? '';
            $qty = $item['quantity'] ?? 1;

            OrderItem::create([
                'order_id' => $order->order_id,
                'product_id' => $productId,
                'name' => $item['name'] ?? 'Menu Makanan',
                'price' => $item['price'] ?? 0,
                'quantity' => $qty,
                'image' => $item['image'] ?? '',
            ]);

            // Reduce stock automatically using PBO method on ProductItem
            $prod = ProductItem::find($productId);
            if ($prod) {
                $prod->reduceStock($qty);
            }
        }

        return response()->json($order->load('items'), 201);
    }

    public function advanceStage($id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        $newStage = $order->advanceStatus();
        return response()->json([
            'status' => 'success',
            'new_stage' => $newStage
        ]);
    }

    public function update(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        $order->update($request->all());
        return response()->json($order->load('items'));
    }

    public function destroy($id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        $order->delete();
        return response()->json(['message' => 'Pesanan berhasil dihapus']);
    }
}
