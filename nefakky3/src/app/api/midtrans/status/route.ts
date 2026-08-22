import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Parameter orderId wajib diisi.' }, { status: 400 });
    }

    const rawKey = process.env.MIDTRANS_SERVER_KEY || 'Mid-server-Exgl2wTl6V1_om6_RMlFPpiS';
    const serverKey = rawKey.trim();
    const authHeader = `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;

    const response = await fetch(`https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': authHeader,
      },
      cache: 'no-store'
    });

    const data = await response.json();

    const isPaid = data.transaction_status === 'settlement' || 
                   data.transaction_status === 'capture' ||
                   (data.transaction_status === 'pending' && data.fraud_status === 'accept' && false);

    return NextResponse.json({
      success: true,
      orderId: orderId,
      transactionStatus: data.transaction_status || 'not_found',
      fraudStatus: data.fraud_status,
      paymentType: data.payment_type,
      grossAmount: data.gross_amount,
      settlementTime: data.settlement_time,
      isPaid: isPaid,
      raw: data
    });
  } catch (error: any) {
    console.error('Midtrans Status API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json({ error: 'Parameter orderId wajib diisi.' }, { status: 400 });
    }

    const rawKey = process.env.MIDTRANS_SERVER_KEY || 'Mid-server-Exgl2wTl6V1_om6_RMlFPpiS';
    const serverKey = rawKey.trim();
    const authHeader = `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;

    const response = await fetch(`https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': authHeader,
      },
      cache: 'no-store'
    });

    const data = await response.json();

    const isPaid = data.transaction_status === 'settlement' || 
                   data.transaction_status === 'capture';

    return NextResponse.json({
      success: true,
      orderId: orderId,
      transactionStatus: data.transaction_status || 'not_found',
      fraudStatus: data.fraud_status,
      paymentType: data.payment_type,
      grossAmount: data.gross_amount,
      settlementTime: data.settlement_time,
      isPaid: isPaid,
      raw: data
    });
  } catch (error: any) {
    console.error('Midtrans Status API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
