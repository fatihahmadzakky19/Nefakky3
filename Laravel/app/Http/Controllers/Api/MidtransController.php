<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Controller MidtransController
 * Mengelola Pembuatan Snap Token Pembayaran Midtrans dan Webhook Notifikasi Transaksi Pembayaran.
 */
class MidtransController extends Controller
{
    use ApiResponseTrait;

    /**
     * Membuat Snap Token pembayaran Midtrans secara online (dengan fallback ke simulator mock token)
     */
    public function token(Request $request): JsonResponse
    {
        $orderId = $request->input('order_id', 'ORD-MOCK-' . time());
        $subtotal = (float) $request->input('subtotal', 0);
        $shippingCost = (float) $request->input('shipping_cost', 0);
        $discount = (float) $request->input('discount', 0);
        $customerName = $request->input('customer_name', 'Pelanggan Nefakky');
        $customerEmail = $request->input('customer_email', 'customer@nefakky.com');
        $customerPhone = $request->input('phone', '081234567890');

        $grossAmount = max(1000, round($subtotal + $shippingCost - $discount));

        $serverKey = env('MIDTRANS_SERVER_KEY', 'Mid-server-Exgl2wTl6V1_om6_RMlFPpiS');

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json'
                ])
                ->timeout(5)
                ->post('https://app.sandbox.midtrans.com/snap/v1/transactions', [
                    'transaction_details' => [
                        'order_id' => $orderId,
                        'gross_amount' => (int) $grossAmount,
                    ],
                    'customer_details' => [
                        'first_name' => $customerName,
                        'email' => $customerEmail,
                        'phone' => $customerPhone,
                    ],
                    'credit_card' => [
                        'secure' => true,
                    ]
                ]);

            if ($response->successful() && isset($response->json()['token'])) {
                return $this->successResponse([
                    'token' => $response->json()['token'],
                    'redirect_url' => $response->json()['redirect_url'] ?? '',
                    'is_mock' => false,
                ], 'Snap token Midtrans berhasil dibuat');
            }
        } catch (\Exception $e) {
            Log::warning('Midtrans Snap API Offline / Connection timeout, using Mock Token fallback.');
        }

        // Fallback Mock Token untuk keperluan Demo / Simulator Offline
        $mockToken = 'SNAP-MOCK-' . strtoupper(substr(md5($orderId . time()), 0, 16));

        return $this->successResponse([
            'token' => $mockToken,
            'redirect_url' => "https://app.sandbox.midtrans.com/snap/v2/vtweb/" . $mockToken,
            'is_mock' => true,
        ], 'Mock Snap Token berhasil dibuat (Simulator Mode)');
    }

    /**
     * Webhook Handler Notifikasi Pembayaran dari Midtrans
     */
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;

        Log::info('Midtrans Webhook Received:', $payload);

        if (!$orderId) {
            return $this->errorResponse('Order ID tidak ditemukan dalam notifikasi', 400);
        }

        $order = Order::find($orderId);
        if (!$order) {
            return $this->notFoundResponse('Pesanan tidak ditemukan di database');
        }

        // Logika Status Pembayaran Midtrans
        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                $order->payment_badge = 'AWAITING';
            } else if ($fraudStatus == 'accept') {
                $order->markAsPaid();
            }
        } else if ($transactionStatus == 'settlement') {
            $order->markAsPaid();
        } else if ($transactionStatus == 'pending') {
            $order->payment_badge = 'AWAITING';
            $order->status = 'PENDING';
            $order->save();
        } else if (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
            $order->payment_badge = 'FAILED';
            $order->cancelOrder();
        }

        return $this->successResponse([
            'order_id' => $order->order_id,
            'payment_badge' => $order->payment_badge,
            'status' => $order->status,
        ], 'Status pembayaran pesanan berhasil disinkronisasi');
    }
}
