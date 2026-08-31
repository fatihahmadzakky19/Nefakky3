'use client';

/**
 * ============================================================================
 * KOMPONEN: MenuDetailModal.tsx (Modal Informasi & Pemesanan Detail Produk)
 * DESKRIPSI: Modal pop-up modern untuk menampilkan rincian produk. Khusus
 *            menu jus, menyediakan 3 opsi gambar galeri dan selector 3 varian
 *            (Mangga, Sirsak, Jambu), sedangkan makanan berat 1 foto tunggal.
 *            Dilengkapi dengan bagian Ulasan Komunitas REALTIME dari DataContext.
 * DESAIN: Artisanal Luxury Editorial sesuai referensi desain Nefakky.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useData, sortReviewsNewestFirst } from '@/context/DataContext';
import AuthRequiredModal from './AuthRequiredModal';
import { 
  X, 
  Star, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Store,
  Check,
  MapPin,
  Navigation,
  Copy,
  Clock,
  ExternalLink
} from 'lucide-react';

export interface DetailProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  stock?: number;
  variantStocks?: { [variantKey: string]: number };
  reviewsCount?: string | number;
  soldCount?: string;
  image: string;
  description: string;
  ingredients?: string;
  storage?: string;
  serving?: string;
  thumbnails?: string[];
  isComingSoon?: boolean;
  releaseDate?: string;
  reviews?: {
    id: string;
    author: string;
    avatar: string;
    rating: number;
    text: string;
    image?: string;
  }[];
}

interface MenuDetailModalProps {
  product: DetailProduct | null;
  onClose: () => void;
}

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

export default function MenuDetailModal({ product, onClose }: MenuDetailModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart } = useCart();
  const { reviews, products, sendChatMessage } = useData();

  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'storage' | 'serving'>('description');
  const [selectedVariant, setSelectedVariant] = useState<string>('Mangga');
  const [addedNotice, setAddedNotice] = useState<boolean>(false);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  // State Reservasi Produk Habis ke Customer Service
  const [isReserving, setIsReserving] = useState<boolean>(false);
  const [reservationSent, setReservationSent] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authActionName, setAuthActionName] = useState<string>('memesan hidangan ini');

  const kitchenAddress = 'Puri Bojong Lestari 1 Blok AF 41, RT 10 / RW 14, Kel. Pabuaran, Kec. Bojong Gede, Kab. Bogor, Prov. Jawa Barat';

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(kitchenAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  if (!product) return null;

  // Sinkronisasi data live product dari DataContext jika tersedia
  const liveProduct = products.find(p => p.id === product.id) || product;

  const isDrink = liveProduct.category === 'Minuman' || liveProduct.id === 'm6' || liveProduct.name.toLowerCase().includes('jus');
  const activeDrinkVariant = DRINK_VARIANTS.find(v => v.id === selectedVariant) || DRINK_VARIANTS[0];

  // Helper cek stok per varian
  const getVariantStock = (variantId: string): number => {
    if (liveProduct.variantStocks && liveProduct.variantStocks[variantId] !== undefined) {
      return liveProduct.variantStocks[variantId];
    }
    if (isDrink) {
      if (variantId === 'Mangga') return 20;
      if (variantId === 'Sirsak') return 15;
      if (variantId === 'Jambu') return 15;
    }
    return liveProduct.stock ?? 25;
  };

  const currentVariantStock = isDrink ? getVariantStock(selectedVariant) : ((liveProduct as any).stock ?? 25);
  const isOutOfStock = currentVariantStock <= 0 || ((liveProduct as any).status === 'Low Stock' && (liveProduct as any).stock === 0);

  // Daftar varian yang sedang ada di keranjang untuk hidangan ini
  const variantsInCart = isDrink 
    ? DRINK_VARIANTS.map(v => {
        const key = `${liveProduct.id}_${v.id}`;
        const qty = cart[key] || 0;
        return { ...v, key, qty, subtotal: qty * liveProduct.price };
      }).filter(v => v.qty > 0)
    : [];

  const totalVariantsInCartCount = variantsInCart.reduce((sum, v) => sum + v.qty, 0);
  const totalVariantsInCartPrice = variantsInCart.reduce((sum, v) => sum + v.subtotal, 0);

  const currentMainImage = isDrink 
    ? activeDrinkVariant.image 
    : (liveProduct.image || '/images/ayam_bakar.jpg');

  const totalPrice = liveProduct.price * quantity;

  // Helper pembersih string untuk pencocokan ulasan akurat
  const cleanStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Realtime Reviews dari DataContext yang strictly cocok dengan hidangan ini
  const communityReviews = useMemo(() => {
    const rawList = Array.isArray(reviews) ? reviews : [];
    const curProdName = cleanStr(liveProduct.name);
    const curProdId = liveProduct.id;

    // Filter ulasan yang khusus untuk produk ini
    const matching = rawList.filter(rev => {
      if (rev.isHidden) return false;
      if (rev.status && rev.status !== 'PUBLISHED' && rev.status !== 'APPROVED') return false;

      // 1. Pencocokan via Product ID
      if (rev.productId && rev.productId === curProdId) return true;

      // 2. Pencocokan via Product Name
      if (rev.productName) {
        const revName = cleanStr(rev.productName);
        if (revName === curProdName) return true;
        if (revName.includes(curProdName) || curProdName.includes(revName)) return true;

        // Pencocokan kata kunci hidangan nusantara
        if (curProdName.includes('ayam') && revName.includes('ayam')) return true;
        if (curProdName.includes('gudeg') && revName.includes('gudeg')) return true;
        if (curProdName.includes('nasi') && revName.includes('nasi')) return true;
        if (curProdName.includes('garang') && revName.includes('garang')) return true;
        if (curProdName.includes('krecek') && revName.includes('krecek')) return true;
        if (isDrink && (revName.includes('jus') || revName.includes('minuman') || revName.includes('mangga') || revName.includes('sirsak') || revName.includes('jambu'))) return true;
      }
      return false;
    });

    const sorted = sortReviewsNewestFirst(matching);

    const avatarBgs = ['bg-[#1E293B] text-white', 'bg-[#BFDBFE] text-[#1E3A8A]', 'bg-[#292524] text-white', 'bg-[#0F766E] text-white'];
    
    return sorted.map((r, idx) => {
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
        photo: r.photoUrl || r.photo || (r.photos && r.photos[0]) || null
      };
    });
  }, [reviews, liveProduct.name, liveProduct.id, isDrink]);

  const totalReviewsCount = useMemo(() => {
    return communityReviews.length;
  }, [communityReviews]);

  const handleAddToCart = () => {
    if (!user) {
      setAuthActionName('menambahkan hidangan ke keranjang belanja');
      setShowAuthModal(true);
      return;
    }
    if (isOutOfStock) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(liveProduct.id, isDrink ? selectedVariant : undefined);
    }
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    if (!user) {
      setAuthActionName('memesan dan membeli hidangan');
      setShowAuthModal(true);
      return;
    }
    if (isOutOfStock) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(liveProduct.id, isDrink ? selectedVariant : undefined);
    }
    onClose();
    router.push('/cart');
  };

  // Handler Reservasi Produk Habis ke Customer Service
  const handleReserveToCS = async () => {
    if (!user) {
      setAuthActionName('melakukan reservasi produk ke Customer Service');
      setShowAuthModal(true);
      return;
    }
    setIsReserving(true);
    const varName = isDrink ? activeDrinkVariant.name : liveProduct.name;
    const userEmail = user?.email || 'customer@nefakky.com';
    const userName = user?.displayName || 'Pelanggan Nefakky';

    const msgText = `[RESERVASI PRODUK HABIS] Halo Tim CS Nefakky, saya ingin melakukan pemesanan / reservasi produk "${liveProduct.name}${isDrink ? ` (${varName})` : ''}" sebanyak ${quantity} porsi yang saat ini sedang habis. Mohon prioritaskan pesanan saya dan hubungi saya segera jika stok sudah kembali restock ya. Terima kasih!`;

    try {
      await sendChatMessage(userEmail, userName, msgText);
    } catch (e) {
      console.error('Gagal mengirim chat reservasi:', e);
    }

    setIsReserving(false);
    setReservationSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 md:p-10 flex items-center justify-center animate-fade-in font-sans">
      <div className="bg-[#FBF9F5] w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-stone-200/90 relative my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-black flex items-center justify-center transition-all shadow-sm active:scale-95"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-8 md:p-10 space-y-6">
          
          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            
            {/* Left: Main Photo & (3 Thumbnails Khusus Minuman) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative w-full h-[280px] sm:h-[360px] md:h-[400px] rounded-2xl overflow-hidden bg-stone-900 border border-stone-200/80 shadow-xs">
                <Image
                  src={currentMainImage}
                  alt={product.name}
                  fill
                  className="object-cover object-center transition-all duration-300"
                  priority
                />
              </div>

              {/* KHUSUS MENU MINUMAN/JUS: 3 Opsi Thumbnail */}
              {isDrink && (
                <div className="grid grid-cols-3 gap-2.5">
                  {DRINK_VARIANTS.map((v) => {
                    const isSelected = selectedVariant === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v.id)}
                        className={`relative aspect-square rounded-xl overflow-hidden bg-stone-100 border-2 transition-all group ${
                          isSelected 
                            ? 'border-neutral-900 ring-1 ring-neutral-900 scale-[1.02]' 
                            : 'border-stone-200 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={v.image}
                          alt={v.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white py-0.5 text-[9px] font-bold text-center">
                          {v.id}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Details, Tab Box & Dapur Card */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Category & Rating */}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                  {product.category || (isDrink ? 'MINUMAN' : 'MAKANAN BERAT')}
                </span>
                <div className="flex items-center gap-1 text-xs font-semibold text-neutral-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating ? product.rating.toFixed(1) : (isDrink ? '4.7' : '4.9')}</span>
                  <span className="text-stone-400 font-normal">
                    ({totalReviewsCount} Ulasan)
                  </span>
                </div>
              </div>

              {/* Title & Price */}
              <div className="space-y-1">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-tight">
                  {isDrink ? `Jus Segar (${activeDrinkVariant.name})` : product.name}
                </h2>
                <div className="font-serif text-2xl font-bold text-neutral-900 pt-0.5">
                  Rp {product.price.toLocaleString('id-ID')}
                </div>
              </div>

              {/* KHUSUS MENU MINUMAN/JUS: Selector 3 Kartu Varian */}
              {isDrink && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900 tracking-wider uppercase text-[11px]">
                      PILIH VARIAN JUS
                    </span>
                    <span className="text-stone-500 font-medium text-[11px]">
                      {activeDrinkVariant.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {DRINK_VARIANTS.map((v) => {
                      const isSelected = selectedVariant === v.id;
                      const vStock = getVariantStock(v.id);
                      const isVOutOfStock = vStock <= 0;

                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v.id)}
                          className={`relative p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-white border-neutral-900 ring-1 ring-neutral-900 shadow-xs'
                              : isVOutOfStock
                                ? 'bg-stone-100/70 border-stone-200 opacity-60'
                                : 'bg-stone-50/80 border-stone-200 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-neutral-900 leading-tight">
                              {v.name.replace(' Segar', '')}
                            </span>
                            {isSelected ? (
                              <span className="w-3.5 h-3.5 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                                <Check className="w-2 h-2" />
                              </span>
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <span className="inline-block text-[8px] font-bold text-stone-600 bg-stone-100 px-1 py-0.5 rounded uppercase">
                              {v.tag}
                            </span>
                            <span className={`text-[8.5px] font-bold font-mono ${isVOutOfStock ? 'text-rose-600' : 'text-emerald-700'}`}>
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
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#934B19]" />
                      <span>Varian di Keranjang ({totalVariantsInCartCount} Porsi)</span>
                    </span>
                    <span className="font-mono font-bold text-[#934B19] text-xs">
                      Total: Rp {totalVariantsInCartPrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {variantsInCart.map(v => (
                      <div key={v.key} className="flex items-center justify-between bg-white p-2 rounded-xl border border-stone-200/70 text-xs shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800">{v.name}</span>
                          <span className="text-stone-400 font-mono text-[11px]">Rp {v.subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => removeFromCart(v.key)}
                            className="w-5 h-5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded flex items-center justify-center font-bold transition-colors cursor-pointer"
                            title="Kurangi"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="font-mono font-bold text-xs px-1">{v.qty}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(liveProduct.id, v.id)}
                            className="w-5 h-5 bg-neutral-900 hover:bg-black text-white rounded flex items-center justify-center font-bold transition-colors cursor-pointer"
                            title="Tambah"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push('/cart');
                    }}
                    className="w-full py-2 px-3 bg-[#25160E] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Lanjut Bayar Semua Varian (1 Transaksi)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              )}

              {/* Tab Box */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-5 border-b border-stone-100 pb-2 text-xs font-semibold tracking-wider">
                  <button
                    type="button"
                    onClick={() => setActiveTab('description')}
                    className={`pb-1.5 transition-colors relative ${
                      activeTab === 'description' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    Deskripsi
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ingredients')}
                    className={`pb-1.5 transition-colors relative ${
                      activeTab === 'ingredients' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    Komposisi
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('storage')}
                    className={`pb-1.5 transition-colors relative ${
                      activeTab === 'storage' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    Penyimpanan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('serving')}
                    className={`pb-1.5 transition-colors relative ${
                      activeTab === 'serving' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    Sajian
                  </button>
                </div>

                <div className="text-xs text-stone-600 font-light leading-relaxed">
                  {activeTab === 'description' && (
                    <p>
                      {isDrink
                        ? 'Aneka pilihan jus buah segar alami berkualitas premium: Jambu Biji Merah, Sirsak Manis, atau Mangga Harum Manis.'
                        : (liveProduct.description || 'Ayam bakar otentik dengan olesan madu murni pilihan, dipanggang perlahan di atas arang batok kelapa.')}
                    </p>
                  )}
                  {activeTab === 'ingredients' && (
                    <p>
                      {isDrink
                        ? 'Buah segar matang pohon alami, air mineral higienis, dan sedikit madu tanpa pengawet.'
                        : ((liveProduct as any).ingredients || 'Daging ayam pejantan segar, madu murni, kecap kedelai manis alami, lengkuas, ketumbar sangrai, serai, daun jeruk purut, bawang merah, dan bawang putih.')}
                    </p>
                  )}
                  {activeTab === 'storage' && (
                    <p>
                      {isDrink
                        ? 'Simpan dalam chiller kulkas pada suhu 4°C (tahan 4 hari).'
                        : ((liveProduct as any).storage || (liveProduct as any).usageAdvice || 'Simpan dalam chiller kulkas pada suhu 4°C (tahan 3 hari) atau simpan beku dalam freezer pada suhu -18°C (tahan 1 bulan).')}
                    </p>
                  )}
                  {activeTab === 'serving' && (
                    <p>
                      {isDrink
                        ? 'Kocok perlahan sebelum diminum dan nikmati selagi dingin.'
                        : ((liveProduct as any).serving || 'Hangatkan dalam microwave selama 2 menit atau panggang kembali di atas teflon dengan api kecil selama 3-5 menit sebelum disantap.')}
                    </p>
                  )}
                </div>
              </div>

              {/* Dapur Utama Card (Interaktif: Dapat dipencet untuk melihat peta lokasi) */}
              <div 
                onClick={() => setShowLocationModal(true)}
                className="bg-stone-50/90 hover:bg-stone-100/90 border border-stone-200/90 rounded-2xl p-3 space-y-1.5 transition-all cursor-pointer group shadow-2xs"
                title="Klik untuk melihat lokasi peta tempat penjualan & pembuatan"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-[#934B19] group-hover:scale-105 transition-transform shrink-0 shadow-2xs">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#934B19] transition-colors">
                          Dapur Utama Nefakky
                        </h4>
                        <span className="bg-amber-100 text-[#934B19] text-[9px] font-semibold px-2 py-0.5 rounded-full">
                          Lokasi Pembuatan &amp; Admin
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-600 font-light mt-0.5 line-clamp-1">
                        Puri Bojong Lestari 1 Blok AF 41, RT 10 / RW 14, Pabuaran, Bojong Gede, Bogor
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-[#934B19] font-medium shrink-0 pt-0.5 group-hover:underline">
                    <span>Lihat Peta</span>
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Banner Peringatan Jika Stok Habis */}
              {isOutOfStock && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Produk Habis — Stok {isDrink ? `Varian ${activeDrinkVariant.name}` : liveProduct.name} Sedang Kosong</span>
                  </div>
                  <p className="text-[11px] text-rose-700 font-light leading-relaxed">
                    Mohon maaf, saat ini menu tidak dapat dibeli langsung. Anda dapat melakukan <strong>Pemesanan / Reservasi Prioritas</strong> ke Customer Service kami agar langsung dikabari begitu stok restock kembali!
                  </p>
                </div>
              )}

              {/* Status Sukses Reservasi */}
              {reservationSent && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Reservasi Prioritas Berhasil Terkirim! 📋</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed font-light">
                    Permintaan prioritas untuk {quantity}x {isDrink ? `Jus ${selectedVariant}` : liveProduct.name} telah diterima oleh Tim CS. Kami akan segera menghubungi Anda saat stok kembali tersedia.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href="/profile"
                      onClick={onClose}
                      className="px-3 py-1.5 bg-[#25160E] hover:bg-black text-white text-[11px] font-bold rounded-lg transition-colors"
                    >
                      Buka Live Chat CS
                    </Link>
                    <a
                      href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo CS Nefakky, saya ingin reservasi pesanan ${liveProduct.name}${isDrink ? ` varian ${activeDrinkVariant.name}` : ''} sebanyak ${quantity} porsi yang sedang habis.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                    >
                      WhatsApp CS
                    </a>
                  </div>
                </div>
              )}

              {/* Action Stepper & Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <div className="flex items-center justify-between bg-white border border-stone-200 rounded-xl px-2 py-1.5 w-24 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-6 h-6 rounded hover:bg-stone-100 flex items-center justify-center text-stone-600 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-6 h-6 rounded hover:bg-stone-100 flex items-center justify-center text-stone-600 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {isOutOfStock ? (
                  /* Tombol Reservasi ke Customer Service Jika Produk Habis */
                  <button
                    type="button"
                    onClick={handleReserveToCS}
                    disabled={isReserving}
                    className="flex-1 py-3 px-4 bg-[#934B19] hover:bg-[#783603] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{isReserving ? 'Mengirim Reservasi...' : `Pesan / Reservasi ke Customer Service (${quantity} Porsi)`}</span>
                  </button>
                ) : (
                  /* Tombol Pembelian Normal Jika Stok Tersedia */
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 py-2.5 px-3 bg-white border border-stone-300 hover:bg-stone-50 active:scale-[0.99] text-stone-900 font-medium text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="py-2.5 px-4 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-medium text-xs rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer"
                    >
                      Beli Langsung (Rp {totalPrice.toLocaleString('id-ID')})
                    </button>
                  </>
                )}
              </div>

              {addedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{quantity}x {isDrink ? `Jus Segar (${selectedVariant})` : liveProduct.name} berhasil ditambahkan ke keranjang!</span>
                </div>
              )}

            </div>

          </div>

          {/* Ulasan Komunitas (Realtime Community Reviews) */}
          <div className="border-t border-stone-200/80 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900">
                  Ulasan Komunitas
                </h3>
                <p className="text-[11px] text-stone-500 font-light mt-0.5">
                  Dari pelanggan yang telah menikmati hidangan ini.
                </p>
              </div>

              <Link
                href="/comments"
                onClick={onClose}
                className="text-xs font-bold text-neutral-900 hover:underline"
              >
                Lihat Semua ({totalReviewsCount}) &rarr;
              </Link>
            </div>

            {/* Ulasan Cards Grid atau Empty State */}
            {communityReviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {communityReviews.slice(0, 3).map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs flex flex-col justify-between space-y-2.5"
                  >
                    <div className="space-y-2">
                      {/* Author Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${rev.avatarBg}`}>
                            {rev.initials}
                          </div>
                          <div>
                            <h5 className="text-[11px] font-bold text-neutral-900 leading-none">
                              {rev.author}
                            </h5>
                            <span className="text-[9px] text-stone-400 font-light">
                              {rev.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-amber-400 text-[10px]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-200 fill-stone-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-[11px] text-stone-600 font-light leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>

                    {/* Optional Photo Thumbnail */}
                    {rev.photo && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-200 mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={rev.photo}
                          alt="Foto Ulasan"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200/80 text-center space-y-2">
                <p className="text-xs font-semibold text-neutral-800">Belum ada ulasan untuk hidangan ini</p>
                <p className="text-[11px] text-stone-500 font-light">Jadilah pelanggan pertama yang memberikan ulasan rasa untuk {product.name}!</p>
                <Link
                  href="/comments"
                  onClick={onClose}
                  className="inline-block mt-2 px-4 py-2 bg-black text-white text-xs font-medium rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  Tulis Ulasan Rasa
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MODAL LOKASI DAPUR UTAMA & ALAMAT ADMIN */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-left border border-stone-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#934B19]/10 flex items-center justify-center text-[#934B19]">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-900">
                    Dapur Utama &amp; Lokasi Pembuatan
                  </h3>
                  <p className="text-xs text-stone-500 font-light">
                    Alamat Resmi Tempat Penjualan &amp; Admin Nefakky
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alamat Lengkap Box */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#934B19] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider block">
                    Alamat Lengkap Tempat Penjualan, Pembuatan &amp; Admin:
                  </span>
                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    {kitchenAddress}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200/60">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-white border border-stone-200 px-2.5 py-1 rounded-full text-stone-700">
                  <Clock className="w-3 h-3 text-[#934B19]" />
                  <span>08.00 - 21.00 WIB (Buka Setiap Hari)</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-emerald-800">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Dapur Produksi &amp; Pickup Point</span>
                </span>
              </div>
            </div>

            {/* Embedded Google Maps View */}
            <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100">
              <iframe
                title="Peta Lokasi Dapur Utama Nefakky"
                src="https://maps.google.com/maps?q=Puri+Bojong+Lestari+1+Blok+AF+41+Pabuaran+Bojong+Gede+Bogor&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Puri+Bojong+Lestari+1+Blok+AF+41+Pabuaran+Bojong+Gede+Bogor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-[#25160E] hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Buka di Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              </a>

              <button
                onClick={handleCopyAddress}
                className="py-3 px-4 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-600" />
                    <span>Salin Alamat</span>
                  </>
                )}
              </button>
            </div>

          </div>
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
