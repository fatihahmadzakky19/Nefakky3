<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductItem;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(ProductItem::all());
    }

    public function visible()
    {
        $products = ProductItem::where('visibility', true)->get();
        return response()->json($products);
    }

    public function show($id)
    {
        $product = ProductItem::find($id);
        if (!$product) {
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|string|unique:product_items,item_id',
            'sku' => 'required|string|unique:product_items,sku',
            'name' => 'required|string|max:150',
            'category' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'visibility' => 'nullable|boolean',
            'status' => 'nullable|string',
            'rating' => 'nullable|numeric',
            'reviews_count' => 'nullable|integer',
            'sold_count' => 'nullable|string',
            'image' => 'required|string',
            'description' => 'required|string',
            'badge' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'usage_advice' => 'nullable|string',
            'calories' => 'nullable|string',
            'fat' => 'nullable|string',
            'sugar' => 'nullable|string',
        ]);

        $product = ProductItem::create($validated);
        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = ProductItem::find($id);
        if (!$product) {
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }

        $product->update($request->all());
        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = ProductItem::find($id);
        if (!$product) {
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }

        $product->delete();
        return response()->json(['message' => 'Produk berhasil dihapus']);
    }
}
