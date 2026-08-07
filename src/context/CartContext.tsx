'use client';

/**
 * ============================================================================
 * CONTEXT: CartContext (Keranjang Belanja & Perhitungan Promo)
 * DESKRIPSI: Mengelola item keranjang belanja, penambahan/pengurangan produk,
 *            serta klaim diskon promo voucher.
 * GUIDELINES: Standardized clean code structure & Bahasa Indonesia.
 * ============================================================================
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';

/** Interface Produk Keranjang */
export interface CartItemProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
}

export interface CartLineItem extends CartItemProduct {
  quantity: number;
}

// Master products fallback list
export const MASTER_PRODUCTS: CartItemProduct[] = [
  {
    id: 'm1',
    name: 'Ayam Bakar',
    category: 'Makanan Berat',
    price: 35000,
    image: '/images/ayam_bakar.jpg',
    description: 'Ayam pejantan pilihan dibakar dengan lumuran bumbu kecap rempah.'
  },
  {
    id: 'm2',
    name: 'Nasi Bakar',
    category: 'Makanan Berat',
    price: 28000,
    image: '/images/nasi_bakar.jpg',
    description: 'Nasi gurih rempah dibungkus daun pisang dengan isian cumi pedas.'
  },
  {
    id: 'm3',
    name: 'Krecek',
    category: 'Menu Hemat',
    price: 22000,
    image: '/images/krecek.jpg',
    description: 'Olahan krecek kulit sapi lembut dimasak dengan santan kental gurih.'
  },
  {
    id: 'm4',
    name: 'Gudeg',
    category: 'Makanan Berat',
    price: 40000,
    image: '/images/gudeg.jpg',
    description: 'Nangka muda dimasak perlahan disajikan dengan telur bacem & krecek.'
  },
  {
    id: 'm5',
    name: 'Garang Asam',
    category: 'Menu Hemat',
    price: 32000,
    image: '/images/garang_asam.jpg',
    description: 'Ayam kampung segar dikukus dalam daun pisang dengan kuah santan asam.'
  },
  {
    id: 'm6',
    name: 'Jus (Jambu, Sirsak, Mangga)',
    category: 'Minuman',
    price: 15000,
    image: '/images/jus_mangga.jpg',
    description: 'Aneka pilihan jus buah segar alami: Jambu Biji, Sirsak, atau Mangga.'
  }
];

interface CartContextType {
  cart: { [itemId: string]: number };
  cartItems: CartLineItem[];
  totalCartCount: number;
  subtotal: number;
  appliedPromo: string | null;
  discountPercent: number;
  discountAmount: number;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  deleteFromCart: (productId: string) => void;
  clearCart: () => void;
  claimPromo: (code: string) => { success: boolean; message: string; percent: number };
  removePromo: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { products, vouchers } = useData();
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Load user-scoped cart and applied promo from localStorage
  useEffect(() => {
    if (user?.uid) {
      const storageKey = `nefakky_cart_${user.uid}`;
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          setCart({});
        }
      } else {
        setCart({});
      }

      const savedPromo = localStorage.getItem(`nefakky_promo_${user.uid}`);
      if (savedPromo) {
        try {
          const parsed = JSON.parse(savedPromo);
          setAppliedPromo(parsed.code);
          setDiscountPercent(parsed.percent);
        } catch (e) {
          setAppliedPromo(null);
          setDiscountPercent(0);
        }
      }
    } else {
      setCart({});
      setAppliedPromo(null);
      setDiscountPercent(0);
    }
  }, [user]);

  // Save cart to localStorage whenever cart state changes
  const saveCart = (newCart: { [itemId: string]: number }) => {
    setCart(newCart);
    if (user?.uid && typeof window !== 'undefined') {
      localStorage.setItem(`nefakky_cart_${user.uid}`, JSON.stringify(newCart));
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setDiscountPercent(0);
    if (user?.uid && typeof window !== 'undefined') {
      localStorage.removeItem(`nefakky_promo_${user.uid}`);
    }
  };

  // Real-time effect: Auto-revoke applied promo if Admin deactivates it or if it's a Weekend promo used on weekdays
  useEffect(() => {
    if (appliedPromo && vouchers.length > 0) {
      const foundVoucher = vouchers.find(
        v => (v.code.toUpperCase() === appliedPromo.toUpperCase() || v.id.toUpperCase() === appliedPromo.toUpperCase())
      );
      
      const today = new Date();
      const day = today.getDay(); // 0 = Minggu, 6 = Sabtu
      const isWeekend = day === 0 || day === 6;

      const isWeekendPromo = foundVoucher && (
        foundVoucher.code.toUpperCase().includes('WEEKEND') || 
        foundVoucher.name.toLowerCase().includes('weekend') ||
        foundVoucher.expiry.toLowerCase().includes('akhir pekan') ||
        foundVoucher.expiry.toLowerCase().includes('weekend')
      );

      const isStillActive = foundVoucher && 
        foundVoucher.status === 'Active' && 
        (foundVoucher.isActive !== false) &&
        (!isWeekendPromo || isWeekend);

      if (!isStillActive) {
        removePromo();
      }
    }
  }, [vouchers, appliedPromo]);

  const claimPromo = (code: string) => {
    const upper = code.trim().toUpperCase();
    
    // Find matching voucher from live DataContext vouchers list
    const foundVoucher = vouchers.find(
      v => v.code.toUpperCase() === upper || v.id.toUpperCase() === upper
    );

    if (!foundVoucher) {
      return {
        success: false,
        message: `Maaf, kode promo "${upper}" tidak ditemukan! Silakan periksa kembali kode promo Anda.`,
        percent: 0
      };
    }

    const isVoucherActive = foundVoucher.status === 'Active' && (foundVoucher.isActive !== false);

    if (!isVoucherActive) {
      removePromo();
      return {
        success: false,
        message: `Maaf, promosi "${foundVoucher.name}" (${upper}) sedang NON-AKTIF atau telah dimatikan oleh Admin.`,
        percent: 0
      };
    }

    // Weekend Promo restriction check (Active ONLY on Saturday & Sunday)
    const isWeekendPromo = 
      foundVoucher.code.toUpperCase().includes('WEEKEND') || 
      foundVoucher.name.toLowerCase().includes('weekend') ||
      foundVoucher.expiry.toLowerCase().includes('akhir pekan') ||
      foundVoucher.expiry.toLowerCase().includes('weekend');

    const day = new Date().getDay(); // 0 = Minggu, 6 = Sabtu
    const isWeekend = day === 0 || day === 6;

    if (isWeekendPromo && !isWeekend) {
      removePromo();
      return {
        success: false,
        message: `Maaf, kode promo "${foundVoucher.code}" (${foundVoucher.name}) hanya dapat digunakan pada hari libur / akhir pekan (Sabtu & Minggu)! Pada hari kerja biasa promo ini otomatis NON-AKTIF / MATI.`,
        percent: 0
      };
    }

    const percent = foundVoucher.discountPercent || 20;

    setAppliedPromo(upper);
    setDiscountPercent(percent);

    if (user?.uid && typeof window !== 'undefined') {
      localStorage.setItem(`nefakky_promo_${user.uid}`, JSON.stringify({ code: upper, percent }));
    }

    return {
      success: true,
      message: `Kode promo "${upper}" (${foundVoucher.name}) BERHASIL digunakan! Diskon ${percent}% diterapkan pada checkout Anda.`,
      percent
    };
  };

  const addToCart = (productId: string) => {
    const updated = { ...cart, [productId]: (cart[productId] || 0) + 1 };
    saveCart(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = { ...cart };
    if (updated[productId] > 1) {
      updated[productId] -= 1;
    } else {
      delete updated[productId];
    }
    saveCart(updated);
  };

  const deleteFromCart = (productId: string) => {
    const updated = { ...cart };
    delete updated[productId];
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart({});
  };

  const cartItems: CartLineItem[] = Object.entries(cart).map(([id, quantity]) => {
    const product = products.find(p => p.id === id) || MASTER_PRODUCTS.find(p => p.id === id) || {
      id,
      name: 'Hidangan Nefakky',
      category: 'Makanan',
      price: 35000,
      image: '/images/hero_rendang.png'
    };
    return {
      ...product,
      quantity
    };
  });

  const totalCartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));

  return (
    <CartContext.Provider value={{
      cart,
      cartItems,
      totalCartCount,
      subtotal,
      appliedPromo,
      discountPercent,
      discountAmount,
      addToCart,
      removeFromCart,
      deleteFromCart,
      clearCart,
      claimPromo,
      removePromo
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
