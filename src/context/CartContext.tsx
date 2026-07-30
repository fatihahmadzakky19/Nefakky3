'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';

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
    name: 'Special Wagyu Bowl',
    category: 'Makanan',
    price: 85000,
    image: '/images/wagyu_bowl.png',
    description: 'Nasi hangat dengan irisan daging wagyu premium.'
  },
  {
    id: 'm2',
    name: 'Creamy Truffle Pasta',
    category: 'Makanan',
    price: 72000,
    image: '/images/truffle_pasta.png',
    description: 'Pasta artisanal dengan saus truffle putih.'
  },
  {
    id: 'm3',
    name: 'Sate Ayam Madura',
    category: 'Makanan',
    price: 45000,
    image: '/images/sate_ayam.png',
    description: 'Authentic grilled chicken with rich Madurese peanut sauce and lontong.'
  },
  {
    id: 'm4',
    name: 'Rendang Daging Premium',
    category: 'Makanan',
    price: 75000,
    image: '/images/hero_rendang.png',
    description: 'Slow-cooked beef for 12 hours in traditional Padang spices.'
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

  // Real-time effect: Auto-revoke applied promo if Admin deactivates it
  useEffect(() => {
    if (appliedPromo && vouchers.length > 0) {
      const foundVoucher = vouchers.find(
        v => (v.code.toUpperCase() === appliedPromo.toUpperCase() || v.id.toUpperCase() === appliedPromo.toUpperCase())
      );
      const isStillActive = foundVoucher && foundVoucher.status === 'Active' && (foundVoucher.isActive !== false);
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
