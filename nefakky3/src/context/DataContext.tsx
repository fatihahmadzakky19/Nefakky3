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
import { formatCurrentRealtimeOrderDate } from '@/lib/orderTimeUtils';
import { getEchoInstance } from '@/lib/echo';


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
  badge?: 'TERPOPULER' | 'BARU' | 'BEST SELLER' | 'NEW' | 'COMING SOON' | string;
  isComingSoon?: boolean;
  releaseDate?: string;
  ingredients: string;
  usageAdvice: string;
  origin: string;
  kitchenAddress?: string;
  calories: string;
  fat: string;
  sugar: string;
  satFat: string;
  variantStocks?: { [variantKey: string]: number };
  maxDeliveryKm?: number;
  isDeleted?: boolean;
  deletedAt?: string;
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
  isDeleted?: boolean;
  deletedAt?: string;
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
  event?: string;
  isActive?: boolean;
  usedCount?: number;
  totalLimit?: number;
  validUntil?: string;
  validFrom?: string;
  validDays?: string;
  autoResetWeekly?: boolean;
  lastResetWeek?: string;
  imageUrl?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

/** Helper untuk mendapatkan identifier minggu ISO (contoh: "2026-W33") */
export const getISOWeekString = (d: Date = new Date()): string => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${weekNum}`;
};

/** Helper function untuk mengecek apakah voucher valid & aktif saat ini (termasuk validasi kuota, auto-reset mingguan & hari/tanggal) */
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
  const eventLower = (voucher.event || '').toLowerCase();
  const daysLower = (voucher.validDays || '').toLowerCase();

  // 1.5 AUTO-RESET MINGGUAN: Jika voucher diset auto-reset mingguan (atau promo akhir pekan)
  const isAutoResetWeekly = 
    voucher.autoResetWeekly === true || 
    daysLower.includes('weekend') || 
    eventLower.includes('akhir pekan') || 
    codeUpper.includes('WEEKEND');

  if (isAutoResetWeekly && voucher.id) {
    const currentWeek = getISOWeekString();
    if (voucher.lastResetWeek && voucher.lastResetWeek !== currentWeek && voucher.usedCount && voucher.usedCount > 0) {
      // Automatic reset kuota jika minggu telah berganti!
      const limit = voucher.totalLimit || 500;
      voucher.usedCount = 0;
      voucher.redemptions = `0/${limit}`;
      voucher.status = 'Active';
      voucher.lastResetWeek = currentWeek;
      
      updateDoc(doc(db, 'vouchers', voucher.id), {
        usedCount: 0,
        redemptions: `0/${limit}`,
        status: 'Active',
        lastResetWeek: currentWeek,
        isActive: true
      }).catch(err => console.error('Error auto-resetting weekly voucher:', err));
    }
  }

  // ATURAN PROMO KHUSUS PELANGGAN BARU / AKTIF SELAMANYA (1x Per Pengguna Baru)
  const isNewCustomerPromo = 
    voucher.event === 'Pelanggan Baru' ||
    eventLower.includes('pelanggan baru') ||
    nameLower.includes('pelanggan baru') ||
    codeUpper.includes('NEFAKKY10') ||
    codeUpper.includes('NEWUSER');

  const isSelamanya = voucher.expiry === 'Selamanya' || expiryLower.includes('selamanya') || isNewCustomerPromo;
  const isTanpaBatas = (voucher.redemptions === 'Tanpa Batas' || (voucher.redemptions && String(voucher.redemptions).toLowerCase().includes('tanpa batas'))) && !isNewCustomerPromo;

  // 2. Parse Usage Redemptions & Total Limit (Aturan Batas Pengguna)
  if (!isTanpaBatas) {
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
          reason: `Maaf, batas kuota penggunaan promo ${voucher.code || ''} telah habis (${usedCount}/${totalLimit} terpakai). Kuota akan otomatis ter-reset pada minggu berikutnya.` 
        };
      }
    }
  }

  // 3. Expiry Date Check (Aturan Batas Waktu / Tanggal Kedaluwarsa)
  if (!isSelamanya && voucher.validUntil) {
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

  // 4. Weekend / Day of Week Validation (Aturan Batas Hari Aktif)
  const day = new Date().getDay(); // 0 = Minggu, 6 = Sabtu, 1-5 = Senin-Jumat
  const isWeekendDay = day === 0 || day === 6;
  const isWeekday = day >= 1 && day <= 5;

  const isWeekendPromo = 
    daysLower.includes('weekend') ||
    codeUpper.includes('WEEKEND') || 
    nameLower.includes('weekend') ||
    expiryLower.includes('akhir pekan') ||
    expiryLower.includes('weekend') ||
    eventLower.includes('akhir pekan');

  const isWeekdayPromo = daysLower.includes('weekday') || daysLower.includes('kerja');

  if (isWeekendPromo && !isWeekendDay) {
    return { 
      active: false, 
      reason: `Promo ${voucher.code || ''} (${voucher.name || ''}) hanya berlaku pada hari Sabtu & Minggu (Weekend).` 
    };
  }

  if (isWeekdayPromo && !isWeekday) {
    return { 
      active: false, 
      reason: `Promo ${voucher.code || ''} (${voucher.name || ''}) hanya berlaku pada hari kerja (Senin - Jumat).` 
    };
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
  deliveryType: 'KURIR NEFAKKY' | 'EXPRESS' | 'STANDARD' | 'SAME DAY' | 'PB1 (10%)' | string;
  distance?: string;
  status: 'RECEIVED' | 'COOKING' | 'READY' | 'DELIVERING' | 'ON_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'PENDING' | 'SHIPPING' | 'EXPIRED' | 'CANCELLED';
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  date: string;
  customerConfirmed?: boolean;
  confirmedAt?: string;
  receivedOnTime?: boolean;
  proofPhoto?: string;
  paymentProofPhoto?: string;
  voucherCode?: string;
  appliedPromo?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface ReviewReply {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  comment: string;
  date: string;
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
  createdAt?: number;
  productId?: string;
  productName?: string;
  productImage?: string;
  comment: string;
  likesCount: number;
  status?: 'PUBLISHED' | 'PENDING' | 'FLAGGED' | 'PENDING REVIEW' | 'APPROVED' | 'REJECTED';
  flaggedReason?: string;
  isPinned?: boolean;
  isHidden?: boolean;
  photos?: string[];
  photoUrl?: string;
  photo?: string;
  image?: string;
  replies?: ReviewReply[];
}

/** Helper untuk mengurutkan ulasan agar ULASAN TERBARU selalu berada di paling atas */
export const sortReviewsNewestFirst = (revs: UserReview[]): UserReview[] => {
  if (!Array.isArray(revs)) return [];
  return [...revs].sort((a, b) => {
    const timeA = a.createdAt || (a.id && a.id.startsWith('rev_') ? parseInt(a.id.replace('rev_', ''), 10) : 0);
    const timeB = b.createdAt || (b.id && b.id.startsWith('rev_') ? parseInt(b.id.replace('rev_', ''), 10) : 0);

    if (timeA && timeB && timeA !== timeB) {
      return timeB - timeA;
    }
    if (timeA && !timeB) return -1;
    if (!timeA && timeB) return 1;

    const datePriority = (dStr?: string) => {
      const s = (dStr || '').toLowerCase();
      if (s.includes('baru saja') || s.includes('just now')) return 1;
      if (s.includes('hari ini') || s.includes('today')) return 2;
      if (s.includes('kemarin') || s.includes('yesterday')) return 3;
      return 10;
    };

    const prioA = datePriority(a.date);
    const prioB = datePriority(b.date);

    if (prioA !== prioB) return prioA - prioB;

    return 0;
  });
};

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
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
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
    readByAdmin: true,
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
  updateVoucher: (id: string, updated: Partial<AdminVoucher>) => void;
  deleteVoucher: (id: string) => void;
  toggleVoucherStatus: (id: string) => void;
  addOrder: (orderData: Omit<AdminOrder, 'id' | 'date'>) => AdminOrder;
  updateOrderStatus: (id: string, status: AdminOrder['status']) => void;
  confirmOrderReceived: (id: string, proofPhotoUrl?: string, paymentProofPhotoUrl?: string) => void;
  customerConfirmOrder: (id: string) => void;
  uploadOrderProofPhoto: (id: string, proofPhotoUrl: string) => void;
  uploadOrderPaymentProofPhoto: (id: string, paymentProofPhotoUrl: string) => void;
  deleteOrder: (id: string) => void;
  cancelOrder: (id: string, reason?: string) => void;
  addReview: (review: Omit<UserReview, 'id' | 'date' | 'likesCount'>) => UserReview;
  deleteReview: (id: string) => void;
  addReviewReply: (reviewId: string, replyData: Omit<ReviewReply, 'id' | 'date'>) => void;
  sendChatMessage: (userEmail: string, userName: string, text: string, userAvatar?: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  replyChatMessage: (userEmail: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  markChatAsRead: (userEmail: string, role: 'admin' | 'user') => void;
  isHighDemand: boolean;
  highDemandMessage: string;
  toggleHighDemand: (status?: boolean, customMessage?: string) => void;
}

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 'm1',
    name: 'Ayam Bakar',
    sku: 'SKU-1001-AB',
    category: 'Makanan Berat',
    price: 35000,
    discount: 0,
    stock: 34,
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
    price: 10000,
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
    price: 20000,
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
    price: 10000,
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
    price: 10000,
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
    price: 5000,
    discount: 0,
    stock: 50,
    variantStocks: {
      'Mangga': 20,
      'Sirsak': 15,
      'Jambu': 15
    },
    visibility: true,
    status: 'Active',
    rating: 4.9,
    reviewsCount: 145,
    soldCount: '1.8k Terjual',
    image: '/images/jus_mangga.jpg',
    gallery: ['/images/jus_mangga.jpg', '/images/jus_sirsak.jpg', '/images/jus_jambu.jpg'],
    description: 'Pilihan aneka jus buah segar murni kaya vitamin: Mangga Harum Manis, Sirsak Segar, dan Jambu Biji Merah.',
    badge: 'BARU',
    ingredients: 'Buah Segar Pilihan (Mangga/Sirsak/Jambu), Air Mineral, Es Batu, Gula Tebu Alami.',
    usageAdvice: 'Kocok dahulu sebelum diminum dan nikmati dalam keadaan dingin',
    origin: 'Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia',
    calories: '120 kcal',
    fat: '0g',
    sugar: '12g',
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
    event: 'Promo Akhir Pekan',
    status: 'Active',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
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
    event: 'Flash Sale',
    status: 'Active',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
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
    event: 'Tanggal Kembar',
    status: 'Active',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'v4',
    code: 'NEFAKKY10',
    name: 'Voucher Pelanggan Baru 10%',
    type: 'Percentage',
    discountPercent: 10,
    minSpend: 30000,
    redemptions: '1x Per Pengguna Baru',
    expiry: 'Selamanya',
    event: 'Pelanggan Baru',
    status: 'Active',
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
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
    deliveryType: 'KURIR NEFAKKY',
    status: 'DELIVERING', // Status: Pesanan Diantar / Di Jalan
    subtotal: 100000,
    shippingCost: 12000,
    discount: 10000,
    total: 102000,
    date: 'Senin, 24 Agu 2026 • 12:45:00 WIB',
    createdAt: 1787575500000,
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
    date: 'Minggu, 23 Agu 2026 • 10:15:00 WIB',
    createdAt: 1787480100000,
    customerConfirmed: true,
    confirmedAt: 'Minggu, 23 Agu 2026 • 11:30:00 WIB'
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
    date: 'Kamis, 20 Agu 2026 • 13:10:00 WIB',
    createdAt: 1787224200000,
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
    date: 'Selasa, 18 Agu 2026 • 13:20:00 WIB',
    createdAt: 1787052000000,
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
    date: 'Sabtu, 15 Agu 2026 • 13:30:00 WIB',
    createdAt: 1786793400000,
    customerConfirmed: false
  }
];

export const DEFAULT_REVIEWS: UserReview[] = [
  {
    id: 'rev-1',
    productId: 'm1',
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
    status: 'PUBLISHED',
    photos: ['/images/ayam_bakar.jpg'],
    replies: [
      {
        id: 'rep-1',
        authorName: 'Siti Rahmawati',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        comment: 'Wah setuju banget kak! Sambal kecap rempahnya emang nagih parah 👍',
        date: 'Kemarin'
      }
    ]
  },
  {
    id: 'rev-1b',
    productId: 'm1',
    authorName: 'Ratna Sari',
    authorEmail: 'ratna@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '3 hari lalu',
    productName: 'Ayam Bakar',
    productImage: '/images/ayam_bakar.jpg',
    comment: 'Porsi ayam bakar madunya pas, sambal terasinya mantap pedas gurih. Bumbunya benar-benar khas!',
    likesCount: 7,
    status: 'PUBLISHED'
  },
  {
    id: 'rev-2',
    productId: 'm4',
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
    status: 'PUBLISHED',
    photos: ['/images/gudeg.jpg']
  },
  {
    id: 'rev-2b',
    productId: 'm4',
    authorName: 'Eko Prasetyo',
    authorEmail: 'eko@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '4 hari lalu',
    productName: 'Gudeg',
    productImage: '/images/gudeg.jpg',
    comment: 'Nangka mudanya legit dan manisnya pas khas Jogja, telur bacem dan kuah arehnya kental mantap.',
    likesCount: 5,
    status: 'PUBLISHED'
  },
  {
    id: 'rev-3',
    productId: 'm2',
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
    status: 'PUBLISHED',
    photos: ['/images/nasi_bakar.jpg']
  },
  {
    id: 'rev-3b',
    productId: 'm2',
    authorName: 'Anita Putri',
    authorEmail: 'anita@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '5 hari lalu',
    productName: 'Nasi Bakar',
    productImage: '/images/nasi_bakar.jpg',
    comment: 'Aroma bakaran daun pisangnya menggugah selera, isian suwir ayam kemangi pedasnya mantap!',
    likesCount: 8,
    status: 'PUBLISHED'
  },
  {
    id: 'rev-4',
    productId: 'm5',
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
    status: 'PUBLISHED',
    photos: ['/images/garang_asam.jpg']
  },
  {
    id: 'rev-4b',
    productId: 'm5',
    authorName: 'Hendra Gunawan',
    authorEmail: 'hendra@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '6 hari lalu',
    productName: 'Garang Asam',
    productImage: '/images/garang_asam.jpg',
    comment: 'Rasa belimbing wuluh dan tomat hijaunya segar berpadu dengan santan gurih. Sangat lezat saat hangat.',
    likesCount: 4,
    status: 'PUBLISHED'
  },
  {
    id: 'rev-5',
    productId: 'm3',
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
    status: 'PUBLISHED',
    photos: ['/images/krecek.jpg']
  },
  {
    id: 'rev-5b',
    productId: 'm3',
    authorName: 'Tari Kusuma',
    authorEmail: 'tari@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '1 minggu lalu',
    productName: 'Krecek',
    productImage: '/images/krecek.jpg',
    comment: 'Pedasnya pas dan kuah santannya medok bumbu rempah. Cocok banget disantap dengan nasi hangat.',
    likesCount: 6,
    status: 'PUBLISHED'
  },
  {
    id: 'rev-6',
    productId: 'm6',
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
    status: 'PUBLISHED',
    photos: ['/images/jus_mangga.jpg']
  },
  {
    id: 'rev-6b',
    productId: 'm6',
    authorName: 'Kevin Sanjaya',
    authorEmail: 'kevin@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '1 minggu lalu',
    productName: 'Jus (Jambu, Sirsak, Mangga)',
    productImage: '/images/jus_sirsak.jpg',
    comment: 'Jus sirsak dan mangganya juara! Dinginnya tahan lama dalam kemasan botol higienis.',
    likesCount: 7,
    status: 'PUBLISHED',
    photos: ['/images/jus_sirsak.jpg']
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
  updateVoucher: (id: string, updated: Partial<AdminVoucher>) => void;
  deleteVoucher: (id: string) => void;
  toggleVoucherStatus: (id: string) => void;
  claimVoucherRedemption: (code: string, userUid?: string | null, userEmail?: string | null) => Promise<boolean>;
  isVoucherUsedByUser: (code: string, userUid?: string | null, userEmail?: string | null) => boolean;
  addOrder: (orderData: Omit<AdminOrder, 'id' | 'date'>) => AdminOrder;
  updateOrderStatus: (id: string, status: AdminOrder['status']) => void;
  updatePaymentStatus: (id: string, badge: AdminOrder['paymentBadge']) => void;
  confirmOrderReceived: (id: string, proofPhotoUrl?: string, paymentProofPhotoUrl?: string) => void;
  uploadOrderProofPhoto: (id: string, proofPhotoUrl: string) => void;
  uploadOrderPaymentProofPhoto: (id: string, paymentProofPhotoUrl: string) => void;
  deleteOrder: (id: string) => void;
  cancelOrder: (id: string, reason?: string) => void;
  addReview: (review: Omit<UserReview, 'id' | 'date' | 'likesCount'>) => UserReview;
  deleteReview: (id: string) => void;
  addReviewReply: (reviewId: string, replyData: Omit<ReviewReply, 'id' | 'date'>) => void;
  sendChatMessage: (userEmail: string, userName: string, text: string, userAvatar?: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  replyChatMessage: (userEmail: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
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
    // Clean up sample coming soon items m7 and m8 from Firestore
    deleteDoc(doc(db, 'products', 'm7')).catch(() => {});
    deleteDoc(doc(db, 'products', 'm8')).catch(() => {});

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
        const prods = snapshot.docs
          .map(d => ({ ...d.data(), id: d.id }) as ProductItem)
          .filter(p => p.id !== 'm7' && p.id !== 'm8');
        
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
        setPromotionsState(promos);
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
        setVouchersState(vouches);
      }
    }, (err) => console.error('Vouchers Firestore error:', err));

    // 4. Orders Listener & Test Order Cleanup
    const testOrderIds = ['ORD-3097', 'ORD-9528', 'ORD-8621', 'ORD-9127', 'ORD-8909', 'ORD-4164', 'ORD-8560', 'ORD-9296', 'ORD-4837'];
    testOrderIds.forEach(testId => {
      deleteDoc(doc(db, 'orders', testId)).catch(() => {});
    });

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        DEFAULT_ORDERS.forEach(o => {
          batch.set(doc(db, 'orders', o.id), o);
        });
        batch.commit().catch(err => console.error('Error seeding orders:', err));
        setOrdersState(DEFAULT_ORDERS);
      } else {
        const ords = snapshot.docs
          .map(d => ({ ...d.data(), id: d.id }) as AdminOrder)
          .filter(o => !testOrderIds.includes(o.id));
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
        setReviewsState(sortReviewsNewestFirst(DEFAULT_REVIEWS));
      } else {
        const revs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as UserReview);
        setReviewsState(sortReviewsNewestFirst(revs));
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

  // Sinkronisasi Data Real-time Langsung dari WebSocket Laravel Reverb Engine
  useEffect(() => {
    const echo = getEchoInstance();
    if (!echo) return;

    try {
      // 1. Tangkap pembaruan status pesanan secara langsung tanpa reload
      const ordersChannel = echo.channel('orders');
      ordersChannel.listen('.order.status.updated', (payload: any) => {
        if (payload?.order_id && payload?.new_status) {
          setOrdersState(prev => prev.map(o => {
            if (o.id === payload.order_id) {
              return {
                ...o,
                status: payload.new_status,
                customerConfirmed: payload.new_status === 'COMPLETED' ? true : o.customerConfirmed
              };
            }
            return o;
          }));
        }
      });

      // 2. Tangkap pembaruan stok menu produk secara instan
      const productsChannel = echo.channel('products');
      productsChannel.listen('.product.stock.updated', (payload: any) => {
        if (payload?.product_id !== undefined && payload?.stock !== undefined) {
          setProductsState(prev => prev.map(p => {
            if (p.id === String(payload.product_id) || p.id === `m${payload.product_id}`) {
              return {
                ...p,
                stock: payload.stock,
                status: payload.stock <= 0 ? 'Inactive' : (payload.stock <= 5 ? 'Low Stock' : 'Active'),
                visibility: payload.visibility !== undefined ? payload.visibility : p.visibility
              };
            }
            return p;
          }));
        }
      });

      // 3. Tangkap pesan live chat masuk
      const chatChannel = echo.channel('chat');
      chatChannel.listen('.chat.message.sent', (payload: any) => {
        if (payload?.chat_id && payload?.text) {
          setChatMessagesState(prev => {
            if (prev.some(m => m.id === payload.chat_id || m.id === `chat_${payload.chat_id}`)) {
              return prev;
            }
            const incomingMsg: ChatMessage = {
              id: payload.chat_id,
              userEmail: payload.user_email,
              userName: payload.user_name || 'Pelanggan',
              sender: payload.sender,
              text: payload.text,
              timestamp: payload.timestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              readByAdmin: payload.sender === 'admin',
              readByUser: payload.sender === 'user'
            };
            return [...prev, incomingMsg];
          });
        }
      });

      return () => {
        try {
          ordersChannel.stopListening('.order.status.updated');
          productsChannel.stopListening('.product.stock.updated');
          chatChannel.stopListening('.chat.message.sent');
        } catch (e) {
          // Ignore
        }
      };
    } catch (err) {
      console.warn('[Laravel Reverb DataContext Sync] Gagal mendaftarkan listener:', err);
    }
  }, []);

  /** Helper membersihkan properti undefined agar tidak memicu Firestore Unsupported field error */
  const cleanForFirestore = <T extends Record<string, any>>(obj: T): Record<string, any> => {
    if (!obj || typeof obj !== 'object') return obj;
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        if (Array.isArray(val)) {
          clean[key] = val.filter(item => item !== undefined);
        } else if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
          clean[key] = cleanForFirestore(val);
        } else {
          clean[key] = val;
        }
      }
    }
    return clean;
  };

  const setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>> = (action) => {
    setProductsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      // Sync each item to Firestore doc with sanitation
      next.forEach(p => {
        const cleanP = cleanForFirestore(p);
        setDoc(doc(db, 'products', p.id), cleanP, { merge: true }).catch(console.error);
      });
      return next;
    });
  };

  const setPromotions: React.Dispatch<React.SetStateAction<PromotionItem[]>> = (action) => {
    setPromotionsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(p => {
        setDoc(doc(db, 'promotions', p.id), cleanForFirestore(p), { merge: true }).catch(console.error);
      });
      return next;
    });
  };

  const setVouchers: React.Dispatch<React.SetStateAction<AdminVoucher[]>> = (action) => {
    setVouchersState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(v => {
        setDoc(doc(db, 'vouchers', v.id), cleanForFirestore(v), { merge: true }).catch(console.error);
      });
      return next;
    });
  };

  const setOrders: React.Dispatch<React.SetStateAction<AdminOrder[]>> = (action) => {
    setOrdersState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(o => {
        setDoc(doc(db, 'orders', o.id), cleanForFirestore(o), { merge: true }).catch(console.error);
      });
      return next;
    });
  };

  const setReviews: React.Dispatch<React.SetStateAction<UserReview[]>> = (action) => {
    setReviewsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(r => {
        setDoc(doc(db, 'reviews', r.id), cleanForFirestore(r), { merge: true }).catch(console.error);
      });
      return next;
    });
  };

  const setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> = (action) => {
    setChatMessagesState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(c => {
        setDoc(doc(db, 'chat_messages', c.id), cleanForFirestore(c), { merge: true }).catch(console.error);
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
    const cleanProd = cleanForFirestore(newProduct) as ProductItem;
    setProductsState(prev => [cleanProd, ...prev]);
    try {
      setDoc(doc(db, 'products', newId), cleanProd).catch(console.error);
    } catch (e) {
      console.warn('Catch addProduct setDoc error:', e);
    }
    return cleanProd;
  };

  const updateProduct = (id: string, updated: Partial<ProductItem>) => {
    const cleanUpdated = cleanForFirestore(updated);
    setProductsState(prev => prev.map(p => p.id === id ? { ...p, ...cleanUpdated } : p));
    try {
      updateDoc(doc(db, 'products', id), cleanUpdated).catch(err => console.warn('updateProduct error:', err));
    } catch (e) {
      console.warn('Catch updateProduct updateDoc error:', e);
    }
  };

  const deleteProduct = (id: string) => {
    setProductsState(prev => prev.filter(p => p.id !== id));
    try {
      deleteDoc(doc(db, 'products', id)).catch(console.error);
    } catch (e) {
      console.warn('Catch deleteProduct error:', e);
    }
  };

  const toggleProductVisibility = (id: string) => {
    const target = products.find(p => p.id === id);
    if (target) {
      const nextVis = !target.visibility;
      const nextStatus = nextVis ? 'Active' : 'Inactive';
      setProductsState(prev => prev.map(p => p.id === id ? { ...p, visibility: nextVis, status: nextStatus } : p));
      try {
        updateDoc(doc(db, 'products', id), {
          visibility: nextVis,
          status: nextStatus
        }).catch(console.error);
      } catch (e) {
        console.warn('Catch toggleProductVisibility error:', e);
      }
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
      status: voucherData.status || 'Active',
      lastResetWeek: getISOWeekString()
    };
    setDoc(doc(db, 'vouchers', newId), newVoucher).catch(console.error);
    return newVoucher;
  };

  const updateVoucher = (id: string, updated: Partial<AdminVoucher>) => {
    setVouchersState(prev => prev.map(v => v.id === id ? { ...v, ...updated } : v));
    updateDoc(doc(db, 'vouchers', id), updated).catch(console.error);
  };

  const deleteVoucher = (id: string) => {
    setVouchersState(prev => prev.filter(v => v.id !== id));
    try {
      deleteDoc(doc(db, 'vouchers', id)).catch(console.error);
      deleteDoc(doc(db, 'promotions', id)).catch(console.error);
    } catch (e) {
      console.warn('Catch deleteVoucher error:', e);
    }
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
    const now = new Date();
    const nowStr = formatCurrentRealtimeOrderDate(now);
    const newOrder: AdminOrder = {
      ...orderData,
      id: newId,
      date: nowStr,
      createdAt: orderData.createdAt || now.getTime()
    };

    // Immediate local React state update so order appears 100% reliably
    setOrdersState(prev => [newOrder, ...prev.filter(o => o.id !== newId)]);

    // Deduct stock for ordered products & variants
    if (Array.isArray(newOrder.items)) {
      setProductsState(prev => {
        return prev.map(p => {
          let pCopy = { ...p };
          let modified = false;

          for (const it of newOrder.items) {
            const [baseId, variant] = (it.id || '').split('_');
            const qty = it.quantity || 1;

            if (p.id === baseId || (p.name && it.name && p.name.toLowerCase() === it.name.toLowerCase())) {
              modified = true;
              const newStock = Math.max(0, pCopy.stock - qty);
              pCopy.stock = newStock;
              if (newStock === 0) pCopy.status = 'Low Stock';

              if (variant && pCopy.variantStocks && pCopy.variantStocks[variant] !== undefined) {
                const updatedVarStocks = { ...pCopy.variantStocks };
                updatedVarStocks[variant] = Math.max(0, (updatedVarStocks[variant] || 0) - qty);
                pCopy.variantStocks = updatedVarStocks;
              }
            }
          }

          if (modified) {
            const cleanProd = cleanForFirestore(pCopy);
            updateDoc(doc(db, 'products', p.id), cleanProd).catch(console.error);
          }
          return pCopy;
        });
      });
    }

    const cleanOrder = cleanForFirestore(newOrder);
    setDoc(doc(db, 'orders', newId), cleanOrder).catch(console.error);
    setRtdb(ref(rtdb, `orders/${newId}`), cleanOrder).catch(console.error);
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
    const target = orders.find(o => o.id === id);
    const isCod = target?.paymentMethod?.toLowerCase().includes('cod') || target?.paymentMethod?.toLowerCase().includes('cash on delivery');
    
    const updates: any = {
      status,
      updatedAt: Date.now()
    };

    if (status === 'COMPLETED') {
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      updates.customerConfirmed = true;
      updates.confirmedAt = `Hari ini, ${timeStr}`;
      if (isCod) {
        updates.paymentBadge = 'PAID';
      }
    }

    setOrdersState(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    updateDoc(doc(db, 'orders', id), updates).catch(console.error);
    updateRtdb(ref(rtdb, `orders/${id}`), updates).catch(console.error);
    updateRtdb(ref(rtdb, `live_orders/${id}`), updates).catch(console.error);
  };

  const updatePaymentStatus = (id: string, badge: AdminOrder['paymentBadge']) => {
    setOrdersState(prev => prev.map(o => o.id === id ? { ...o, paymentBadge: badge } : o));
    updateDoc(doc(db, 'orders', id), { paymentBadge: badge }).catch(console.error);
    updateRtdb(ref(rtdb, `orders/${id}`), { paymentBadge: badge, updatedAt: Date.now() }).catch(console.error);
  };

  const deleteOrder = (id: string) => {
    setOrdersState(prev => prev.filter(o => o.id !== id));
    try {
      deleteDoc(doc(db, 'orders', id)).catch(console.error);
      removeRtdb(ref(rtdb, `orders/${id}`)).catch(console.error);
      removeRtdb(ref(rtdb, `live_orders/${id}`)).catch(console.error);
    } catch (e) {
      console.warn('Catch deleteOrder error:', e);
    }
  };

  const cancelOrder = (id: string, reason?: string) => {
    const target = orders.find(o => o.id === id);
    if (target) {
      const updates = {
        status: 'CANCELLED' as AdminOrder['status'],
        paymentBadge: target.paymentBadge === 'PAID' ? ('REFUNDED' as AdminOrder['paymentBadge']) : target.paymentBadge,
        updatedAt: Date.now()
      };
      setOrdersState(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
      updateDoc(doc(db, 'orders', id), updates).catch(console.error);
      updateRtdb(ref(rtdb, `orders/${id}`), updates).catch(console.error);
      updateRtdb(ref(rtdb, `live_orders/${id}`), { status: 'CANCELLED', updatedAt: Date.now() }).catch(console.error);
    }
  };

  const customerConfirmOrder = (id: string) => {
    const targetOrder = orders.find(o => o.id === id);
    const isCod = targetOrder?.paymentMethod?.toLowerCase().includes('cod') || targetOrder?.paymentMethod?.toLowerCase().includes('cash on delivery');

    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateStr = `Hari ini, ${timeStr}`;
    const updates: any = {
      status: 'COMPLETED' as AdminOrder['status'],
      customerConfirmed: true,
      confirmedAt: dateStr,
      receivedOnTime: true,
      updatedAt: Date.now()
    };

    if (isCod) {
      updates.paymentBadge = 'PAID';
    }

    const cleanUpdates = cleanForFirestore(updates);
    setOrdersState(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    updateDoc(doc(db, 'orders', id), cleanUpdates).catch(console.error);
    updateRtdb(ref(rtdb, `orders/${id}`), cleanUpdates).catch(console.error);
    updateRtdb(ref(rtdb, `live_orders/${id}`), {
      id,
      status: 'COMPLETED',
      customerConfirmed: true,
      confirmedAt: dateStr,
      receivedOnTime: true,
      customerName: targetOrder?.customerName || 'Pelanggan',
      paymentBadge: isCod ? 'PAID' : (targetOrder?.paymentBadge || 'PAID'),
      updatedAt: Date.now()
    }).catch(console.error);
  };

  const confirmOrderReceived = (id: string, proofPhotoUrl?: string, paymentProofPhotoUrl?: string) => {
    const targetOrder = orders.find(o => o.id === id);
    const isCod = targetOrder?.paymentMethod?.toLowerCase().includes('cod') || targetOrder?.paymentMethod?.toLowerCase().includes('cash on delivery');

    const activeProofPhoto = proofPhotoUrl || targetOrder?.proofPhoto;
    const activePaymentProofPhoto = paymentProofPhotoUrl || targetOrder?.paymentProofPhoto;

    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateStr = `Hari ini, ${timeStr}`;
    const updates: any = {
      status: 'COMPLETED' as AdminOrder['status'],
      customerConfirmed: true,
      confirmedAt: dateStr,
      receivedOnTime: true,
      updatedAt: Date.now()
    };

    if (activeProofPhoto) updates.proofPhoto = activeProofPhoto;
    if (activePaymentProofPhoto) updates.paymentProofPhoto = activePaymentProofPhoto;
    if (isCod) updates.paymentBadge = 'PAID';

    const cleanUpdates = cleanForFirestore(updates);
    setOrdersState(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    updateDoc(doc(db, 'orders', id), cleanUpdates).catch(console.error);
    updateRtdb(ref(rtdb, `orders/${id}`), cleanUpdates).catch(console.error);
    updateRtdb(ref(rtdb, `live_orders/${id}`), {
      id,
      status: 'COMPLETED',
      customerConfirmed: true,
      confirmedAt: dateStr,
      receivedOnTime: true,
      paymentBadge: isCod ? 'PAID' : (targetOrder?.paymentBadge || 'PAID'),
      proofPhoto: activeProofPhoto || null,
      paymentProofPhoto: activePaymentProofPhoto || null,
      updatedAt: Date.now()
    }).catch(console.error);
  };

  const uploadOrderProofPhoto = (id: string, proofPhotoUrl: string) => {
    const updates = {
      proofPhoto: proofPhotoUrl,
      updatedAt: Date.now()
    };

    // Local state sync using correct setter setOrdersState
    setOrdersState(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));

    updateDoc(doc(db, 'orders', id), updates).catch(console.error);
    updateRtdb(ref(rtdb, `orders/${id}`), updates).catch(console.error);
    updateRtdb(ref(rtdb, `live_orders/${id}`), updates).catch(console.error);
  };

  const uploadOrderPaymentProofPhoto = (id: string, paymentProofPhotoUrl: string) => {
    const updates = {
      paymentProofPhoto: paymentProofPhotoUrl,
      updatedAt: Date.now()
    };

    // Local state sync using correct setter setOrdersState
    setOrdersState(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));

    updateDoc(doc(db, 'orders', id), updates).catch(console.error);
    updateRtdb(ref(rtdb, `orders/${id}`), updates).catch(console.error);
    updateRtdb(ref(rtdb, `live_orders/${id}`), updates).catch(console.error);
  };

  /** Helper function untuk mengecek apakah user tertentu sudah pernah menggunakan voucher */
  const isVoucherUsedByUser = (voucherCode: string, userUid?: string | null, userEmail?: string | null): boolean => {
    if (!voucherCode) return false;
    const codeUpper = voucherCode.trim().toUpperCase();

    // 1. Cek dari localStorage per user
    if (typeof window !== 'undefined') {
      const keysToCheck = [
        userUid ? `nefakky_used_vouchers_${userUid}` : null,
        userEmail ? `nefakky_used_vouchers_${userEmail.toLowerCase()}` : null,
        'nefakky_used_vouchers_guest',
        'nefakky_used_vouchers_global'
      ].filter(Boolean) as string[];

      for (const storageKey of keysToCheck) {
        try {
          const existing: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
          if (existing.some(c => c.trim().toUpperCase() === codeUpper)) return true;
        } catch (e) {
          console.error(e);
        }
      }
    }

    // 2. Cek dari riwayat pemesanan pengguna di orders
    const userOrders = (orders || []).filter(o => 
      (userUid && o.userId === userUid) || 
      (userEmail && o.customerEmail && o.customerEmail.toLowerCase() === userEmail.toLowerCase())
    );

    const hasUsedInOrders = userOrders.some(o => 
      (o.voucherCode && o.voucherCode.toUpperCase().includes(codeUpper)) ||
      (o.appliedPromo && o.appliedPromo.toUpperCase().includes(codeUpper))
    );

    return hasUsedInOrders;
  };

  /** Helper function untuk mengklaim penggunaan voucher & mematikan promo otomatis secara realtime jika kuota habis */
  const claimVoucherRedemption = async (voucherCode: string, userUid?: string | null, userEmail?: string | null): Promise<boolean> => {
    if (!db || !voucherCode) return false;
    try {
      const codeUpper = voucherCode.trim().toUpperCase();

      // Catat ke localStorage user agar langsung tidak dapat digunakan kembali
      if (typeof window !== 'undefined') {
        const keysToSave = [
          userUid ? `nefakky_used_vouchers_${userUid}` : null,
          userEmail ? `nefakky_used_vouchers_${userEmail.toLowerCase()}` : null,
          'nefakky_used_vouchers_global'
        ].filter(Boolean) as string[];

        for (const storageKey of keysToSave) {
          try {
            const existing: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (!existing.some(c => c.toUpperCase() === codeUpper)) {
              existing.push(codeUpper);
              localStorage.setItem(storageKey, JSON.stringify(existing));
            }
          } catch (e) {
            console.error(e);
          }
        }
      }

      const q = collection(db, 'vouchers');
      const snapshot = await getDocs(q);
      const targetDoc = snapshot.docs.find(d => {
        const data = d.data();
        return (data.code && data.code.toUpperCase() === codeUpper) || (d.id && d.id.toUpperCase() === codeUpper);
      });

      if (targetDoc) {
        const v = targetDoc.data();
        
        // Cek apakah promo pelanggan baru (1x Per Pengguna Baru)
        const isNewCust = v.event === 'Pelanggan Baru' || (v.code && v.code.toUpperCase().includes('NEFAKKY10'));
        const isTanpaBatas = (v.redemptions === 'Tanpa Batas' || (v.redemptions && String(v.redemptions).toLowerCase().includes('tanpa batas'))) && !isNewCust;

        if (isNewCust) {
          const newUsed = (v.usedCount || 0) + 1;
          await updateDoc(doc(db, 'vouchers', targetDoc.id), {
            usedCount: newUsed,
            redemptions: '1x Per Pengguna Baru',
            expiry: 'Selamanya',
            status: 'Active',
            isActive: true
          });
          return true;
        }

        if (isTanpaBatas) {
          const newUsed = (v.usedCount || 0) + 1;
          await updateDoc(doc(db, 'vouchers', targetDoc.id), {
            usedCount: newUsed,
            redemptions: 'Tanpa Batas',
            expiry: 'Selamanya',
            status: 'Active',
            isActive: true
          });
          return true;
        }

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
      createdAt: Date.now(),
      likesCount: 0,
      status: 'PUBLISHED'
    };

    setReviewsState(prev => sortReviewsNewestFirst([newReview, ...prev]));
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

  const addReviewReply = (reviewId: string, replyData: Omit<ReviewReply, 'id' | 'date'>) => {
    const newReply: ReviewReply = {
      id: 'rep_' + Date.now(),
      date: 'Baru saja',
      ...replyData
    };

    setReviewsState(prev => {
      const updated = prev.map(rev => {
        if (rev.id === reviewId) {
          const existingReplies = rev.replies || [];
          return { ...rev, replies: [...existingReplies, newReply] };
        }
        return rev;
      });

      const target = updated.find(r => r.id === reviewId);
      if (target) {
        updateDoc(doc(db, 'reviews', reviewId), { replies: target.replies }).catch(console.error);
        setRtdb(ref(rtdb, `reviews/${reviewId}`), target).catch(console.error);
      }

      return updated;
    });
  };

  const sendChatMessage = (userEmail: string, userName: string, text: string, userAvatar?: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
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
      readByUser: true,
      ...(mediaUrl ? { mediaUrl, mediaType: mediaType || 'image' } : {})
    };
    setDoc(doc(db, 'chat_messages', newMsg.id), newMsg).catch(console.error);
    setRtdb(ref(rtdb, `chat_messages/${newMsg.id}`), newMsg).catch(console.error);
  };

  const replyChatMessage = (userEmail: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const emailNorm = userEmail.trim().toLowerCase();
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'admin',
      userEmail: emailNorm,
      userName: 'Admin CS Nefakky',
      text,
      timestamp: timeStr,
      readByAdmin: true,
      readByUser: false,
      ...(mediaUrl ? { mediaUrl, mediaType: mediaType || 'image' } : {})
    };

    // Immediately update local state & mark previous user messages as readByAdmin: true
    setChatMessagesState(prev => {
      const updated = prev.map(m => {
        if (m.userEmail.toLowerCase() === emailNorm && m.sender === 'user' && !m.readByAdmin) {
          return { ...m, readByAdmin: true };
        }
        return m;
      });
      return [...updated, newMsg];
    });

    setDoc(doc(db, 'chat_messages', newMsg.id), newMsg).catch(console.error);
    setRtdb(ref(rtdb, `chat_messages/${newMsg.id}`), newMsg).catch(console.error);

    // Update Firestore documents
    chatMessages.forEach(m => {
      if (m.userEmail.toLowerCase() === emailNorm && m.sender === 'user' && !m.readByAdmin) {
        updateDoc(doc(db, 'chat_messages', m.id), { readByAdmin: true }).catch(console.error);
      }
    });
  };

  const markChatAsRead = (userEmail: string, role: 'admin' | 'user') => {
    const emailNorm = userEmail.trim().toLowerCase();

    // Immediately update local state
    setChatMessagesState(prev => prev.map(m => {
      if (m.userEmail.toLowerCase() === emailNorm) {
        if (role === 'admin' && !m.readByAdmin) {
          return { ...m, readByAdmin: true };
        } else if (role === 'user' && !m.readByUser) {
          return { ...m, readByUser: true };
        }
      }
      return m;
    }));

    // Update Firestore documents
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

  // High Demand / Resto Membludak Settings (Admin Configurable)
  const [isHighDemand, setIsHighDemand] = useState<boolean>(false);
  const [highDemandMessage, setHighDemandMessage] = useState<string>(
    'Dapur kami saat ini sedang melayani pemesanan ramai sekaligus. Estimasi pengantaran diperkirakan MELEBIHI 1 JAM (~90 Menit). Terima kasih atas kesabaran Anda!'
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDemand = localStorage.getItem('nefakky_high_demand');
      if (savedDemand) {
        try {
          const parsed = JSON.parse(savedDemand);
          setIsHighDemand(!!parsed.isHighDemand);
          if (parsed.message) setHighDemandMessage(parsed.message);
        } catch (e) {
          console.error("Failed to parse saved high demand setting", e);
        }
      }
    }
  }, []);

  const toggleHighDemand = (status?: boolean, customMessage?: string) => {
    const newStatus = status !== undefined ? status : !isHighDemand;
    const newMsg = customMessage !== undefined ? customMessage : highDemandMessage;
    setIsHighDemand(newStatus);
    if (customMessage !== undefined) {
      setHighDemandMessage(newMsg);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('nefakky_high_demand', JSON.stringify({
        isHighDemand: newStatus,
        message: newMsg
      }));
    }
  };

  return (
    <DataContext.Provider value={{
      products,
      promotions,
      vouchers,
      orders,
      reviews,
      chatMessages,
      isHighDemand,
      highDemandMessage,
      toggleHighDemand,
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
      updateVoucher,
      deleteVoucher,
      toggleVoucherStatus,
      claimVoucherRedemption,
      isVoucherUsedByUser,
      addOrder,
      updateOrderStatus,
      updatePaymentStatus,
      confirmOrderReceived,
      customerConfirmOrder,
      uploadOrderProofPhoto,
      uploadOrderPaymentProofPhoto,
      deleteOrder,
      cancelOrder,
      addReview,
      deleteReview,
      addReviewReply,
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
