/**
 * Laravel API Microservice Client for Nefakky Marketplace
 * Connects Frontend (Next.js) to Backend 2 (Laravel API on port 8001)
 */

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8001/api';

export interface LaravelVoucher {
  id: number;
  code: string;
  title: string;
  description: string;
  type: 'percent' | 'fixed';
  discount_value: number;
  min_spend: number;
  max_discount?: number;
  quota: number;
  used_count: number;
  is_active: boolean;
}

export interface LaravelReview {
  id?: number;
  product_id: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  comment: string;
  image_url?: string;
  created_at?: string;
}

export interface LaravelSalesReport {
  month_year: string;
  gross_revenue: number;
  net_profit: number;
  total_orders: number;
  event_tag?: string;
}

// 1. Health Check
export async function checkLaravelHealth() {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/health`);
    return await res.json();
  } catch (error) {
    console.error('Laravel Health Check Failed:', error);
    return { status: 'offline', error };
  }
}

// 2. Fetch Active Vouchers from Laravel
export async function fetchLaravelVouchers(): Promise<LaravelVoucher[]> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/vouchers`);
    const data = await res.json();
    return data.status === 'success' ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch vouchers from Laravel:', error);
    return [];
  }
}

// 3. Validate Voucher Code via Laravel Engine
export async function validateLaravelVoucher(code: string, subtotal: number) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/vouchers/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal terhubung ke Laravel Voucher Engine.' };
  }
}

// 4. Fetch Reviews from Laravel
export async function fetchLaravelReviews(productId?: string) {
  try {
    const url = productId
      ? `${LARAVEL_API_URL}/reviews?product_id=${productId}`
      : `${LARAVEL_API_URL}/reviews`;
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch reviews from Laravel:', error);
    return { status: 'error', data: [], average_rating: 5.0, total_reviews: 0 };
  }
}

// 5. Submit Review to Laravel
export async function submitLaravelReview(review: LaravelReview) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal menyimpan ulasan ke Laravel.' };
  }
}

// 6. Fetch Sales Reports from Laravel Analytics
export async function fetchLaravelSalesReports() {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reports/sales`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch sales reports from Laravel:', error);
    return { status: 'error', summary: {}, data: [] };
  }
}
