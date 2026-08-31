<?php

// -----------------------------------------------------------------------------
// NAMESPACE: Mengelompokkan Trait ke dalam direktori Traits aplikasi.
// Konsep PBO: Manajemen komponen pembantu (helpers & mixins).
// -----------------------------------------------------------------------------
namespace App\Traits;

// -----------------------------------------------------------------------------
// IMPORT DEPENDENCY: Mengimpor tipe respon JSON dan antarmuka paginator Laravel.
// Konsep PBO: Pola Abstraksi Format Data HTTP.
// -----------------------------------------------------------------------------
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * =============================================================================
 * TRAIT: ApiResponseTrait (Pemrograman Berorientasi Objek / PBO)
 * =============================================================================
 * Trait ini berfungsi sebagai 'Mixin' / Komposisi Objek untuk menyediakan
 * metode standardisasi seluruh struktur respon JSON REST API Nefakky.
 *
 * Konsep PBO yang Diterapkan:
 * 1. COMPOSITION   : Menggunakan 'use ApiResponseTrait' pada Controller tanpa
 *                    harus membuat pewarisan multilevel yang rumit.
 * 2. ENKAPSULASI   : Mengamankan dan menyeragamkan format payload JSON API.
 * 3. ABSTRAKSI     : Menyembunyikan pembuatan format array & header HTTP status.
 * =============================================================================
 */
trait ApiResponseTrait
{
    /**
     * =========================================================================
     * METODE PBO: successResponse()
     * =========================================================================
     * Menghasilkan struktur respon sukses standar (HTTP 200 OK).
     *
     * @param mixed $data Payload data utama yang dikirim ke antarmuka
     * @param string $message Pesan status informatif
     * @param int $code HTTP Status Code (Default: 200)
     * @param array|null $meta Metadata tambahan (paginasi, summary, dll)
     * @return JsonResponse
     */
    public function successResponse(mixed $data = null, string $message = 'Operasi berhasil diproses', int $code = 200, ?array $meta = null): JsonResponse
    {
        // 1. Bangun struktur array respon standar
        $response = [
            'success' => true,      // Status boolean keberhasilan
            'status'  => 'success', // Label status teks
            'code'    => $code,     // HTTP status code integer
            'message' => $message,  // Pesan informatif untuk user
            'data'    => $data,     // Objek / Array data payload
        ];

        // 2. Tambahkan informasi metadata jika tersedia
        if ($meta !== null) {
            $response['meta'] = $meta;
        }

        // 3. Konversi array menjadi objek JsonResponse dengan status code yang tepat
        return response()->json($response, $code);
    }

    /**
     * =========================================================================
     * METODE PBO: paginatedResponse()
     * =========================================================================
     * Menghasilkan struktur respon sukses khusus untuk data berpaginasi.
     *
     * @param LengthAwarePaginator $paginator Objek paginasi Eloquent ORM
     * @param string $message Pesan status
     * @return JsonResponse
     */
    public function paginatedResponse(LengthAwarePaginator $paginator, string $message = 'Data berhasil diambil'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'status'  => 'success',
            'code'    => 200,
            'message' => $message,
            'data'    => $paginator->items(), // Daftar item pada halaman saat ini
            'meta'    => [
                'current_page' => $paginator->currentPage(), // Nomor halaman saat ini
                'per_page'     => $paginator->perPage(),     // Jumlah item per halaman
                'total'        => $paginator->total(),       // Total keseluruhan data di database
                'last_page'    => $paginator->lastPage(),    // Nomor halaman terakhir
                'has_more'     => $paginator->hasMorePages(),// Apakah ada halaman selanjutnya
            ]
        ], 200);
    }

    /**
     * =========================================================================
     * METODE PBO: createdResponse()
     * =========================================================================
     * Menghasilkan respon sukses pembuatan resource data baru (HTTP 201 Created).
     *
     * @param mixed $data Objek data yang baru berhasil dibuat
     * @param string $message Pesan sukses
     * @return JsonResponse
     */
    public function createdResponse(mixed $data, string $message = 'Data berhasil dibuat'): JsonResponse
    {
        // Memanfaatkan kembali metode successResponse dengan kode HTTP 201
        return $this->successResponse($data, $message, 201);
    }

    /**
     * =========================================================================
     * METODE PBO: errorResponse()
     * =========================================================================
     * Menghasilkan struktur respon gagal/kesalahan terstandarisasi.
     *
     * @param string $message Deskripsi kesalahan
     * @param int $code HTTP Status Code (Default: 400 Bad Request)
     * @param mixed $errors Rincian detail error atau kegagalan validasi
     * @return JsonResponse
     */
    public function errorResponse(string $message = 'Terjadi kesalahan pada permintaan Anda', int $code = 400, mixed $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'status'  => 'error',
            'code'    => $code,
            'message' => $message,
        ];

        // Lampirkan rincian validasi error jika ada
        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * =========================================================================
     * METODE PBO: notFoundResponse()
     * =========================================================================
     * Menghasilkan respon saat resource tidak ditemukan di sistem (HTTP 404).
     *
     * @param string $message
     * @return JsonResponse
     */
    public function notFoundResponse(string $message = 'Data tidak ditemukan'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }

    /**
     * =========================================================================
     * METODE PBO: unauthorizedResponse()
     * =========================================================================
     * Menghasilkan respon saat pengguna belum login / Bearer token invalid (HTTP 401).
     *
     * @param string $message
     * @return JsonResponse
     */
    public function unauthorizedResponse(string $message = 'Sesi Anda belum terautentikasi atau telah kedaluwarsa'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }

    /**
     * =========================================================================
     * METODE PBO: forbiddenResponse()
     * =========================================================================
     * Menghasilkan respon saat hak akses ditolak / bukan Admin (HTTP 403 Forbidden).
     *
     * @param string $message
     * @return JsonResponse
     */
    public function forbiddenResponse(string $message = 'Anda tidak memiliki hak akses untuk tindakan ini'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }
}

