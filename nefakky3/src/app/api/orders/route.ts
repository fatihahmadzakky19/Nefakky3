import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  userId?: string;
  avatar: string;
  address: string;
  phone: string;
  items: OrderItem[];
  itemCount: number;
  paymentMethod: string;
  paymentBadge: 'PAID' | 'AWAITING' | 'REFUNDED' | 'FAILED' | 'CANCELLED' | string;
  deliveryType: string;
  distance?: string;
  status: 'RECEIVED' | 'COOKING' | 'READY' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED' | 'PENDING' | 'PREPARING' | 'SHIPPING' | 'EXPIRED' | 'ON_DELIVERY' | 'DELIVERED' | string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  date: string;
  createdAt?: number;
  updatedAt?: number;
  voucherCode?: string;
  appliedPromo?: string;
  customerConfirmed?: boolean;
  confirmedAt?: string;
  proofPhoto?: string;
  proofPhotoUrl?: string;
  paymentProofPhoto?: string;
  paymentProofPhotoUrl?: string;
  notes?: string;
  cancellationReason?: string;
  lateBonusGranted?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
}

const DEFAULT_ORDERS: AdminOrder[] = [
  {
    id: 'ORD-88219',
    customerName: 'Nizar Azzuhra',
    customerEmail: 'nizarazzuhra@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Nizar+Azzuhra&background=FF5400&color=ffffff',
    address: 'Jl. Kebon Jeruk No. 12, Jakarta Barat',
    phone: '081234567890',
    items: [
      { id: 'm1', name: 'Ayam Bakar', price: 35000, quantity: 2, image: '/images/ayam_bakar.jpg' },
      { id: 'm6', name: 'Jus (Jambu, Sirsak, Mangga)', price: 15000, quantity: 2, image: '/images/jus_mangga.jpg' }
    ],
    itemCount: 4,
    paymentMethod: 'QRIS / GoPay',
    paymentBadge: 'PAID',
    deliveryType: 'KURIR NEFAKKY',
    status: 'DELIVERING',
    subtotal: 100000,
    shippingCost: 12000,
    discount: 10000,
    total: 102000,
    date: 'Jumat, 11 Sep 2026 • 05:15:00 WIB',
    createdAt: 1789125300000,
    customerConfirmed: false
  },
  {
    id: 'ORD-88218',
    customerName: 'Siti Rahmawati',
    customerEmail: 'siti@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Siti+Rahma&background=10B981&color=ffffff',
    address: 'Jl. Sudirman No. 105, Jakarta Selatan',
    phone: '089876543210',
    items: [
      { id: 'm1', name: 'Ayam Bakar', price: 35000, quantity: 3, image: '/images/ayam_bakar.jpg' },
      { id: 'm2', name: 'Nasi Bakar', price: 28000, quantity: 2, image: '/images/nasi_bakar.jpg' }
    ],
    itemCount: 5,
    paymentMethod: 'Midtrans Credit Card',
    paymentBadge: 'PAID',
    deliveryType: 'KURIR NEFAKKY',
    status: 'COMPLETED',
    subtotal: 161000,
    shippingCost: 15000,
    discount: 15000,
    total: 161000,
    date: 'Kamis, 10 Sep 2026 • 19:30:00 WIB',
    createdAt: 1789089000000,
    customerConfirmed: true,
    confirmedAt: 'Kamis, 10 Sep 2026 • 20:15:00 WIB'
  },
  {
    id: 'ORD-88217',
    customerName: 'Budi Santoso',
    customerEmail: 'budi@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=8B5CF6&color=ffffff',
    address: 'Gedung Cyber 2 Lt. 5, Kuningan, Jakarta',
    phone: '085512344321',
    items: [
      { id: 'm4', name: 'Gudeg', price: 32000, quantity: 2, image: '/images/gudeg.jpg' },
      { id: 'm6', name: 'Jus (Jambu, Sirsak, Mangga)', price: 15000, quantity: 2, image: '/images/jus_mangga.jpg' }
    ],
    itemCount: 4,
    paymentMethod: 'Transfer Bank BCA',
    paymentBadge: 'PAID',
    deliveryType: 'KURIR NEFAKKY',
    status: 'COOKING',
    subtotal: 94000,
    shippingCost: 10000,
    discount: 0,
    total: 104000,
    date: 'Selasa, 8 Sep 2026 • 13:10:00 WIB',
    createdAt: 1788894600000,
    customerConfirmed: false
  },
  {
    id: 'ORD-88216',
    customerName: 'Dewi Lestari',
    customerEmail: 'dewi@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Dewi+Lestari&background=EC4899&color=ffffff',
    address: 'Jl. Gatot Subroto Kav 22, Jakarta',
    phone: '087788990011',
    items: [
      { id: 'm1', name: 'Ayam Bakar', price: 35000, quantity: 1, image: '/images/ayam_bakar.jpg' },
      { id: 'm3', name: 'Krecek', price: 22000, quantity: 1, image: '/images/krecek.jpg' }
    ],
    itemCount: 2,
    paymentMethod: 'ShopeePay',
    paymentBadge: 'PAID',
    deliveryType: 'KURIR NEFAKKY',
    status: 'READY',
    subtotal: 57000,
    shippingCost: 10000,
    discount: 5000,
    total: 62000,
    date: 'Jumat, 4 Sep 2026 • 14:20:00 WIB',
    createdAt: 1788549600000,
    customerConfirmed: false
  },
  {
    id: 'ORD-88215',
    customerName: 'Rian Pratama',
    customerEmail: 'rian@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Rian+Pratama&background=3B82F6&color=ffffff',
    address: 'Apartemen Taman Rasuna Tower 8, Jakarta',
    phone: '081399887766',
    items: [
      { id: 'm5', name: 'Garang Asam Ayam Kampung', price: 38000, quantity: 1, image: '/images/garang_asam.jpg' }
    ],
    itemCount: 1,
    paymentMethod: 'COD (Bayar di Tempat)',
    paymentBadge: 'AWAITING',
    deliveryType: 'STANDARD',
    status: 'COMPLETED',
    subtotal: 38000,
    shippingCost: 10000,
    discount: 0,
    total: 48000,
    date: 'Senin, 24 Agu 2026 • 11:00:00 WIB',
    createdAt: 1787572800000,
    customerConfirmed: true
  },
  {
    id: 'ORD-88214',
    customerName: 'Ahmad Fauzi',
    customerEmail: 'ahmad@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Ahmad+Fauzi&background=10B981&color=ffffff',
    address: 'Jl. Pemuda No. 45, Rawamangun, Jakarta',
    phone: '081298765432',
    items: [
      { id: 'm1', name: 'Ayam Bakar', price: 35000, quantity: 1, image: '/images/ayam_bakar.jpg' }
    ],
    itemCount: 1,
    paymentMethod: 'COD (Bayar di Tempat)',
    paymentBadge: 'AWAITING',
    deliveryType: 'STANDARD',
    status: 'RECEIVED',
    subtotal: 35000,
    shippingCost: 10000,
    discount: 0,
    total: 45000,
    date: 'Sabtu, 15 Agu 2026 • 13:30:00 WIB',
    createdAt: 1786793400000,
    customerConfirmed: false
  }
];

const ORDERS_STORE_FILE = path.join(process.cwd(), '.orders_store.json');
let inMemoryOrders: AdminOrder[] | null = null;

function loadOrdersStore(): AdminOrder[] {
  if (inMemoryOrders !== null) return inMemoryOrders;

  try {
    if (fs.existsSync(ORDERS_STORE_FILE)) {
      const content = fs.readFileSync(ORDERS_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryOrders = parsed;
        return inMemoryOrders;
      }
    }
  } catch (err) {
    console.warn('[API /api/orders] Gagal membaca .orders_store.json:', err);
  }

  inMemoryOrders = [...DEFAULT_ORDERS];
  saveOrdersStore(inMemoryOrders);
  return inMemoryOrders;
}

function saveOrdersStore(orders: AdminOrder[]) {
  inMemoryOrders = orders;
  try {
    fs.writeFileSync(ORDERS_STORE_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[API /api/orders] Gagal menyimpan .orders_store.json:', err);
  }
}

export async function GET() {
  const orders = loadOrdersStore();
  return NextResponse.json({ success: true, orders }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, order, orders, orderId, status, updates, proofPhoto, proofPhotoUrl, paymentProofPhoto, paymentProofPhotoUrl, reason } = body || {};
    let current = loadOrdersStore();

    if ((action === 'create' || action === 'add') && order) {
      const now = Date.now();
      const newOrder: AdminOrder = {
        ...order,
        id: String(order.id || order.orderId || `NFK-${Math.floor(100000 + Math.random() * 900000)}`),
        createdAt: typeof order.createdAt === 'number' && order.createdAt > 0 ? order.createdAt : now,
        updatedAt: typeof order.updatedAt === 'number' && order.updatedAt > 0 ? order.updatedAt : now
      };

      // Filter existing by ID if any, put new order at top
      current = [newOrder, ...current.filter(o => o.id !== newOrder.id)];
      saveOrdersStore(current);
      return NextResponse.json({ success: true, order: newOrder, orders: current });
    }

    if (action === 'update_status' && orderId) {
      const now = Date.now();
      current = current.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            ...(updates || {}),
            status: status || updates?.status || o.status,
            updatedAt: now
          };
        }
        return o;
      });
      saveOrdersStore(current);
      return NextResponse.json({ success: true, orders: current });
    }

    if (action === 'proof_photo' && orderId) {
      const activePhoto = proofPhoto || proofPhotoUrl;
      const activePaymentPhoto = paymentProofPhoto || paymentProofPhotoUrl;
      current = current.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            ...(activePhoto ? { proofPhoto: activePhoto, proofPhotoUrl: activePhoto } : {}),
            ...(activePaymentPhoto ? { paymentProofPhoto: activePaymentPhoto, paymentProofPhotoUrl: activePaymentPhoto } : {}),
            updatedAt: Date.now()
          };
        }
        return o;
      });
      saveOrdersStore(current);
      return NextResponse.json({ success: true, orders: current });
    }

    if (action === 'delete' && orderId) {
      current = current.filter(o => o.id !== orderId);
      saveOrdersStore(current);
      return NextResponse.json({ success: true, orders: current });
    }

    if (action === 'cancel' && orderId) {
      current = current.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'CANCELLED' as const,
            cancellationReason: reason || 'Dibatalkan oleh pembeli / admin',
            updatedAt: Date.now()
          };
        }
        return o;
      });
      saveOrdersStore(current);
      return NextResponse.json({ success: true, orders: current });
    }

    if (action === 'sync' && Array.isArray(orders)) {
      const orderMap = new Map<string, AdminOrder>();
      // Current store orders first
      current.forEach(o => orderMap.set(o.id, o));

      // Merge incoming orders using LWW
      orders.forEach((incoming: AdminOrder) => {
        if (!incoming || !incoming.id) return;
        const existing = orderMap.get(incoming.id);
        if (!existing) {
          orderMap.set(incoming.id, incoming);
        } else {
          const incTime = incoming.updatedAt || incoming.createdAt || 0;
          const extTime = existing.updatedAt || existing.createdAt || 0;
          if (incTime > extTime) {
            orderMap.set(incoming.id, { ...existing, ...incoming });
          } else {
            orderMap.set(incoming.id, { ...incoming, ...existing });
          }
        }
      });

      const merged = Array.from(orderMap.values());
      // Sort newest first
      merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      saveOrdersStore(merged);
      return NextResponse.json({ success: true, orders: merged });
    }

    return NextResponse.json({ success: true, orders: current });
  } catch (err: any) {
    console.error('[API /api/orders] Error handling request:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
