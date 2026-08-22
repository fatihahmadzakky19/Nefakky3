import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, grossAmount, paymentType, bank, customerDetails, itemDetails } = body;

    const rawKey = process.env.MIDTRANS_SERVER_KEY || 'Mid-server-Exgl2wTl6V1_om6_RMlFPpiS';
    const serverKey = rawKey.trim();
    const authHeader = `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;

    const targetAmount = Math.round(grossAmount || 10000);
    const order_id = orderId || `NFK-${Math.floor(100000 + Math.random() * 900000)}`;

    let payload: any = {
      transaction_details: {
        order_id: order_id,
        gross_amount: targetAmount,
      },
      customer_details: {
        first_name: customerDetails?.name || 'Pelanggan Nefakky',
        email: customerDetails?.email || 'customer@nefakky.com',
        phone: customerDetails?.phone || '081234567890',
        billing_address: {
          first_name: customerDetails?.name || 'Pelanggan Nefakky',
          address: customerDetails?.address || 'Jakarta, Indonesia',
        },
        shipping_address: {
          first_name: customerDetails?.name || 'Pelanggan Nefakky',
          address: customerDetails?.address || 'Jakarta, Indonesia',
        }
      }
    };

    // Format per payment type
    if (paymentType === 'va' || paymentType === 'bank_transfer') {
      payload.payment_type = 'bank_transfer';
      payload.bank_transfer = {
        bank: (bank || 'bca').toLowerCase()
      };
    } else if (paymentType === 'qris') {
      payload.payment_type = 'qris';
      payload.qris = {
        acquirer: 'gopay'
      };
    } else if (paymentType === 'ewallet' || paymentType === 'gopay') {
      payload.payment_type = 'gopay';
      payload.gopay = {
        enable_callback: true,
        callback_url: 'http://localhost:3000/notifications'
      };
    } else if (paymentType === 'shopeepay') {
      payload.payment_type = 'shopeepay';
      payload.shopeepay = {
        callback_url: 'http://localhost:3000/notifications'
      };
    } else {
      // Default fallback to BCA VA
      payload.payment_type = 'bank_transfer';
      payload.bank_transfer = {
        bank: 'bca'
      };
    }

    const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok && data.status_code !== '201' && data.status_code !== '200') {
      console.error('Midtrans Charge API Error:', data);
      return NextResponse.json({ 
        error: data.status_message || 'Gagal membuat transaksi Midtrans charge' 
      }, { status: response.status || 400 });
    }

    // Extract simulator URL & VA code
    let vaNumber = '';
    let simulatorUrl = 'https://simulator.sandbox.midtrans.com/';

    if (data.va_numbers && data.va_numbers.length > 0) {
      vaNumber = data.va_numbers[0].va_number;
      const b = data.va_numbers[0].bank;
      if (b === 'bca') simulatorUrl = 'https://simulator.sandbox.midtrans.com/bca/va/index';
      else if (b === 'bni') simulatorUrl = 'https://simulator.sandbox.midtrans.com/bni/va/index';
      else if (b === 'bri') simulatorUrl = 'https://simulator.sandbox.midtrans.com/bri/va/index';
      else if (b === 'permata') simulatorUrl = 'https://simulator.sandbox.midtrans.com/permata/va/index';
    } else if (data.bill_key && data.biller_code) {
      vaNumber = `${data.biller_code} - ${data.bill_key}`;
      simulatorUrl = 'https://simulator.sandbox.midtrans.com/mandiri/bill/index';
    } else if (data.permata_va_number) {
      vaNumber = data.permata_va_number;
      simulatorUrl = 'https://simulator.sandbox.midtrans.com/permata/va/index';
    } else if (data.payment_type === 'qris') {
      vaNumber = data.qr_string || data.order_id;
      simulatorUrl = 'https://simulator.sandbox.midtrans.com/qris/index';
    } else if (data.payment_type === 'gopay') {
      vaNumber = data.order_id;
      simulatorUrl = 'https://simulator.sandbox.midtrans.com/gopay/partner/index';
    }

    return NextResponse.json({
      success: true,
      orderId: data.order_id || order_id,
      transactionId: data.transaction_id,
      grossAmount: data.gross_amount || targetAmount,
      paymentType: data.payment_type,
      transactionStatus: data.transaction_status || 'pending',
      vaNumber: vaNumber || order_id,
      simulatorUrl: simulatorUrl,
      qrString: data.qr_string,
      qrUrl: data.actions?.find((a: any) => a.name === 'generate-qr-code')?.url,
      raw: data
    });
  } catch (error: any) {
    console.error('Midtrans Charge Server Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
