<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\AddressRequest;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserAddress;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Controller AuthController
 * Mengelola Autentikasi Pengguna (Login, Register, Logout, Profil, Ganti Password, dan Multi-Alamat).
 */
class AuthController extends Controller
{
    use ApiResponseTrait;

    /**
     * Autentikasi Pengguna & Penerbitan Token Sanctum
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::with('addresses')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->errorResponse('Email atau kata sandi yang Anda masukkan salah.', 401);
        }

        // Buat token akses baru
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
            'role' => $user->role,
        ], 'Login berhasil. Selamat datang kembali!');
    }

    /**
     * Registrasi Akun Pelanggan Baru
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => 'customer',
            'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($request->name) . '&background=5C3D28&color=ffffff',
            'password' => $request->password,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->createdResponse([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user->load('addresses')),
            'role' => $user->role,
        ], 'Pendaftaran akun berhasil!');
    }

    /**
     * Mengambil Data Profil Akun yang Sedang Login
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('addresses');
        return $this->successResponse(new UserResource($user), 'Profil pengguna berhasil diambil');
    }

    /**
     * Memperbarui Data Profil Pengguna
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return $this->successResponse(new UserResource($user->load('addresses')), 'Profil Anda berhasil diperbarui');
    }

    /**
     * Mengganti Kata Sandi Akun
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!Hash::check($request->old_password, $user->password)) {
            return $this->errorResponse('Kata sandi lama tidak sesuai.', 422);
        }

        $user->password = $request->new_password;
        $user->save();

        return $this->successResponse(null, 'Kata sandi berhasil diubah!');
    }

    /**
     * Logout & Revokasi Token Akses
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return $this->successResponse(null, 'Logout berhasil. Sesi Anda telah diakhiri.');
    }

    // =========================================================================
    // MANAJEMEN MULTI-ALAMAT PENGGIRIMAN
    // =========================================================================

    /**
     * Menampilkan daftar alamat pengiriman pengguna
     */
    public function listAddresses(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->orderBy('is_default', 'desc')->get();
        return $this->successResponse($addresses, 'Daftar alamat berhasil diambil');
    }

    /**
     * Menambah alamat pengiriman baru
     */
    public function storeAddress(AddressRequest $request): JsonResponse
    {
        $user = $request->user();
        $isFirst = $user->addresses()->count() === 0;

        $data = $request->validated();
        if ($isFirst || !empty($data['is_default'])) {
            // Jika diset default, non-aktifkan default alamat lain
            $user->addresses()->update(['is_default' => false]);
            $data['is_default'] = true;
        }

        $address = $user->addresses()->create($data);

        return $this->createdResponse($address, 'Alamat pengiriman berhasil ditambahkan');
    }

    /**
     * Memperbarui alamat pengiriman
     */
    public function updateAddress(AddressRequest $request, $id): JsonResponse
    {
        $user = $request->user();
        $address = $user->addresses()->find($id);

        if (!$address) {
            return $this->notFoundResponse('Alamat pengiriman tidak ditemukan');
        }

        $data = $request->validated();
        if (!empty($data['is_default']) && $data['is_default']) {
            $user->addresses()->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $address->update($data);

        return $this->successResponse($address, 'Alamat pengiriman berhasil diperbarui');
    }

    /**
     * Menjadikan alamat sebagai alamat utama (default)
     */
    public function setDefaultAddress(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $address = $user->addresses()->find($id);

        if (!$address) {
            return $this->notFoundResponse('Alamat tidak ditemukan');
        }

        $user->addresses()->update(['is_default' => false]);
        $address->is_default = true;
        $address->save();

        return $this->successResponse($address, 'Alamat utama berhasil diubah');
    }

    /**
     * Menghapus alamat pengiriman
     */
    public function deleteAddress(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $address = $user->addresses()->find($id);

        if (!$address) {
            return $this->notFoundResponse('Alamat tidak ditemukan');
        }

        $address->delete();

        return $this->successResponse(null, 'Alamat berhasil dihapus');
    }
}
