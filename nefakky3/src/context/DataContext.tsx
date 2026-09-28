'use client';

/**
 * ============================================================================
 * CONTEXT: DataContext & State Persistence (DataContext.tsx)
 * DESKRIPSI: Penyimpanan dan manajemen data global (Produk, Promo, Pesanan, Ulasan, Chat)
 *            yang terhubung langsung ke Browser localStorage.
 * GUIDELINES: Sesuai standar Clean Code, modular, dan Bahasa Indonesia 100%.
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  getDocs,
  addDoc
} from 'firebase/firestore';
import { ref, onValue, onChildAdded, onChildChanged, onChildRemoved, set as setRtdb, update as updateRtdb, remove as removeRtdb } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import { formatCurrentRealtimeOrderDate, parseIndonesianDateStringToDate, getJakartaDate } from '@/lib/orderTimeUtils';
import { getEchoInstance } from '@/lib/echo';
import { isAdminEmail } from '@/context/AuthContext';


/** Interface Varian Produk (mis. rasa jus) — metadata per varian; stok tersimpan di ProductItem.variantStocks */
export interface ProductVariant {
  id: string;
  name: string;
  tag?: string;
  image?: string;
  description?: string;
  ingredients?: string;
  calories?: string;
  fat?: string;
  sugar?: string;
  satFat?: string;
}

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
  variants?: ProductVariant[];
  maxDeliveryKm?: number;
  isDeleted?: boolean;
  deletedAt?: string;
  updatedAt?: number;
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
  updatedAt?: number;
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
  eventCategory?: string;
  isActive?: boolean;
  usedCount?: number;
  totalLimit?: number;
  validUntil?: string;
  validFrom?: string;
  validDays?: string;
  autoResetWeekly?: boolean;
  lastResetWeek?: string;
  updatedAt?: number;
  imageUrl?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

/** Helper untuk mendapatkan identifier minggu ISO (contoh: "2026-W33") berbasis kalender Jakarta (WIB) */
export const getISOWeekString = (d: Date = new Date()): string => {
  const jak = getJakartaDate(d);
  const date = new Date(jak.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${weekNum}`;
};

/** Helper pembersih kode voucher (menghapus tanda #, spasi, dan kapitalisasi) */
export const cleanPromoCode = (c?: string | null): string => {
  return (c || '').trim().toUpperCase().replace(/^#+/, '');
};

/** Helper untuk membersihkan dan menghapus duplikasi voucher promo secara ketat berdasarkan kode promo & ID */
export const deduplicateVouchers = (list?: AdminVoucher[] | null): AdminVoucher[] => {
  if (!list || !Array.isArray(list)) return [];
  const codeMap = new Map<string, AdminVoucher>();
  
  for (const v of list) {
    if (!v) continue;
    const cleanCode = cleanPromoCode(v.code);
    // Kunci unik: jika ada kode promo bersihkan, jika tidak gunakan ID voucher
    const key = cleanCode ? `CODE:${cleanCode}` : `ID:${v.id}`;
    if (!key) continue;

    const existing = codeMap.get(key);
    if (!existing) {
      codeMap.set(key, v);
    } else {
      // Jika duplikat ditemukan, pertahankan data terbaru berdasarkan updatedAt
      const existingUpdated = existing.updatedAt || 0;
      const vUpdated = v.updatedAt || 0;
      if (vUpdated > existingUpdated) {
        codeMap.set(key, { ...existing, ...v });
      } else {
        codeMap.set(key, { ...v, ...existing });
      }
    }
  }

  // Proteksi lapis kedua: pastikan tidak ada ID voucher yang sama persis
  const finalIdMap = new Map<string, AdminVoucher>();
  codeMap.forEach((v) => {
    const existing = finalIdMap.get(v.id);
    if (!existing) {
      finalIdMap.set(v.id, v);
    } else {
      if ((v.updatedAt || 0) > (existing.updatedAt || 0)) {
        finalIdMap.set(v.id, v);
      }
    }
  });

  const result: AdminVoucher[] = [];
  finalIdMap.forEach((v) => result.push(v));
  return result;
};

/** Baca array dari localStorage dengan fallback (persistensi lintas-refresh) */
const readLS = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as T;
    }
  } catch (e) {}
  return fallback;
};

/** Baca daftar id yang dihapus secara lokal (tombstone) agar tidak "hidup lagi" dari snapshot server */
const readTombstones = (key: string): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const arr: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    return new Set(arr);
  } catch (e) {
    return new Set();
  }
};

/**
 * Merge data server (Firestore) dengan data lokal:
 * - Item yang lebih baru secara lokal (updatedAt lebih besar) dipertahankan (edit tidak hilang walau tulis Firestore gagal).
 * - Item lokal yang belum ada di server (penambahan yang belum tersinkron) TETAP dipertahankan.
 * - Item di server menang bila tidak ada konflik waktu.
 */
const mergeServerWithLocal = <T extends { id: string; updatedAt?: number }>(server: T[], local: T[], tombstones?: Set<string>): T[] => {
  const localMap = new Map(local.map(x => [x.id, x]));
  const serverIds = new Set(server.map(x => x.id));
  const merged: T[] = server.filter(s => !tombstones || !tombstones.has(s.id)).map(s => {
    const l = localMap.get(s.id);
    if (l && typeof l.updatedAt === 'number' && (typeof s.updatedAt !== 'number' || l.updatedAt > s.updatedAt)) {
      return l;
    }
    return l ? { ...l, ...s } : s;
  });
  local.forEach(l => {
    if (!serverIds.has(l.id) && (!tombstones || !tombstones.has(l.id))) merged.push(l);
  });
  return merged;
};

/** Cek apakah voucher sudah kedaluwarsa secara waktu (validUntil / expiry string "31 Des 2026") — dipakai admin & user untuk menyembunyikan promo expired */
export const isVoucherTimeExpired = (voucher?: AdminVoucher | any): boolean => {
  if (!voucher) return false;
  const isSelam =
    voucher.expiry === 'Selamanya' ||
    String(voucher.expiry || '').toLowerCase().includes('selamanya') ||
    voucher.event === 'Pelanggan Baru';
  if (isSelam) return false;
  if (voucher.validUntil) {
    const d = new Date(voucher.validUntil);
    if (!isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      if (new Date() > d) return true;
    }
  }
  if (voucher.expiry) {
    const d = parseIndonesianDateStringToDate(String(voucher.expiry));
    if (d) {
      d.setHours(23, 59, 59, 999);
      if (new Date() > d) return true;
    }
  }
  return false;
};

/** Helper function untuk mengecek apakah voucher valid & aktif saat ini (termasuk validasi kuota, auto-reset mingguan & hari/tanggal) */
export const isVoucherValidNow = (voucher?: AdminVoucher | any): { active: boolean; reason?: string } => {
  if (!voucher) return { active: false, reason: 'Voucher tidak ditemukan' };

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

  const quotaParts = (() => {
    let usedC = voucher.usedCount;
    let limitC = voucher.totalLimit;
    if ((usedC === undefined || limitC === undefined) && voucher.redemptions) {
      const qp = String(voucher.redemptions).split('/');
      if (qp.length === 2) {
        usedC = parseInt(qp[0].trim(), 10);
        limitC = parseInt(qp[1].trim(), 10);
      }
    }
    return { usedC, limitC };
  })();
  const quotaFullCheck =
    quotaParts.usedC !== undefined && quotaParts.limitC !== undefined &&
    !isNaN(quotaParts.usedC) && !isNaN(quotaParts.limitC) &&
    quotaParts.limitC > 0 && quotaParts.usedC >= quotaParts.limitC;

  if (voucher.id) {
    const currentWeek = getISOWeekString();
    if ((isAutoResetWeekly || quotaFullCheck) && (quotaParts.usedC || 0) > 0 && voucher.lastResetWeek !== currentWeek) {
      // Automatic reset kuota jika minggu telah berganti!
      const limit = voucher.totalLimit || quotaParts.limitC || 500;
      voucher.usedCount = 0;
      voucher.redemptions = `0/${limit}`;
      voucher.status = 'Active';
      voucher.isActive = true;
      voucher.lastResetWeek = currentWeek;
      
      updateDoc(doc(db, 'vouchers', voucher.id), {
        usedCount: 0,
        redemptions: `0/${limit}`,
        status: 'Active',
        lastResetWeek: currentWeek,
        isActive: true,
        updatedAt: Date.now()
      }).catch(err => console.warn('Error auto-resetting weekly voucher:', err?.message || err));

      // Bersihkan record pemakaian per-user di browser ini → tampilan promo muncul kembali utk minggu baru
      try {
        if (typeof window !== 'undefined') {
          Object.keys(localStorage)
            .filter(k => k.startsWith('nefakky_used_vouchers_'))
            .forEach(k => {
              try {
                const arr: string[] = JSON.parse(localStorage.getItem(k) || '[]');
                localStorage.setItem(k, JSON.stringify(arr.filter(c => cleanPromoCode(c) !== cleanPromoCode(voucher.code || ''))));
              } catch (e) {}
            });
        }
      } catch (e) {}
    } else if (!voucher.lastResetWeek) {
      // Belum pernah distempel → catat minggu ini agar reset berikutnya terjadwal (tanpa reset paksa)
      voucher.lastResetWeek = currentWeek;
      updateDoc(doc(db, 'vouchers', voucher.id), { lastResetWeek: currentWeek }).catch(() => {});
    }
  }

  // Basic status & Admin toggle check (setelah potensi auto-reset mingguan di atas)
  const isBasicActive = voucher.status === 'Active' && voucher.isActive !== false;
  if (!isBasicActive) {
    return { active: false, reason: `Promo ${voucher.code || ''} sedang non-aktif atau dimatikan oleh Admin.` };
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
  if (!isSelamanya) {
    let expiredDate: Date | null = null;
    if (voucher.validUntil) {
      const untilDate = new Date(voucher.validUntil);
      if (!isNaN(untilDate.getTime())) expiredDate = untilDate;
    }
    // Fallback: field expiry string (mis. "31 Des 2026") dari form admin → otomatis hilang saat kedaluwarsa
    if (!expiredDate && voucher.expiry && !expiryLower.includes('selamanya')) {
      expiredDate = parseIndonesianDateStringToDate(String(voucher.expiry));
    }
    if (expiredDate) {
      expiredDate.setHours(23, 59, 59, 999);
      if (new Date() > expiredDate) {
        return {
          active: false,
          reason: `Maaf, masa berlaku promo ${voucher.code || ''} telah kedaluwarsa.`
        };
      }
    }
  }

  // 4. Weekend / Day of Week Validation (Aturan Batas Hari Aktif)
  // Standar waktu operasional: Selalu gunakan jam dinding Asia/Jakarta (WIB) agar konsisten dengan jam operasional toko
  // Sesuai standar industri F&B & admin panel: Promo Weekend / Khusus Akhir Pekan hanya berlaku pada hari Sabtu & Minggu (0 = Minggu, 6 = Sabtu)
  const now = getJakartaDate(new Date());
  const day = now.getDay(); 
  const isWeekendDay = day === 0 || day === 6; // 0 = Minggu, 6 = Sabtu
  const isWeekday = day >= 1 && day <= 5; // 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat

  const isWeekendPromo = 
    daysLower.includes('weekend') ||
    daysLower.includes('akhir pekan') ||
    daysLower.includes('sabtu') ||
    daysLower.includes('minggu') ||
    codeUpper.includes('WEEKEND') || 
    nameLower.includes('weekend') ||
    expiryLower.includes('akhir pekan') ||
    expiryLower.includes('weekend') ||
    eventLower.includes('akhir pekan');

  const isWeekdayPromo = !isWeekendPromo && (
    daysLower.includes('weekday') || 
    daysLower.includes('kerja')
  );

  if (isWeekendPromo && !isWeekendDay) {
    return { 
      active: false, 
      reason: `Promo ${voucher.code || ''} (${voucher.name || ''}) hanya berlaku pada akhir pekan (Sabtu & Minggu).` 
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
  status: 'RECEIVED' | 'PENDING' | 'PREPARING' | 'COOKING' | 'READY' | 'DELIVERING' | 'ON_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'SHIPPING' | 'EXPIRED' | 'CANCELLED';
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
  lateBonusGranted?: boolean;
  updatedAt?: number;
  isDeleted?: boolean;
  deletedAt?: string;
}

/** Helper untuk memeriksa apakah suatu pesanan masih dalam proses aktif (belum selesai / belum sampai) */
export const isOrderActive = (order?: AdminOrder | null): boolean => {
  if (!order) return false;
  if (order.isDeleted) return false;
  if (order.status === 'COMPLETED' || order.status === 'CANCELLED' || order.customerConfirmed) {
    return false;
  }
  return true;
};

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
  updatedAt?: number;
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
  isVerifiedBuyer?: boolean;
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

// Catatan: deklarasi interface duplikat sebelumnya (dua interface bernama sama)
// telah digabungkan menjadi satu interface lengkap di bawah DEFAULT_REVIEWS
// untuk mencegah kebingungan tipe dan bug perilaku pada pengembangan berikutnya.

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
    id: 'v4',
    title: 'Voucher Pelanggan Baru 10%',
    subtitle: 'Diskon 10% khusus pengguna baru Nefakky.',
    tag: '10% OFF',
    badge: 'Active',
    image: '/images/ayam_bakar.jpg',
    duration: 'Selamanya',
    type: 'Percentage',
    usedCount: 0,
    totalLimit: 999999,
    isActive: true
  },
  {
    id: 'promo-1',
    title: 'Weekend Promo Diskon 15%',
    subtitle: 'Diskon spesial akhir pekan untuk semua menu pilihan.',
    tag: '15% OFF',
    badge: 'Active',
    image: '/images/nasi_bakar.jpg',
    duration: '31 Des 2026',
    type: 'Percentage',
    usedCount: 0,
    totalLimit: 500,
    isActive: true
  },
  {
    id: 'promo-86',
    title: 'Flash Sale Promo 20%',
    subtitle: 'Promo spesial diskon 20% menu kuliner.',
    tag: '20% OFF',
    badge: 'Active',
    image: '/images/gudeg.jpg',
    duration: '31 Des 2026',
    type: 'Percentage',
    usedCount: 0,
    totalLimit: 100,
    isActive: true
  },
  {
    id: 'promo-flashsale12',
    title: 'flashsale',
    subtitle: 'Diskon 20% (Min. Rp 50.000)',
    tag: '20% OFF',
    badge: 'Active',
    image: '/images/ayam_bakar.jpg',
    duration: '31 Des 2026',
    type: 'Voucher',
    usedCount: 0,
    totalLimit: 100,
    isActive: true
  }
];

export const DEFAULT_VOUCHERS: AdminVoucher[] = [
  {
    id: 'promo-flashsale12',
    code: 'FLASHSALE12',
    name: 'flashsale',
    type: 'Percentage',
    discountPercent: 20,
    minSpend: 50000,
    redemptions: '0/100',
    totalLimit: 100,
    usedCount: 0,
    expiry: '31 Des 2026',
    event: 'Flash Sale',
    eventCategory: 'Flash Sale',
    status: 'Active',
    isActive: true,
    validDays: 'Semua Hari',
    autoResetWeekly: true,
    updatedAt: 1789125300000
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
    eventCategory: 'Pelanggan Baru',
    status: 'Active',
    isActive: true,
    validDays: 'Semua Hari',
    updatedAt: 1789125300000
  },
  {
    id: 'promo-1',
    code: 'WEEKENDSERU',
    name: 'Weekend Promo Diskon 15%',
    type: 'Percentage',
    discountPercent: 15,
    minSpend: 50000,
    redemptions: '0/500',
    expiry: '31 Des 2026',
    event: 'Flash Sale',
    eventCategory: 'Flash Sale',
    status: 'Active',
    isActive: true,
    validDays: 'Weekend',
    autoResetWeekly: true,
    updatedAt: 1789125300000
  },
  {
    id: 'promo-86',
    code: 'PROMO86',
    name: 'Flash Sale Promo 20%',
    type: 'Percentage',
    discountPercent: 20,
    minSpend: 50000,
    redemptions: '0/100',
    expiry: '31 Des 2026',
    event: 'Flash Sale',
    eventCategory: 'Flash Sale',
    status: 'Active',
    isActive: true,
    validDays: 'Semua Hari',
    updatedAt: 1789125300000
  }
];

export const DEFAULT_ORDERS: AdminOrder[] = [
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
    createdAt: 1789125300000, // 11 Sep 2026 05:15:00 WIB
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
    createdAt: 1789089000000, // 10 Sep 2026 19:30:00 WIB
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
    createdAt: 1788894600000, // 8 Sep 2026 13:10:00 WIB
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
    createdAt: 1788549600000, // 4 Sep 2026 14:20:00 WIB
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
    createdAt: 1787572800000, // 24 Agu 2026
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
        comment: 'Wah setuju banget kak! Sambal kecap rempahnya emang nagih parah.',
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
  resetVoucherUsage: (voucherIdOrCode: string) => Promise<boolean>;
  isVoucherUsedByUser: (code: string, userUid?: string | null, userEmail?: string | null) => boolean;
  addOrder: (orderData: Partial<AdminOrder> & Omit<AdminOrder, 'date'>) => AdminOrder;
  updateOrderStatus: (id: string, status: AdminOrder['status']) => void;
  updatePaymentStatus: (id: string, badge: AdminOrder['paymentBadge']) => void;
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
  isHydrated: boolean;
  hasUserPurchasedProduct: (productIdOrName: string, userUid?: string | null, userEmail?: string | null) => boolean;
  getUserPurchasedProducts: (userUid?: string | null, userEmail?: string | null) => ProductItem[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

let sharedOrdersBC: BroadcastChannel | null = null;
export const getOrdersBroadcastChannel = (): BroadcastChannel | null => {
  if (typeof window === 'undefined') return null;
  if (!('BroadcastChannel' in window)) return null;
  if (!sharedOrdersBC) {
    try {
      sharedOrdersBC = new BroadcastChannel('nefakky_orders_channel');
    } catch (e) {
      return null;
    }
  }
  return sharedOrdersBC;
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  // Hydrate dari localStorage secara aman via useEffect agar render awal SSR dan Client identik (100% Bebas Hydration Mismatch)
  const [products, setProductsState] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [promotions, setPromotionsState] = useState<PromotionItem[]>(DEFAULT_PROMOTIONS);
  const [vouchers, setVouchersState] = useState<AdminVoucher[]>(DEFAULT_VOUCHERS);
  const [orders, setOrdersState] = useState<AdminOrder[]>(DEFAULT_ORDERS);
  const [reviews, setReviewsState] = useState<UserReview[]>(DEFAULT_REVIEWS);
  const [chatMessages, setChatMessagesState] = useState<ChatMessage[]>(DEFAULT_CHAT_MESSAGES);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const isHydratedRef = useRef<boolean>(false);

  // Hydrate data tersimpan dari localStorage di client setelah mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedProds = readLS<ProductItem[]>('nefakky_products_live', []);
      if (savedProds && savedProds.length > 0) setProductsState(savedProds);

      const savedPromos = readLS<PromotionItem[]>('nefakky_promotions_live', []);
      if (savedPromos && savedPromos.length > 0) setPromotionsState(savedPromos);

      const savedVouchers = readLS<AdminVoucher[]>('nefakky_vouchers_live', []);
      if (savedVouchers && savedVouchers.length > 0) {
        const vTombs = readTombstones('nefakky_deleted_vouchers');
        const normalizedSaved = savedVouchers.map(v => {
          if (cleanPromoCode(v.code) === 'WEEKENDSERU' && (!v.validDays || v.validDays === 'Semua Hari')) {
            return { ...v, validDays: 'Weekend' };
          }
          return v;
        });
        const existingIds = new Set(normalizedSaved.map(v => v.id));
        const existingCodes = new Set(normalizedSaved.map(v => cleanPromoCode(v.code)).filter(Boolean));
        const missing = DEFAULT_VOUCHERS.filter(v => 
          !existingIds.has(v.id) && 
          !existingCodes.has(cleanPromoCode(v.code)) && 
          !vTombs.has(v.id) && 
          !vTombs.has(cleanPromoCode(v.code))
        );
        const deduped = deduplicateVouchers([...normalizedSaved, ...missing]);
        setVouchersState(deduped);
        try {
          localStorage.setItem('nefakky_vouchers_live', JSON.stringify(deduped));
        } catch (e) {}
      } else {
        setVouchersState(deduplicateVouchers(DEFAULT_VOUCHERS));
      }

      const savedOrders = readLS<AdminOrder[]>('nefakky_live_orders', []);
      if (savedOrders && savedOrders.length > 0) setOrdersState(savedOrders);

      const savedReviews = readLS<UserReview[]>('nefakky_reviews_live', []);
      if (savedReviews && savedReviews.length > 0) setReviewsState(sortReviewsNewestFirst(savedReviews));

      const savedChat = readLS<ChatMessage[]>('nefakky_chat_live', []);
      if (savedChat && savedChat.length > 0) setChatMessagesState(savedChat);
    } catch (e) {
      console.warn('Hydrate localStorage notice:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // ==========================================================================
  // PERSISTENSI LOCALSTORAGE: setiap perubahan state disimpan setelah hydrasi selesai
  // HANYA simpan saat isHydrated === true (tidak menimpa dengan state default sebelum re-render!)
  // ==========================================================================
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return;
    isHydratedRef.current = true;
    try {
      localStorage.setItem('nefakky_products_live', JSON.stringify(products));
      localStorage.setItem('nefakky_promotions_live', JSON.stringify(promotions));
      localStorage.setItem('nefakky_vouchers_live', JSON.stringify(vouchers));
      localStorage.setItem('nefakky_live_orders', JSON.stringify(orders));
      localStorage.setItem('nefakky_reviews_live', JSON.stringify(reviews));
      localStorage.setItem('nefakky_chat_live', JSON.stringify(chatMessages));
    } catch (e) {}
  }, [isHydrated, products, promotions, vouchers, orders, reviews, chatMessages]);

  // ==========================================================================
  // SINKRONISASI LINTAS TAB (user ↔ admin pada browser yang sama) via storage
  // event + auto-reset record voucher "sudah dipakai" setiap minggu ISO baru.
  // ==========================================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Auto-reset record pemakaian voucher per-user tiap minggu baru agar promo muncul kembali
    try {
      const currentWeek = getISOWeekString();
      const storedWeek = localStorage.getItem('nefakky_used_vouchers_week');
      if (storedWeek !== currentWeek) {
        Object.keys(localStorage)
          .filter(k => k.startsWith('nefakky_used_vouchers_') && k !== 'nefakky_used_vouchers_week')
          .forEach(k => localStorage.setItem(k, '[]'));
        localStorage.setItem('nefakky_used_vouchers_week', currentWeek);
      }
    } catch (e) {}

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === 'nefakky_products_live') {
          const d = JSON.parse(e.newValue);
          if (Array.isArray(d)) setProductsState(d);
        } else if (e.key === 'nefakky_promotions_live') {
          const d = JSON.parse(e.newValue);
          if (Array.isArray(d)) setPromotionsState(d);
        } else if (e.key === 'nefakky_vouchers_live') {
          const d = JSON.parse(e.newValue);
          if (Array.isArray(d)) setVouchersState(d);
        } else if (e.key === 'nefakky_live_orders') {
          const d = JSON.parse(e.newValue);
          if (Array.isArray(d)) setOrdersState(d);
        } else if (e.key === 'nefakky_reviews_live') {
          const d = JSON.parse(e.newValue);
          if (Array.isArray(d)) setReviewsState(sortReviewsNewestFirst(d));
        } else if (e.key === 'nefakky_chat_live') {
          const d = JSON.parse(e.newValue);
          if (Array.isArray(d)) setChatMessagesState(d);
        } else if (e.key === 'nefakky_high_demand') {
          const d = JSON.parse(e.newValue);
          setIsHighDemand(!!d.isHighDemand);
          if (d.message) setHighDemandMessage(d.message);
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // BONUS KETERLAMBATAN: pesanan aktif melewati estimasi 60 menit (maks 24 jam) →
  // otomatis tambahkan menu bonus ke item pesanan & tandai lateBonusGranted.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const grantLateBonuses = () => {
      setOrdersState(prev => {
        const now = Date.now();
        let changed = false;
        const updated = prev.map(o => {
          const age = o.createdAt ? now - o.createdAt : 0;
          if (!o.createdAt || o.lateBonusGranted || ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(o.status) || age <= 60 * 60 * 1000 || age > 24 * 60 * 60 * 1000) {
            return o;
          }
          changed = true;
          const bonusItem = {
            id: 'bonus-keterlambatan',
            name: 'Bonus Keterlambatan — Nasi Bakar',
            price: 0,
            quantity: 1,
            image: '/images/nasi_bakar.jpg'
          };
          const updates: Partial<AdminOrder> = {
            items: [...(o.items || []), bonusItem as any],
            itemCount: (o.itemCount || 0) + 1,
            lateBonusGranted: true,
            updatedAt: now
          };
          try {
            const bc = getOrdersBroadcastChannel();
            bc?.postMessage({ type: 'ORDER_STATUS_UPDATED', orderId: o.id, updates });
            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('nefakky_orders_updated'));
          } catch (e) {}
          updateDoc(doc(db, 'orders', o.id), updates).catch(() => {});
          updateRtdb(ref(rtdb, `orders/${o.id}`), updates).catch(() => {});
          updateRtdb(ref(rtdb, `live_orders/${o.id}`), updates).catch(() => {});
          return { ...o, ...updates } as AdminOrder;
        });
        if (!changed) return prev;
        try {
          localStorage.setItem('nefakky_live_orders', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    };
    grantLateBonuses();
    const timer = setInterval(grantLateBonuses, 60000);
    return () => clearInterval(timer);
  }, []);

  // Firestore Realtime Listeners & Auto-Seeding
  useEffect(() => {
    // Clean up sample coming soon items m7 and m8 from Firestore
    deleteDoc(doc(db, 'products', 'm7')).catch(() => {});
    deleteDoc(doc(db, 'products', 'm8')).catch(() => {});

    // 1. Products Listener
    const unsubProd = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prodTombs = readTombstones('nefakky_deleted_products');
      if (snapshot.empty) {
        // Firestore kosong → dorong data lokal (hasil hydrate localStorage) ke server; JANGAN timpa state lokal
        const localProducts = readLS<ProductItem[]>('nefakky_products_live', []);
        const source = (localProducts.length > 0 ? localProducts : DEFAULT_PRODUCTS).filter(p => !prodTombs.has(p.id));
        const batch = writeBatch(db);
        source.forEach(p => {
          batch.set(doc(db, 'products', p.id), p);
        });
        batch.commit().catch(err => console.warn('Error seeding products:', err?.message || err));
      } else {
        const prods = snapshot.docs
          .map(d => ({ ...d.data(), id: d.id }) as ProductItem)
          .filter(p => p.id !== 'm7' && p.id !== 'm8')
          .map(p => {
            // Normalisasi legacy HANYA untuk jus lama yang belum punya metadata `variants`
            const hasCustomVariants = Array.isArray(p.variants) && (p.variants as any[]).length > 0;
            if (!hasCustomVariants && (p.id === 'm6' || p.category === 'Minuman' || (p.name || '').toLowerCase().includes('jus'))) {
              const vStocks = p.variantStocks ? { ...p.variantStocks } : null;
              let finalVarStocks = vStocks ? {
                Mangga: Number(vStocks.Mangga ?? vStocks.mangga ?? 13),
                Sirsak: Number(vStocks.Sirsak ?? vStocks.sirsak ?? 14),
                Jambu: Number(vStocks.Jambu ?? vStocks.jambu ?? 13)
              } : {
                Mangga: 13,
                Sirsak: 14,
                Jambu: 13
              };

              if (p.stock === 40 && (!vStocks || (vStocks.Mangga === 20 && vStocks.Sirsak === 15 && vStocks.Jambu === 15))) {
                finalVarStocks = { Mangga: 13, Sirsak: 14, Jambu: 13 };
              }

              const totalCalculated = Object.values(finalVarStocks).reduce((sum, v) => sum + (Number(v) || 0), 0);
              return {
                ...p,
                stock: totalCalculated,
                variantStocks: finalVarStocks
              };
            }
            return p;
          });
        
        // Auto-seed missing default products (e.g. Garang Asam m5 & Jus m6) without altering user-edited items
        const existingIds = new Set(prods.map(p => p.id));
        const missingProducts = DEFAULT_PRODUCTS.filter(p => !existingIds.has(p.id) && !prodTombs.has(p.id));
        if (missingProducts.length > 0) {
          const batch = writeBatch(db);
          missingProducts.forEach(p => {
            batch.set(doc(db, 'products', p.id), p);
          });
          batch.commit().catch(err => console.warn('Seeding missing products notice:', err?.message || err));
        }

        // Merge LWW: perubahan lokal yang belum tersinkron tidak tertimpa snapshot server
        setProductsState(prev => mergeServerWithLocal(prods, prev, prodTombs));
      }
    }, (err) => console.warn('Products Firestore notice:', err?.message || err));

    // 2. Promotions Listener
    const unsubPromo = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      const promoTombs = readTombstones('nefakky_deleted_promotions');
      if (snapshot.empty) {
        const localPromos = readLS<PromotionItem[]>('nefakky_promotions_live', []);
        const source = (localPromos.length > 0 ? localPromos : DEFAULT_PROMOTIONS).filter(p => !promoTombs.has(p.id));
        const batch = writeBatch(db);
        source.forEach(p => {
          batch.set(doc(db, 'promotions', p.id), p);
        });
        batch.commit().catch(err => console.warn('Seeding promotions notice:', err?.message || err));
      } else {
        const promos = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as PromotionItem);
        setPromotionsState(prev => mergeServerWithLocal(promos, prev, promoTombs));
      }
    }, (err) => console.warn('Promotions Firestore notice:', err?.message || err));

    // 3. Vouchers Listener
    const unsubVouch = onSnapshot(collection(db, 'vouchers'), (snapshot) => {
      const vouchTombs = readTombstones('nefakky_deleted_vouchers');
      if (snapshot.empty) {
        const localVouchers = readLS<AdminVoucher[]>('nefakky_vouchers_live', []);
        const source = deduplicateVouchers((localVouchers.length > 0 ? localVouchers : DEFAULT_VOUCHERS).filter(v => !vouchTombs.has(v.id)));
        const batch = writeBatch(db);
        source.forEach(v => {
          batch.set(doc(db, 'vouchers', v.id), v);
        });
        batch.commit().catch(err => console.warn('Seeding vouchers notice:', err?.message || err));
      } else {
        const rawVouches = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as AdminVoucher);
        const normalizedRaw = rawVouches.map(v => {
          if (cleanPromoCode(v.code) === 'WEEKENDSERU' && (!v.validDays || v.validDays === 'Semua Hari')) {
            return { ...v, validDays: 'Weekend' };
          }
          return v;
        });

        // Bersihkan dokumen duplikat dari server Firestore jika memiliki kode promo yang sama
        const codeToDocs = new Map<string, AdminVoucher[]>();
        normalizedRaw.forEach(v => {
          const code = cleanPromoCode(v.code);
          if (code) {
            if (!codeToDocs.has(code)) codeToDocs.set(code, []);
            codeToDocs.get(code)!.push(v);
          }
        });

        codeToDocs.forEach((docList) => {
          if (docList.length > 1) {
            docList.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            const duplicates = docList.slice(1);
            duplicates.forEach(dup => {
              deleteDoc(doc(db, 'vouchers', dup.id)).catch(() => {});
            });
          }
        });

        const vouches = deduplicateVouchers(normalizedRaw);
        const existingIds = new Set(vouches.map(v => v.id));
        const existingCodes = new Set(vouches.map(v => cleanPromoCode(v.code)).filter(Boolean));
        const missingVouchers = DEFAULT_VOUCHERS.filter(v => 
          !existingIds.has(v.id) && 
          !existingCodes.has(cleanPromoCode(v.code)) && 
          !vouchTombs.has(v.id) && 
          !vouchTombs.has(cleanPromoCode(v.code))
        );
        if (missingVouchers.length > 0) {
          const batch = writeBatch(db);
          missingVouchers.forEach(v => {
            batch.set(doc(db, 'vouchers', v.id), v);
          });
          batch.commit().catch(err => console.warn('Seeding missing vouchers notice:', err?.message || err));
        }
        setVouchersState(prev => {
          const merged = mergeServerWithLocal([...vouches, ...missingVouchers], prev, vouchTombs);
          const deduped = deduplicateVouchers(merged);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('nefakky_vouchers_live', JSON.stringify(deduped));
            } catch (e) {}
          }
          return deduped;
        });
      }
    }, (err) => console.warn('Vouchers Firestore notice:', err?.message || err));

    // 4. Orders Listener & Persistent Synchronization
    let unsubOrders = () => {};
    try {
      unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
        if (!snapshot.empty) {
          const orderTombs = readTombstones('nefakky_deleted_orders');
          const ords = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as AdminOrder).filter(o => !orderTombs.has(o.id));
          setOrdersState(prev => {
            const mergedMap = new Map<string, AdminOrder>();
            const localSaved = readLS<AdminOrder[]>('nefakky_live_orders', []);
            localSaved.forEach(o => mergedMap.set(o.id, o));
            prev.forEach(o => mergedMap.set(o.id, o));
            ords.forEach(o => {
              const existing = mergedMap.get(o.id);
              // LWW: local menang bila updatedAt lebih baru (perubahan status belum tersinkron ke server)
              mergedMap.set(o.id, existing && (existing.updatedAt || 0) > (o.updatedAt || 0) ? existing : { ...(existing || {}), ...o });
            });
            const merged = Array.from(mergedMap.values()).filter(o => !orderTombs.has(o.id));
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('nefakky_live_orders', JSON.stringify(merged));
              } catch (e) {}
            }
            return merged;
          });
        }
      }, (err) => {
        console.warn('Orders Firestore snapshot notice (active with local persistent realtime bus):', err?.message);
      });
    } catch (err) {
      console.warn('Orders Firestore init notice:', err);
    }

    // 5. Reviews Listener
    const unsubRev = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const revTombs = readTombstones('nefakky_deleted_reviews');
      if (snapshot.empty) {
        const localReviews = readLS<UserReview[]>('nefakky_reviews_live', []);
        const source = (localReviews.length > 0 ? localReviews : DEFAULT_REVIEWS).filter(r => !revTombs.has(r.id));
        const batch = writeBatch(db);
        source.forEach(r => {
          batch.set(doc(db, 'reviews', r.id), r);
        });
        batch.commit().catch(err => console.warn('Seeding reviews notice:', err?.message || err));
      } else {
        const revs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as UserReview);
        setReviewsState(prev => sortReviewsNewestFirst(mergeServerWithLocal(revs, prev, revTombs)));
      }
    }, (err) => console.warn('Reviews Firestore notice:', err?.message || err));

    // 6. Chat Messages Listener
    const unsubChat = onSnapshot(collection(db, 'chat_messages'), (snapshot) => {
      const chatTombs = readTombstones('nefakky_deleted_chat');
      if (snapshot.empty) {
        const localChat = readLS<ChatMessage[]>('nefakky_chat_live', []);
        const source = (localChat.length > 0 ? localChat : DEFAULT_CHAT_MESSAGES).filter(c => !chatTombs.has(c.id));
        const batch = writeBatch(db);
        source.forEach(c => {
          batch.set(doc(db, 'chat_messages', c.id), c);
        });
        batch.commit().catch(err => console.warn('Seeding chat_messages notice:', err?.message || err));
      } else {
        const msgs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as ChatMessage);
        setChatMessagesState(prev => mergeServerWithLocal(msgs, prev, chatTombs));
      }
    }, (err) => console.warn('Chat Messages Firestore notice:', err?.message || err));

    return () => {
      unsubProd();
      unsubPromo();
      unsubVouch();
      unsubOrders();
      unsubRev();
      unsubChat();
    };
  }, []);

  // --------------------------------------------------------------------------
  // CROSS-TAB REALTIME SYNCHRONIZATION BUS (BroadcastChannel + Storage Event + CustomEvent)
  // Menjamin tab Admin (Kitchen Desk / Overview) & tab User (Status Pesanan)
  // menerima pesanan baru & update status instan 0ms tanpa perlu refresh.
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrderEvent = (data: any) => {
      if (!data || !data.type) return;

      if (data.type === 'ORDER_CREATED' && data.order) {
        setOrdersState(prev => {
          if (prev.some(o => o.id === data.order.id)) return prev;
          const updated = [data.order, ...prev];
          try {
            localStorage.setItem('nefakky_live_orders', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (data.type === 'ORDER_STATUS_UPDATED' && data.orderId) {
        setOrdersState(prev => {
          const updated = prev.map(o => o.id === data.orderId ? { ...o, ...(data.updates || {}), status: data.status || o.status } : o);
          try {
            localStorage.setItem('nefakky_live_orders', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (data.type === 'ORDER_DELETED' && data.orderId) {
        setOrdersState(prev => {
          const updated = prev.filter(o => o.id !== data.orderId);
          try {
            localStorage.setItem('nefakky_live_orders', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (data.type === 'VOUCHER_CREATED' && data.voucher) {
        setVouchersState(prev => {
          const filtered = prev.filter(v => v.id !== data.voucher.id && cleanPromoCode(v.code) !== cleanPromoCode(data.voucher.code));
          const updated = deduplicateVouchers([data.voucher, ...filtered]);
          try {
            localStorage.setItem('nefakky_vouchers_live', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (data.type === 'VOUCHER_UPDATED' && data.voucherId) {
        setVouchersState(prev => {
          const updated = deduplicateVouchers(prev.map(v => (v.id === data.voucherId || (data.code && cleanPromoCode(v.code) === cleanPromoCode(data.code))) ? { ...v, ...(data.updates || {}) } : v));
          try {
            localStorage.setItem('nefakky_vouchers_live', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (data.type === 'VOUCHER_DELETED' && data.voucherId) {
        setVouchersState(prev => {
          const updated = deduplicateVouchers(prev.filter(v => v.id !== data.voucherId && cleanPromoCode(v.code) !== cleanPromoCode(data.voucherCode || '')));
          try {
            localStorage.setItem('nefakky_vouchers_live', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (data.type === 'PROMOTION_CREATED' && data.promo) {
        setPromotionsState(prev => {
          if (prev.some(p => p.id === data.promo.id)) return prev;
          const updated = [data.promo, ...prev];
          try {
            localStorage.setItem('nefakky_promotions_live', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (data.type === 'PROMOTION_UPDATED' && data.promoId) {
        setPromotionsState(prev => {
          const updated = prev.map(p => p.id === data.promoId ? { ...p, ...(data.updates || {}) } : p);
          try {
            localStorage.setItem('nefakky_promotions_live', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (data.type === 'PROMOTION_DELETED' && data.promoId) {
        setPromotionsState(prev => {
          const updated = prev.filter(p => p.id !== data.promoId);
          try {
            localStorage.setItem('nefakky_promotions_live', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (data.type === 'CHAT_MESSAGE_SENT' && data.message) {
        setChatMessagesState(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          const updated = [...prev, data.message];
          try {
            localStorage.setItem('nefakky_chat_live', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (data.type === 'CHAT_MESSAGE_REPLIED' && data.message) {
        setChatMessagesState(prev => {
          const emailNorm = (data.userEmail || '').toLowerCase();
          const marked = prev.map(m => {
            if (m.userEmail.toLowerCase() === emailNorm && m.sender === 'user' && !m.readByAdmin) {
              return { ...m, readByAdmin: true };
            }
            return m;
          });
          if (marked.some(m => m.id === data.message.id)) return marked;
          const updated = [...marked, data.message];
          try {
            localStorage.setItem('nefakky_chat_live', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else if (data.type === 'CHAT_MESSAGES_READ') {
        setChatMessagesState(prev => {
          const emailNorm = (data.userEmail || '').toLowerCase();
          const hasUnread = prev.some(m => {
            if (m.userEmail.toLowerCase() === emailNorm) {
              if (data.role === 'admin') return !m.readByAdmin;
              if (data.role === 'user') return !m.readByUser;
            }
            return false;
          });
          if (!hasUnread) return prev;

          const updated = prev.map(m => {
            if (m.userEmail.toLowerCase() === emailNorm) {
              if (data.role === 'admin') return { ...m, readByAdmin: true };
              if (data.role === 'user') return { ...m, readByUser: true };
            }
            return m;
          });
          try {
            localStorage.setItem('nefakky_chat_live', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
    };

    let bc: BroadcastChannel | null = null;
    try {
      bc = getOrdersBroadcastChannel();
      if (bc) {
        bc.onmessage = (event) => handleOrderEvent(event?.data);
      }
    } catch (e) {
      console.warn('BroadcastChannel notice (active with storage event fallback)');
    }

    const handleCustomOrderEvent = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt?.detail?.type) {
        handleOrderEvent(customEvt.detail);
      } else {
        try {
          const stored = localStorage.getItem('nefakky_live_orders');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setOrdersState(parsed);
            }
          }
        } catch (err) {}
      }
    };
    window.addEventListener('nefakky_orders_updated', handleCustomOrderEvent);

    const handleCustomVoucherEvent = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt?.detail?.type) {
        handleOrderEvent(customEvt.detail);
      } else {
        try {
          const stored = localStorage.getItem('nefakky_vouchers_live');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setVouchersState(deduplicateVouchers(parsed));
            }
          }
        } catch (err) {}
      }
    };
    window.addEventListener('nefakky_vouchers_updated', handleCustomVoucherEvent);

    const handleCustomChatEvent = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt?.detail?.type) {
        handleOrderEvent(customEvt.detail);
      } else {
        try {
          const stored = localStorage.getItem('nefakky_chat_live');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setChatMessagesState(parsed);
            }
          }
        } catch (err) {}
      }
    };
    window.addEventListener('nefakky_chat_updated', handleCustomChatEvent);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nefakky_live_orders' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrdersState(parsed);
          }
        } catch (err) {}
      } else if (e.key === 'nefakky_vouchers_live' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setVouchersState(deduplicateVouchers(parsed));
          }
        } catch (err) {}
      } else if (e.key === 'nefakky_promotions_live' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setPromotionsState(parsed);
          }
        } catch (err) {}
      } else if (e.key === 'nefakky_chat_live' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setChatMessagesState(parsed);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('nefakky_orders_updated', handleCustomOrderEvent);
      window.removeEventListener('nefakky_vouchers_updated', handleCustomVoucherEvent);
      window.removeEventListener('nefakky_chat_updated', handleCustomChatEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // SINKRONISASI SERVER CHAT API (/api/chat)
  // Menjembatani percakapan realtime antara window Biasa (Admin) & Incognito/Private (User)
  // serta lintas-peramban tanpa tergantung izin Firestore/RTDB.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isSubscribed = true;

    // 1. Unggah riwayat chat lokal yang sudah ada ke server agar sesi lain langsung menerima
    try {
      const localExisting = readLS<ChatMessage[]>('nefakky_chat_live', []);
      if (localExisting && localExisting.length > 0) {
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sync', messages: localExisting })
        }).catch(() => {});
      }
    } catch (e) {}

    const syncWithServer = async () => {
      try {
        const res = await fetch('/api/chat', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!isSubscribed || !data.success || !Array.isArray(data.messages)) return;

        setChatMessagesState(prev => {
          const serverMsgs: ChatMessage[] = data.messages;
          const prevMap = new Map(prev.map(m => [m.id, m]));
          let changed = false;

          serverMsgs.forEach(sm => {
            const pm = prevMap.get(sm.id);
            if (!pm) {
              prevMap.set(sm.id, sm);
              changed = true;
            } else if (pm.readByAdmin !== sm.readByAdmin || pm.readByUser !== sm.readByUser || pm.text !== sm.text) {
              prevMap.set(sm.id, { ...pm, ...sm });
              changed = true;
            }
          });

          if (!changed && prev.length === serverMsgs.length) return prev;

          const merged = Array.from(prevMap.values());
          try {
            localStorage.setItem('nefakky_chat_live', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      } catch (e) {}
    };

    // Jalankan segera saat mount
    syncWithServer();

    // Polling interval 1.5 detik agar pesan antar window masuk secara instan
    const timer = setInterval(syncWithServer, 1500);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncWithServer();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isSubscribed = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // SINKRONISASI SERVER ORDERS API (/api/orders)
  // Menjembatani pesanan baru & update status realtime antara window Biasa (Admin) & Incognito/Private (User)
  // serta lintas-peramban tanpa tergantung izin Firebase Firestore/RTDB.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isSubscribed = true;

    // 1. Unggah pesanan lokal yang ada ke server store saat mount
    try {
      const localExisting = readLS<AdminOrder[]>('nefakky_live_orders', []);
      if (localExisting && localExisting.length > 0) {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sync', orders: localExisting })
        }).catch(() => {});
      }
    } catch (e) {}

    const syncOrdersWithServer = async () => {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!isSubscribed || !data.success || !Array.isArray(data.orders)) return;

        const tombs = readTombstones('nefakky_deleted_orders');
        const serverOrders: AdminOrder[] = data.orders.filter((o: any) => o && o.id && !tombs.has(o.id));

        setOrdersState(prev => {
          const prevMap = new Map<string, AdminOrder>();
          prev.forEach(o => prevMap.set(o.id, o));

          let changed = false;
          serverOrders.forEach(so => {
            if (tombs.has(so.id)) return;
            const po = prevMap.get(so.id);
            if (!po) {
              prevMap.set(so.id, so);
              changed = true;
            } else {
              const serverUpdated = so.updatedAt || so.createdAt || 0;
              const localUpdated = po.updatedAt || po.createdAt || 0;
              if (
                serverUpdated > localUpdated ||
                po.status !== so.status ||
                po.paymentBadge !== so.paymentBadge ||
                (so.proofPhoto && po.proofPhoto !== so.proofPhoto) ||
                (so.paymentProofPhoto && po.paymentProofPhoto !== so.paymentProofPhoto)
              ) {
                prevMap.set(so.id, { ...po, ...so });
                changed = true;
              }
            }
          });

          if (!changed && prev.length === prevMap.size) return prev;

          const merged = Array.from(prevMap.values()).filter(o => !tombs.has(o.id));
          merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

          try {
            localStorage.setItem('nefakky_live_orders', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      } catch (e) {}
    };

    // Jalankan segera saat mount
    syncOrdersWithServer();

    // Polling interval 1.5 detik agar pesanan masuk instan ke Kitchen Desk admin
    const timer = setInterval(syncOrdersWithServer, 1500);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncOrdersWithServer();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isSubscribed = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // RTDB REALTIME SUBSCRIPTION (Firebase Realtime Database)
  // Sebelumnya node `orders` & `live_orders` hanya DITULIS tapi tidak pernah
  // disubscribe, sehingga perubahan dari perangkat lain tidak pernah diterima.
  // Listener ini menjamin pesanan masuk & update status realtime lintas
  // perangkat/browser meskipun server Laravel Reverb sedang tidak aktif.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const persistOrders = (updater: (prev: AdminOrder[]) => AdminOrder[]) => {
      setOrdersState(prev => {
        const updated = updater(prev);
        try {
          localStorage.setItem('nefakky_live_orders', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    };

    const rtdbOrdersRef = ref(rtdb, 'orders');

    const unsubscribe = onValue(
      rtdbOrdersRef,
      (snapshot) => {
        if (!snapshot.exists()) return;
        const val = snapshot.val() as Record<string, Partial<AdminOrder>>;
        const rtdbTombs = readTombstones('nefakky_deleted_orders');
        const incoming = Object.entries(val)
          .filter(([id, o]) => id && o && typeof o === 'object' && !rtdbTombs.has(id))
          .map(([id, o]) => ({ ...(o as Partial<AdminOrder>), id }) as AdminOrder);
        if (incoming.length === 0) return;

        persistOrders(prev => {
          const mergedMap = new Map<string, AdminOrder>();
          const localSaved = readLS<AdminOrder[]>('nefakky_live_orders', []);
          localSaved.forEach(o => mergedMap.set(o.id, o));
          prev.forEach(o => mergedMap.set(o.id, o));
          incoming.forEach(o => {
            const existing = mergedMap.get(o.id);
            // LWW: local menang bila updatedAt lebih baru (perubahan belum tersinkron)
            mergedMap.set(o.id, existing && (existing.updatedAt || 0) > (o.updatedAt || 0) ? existing : (existing ? { ...existing, ...o } : o));
          });
          return Array.from(mergedMap.values()).filter(o => !rtdbTombs.has(o.id));
        });
      },
      (err) => {
        console.warn('RTDB orders listener notice:', err?.message);
      }
    );

    // Listener child terpisah agar pesanan BARU langsung muncul tanpa
    // menunggu snapshoot ulang (latensi lebih rendah / True realtime).
    const childAdded = onChildAdded(rtdbOrdersRef, (snap) => {
      const o = snap.val();
      if (!o) return;
      if (readTombstones('nefakky_deleted_orders').has(snap.key || '')) return;
      const incoming = { ...o, id: snap.key } as AdminOrder;
      persistOrders(prev =>
        prev.some(x => x.id === incoming.id)
          ? prev.map(x => (x.id === incoming.id ? ((x.updatedAt || 0) > (incoming.updatedAt || 0) ? x : { ...x, ...incoming }) : x))
          : [incoming, ...prev]
      );
    });

    const childChanged = onChildChanged(rtdbOrdersRef, (snap) => {
      const o = snap.val();
      if (!o) return;
      const incoming = { ...o, id: snap.key } as AdminOrder;
      persistOrders(prev => prev.map(x => (x.id === incoming.id ? ((x.updatedAt || 0) > (incoming.updatedAt || 0) ? x : { ...x, ...incoming }) : x)));
    });

    const childRemoved = onChildRemoved(rtdbOrdersRef, (snap) => {
      if (!snap.key) return;
      persistOrders(prev => prev.filter(x => x.id !== snap.key));
    });

    return () => {
      try {
        unsubscribe();
        // onChild* mengembalikan fungsi unsubscribe di Firebase v9+
        if (typeof childAdded === 'function') (childAdded as () => void)();
        if (typeof childChanged === 'function') (childChanged as () => void)();
        if (typeof childRemoved === 'function') (childRemoved as () => void)();
      } catch (e) {
        // Ignore cleanup errors
      }
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
        setDoc(doc(db, 'products', p.id), cleanP, { merge: true }).catch(() => {});
      });
      return next;
    });
  };

  const setPromotions: React.Dispatch<React.SetStateAction<PromotionItem[]>> = (action) => {
    setPromotionsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(p => {
        setDoc(doc(db, 'promotions', p.id), cleanForFirestore(p), { merge: true }).catch(() => {});
      });
      return next;
    });
  };

  const setVouchers: React.Dispatch<React.SetStateAction<AdminVoucher[]>> = (action) => {
    setVouchersState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      const deduped = deduplicateVouchers(next);
      deduped.forEach(v => {
        setDoc(doc(db, 'vouchers', v.id), cleanForFirestore(v), { merge: true }).catch(() => {});
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_vouchers_live', JSON.stringify(deduped));
        } catch (e) {}
      }
      return deduped;
    });
  };

  const setOrders: React.Dispatch<React.SetStateAction<AdminOrder[]>> = (action) => {
    setOrdersState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(o => {
        setDoc(doc(db, 'orders', o.id), cleanForFirestore(o), { merge: true }).catch(() => {});
      });
      return next;
    });
  };

  const setReviews: React.Dispatch<React.SetStateAction<UserReview[]>> = (action) => {
    setReviewsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(r => {
        setDoc(doc(db, 'reviews', r.id), cleanForFirestore(r), { merge: true }).catch(() => {});
      });
      return next;
    });
  };

  const setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> = (action) => {
    setChatMessagesState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      next.forEach(c => {
        setDoc(doc(db, 'chat_messages', c.id), cleanForFirestore(c), { merge: true }).catch(() => {});
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
      status: productData.status ?? 'Active',
      updatedAt: Date.now()
    };
    const cleanProd = cleanForFirestore(newProduct) as ProductItem;
    setProductsState(prev => [cleanProd, ...prev]);
    try {
      setDoc(doc(db, 'products', newId), cleanProd).catch(() => {});
    } catch (e) {
      console.warn('Catch addProduct setDoc error:', e);
    }
    return cleanProd;
  };

  const updateProduct = (id: string, updated: Partial<ProductItem>) => {
    const cleanUpdated = { ...cleanForFirestore(updated), updatedAt: Date.now() };
    const prevProduct = products.find(p => p.id === id);
    setProductsState(prev => prev.map(p => p.id === id ? { ...p, ...cleanUpdated } : p));
    try {
      updateDoc(doc(db, 'products', id), cleanUpdated).catch(err => console.warn('updateProduct error:', err));
    } catch (e) {
      console.warn('Catch updateProduct updateDoc error:', e);
    }

    // Restock dari habis (0) → notifikasi otomatis ke user yang pernah reservasi lewat chat CS
    const newStockValue = (updated as ProductItem).stock;
    if (prevProduct && (Number(prevProduct.stock) || 0) <= 0 && typeof newStockValue === 'number' && newStockValue > 0) {
      try {
        const notified = new Set<string>();
        chatMessages
          .filter(m => m.sender === 'user' && String(m.text || '').includes('[RESERVASI PRODUK HABIS]') && String(m.text || '').includes(prevProduct.name))
          .forEach(m => {
            const email = String(m.userEmail || '').trim().toLowerCase();
            if (!email || notified.has(email)) return;
            notified.add(email);
            replyChatMessage(email, `Kabar baik! Stok "${prevProduct.name}" sudah kembali tersedia (restock). Pesanan reservasi Anda akan diprioritaskan lebih dahulu. Silakan segera lakukan pemesanan kembali atau balas chat ini untuk konfirmasi.`);
          });
      } catch (e) {}
    }
  };

  const deleteProduct = (id: string) => {
    setProductsState(prev => prev.filter(p => p.id !== id));
    try {
      if (typeof window !== 'undefined') {
        const tombs = readTombstones('nefakky_deleted_products');
        tombs.add(id);
        localStorage.setItem('nefakky_deleted_products', JSON.stringify(Array.from(tombs)));
      }
    } catch (e) {}
    try {
      deleteDoc(doc(db, 'products', id)).catch(() => {});
    } catch (e) {
      console.warn('Catch deleteProduct error:', e);
    }
  };

  const toggleProductVisibility = (id: string) => {
    const target = products.find(p => p.id === id);
    if (target) {
      const nextVis = !target.visibility;
      const nextStatus = nextVis ? 'Active' : 'Inactive';
      setProductsState(prev => prev.map(p => p.id === id ? { ...p, visibility: nextVis, status: nextStatus, updatedAt: Date.now() } : p));
      try {
        updateDoc(doc(db, 'products', id), {
          visibility: nextVis,
          status: nextStatus,
          updatedAt: Date.now()
        }).catch(() => {});
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
      isActive: promoData.isActive ?? true,
      updatedAt: Date.now()
    };
    setPromotionsState(prev => {
      const filtered = prev.filter(p => p.id !== newId);
      const updated = [newPromo, ...filtered];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_promotions_live', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        if (bc) bc.postMessage({ type: 'PROMOTION_CREATED', promo: newPromo });
        window.dispatchEvent(new CustomEvent('nefakky_vouchers_updated', { detail: { type: 'PROMOTION_CREATED', promo: newPromo } }));
      } catch (e) {}
    }

    try {
      setDoc(doc(db, 'promotions', newId), cleanForFirestore(newPromo)).catch(() => {});
    } catch (e) {}
    return newPromo;
  };

  const deletePromotion = (id: string) => {
    setPromotionsState(prev => {
      const updated = prev.filter(p => p.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_promotions_live', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        if (bc) bc.postMessage({ type: 'PROMOTION_DELETED', promoId: id });
        window.dispatchEvent(new CustomEvent('nefakky_vouchers_updated', { detail: { type: 'PROMOTION_DELETED', promoId: id } }));
      } catch (e) {}
    }

    try {
      deleteDoc(doc(db, 'promotions', id)).catch(() => {});
      deleteDoc(doc(db, 'vouchers', id)).catch(() => {});
    } catch (e) {}
  };

  const togglePromotionActive = (id: string) => {
    const target = promotions.find(p => p.id === id);
    if (target) {
      const nextActive = !target.isActive;
      const promoUpdates = {
        isActive: nextActive,
        badge: (nextActive ? 'Active' : 'Ended') as PromotionItem['badge'],
        updatedAt: Date.now()
      };
      setPromotionsState(prev => {
        const updated = prev.map(p => p.id === id ? { ...p, ...promoUpdates } : p);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('nefakky_promotions_live', JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });

      if (typeof window !== 'undefined') {
        try {
          const bc = getOrdersBroadcastChannel();
          if (bc) bc.postMessage({ type: 'PROMOTION_UPDATED', promoId: id, updates: promoUpdates });
          window.dispatchEvent(new CustomEvent('nefakky_vouchers_updated', { detail: { type: 'PROMOTION_UPDATED', promoId: id, updates: promoUpdates } }));
        } catch (e) {}
      }

      try {
        updateDoc(doc(db, 'promotions', id), cleanForFirestore(promoUpdates)).catch(() => {});
      } catch (e) {}

      const matchingVoucher = vouchers.find(v => v.id === id || (v.code && target.title.toLowerCase().includes(v.code.toLowerCase())));
      if (matchingVoucher) {
        const vUpdates = {
          status: (nextActive ? 'Active' : 'Expired') as AdminVoucher['status'],
          isActive: nextActive,
          updatedAt: Date.now()
        };
        setVouchersState(prev => {
          const updated = prev.map(v => v.id === matchingVoucher.id ? { ...v, ...vUpdates } : v);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('nefakky_vouchers_live', JSON.stringify(updated));
            } catch (e) {}
          }
          return updated;
        });

        if (typeof window !== 'undefined') {
          try {
            const bc = getOrdersBroadcastChannel();
            if (bc) bc.postMessage({ type: 'VOUCHER_UPDATED', voucherId: matchingVoucher.id, updates: vUpdates });
            window.dispatchEvent(new CustomEvent('nefakky_vouchers_updated', { detail: { type: 'VOUCHER_UPDATED', voucherId: matchingVoucher.id, updates: vUpdates } }));
          } catch (e) {}
        }

        try {
          updateDoc(doc(db, 'vouchers', matchingVoucher.id), cleanForFirestore(vUpdates)).catch(() => {});
        } catch (e) {}
      }
    }
  };

  const addVoucher = (voucherData: Omit<AdminVoucher, 'id'> & { id?: string }): AdminVoucher => {
    const cleanCode = cleanPromoCode(voucherData.code);
    
    // Cari apakah voucher dengan kode atau ID ini sudah ada sebelumnya
    const existing = vouchers.find(v => 
      (cleanCode && cleanPromoCode(v.code) === cleanCode) || 
      (voucherData.id && v.id === voucherData.id)
    );

    // Prioritaskan ID yang sudah ada agar tidak membuat dokumen Firestore ganda
    const newId = voucherData.id || (existing ? existing.id : `v_${Date.now()}`);

    const newVoucher: AdminVoucher = {
      ...voucherData,
      id: newId,
      code: cleanCode,
      name: voucherData.name || `Promo Diskon ${voucherData.discountPercent}%`,
      discountPercent: Number(voucherData.discountPercent) || 10,
      minSpend: Number(voucherData.minSpend) || 0,
      status: (voucherData.status as any) || 'Active',
      isActive: voucherData.isActive !== false,
      validDays: voucherData.validDays || 'Semua Hari',
      lastResetWeek: getISOWeekString(),
      updatedAt: Date.now()
    };

    // Update state lokal & localStorage secara instan sinkron
    setVouchersState(prev => {
      const filtered = prev.filter(v => cleanPromoCode(v.code) !== cleanCode && v.id !== newId);
      const updated = deduplicateVouchers([newVoucher, ...filtered]);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_vouchers_live', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // Jika voucher sebelumnya memiliki ID berbeda, bersihkan dokumen lama dari Firestore
    if (existing && existing.id !== newId) {
      deleteDoc(doc(db, 'vouchers', existing.id)).catch(() => {});
    }

    // Cross-tab & same-window instant broadcast
    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        if (bc) bc.postMessage({ type: 'VOUCHER_CREATED', voucher: newVoucher });
        window.dispatchEvent(new CustomEvent('nefakky_vouchers_updated', { detail: { type: 'VOUCHER_CREATED', voucher: newVoucher } }));
      } catch (e) {}
    }

    // Simpan ke Firestore secara aman (tanpa undefined)
    try {
      setDoc(doc(db, 'vouchers', newId), cleanForFirestore(newVoucher)).catch(() => {});
    } catch (e) {}

    // Sinkronkan juga ke promotions collection & state
    const newPromo: PromotionItem = {
      id: newId,
      title: newVoucher.name,
      subtitle: `Diskon ${newVoucher.discountPercent}% (Min. Rp ${(newVoucher.minSpend || 0).toLocaleString('id-ID')})`,
      tag: newVoucher.event || 'Promo Spesial',
      badge: 'Active',
      image: '/images/ayam_bakar.jpg',
      duration: newVoucher.expiry || '31 Des 2026',
      type: 'Voucher',
      usedCount: 0,
      totalLimit: newVoucher.totalLimit || 100,
      isActive: true,
      updatedAt: Date.now()
    };

    setPromotionsState(prev => {
      const filtered = prev.filter(p => p.id !== newId);
      const updated = [newPromo, ...filtered];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_promotions_live', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    try {
      setDoc(doc(db, 'promotions', newId), cleanForFirestore(newPromo)).catch(() => {});
    } catch (e) {}

    return newVoucher;
  };

  const updateVoucher = (id: string, updated: Partial<AdminVoucher>) => {
    const cleanCode = updated.code ? cleanPromoCode(updated.code) : undefined;
    const finalUpdates = {
      ...updated,
      ...(cleanCode ? { code: cleanCode } : {}),
      updatedAt: Date.now()
    };
    setVouchersState(prev => {
      const updatedList = prev.map(v => (v.id === id || (cleanCode && cleanPromoCode(v.code) === cleanCode)) ? { ...v, ...finalUpdates } : v);
      const deduped = deduplicateVouchers(updatedList);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_vouchers_live', JSON.stringify(deduped));
        } catch (e) {}
      }
      return deduped;
    });

    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        if (bc) bc.postMessage({ type: 'VOUCHER_UPDATED', voucherId: id, code: cleanCode, updates: finalUpdates });
        window.dispatchEvent(new CustomEvent('nefakky_vouchers_updated', { detail: { type: 'VOUCHER_UPDATED', voucherId: id, code: cleanCode, updates: finalUpdates } }));
      } catch (e) {}
    }

    try {
      updateDoc(doc(db, 'vouchers', id), cleanForFirestore(finalUpdates)).catch(() => {});
      if (cleanCode) {
        vouchers
          .filter(v => v.id !== id && cleanPromoCode(v.code) === cleanCode)
          .forEach(v => deleteDoc(doc(db, 'vouchers', v.id)).catch(() => {}));
      }
    } catch (e) {}
  };

  const deleteVoucher = (id: string) => {
    const target = vouchers.find(v => v.id === id || cleanPromoCode(v.code) === cleanPromoCode(id));
    const targetId = target ? target.id : id;
    const targetCode = target ? target.code : id;
    const cleanTarget = cleanPromoCode(targetCode);

    setVouchersState(prev => {
      const updatedList = prev.filter(v => v.id !== targetId && cleanPromoCode(v.code) !== cleanTarget);
      const deduped = deduplicateVouchers(updatedList);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_vouchers_live', JSON.stringify(deduped));
        } catch (e) {}
      }
      return deduped;
    });

    const promoIds = promotions
      .filter(p => p.id === targetId || (target && target.code && p.title && p.title.toLowerCase().includes(target.code.toLowerCase())))
      .map(p => p.id);
    setPromotionsState(prev => {
      const updatedPromos = prev.filter(p => p.id !== targetId && !promoIds.includes(p.id));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_promotions_live', JSON.stringify(updatedPromos));
        } catch (e) {}
      }
      return updatedPromos;
    });

    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        if (bc) bc.postMessage({ type: 'VOUCHER_DELETED', voucherId: targetId, voucherCode: targetCode });
        window.dispatchEvent(new CustomEvent('nefakky_vouchers_updated', { detail: { type: 'VOUCHER_DELETED', voucherId: targetId, voucherCode: targetCode } }));
      } catch (e) {}
    }

    try {
      if (typeof window !== 'undefined') {
        const vTombs = readTombstones('nefakky_deleted_vouchers');
        vTombs.add(targetId);
        if (cleanTarget) vTombs.add(cleanTarget);
        localStorage.setItem('nefakky_deleted_vouchers', JSON.stringify(Array.from(vTombs)));
        const pTombs = readTombstones('nefakky_deleted_promotions');
        promoIds.concat([targetId]).forEach(pid => pTombs.add(pid));
        localStorage.setItem('nefakky_deleted_promotions', JSON.stringify(Array.from(pTombs)));
      }
    } catch (e) {}
    try {
      deleteDoc(doc(db, 'vouchers', targetId)).catch(() => {});
      if (cleanTarget) {
        vouchers
          .filter(v => v.id !== targetId && cleanPromoCode(v.code) === cleanTarget)
          .forEach(v => deleteDoc(doc(db, 'vouchers', v.id)).catch(() => {}));
      }
      deleteDoc(doc(db, 'promotions', targetId)).catch(() => {});
    } catch (e) {
      console.warn('Catch deleteVoucher error:', e);
    }
  };

  const toggleVoucherStatus = (id: string) => {
    const target = vouchers.find(v => v.id === id || cleanPromoCode(v.code) === cleanPromoCode(id));
    if (target) {
      const nextActive = !(target.status === 'Active' && target.isActive !== false);
      const updates = {
        status: (nextActive ? 'Active' : 'Expired') as AdminVoucher['status'],
        isActive: nextActive,
        updatedAt: Date.now()
      };

      setVouchersState(prev => {
        const updatedList = prev.map(v => (v.id === target.id || cleanPromoCode(v.code) === cleanPromoCode(target.code)) ? { ...v, ...updates } : v);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('nefakky_vouchers_live', JSON.stringify(updatedList));
          } catch (e) {}
        }
        return updatedList;
      });

      if (typeof window !== 'undefined') {
        try {
          const bc = getOrdersBroadcastChannel();
          if (bc) bc.postMessage({ type: 'VOUCHER_UPDATED', voucherId: target.id, updates });
          window.dispatchEvent(new CustomEvent('nefakky_vouchers_updated', { detail: { type: 'VOUCHER_UPDATED', voucherId: target.id, updates } }));
        } catch (e) {}
      }

      try {
        updateDoc(doc(db, 'vouchers', target.id), cleanForFirestore(updates)).catch(() => {});
      } catch (e) {}

      const matchingPromo = promotions.find(p => p.id === target.id || (p.title && p.title.toLowerCase().includes(target.code.toLowerCase())));
      if (matchingPromo) {
        const promoUpdates = {
          isActive: nextActive,
          badge: (nextActive ? 'Active' : 'Ended') as PromotionItem['badge'],
          updatedAt: Date.now()
        };
        setPromotionsState(prev => {
          const updatedPromos = prev.map(p => p.id === matchingPromo.id ? { ...p, ...promoUpdates } : p);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('nefakky_promotions_live', JSON.stringify(updatedPromos));
            } catch (e) {}
          }
          return updatedPromos;
        });
        try {
          updateDoc(doc(db, 'promotions', matchingPromo.id), cleanForFirestore(promoUpdates)).catch(() => {});
        } catch (e) {}
      }
    }
  };

  const addOrder = (orderData: Partial<AdminOrder> & Omit<AdminOrder, 'date'>): AdminOrder => {
    const callerId = (orderData as any).id || (orderData as any).orderId;
    const newId = callerId ? String(callerId).trim() : `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const nowStr = formatCurrentRealtimeOrderDate(now);
    const newOrder: AdminOrder = {
      id: newId,
      customerName: (orderData.customerName || 'Pelanggan Nefakky').trim(),
      customerEmail: orderData.customerEmail || '',
      userId: orderData.userId || '',
      avatar: orderData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(orderData.customerName || 'Pelanggan')}&background=1C1917&color=ffffff`,
      address: (orderData.address || 'Alamat Pengiriman').trim(),
      phone: orderData.phone || '',
      items: orderData.items || [],
      itemCount: orderData.itemCount || (orderData.items ? orderData.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 1),
      paymentMethod: orderData.paymentMethod || 'Online Midtrans',
      paymentBadge: orderData.paymentBadge || 'PAID',
      deliveryType: orderData.deliveryType || 'KURIR NEFAKKY',
      distance: orderData.distance || '4.2 Km',
      status: orderData.status || 'RECEIVED',
      subtotal: orderData.subtotal || 0,
      shippingCost: orderData.shippingCost || 0,
      discount: orderData.discount || 0,
      total: orderData.total || 0,
      voucherCode: orderData.voucherCode || '',
      appliedPromo: orderData.appliedPromo || '',
      date: orderData.date || nowStr,
      createdAt: typeof orderData.createdAt === 'number' && orderData.createdAt > 0 ? orderData.createdAt : now.getTime(),
      customerConfirmed: false,
      updatedAt: now.getTime()
    };

    // Auto-Info "MEMBLUDAK": >10 pesanan dalam 1 jam terakhir → banner estimasi ~1,5 jam untuk user
    try {
      const oneHourAgo = now.getTime() - 60 * 60 * 1000;
      const recentActive = orders.filter(o => o.createdAt && o.createdAt >= oneHourAgo && !['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(o.status)).length + 1;
      if (recentActive > 10 && !isHighDemand) {
        toggleHighDemand(true, 'Pemesanan sedang MEMBLUDAK! Dapur melayani banyak pesanan sekaligus, mohon menunggu kurang lebih 1 JAM 30 MENIT. Terima kasih atas kesabaran Anda!');
      }
    } catch (e) {}

    // 1. Immediate local React state update & LocalStorage persistence
    setOrdersState(prev => {
      const filtered = prev.filter(o => o.id !== newId);
      const updated = [newOrder, ...filtered];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_live_orders', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // 2. Broadcast cross-tab & same-window event
    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        if (bc) bc.postMessage({ type: 'ORDER_CREATED', order: newOrder });
        window.dispatchEvent(new CustomEvent('nefakky_orders_updated', { detail: { type: 'ORDER_CREATED', order: newOrder } }));
      } catch (e) {}
    }

    // Deduct stock for ordered products & variants in realtime
    if (Array.isArray(newOrder.items) && newOrder.items.length > 0) {
      setProductsState(prevProducts => {
        const updatedProducts = prevProducts.map(p => {
          let pCopy = { ...p };
          let isModified = false;

          for (const it of newOrder.items) {
            const rawId = String(it.id || '');
            const [baseId, rawVariant] = rawId.split('_');
            const itName = String(it.name || '').toLowerCase().trim();
            const pName = String(p.name || '').toLowerCase().trim();
            const qty = Math.max(1, Number(it.quantity) || 1);

            // Cek apakah item pesanan ini cocok dengan produk p
            const isIdMatch = p.id === baseId || p.id === rawId || p.sku === rawId || p.sku === baseId;
            const isNameExactMatch = pName === itName;
            const isDrinkMatch = (p.category === 'Minuman' || p.id === 'm6' || pName.includes('jus')) && itName.includes('jus');
            const isNamePartialMatch = pName.includes(itName.replace(/jus\s*|\s*segar/gi, '').trim()) || itName.includes(pName);

            const isMatch = isIdMatch || isNameExactMatch || isDrinkMatch || isNamePartialMatch;

            if (isMatch) {
              isModified = true;

              // Deteksi nama varian (contoh: 'Mangga', 'Sirsak', 'Jambu')
              let detectedVariant: string | null = null;
              if (rawVariant) {
                detectedVariant = rawVariant.charAt(0).toUpperCase() + rawVariant.slice(1).toLowerCase();
              } else if (itName.includes('mangga')) {
                detectedVariant = 'Mangga';
              } else if (itName.includes('sirsak')) {
                detectedVariant = 'Sirsak';
              } else if (itName.includes('jambu')) {
                detectedVariant = 'Jambu';
              }

              // Jika produk memiliki variantStocks (seperti Jus Segar)
              if (pCopy.variantStocks) {
                const updatedVarStocks = { ...pCopy.variantStocks };

                if (detectedVariant) {
                  const matchingKey = Object.keys(updatedVarStocks).find(
                    k => k.toLowerCase() === detectedVariant!.toLowerCase()
                  ) || detectedVariant;

                  const currentVarStock = Number(updatedVarStocks[matchingKey] ?? 15);
                  updatedVarStocks[matchingKey] = Math.max(0, currentVarStock - qty);
                } else {
                  for (const k of Object.keys(updatedVarStocks)) {
                    if (updatedVarStocks[k] > 0) {
                      updatedVarStocks[k] = Math.max(0, updatedVarStocks[k] - qty);
                      break;
                    }
                  }
                }

                pCopy.variantStocks = updatedVarStocks;
                pCopy.stock = Object.values(updatedVarStocks).reduce((sum, v) => sum + (Number(v) || 0), 0);
              } else {
                pCopy.stock = Math.max(0, (Number(pCopy.stock) || 0) - qty);
              }

              if (pCopy.stock < 5) {
                pCopy.status = 'Low Stock';
              }
              pCopy.updatedAt = Date.now();
            }
          }

          if (isModified) {
            const cleanProd = cleanForFirestore(pCopy);
            updateDoc(doc(db, 'products', p.id), cleanProd).catch(() => {});
            setRtdb(ref(rtdb, `products/${p.id}`), cleanProd).catch(() => {});
            setRtdb(ref(rtdb, `live_products/${p.id}`), cleanProd).catch(() => {});
          }

          return pCopy;
        });

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('nefakky_products_live', JSON.stringify(updatedProducts));
          } catch (e) {
            console.warn(e);
          }
        }

        return updatedProducts;
      });
    }

    const cleanOrder = cleanForFirestore(newOrder);
    setDoc(doc(db, 'orders', newId), cleanOrder).catch(() => {});
    setRtdb(ref(rtdb, `orders/${newId}`), cleanOrder).catch(() => {});
    setRtdb(ref(rtdb, `live_orders/${newId}`), {
      id: newId,
      status: newOrder.status,
      customerName: newOrder.customerName,
      total: newOrder.total,
      updatedAt: Date.now()
    }).catch(() => {});

    // Sinkronisasi pesanan ke server API agar langsung diterima admin di window/browser lain
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', order: newOrder })
      }).catch(() => {});
    } catch (e) {}

    return newOrder;
  };

  const updateOrderStatus = (id: string, status: AdminOrder['status']) => {
    const target = orders.find(o => o.id === id);
    const isCod = target?.paymentMethod?.toLowerCase().includes('cod') || target?.paymentMethod?.toLowerCase().includes('cash on delivery');
    
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const updates: Partial<AdminOrder> & Record<string, any> = {
      status,
      updatedAt: Date.now()
    };

    if (status === 'COMPLETED') {
      updates.customerConfirmed = true;
      updates.confirmedAt = `Hari ini, ${timeStr} WIB`;
      if (isCod) {
        updates.paymentBadge = 'PAID';
      }
    }

    setOrdersState(prev => {
      const updated = prev.map(o => o.id === id ? { ...o, ...updates } : o);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_live_orders', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        bc?.postMessage({ type: 'ORDER_STATUS_UPDATED', orderId: id, status, updates });
        window.dispatchEvent(new CustomEvent('nefakky_orders_updated'));
      } catch (e) {}
    }

    updateDoc(doc(db, 'orders', id), cleanForFirestore(updates)).catch(() => {});
    updateRtdb(ref(rtdb, `orders/${id}`), cleanForFirestore(updates)).catch(() => {});
    updateRtdb(ref(rtdb, `live_orders/${id}`), updates).catch(() => {});

    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', orderId: id, status, updates })
      }).catch(() => {});
    } catch (e) {}
  };

  const updatePaymentStatus = (id: string, badge: AdminOrder['paymentBadge']) => {
    setOrdersState(prev => {
      const updated = prev.map(o => o.id === id ? { ...o, paymentBadge: badge } : o);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_live_orders', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        bc?.postMessage({ type: 'ORDER_STATUS_UPDATED', orderId: id, updates: { paymentBadge: badge } });
        window.dispatchEvent(new CustomEvent('nefakky_orders_updated'));
      } catch (e) {}
    }

    updateDoc(doc(db, 'orders', id), { paymentBadge: badge }).catch(() => {});
    updateRtdb(ref(rtdb, `orders/${id}`), { paymentBadge: badge, updatedAt: Date.now() }).catch(() => {});

    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', orderId: id, updates: { paymentBadge: badge } })
      }).catch(() => {});
    } catch (e) {}
  };

  const deleteOrder = (id: string) => {
    setOrdersState(prev => {
      const updated = prev.filter(o => o.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_live_orders', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    try {
      if (typeof window !== 'undefined') {
        const tombs = readTombstones('nefakky_deleted_orders');
        tombs.add(id);
        localStorage.setItem('nefakky_deleted_orders', JSON.stringify(Array.from(tombs)));
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        bc?.postMessage({ type: 'ORDER_DELETED', orderId: id });
        window.dispatchEvent(new CustomEvent('nefakky_orders_updated'));
      } catch (e) {}
    }

    try {
      deleteDoc(doc(db, 'orders', id)).catch(() => {});
      removeRtdb(ref(rtdb, `orders/${id}`)).catch(() => {});
      removeRtdb(ref(rtdb, `live_orders/${id}`)).catch(() => {});
    } catch (e) {
      console.warn('Catch deleteOrder error:', e);
    }

    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', orderId: id })
      }).catch(() => {});
    } catch (e) {}
  };

  const cancelOrder = (id: string, reason?: string) => {
    const target = orders.find(o => o.id === id);
    if (target) {
      const updates = {
        status: 'CANCELLED' as AdminOrder['status'],
        paymentBadge: target.paymentBadge === 'PAID' ? ('REFUNDED' as AdminOrder['paymentBadge']) : target.paymentBadge,
        updatedAt: Date.now(),
        cancelReason: reason || 'Dibatalkan oleh sistem/admin'
      };

      setOrdersState(prev => {
        const updated = prev.map(o => o.id === id ? { ...o, ...updates } : o);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('nefakky_live_orders', JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });

      if (typeof window !== 'undefined') {
        try {
          const bc = getOrdersBroadcastChannel();
          bc?.postMessage({ type: 'ORDER_STATUS_UPDATED', orderId: id, status: 'CANCELLED', updates });
          window.dispatchEvent(new CustomEvent('nefakky_orders_updated'));
        } catch (e) {}
      }

      updateDoc(doc(db, 'orders', id), cleanForFirestore(updates)).catch(() => {});
      updateRtdb(ref(rtdb, `orders/${id}`), cleanForFirestore(updates)).catch(() => {});
      updateRtdb(ref(rtdb, `live_orders/${id}`), { status: 'CANCELLED', updatedAt: Date.now() }).catch(() => {});

      try {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cancel', orderId: id, reason: reason || 'Dibatalkan oleh sistem/admin' })
        }).catch(() => {});
      } catch (e) {}
    }
  };

  const customerConfirmOrder = (id: string) => {
    const targetOrder = orders.find(o => o.id === id);
    const isCod = targetOrder?.paymentMethod?.toLowerCase().includes('cod') || targetOrder?.paymentMethod?.toLowerCase().includes('cash on delivery');

    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateStr = `Hari ini, ${timeStr} WIB`;
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

    setOrdersState(prev => {
      const updated = prev.map(o => o.id === id ? { ...o, ...updates } : o);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_live_orders', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        bc?.postMessage({ type: 'ORDER_STATUS_UPDATED', orderId: id, status: 'COMPLETED', updates });
        window.dispatchEvent(new CustomEvent('nefakky_orders_updated'));
      } catch (e) {}
    }

    updateDoc(doc(db, 'orders', id), cleanForFirestore(updates)).catch(() => {});
    updateRtdb(ref(rtdb, `orders/${id}`), cleanForFirestore(updates)).catch(() => {});
    updateRtdb(ref(rtdb, `live_orders/${id}`), updates).catch(() => {});

    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', orderId: id, status: 'COMPLETED', updates })
      }).catch(() => {});
    } catch (e) {}
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
    setOrdersState(prev => {
      const updated = prev.map(o => o.id === id ? { ...o, ...updates } : o);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_live_orders', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        bc?.postMessage({ type: 'ORDER_STATUS_UPDATED', orderId: id, status: 'COMPLETED', updates });
        window.dispatchEvent(new CustomEvent('nefakky_orders_updated'));
      } catch (e) {}
    }

    updateDoc(doc(db, 'orders', id), cleanUpdates).catch(() => {});
    updateRtdb(ref(rtdb, `orders/${id}`), cleanUpdates).catch(() => {});
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
    }).catch(() => {});

    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', orderId: id, status: 'COMPLETED', updates: cleanUpdates })
      }).catch(() => {});
    } catch (e) {}
  };

  const uploadOrderProofPhoto = (id: string, proofPhotoUrl: string) => {
    const updates = {
      proofPhoto: proofPhotoUrl,
      updatedAt: Date.now()
    };

    // Local state sync using correct setter setOrdersState
    setOrdersState(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));

    updateDoc(doc(db, 'orders', id), updates).catch(() => {});
    updateRtdb(ref(rtdb, `orders/${id}`), updates).catch(() => {});
    updateRtdb(ref(rtdb, `live_orders/${id}`), updates).catch(() => {});

    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'proof_photo', orderId: id, proofPhoto: proofPhotoUrl })
      }).catch(() => {});
    } catch (e) {}
  };

  const uploadOrderPaymentProofPhoto = (id: string, paymentProofPhotoUrl: string) => {
    const updates = {
      paymentProofPhoto: paymentProofPhotoUrl,
      updatedAt: Date.now()
    };

    // Local state sync using correct setter setOrdersState
    setOrdersState(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));

    updateDoc(doc(db, 'orders', id), updates).catch(() => {});
    updateRtdb(ref(rtdb, `orders/${id}`), updates).catch(() => {});
    updateRtdb(ref(rtdb, `live_orders/${id}`), updates).catch(() => {});

    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'proof_photo', orderId: id, paymentProofPhoto: paymentProofPhotoUrl })
      }).catch(() => {});
    } catch (e) {}
  };

  /** Helper pembersih kode voucher (menghapus tanda #, spasi, dan kapitalisasi) */
  const cleanPromoCode = (c?: string | null): string => {
    return (c || '').trim().toUpperCase().replace(/^#+/, '');
  };

  /** Helper function untuk memeriksa apakah voucher sudah pernah digunakan oleh pengguna */
  const isVoucherUsedByUser = (voucherCode?: string, userUid?: string | null, userEmail?: string | null): boolean => {
    if (!voucherCode) return false;
    const cleanTargetCode = cleanPromoCode(voucherCode);
    if (!cleanTargetCode) return false;

    const isNewCustomerVoucher = cleanTargetCode === 'NEFAKKY10' || cleanTargetCode.includes('NEWUSER') || cleanTargetCode.includes('PELANGGANBARU');

    // 1. SSR & Initial Hydration Guard: jangan baca localStorage sebelum hidrasi selesai (mencegah React Hydration Mismatch)
    if (typeof window === 'undefined' || !isHydratedRef.current) {
      return false;
    }

    // Jika pengguna sudah login, periksa HANYA penyimpanan akun miliknya (bukan sesi anonim browser lama)
    const keysToCheck = (userUid || userEmail)
      ? [
          userUid ? `nefakky_used_vouchers_${userUid}` : null,
          userEmail ? `nefakky_used_vouchers_${userEmail.toLowerCase().trim()}` : null
        ].filter(Boolean) as string[]
      : ['nefakky_used_vouchers_session'];

    for (const storageKey of keysToCheck) {
      try {
        const existing: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (existing.some(c => cleanPromoCode(c) === cleanTargetCode)) {
          return true;
        }
      } catch (e) {
        console.warn(e);
      }
    }

    // 2. Riwayat pesanan (orders): HANYA untuk promo PELANGGAN BARU (blokir permanen 1x per akun).
    // Akun baru (orders === 0 untuk userId/email ini) selalu berhak mendapatkan promo pelanggan baru.
    if (isNewCustomerVoucher) {
      const userOrders = (orders || []).filter(o => {
        const isUidMatch = Boolean(userUid && o.userId && o.userId === userUid);
        const isEmailMatch = Boolean(userEmail && o.customerEmail && o.customerEmail.toLowerCase().trim() === userEmail.toLowerCase().trim());
        return isUidMatch || isEmailMatch;
      });

      const hasUsedInOrders = userOrders.some(o => {
        const raw = o.voucherCode || o.appliedPromo;
        if (!raw) return false;
        const codes = String(raw).split(/[,+\s]+/).map(c => cleanPromoCode(c)).filter(Boolean);
        return codes.includes(cleanTargetCode);
      });

      if (hasUsedInOrders) return true;

      // Jika akun sudah memiliki riwayat pesanan (orders >= 1), berarti bukan pelanggan baru lagi
      if (userOrders.length > 0) {
        return true;
      }
    }

    return false;
  };

  /**
   * Helper function untuk memverifikasi apakah akun pengguna telah membeli produk tertentu
   * Digunakan untuk memastikan ulasan hanya ditulis oleh pembeli asli (anti-fake review).
   */
  const hasUserPurchasedProduct = (productIdOrName: string, userUid?: string | null, userEmail?: string | null): boolean => {
    if (!productIdOrName) return false;
    if (!userUid && !userEmail) return false;

    // Admin selalu memiliki akses terverifikasi untuk kemudahan demo/testing
    if (isAdminEmail(userEmail)) return true;

    const cleanTarget = productIdOrName.trim().toLowerCase();

    // Saring pesanan milik pengguna yang valid (bukan dibatalkan/dihapus)
    const userOrders = (orders || []).filter(o => {
      if (o.isDeleted || o.status === 'CANCELLED') return false;
      const isUidMatch = Boolean(userUid && o.userId && o.userId === userUid);
      const isEmailMatch = Boolean(userEmail && o.customerEmail && o.customerEmail.toLowerCase().trim() === userEmail.toLowerCase().trim());
      return isUidMatch || isEmailMatch;
    });

    return userOrders.some(o => {
      return (o.items || []).some(item => {
        const itemId = (item.id || '').toLowerCase();
        const itemName = (item.name || '').toLowerCase();
        return itemId === cleanTarget || itemName === cleanTarget || itemName.includes(cleanTarget) || cleanTarget.includes(itemName);
      });
    });
  };

  /**
   * Helper function untuk mendapatkan daftar semua hidangan yang pernah dibeli pengguna
   */
  const getUserPurchasedProducts = (userUid?: string | null, userEmail?: string | null): ProductItem[] => {
    if (!userUid && !userEmail) return [];

    // Jika admin, kembalikan seluruh menu yang aktif
    if (isAdminEmail(userEmail)) {
      return (products || []).filter(p => p.visibility !== false && !p.isDeleted);
    }

    const userOrders = (orders || []).filter(o => {
      if (o.isDeleted || o.status === 'CANCELLED') return false;
      const isUidMatch = Boolean(userUid && o.userId && o.userId === userUid);
      const isEmailMatch = Boolean(userEmail && o.customerEmail && o.customerEmail.toLowerCase().trim() === userEmail.toLowerCase().trim());
      return isUidMatch || isEmailMatch;
    });

    const purchasedIds = new Set<string>();
    const purchasedNames = new Set<string>();

    userOrders.forEach(o => {
      (o.items || []).forEach(item => {
        if (item.id) purchasedIds.add(item.id.toLowerCase());
        if (item.name) purchasedNames.add(item.name.toLowerCase());
      });
    });

    return (products || []).filter(p => {
      return purchasedIds.has(p.id.toLowerCase()) || purchasedNames.has(p.name.toLowerCase());
    });
  };

  /** Helper function untuk mereset data penggunaan voucher (oleh Admin di Dashboard Promosi) */
  const resetVoucherUsage = async (voucherIdOrCode: string): Promise<boolean> => {
    if (!voucherIdOrCode) return false;
    const cleanCode = cleanPromoCode(voucherIdOrCode);

    // 1. Bersihkan localStorage catatan used voucher di seluruh browser
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('nefakky_used_vouchers_'));
        for (const k of keysToRemove) {
          const arr: string[] = JSON.parse(localStorage.getItem(k) || '[]');
          const filtered = arr.filter(c => cleanPromoCode(c) !== cleanCode);
          localStorage.setItem(k, JSON.stringify(filtered));
        }
      } catch (e) {
        console.warn(e);
      }
    }

    // 2. Update status & reset usedCount di Firestore Database
    const target = vouchers.find(v => v.id === voucherIdOrCode || cleanPromoCode(v.code) === cleanCode);
    if (target && db) {
      const isNewCust = target.event === 'Pelanggan Baru' || cleanPromoCode(target.code).includes('NEFAKKY10');
      const limit = target.totalLimit || 500;
      const redemptions = isNewCust ? '1x Per Pengguna Baru' : `0/${limit}`;

      const updates = {
        usedCount: 0,
        redemptions,
        status: 'Active' as AdminVoucher['status'],
        isActive: true,
        lastResetWeek: getISOWeekString(),
        updatedAt: Date.now()
      };

      setVouchersState(prev => prev.map(v => (v.id === target.id || cleanPromoCode(v.code) === cleanCode) ? { ...v, ...updates } : v));
      await updateDoc(doc(db, 'vouchers', target.id), updates).catch(() => {});
      return true;
    }

    return false;
  };

  /** Helper function untuk mengklaim penggunaan voucher & mematikan promo otomatis secara realtime jika kuota habis */
  const claimVoucherRedemption = async (voucherCode: string, userUid?: string | null, userEmail?: string | null): Promise<boolean> => {
    if (!voucherCode) return false;
    const codes = String(voucherCode).split(/[,+\s]+/).map(c => cleanPromoCode(c)).filter(Boolean);
    if (codes.length === 0) return false;

    for (const cleanCode of codes) {
      try {
        // 1. Simpan langsung ke localStorage user & session browser agar instan ter-filter dari tampilan
        if (typeof window !== 'undefined') {
          const keysToSave = [
            userUid ? `nefakky_used_vouchers_${userUid}` : null,
            userEmail ? `nefakky_used_vouchers_${userEmail.toLowerCase().trim()}` : null,
            'nefakky_used_vouchers_session'
          ].filter(Boolean) as string[];

          for (const storageKey of keysToSave) {
            try {
              const existing: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
              if (!existing.some(c => cleanPromoCode(c) === cleanCode)) {
                existing.push(cleanCode);
                localStorage.setItem(storageKey, JSON.stringify(existing));
              }
            } catch (e) {
              console.warn(e);
            }
          }
        }

        // 2. Simpan catatan riwayat klaim ke Firestore collection 'voucher_redemptions'
        if (db) {
          try {
            const redemptionsCol = collection(db, 'voucher_redemptions');
            await addDoc(redemptionsCol, {
              voucherCode: cleanCode,
              userId: userUid || 'anonymous',
              userEmail: userEmail || '',
              redeemedAt: Date.now()
            });
          } catch (e) {
            console.warn("Firestore redemption record error:", e);
          }
        }

        // 3. Update kuota dan redemptions voucher di Firestore secara realtime
        if (db) {
          const q = collection(db, 'vouchers');
          const snapshot = await getDocs(q);
          const targetDoc = snapshot.docs.find(d => {
            const data = d.data();
            const docCode = cleanPromoCode(data.code || d.id);
            return docCode === cleanCode;
          });

          if (targetDoc) {
            const v = targetDoc.data();
            const isNewCust = v.event === 'Pelanggan Baru' || cleanPromoCode(v.code).includes('NEFAKKY10');
            const isTanpaBatas = (v.redemptions === 'Tanpa Batas' || (v.redemptions && String(v.redemptions).toLowerCase().includes('tanpa batas'))) && !isNewCust;

            if (isNewCust) {
              const newUsed = (v.usedCount || 0) + 1;
              await updateDoc(doc(db, 'vouchers', targetDoc.id), {
                usedCount: newUsed,
                redemptions: '1x Per Pengguna Baru',
                expiry: 'Selamanya',
                status: 'Active',
                isActive: true,
                updatedAt: Date.now()
              });
            } else if (isTanpaBatas) {
              const newUsed = (v.usedCount || 0) + 1;
              await updateDoc(doc(db, 'vouchers', targetDoc.id), {
                usedCount: newUsed,
                redemptions: 'Tanpa Batas',
                expiry: 'Selamanya',
                status: 'Active',
                isActive: true,
                updatedAt: Date.now()
              });
            } else {
              let usedCount = v.usedCount || 0;
              let totalLimit = v.totalLimit || 500;

              if (v.redemptions && String(v.redemptions).includes('/')) {
                const parts = String(v.redemptions).split('/');
                if (parts.length === 2) {
                  usedCount = parseInt(parts[0].trim(), 10) || usedCount;
                  totalLimit = parseInt(parts[1].trim(), 10) || totalLimit;
                }
              }

              const newUsed = usedCount + 1;
              const isNowExpired = newUsed >= totalLimit;
              const newRedemptions = `${newUsed}/${totalLimit}`;

              await updateDoc(doc(db, 'vouchers', targetDoc.id), {
                usedCount: newUsed,
                totalLimit,
                redemptions: newRedemptions,
                status: isNowExpired ? 'Expired' : 'Active',
                isActive: !isNowExpired,
                updatedAt: Date.now()
              });
            }
          }
        }

        // 4. Perbarui state lokal vouchers agar langsung re-render
        setVouchersState(prev => prev.map(v => {
          if (cleanPromoCode(v.code) === cleanCode) {
            return { ...v, usedCount: (v.usedCount || 0) + 1, updatedAt: Date.now() };
          }
          return v;
        }));
      } catch (err) {
        console.warn('Error claiming single voucher code:', cleanCode, err);
      }
    }

    return true;
  };

  const addReview = (reviewData: Omit<UserReview, 'id' | 'date' | 'likesCount'>): UserReview => {
    const newId = `rev_${Date.now()}`;
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewData.authorName)}&background=5C3D28&color=ffffff&bold=true`;
    const avatar = reviewData.avatar || defaultAvatar;

    // Verifikasi otomatis status pembeli terverifikasi (mencegah ulasan palsu)
    const isBuyer = reviewData.isVerifiedBuyer ?? hasUserPurchasedProduct(
      reviewData.productName || reviewData.productId || '',
      null,
      reviewData.authorEmail
    );

    const newReview: UserReview = {
      ...reviewData,
      id: newId,
      avatar,
      authorAvatar: avatar,
      date: 'Baru saja',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likesCount: 0,
      status: 'PUBLISHED',
      isVerifiedBuyer: isBuyer
    };

    setReviewsState(prev => sortReviewsNewestFirst([newReview, ...prev]));
    setDoc(doc(db, 'reviews', newId), newReview).catch(() => {});

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
        }).catch(() => {});
      }
    }

    return newReview;
  };

  const deleteReview = (id: string) => {
    const reviewToDelete = reviews.find(r => r.id === id);
    deleteDoc(doc(db, 'reviews', id)).catch(() => {});

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
          }).catch(() => {});
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
        updateDoc(doc(db, 'reviews', reviewId), { replies: target.replies }).catch(() => {});
        setRtdb(ref(rtdb, `reviews/${reviewId}`), target).catch(() => {});
      }

      return updated;
    });
  };

  const sendChatMessage = (userEmail: string, userName: string, text: string, userAvatar?: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const emailNorm = userEmail.trim().toLowerCase();
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      userEmail: emailNorm,
      userName: userName || 'Pelanggan',
      userAvatar,
      text: text.trim(),
      timestamp: timeStr,
      readByAdmin: false,
      readByUser: true,
      ...(mediaUrl ? { mediaUrl, mediaType: mediaType || 'image' } : {})
    };

    // 1. Update state lokal & localStorage seketika (0ms)
    setChatMessagesState(prev => {
      const updated = [...prev, newMsg];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_chat_live', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // 2. Broadcast ke tab lain & window events
    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        if (bc) bc.postMessage({ type: 'CHAT_MESSAGE_SENT', message: newMsg });
        window.dispatchEvent(new CustomEvent('nefakky_chat_updated', { detail: { type: 'CHAT_MESSAGE_SENT', message: newMsg } }));
      } catch (e) {}
    }

    // 3. Simpan ke Firestore & RTDB secara aman
    try {
      const cleanMsg = cleanForFirestore(newMsg);
      setDoc(doc(db, 'chat_messages', newMsg.id), cleanMsg).catch(() => {});
      setRtdb(ref(rtdb, `chat_messages/${newMsg.id}`), cleanMsg).catch(() => {});
    } catch (e) {}

    // 4. Sinkronkan ke Server Chat API (/api/chat) agar langsung diterima Admin di browser/incognito lain
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send', message: newMsg })
        }).catch(() => {});
      } catch (e) {}
    }
  };

  const replyChatMessage = (userEmail: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const emailNorm = userEmail.trim().toLowerCase();
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'admin',
      userEmail: emailNorm,
      userName: 'Admin CS Nefakky',
      text: text.trim(),
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
      const finalList = [...updated, newMsg];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_chat_live', JSON.stringify(finalList));
        } catch (e) {}
      }
      return finalList;
    });

    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        if (bc) bc.postMessage({ type: 'CHAT_MESSAGE_REPLIED', message: newMsg, userEmail: emailNorm });
        window.dispatchEvent(new CustomEvent('nefakky_chat_updated', { detail: { type: 'CHAT_MESSAGE_REPLIED', message: newMsg, userEmail: emailNorm } }));
      } catch (e) {}
    }

    try {
      const cleanMsg = cleanForFirestore(newMsg);
      setDoc(doc(db, 'chat_messages', newMsg.id), cleanMsg).catch(() => {});
      setRtdb(ref(rtdb, `chat_messages/${newMsg.id}`), cleanMsg).catch(() => {});
    } catch (e) {}

    // Sinkronkan ke server chat API
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reply', message: newMsg, userEmail: emailNorm })
        }).catch(() => {});
      } catch (e) {}
    }

    // Update Firestore documents
    chatMessages.forEach(m => {
      if (m.userEmail.toLowerCase() === emailNorm && m.sender === 'user' && !m.readByAdmin) {
        updateDoc(doc(db, 'chat_messages', m.id), { readByAdmin: true }).catch(() => {});
      }
    });
  };

  const markChatAsRead = useCallback((userEmail: string, role: 'admin' | 'user') => {
    if (!userEmail) return;
    const emailNorm = userEmail.trim().toLowerCase();

    let hasChanges = false;
    const firestoreUpdates: string[] = [];

    setChatMessagesState(prev => {
      const needsUpdate = prev.some(m => {
        if (m.userEmail.toLowerCase() === emailNorm) {
          if (role === 'admin') return !m.readByAdmin;
          if (role === 'user') return !m.readByUser;
        }
        return false;
      });

      // PENTING: Jika tidak ada pesan yang perlu ditandai, hentikan agar tidak re-render
      if (!needsUpdate) return prev;
      hasChanges = true;

      const updated = prev.map(m => {
        if (m.userEmail.toLowerCase() === emailNorm) {
          if (role === 'admin' && !m.readByAdmin) {
            firestoreUpdates.push(m.id);
            return { ...m, readByAdmin: true };
          } else if (role === 'user' && !m.readByUser) {
            firestoreUpdates.push(m.id);
            return { ...m, readByUser: true };
          }
        }
        return m;
      });

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nefakky_chat_live', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // Jika tidak ada pesan yang ditandai, jangan jalankan broadcast/API/Firestore
    if (!hasChanges) return;

    if (typeof window !== 'undefined') {
      try {
        const bc = getOrdersBroadcastChannel();
        if (bc) bc.postMessage({ type: 'CHAT_MESSAGES_READ', userEmail: emailNorm, role });
      } catch (e) {}
    }

    // Sinkronkan status baca ke server chat API
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'markRead', userEmail: emailNorm, role })
        }).catch(() => {});
      } catch (e) {}
    }

    // Update Firestore documents secara spesifik untuk item yang berubah
    try {
      firestoreUpdates.forEach(id => {
        updateDoc(doc(db, 'chat_messages', id), role === 'admin' ? { readByAdmin: true } : { readByUser: true }).catch(() => {});
      });
    } catch (e) {}
  }, []);

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
          console.warn("Failed to parse saved high demand setting", e);
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
      resetVoucherUsage,
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
      markChatAsRead,
      isHydrated,
      hasUserPurchasedProduct,
      getUserPurchasedProducts
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
