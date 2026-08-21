'use client';

/**
 * ============================================================================
 * KOMPONEN: MenuDetailModal.tsx (Modal Informasi & Pemesanan Detail Produk)
 * DESKRIPSI: Modal pop-up modern untuk menampilkan visual galeri produk,
 *            pemilihan 3 varian jus, deskripsi komposisi, saran penyimpanan,
 *            alamat dapur produksi, serta ulasan realtime pelanggan.
 * ============================================================================
 */

// Mengimpor React dan hook useState untuk pengelolaan varian, thumbnail, tab & kuantitas
import React, { useState } from 'react';
// Mengimpor komponen Image dari Next.js untuk optimasi gambar
import Image from 'next/image';
// Mengimpor Link untuk navigasi ke halaman ulasan
import Link from 'next/link';
// Mengimpor hook useRouter untuk navigasi halaman
import { useRouter } from 'next/navigation';
// Mengimpor CartContext untuk menambahkan pesanan ke keranjang belanja
import { useCart } from '@/context/CartContext';
// Mengimpor DataContext untuk membaca ulasan publik & daftar hidangan
import { useData } from '@/context/DataContext';
// Mengimpor generator ulasan makanan spesifik berbahasa Indonesia
import { getProductSpecificReviews } from '@/lib/reviews';
// Mengimpor ikon-ikon modern dari Lucide React
import { 
  X, 
  Star, 
  Heart, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle2,
  Sparkles,
  Share2,
  MapPin,
  MessageCircle
} from 'lucide-react';

/** Interface Struktur Data Produk untuk Modal Detail */
export interface DetailProduct {
  id: string; // ID unik produk
  name: string; // Nama menu hidangan
  category: string; // Kategori menu
  price: number; // Harga per porsi (Rp)
  rating: number; // Rating bintang
  reviewsCount?: string; // Teks jumlah ulasan
  soldCount?: string; // Teks jumlah terjual
  image: string; // URL/Path gambar utama
  description: string; // Deskripsi lengkap hidangan
  ingredients?: string; // Komposisi bahan
  storage?: string; // Cara penyimpanan
  serving?: string; // Saran penyajian
  thumbnails?: string[]; // Array gambar thumbnail galeri
  isComingSoon?: boolean; // Status hidangan segera hadir
  releaseDate?: string; // Estimasi waktu rilis hidangan
  reviews?: {
    id: string;
    author: string;
    avatar: string;
    rating: number;
    text: string;
    image?: string;
  }[];
}

/** Interface Properti Modal Detail Produk */
interface MenuDetailModalProps {
  product: DetailProduct | null; // Data produk yang dipilih atau null jika tertutup
  onClose: () => void; // Fungsi callback untuk menutup modal
}

// 3 Pilihan Varian Rasa Khusus Menu Minuman Jus
const DRINK_VARIANTS = [
  { id: 'Mangga', name: 'Jus Mangga Segar', tag: 'Fresh & Manis', desc: 'Mangga Harum Manis alami kaya akan Vitamin C & A', image: '/images/jus_mangga.jpg' },
  { id: 'Sirsak', name: 'Jus Sirsak Segar', tag: 'Asam Manis', desc: 'Sirsak murni dengan cita rasa khas asam manis alami', image: '/images/jus_sirsak.jpg' },
  { id: 'Jambu', name: 'Jus Jambu Biji', tag: 'Super Vitamin C', desc: 'Jambu biji merah segar untuk imunitas dan kesegaran harian', image: '/images/jus_jambu.jpg' }
];

// Komponen Utama Modal Detail Produk
export default function MenuDetailModal({ product, onClose }: MenuDetailModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { reviews } = useData();

  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlist, setIsWishlist] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'storage' | 'serving'>('description');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('Mangga');
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  // Realtime Product Reviews filtered from Ulasan Rasa DataContext
  const liveProductReviews = React.useMemo(() => {
    if (!product || !reviews) return [];
    
    // Find reviews matching this dish
    const matched = reviews.filter(r => {
      if (r.isHidden || r.status === 'REJECTED') return false;
      if (!r.productName) return false;
      const rName = r.productName.toLowerCase();
      const pName = product.name.toLowerCase();
      return rName.includes(pName) || pName.includes(rName);
    });

    if (matched.length > 0) return matched;
    // Fallback to top approved reviews if no direct product match yet
    return reviews.filter(r => !r.isHidden && r.status !== 'REJECTED');
  }, [reviews, product]);

  if (!product) return null;

  const isDrink = product.category === 'Minuman' || product.id === 'm6' || product.name.toLowerCase().includes('jus');
  const activeDrinkVariant = DRINK_VARIANTS.find(v => v.id === selectedVariant) || DRINK_VARIANTS[0];

  const currentMainImage = isDrink 
    ? (selectedImage || activeDrinkVariant.image) 
    : (selectedImage || product.image);

  const productThumbnails = isDrink
    ? DRINK_VARIANTS.map(v => v.image)
    : (product as any).gallery && (product as any).gallery.length > 0
    ? (product as any).gallery
    : product.thumbnails && product.thumbnails.length > 0
    ? product.thumbnails
    : [product.image];

  const defaultReviews = product.reviews || getProductSpecificReviews(product.name, product.image);

  const handleSelectVariant = (variantId: string, imgUrl: string) => {
    setSelectedVariant(variantId);
    setSelectedImage(imgUrl);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id, isDrink ? selectedVariant : undefined);
    }
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id, isDrink ? selectedVariant : undefined);
    }
    onClose();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 md:p-10 flex items-center justify-center animate-fade-in">
      <div className="bg-[#FAF8F5] w-full max-w-5xl rounded-3xl sm:rounded-[32px] overflow-hidden shadow-2xl border border-stone-200/80 relative my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors shadow-md active:scale-95"
          aria-label="Tutup Modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-10">
          
          {/* TOP GRID: Product Gallery & Purchase Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
            
            {/* Left: Product Images & Gallery */}
            <div className="lg:col-span-6 space-y-3 sm:space-y-4">
              {/* Main Display Image */}
              <div className="relative w-full h-[240px] sm:h-[340px] md:h-[400px] rounded-2xl sm:rounded-[28px] overflow-hidden bg-stone-100 shadow-md border border-stone-200/60">
                <Image
                  src={currentMainImage}
                  alt={product.name}
                  fill
                  className="object-cover object-center transition-all duration-300"
                  priority
                />
              </div>

              {/* Thumbnails Row */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
                {productThumbnails.map((imgUrl: string, idx: number) => {
                  const matchingVariant = isDrink ? DRINK_VARIANTS[idx] : null;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (matchingVariant) {
                          handleSelectVariant(matchingVariant.id, imgUrl);
                        } else {
                          setSelectedImage(imgUrl);
                        }
                      }}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-stone-100 ${
                        currentMainImage === imgUrl ? 'border-[#5C3D28] ring-2 ring-[#5C3D28]/20 scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <Image src={imgUrl} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                      {matchingVariant && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-semibold text-center py-0.5">
                          {matchingVariant.id}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Purchase & Details Panel */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Category & Coming Soon Pill Tag */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-3.5 py-1 bg-[#F5EBE1] text-[#7A4B29] text-xs font-medium rounded-full">
                  {product.category}
                </span>
                {product.isComingSoon && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/15 border border-amber-600/30 text-[#934B19] text-xs font-bold rounded-full">
                    <Sparkles className="w-3 h-3 text-[#934B19]" />
                    <span>⏳ SEGERA HADIR ({product.releaseDate || 'COMING SOON'})</span>
                  </span>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
                  {isDrink ? `Jus Segar (${activeDrinkVariant.id})` : product.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-light">
                  <div className="flex items-center gap-1 font-semibold text-stone-800">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                  <span>|</span>
                  <span>{product.reviewsCount || (product.isComingSoon ? 'Segera Hadir' : '1.2k reviews')}</span>
                  <span>|</span>
                  <span>{product.soldCount || (product.isComingSoon ? 'Tahap Persiapan' : '850 Terjual')}</span>
                  <span className="ml-auto font-medium flex items-center gap-1">
                    {product.isComingSoon ? (
                      <span className="text-amber-800 flex items-center gap-1 font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        Akan Hadir
                      </span>
                    ) : (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Ready Stock
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <div className="font-serif text-3xl font-bold text-[#5C3D28]">
                  Rp {product.price.toLocaleString('id-ID')}
                </div>
                {product.isComingSoon && (
                  <span className="text-xs font-semibold text-[#934B19] bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                    Estimasi Harga Rilis
                  </span>
                )}
              </div>

              {/* 3 Drink Variants Selector (Khusus Minuman) */}
              {isDrink && (
                <div className="space-y-3 p-4 bg-[#FAF5F0] border border-[#8A6337]/25 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5C3D28] flex items-center gap-1.5">
                      🍹 Pilih Varian Rasa Jus (3 Pilihan):
                    </span>
                    <span className="text-[10px] text-[#7A4B29] font-medium bg-[#EADCCF] px-2 py-0.5 rounded-full">
                      Varian: {selectedVariant}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {DRINK_VARIANTS.map((v) => {
                      const isSelected = selectedVariant === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelectVariant(v.id, v.image)}
                          className={`relative p-2.5 rounded-xl border-2 text-left transition-all flex flex-col items-center text-center gap-1.5 ${
                            isSelected
                              ? 'bg-white border-[#5C3D28] ring-2 ring-[#5C3D28]/20 shadow-md scale-[1.02]'
                              : 'bg-white/60 border-stone-200 hover:bg-white hover:border-stone-300 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                            <Image src={v.image} alt={v.name} fill className="object-cover" />
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-[#2D231C] leading-tight">
                              {v.name.replace(' Segar', '')}
                            </div>
                            <div className="text-[9px] text-stone-500 font-light mt-0.5">
                              {v.tag}
                            </div>
                          </div>
                          {isSelected && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-[#5C3D28] text-white rounded-full flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Production Origin Address Card */}
              <div className="p-3.5 bg-[#FAF6F0] border border-[#8A6337]/30 rounded-2xl flex items-start gap-3 text-xs text-stone-700">
                <MapPin className="w-4 h-4 text-[#8A6337] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#7A4B29] font-bold uppercase tracking-wider block mb-0.5">
                    🏭 ALAMAT &amp; DAERAH PRODUKSI:
                  </span>
                  <span className="font-semibold text-stone-900 leading-relaxed block">
                    {(product as any).origin || 'Puri Bojong Lestari AF No 41, Rt 10 Rw 14, Kel. Pabuaran, Kec. Bojong Gede, Kabupaten Bogor, Provinsi Jawa Barat, Indonesia'}
                  </span>
                </div>
              </div>

              {/* Quantity & Action Buttons or Coming Soon Teaser */}
              {product.isComingSoon ? (
                <div className="p-5 bg-gradient-to-r from-[#25160E] to-[#934B19] rounded-2xl sm:rounded-3xl text-white shadow-lg space-y-3 text-left">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                        Menu Segera Hadir (Coming Soon)
                      </span>
                      <span className="text-[11px] text-white/80 font-normal">
                        Estimasi Peluncuran: {product.releaseDate || 'Segera Meluncur'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-white/90 font-light leading-relaxed">
                    Hidangan istimewa ini sedang dipersiapkan dengan kurasi bahan baku dan racikan rempah terbaik oleh koki Dapur Nefakky. Nantikan rilis resminya!
                  </p>
                  <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-amber-200 font-semibold">
                      💡 Pantau halaman ini untuk pembaruan menu
                    </span>
                    <button
                      type="button"
                      onClick={() => alert(`Terima kasih atas antusiasme Anda! Menu "${product.name}" akan segera dapat dipesan saat rilis (${product.releaseDate || 'Segera'}).`)}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#25160E] text-xs font-bold rounded-xl transition-all shadow active:scale-95 shrink-0"
                    >
                      🔔 Ingatkan Saya
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-[#F5F2EC] px-4 py-2 rounded-full border border-stone-200/60">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-7 h-7 rounded-full bg-white text-stone-800 flex items-center justify-center shadow-sm hover:bg-stone-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-stone-800 min-w-[24px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-7 h-7 rounded-full bg-white text-stone-800 flex items-center justify-center shadow-sm hover:bg-stone-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons: Add to Cart & Buy Now */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={handleAddToCart}
                      className="w-full sm:flex-1 py-3.5 bg-[#F7F4EF] hover:bg-[#EFECE6] active:scale-[0.99] text-stone-800 font-medium rounded-full text-xs transition-all border border-stone-200/80 shadow-sm flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                    
                    <button
                      onClick={handleBuyNow}
                      className="w-full sm:flex-1 py-3.5 bg-[#3D2512] hover:bg-[#2A180B] active:scale-[0.99] text-white font-medium rounded-full text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>Buy Now</span>
                    </button>
                  </div>
                </>
              )}

              {addedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{quantity}x {isDrink ? `Jus Segar (${selectedVariant})` : product.name} telah ditambahkan ke keranjang belanja!</span>
                </div>
              )}

              {/* Tabs Navigation */}
              <div className="border-t border-stone-200/80 pt-6">
                <div className="flex items-center gap-6 border-b border-stone-200/60 pb-2 text-xs font-medium text-stone-500">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`pb-2 transition-colors ${activeTab === 'description' ? 'text-[#5C3D28] font-semibold border-b-2 border-[#5C3D28]' : 'hover:text-stone-800'}`}
                  >
                    Deskripsi
                  </button>
                  <button
                    onClick={() => setActiveTab('ingredients')}
                    className={`pb-2 transition-colors ${activeTab === 'ingredients' ? 'text-[#5C3D28] font-semibold border-b-2 border-[#5C3D28]' : 'hover:text-stone-800'}`}
                  >
                    Bahan-Bahan
                  </button>
                  <button
                    onClick={() => setActiveTab('storage')}
                    className={`pb-2 transition-colors ${activeTab === 'storage' ? 'text-[#5C3D28] font-semibold border-b-2 border-[#5C3D28]' : 'hover:text-stone-800'}`}
                  >
                    Cara Penyimpanan
                  </button>
                  <button
                    onClick={() => setActiveTab('serving')}
                    className={`pb-2 transition-colors ${activeTab === 'serving' ? 'text-[#5C3D28] font-semibold border-b-2 border-[#5C3D28]' : 'hover:text-stone-800'}`}
                  >
                    Saran Penyajian
                  </button>
                </div>

                {/* Tab Content Display */}
                <div className="pt-4 text-xs text-stone-600 font-light leading-relaxed">
                  {activeTab === 'description' && (
                    <p>{product.description || "Slow-cooked beef for 12 hours in traditional Padang spices and rich coconut milk. Tender, flavorful, and authentic. A masterpiece of Indonesian culinary heritage delivered to your doorstep."}</p>
                  )}
                  {activeTab === 'ingredients' && (
                    <p>{product.ingredients || "Daging sapi pilihan, rempah-rempah alami (lengkuas, kunyit, serai, daun jeruk), santan kelapa murni, bawang merah, bawang putih, cabai merah premium."}</p>
                  )}
                  {activeTab === 'storage' && (
                    <p>{product.storage || "Simpan di dalam kulkas pada suhu 4°C (tahan hingga 7 hari) atau dalam freezer -18°C (tahan hingga 1 bulan)."}</p>
                  )}
                  {activeTab === 'serving' && (
                    <p>{product.serving || "Panaskan dalam microwave selama 2-3 menit atau di atas wajan dengan api kecil selama 5 menit sebelum disajikan hangat."}</p>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* BOTTOM SECTION: What Our Foodies Say (Realtime Reviews & Comments) */}
          <div className="border-t border-stone-200/80 pt-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2D231C] flex items-center gap-2">
                  <span>What Our Foodies Say</span>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-[#934B19] text-[10px] font-bold rounded-full border border-amber-300">
                    Realtime Ulasan Rasa
                  </span>
                </h2>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  Ulasan jujur cita rasa langsung dari pengikmat {product.name}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/comments?dish=${encodeURIComponent(product.name)}`}
                  onClick={onClose}
                  className="px-3.5 py-2 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-amber-200" />
                  <span>✍️ Tulis Ulasan Rasa</span>
                </Link>
                <Link 
                  href="/comments" 
                  onClick={onClose}
                  className="text-xs font-semibold text-[#7A4B29] hover:underline shrink-0"
                >
                  Lihat Semua ({reviews?.length || 0}) &rarr;
                </Link>
              </div>
            </div>

            {/* Realtime Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveProductReviews.slice(0, 3).map((rev) => {
                const authorName = rev.authorName || (rev as any).author || 'Gourmet Foodie';
                const avatarUrl = rev.authorAvatar || rev.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=25160E&color=ffffff&bold=true`;
                const commentText = rev.comment || (rev as any).text || '';
                const foodPhoto = rev.photos?.[0] || rev.productImage || (rev as any).image;

                return (
                  <div 
                    key={rev.id} 
                    className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* User Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-stone-100 border border-stone-200 shadow-xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-stone-900 leading-snug">{authorName}</h4>
                            <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200 fill-stone-200'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {rev.productName && (
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-[#934B19] text-[9px] font-bold rounded-full truncate max-w-[100px]">
                            {rev.productName}
                          </span>
                        )}
                      </div>

                      {/* Review Comment Text */}
                      <p className="text-xs text-stone-700 font-light italic leading-relaxed">
                        "{commentText}"
                      </p>

                      {/* Replies List (CS Admin / User Replies) */}
                      {rev.replies && rev.replies.length > 0 && (
                        <div className="pt-2 border-t border-stone-100 space-y-2">
                          {rev.replies.slice(0, 2).map((reply) => (
                            <div key={reply.id} className="p-2.5 bg-[#FBF9F5] border border-amber-900/10 rounded-xl space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-bold text-[#25160E] flex items-center gap-1">
                                  {reply.authorName}
                                  {reply.authorName.toLowerCase().includes('admin') && (
                                    <span className="px-1.5 py-0.2 bg-[#934B19] text-white text-[8px] rounded font-bold">CS ADMIN</span>
                                  )}
                                </span>
                                <span className="text-[9px] text-stone-400">{reply.date}</span>
                              </div>
                              <p className="text-[11px] text-[#4F4540]">{reply.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Optional Food Photo Proof */}
                    {foodPhoto && (
                      <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-stone-100 bg-stone-900 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={foodPhoto} alt="Foto ulasan masakan" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
