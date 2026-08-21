/**
 * ============================================================================
 * CLIENT LAYANAN REST API LARAVEL (laravelApi.ts)
 * ============================================================================
 * Menghubungkan Antarmuka Frontend (Next.js 14) ke Backend Laravel 12 API Engine.
 * Mendukung otentikasi Sanctum, dual database sync, Midtrans Snap, Haversine,
 * CRUD Produk, Pesanan 5-Tahap, Moderasi Ulasan, dan Laporan Finansial.
 * ============================================================================
 */

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';

// Helper token auth dari localStorage
export const getStoredAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nefakky_sanctum_token');
};

export const setStoredAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nefakky_sanctum_token', token);
  }
};

export const removeStoredAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nefakky_sanctum_token');
  }
};

// Helper headers dengan otentikasi Bearer Token Sanctum
const getAuthHeaders = (): HeadersInit => {
  const token = getStoredAuthToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export interface LaravelVoucher {
  id: string | number;
  voucher_id?: string;
  code: string;
  name: string;
  title?: string;
  description?: string;
  type: 'percent' | 'fixed';
  discount_percent?: number;
  discountPercent?: number;
  discount_value?: number;
  min_spend: number;
  minSpend?: number;
  max_discount?: number;
  used_count: number;
  usedCount?: number;
  total_limit: number;
  totalLimit?: number;
  redemptions?: string;
  expiry?: string;
  valid_days?: string;
  event?: string;
  status: 'Active' | 'Expired' | 'Disabled';
  is_active: boolean;
  isActive?: boolean;
  image_url?: string;
  imageUrl?: string;
}

export interface LaravelReview {
  id?: string | number;
  review_id?: string;
  product_id?: string;
  author_name: string;
  authorName?: string;
  author_email?: string;
  authorEmail?: string;
  author_badge?: string;
  avatar?: string;
  rating: number;
  date?: string;
  product_name?: string;
  productName?: string;
  product_image?: string;
  productImage?: string;
  comment: string;
  likes_count?: number;
  likesCount?: number;
  status?: string;
  is_pinned?: boolean;
  isPinned?: boolean;
  photos?: string[];
  replies?: Array<{
    id: string;
    authorName: string;
    comment: string;
    date: string;
  }>;
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

export interface LaravelProduct {
  id: string;
  item_id?: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  discount: number;
  final_price?: number;
  stock: number;
  visibility: boolean;
  status: 'Active' | 'Low Stock' | 'Inactive';
  portion_size?: string;
  rating: number;
  reviews_count?: number;
  reviewsCount?: number;
  sold_count?: string;
  soldCount?: string;
  image: string;
  gallery: string[];
  description: string;
  badge?: string;
  ingredients?: string;
  usage_advice?: string;
  usageAdvice?: string;
  origin?: string;
  calories?: string;
  fat?: string;
  sugar?: string;
  sat_fat?: string;
  satFat?: string;
  max_delivery_km?: number;
  maxDeliveryKm?: number;
  is_coming_soon?: boolean;
  isComingSoon?: boolean;
  release_date?: string;
  releaseDate?: string;
}

export interface LaravelOrder {
  id: string;
  order_id?: string;
  customer_name: string;
  customerName?: string;
  customer_email: string;
  customerEmail?: string;
  avatar?: string;
  address: string;
  phone?: string;
  item_count?: number;
  itemCount?: number;
  payment_method: string;
  paymentMethod?: string;
  payment_badge: string;
  paymentBadge?: string;
  delivery_type: string;
  deliveryType?: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  shippingCost?: number;
  discount: number;
  total: number;
  customer_confirmed?: boolean;
  customerConfirmed?: boolean;
  confirmed_at?: string;
  confirmedAt?: string;
  proof_photo?: string;
  proofPhoto?: string;
  payment_proof_photo?: string;
  paymentProofPhoto?: string;
  voucher_code?: string;
  voucherCode?: string;
  applied_promo?: string;
  appliedPromo?: string;
  items?: Array<{
    id?: number;
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  created_at?: string;
}

// =========================================================================
// 1. HEALTH CHECK & STATUS SERVER
// =========================================================================
export async function checkLaravelHealth() {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/health`);
    return await res.json();
  } catch (error) {
    console.error('Laravel Health Check Failed:', error);
    return { status: 'offline', error };
  }
}

// =========================================================================
// 2. MODUL PRODUK & KATALOG MENU (PRODUCTS API)
// =========================================================================
export async function fetchLaravelProducts(params?: { category?: string; search?: string; visibility?: boolean }): Promise<LaravelProduct[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'Semua') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.visibility !== undefined) query.append('visibility', String(params.visibility));

    const url = `${LARAVEL_API_URL}/products${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    return data.status === 'success' ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch products from Laravel:', error);
    return [];
  }
}

export async function createLaravelProduct(product: Partial<LaravelProduct>) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal membuat produk di Laravel.' };
  }
}

export async function updateLaravelProduct(id: string, updated: Partial<LaravelProduct>) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updated),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal memperbarui produk di Laravel.' };
  }
}

export async function deleteLaravelProduct(id: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal menghapus produk dari Laravel.' };
  }
}

export async function toggleLaravelProductVisibility(id: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/products/${id}/toggle-visibility`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal mengubah visibilitas produk.' };
  }
}

// =========================================================================
// 3. MODUL TRANSAKSI PESANAN (ORDERS API)
// =========================================================================
export async function fetchLaravelOrders(customerEmail?: string): Promise<LaravelOrder[]> {
  try {
    const url = customerEmail
      ? `${LARAVEL_API_URL}/orders?customer_email=${encodeURIComponent(customerEmail)}`
      : `${LARAVEL_API_URL}/orders`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.status === 'success' ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch orders from Laravel:', error);
    return [];
  }
}

export async function createLaravelOrder(orderData: any) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal membuat pesanan di Laravel.' };
  }
}

export async function advanceLaravelOrderStatus(orderId: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/orders/${orderId}/advance-stage`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal memajukan status pesanan.' };
  }
}

export async function confirmLaravelOrderReceived(orderId: string, proofPhoto?: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/orders/${orderId}/confirm`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ proof_photo: proofPhoto }),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal konfirmasi penerimaan pesanan.' };
  }
}

export async function cancelLaravelOrder(orderId: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal membatalkan pesanan.' };
  }
}

export async function fetchLaravelOrderStats() {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/orders/stats`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (error) {
    return { status: 'error', data: {} };
  }
}

// =========================================================================
// 4. MODUL VOUCHER & PROMO ENGINE (VOUCHERS API)
// =========================================================================
export async function fetchLaravelVouchers(): Promise<LaravelVoucher[]> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/vouchers`, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    return data.status === 'success' ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch vouchers from Laravel:', error);
    return [];
  }
}

export async function fetchAllLaravelVouchers(): Promise<LaravelVoucher[]> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/vouchers/all`, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.status === 'success' ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch all vouchers from Laravel:', error);
    return [];
  }
}

export async function validateLaravelVoucher(code: string, subtotal: number) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/vouchers/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal terhubung ke Laravel Voucher Engine.' };
  }
}

export async function toggleLaravelVoucherStatus(id: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/vouchers/${id}/toggle-status`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal mengubah status voucher.' };
  }
}

// =========================================================================
// 5. MODUL ULASAN & RATING (REVIEWS API)
// =========================================================================
export async function fetchLaravelReviews(productId?: string) {
  try {
    const url = productId
      ? `${LARAVEL_API_URL}/reviews?product_id=${productId}`
      : `${LARAVEL_API_URL}/reviews`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch reviews from Laravel:', error);
    return { status: 'error', data: [], average_rating: 5.0, total_reviews: 0 };
  }
}

export async function submitLaravelReview(review: Partial<LaravelReview>) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(review),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal menyimpan ulasan ke Laravel.' };
  }
}

export async function likeLaravelReview(reviewId: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reviews/${reviewId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal menyukai ulasan.' };
  }
}

export async function replyLaravelReview(reviewId: string, comment: string, authorName: string = 'Admin CS Nefakky') {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ comment, author_name: authorName }),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal mengirimkan balasan ulasan.' };
  }
}

export async function fetchLaravelReviewSummary() {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reviews/summary`);
    return await res.json();
  } catch (error) {
    return { status: 'error', data: {} };
  }
}

// =========================================================================
// 6. MODUL LAPORAN OMSET & FINANSIAL (SALES REPORTS API)
// =========================================================================
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

export async function fetchLaravelSalesReportsByYear(year: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reports/sales?year=${year}`);
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch sales reports for year ${year}:`, error);
    return { status: 'error', year, summary: {}, data: [] };
  }
}

export async function saveLaravelSalesReport(reportData: LaravelSalesReport) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/reports/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(reportData),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal menyimpan laporan omset ke Laravel.' };
  }
}

// =========================================================================
// 7. MODUL HAVERSINE JARAK & ESTIMASI ONGKIR (HAVERSINE API)
// =========================================================================
export async function calculateLaravelHaversineDistance(lat: number, lon: number) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/haversine/distance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ lat, lon }),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal menghitung jarak via Laravel Haversine Engine.' };
  }
}

// =========================================================================
// 8. MODUL MIDTRANS PAYMENT GATEWAY (MIDTRANS API)
// =========================================================================
export async function createLaravelMidtransToken(orderPayload: {
  order_id: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  customer_name: string;
  customer_email: string;
  phone?: string;
}) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/midtrans/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal membuat Snap token pembayaran Midtrans.' };
  }
}

// =========================================================================
// 9. MODUL LIVE CHAT CUSTOMER SUPPORT (CHATS API)
// =========================================================================
export async function fetchLaravelChats(userEmail?: string) {
  try {
    const url = userEmail
      ? `${LARAVEL_API_URL}/chats?user_email=${encodeURIComponent(userEmail)}`
      : `${LARAVEL_API_URL}/chats`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return await res.json();
  } catch (error) {
    return { status: 'error', data: [] };
  }
}

export async function sendLaravelChat(chatPayload: {
  user_email: string;
  user_name: string;
  text: string;
  sender: 'user' | 'admin';
  user_avatar?: string;
  media_url?: string;
  media_type?: string;
}) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(chatPayload),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal mengirim pesan chat ke Laravel.' };
  }
}

export async function markLaravelChatRead(userEmail: string, reader: 'admin' | 'user') {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/chats/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ user_email: userEmail, reader }),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal menandai chat terbaca.' };
  }
}

// =========================================================================
// 10. MODUL DASHBOARD ADMIN ANALYTICS (DASHBOARD API)
// =========================================================================
export async function fetchLaravelDashboardOverview() {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/dashboard/overview`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (error) {
    return { status: 'error', data: null };
  }
}

// =========================================================================
// 11. MODUL PENGATURAN TOKO (SETTINGS API)
// =========================================================================
export async function fetchLaravelStoreSettings() {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/settings`);
    return await res.json();
  } catch (error) {
    return { status: 'error', data: {} };
  }
}

export async function updateLaravelStoreSettings(settings: Record<string, any>) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/settings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ settings }),
    });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal memperbarui pengaturan toko.' };
  }
}

// =========================================================================
// 12. MODUL AUTENTIKASI PENGGUNA (AUTH SANCTUM API)
// =========================================================================
export async function loginLaravel(email: string, password: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.status === 'success' && data.data?.token) {
      setStoredAuthToken(data.data.token);
    }
    return data;
  } catch (error) {
    return { status: 'error', message: 'Gagal terhubung ke layanan login Laravel.' };
  }
}

export async function registerLaravel(userData: { name: string; email: string; password: string; phone?: string }) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (data.status === 'success' && data.data?.token) {
      setStoredAuthToken(data.data.token);
    }
    return data;
  } catch (error) {
    return { status: 'error', message: 'Gagal terhubung ke layanan pendaftaran Laravel.' };
  }
}

export async function fetchLaravelProfile() {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/auth/profile`, { headers: getAuthHeaders() });
    return await res.json();
  } catch (error) {
    return { status: 'error', message: 'Gagal mengambil profil akun.' };
  }
}

export async function logoutLaravel() {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    removeStoredAuthToken();
    return await res.json();
  } catch (error) {
    removeStoredAuthToken();
    return { status: 'success', message: 'Logout lokal berhasil.' };
  }
}
