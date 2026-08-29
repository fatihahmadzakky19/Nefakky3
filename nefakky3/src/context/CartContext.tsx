'use client';

/**
 * ============================================================================
 * CONTEXT: CartContext (Keranjang Belanja & Perhitungan Promo)
 * DESKRIPSI: Mengelola item keranjang belanja, penambahan/pengurangan produk,
 *            serta klaim diskon promo voucher.
 * GUIDELINES: Standardized clean code structure & Bahasa Indonesia.
 * ============================================================================
 */

// Mengimpor React, Context API hooks (createContext, useContext, useEffect, useState)
import React, { createContext, useContext, useEffect, useState } from 'react';
// Mengimpor kustom hook AuthContext untuk mendapatkan status akun user yang sedang login
import { useAuth } from './AuthContext';
// Mengimpor DataContext & fungsi validasi voucher isVoucherValidNow
import { useData, isVoucherValidNow, cleanPromoCode } from './DataContext';

/** Interface Struktur Data Produk Keranjang */
export interface CartItemProduct {
  id: string; // ID unik produk
  name: string; // Nama hidangan produk
  category: string; // Kategori menu
  price: number; // Harga produk (Rp)
  image: string; // URL/Path gambar produk
  description?: string; // Deskripsi produk (opsional)
}

/** Interface Line Item dalam Keranjang (Produk + Kuantitas) */
export interface CartLineItem extends CartItemProduct {
  quantity: number; // Jumlah kuantitas yang dipesan
}

// Master produk fallback jika data produk belum termuat dari API/Database
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
    price: 10000,
    image: '/images/nasi_bakar.jpg',
    description: 'Nasi gurih rempah dibungkus daun pisang dengan isian cumi pedas.'
  },
  {
    id: 'm3',
    name: 'Krecek',
    category: 'Menu Hemat',
    price: 20000,
    image: '/images/krecek.jpg',
    description: 'Olahan krecek kulit sapi lembut dimasak dengan santan kental gurih.'
  },
  {
    id: 'm4',
    name: 'Gudeg',
    category: 'Makanan Berat',
    price: 10000,
    image: '/images/gudeg.jpg',
    description: 'Nangka muda dimasak perlahan disajikan dengan telur bacem & krecek.'
  },
  {
    id: 'm5',
    name: 'Garang Asam',
    category: 'Menu Hemat',
    price: 10000,
    image: '/images/garang_asam.jpg',
    description: 'Ayam kampung segar dikukus dalam daun pisang dengan kuah santan asam.'
  },
  {
    id: 'm6',
    name: 'Jus Segar (Jambu, Sirsak, Mangga)',
    category: 'Minuman',
    price: 5000,
    image: '/images/jus_mangga.jpg',
    description: 'Aneka pilihan jus buah segar alami: Jambu Biji, Sirsak, atau Mangga.'
  }
];

// Interface Tipe Nilai yang Disediakan oleh CartContext
interface CartContextType {
  cart: { [itemId: string]: number }; // State objek key-value keranjang { itemId: quantity }
  cartItems: CartLineItem[]; // Array daftar item keranjang beserta detail produk
  totalCartCount: number; // Akumulasi total kuantitas seluruh item di keranjang
  subtotal: number; // Total harga kotor sebelum diskon
  appliedPromo: string | null; // Kode promo yang sedang diterapkan
  discountPercent: number; // Persentase diskon (%)
  discountAmount: number; // Nominal potongan harga (Rp)
  minSpendRequired: number; // Syarat minimal belanja voucher (Rp)
  isMinSpendMet: boolean; // Apakah syarat minimal belanja terpenuhi
  addToCart: (productId: string, variant?: string) => void; // Fungsi menambah barang ke keranjang
  removeFromCart: (productId: string) => void; // Fungsi mengurangi kuantitas 1 barang
  deleteFromCart: (productId: string) => void; // Fungsi menghapus barang sepenuhnya dari keranjang
  clearCart: () => void; // Fungsi mengosongkan seluruh keranjang
  claimPromo: (code: string) => { success: boolean; message: string; percent: number }; // Fungsi klaim kode promo
  removePromo: () => void; // Fungsi menghapus promo yang terpasang
}

// Inisialisasi React Context untuk Cart
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider Component untuk membungkus komponen aplikasi Next.js
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth(); // Ambil status user dari AuthContext
  const { products, vouchers, isVoucherUsedByUser } = useData(); // Ambil daftar produk & voucher dari DataContext
  const [cart, setCart] = useState<{ [itemId: string]: number }>({}); // State data keranjang
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null); // State kode promo aktif
  const [discountPercent, setDiscountPercent] = useState<number>(0); // State persentase diskon

  // Effect: Muat keranjang dan promo dari localStorage dengan fallback guest & user persistent
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cartKey = user?.uid ? `nefakky_cart_${user.uid}` : 'nefakky_cart_guest';
    const promoKey = user?.uid ? `nefakky_promo_${user.uid}` : 'nefakky_promo_guest';

    const savedCart = 
      localStorage.getItem(cartKey) || 
      localStorage.getItem('nefakky_cart_active') || 
      localStorage.getItem('nefakky_cart_guest');
      
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart({});
      }
    }

    const savedPromo = 
      localStorage.getItem(promoKey) || 
      localStorage.getItem('nefakky_promo_active') || 
      localStorage.getItem('nefakky_promo_guest');
      
    if (savedPromo) {
      try {
        const parsed = JSON.parse(savedPromo);
        if (parsed.code) {
          setAppliedPromo(parsed.code);
          const liveV = (vouchers || []).find(v => v.code.toUpperCase() === parsed.code.toUpperCase());
          setDiscountPercent(liveV?.discountPercent || parsed.percent || 10);
        }
      } catch (e) {
        setAppliedPromo(null);
        setDiscountPercent(0);
      }
    }
  }, [user?.uid, vouchers]);

  // Fungsi helper simpan state keranjang ke localStorage
  const saveCart = (newCart: { [itemId: string]: number }) => {
    setCart(newCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nefakky_cart_active', JSON.stringify(newCart));
      if (user?.uid) {
        localStorage.setItem(`nefakky_cart_${user.uid}`, JSON.stringify(newCart));
      } else {
        localStorage.setItem('nefakky_cart_guest', JSON.stringify(newCart));
      }
    }
  };

  // Fungsi menghapus promo yang terpasang di keranjang
  const removePromo = () => {
    setAppliedPromo(null);
    setDiscountPercent(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nefakky_promo_active');
      localStorage.removeItem('nefakky_promo_guest');
      if (user?.uid) {
        localStorage.removeItem(`nefakky_promo_${user.uid}`);
      }
    }
  };

  // Effect Real-time: Otomatis mencabut promo jika Admin menonaktifkan voucher di DB atau jika user sudah pernah menggunakannya
  useEffect(() => {
    if (appliedPromo && vouchers.length > 0) {
      const foundVoucher = vouchers.find(
        v => (v.code.toUpperCase() === appliedPromo.toUpperCase() || v.id.toUpperCase() === appliedPromo.toUpperCase())
      );
      
      const { active: isStillActive } = isVoucherValidNow(foundVoucher);
      const isAlreadyUsed = isVoucherUsedByUser && isVoucherUsedByUser(appliedPromo, user?.uid, user?.email);

      if (!isStillActive || isAlreadyUsed) {
        removePromo();
      } else if (foundVoucher && foundVoucher.discountPercent && foundVoucher.discountPercent !== discountPercent) {
        setDiscountPercent(foundVoucher.discountPercent);
        if (typeof window !== 'undefined') {
          const payload = JSON.stringify({ code: foundVoucher.code.toUpperCase(), percent: foundVoucher.discountPercent });
          localStorage.setItem('nefakky_promo_active', payload);
          if (user?.uid) {
            localStorage.setItem(`nefakky_promo_${user.uid}`, payload);
          } else {
            localStorage.setItem('nefakky_promo_guest', payload);
          }
        }
      }
    }
  }, [vouchers, appliedPromo, discountPercent, user, isVoucherUsedByUser]);

  // Memetakan objek cart { key: qty } menjadi array CartLineItem lengkap beserta detail produk
  const cartItems: CartLineItem[] = Object.entries(cart).map(([key, quantity]) => {
    const [baseId, variant] = key.split('_');
    const product = products.find(p => p.id === baseId) || MASTER_PRODUCTS.find(p => p.id === baseId) || {
      id: baseId,
      name: 'Hidangan Nefakky',
      category: 'Makanan Berat',
      price: 35000,
      image: '/images/ayam_bakar.jpg'
    };

    let itemImage = product.image;
    let itemName = product.name;

    if (variant) {
      itemName = `Jus ${variant} Segar`;
      if (variant === 'Mangga') itemImage = '/images/jus_mangga.jpg';
      if (variant === 'Sirsak') itemImage = '/images/jus_sirsak.jpg';
      if (variant === 'Jambu') itemImage = '/images/jus_jambu.jpg';
    }

    return {
      ...product,
      id: key,
      name: itemName,
      image: itemImage,
      quantity
    };
  });

  // Hitung total akumulasi kuantitas seluruh item di keranjang
  const totalCartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // Hitung subtotal harga kotor seluruh barang
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Cari objek voucher aktif untuk memeriksa batas minimal belanja (minSpend)
  const activeVoucherObj = (vouchers || []).find(
    v => appliedPromo && (v.code.toUpperCase() === appliedPromo.toUpperCase() || v.id.toUpperCase() === appliedPromo.toUpperCase())
  );
  const minSpendRequired = activeVoucherObj?.minSpend || 0;
  const isMinSpendMet = subtotal >= minSpendRequired;

  // Hitung besaran nominal potongan diskon dalam Rupiah jika syarat minSpend terpenuhi
  const discountAmount = (isMinSpendMet && discountPercent > 0) ? Math.round(subtotal * (discountPercent / 100)) : 0;

  // Fungsi untuk mengklaim kode promo voucher
  const claimPromo = (code: string) => {
    const upper = code.trim().toUpperCase();
    
    const foundVoucher = vouchers.find(
      v => v.code.toUpperCase() === upper || v.id.toUpperCase() === upper
    );

    if (!foundVoucher || foundVoucher.isDeleted) {
      return {
        success: false,
        message: `Maaf, kode promo "${upper}" tidak ditemukan atau telah non-aktif! Silakan periksa kembali kode promo Anda.`,
        percent: 0
      };
    }

    if (isVoucherUsedByUser && isVoucherUsedByUser(upper, user?.uid, user?.email)) {
      removePromo();
      const isNewCust = cleanPromoCode(upper) === 'NEFAKKY10' || cleanPromoCode(upper).includes('NEWUSER') || cleanPromoCode(upper).includes('PELANGGANBARU');
      return {
        success: false,
        message: isNewCust 
          ? `Maaf, kode promo "${upper}" khusus untuk pesanan pertama pelanggan baru dan hanya dapat digunakan 1 kali.`
          : `Maaf, Anda sudah pernah menggunakan kode promo "${upper}". Setiap voucher promo hanya dapat digunakan 1 kali per akun!`,
        percent: 0
      };
    }

    const { active: isVoucherActive, reason } = isVoucherValidNow(foundVoucher);

    if (!isVoucherActive) {
      removePromo();
      return {
        success: false,
        message: reason || `Maaf, promosi "${foundVoucher.name}" (${upper}) sedang NON-AKTIF atau tidak dapat digunakan saat ini.`,
        percent: 0
      };
    }

    const percent = foundVoucher.discountPercent || 10;
    const minSpend = foundVoucher.minSpend || 0;

    setAppliedPromo(upper);
    setDiscountPercent(percent);

    if (typeof window !== 'undefined') {
      const payload = JSON.stringify({ code: upper, percent });
      localStorage.setItem('nefakky_promo_active', payload);
      if (user?.uid) {
        localStorage.setItem(`nefakky_promo_${user.uid}`, payload);
      } else {
        localStorage.setItem('nefakky_promo_guest', payload);
      }
    }

    let message = `Kode promo "${upper}" (${foundVoucher.name}) BERHASIL digunakan! Diskon ${percent}% diterapkan pada pesanan Anda.`;
    if (minSpend > 0 && subtotal > 0 && subtotal < minSpend) {
      message = `Voucher "${upper}" berhasil dipasang! Minimal belanja Rp ${minSpend.toLocaleString('id-ID')} (belanja Anda saat ini Rp ${subtotal.toLocaleString('id-ID')}). Tambah menu untuk mengaktifkan potongan diskon ${percent}%.`;
    }

    return {
      success: true,
      message,
      percent
    };
  };

  // Fungsi menambah kuantitas barang ke keranjang
  const addToCart = (productId: string, variant?: string) => {
    const cartKey = variant ? `${productId}_${variant}` : productId;
    const updated = { ...cart, [cartKey]: (cart[cartKey] || 0) + 1 };
    saveCart(updated);
  };

  // Fungsi mengurangi 1 kuantitas barang di keranjang
  const removeFromCart = (productId: string) => {
    const updated = { ...cart };
    if (updated[productId] > 1) {
      updated[productId] -= 1;
    } else {
      delete updated[productId];
    }
    saveCart(updated);
  };

  // Fungsi menghapus barang sepenuhnya dari keranjang
  const deleteFromCart = (productId: string) => {
    const updated = { ...cart };
    delete updated[productId];
    saveCart(updated);
  };

  // Fungsi mengosongkan keranjang belanja
  const clearCart = () => {
    saveCart({});
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartItems,
      totalCartCount,
      subtotal,
      appliedPromo,
      discountPercent,
      discountAmount,
      minSpendRequired,
      isMinSpendMet,
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

// Custom Hook useCart untuk mempermudah akses CartContext di komponen
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider'); // Lempar error jika dipanggil di luar Provider
  }
  return context;
};

