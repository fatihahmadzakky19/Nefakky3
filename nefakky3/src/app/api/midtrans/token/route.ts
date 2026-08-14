import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, grossAmount, customerDetails, itemDetails } = body;

    const rawKey = process.env.MIDTRANS_SERVER_KEY || 'Mid-server-Exgl2wTl6V1_om6_RMlFPpiS';
    const serverKey = rawKey.trim();
    const authHeader = `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;

    // Format item details and balance sum with gross_amount
    const targetAmount = Math.round(grossAmount || 10000);
    const formattedItemDetails = (itemDetails || []).map((item: any) => ({
      id: (item.id || 'item-1').toString().substring(0, 50),
      price: Math.round(item.price || 0),
      quantity: Math.max(1, item.quantity || 1),
      name: (item.name || 'Produk Nefakky').substring(0, 50)
    }));

    const itemsSum = formattedItemDetails.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0);
    const diff = targetAmount - itemsSum;
    if (diff !== 0) {
      formattedItemDetails.push({
        id: 'fee-adj',
        price: diff,
        quantity: 1,
        name: diff > 0 ? 'Biaya Pengiriman & Layanan' : 'Potongan Diskon'
      });
    }

    const payload = {
      transaction_details: {
        order_id: orderId || `NFK-${Date.now()}`,
        gross_amount: targetAmount,
      },
      customer_details: {
        first_name: customerDetails?.name || 'Pelanggan',
        email: customerDetails?.email || 'customer@nefakky.com',
        phone: customerDetails?.phone || '081234567890',
        billing_address: {
          first_name: customerDetails?.name || 'Pelanggan',
          address: customerDetails?.address || 'Jakarta, Indonesia',
        },
        shipping_address: {
          first_name: customerDetails?.name || 'Pelanggan',
          address: customerDetails?.address || 'Jakarta, Indonesia',
        }
      },
      item_details: formattedItemDetails,
      credit_card: {
        secure: true
      }
    };

    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Midtrans API Error:', data);
      return NextResponse.json({ error: data.error_messages ? data.error_messages.join(', ') : 'Gagal membuat transaksi Midtrans' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Midtrans Server Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
