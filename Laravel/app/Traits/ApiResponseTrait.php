<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Trait ApiResponseTrait
 * Standardisasi format respon JSON untuk seluruh API Nefakky Marketplace.
 */
trait ApiResponseTrait
{
    /**
     * Respon Sukses Terstandarisasi
     *
     * @param mixed $data Data payload
     * @param string $message Pesan informatif
     * @param int $code HTTP Status Code (Default: 200)
     * @param array|null $meta Metadata tambahan (paginasi, summary, dll)
     * @return JsonResponse
     */
    public function successResponse(mixed $data = null, string $message = 'Operasi berhasil diproses', int $code = 200, ?array $meta = null): JsonResponse
    {
        $response = [
            'success' => true,
            'status' => 'success',
            'code' => $code,
            'message' => $message,
            'data' => $data,
        ];

        if ($meta !== null) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    /**
     * Respon Sukses untuk Data Paginasi (Pagination)
     *
     * @param LengthAwarePaginator $paginator
     * @param string $message
     * @return JsonResponse
     */
    public function paginatedResponse(LengthAwarePaginator $paginator, string $message = 'Data berhasil diambil'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'status' => 'success',
            'code' => 200,
            'message' => $message,
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'has_more' => $paginator->hasMorePages(),
            ]
        ], 200);
    }

    /**
     * Respon Sukses Pembuatan Data Baru (HTTP 201 Created)
     *
     * @param mixed $data
     * @param string $message
     * @return JsonResponse
     */
    public function createdResponse(mixed $data, string $message = 'Data berhasil dibuat'): JsonResponse
    {
        return $this->successResponse($data, $message, 201);
    }

    /**
     * Respon Error Terstandarisasi (HTTP 400 Bad Request atau custom code)
     *
     * @param string $message
     * @param int $code
     * @param mixed $errors Detail error / validasi
     * @return JsonResponse
     */
    public function errorResponse(string $message = 'Terjadi kesalahan pada permintaan Anda', int $code = 400, mixed $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'status' => 'error',
            'code' => $code,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Respon Resource Tidak Ditemukan (HTTP 404 Not Found)
     *
     * @param string $message
     * @return JsonResponse
     */
    public function notFoundResponse(string $message = 'Data tidak ditemukan'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }

    /**
     * Respon Belum Terautentikasi (HTTP 401 Unauthorized)
     *
     * @param string $message
     * @return JsonResponse
     */
    public function unauthorizedResponse(string $message = 'Sesi Anda belum terautentikasi atau telah kedaluwarsa'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }

    /**
     * Respon Akses Ditolak / Tidak Memiliki Izin (HTTP 403 Forbidden)
     *
     * @param string $message
     * @return JsonResponse
     */
    public function forbiddenResponse(string $message = 'Anda tidak memiliki hak akses untuk tindakan ini'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }
}
