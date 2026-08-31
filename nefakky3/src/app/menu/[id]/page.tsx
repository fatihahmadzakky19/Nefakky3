'use client';

/**
 * ============================================================================
 * HALAMAN: Detail Menu Hidangan (src/app/menu/[id]/page.tsx)
 * DESKRIPSI: Rincian lengkap hidangan otentik Nefakky. Khusus menu jus,
 *            menyediakan 3 opsi gambar galeri dan selector 3 varian rasa
 *            (Mangga, Sirsak, Jambu), sedangkan menu makanan berat tetap
 *            menampilkan 1 foto tunggal dari database.
 *            Dilengkapi dengan bagian Ulasan Komunitas REALTIME dari DataContext.
 * DESAIN: Artisanal Luxury Editorial sesuai referensi desain Nefakky.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart, MASTER_PRODUCTS } from '@/context/CartContext';
import { useData, sortReviewsNewestFirst } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import { 
  ShoppingBag, 
  Star, 
  Plus, 
  Minus, 
  ArrowLeft,
  Share2,
  CheckCircle2,
  Store,
  Check,
  Lock,
  AlertCircle,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

const DRINK_VARIANTS = [
  { 
    id: 'Mangga', 
    name: 'Jus Mangga Segar', 
    tag: 'FRESH & MANIS', 
    benefit: 'Kaya Vitamin C & A', 
    image: '/images/jus_mangga.jpg' 
  },
  { 
    id: 'Sirsak', 
    name: 'Jus Sirsak Segar', 
    tag: 'ASAM SEGAR', 
    benefit: 'Antioksidan tinggi', 
    image: '/images/jus_sirsak.jpg' 
  },
  { 
    id: 'Jambu', 
    name: 'Jus Jambu Biji', 
    tag: 'MANIS & KENTAL', 
    benefit: 'Meningkatkan imun', 
    image: '/images/jus_jambu.jpg' 
  }
];

export default function MenuDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { cart, addToCart, removeFromCart } = useCart();
  const { products, reviews, sendChatMessage } = useData();

  const productId = params?.id as string;
  // Temukan produk dari database atau fallback ke master products
  const product = products.find(p => p.id === productId) || 
                  MASTER_PRODUCTS.find(p => p.id === productId) || 
                  MASTER_PRODUCTS[0];

  const isDrink = product.category === 'Minuman' || product.id === 'm6' || product.name.toLowerCase().includes('jus');

  // State
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlist, setIsWishlist] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'storage' | 'serving'>('description');
  const [selectedVariant, setSelectedVariant] = useState<string>('Mangga');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authActionName, setAuthActionName] = useState<string>('memesan hidangan');
  const [addedNotice, setAddedNotice] = useState<boolean>(false);
  const [shareNotice, setShareNotice] = useState<boolean>(false);

  // State Reservasi Produk Habis ke Customer Service
  const [isReserving, setIsReserving] = useState<boolean>(false);
  const [reservationSent, setReservationSent] = useState<boolean>(false);

  const activeDrinkVariant = DRINK_VARIANTS.find(v => v.id === selectedVariant) || DRINK_VARIANTS[0];

  // Helper cek stok per varian
  const getVariantStock = (variantId: string): number => {
    if ((product as any).variantStocks && (product as any).variantStocks[variantId] !== undefined) {
      return (product as any).variantStocks[variantId];
    }
    if (isDrink) {
      if (variantId === 'Mangga') return 20;
      if (variantId === 'Sirsak') return 15;
      if (variantId === 'Jambu') return 15;
    }
    return (product as any).stock ?? 25;
  };

  const currentVariantStock = isDrink ? getVariantStock(selectedVariant) : ((product as any).stock ?? 25);
  const isOutOfStock = currentVariantStock <= 0 || ((product as any).status === 'Low Stock' && (product as any).stock === 0);

  // Daftar varian yang sedang ada di keranjang untuk hidangan ini
  const variantsInCart = isDrink 
    ? DRINK_VARIANTS.map(v => {
        const key = `${product.id}_${v.id}`;
        const qty = cart[key] || 0;
        return { ...v, key, qty, subtotal: qty * product.price };
      }).filter(v => v.qty > 0)
    : [];

  const totalVariantsInCartCount = variantsInCart.reduce((sum, v) => sum + v.qty, 0);
  const totalVariantsInCartPrice = variantsInCart.reduce((sum, v) => sum + v.subtotal, 0);

  // Handler Reservasi Produk Habis ke Customer Service
  const handleReserveToCS = async () => {
    if (!user) {
      setAuthActionName('melakukan reservasi produk ke Customer Service');
      setShowAuthModal(true);
      return;
    }
    setIsReserving(true);
    const varName = isDrink ? activeDrinkVariant.name : product.name;
    const userEmail = user?.email || 'customer@nefakky.com';
    const userName = user?.displayName || 'Pelanggan Nefakky';

    const msgText = `[RESERVASI PRODUK HABIS] Halo Tim CS Nefakky, saya ingin melakukan pemesanan / reservasi produk "${product.name}${isDrink ? ` (${varName})` : ''}" sebanyak ${quantity} porsi yang saat ini sedang habis. Mohon prioritaskan pesanan saya dan hubungi saya segera jika stok sudah kembali restock ya. Terima kasih!`;

    try {
      await sendChatMessage(userEmail, userName, msgText);
    } catch (e) {
      console.error('Gagal mengirim chat reservasi:', e);
    }

    setIsReserving(false);
    setReservationSent(true);
  };

  // Foto Utama: Jika menu jus, ikuti varian aktif. Jika makanan, gunakan foto dari database
  const currentMainImage = isDrink 
    ? activeDrinkVariant.image 
    : (product.image || '/images/ayam_bakar.jpg');

  const totalPrice = product.price * quantity;

  // Realtime Reviews dari DataContext
  const communityReviews = useMemo(() => {
    const rawList = Array.isArray(reviews) ? reviews : [];
    const validReviews = rawList.filter(rev => {
      if (rev.isHidden) return false;
      if (rev.status && rev.status !== 'PUBLISHED' && rev.status !== 'APPROVED') return false;
      if (rev.productName) {
        const revProd = rev.productName.toLowerCase();
        const curProd = product.name.toLowerCase();
        return revProd.includes(curProd) || curProd.includes(revProd) || (isDrink && (revProd.includes('jus') || revProd.includes('minuman')));
      }
      return true;
    });

    const sorted = sortReviewsNewestFirst(validReviews.length > 0 ? validReviews : rawList);
    
    if (sorted.length > 0) {
      const avatarBgs = ['bg-[#1E293B] text-white', 'bg-[#BFDBFE] text-[#1E3A8A]', 'bg-[#292524] text-white', 'bg-[#0F766E] text-white'];
      return sorted.slice(0, 3).map((r, idx) => {
        const name = r.authorName || 'Pelanggan Nefakky';
        const initials = name
          .split(' ')
          .map(w => w[0])
          .filter(Boolean)
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'NF';

        return {
          id: r.id || `realtime-rev-${idx}`,
          author: name,
          initials,
          avatarBg: avatarBgs[idx % avatarBgs.length],
          rating: typeof r.rating === 'number' ? r.rating : 5,
          date: r.date || 'Baru saja',
          comment: r.comment || '',
          photo: r.photoUrl || r.photo || r.image || (r.photos && r.photos[0]) || null
        };
      });
    }

    // Fallback default jika data review kosong
    return [
      {
        id: 'rev-1',
        author: 'Andi W.',
        initials: 'AW',
        avatarBg: 'bg-[#1E293B] text-white',
        rating: 5,
        date: '3 hari lalu',
        comment: isDrink 
          ? 'Jus mangganya kental banget dan manisnya alami tanpa gula berlebih, segar pol!' 
          : 'Bumbunya meresap sampai ke tulang! Madunya berasa banget tapi gak bikin eneg. Sambalnya juara, pedasnya pas.',
        photo: isDrink ? '/images/jus_mangga.jpg' : '/images/ayam_bakar.jpg'
      },
      {
        id: 'rev-2',
        author: 'Siti N.',
        initials: 'SN',
        avatarBg: 'bg-[#BFDBFE] text-[#1E3A8A]',
        rating: 4,
        date: '1 minggu lalu',
        comment: isDrink
          ? 'Varian jus sirsaknya mantap asam manis seimbang, cocok dinikmati dingin.'
          : 'Ayamnya empuk banget, gampang lepas dari tulang. Porsinya pas dan bumbunya nendang.',
        photo: null
      },
      {
        id: 'rev-3',
        author: 'Deni R.',
        initials: 'DR',
        avatarBg: 'bg-[#292524] text-white',
        rating: 5,
        date: '2 minggu lalu',
        comment: isDrink
          ? 'Jus jambunya wangi dan fresh, botolnya higienis gampang dibawa kemana-mana.'
          : 'Selalu pesan ini kalau lagi ngidam masakan nusantara. Kualitas konsisten dan kemasan rapi.',
        photo: isDrink ? '/images/jus_jambu.jpg' : '/images/nasi_bakar.jpg'
      }
    ];
  }, [reviews, product.name, isDrink]);

  const totalReviewsCount = useMemo(() => {
    if (Array.isArray(reviews) && reviews.length > 0) {
      const matching = reviews.filter(r => !r.isHidden && (r.status === 'PUBLISHED' || r.status === 'APPROVED' || !r.status));
      return matching.length > 0 ? matching.length : (isDrink ? 140 : 120);
    }
    return isDrink ? 140 : 120;
  }, [reviews, isDrink]);

  const handleAddToCart = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id, isDrink ? selectedVariant : undefined);
    }
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id, isDrink ? selectedVariant : undefined);
    }
    router.push('/cart');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Nikmati hidangan otentik ${product.name} di Nefakky!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareNotice(true);
      setTimeout(() => setShareNotice(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-black rounded-full animate-spin mb-3" />
        <p className="text-xs text-stone-500 font-medium">Memuat Detail Menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 font-sans selection:bg-stone-900 selection:text-white pb-28">
      
      {/* 1. BILAH NAVIGASI UTAMA */}
      <Navbar />

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 space-y-8">
        
        {/* Top Action Bar: Back, Wishlist & Share */}
        <div className="flex items-center justify-between">
          <Link
            href="/menu"
            className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-black flex items-center justify-center shadow-xs transition-colors"
            title="Kembali ke Katalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-700 hover:text-black flex items-center justify-center shadow-xs transition-colors active:scale-95"
              title="Bagikan Menu"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {shareNotice && (
          <div className="p-3 bg-neutral-900 text-white text-xs rounded-xl text-center animate-fade-in font-medium max-w-xs mx-auto">
            Tautan menu berhasil disalin ke clipboard!
          </div>
        )}

        {/* 3. PRODUCT HERO GRID (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* SISI KIRI: Foto Utama (1 Foto untuk Makanan, 3 Opsi Thumbnail Khusus Jus) */}
          <div className="lg:col-span-6 space-y-3.5">
            {/* Foto Utama */}
            <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 border border-stone-200/80 shadow-sm">
              <Image
                src={currentMainImage}
                alt={product.name}
                fill
                className="object-cover object-center transition-all duration-300"
                priority
              />
            </div>

            {/* KHUSUS MENU MINUMAN/JUS: 3 Opsi Thumbnail Pilihan Varian */}
            {isDrink && (
              <div className="grid grid-cols-3 gap-3">
                {DRINK_VARIANTS.map((v) => {
                  const isSelected = selectedVariant === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v.id)}
                      className={`relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border-2 transition-all group ${
                        isSelected 
                          ? 'border-neutral-900 ring-2 ring-neutral-900/20 scale-[1.02]' 
                          : 'border-stone-200/80 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={v.image}
                        alt={v.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white py-1 text-[10px] font-bold text-center">
                        {v.id}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SISI KANAN: Rincian Produk, Tab Box & Kartu Dapur */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Category & Rating */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                {product.category || (isDrink ? 'MINUMAN' : 'MAKANAN BERAT')}
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-neutral-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{(product as any).rating ? (product as any).rating.toFixed(1) : (isDrink ? '4.7' : '4.9')}</span>
                <span className="text-stone-400 font-normal">
                  ({totalReviewsCount} Ulasan)
                </span>
              </div>
            </div>

            {/* Title & Price */}
            <div className="space-y-1">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
                {isDrink ? `Jus Segar (${activeDrinkVariant.name})` : product.name}
              </h1>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 pt-1">
                Rp {product.price.toLocaleString('id-ID')}
              </div>
            </div>

            {/* KHUSUS MENU MINUMAN/JUS: Selector 3 Kartu Varian Pembelian */}
            {isDrink && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900 tracking-wider uppercase">
                    PILIH VARIAN JUS
                  </span>
                  <span className="text-stone-500 font-medium">
                    Varian: {activeDrinkVariant.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {DRINK_VARIANTS.map((v) => {
                    const isSelected = selectedVariant === v.id;
                    const vStock = getVariantStock(v.id);
                    const isVOutOfStock = vStock <= 0;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v.id)}
                        className={`relative p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                          isSelected
                            ? 'bg-white border-neutral-900 ring-1 ring-neutral-900 shadow-sm'
                            : isVOutOfStock
                              ? 'bg-stone-100/70 border-stone-200 opacity-60'
                              : 'bg-stone-50/80 border-stone-200 hover:bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-neutral-900 leading-tight">
                            {v.name}
                          </span>
                          {isSelected ? (
                            <span className="w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-stone-300 shrink-0 mt-0.5" />
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="inline-block text-[9px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded uppercase">
                            {v.tag}
                          </span>
                          <span className={`text-[9px] font-bold font-mono ${isVOutOfStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {isVOutOfStock ? 'Habis' : `Stok ${vStock}`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Multi-Varian: Ringkasan Varian di Keranjang Anda */}
            {isDrink && variantsInCart.length > 0 && (
              <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                    <ShoppingBag className="w-4 h-4 text-[#934B19]" />
                    <span>Varian di Keranjang ({totalVariantsInCartCount} Porsi)</span>
                  </span>
                  <span className="font-mono font-bold text-[#934B19] text-sm">
                    Total: Rp {totalVariantsInCartPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {variantsInCart.map(v => (
                    <div key={v.key} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200/80 text-xs shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-800">{v.name}</span>
                        <span className="text-stone-400 font-mono text-[11px]">Rp {v.subtotal.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => removeFromCart(v.key)}
                          className="w-6 h-6 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg flex items-center justify-center font-bold transition-colors cursor-pointer"
                          title="Kurangi"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs px-1.5">{v.qty}</span>
                        <button
                          type="button"
                          onClick={() => addToCart(product.id, v.id)}
                          className="w-6 h-6 bg-neutral-900 hover:bg-black text-white rounded-lg flex items-center justify-center font-bold transition-colors cursor-pointer"
                          title="Tambah"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/cart')}
                  className="w-full py-2.5 px-4 bg-[#25160E] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <span>Lanjut Bayar Semua Varian dalam 1 Transaksi</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            )}

            {/* Kotak Tab Rincian Terstruktur */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
              
              {/* Tab Navigation Row */}
              <div className="flex items-center gap-6 border-b border-stone-100 pb-2.5 text-xs font-semibold tracking-wider">
                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  className={`pb-2 transition-colors relative ${
                    activeTab === 'description'
                      ? 'text-neutral-900 border-b-2 border-neutral-900'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Deskripsi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ingredients')}
                  className={`pb-2 transition-colors relative ${
                    activeTab === 'ingredients'
                      ? 'text-neutral-900 border-b-2 border-neutral-900'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Komposisi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('storage')}
                  className={`pb-2 transition-colors relative ${
                    activeTab === 'storage'
                      ? 'text-neutral-900 border-b-2 border-neutral-900'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Penyimpanan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('serving')}
                  className={`pb-2 transition-colors relative ${
                    activeTab === 'serving'
                      ? 'text-neutral-900 border-b-2 border-neutral-900'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Sajian
                </button>
              </div>

              {/* Tab Content Display */}
              <div className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                {activeTab === 'description' && (
                  <p>
                    {isDrink
                      ? 'Aneka pilihan jus buah segar alami berkualitas premium: Jambu Biji Merah, Sirsak Manis, atau Mangga Harum Manis. Dibuat murni tanpa pemanis buatan untuk menjaga kesegaran dan vitamin alaminya.'
                      : (product.description || 'Ayam bakar otentik dengan olesan madu murni pilihan, dipanggang perlahan di atas arang batok kelapa untuk menghasilkan aroma smokey yang khas dan karamelisasi sempurna.')}
                  </p>
                )}
                {activeTab === 'ingredients' && (
                  <p>
                    {isDrink
                      ? 'Buah segar matang pohon (Mangga/Sirsak/Jambu), air mineral higienis, dan sedikit madu alami tanpa pengawet sintesis.'
                      : ((product as any).ingredients || 'Daging ayam pejantan segar, madu murni, kecap kedelai manis alami, lengkuas, ketumbar sangrai, serai, daun jeruk purut, bawang merah, bawang putih, dan cabai rawit merah segar.')}
                  </p>
                )}
                {activeTab === 'storage' && (
                  <p>
                    {isDrink
                      ? 'Simpan dalam chiller kulkas pada suhu 4°C (tahan 4 hari) untuk kenikmatan kesegaran maksimal.'
                      : ((product as any).storage || (product as any).usageAdvice || 'Simpan dalam chiller kulkas pada suhu 4°C (tahan 3 hari) atau simpan beku dalam freezer pada suhu -18°C (tahan hingga 1 bulan).')}
                  </p>
                )}
                {activeTab === 'serving' && (
                  <p>
                    {isDrink
                      ? 'Kocok perlahan sebelum diminum dan nikmati selagi dingin bersama es batu sesuai selera.'
                      : ((product as any).serving || 'Hangatkan dalam microwave selama 2 menit atau panggang kembali di atas teflon dengan api kecil selama 3-5 menit sebelum disantap bersama nasi hangat.')}
                  </p>
                )}
              </div>
            </div>

            {/* Kartu Dapur Utama Nefakky & Map Graphic */}
            <div className="bg-[#F6F5F2] border border-stone-200/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-[#934B19] shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-neutral-900">
                        Dapur Utama &amp; Lokasi Pembuatan
                      </h4>
                      <span className="bg-amber-100 text-[#934B19] text-[9px] font-semibold px-2 py-0.5 rounded-full">
                        Admin &amp; Produksi
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 font-light mt-0.5 leading-relaxed">
                      {(product as any).kitchenAddress || (product as any).origin || 'Puri Bojong Lestari 1 Blok AF 41, RT 10 / RW 14, Kel. Pabuaran, Kec. Bojong Gede, Kab. Bogor, Prov. Jawa Barat'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Embedded Google Maps Mini View */}
              <div className="relative w-full h-36 rounded-xl border border-stone-200 overflow-hidden bg-white shadow-2xs">
                <iframe
                  title="Peta Lokasi Dapur Utama Nefakky"
                  src="https://maps.google.com/maps?q=Puri+Bojong+Lestari+1+Blok+AF+41+Pabuaran+Bojong+Gede+Bogor&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Dapur Produksi Aktif (08.00 - 21.00 WIB)</span>
                </span>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Puri+Bojong+Lestari+1+Blok+AF+41+Pabuaran+Bojong+Gede+Bogor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#934B19] hover:underline flex items-center gap-1"
                >
                  <span>Buka Google Maps &rarr;</span>
                </a>
              </div>
            </div>

            {/* Banner Peringatan Jika Stok Habis */}
            {isOutOfStock && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5 animate-fade-in">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Produk Habis — Stok {isDrink ? `Varian ${activeDrinkVariant.name}` : product.name} Sedang Kosong</span>
                </div>
                <p className="text-xs text-rose-700 font-light leading-relaxed">
                  Mohon maaf, saat ini menu tidak dapat dibeli langsung. Anda dapat melakukan <strong>Pemesanan / Reservasi Prioritas</strong> ke Customer Service kami agar langsung dikabari begitu stok restock kembali!
                </p>
              </div>
            )}

            {/* Status Sukses Reservasi */}
            {reservationSent && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Reservasi Prioritas Berhasil Terkirim! 📋</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed font-light">
                  Permintaan prioritas untuk {quantity}x {isDrink ? `Jus ${selectedVariant}` : product.name} telah diterima oleh Tim CS. Kami akan segera menghubungi Anda saat stok kembali tersedia.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/profile"
                    className="px-3.5 py-2 bg-[#25160E] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Buka Live Chat CS
                  </Link>
                  <a
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo CS Nefakky, saya ingin reservasi pesanan ${product.name}${isDrink ? ` varian ${activeDrinkVariant.name}` : ''} sebanyak ${quantity} porsi yang sedang habis.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    WhatsApp CS
                  </a>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* 4. ULASAN KOMUNITAS (Realtime Community Reviews) */}
        <div className="border-t border-stone-200/80 pt-10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">
                Ulasan Komunitas
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Dari pelanggan yang telah menikmati hidangan ini.
              </p>
            </div>

            <Link
              href="/comments"
              className="text-xs font-bold text-neutral-900 hover:underline"
            >
              Lihat Semua ({totalReviewsCount}) &rarr;
            </Link>
          </div>

          {/* 3 Realtime Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {communityReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between space-y-3.5"
              >
                <div className="space-y-3">
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${rev.avatarBg}`}>
                        {rev.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 leading-none">
                          {rev.author}
                        </h4>
                        <span className="text-[10px] text-stone-400 font-light">
                          {rev.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-400 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-200 fill-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {rev.comment}
                  </p>
                </div>

                {/* Optional Photo Thumbnail */}
                {rev.photo && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200">
                    <Image
                      src={rev.photo}
                      alt="Foto Ulasan"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* 5. FOOTER */}
      <Footer />

      {/* 6. STICKY BOTTOM PURCHASE BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 py-3.5 px-4 sm:px-8 lg:px-16 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Total Price Left */}
          <div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">
              Total Harga
            </span>
            <span className="font-serif text-lg sm:text-xl font-bold text-neutral-900">
              Rp {totalPrice.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Stepper & Action Buttons Right */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between bg-stone-100 border border-stone-200 rounded-xl px-2 py-1.5 w-24 sm:w-28 shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-6 h-6 rounded hover:bg-white flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                aria-label="Kurang"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs sm:text-sm font-bold text-neutral-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-6 h-6 rounded hover:bg-white flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                aria-label="Tambah"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {isOutOfStock ? (
              <button
                onClick={handleReserveToCS}
                disabled={isReserving}
                className="py-2.5 px-4 sm:px-6 bg-[#934B19] hover:bg-[#783603] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isReserving ? 'Mengirim Reservasi...' : `Pesan / Reservasi ke Customer Service (${quantity} Porsi)`}</span>
              </button>
            ) : (
              <>
                {/* Tambah ke Keranjang Button */}
                <button
                  onClick={handleAddToCart}
                  className="py-2.5 px-3.5 sm:px-5 bg-white border border-stone-300 hover:bg-stone-50 active:scale-[0.99] text-stone-900 font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Tambah ke Keranjang</span>
                </button>

                {/* Beli Langsung Button */}
                <button
                  onClick={handleBuyNow}
                  className="py-2.5 px-4 sm:px-6 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer"
                >
                  Beli Langsung
                </button>
              </>
            )}

          </div>

        </div>
      </div>

      {/* Success Notification Alert */}
      {addedNotice && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-white border border-emerald-300 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in text-xs font-semibold text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{quantity}x {isDrink ? `Jus Segar (${selectedVariant})` : product.name} berhasil ditambahkan ke keranjang!</span>
        </div>
      )}

      {/* MODAL WAJIB AUTENTIKASI UNTUK PENGGUNA GUEST */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionName={authActionName}
      />

    </div>
  );
}
