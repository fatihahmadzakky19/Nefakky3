/**
 * Client Layanan API Laravel untuk Nefakky Marketplace
 * Menghubungkan Antarmuka Frontend (Next.js) ke Backend Laravel API (Port 8000)
 */

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';

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
  id?: number;
  year?: string;
  month_year: string;
  gross_revenue: number;
  net_profit: number;
  total_orders: number;
  event_tag?: string;
  is_bazar?: boolean;
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

// 2. Fetch Vouchers
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

// 3. Validate Voucher
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

// 4. Fetch Reviews
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

// 5. Submit Review
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

// 6. Fetch Sales Report Available Years
export async function fetchLaravelSalesYears(): Promise<string[]> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reports/sales/years`);
    const data = await res.json();
    return data.status === 'success' ? data.years : [new Date().getFullYear().toString()];
  } catch (error) {
    console.error('Failed to fetch sales years from Laravel:', error);
    return [new Date().getFullYear().toString()];
  }
}

// 7. Fetch Sales Reports By Specific Year
export async function fetchLaravelSalesReportsByYear(year: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reports/sales?year=${year}`);
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch sales reports for year ${year}:`, error);
    return { status: 'error', year, summary: {}, data: [] };
  }
}

// 8. Save Sales Report Item
export async function saveLaravelSalesReport(reportData: LaravelSalesReport) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reports/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal menyimpan laporan omset ke Laravel.' };
  }
}
