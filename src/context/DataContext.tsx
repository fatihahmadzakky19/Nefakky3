'use client';

/**
 * ============================================================================
 * CONTEXT: DataContext & State Persistence (DataContext.tsx)
 * DESKRIPSI: Penyimpanan dan manajemen data global (Produk, Promo, Pesanan, Ulasan, Chat)
 *            yang terhubung langsung ke Browser localStorage.
 * GUIDELINES: Sesuai standar Clean Code, modular, dan Bahasa Indonesia 100%.
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { ref, set as setRtdb, update as updateRtdb, remove as removeRtdb } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';


/** Interface Data Produk Utama */
export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  discount: number;
  stock: number;
  visibility: boolean;
  status: 'Active' | 'Low Stock' | 'Inactive';
  rating: number;
  reviewsCount?: number;
  soldCount: string;
  image: string;
  gallery: string[];
  description: string;
  badge?: 'TERPOPULER' | 'BARU' | 'BEST SELLER' | 'NEW';
  ingredients: string;
  usageAdvice: string;
  origin: string;
  calories: string;
  fat: string;
  sugar: string;
  satFat: string;
  maxDeliveryKm?: number;
}

/** Interface Data Promosi Admin */
export interface PromotionItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  badge: 'Active' | 'Scheduled' | 'Ended';
  image: string;
  duration: string;
  type: string;
  usedCount: number;
  totalLimit: number;
  isActive: boolean;
}

/** Interface Voucher / Promo Admin */
export interface AdminVoucher {
  id: string;
  code: string;
  name: string;
  type?: string;
  discountPercent: number;
  minSpend: number;
  redemptions: string;
  expiry: string;
  status: 'Active' | 'Expired';
  isActive?: boolean;
  usedCount?: number;
  totalLimit?: number;
  validUntil?: string;
  validFrom?: string;
  validDays?: string;
}

/** Helper function untuk mengecek apakah voucher valid & aktif saat ini (termasuk validasi kuota & hari/tanggal) */
export const isVoucherValidNow = (voucher?: AdminVoucher | any): { active: boolean; reason?: string } => {
  if (!voucher) return { active: false, reason: 'Voucher tidak ditemukan' };

  // 1. Basic status & Admin toggle check
  const isBasicActive = voucher.status === 'Active' && voucher.isActive !== false;
  if (!isBasicActive) {
    return { active: false, reason: `Promo ${voucher.code || ''} sedang non-aktif atau dimatikan oleh Admin.` };
  }

  const codeUpper = (voucher.code || '').toUpperCase();
  const nameLower = (voucher.name || '').toLowerCase();
  const expiryLower = (voucher.expiry || '').toLowerCase();

  // 2. Parse Usage Redemptions & Total Limit (Aturan Batas Pengguna)
  let usedCount = voucher.usedCount;
  let totalLimit = voucher.totalLimit;

  if ((usedCount === undefined || totalLimit === undefined) && voucher.redemptions) {
    const parts = String(voucher.redemptions).split('/');
    if (parts.length === 2) {
      usedCount = parseInt(parts[0].trim(), 10);
      totalLimit = parseInt(parts[1].trim(), 10);
    }
  }

  if (usedCount !== undefined && totalLimit !== undefined && !isNaN(usedCount) && !isNaN(totalLimit)) {
    if (usedCount >= totalLimit) {
      return { 
        active: false, 
        reason: `Maaf, batas kuota penggunaan promo ${voucher.code || ''} telah habis (${usedCount}/${totalLimit} terpakai).` 
      };
    }
  }

  // 3. Expiry Date Check (Aturan Batas Waktu / Tanggal Kedaluwarsa)
  if (voucher.validUntil) {
    const untilDate = new Date(voucher.validUntil);
    if (!isNaN(untilDate.getTime())) {
      untilDate.setHours(23, 59, 59, 999);
      if (new Date() > untilDate) {
        return {
          active: false,
          reason: `Maaf, masa berlaku promo ${voucher.code || ''} telah kedaluwarsa.`
        };
      }
    }
  }

  // 4. Weekend / Day of Week Validation (Aturan Batas Hari)
  const isWeekendPromo = 
    codeUpper.includes('WEEKEND') || 
    nameLower.includes('weekend') ||
    expiryLower.includes('akhir pekan') ||
    expiryLower.includes('weekend') ||
    (voucher.validDays && String(voucher.validDays).toLowerCase().includes('weekend'));

  if (isWeekendPromo) {
    const day = new Date().getDay(); // 0 = Minggu, 6 = Sabtu
    const isWeekend = day === 0 || day === 6;
    if (!isWeekend) {
      return { 
        active: false, 
        reason: `Promo ${voucher.code || ''} (${voucher.name || ''}) hanya berlaku pada hari Sabtu & Minggu (Weekend).` 
      };
    }
  }

  return { active: true };
};

/** Interface Data Pesanan (Orders) */
export interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail?: string;
  userId?: string;
  createdAt?: number;
  avatar: string;
  address: string;
  phone?: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  itemCount: number;
  paymentMethod: string;
  paymentBadge: 'PAID' | 'AWAITING' | 'REFUNDED' | 'FAILED';
  deliveryType: 'EXPRESS' | 'STANDARD' | 'SAME DAY' | 'PB1 (10%)' | string;
  status: 'RECEIVED' | 'COOKING' | 'READY' | 'DELIVERING' | 'COMPLETED' | 'PENDING' | 'SHIPPING' | 'EXPIRED' | 'CANCELLED';
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  date: string;
  customerConfirmed?: boolean;
  confirmedAt?: string;
}

/** Interface Data Ulasan (Reviews) */
export interface UserReview {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  avatar?: string;
  rating: number;
  date: string;
  productName?: string;
  productImage?: string;
  comment: string;
  likesCount: number;
  status?: 'PUBLISHED' | 'PENDING' | 'FLAGGED' | 'PENDING REVIEW' | 'APPROVED' | 'REJECTED';
  flaggedReason?: string;
  isPinned?: boolean;
  isHidden?: boolean;
  photos?: string[];
}

/** Interface Pesan Bantuan (Customer Support Chat) */
export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  userEmail: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
  readByAdmin?: boolean;
  readByUser?: boolean;
}

export const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat-1',
    sender: 'user',
    userEmail: 'nizarazzuhra@gmail.com',
    userName: 'Nizar Azzuhra',
    userAvatar: 'https://ui-avatars.com/api/?name=Nizar+Azzuhra&background=5C3D28&color=ffffff',
    text: 'Halo Min, saya mau tanya apakah pesanan Ayam Bakar saya bisa request tanpa sambal pedas?',
    timestamp: '10:15 AM',
    readByAdmin: false,
    readByUser: true
  },
  {
    id: 'chat-2',
    sender: 'admin',
    userEmail: 'nizarazzuhra@gmail.com',
    userName: 'Admin CS Nefakky',
    text: 'Halo Kak Nizar! Tentu saja bisa. Catatan tim dapur kami sudah diperbarui untuk pesanan Anda.',
    timestamp: '10:18 AM',
    readByAdmin: true,
    readByUser: true
  }
];

interface DataContextType {
  products: ProductItem[];
  vouchers: AdminVoucher[];
  orders: AdminOrder[];
  reviews: UserReview[];
  chatMessages: ChatMessage[];
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  setVouchers: React.Dispatch<React.SetStateAction<AdminVoucher[]>>;
  setOrders: React.Dispatch<React.SetStateAction<AdminOrder[]>>;
  setReviews: React.Dispatch<React.SetStateAction<UserReview[]>>;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addProduct: (product: Omit<ProductItem, 'id'>) => ProductItem;
  updateProduct: (id: string, updated: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  toggleProductVisibility: (id: string) => void;
  addVoucher: (voucher: Omit<AdminVoucher, 'id'>) => AdminVoucher;
  deleteVoucher: (id: string) => void;
  toggleVoucherStatus: (id: string) => void;
  addOrder: (orderData: Omit<AdminOrder, 'id' | 'date'>) => AdminOrder;
  updateOrderStatus: (id: string, status: AdminOrder['status']) => void;
  updatePaymentStatus: (id: string, badge: AdminOrder['paymentBadge']) => void;
  deleteOrder: (id: string) => void;
  cancelOrder: (id: string, reason?: string) => void;
  addReview: (review: Omit<UserReview, 'id' | 'date' | 'likesCount'>) => UserReview;
  deleteReview: (id: string) => void;
  sendChatMessage: (userEmail: string, userName: string, text: string, userAvatar?: string) => void;
  replyChatMessage: (userEmail: string, text: string) => void;
  markChatAsRead: (userEmail: string, role: 'admin' | 'user') => void;
}

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 'm1',
    name: 'Ayam Bakar',
    sku: 'SKU-1001-AB',
    category: 'Makanan Berat',
    price: 35000,
    discount: 0,
    stock: 35,
    visibility: true,
    status: 'Active',
    rating: 4.9,
    reviewsCount: 156,
    soldCount: '1.5k+ Terjual',
    image: '/images/ayam_bakar.jpg',
    gallery: ['/images/ayam_bakar.jpg'],
    description: 'Ayam pejantan pilihan dibakar dengan lumuran bumbu kecap rempah tradisional yang meresap hingga ke tulang.',
    badge: 'TERPOPULER',
    ingredients: 'Ayam Pejantan Segar, Kecap Rempah Bango, Bawang Merah, Bawang Putih, Ketumbar, Serai, Lengkuas.',
    usageAdvice: 'Santap selagi hangat dengan nasi panas dan sambal terasi',
    origin: 'Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia',
    calories: '450 kcal',
    fat: '18g',
    sugar: '6g',
    satFat: '5g'
  },
  {
    id: 'm2',
    name: 'Nasi Bakar',
    sku: 'SKU-1002-NB',
    category: 'Makanan Berat',
    price: 28000,
    discount: 0,
    stock: 25,
    visibility: true,
    status: 'Active',
    rating: 4.8,
    reviewsCount: 98,
    soldCount: '920 Terjual',
    image: '/images/nasi_bakar.jpg',
    gallery: ['/images/nasi_bakar.jpg'],
    description: 'Nasi gurih rempah dibungkus daun pisang dengan isian cumi pedas manis yang dibakar harum khas nusantara.',
    badge: 'BARU',
    ingredients: 'Beras Pulen, Santan, Cumi Segar, Cabai Rawit, Daun Kemangi, Daun Salam, Daun Pisang.',
    usageAdvice: 'Buka bungkus daun pisang saat siap santap',
    origin: 'Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia',
    calories: '520 kcal',
    fat: '16g',
    sugar: '3g',
    satFat: '6g'
  },
  {
    id: 'm3',
    name: 'Krecek',
    sku: 'SKU-1003-KC',
    category: 'Menu Hemat',
    price: 22000,
    discount: 0,
    stock: 40,
    visibility: true,
    status: 'Active',
    rating: 4.9,
    reviewsCount: 210,
    soldCount: '2.1k Terjual',
    image: '/images/krecek.jpg',
    gallery: ['/images/krecek.jpg'],
    description: 'Olahan krecek kulit sapi lembut dimasak dengan santan kental gurih, cabai rawit pedas, dan kacang tolo.',
    badge: 'TERPOPULER',
    ingredients: 'Krecek Kulit Sapi, Kacang Tolo, Santan Kelapa, Cabai Rawit Merah, Lengkuas, Daun Salam.',
    usageAdvice: 'Sangat cocok disandingkan dengan Gudeg atau Nasi Hangat',
    origin: 'Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia',
    calories: '380 kcal',
    fat: '20g',
    sugar: '4g',
    satFat: '9g'
  },
  {
    id: 'm4',
    name: 'Gudeg',
    sku: 'SKU-1004-GD',
    category: 'Makanan Berat',
    price: 40000,
    discount: 0,
    stock: 30,
    visibility: true,
    status: 'Active',
    rating: 5.0,
    reviewsCount: 312,
    soldCount: '3.5k Terjual',
    image: '/images/gudeg.jpg',
    gallery: ['/images/gudeg.jpg'],
    description: 'Nangka muda dimasak perlahan dengan santan dan gula jawa disajikan dengan telur bacem, suwiran ayam, dan krecek.',
    badge: 'BEST SELLER',
    ingredients: 'Nangka Muda (Gori), Gula Jawa Asli, Santan Kelapa, Telur Bebek Bacem, Ayam Suwir, Daun Jati.',
    usageAdvice: 'Nikmati rasa manis gurih otentik ala Malioboro',
    origin: 'Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia',
    calories: '490 kcal',
    fat: '19g',
    sugar: '18g',
    satFat: '7g'
  },
  {
    id: 'm5',
    name: 'Garang Asam',
    sku: 'SKU-1005-GA',
    category: 'Menu Hemat',
    price: 32000,
    discount: 0,
    stock: 20,
    visibility: true,
    status: 'Active',
    rating: 4.8,
    reviewsCount: 88,
    soldCount: '750 Terjual',
    image: '/images/garang_asam.jpg',
    gallery: ['/images/garang_asam.jpg'],
    description: 'Potongan ayam kampung segar dikukus dalam bungkus daun pisang dengan kuah santan asam segar, belimbing wulung, dan cabai rawit.',
    ingredients: 'Ayam Kampung Segar, Belimbing Wulung, Tomat Hijau, Cabai Rawit Utuh, Santan Encuk, Daun Pisang.',
    usageAdvice: 'Kuah asam pedas gurih terasa nikmat disajikan hangat',
    origin: 'Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia',
    calories: '410 kcal',
    fat: '17g',
    sugar: '3g',
    satFat: '6g'
  },
  {
    id: 'm6',
    name: 'Jus Segar (Jambu, Sirsak, Mangga)',
    sku: 'SKU-1006-JS',
    category: 'Minuman',
    price: 15000,
    discount: 0,
    stock: 50,
    visibility: true,
    status: 'Active',
    rating: 4.7,
    reviewsCount: 140,
    soldCount: '1.8k Terjual',
    image: '/images/jus_mangga.jpg',
    gallery: ['/images/jus_mangga.jpg', '/images/jus_sirsak.jpg', '/images/jus_jambu.jpg'],
    description: 'Aneka pilihan jus buah segar alami berkualitas premium: Jambu Biji Merah, Sirsak Manis, atau Mangga Harum Manis.',
    ingredients: 'Buah Asli Segar Pilihan, Es Batu, Gula Cair Alami.',
    usageAdvice: 'Pilih rasa favoritmu di catatan pesanan (Jambu / Sirsak / Mangga)',
    origin: 'Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia',
    calories: '130 kcal',
    fat: '0.5g',
    sugar: '24g',
    satFat: '0g'
  }
];

export const DEFAULT_PROMOTIONS: PromotionItem[] = [
  {
    id: 'promo-1',
    title: 'Weekend Promo 15%',
    subtitle: 'Ayam bakar pejantan pilihan dengan kecap rempah pilihan.',
    tag: '15% OFF',
    badge: 'Active',
    image: '/images/ayam_bakar.jpg',
    duration: '01 Mei - 31 Des',
    type: 'Percentage',
    usedCount: 142,
    totalLimit: 500,
    isActive: true
  },
  {
    id: 'promo-2',
    title: 'Flash Sale: Gudeg Komplit',
    subtitle: 'Gudeg nangka muda olahan tradisional rasa otentik.',
    tag: 'FLASH SALE',
    badge: 'Active',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    duration: 'Akhir Pekan',
    type: 'Fixed Amount',
    usedCount: 98,
    totalLimit: 1000,
    isActive: true
  },
  {
    id: 'promo-3',
    title: 'Hemat Nasi Bakar Cumi',
    subtitle: 'Nasi bakar daun pisang isian cumi pedas gurih.',
    tag: 'BOGO',
    badge: 'Active',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    duration: '01 Juni - 31 Des',
    type: 'Buy 1 Get 1',
    usedCount: 45,
    totalLimit: 100,
    isActive: true
  }
];

export const DEFAULT_VOUCHERS: AdminVoucher[] = [
  {
    id: 'promo-1',
    code: 'WEEKENDSERU',
    name: 'Weekend Promo Diskon 15%',
    type: 'Percentage',
    discountPercent: 15,
    minSpend: 50000,
    redemptions: '142/500',
    expiry: '01 Mei - 31 Des',
    status: 'Active',
    isActive: true
  },
  {
    id: 'promo-2',
    code: 'FLASHSALE',
    name: 'Flash Sale: Gudeg Komplit Jogja',
    type: 'Fixed Amount',
    discountPercent: 20,
    minSpend: 30000,
    redemptions: '98/1000',
    expiry: 'Akhir Pekan',
    status: 'Active',
    isActive: true
  },
  {
    id: 'promo-3',
    code: 'HEMAT50',
    name: 'Hemat Nasi Bakar Cumi (BOGO)',
    type: 'Percentage',
    discountPercent: 50,
    minSpend: 45000,
    redemptions: '45/100',
    expiry: '01 Juni - 31 Des',
    status: 'Active',
    isActive: true
  },
  {
    id: 'v4',
    code: 'NEFAKKY10',
    name: 'Voucher Pelanggan Baru 10%',
    type: 'Percentage',
    discountPercent: 10,
    minSpend: 30000,
    redemptions: '50/500',
    expiry: '31 Des 2026',
    status: 'Active',
    isActive: true
  }
];

export const DEFAULT_ORDERS: AdminOrder[] = [
  {
    id: 'ORD-88219',
    customerName: 'Nizar Azzuhra',
    customerEmail: 'nizarazzuhra@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Nizar+Azzuhra&background=F97316&color=ffffff',
    address: 'Jl. Kebon Jeruk No. 12, Jakarta Barat',
    phone: '081234567890',
    items: [
      { id: 'm1', name: 'Ayam Bakar', price: 35000, quantity: 2, image: '/images/ayam_bakar.jpg' },
      { id: 'm6', name: 'Jus (Jambu, Sirsak, Mangga)', price: 15000, quantity: 2, image: '/images/jus_mangga.jpg' }
    ],
    itemCount: 4,
    paymentMethod: 'QRIS / GoPay',
    paymentBadge: 'PAID',
    deliveryType: 'EXPRESS',
    status: 'DELIVERING', // Status: Pesanan Diantar / Di Jalan
    subtotal: 100000,
    shippingCost: 12000,
    discount: 10000,
    total: 102000,
    date: 'Hari ini, 12:45',
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
    deliveryType: 'SAME DAY',
    status: 'COMPLETED',
    subtotal: 161000,
    shippingCost: 15000,
    discount: 15000,
    total: 161000,
    date: 'Hari ini, 10:15',
    customerConfirmed: true,
    confirmedAt: 'Hari ini, 11:30'
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
    deliveryType: 'STANDARD',
    status: 'COOKING',
    subtotal: 94000,
    shippingCost: 10000,
    discount: 0,
    total: 104000,
    date: 'Hari ini, 13:10',
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
    deliveryType: 'EXPRESS',
    status: 'READY',
    subtotal: 57000,
    shippingCost: 10000,
    discount: 5000,
    total: 62000,
    date: 'Hari ini, 13:20',
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
    status: 'RECEIVED',
    subtotal: 38000,
    shippingCost: 10000,
    discount: 0,
    total: 48000,
    date: 'Hari ini, 13:30',
    customerConfirmed: false
  }
];

export const DEFAULT_REVIEWS: UserReview[] = [
  {
    id: 'rev-1',
    authorName: 'Ahmad Zakky',
    authorEmail: 'ahmad@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Kemarin',
    productName: 'Ayam Bakar',
    productImage: '/images/ayam_bakar.jpg',
    comment: 'Ayam bakarnya sangat empuk dan bumbu kecap rempahnya meresap sempurna sampai ke dalam tulang. Pengiriman super cepat!',
    likesCount: 12,
    status: 'PUBLISHED'
  },
  {
    id: 'rev-2',
    authorName: 'Siti Rahmawati',
    authorEmail: 'siti@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '2 hari lalu',
    productName: 'Gudeg',
    productImage: '/images/gudeg.jpg',
    comment: 'Gudeg paling otentik yang pernah saya pesan online. Bumbu kreceknya gurih pedas manis beraroma harum.',
    likesCount: 8,
    status: 'PUBLISHED'
  },
  {
    id: 'rev-3',
    authorName: 'Dimas Pratama',
    authorEmail: 'dimas@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '3 hari lalu',
    productName: 'Nasi Bakar',
    productImage: '/images/nasi_bakar.jpg',
    comment: 'Nasi bakar daun pisang harum wangi bumbu cumi pedas manisnya melimpah! Mengenyangkan sekali.',
    likesCount: 15,
    status: 'PUBLISHED'
  },
  {
    id: 'rev-4',
    authorName: 'Dewi Lestari',
    authorEmail: 'dewi@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '4 hari lalu',
    productName: 'Garang Asam',
    productImage: '/images/garang_asam.jpg',
    comment: 'Kuah garang asamnya menyegarkan dada, ayam kampung empuk dikukus rapi dengan daun pisang.',
    likesCount: 6,
    status: 'PUBLISHED'
  },
  {
    id: 'rev-5',
    authorName: 'Budi Hartono',
    authorEmail: 'budi@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '5 hari lalu',
    productName: 'Krecek',
    productImage: '/images/krecek.jpg',
    comment: 'Krecek kulit sapinya sangat lembut dan gurih pedas. Kacang tolonya menambah cita rasa tradisional.',
    likesCount: 9,
    status: 'PUBLISHED'
  },
  {
    id: 'rev-6',
    authorName: 'Amanda Rizky',
    authorEmail: 'amanda@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '6 hari lalu',
    productName: 'Jus (Jambu, Sirsak, Mangga)',
    productImage: '/images/jus_mangga.jpg',
    comment: 'Jus buahnya murni kental dari buah asli segar tanpa banyak pemanis buatan. Sangat segar!',
    likesCount: 10,
    status: 'PUBLISHED'
  }
];

interface DataContextType {
  products: ProductItem[];
  promotions: PromotionItem[];
  vouchers: AdminVoucher[];
  orders: AdminOrder[];
  reviews: UserReview[];
  chatMessages: ChatMessage[];
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  setPromotions: React.Dispatch<React.SetStateAction<PromotionItem[]>>;
  setVouchers: React.Dispatch<React.SetStateAction<AdminVoucher[]>>;
  setOrders: React.Dispatch<React.SetStateAction<AdminOrder[]>>;
  setReviews: React.Dispatch<React.SetStateAction<UserReview[]>>;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addProduct: (product: Omit<ProductItem, 'id'>) => ProductItem;
  updateProduct: (id: string, updated: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  toggleProductVisibility: (id: string) => void;
  addPromotion: (promo: Omit<PromotionItem, 'id'>) => PromotionItem;
  deletePromotion: (id: string) => void;
  togglePromotionActive: (id: string) => void;
  addVoucher: (voucher: Omit<AdminVoucher, 'id'>) => AdminVoucher;
  deleteVoucher: (id: string) => void;
  toggleVoucherStatus: (id: string) => void;
  claimVoucherRedemption: (code: string) => Promise<boolean>;
  addOrder: (orderData: Omit<AdminOrder, 'id' | 'date'>) => AdminOrder;
  updateOrderStatus: (id: string, status: AdminOrder['status']) => void;
  updatePaymentStatus: (id: string, badge: AdminOrder['paymentBadge']) => void;
  confirmOrderReceived: (id: string) => void;
  deleteOrder: (id: string) => void;
  cancelOrder: (id: string, reason?: string) => void;
  addReview: (review: Omit<UserReview, 'id' | 'date' | 'likesCount'>) => UserReview;
  deleteReview: (id: string) => void;
  sendChatMessage: (userEmail: string, userName: string, text: string, userAvatar?: string) => void;
  replyChatMessage: (userEmail: string, text: string) => void;
  markChatAsRead: (userEmail: string, role: 'admin' | 'user') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProductsState] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [promotions, setPromotionsState] = useState<PromotionItem[]>(DEFAULT_PROMOTIONS);
  const [vouchers, setVouchersState] = useState<AdminVoucher[]>(DEFAULT_VOUCHERS);
  const [orders, setOrdersState] = useState<AdminOrder[]>(DEFAULT_ORDERS);
  const [reviews, setReviewsState] = useState<UserReview[]>(DEFAULT_REVIEWS);
  const [chatMessages, setChatMessagesState] = useState<ChatMessage[]>(DEFAULT_CHAT_MESSAGES);

  // Firestore Realtime Listeners & Auto-Seeding
  useEffect(() => {
    // 1. Products Listener
    const unsubProd = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        DEFAULT_PRODUCTS.forEach(p => {
          batch.set(doc(db, 'products', p.id), p);
        });
        batch.commit().catch(err => console.error('Error seeding products:', err));
        setProductsState(DEFAULT_PRODUCTS);
      } else {
        const prods = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as ProductItem);
        
        // Auto-seed missing default products (e.g. Garang Asam m5 & Jus m6) without altering user-edited items
        const existingIds = new Set(prods.map(p => p.id));
        const missingProducts = DEFAULT_PRODUCTS.filter(p => !existingIds.has(p.id));
        if (missingProducts.length > 0) {
          const batch = writeBatch(db);
          missingProducts.forEach(p => {
            batch.set(doc(db, 'products', p.id), p);
          });
          batch.commit().catch(err => console.error('Error seeding missing products:', err));
        }

        setProductsState(prods);
      }
    }, (err) => console.error('Products Firestore error:', err));

    // 2. Promotions Listener
    const unsubPromo = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        DEFAULT_PROMOTIONS.forEach(p => {
          batch.set(doc(db, 'promotions', p.id), p);
        });
        batch.commit().catch(err => console.error('Error seeding promotions:', err));
        setPromotionsState(DEFAULT_PROMOTIONS);
      } else {
        const promos = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as PromotionItem);
        const updatedPromos = promos.map(p => {
          if ((p.id === 'promo-1' || p.title.includes('Ayam Bakar')) && (p.tag === '30% OFF' || p.title.includes('30%'))) {
            updateDoc(doc(db, 'promotions', p.id), { tag: '15% OFF', title: 'Weekend Promo 15%' })
              .catch(err => console.error('Error updating Firestore promo:', err));
            return { ...p, tag: '15% OFF', title: 'Weekend Promo 15%' };
          }
          return p;
        });
        setPromotionsState(updatedPromos);
      }
    }, (err) => console.error('Promotions Firestore error:', err));

    // 3. Vouchers Listener
    const unsubVouch = onSnapshot(collection(db, 'vouchers'), (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        DEFAULT_VOUCHERS.forEach(v => {
          batch.set(doc(db, 'vouchers', v.id), v);
        });
        batch.commit().catch(err => console.error('Error seeding vouchers:', err));
        setVouchersState(DEFAULT_VOUCHERS);
      } else {
        const vouches = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as AdminVoucher);
        const updatedVouches = vouches.map(v => {
          if (v.code === 'WEEKENDSERU' && v.discountPercent !== 15) {
            updateDoc(doc(db, 'vouchers', v.id), { discountPercent: 15, name: 'Weekend Promo Diskon 15%' })
              .catch(err => console.error('Error updating Firestore voucher:', err));
            return { ...v, discountPercent: 15, name: 'Weekend Promo Diskon 15%' };
          }
          return v;
        });
        setVouchersState(updatedVouches);
      }
    }, (err) => console.error('Vouchers Firestore error:', err));

    // 4. Orders Listener
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        DEFAULT_ORDERS.forEach(o => {
          batch.set(doc(db, 'orders', o.id), o);
        });
        batch.commit().catch(err => console.error('Error seeding orders:', err));
        setOrdersState(DEFAULT_ORDERS);
      } else {
        const ords = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as AdminOrder);
        setOrdersState(ords);
      }
    }, (err) => console.error('Orders Firestore error:', err));

    // 5. Reviews Listener
    const unsubRev = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        DEFAULT_REVIEWS.forEach(r => {
          batch.set(doc(db, 'reviews', r.id), r);
        });
        batch.commit().catch(err => console.error('Error seeding reviews:', err));
        setReviewsState(DEFAULT_REVIEWS);
      } else {
        const revs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as UserReview);
        setReviewsState(revs);
      }
    }, (err) => console.error('Reviews Firestore error:', err));

    // 6. Chat Messages Listener
    const unsubChat = onSnapshot(collection(db, 'chat_messages'), (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        DEFAULT_CHAT_MESSAGES.forEach(c => {
          batch.set(doc(db, 'chat_messages', c.id), c);
        });
        batch.commit().catch(err => console.error('Error seeding chat_messages:', err));
        setChatMessagesState(DEFAULT_CHAT_MESSAGES);
      } else {
        const msgs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as ChatMessage);
        setChatMessagesState(msgs);
      }
    }, (err) => console.error('Chat Messages Firestore error:', err));

    return () => {
      unsubProd();
      unsubPromo();
      unsubVouch();
      unsubOrders();
      unsubRev();
      unsubChat();
    };
  }, []);

  const setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>> = (action) => {
    setProductsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      // Sync each item to Firestore doc
      next.forEach(p => {
        setDoc(doc(db, 'products', p.id), p, { merge: true }).catch(console.error);
      });
      return next;
    });
  };

  const setPromotions: React.Dispatch<React.SetStateAction<PromotionItem[]>> = (action) => {
    setPromotionsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(p => {
        setDoc(doc(db, 'promotions', p.id), p, { merge: true }).catch(console.error);
      });
      return next;
    });
  };

  const setVouchers: React.Dispatch<React.SetStateAction<AdminVoucher[]>> = (action) => {
    setVouchersState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(v => {
        setDoc(doc(db, 'vouchers', v.id), v, { merge: true }).catch(console.error);
      });
      return next;
    });
  };

  const setOrders: React.Dispatch<React.SetStateAction<AdminOrder[]>> = (action) => {
    setOrdersState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(o => {
        setDoc(doc(db, 'orders', o.id), o, { merge: true }).catch(console.error);
      });
      return next;
    });
  };

  const setReviews: React.Dispatch<React.SetStateAction<UserReview[]>> = (action) => {
    setReviewsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(r => {
        setDoc(doc(db, 'reviews', r.id), r, { merge: true }).catch(console.error);
      });
      return next;
    });
  };

  const setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> = (action) => {
    setChatMessagesState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(c => {
        setDoc(doc(db, 'chat_messages', c.id), c, { merge: true }).catch(console.error);
      });
      return next;
    });
  };

  const addProduct = (productData: Omit<ProductItem, 'id'>): ProductItem => {
    const newId = `m_${Date.now()}`;
    const newProduct: ProductItem = {
      ...productData,
      id: newId,
      visibility: productData.visibility ?? true,
      status: productData.status ?? 'Active'
    };
    setDoc(doc(db, 'products', newId), newProduct).catch(console.error);
    return newProduct;
  };

  const updateProduct = (id: string, updated: Partial<ProductItem>) => {
    updateDoc(doc(db, 'products', id), updated).catch(console.error);
  };

  const deleteProduct = (id: string) => {
    deleteDoc(doc(db, 'products', id)).catch(console.error);
  };

  const toggleProductVisibility = (id: string) => {
    const target = products.find(p => p.id === id);
    if (target) {
      const nextVis = !target.visibility;
      updateDoc(doc(db, 'products', id), {
        visibility: nextVis,
        status: nextVis ? 'Active' : 'Inactive'
      }).catch(console.error);
    }
  };

  const addPromotion = (promoData: Omit<PromotionItem, 'id'>): PromotionItem => {
    const newId = `promo-${Date.now()}`;
    const newPromo: PromotionItem = {
      ...promoData,
      id: newId,
      badge: promoData.badge || 'Active',
      isActive: promoData.isActive ?? true
    };
    setDoc(doc(db, 'promotions', newId), newPromo).catch(console.error);
    return newPromo;
  };

  const deletePromotion = (id: string) => {
    deleteDoc(doc(db, 'promotions', id)).catch(console.error);
    deleteDoc(doc(db, 'vouchers', id)).catch(console.error);
  };

  const togglePromotionActive = (id: string) => {
    const target = promotions.find(p => p.id === id);
    if (target) {
      const nextActive = !target.isActive;
      updateDoc(doc(db, 'promotions', id), {
        isActive: nextActive,
        badge: nextActive ? 'Active' : 'Ended'
      }).catch(console.error);

      const matchingVoucher = vouchers.find(v => v.id === id || (v.code && target.title.toLowerCase().includes(v.code.toLowerCase())));
      if (matchingVoucher) {
        updateDoc(doc(db, 'vouchers', matchingVoucher.id), {
          status: nextActive ? 'Active' : 'Expired',
          isActive: nextActive
        }).catch(console.error);
      }
    }
  };

  const addVoucher = (voucherData: Omit<AdminVoucher, 'id'>): AdminVoucher => {
    const newId = `v_${Date.now()}`;
    const newVoucher: AdminVoucher = {
      ...voucherData,
      id: newId,
      code: voucherData.code.toUpperCase(),
      status: voucherData.status || 'Active'
    };
    setDoc(doc(db, 'vouchers', newId), newVoucher).catch(console.error);
    return newVoucher;
  };

  const deleteVoucher = (id: string) => {
    deleteDoc(doc(db, 'vouchers', id)).catch(console.error);
    deleteDoc(doc(db, 'promotions', id)).catch(console.error);
  };

  const toggleVoucherStatus = (id: string) => {
    const target = vouchers.find(v => v.id === id || v.code.toUpperCase() === id.toUpperCase());
    if (target) {
      const nextActive = !(target.status === 'Active' && target.isActive !== false);
      updateDoc(doc(db, 'vouchers', target.id), {
        status: nextActive ? 'Active' : 'Expired',
        isActive: nextActive
      }).catch(console.error);

      const matchingPromo = promotions.find(p => p.id === target.id || (p.title && p.title.toLowerCase().includes(target.code.toLowerCase())));
      if (matchingPromo) {
        updateDoc(doc(db, 'promotions', matchingPromo.id), {
          isActive: nextActive,
          badge: nextActive ? 'Active' : 'Ended'
        }).catch(console.error);
      }
    }
  };

  const addOrder = (orderData: Omit<AdminOrder, 'id' | 'date'>): AdminOrder => {
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `ORD-${orderNum}`;
    const nowStr = `Hari ini, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    const newOrder: AdminOrder = {
      ...orderData,
      id: newId,
      date: nowStr,
      createdAt: orderData.createdAt || Date.now()
    };
    setDoc(doc(db, 'orders', newId), newOrder).catch(console.error);
    setRtdb(ref(rtdb, `orders/${newId}`), newOrder).catch(console.error);
    setRtdb(ref(rtdb, `live_orders/${newId}`), {
      id: newId,
      status: newOrder.status,
      customerName: newOrder.customerName,
      total: newOrder.total,
      updatedAt: Date.now()
    }).catch(console.error);
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: AdminOrder['status']) => {
    updateDoc(doc(db, 'orders', id), { status }).catch(console.error);
    updateRtdb(ref(rtdb, `orders/${id}`), { status, updatedAt: Date.now() }).catch(console.error);
    updateRtdb(ref(rtdb, `live_orders/${id}`), { status, updatedAt: Date.now() }).catch(console.error);
  };

  const updatePaymentStatus = (id: string, badge: AdminOrder['paymentBadge']) => {
    updateDoc(doc(db, 'orders', id), { paymentBadge: badge }).catch(console.error);
    updateRtdb(ref(rtdb, `orders/${id}`), { paymentBadge: badge, updatedAt: Date.now() }).catch(console.error);
  };

  const deleteOrder = (id: string) => {
    deleteDoc(doc(db, 'orders', id)).catch(console.error);
    removeRtdb(ref(rtdb, `orders/${id}`)).catch(console.error);
    removeRtdb(ref(rtdb, `live_orders/${id}`)).catch(console.error);
  };

  const cancelOrder = (id: string, reason?: string) => {
    const target = orders.find(o => o.id === id);
    if (target) {
      const updates = {
        status: 'CANCELLED' as AdminOrder['status'],
        paymentBadge: target.paymentBadge === 'PAID' ? ('REFUNDED' as AdminOrder['paymentBadge']) : target.paymentBadge,
        updatedAt: Date.now()
      };
      updateDoc(doc(db, 'orders', id), updates).catch(console.error);
      updateRtdb(ref(rtdb, `orders/${id}`), updates).catch(console.error);
      updateRtdb(ref(rtdb, `live_orders/${id}`), { status: 'CANCELLED', updatedAt: Date.now() }).catch(console.error);
    }
  };

  const confirmOrderReceived = (id: string) => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateStr = `Hari ini, ${timeStr}`;
    const updates = {
      status: 'COMPLETED' as AdminOrder['status'],
      customerConfirmed: true,
      confirmedAt: dateStr,
      updatedAt: Date.now()
    };
    updateDoc(doc(db, 'orders', id), updates).catch(console.error);
    updateRtdb(ref(rtdb, `orders/${id}`), updates).catch(console.error);
    updateRtdb(ref(rtdb, `live_orders/${id}`), { status: 'COMPLETED', updatedAt: Date.now() }).catch(console.error);
  };

  /** Helper function untuk mengklaim penggunaan voucher & mematikan promo otomatis secara realtime jika kuota habis */
  const claimVoucherRedemption = async (voucherCode: string): Promise<boolean> => {
    if (!db || !voucherCode) return false;
    try {
      const codeUpper = voucherCode.trim().toUpperCase();
      const q = collection(db, 'vouchers');
      const snapshot = await getDocs(q);
      const targetDoc = snapshot.docs.find(d => {
        const data = d.data();
        return (data.code && data.code.toUpperCase() === codeUpper) || (d.id && d.id.toUpperCase() === codeUpper);
      });

      if (targetDoc) {
        const v = targetDoc.data();
        let usedCount = v.usedCount;
        let totalLimit = v.totalLimit;

        if ((usedCount === undefined || totalLimit === undefined) && v.redemptions) {
          const parts = String(v.redemptions).split('/');
          if (parts.length === 2) {
            usedCount = parseInt(parts[0].trim(), 10);
            totalLimit = parseInt(parts[1].trim(), 10);
          }
        }

        const newUsed = (usedCount || 0) + 1;
        const limit = totalLimit || 500;
        const isNowExpired = newUsed >= limit;
        const newRedemptions = `${newUsed}/${limit}`;

        await updateDoc(doc(db, 'vouchers', targetDoc.id), {
          usedCount: newUsed,
          totalLimit: limit,
          redemptions: newRedemptions,
          status: isNowExpired ? 'Expired' : (v.status || 'Active'),
          isActive: isNowExpired ? false : (v.isActive !== false)
        });

        // Sync ke koleksi promotions jika ada
        const promoQ = collection(db, 'promotions');
        const promoSnapshot = await getDocs(promoQ);
        const targetPromo = promoSnapshot.docs.find(d => {
          const p = d.data();
          return p.id === targetDoc.id || (p.title && p.title.toLowerCase().includes(v.code.toLowerCase()));
        });
        if (targetPromo) {
          await updateDoc(doc(db, 'promotions', targetPromo.id), {
            usedCount: newUsed,
            totalLimit: limit,
            badge: isNowExpired ? 'Ended' : (targetPromo.data().badge || 'Active'),
            isActive: isNowExpired ? false : (targetPromo.data().isActive !== false)
          });
        }
        return true;
      }
    } catch (err) {
      console.error('Error claiming voucher redemption:', err);
    }
    return false;
  };

  const addReview = (reviewData: Omit<UserReview, 'id' | 'date' | 'likesCount'>): UserReview => {
    const newId = `rev_${Date.now()}`;
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewData.authorName)}&background=5C3D28&color=ffffff&bold=true`;
    const avatar = reviewData.avatar || defaultAvatar;
    const newReview: UserReview = {
      ...reviewData,
      id: newId,
      avatar,
      authorAvatar: avatar,
      date: 'Baru saja',
      likesCount: 0,
      status: 'PUBLISHED'
    };

    setDoc(doc(db, 'reviews', newId), newReview).catch(console.error);

    // Recalculate Product Average Rating automatically
    if (reviewData.productName) {
      const targetName = reviewData.productName.toLowerCase();
      const prod = products.find(p => p.name.toLowerCase() === targetName || p.id === reviewData.productName);
      if (prod) {
        const currentRating = prod.rating || 5.0;
        const currentCount = prod.reviewsCount || 10;
        const totalPoints = (currentRating * currentCount) + reviewData.rating;
        const newCount = currentCount + 1;
        const newAvgRating = Math.max(1.0, Math.min(5.0, Number((totalPoints / newCount).toFixed(1))));

        updateDoc(doc(db, 'products', prod.id), {
          rating: newAvgRating,
          reviewsCount: newCount
        }).catch(console.error);
      }
    }

    return newReview;
  };

  const deleteReview = (id: string) => {
    const reviewToDelete = reviews.find(r => r.id === id);
    deleteDoc(doc(db, 'reviews', id)).catch(console.error);

    if (reviewToDelete && reviewToDelete.productName) {
      const targetName = reviewToDelete.productName.toLowerCase();
      const prod = products.find(p => p.name.toLowerCase() === targetName || p.id === reviewToDelete.productName);
      if (prod) {
        const currentRating = prod.rating || 5.0;
        const currentCount = prod.reviewsCount || 10;
        if (currentCount > 1) {
          const totalPoints = (currentRating * currentCount) - reviewToDelete.rating;
          const newCount = currentCount - 1;
          const newAvgRating = Math.max(1.0, Math.min(5.0, Number((totalPoints / newCount).toFixed(1))));

          updateDoc(doc(db, 'products', prod.id), {
            rating: newAvgRating,
            reviewsCount: newCount
          }).catch(console.error);
        }
      }
    }
  };

  const sendChatMessage = (userEmail: string, userName: string, text: string, userAvatar?: string) => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      userEmail: userEmail.trim().toLowerCase(),
      userName,
      userAvatar,
      text,
      timestamp: timeStr,
      readByAdmin: false,
      readByUser: true
    };
    setDoc(doc(db, 'chat_messages', newMsg.id), newMsg).catch(console.error);
    setRtdb(ref(rtdb, `chat_messages/${newMsg.id}`), newMsg).catch(console.error);
  };

  const replyChatMessage = (userEmail: string, text: string) => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'admin',
      userEmail: userEmail.trim().toLowerCase(),
      userName: 'Admin CS Nefakky',
      text,
      timestamp: timeStr,
      readByAdmin: true,
      readByUser: false
    };
    setDoc(doc(db, 'chat_messages', newMsg.id), newMsg).catch(console.error);
    setRtdb(ref(rtdb, `chat_messages/${newMsg.id}`), newMsg).catch(console.error);
  };

  const markChatAsRead = (userEmail: string, role: 'admin' | 'user') => {
    const emailNorm = userEmail.trim().toLowerCase();
    chatMessages.forEach(m => {
      if (m.userEmail.toLowerCase() === emailNorm) {
        if (role === 'admin' && !m.readByAdmin) {
          updateDoc(doc(db, 'chat_messages', m.id), { readByAdmin: true }).catch(console.error);
        } else if (role === 'user' && !m.readByUser) {
          updateDoc(doc(db, 'chat_messages', m.id), { readByUser: true }).catch(console.error);
        }
      }
    });
  };

  return (
    <DataContext.Provider value={{
      products,
      promotions,
      vouchers,
      orders,
      reviews,
      chatMessages,
      setProducts,
      setPromotions,
      setVouchers,
      setOrders,
      setReviews,
      setChatMessages,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleProductVisibility,
      addPromotion,
      deletePromotion,
      togglePromotionActive,
      addVoucher,
      deleteVoucher,
      toggleVoucherStatus,
      claimVoucherRedemption,
      addOrder,
      updateOrderStatus,
      updatePaymentStatus,
      confirmOrderReceived,
      deleteOrder,
      cancelOrder,
      addReview,
      deleteReview,
      sendChatMessage,
      replyChatMessage,
      markChatAsRead
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
