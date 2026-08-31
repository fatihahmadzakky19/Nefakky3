'use client';

/**
 * ============================================================================
 * CONTEXT: CartContext (Keranjang Belanja & Perhitungan Promo Terintegrasi)
 * DESKRIPSI: Mengelola seluruh siklus hidup keranjang belanja produk restoran:
 *            - Penambahan kuantitas produk & varian
 *            - Pengurangan & penghapusan produk
 *            - Pengosongan keranjang belanja
 *            - Penyimpanan lokal (localStorage) persisten per-user / guest
 *            - Dukungan multi-voucher promo (maksimal 2 voucher aktif bersamaan)
 *            - Kalkulasi subtotal, diskon persentase, nominal rupiah, & syarat minimal belanja
 * ============================================================================
 */

// Mengimpor React beserta hooks context & state management
import React, { createContext, useContext, useEffect, useState } from 'react';
// Mengimpor hook AuthContext untuk mendapatkan status autentikasi user aktif
import { useAuth } from './AuthContext';
// Mengimpor hook DataContext, validator voucher realtime, dan pembersih kode promo
import { useData, isVoucherValidNow, cleanPromoCode } from './DataContext';

/**
 * Interface CartItemProduct
 * Mendefinisikan struktur data sebuah item produk hidangan di keranjang
 */
export interface CartItemProduct {
  id: string; // ID unik produk (misal: 'm1', 'm2')
  name: string; // Nama menu hidangan (misal: 'Ayam Bakar Madu')
  category: string; // Kategori menu (misal: 'Makanan Berat', 'Minuman')
  price: number; // Harga satuan produk dalam Rupiah (Rp)
  image: string; // URL / Path gambar hidangan
  description?: string; // Deskripsi singkat mengenai menu (opsional)
}

/**
 * Interface CartLineItem
 * Menggabungkan informasi produk dengan jumlah kuantitas yang dipesan pelanggan
 */
export interface CartLineItem extends CartItemProduct {
  quantity: number; // Kuantitas pesanan (jumlah porsi yang dimasukkan ke keranjang)
}

/**
 * Master fallback produk jika data Firestore belum selesai termuat
 */
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

/**
 * Interface AppliedVoucherItem
 * Mendefinisikan detail masing-masing voucher promo yang sedang aktif digunakan
 */
export interface AppliedVoucherItem {
  code: string; // Kode voucher promo (misal: 'NEFAKKY10')
  name: string; // Nama judul promosi (misal: 'Diskon Pengguna Baru')
  discountPercent: number; // Besaran persentase potongan harga (misal: 10)
  minSpend: number; // Syarat minimal nilai belanja dalam Rupiah (Rp)
}

/**
 * Interface CartContextType
 * Mendefinisikan seluruh variabel dan fungsi yang diekspos oleh CartContext kepada komponen lain
 */
interface CartContextType {
  cart: { [itemId: string]: number }; // Objek state keranjang mentah: key format 'productId' atau 'productId_variant', value kuantitas
  cartItems: CartLineItem[]; // Daftar array item keranjang lengkap dengan detail gambar, nama, dan harga
  totalCartCount: number; // Total jumlah porsi item di dalam keranjang belanja
  subtotal: number; // Total nilai kotor belanja sebelum dipotong diskon (Rp)
  appliedPromo: string | null; // Teks kode promo aktif (digabungkan dengan tanda '+' jika menggunakan multi-voucher)
  appliedPromos: string[]; // Array berisi daftar kode voucher promo yang aktif (maksimal 2 voucher)
  appliedVouchersList: AppliedVoucherItem[]; // Array rincian objek voucher promo yang aktif
  discountPercent: number; // Persentase diskon kumulatif total (%)
  discountAmount: number; // Besaran nominal potongan diskon yang didapat dalam Rupiah (Rp)
  minSpendRequired: number; // Syarat minimal belanja tertinggi dari voucher yang dipakai (Rp)
  isMinSpendMet: boolean; // Menandakan apakah subtotal telah memenuhi syarat minimal belanja voucher
  addToCart: (productId: string, variant?: string) => void; // Fungsi untuk menambahkan 1 porsi hidangan ke keranjang
  removeFromCart: (productId: string) => void; // Fungsi untuk mengurangi 1 porsi hidangan dari keranjang
  deleteFromCart: (productId: string) => void; // Fungsi untuk menghapus item hidangan seutuhnya dari keranjang
  clearCart: () => void; // Fungsi untuk mengosongkan seluruh isi keranjang belanja
  claimPromo: (code: string) => { success: boolean; message: string; percent: number }; // Fungsi untuk memvalidasi & mengklaim voucher promo
  removePromo: (code?: string) => void; // Fungsi untuk mencabut/menghapus kode voucher promo tertentu atau seluruhnya
}

// Membuat React Context untuk Cart
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Komponen Provider CartProvider
 * Membungkus pohon komponen aplikasi agar seluruh halaman memiliki akses ke keranjang belanja
 */
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // Mengambil informasi akun user login dari AuthContext
  const { user } = useAuth();
  // Mengambil daftar produk, daftar voucher, dan fungsi verifikasi voucher yang sudah terpakai dari DataContext
  const { products, vouchers, isVoucherUsedByUser } = useData();

  // State penyimpan data keranjang mentah dalam format { [id_barang]: kuantitas }
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  // State penyimpan array kode promo voucher yang sedang aktif terpasang (maksimal 2)
  const [appliedPromos, setAppliedPromos] = useState<string[]>([]);

  /**
   * Effect: Memuat data keranjang dan promo tersimpan dari localStorage saat aplikasi diinisialisasi / user berganti
   */
  useEffect(() => {
    // Pastikan kode hanya berjalan di sisi browser (bukan server-side rendering)
    if (typeof window === 'undefined') return;

    // Menentukan key penyimpanan localStorage berdasarkan status login pengguna
    const cartKey = user?.uid ? `nefakky_cart_${user.uid}` : 'nefakky_cart_guest';
    const promosKey = user?.uid ? `nefakky_promos_${user.uid}` : 'nefakky_promos_guest';
    const oldPromoKey = user?.uid ? `nefakky_promo_${user.uid}` : 'nefakky_promo_guest';

    // 1. Mengambil data keranjang belanja yang tersimpan
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

    // 2. Mengambil data daftar multi-voucher promo yang tersimpan
    const savedPromos = 
      localStorage.getItem(promosKey) || 
      localStorage.getItem('nefakky_promos_active');
      
    if (savedPromos) {
      try {
        const parsed = JSON.parse(savedPromos);
        if (Array.isArray(parsed)) {
          // Batasi maksimal 2 voucher promo
          setAppliedPromos(parsed.slice(0, 2));
          return;
        }
      } catch (e) {
        // Abaikan jika format JSON tidak valid
      }
    }

    // 3. Fallback jika ada data promo tunggal model lama
    const legacyPromo = localStorage.getItem(oldPromoKey) || localStorage.getItem('nefakky_promo_active');
    if (legacyPromo) {
      try {
        const parsed = JSON.parse(legacyPromo);
        if (parsed?.code) {
          const codes = String(parsed.code).split(/[\+\,]/).map((s: string) => s.trim()).filter(Boolean);
          setAppliedPromos(codes.slice(0, 2));
        }
      } catch (e) {
        // Abaikan error parsing legacy
      }
    }
  }, [user?.uid]);

  /**
   * Fungsi Helper: Menyimpan perubahan state keranjang ke localStorage secara persisten
   */
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

  /**
   * Fungsi Helper: Menyimpan perubahan daftar voucher promo ke localStorage secara persisten
   */
  const savePromos = (promos: string[]) => {
    if (typeof window !== 'undefined') {
      const payload = JSON.stringify(promos);
      localStorage.setItem('nefakky_promos_active', payload);
      // Simpan juga representasi teks gabungan untuk kompabilitas invoice / receipt
      localStorage.setItem('nefakky_promo_active', JSON.stringify({ code: promos.join(' + ') }));
      if (user?.uid) {
        localStorage.setItem(`nefakky_promos_${user.uid}`, payload);
      } else {
        localStorage.setItem('nefakky_promos_guest', payload);
      }
    }
  };

  /**
   * Fungsi: Menghapus voucher promo yang terpasang di keranjang
   * @param codeToRemove Kode voucher tertentu yang ingin dihapus. Jika dikosongkan, seluruh voucher dicabut.
   */
  const removePromo = (codeToRemove?: string) => {
    if (codeToRemove) {
      const cleanToRemove = cleanPromoCode(codeToRemove);
      const updated = appliedPromos.filter(c => cleanPromoCode(c) !== cleanToRemove);
      setAppliedPromos(updated);
      savePromos(updated);
    } else {
      setAppliedPromos([]);
      savePromos([]);
    }
  };

  /**
   * Effect Realtime: Otomatis mencabut voucher dari keranjang jika Admin menonaktifkannya di Firestore
   * atau jika akun user tersebut sudah pernah menggunakan voucher tersebut di transaksi sebelumnya.
   */
  useEffect(() => {
    if (appliedPromos.length > 0 && vouchers.length > 0) {
      let changed = false;
      const validPromos: string[] = [];

      for (const promoCode of appliedPromos) {
        const foundVoucher = vouchers.find(
          v => (cleanPromoCode(v.code) === cleanPromoCode(promoCode) || cleanPromoCode(v.id) === cleanPromoCode(promoCode))
        );
        
        const isStillActive = foundVoucher ? isVoucherValidNow(foundVoucher).active : false;
        const isAlreadyUsed = isVoucherUsedByUser && isVoucherUsedByUser(promoCode, user?.uid, user?.email);

        if (!foundVoucher || !isStillActive || isAlreadyUsed) {
          changed = true;
        } else {
          validPromos.push(promoCode);
        }
      }

      if (changed) {
        setAppliedPromos(validPromos);
        savePromos(validPromos);
      }
    }
  }, [vouchers, appliedPromos, user, isVoucherUsedByUser]);

  /**
   * Mengonversi objek state cart { [id]: kuantitas } menjadi array CartLineItem lengkap
   * beserta nama menu, varian rasa minuman, foto hidangan, harga satuan, dan kuantitas.
   */
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

    // Penyesuaian nama dan foto jika item merupakan varian minuman jus
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

  // Menghitung akumulasi total kuantitas seluruh porsi item di dalam keranjang
  const totalCartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // Menghitung subtotal kotor nilai belanja (harga satuan dikali kuantitas per item)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  /**
   * Membuat daftar rincian objek AppliedVoucherItem untuk setiap voucher aktif
   */
  const appliedVouchersList: AppliedVoucherItem[] = appliedPromos.map(code => {
    const cleanCode = cleanPromoCode(code);
    const found = (vouchers || []).find(v => cleanPromoCode(v.code) === cleanCode || cleanPromoCode(v.id) === cleanCode);
    return {
      code,
      name: found?.name || code,
      discountPercent: found?.discountPercent || 10,
      minSpend: found?.minSpend || 0
    };
  });

  // String representasi kode promo gabungan (misal: "NEFAKKY10 + HEMAT20")
  const appliedPromo = appliedPromos.length > 0 ? appliedPromos.join(' + ') : null;

  // Syarat minimal belanja tertinggi dari daftar voucher yang aktif
  const minSpendRequired = appliedVouchersList.length > 0 
    ? Math.max(...appliedVouchersList.map(v => v.minSpend)) 
    : 0;

  // Menentukan apakah subtotal saat ini sudah memenuhi syarat minimal belanja seluruh voucher yang dipakai
  const isMinSpendMet = appliedVouchersList.length === 0 || appliedVouchersList.every(v => subtotal >= v.minSpend);

  /**
   * Menghitung akumulasi persentase diskon dari voucher-voucher yang syarat minimal belanjanya terpenuhi
   */
  const activeDiscountPercent = appliedVouchersList.reduce((sum, v) => {
    if (subtotal >= v.minSpend) {
      return sum + v.discountPercent;
    }
    return sum;
  }, 0);

  // Batas maksimal persentase diskon adalah 100%
  const discountPercent = Math.min(100, activeDiscountPercent);

  // Menghitung nominal rupiah potongan harga diskon (dibulatkan ke bilangan bulat terdekat)
  const discountAmount = Math.min(subtotal, Math.round(subtotal * (discountPercent / 100)));

  /**
   * Fungsi: Mengklaim dan mengaktifkan voucher promo ke keranjang belanja
   * Aturan:
   * 1. Pengguna wajib login terlebih dahulu
   * 2. Maksimal 2 voucher promo dapat digunakan secara bersamaan
   * 3. Tidak boleh memasukkan kode voucher yang sama lebih dari 1 kali
   * 4. Voucher belum pernah dipakai oleh akun pengguna sebelumnya (1x per akun)
   * 5. Status voucher harus aktif dan kuota belum habis di database
   */
  const claimPromo = (code: string) => {
    // 1. Validasi status login pengguna
    if (!user) {
      return {
        success: false,
        message: 'Silakan masuk atau daftar akun terlebih dahulu untuk mengklaim dan menggunakan voucher promo.',
        percent: 0
      };
    }

    const upper = code.trim().toUpperCase();
    const cleanCode = cleanPromoCode(upper);

    if (!cleanCode) {
      return {
        success: false,
        message: 'Silakan masukkan kode voucher yang valid.',
        percent: 0
      };
    }

    // 2. Cegah memasang voucher yang sudah aktif di keranjang
    if (appliedPromos.some(p => cleanPromoCode(p) === cleanCode)) {
      return {
        success: false,
        message: `Voucher promo "${upper}" sudah aktif di keranjang Anda.`,
        percent: 0
      };
    }

    // 3. Batasi kuota maksimal 2 voucher promo secara bersamaan
    if (appliedPromos.length >= 2) {
      return {
        success: false,
        message: `Maksimal 2 voucher promo yang dapat digunakan bersamaan (saat ini aktif: ${appliedPromos.join(' & ')}). Hapus salah satu voucher di keranjang jika ingin mengganti.`,
        percent: 0
      };
    }
    
    // 4. Cari data voucher di database DataContext
    const foundVoucher = vouchers.find(
      v => cleanPromoCode(v.code) === cleanCode || cleanPromoCode(v.id) === cleanCode
    );

    if (!foundVoucher || foundVoucher.isDeleted) {
      return {
        success: false,
        message: `Maaf, kode promo "${upper}" tidak ditemukan atau telah non-aktif! Silakan periksa kembali kode promo Anda.`,
        percent: 0
      };
    }

    // 5. Cek apakah pengguna sudah pernah menggunakan voucher ini sebelumnya
    if (isVoucherUsedByUser && isVoucherUsedByUser(upper, user?.uid, user?.email)) {
      removePromo(upper);
      const isNewCust = cleanCode === 'NEFAKKY10' || cleanCode.includes('NEWUSER') || cleanCode.includes('PELANGGANBARU');
      return {
        success: false,
        message: isNewCust 
          ? `Maaf, kode promo "${upper}" khusus untuk pesanan pertama pelanggan baru dan hanya dapat digunakan 1 kali.`
          : `Maaf, Anda sudah pernah menggunakan kode promo "${upper}". Setiap voucher promo hanya dapat digunakan 1 kali per akun!`,
        percent: 0
      };
    }

    // 6. Validasi keaktifan voucher dan kuota sisa
    const { active: isVoucherActive, reason } = isVoucherValidNow(foundVoucher);

    if (!isVoucherActive) {
      removePromo(upper);
      return {
        success: false,
        message: reason || `Maaf, promosi "${foundVoucher.name}" (${upper}) sedang NON-AKTIF atau tidak dapat digunakan saat ini.`,
        percent: 0
      };
    }

    const percent = foundVoucher.discountPercent || 10;
    const minSpend = foundVoucher.minSpend || 0;

    // 7. Tambahkan kode voucher ke daftar promo aktif
    const newAppliedPromos = [...appliedPromos, upper];
    setAppliedPromos(newAppliedPromos);
    savePromos(newAppliedPromos);

    // Siapkan pesan notifikasi keberhasilan
    let message = `Kode promo "${upper}" (${foundVoucher.name}) BERHASIL digunakan! Diskon +${percent}% ditambahkan (Total ${newAppliedPromos.length}/2 voucher aktif).`;
    if (minSpend > 0 && subtotal > 0 && subtotal < minSpend) {
      message = `Voucher "${upper}" berhasil dipasang! Minimal belanja Rp ${minSpend.toLocaleString('id-ID')} (belanja Anda saat ini Rp ${subtotal.toLocaleString('id-ID')}). Tambah menu untuk mengaktifkan potongan diskon ${percent}%.`;
    }

    return {
      success: true,
      message,
      percent
    };
  };

  /**
   * Fungsi: Menambahkan 1 porsi hidangan ke keranjang belanja
   * @param productId ID produk yang ingin ditambahkan
   * @param variant Varian rasa minuman jika produk memiliki varian (misal: 'Mangga', 'Sirsak', 'Jambu')
   */
  const addToCart = (productId: string, variant?: string) => {
    const cartKey = variant ? `${productId}_${variant}` : productId;
    const updated = { ...cart, [cartKey]: (cart[cartKey] || 0) + 1 };
    saveCart(updated);
  };

  /**
   * Fungsi: Mengurangi 1 porsi kuantitas produk dari keranjang belanja
   * @param productId Key produk di keranjang yang ingin dikurangi
   */
  const removeFromCart = (productId: string) => {
    const updated = { ...cart };
    if (updated[productId] > 1) {
      updated[productId] -= 1;
    } else {
      delete updated[productId];
    }
    saveCart(updated);
  };

  /**
   * Fungsi: Menghapus item produk seutuhnya dari keranjang belanja
   * @param productId Key produk di keranjang yang ingin dihapus
   */
  const deleteFromCart = (productId: string) => {
    const updated = { ...cart };
    delete updated[productId];
    saveCart(updated);
  };

  /**
   * Fungsi: Mengosongkan seluruh isi keranjang belanja
   */
  const clearCart = () => {
    saveCart({});
  };

  // Mengembalikan Provider dengan seluruh nilai state & method handler
  return (
    <CartContext.Provider value={{
      cart,
      cartItems,
      totalCartCount,
      subtotal,
      appliedPromo,
      appliedPromos,
      appliedVouchersList,
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

/**
 * Custom Hook useCart
 * Mempermudah komponen manapun untuk membaca dan mengelola keranjang belanja
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider'); // Proteksi jika dipanggil di luar CartProvider
  }
  return context;
};
