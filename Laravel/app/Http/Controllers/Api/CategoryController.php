<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Controller CategoryController
 * Mengelola Master Kategori Menu Kuliner.
 */
class CategoryController extends Controller
{
    use ApiResponseTrait;

    public function index(): JsonResponse
    {
        $categories = Category::with('products')->where('is_active', true)->get();
        return $this->successResponse(CategoryResource::collection($categories), 'Daftar kategori berhasil diambil');
    }

    public function show($id): JsonResponse
    {
        $category = Category::with('products')->find($id);

        if (!$category) {
            return $this->notFoundResponse('Kategori tidak ditemukan');
        }

        return $this->successResponse(new CategoryResource($category), 'Detail kategori berhasil diambil');
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
            'icon' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'icon' => $request->icon,
            'description' => $request->description,
            'is_active' => true,
        ]);

        return $this->createdResponse(new CategoryResource($category), 'Kategori berhasil dibuat');
    }

    public function update(Request $request, $id): JsonResponse
    {
        $category = Category::find($id);

        if (!$category) {
            return $this->notFoundResponse('Kategori tidak ditemukan');
        }

        $request->validate([
            'name' => 'nullable|string|max:100|unique:categories,name,' . $id,
            'icon' => 'nullable|string',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->has('name')) {
            $category->name = $request->name;
            $category->slug = Str::slug($request->name);
        }

        if ($request->has('icon')) $category->icon = $request->icon;
        if ($request->has('description')) $category->description = $request->description;
        if ($request->has('is_active')) $category->is_active = $request->is_active;

        $category->save();

        return $this->successResponse(new CategoryResource($category), 'Kategori berhasil diperbarui');
    }

    public function destroy($id): JsonResponse
    {
        $category = Category::find($id);

        if (!$category) {
            return $this->notFoundResponse('Kategori tidak ditemukan');
        }

        $category->delete();

        return $this->successResponse(null, 'Kategori berhasil dihapus');
    }
}
