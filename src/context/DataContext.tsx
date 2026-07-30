'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  paymentBadge: 'PAID' | 'AWAITING' | 'REFUNDED';
  deliveryType: 'EXPRESS' | 'STANDARD' | 'SAME DAY';
  status: 'SHIPPING' | 'COOKING' | 'COMPLETED' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  date: string;
}

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
    text: 'Halo Min, saya mau tanya apakah pesanan Wagyu Bowl saya bisa request tanpa daun bawang?',
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
    name: 'Special Wagyu Bowl',
    sku: 'SKU-9812-V',
    category: 'Makanan Berat',
    price: 85000,
    discount: 0,
    stock: 25,
    visibility: true,
    status: 'Active',
    rating: 4.9,
    reviewsCount: 128,
    soldCount: '1.2k+ Terjual',
    image: '/images/wagyu_bowl.png',
    gallery: ['/images/wagyu_bowl.png'],
    description: 'Nasi hangat dengan irisan daging wagyu premium dan kualitas istimewa disajikan dengan kuning telur segar.',
    badge: 'TERPOPULER',
    ingredients: 'Daging Wagyu MB7, Beras Jepang Premium, Telur Organik, Saus Shoyu Special.',
    usageAdvice: 'Santap selagi hangat',
    origin: 'Jakarta, Indonesia',
    calories: '650 kcal',
    fat: '22g',
    sugar: '4g',
    satFat: '8g'
  },
  {
    id: 'm2',
    name: 'Creamy Truffle Pasta',
    sku: 'SKU-9813-V',
    category: 'Makanan Berat',
    price: 72000,
    discount: 10,
    stock: 18,
    visibility: true,
    status: 'Active',
    rating: 4.8,
    reviewsCount: 94,
    soldCount: '850 Terjual',
    image: '/images/truffle_pasta.png',
    gallery: ['/images/truffle_pasta.png'],
    description: 'Pasta artisanal dengan saus truffle putih creamy bertabur parutan keju parmesan impor.',
    badge: 'BARU',
    ingredients: 'Fettuccine Artisanal, Extra Virgin Truffle Oil, Parmesan Cheese, Heavy Cream.',
    usageAdvice: 'Sajikan segera',
    origin: 'Umbria, Italy / Jakarta',
    calories: '720 kcal',
    fat: '34g',
    sugar: '2g',
    satFat: '14g'
  },
  {
    id: 'm3',
    name: 'Sate Ayam Madura',
    sku: 'SKU-9814-V',
    category: 'Makanan Berat',
    price: 45000,
    discount: 0,
    stock: 40,
    visibility: true,
    status: 'Active',
    rating: 4.9,
    reviewsCount: 210,
    soldCount: '2.1k Terjual',
    image: '/images/sate_ayam.png',
    gallery: ['/images/sate_ayam.png'],
    description: 'Daging ayam pilihan dibakar dengan bumbu kacang khas Madura yang kaya rasa.',
    badge: 'TERPOPULER',
    ingredients: 'Daging Dada Ayam Pilihan, Kacang Tanah Sangrai, Kecap Manis Bango, Lontong.',
    usageAdvice: 'Kocok bumbu kacang sebelum disantap',
    origin: 'Madura, Indonesia',
    calories: '480 kcal',
    fat: '18g',
    sugar: '12g',
    satFat: '4g'
  },
  {
    id: 'm4',
    name: 'Rendang Daging Premium',
    sku: 'SKU-9815-V',
    category: 'Makanan Berat',
    price: 75000,
    discount: 0,
    stock: 30,
    visibility: true,
    status: 'Active',
    rating: 5.0,
    reviewsCount: 312,
    soldCount: '3.5k Terjual',
    image: '/images/hero_rendang.png',
    gallery: ['/images/hero_rendang.png'],
    description: 'Daging sapi olahan 12 jam dengan rempah padang pilihan khas warisan leluhur.',
    badge: 'TERPOPULER',
    ingredients: 'Daging Sapi Has Dalam, Santan Kelapa Murni, Rempah-rempah Komplit Minang.',
    usageAdvice: 'Bisa dipanaskan kembali',
    origin: 'Padang, Indonesia',
    calories: '550 kcal',
    fat: '28g',
    sugar: '3g',
    satFat: '12g'
  }
];

export const DEFAULT_VOUCHERS: AdminVoucher[] = [
  {
    id: 'promo-1',
    code: 'WEEKENDSERU',
    name: 'Promo Special Wagyu Bowl 30%',
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
    name: 'Flash Sale: Rendang Daging Premium',
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
    name: 'Hemat Sate Ayam Madura (BOGO)',
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

export const DEFAULT_ORDERS: AdminOrder[] = [];

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
    productName: 'Special Wagyu Bowl',
    productImage: '/images/wagyu_bowl.png',
    comment: 'Daging wagyu nya sangat lembut dan bumbunya meresap sempurna. Pengiriman super cepat!',
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
    productName: 'Rendang Daging Premium',
    productImage: '/images/hero_rendang.png',
    comment: 'Rendang terbaik yang pernah saya pesan online. Bumbu kelapa sangrainya beraroma wangi harum.',
    likesCount: 8,
    status: 'PUBLISHED'
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
  addReview: (review: Omit<UserReview, 'id' | 'date' | 'likesCount'>) => UserReview;
  deleteReview: (id: string) => void;
  sendChatMessage: (userEmail: string, userName: string, text: string, userAvatar?: string) => void;
  replyChatMessage: (userEmail: string, text: string) => void;
  markChatAsRead: (userEmail: string, role: 'admin' | 'user') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProductsState] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [vouchers, setVouchersState] = useState<AdminVoucher[]>(DEFAULT_VOUCHERS);
  const [orders, setOrdersState] = useState<AdminOrder[]>(DEFAULT_ORDERS);
  const [reviews, setReviewsState] = useState<UserReview[]>(DEFAULT_REVIEWS);
  const [chatMessages, setChatMessagesState] = useState<ChatMessage[]>(DEFAULT_CHAT_MESSAGES);

  // Load from localStorage on mount & listen to storage events for cross-tab live updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProd = localStorage.getItem('nefakky_products');
      if (savedProd) {
        try { setProductsState(JSON.parse(savedProd)); } catch (e) {}
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

  return (
    <DataContext.Provider value={{
      products,
      vouchers,
      orders,
      reviews,
      chatMessages,
      setProducts,
      setVouchers,
      setOrders,
      setReviews,
      setChatMessages,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleProductVisibility,
      addVoucher,
      deleteVoucher,
      toggleVoucherStatus,
      addOrder,
      updateOrderStatus,
      updatePaymentStatus,
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
