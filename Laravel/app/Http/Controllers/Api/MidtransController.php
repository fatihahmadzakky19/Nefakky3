<?php

// Namespace penempat controller dalam struktur folder Laravel API
namespace App\Http\Controllers\Api;

// Mengimpor controller induk dari Laravel
use App\Http\Controllers\Controller;
// Mengimpor Request dari Laravel untuk membaca data input HTTP
use Illuminate\Http\Request;
// Mengimpor Facade Http dari Laravel untuk mengirim request API eksternal (ke Midtrans Snap API)
use Illuminate\Support\Facades\Http;

// Class Controller untuk membuat Token Transaksi Pembayaran via Midtrans Snap Gateway
class MidtransController extends Controller
{
    /**
     * Membuat Snap Token pembayaran Midtrans secara online (dengan fallback ke simulator token jika offline)
     */
    public function token(Request $request)
    {
        // Ambil ID pesanan dari request atau generate ID default jika tidak ada
        $orderId = $request->input('order_id', 'ORD-MOCK-' . time());
        // Ambil subtotal dari request dan ubah ke tipe float
        $subtotal = (float) $request->input('subtotal', 0);
        // Ambil biaya pengiriman dari request dan ubah ke tipe float
        $shippingCost = (float) $request->input('shipping_cost', 0);
        // Ambil nominal diskon dari request dan ubah ke tipe float
        $discount = (float) $request->input('discount', 0);
        // Ambil nama pelanggan dari request (default: Pelanggan Nefakky)
        $customerName = $request->input('customer_name', 'Pelanggan Nefakky');
        // Ambil email pelanggan dari request (default: customer@nefakky.com)
        $customerEmail = $request->input('customer_email', 'customer@nefakky.com');

        // Hitung total harga transaksi (minimal Rp 1.000 untuk transaksi Midtrans Snap)
        $grossAmount = max(1000, round($subtotal + $shippingCost - $discount));

        // Ambil kunci server Midtrans dari env atau gunakan kunci Sandbox default
        $serverKey = env('MIDTRANS_SERVER_KEY', 'Mid-server-Exgl2wTl6V1_om6_RMlFPpiS');

        // Memanggil API Midtrans Snap Sandbox menggunakan HTTP Basic Auth
        try {
            // Mengirim request HTTP POST ke endpoint Midtrans Sandbox Transactions API
            $response = Http::withBasicAuth($serverKey, '')
                ->withHeaders(['Accept' => 'application/json', 'Content-Type' => 'application/json'])
                ->post('https://app.sandbox.midtrans.com/snap/v1/transactions', [
                    'transaction_details' => [
                        'order_id' => $orderId, // Nomor unik transaksi pesanan
                        'gross_amount' => (int) $grossAmount, // Total pembayaran kotor dalam Rupiah
                    ],
                    'customer_details' => [
                        'first_name' => $customerName, // Nama depan pembeli
                        'email' => $customerEmail, // Alamat email pembeli
                    ],
                    'credit_card' => [
                        'secure' => true, // Mengaktifkan 3D Secure untuk keamanan pembayaran
                    ]
                ]);

            // Jika API Midtrans berhasil merespon dan memberikan token
            if ($response->successful() && isset($response->json()['token'])) {
                // Kembalikan token asli dan URL redirect pembayaran Midtrans
                return response()->json([
                    'status' => 'success',
                    'token' => $response->json()['token'],
                    'redirect_url' => $response->json()['redirect_url'] ?? '',
                ]);
            }
        } catch (\Exception $e) {
            // Jika terjadi kesalahan koneksi jaringan atau API offline, masuk ke blok fallback
        }

        // Fallback Mock Token untuk keperluan Simulator Offline / Demo
        $mockToken = 'SNAP-MOCK-' . strtoupper(substr(md5($orderId . time()), 0, 16));
        // Mengembalikan token tiruan (mock) agar alur checkout frontend tetap bisa diuji
        return response()->json([
            'status' => 'success',
            'token' => $mockToken,
            'redirect_url' => "https://app.sandbox.midtrans.com/snap/v2/vtweb/" . $mockToken,
            'is_mock' => true, // Menandakan bahwa ini adalah mock token
        ]);
    }
}

