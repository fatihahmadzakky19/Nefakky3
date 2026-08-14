<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MidtransController extends Controller
{
    public function token(Request $request)
    {
        $orderId = $request->input('order_id', 'ORD-MOCK-' . time());
        $subtotal = (float) $request->input('subtotal', 0);
        $shippingCost = (float) $request->input('shipping_cost', 0);
        $discount = (float) $request->input('discount', 0);
        $customerName = $request->input('customer_name', 'Pelanggan Nefakky');
        $customerEmail = $request->input('customer_email', 'customer@nefakky.com');

        $grossAmount = max(1000, round($subtotal + $shippingCost - $discount));

        $serverKey = env('MIDTRANS_SERVER_KEY', 'Mid-server-Exgl2wTl6V1_om6_RMlFPpiS');

        // Call Midtrans Snap API Sandbox
        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->withHeaders(['Accept' => 'application/json', 'Content-Type' => 'application/json'])
                ->post('https://app.sandbox.midtrans.com/snap/v1/transactions', [
                    'transaction_details' => [
                        'order_id' => $orderId,
                        'gross_amount' => (int) $grossAmount,
                    ],
                    'customer_details' => [
                        'first_name' => $customerName,
                        'email' => $customerEmail,
                    ],
                    'credit_card' => [
                        'secure' => true,
                    ]
                ]);

            if ($response->successful() && isset($response->json()['token'])) {
                return response()->json([
                    'status' => 'success',
                    'token' => $response->json()['token'],
                    'redirect_url' => $response->json()['redirect_url'] ?? '',
                ]);
            }
        } catch (\Exception $e) {
            // Fallback for offline / sandbox mock token
        }

        // Fallback Mock Token for Simulator
        $mockToken = 'SNAP-MOCK-' . strtoupper(substr(md5($orderId . time()), 0, 16));
        return response()->json([
            'status' => 'success',
            'token' => $mockToken,
            'redirect_url' => "https://app.sandbox.midtrans.com/snap/v2/vtweb/" . $mockToken,
            'is_mock' => true,
        ]);
    }
}
