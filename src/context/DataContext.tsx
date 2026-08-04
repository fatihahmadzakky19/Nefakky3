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
}

/** Interface Data Pesanan (Orders) */
export interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail?: string;
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
  authorBadge: 'PLATINUM' | 'GOLD' | 'MEMBER';
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
    origin: 'Jakarta, Indonesia',
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
    origin: 'Jawa Barat, Indonesia',
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
    origin: 'Yogyakarta, Indonesia',
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
    origin: 'Yogyakarta, Indonesia',
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
    origin: 'Kudus, Jawa Tengah',
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
    origin: 'Indonesia',
    calories: '130 kcal',
    fat: '0.5g',
    sugar: '24g',
    satFat: '0g'
  }
];

export const DEFAULT_PROMOTIONS: PromotionItem[] = [
  {
    id: 'promo-1',
    title: 'Promo Ayam Bakar 30%',
    subtitle: 'Ayam bakar pejantan pilihan dengan kecap rempah pilihan.',
    tag: '30% OFF',
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
    name: 'Promo Ayam Bakar Rempah 30%',
    type: 'Percentage',
    discountPercent: 30,
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
      { id: 'm1', name: 'Ayam Bakar Rempah', price: 35000, quantity: 2, image: '/images/ayam_bakar.jpg' },
      { id: 'm6', name: 'Jus Segar (Jambu, Sirsak, Mangga)', price: 15000, quantity: 2, image: '/images/jus_mangga.jpg' }
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
      { id: 'm1', name: 'Ayam Bakar Rempah', price: 35000, quantity: 3, image: '/images/ayam_bakar.jpg' },
      { id: 'm2', name: 'Nasi Bakar Cumi', price: 28000, quantity: 2, image: '/images/nasi_bakar.jpg' }
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
      { id: 'm4', name: 'Gudeg Komplit Jogja', price: 32000, quantity: 2, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
      { id: 'm6', name: 'Jus Segar (Jambu, Sirsak, Mangga)', price: 15000, quantity: 2, image: '/images/jus_mangga.jpg' }
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
      { id: 'm1', name: 'Ayam Bakar Rempah', price: 35000, quantity: 1, image: '/images/ayam_bakar.jpg' },
      { id: 'm3', name: 'Krecek Pedas Gurih', price: 22000, quantity: 1, image: '/images/krecek.jpg' }
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
    authorBadge: 'PLATINUM',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Kemarin',
    productName: 'Ayam Bakar Rempah Bango',
    productImage: '/images/ayam_bakar.jpg',
    comment: 'Ayam bakarnya sangat empuk dan bumbu kecap rempahnya meresap sempurna sampai ke dalam. Pengiriman super cepat!',
    likesCount: 12,
    status: 'PUBLISHED'
  },
  {
    id: 'rev-2',
    authorName: 'Siti Rahma',
    authorEmail: 'siti@example.com',
    authorBadge: 'GOLD',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '2 hari lalu',
    productName: 'Gudeg Komplit Jogja',
    productImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    comment: 'Gudeg paling otentik yang pernah saya pesan online. Bumbu kreceknya gurih pedas manis beraroma harum.',
    likesCount: 8,
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

  // Load from localStorage on mount & listen to storage events for cross-tab live updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProd = localStorage.getItem('nefakky_products');
      if (savedProd) {
        try {
          const parsed = JSON.parse(savedProd);
          const hasOldNamesOrImages = parsed.some((p: any) => 
            p.name.includes('Wagyu') || 
            p.name.includes('Truffle') || 
            p.name.includes('Sate') || 
            p.name.includes('Rendang') ||
            p.name.includes('Olive') ||
            p.name.includes('Sourdough') ||
            p.name.includes('Honey') ||
            p.name.includes('Spice') ||
            p.name.includes('Bango') ||
            p.name.includes('Spesial') ||
            p.name.includes('Jogja') ||
            p.name.includes('Kampung') ||
            p.name.includes('Jus Segar') ||
            p.image?.includes('unsplash') ||
            p.image?.includes('hero_rendang')
          );
          if (hasOldNamesOrImages || !Array.isArray(parsed) || parsed.length === 0) {
            localStorage.setItem('nefakky_products', JSON.stringify(DEFAULT_PRODUCTS));
            setProductsState(DEFAULT_PRODUCTS);
          } else {
            setProductsState(parsed);
          }
        } catch (e) {
          setProductsState(DEFAULT_PRODUCTS);
        }
      } else {
        localStorage.setItem('nefakky_products', JSON.stringify(DEFAULT_PRODUCTS));
      }

      const savedPromo = localStorage.getItem('nefakky_promotions');
      if (savedPromo) {
        try { setPromotionsState(JSON.parse(savedPromo)); } catch (e) {}
      } else {
        localStorage.setItem('nefakky_promotions', JSON.stringify(DEFAULT_PROMOTIONS));
      }

      const savedVouch = localStorage.getItem('nefakky_vouchers');
      if (savedVouch) {
        try { setVouchersState(JSON.parse(savedVouch)); } catch (e) {}
      }

      const savedOrd = localStorage.getItem('nefakky_orders');
      if (savedOrd) {
        try { setOrdersState(JSON.parse(savedOrd)); } catch (e) {}
      }

      const savedRev = localStorage.getItem('nefakky_reviews');
      if (savedRev) {
        try { setReviewsState(JSON.parse(savedRev)); } catch (e) {}
      }

      const savedChat = localStorage.getItem('nefakky_chat_messages');
      if (savedChat) {
        try { setChatMessagesState(JSON.parse(savedChat)); } catch (e) {}
      }

      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'nefakky_promotions' && e.newValue) {
          try { setPromotionsState(JSON.parse(e.newValue)); } catch (err) {}
        }
        if (e.key === 'nefakky_orders' && e.newValue) {
          try { setOrdersState(JSON.parse(e.newValue)); } catch (err) {}
        }
        if (e.key === 'nefakky_products' && e.newValue) {
          try { setProductsState(JSON.parse(e.newValue)); } catch (err) {}
        }
        if (e.key === 'nefakky_vouchers' && e.newValue) {
          try { setVouchersState(JSON.parse(e.newValue)); } catch (err) {}
        }
        if (e.key === 'nefakky_reviews' && e.newValue) {
          try { setReviewsState(JSON.parse(e.newValue)); } catch (err) {}
        }
        if (e.key === 'nefakky_chat_messages' && e.newValue) {
          try { setChatMessagesState(JSON.parse(e.newValue)); } catch (err) {}
        }
      };

      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
  }, []);

  const setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>> = (action) => {
    setProductsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_products', JSON.stringify(next));
      }
      return next;
    });
  };

  const setPromotions: React.Dispatch<React.SetStateAction<PromotionItem[]>> = (action) => {
    setPromotionsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_promotions', JSON.stringify(next));
      }
      return next;
    });
  };

  const setVouchers: React.Dispatch<React.SetStateAction<AdminVoucher[]>> = (action) => {
    setVouchersState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_vouchers', JSON.stringify(next));
      }
      return next;
    });
  };

  const setOrders: React.Dispatch<React.SetStateAction<AdminOrder[]>> = (action) => {
    setOrdersState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_orders', JSON.stringify(next));
      }
      return next;
    });
  };

  const setReviews: React.Dispatch<React.SetStateAction<UserReview[]>> = (action) => {
    setReviewsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_reviews', JSON.stringify(next));
      }
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
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updated: Partial<ProductItem>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleProductVisibility = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const nextVis = !p.visibility;
        return {
          ...p,
          visibility: nextVis,
          status: (nextVis ? 'Active' : 'Inactive') as ProductItem['status']
        };
      }
      return p;
    }));
  };

  const addPromotion = (promoData: Omit<PromotionItem, 'id'>): PromotionItem => {
    const newId = `promo-${Date.now()}`;
    const newPromo: PromotionItem = {
      ...promoData,
      id: newId,
      badge: promoData.badge || 'Active',
      isActive: promoData.isActive ?? true
    };
    setPromotions(prev => [newPromo, ...prev]);
    return newPromo;
  };

  const deletePromotion = (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    setVouchers(prev => prev.filter(v => v.id !== id));
  };

  const togglePromotionActive = (id: string) => {
    setPromotions(prev => prev.map(p => {
      if (p.id === id) {
        const nextActive = !p.isActive;
        return {
          ...p,
          isActive: nextActive,
          badge: (nextActive ? 'Active' : 'Ended') as PromotionItem['badge']
        };
      }
      return p;
    }));
  };

  const addVoucher = (voucherData: Omit<AdminVoucher, 'id'>): AdminVoucher => {
    const newId = `v_${Date.now()}`;
    const newVoucher: AdminVoucher = {
      ...voucherData,
      id: newId,
      code: voucherData.code.toUpperCase(),
      status: voucherData.status || 'Active'
    };
    setVouchers(prev => [newVoucher, ...prev]);
    return newVoucher;
  };

  const deleteVoucher = (id: string) => {
    setVouchers(prev => prev.filter(v => v.id !== id));
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  const addOrder = (orderData: Omit<AdminOrder, 'id' | 'date'>): AdminOrder => {
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `ORD-${orderNum}`;
    const nowStr = `Hari ini, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    const newOrder: AdminOrder = {
      ...orderData,
      id: newId,
      date: nowStr
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: AdminOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const updatePaymentStatus = (id: string, badge: AdminOrder['paymentBadge']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentBadge: badge } : o));
  };

  const addReview = (reviewData: Omit<UserReview, 'id' | 'date' | 'likesCount'>): UserReview => {
    const newId = `rev_${Date.now()}`;
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewData.authorName)}&background=5C3D28&color=ffffff&bold=true`;
    const avatar = reviewData.avatar || defaultAvatar;
    const newReview: UserReview = {
      ...reviewData,
      id: newId,
      authorBadge: reviewData.authorBadge || 'MEMBER',
      avatar,
      authorAvatar: avatar,
      date: 'Baru saja',
      likesCount: 0,
      status: 'PUBLISHED'
    };

    setReviews(prev => [newReview, ...prev]);

    // Recalculate Product Average Rating automatically
    if (reviewData.productName) {
      const targetName = reviewData.productName.toLowerCase();
      setProducts(prevProducts => prevProducts.map(prod => {
        if (prod.name.toLowerCase() === targetName || prod.id === reviewData.productName) {
          const currentRating = prod.rating || 5.0;
          const currentCount = prod.reviewsCount || 10;
          
          // Formula Rata-rata Tertimbang (Weighted Average)
          const totalPoints = (currentRating * currentCount) + reviewData.rating;
          const newCount = currentCount + 1;
          const newAvgRating = Math.max(1.0, Math.min(5.0, Number((totalPoints / newCount).toFixed(1))));

          return {
            ...prod,
            rating: newAvgRating,
            reviewsCount: newCount
          };
        }
        return prod;
      }));
    }

    return newReview;
  };

  const deleteReview = (id: string) => {
    const reviewToDelete = reviews.find(r => r.id === id);
    setReviews(prev => prev.filter(r => r.id !== id));

    if (reviewToDelete && reviewToDelete.productName) {
      const targetName = reviewToDelete.productName.toLowerCase();
      setProducts(prevProducts => prevProducts.map(prod => {
        if (prod.name.toLowerCase() === targetName || prod.id === reviewToDelete.productName) {
          const currentRating = prod.rating || 5.0;
          const currentCount = prod.reviewsCount || 10;
          if (currentCount > 1) {
            const totalPoints = (currentRating * currentCount) - reviewToDelete.rating;
            const newCount = currentCount - 1;
            const newAvgRating = Math.max(1.0, Math.min(5.0, Number((totalPoints / newCount).toFixed(1))));

            return {
              ...prod,
              rating: newAvgRating,
              reviewsCount: newCount
            };
          }
        }
        return prod;
      }));
    }
  };

  const setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> = (action) => {
    setChatMessagesState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nefakky_chat_messages', JSON.stringify(next));
      }
      return next;
    });
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
    setChatMessages(prev => [...prev, newMsg]);
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
    setChatMessages(prev => [...prev, newMsg]);
  };

  const markChatAsRead = (userEmail: string, role: 'admin' | 'user') => {
    const emailNorm = userEmail.trim().toLowerCase();
    setChatMessages(prev => prev.map(m => {
      if (m.userEmail.toLowerCase() === emailNorm) {
        if (role === 'admin') return { ...m, readByAdmin: true };
        if (role === 'user') return { ...m, readByUser: true };
      }
      return m;
    }));
  };

  const toggleVoucherStatus = (id: string) => {
    setVouchers(prev => prev.map(v => {
      if (v.id === id || v.code.toUpperCase() === id.toUpperCase()) {
        const nextActive = !(v.status === 'Active' && v.isActive !== false);
        return {
          ...v,
          status: nextActive ? 'Active' : 'Expired',
          isActive: nextActive
        };
      }
      return v;
    }));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const cancelOrder = (id: string, reason?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: 'CANCELLED',
          paymentBadge: o.paymentBadge === 'PAID' ? 'REFUNDED' : o.paymentBadge
        };
      }
      return o;
    }));
  };

  const confirmOrderReceived = (id: string) => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateStr = `Hari ini, ${timeStr}`;
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: 'COMPLETED',
          customerConfirmed: true,
          confirmedAt: dateStr
        };
      }
      return o;
    }));
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
