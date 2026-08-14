'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart, MASTER_PRODUCTS } from '@/context/CartContext';
import { getProductSpecificReviews } from '@/lib/reviews';
import Navbar from '@/components/Navbar';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Star, 
  Heart, 
  Plus, 
  Minus, 
  ArrowLeft,
  CheckCircle2,
  MapPin
} from 'lucide-react';

const DRINK_VARIANTS = [
  { id: 'Mangga', name: 'Jus Mangga Segar', tag: 'Fresh & Manis', desc: 'Mangga Harum Manis alami kaya akan Vitamin C & A', image: '/images/jus_mangga.jpg' },
  { id: 'Sirsak', name: 'Jus Sirsak Segar', tag: 'Asam Manis', desc: 'Sirsak murni dengan cita rasa khas asam manis alami', image: '/images/jus_sirsak.jpg' },
  { id: 'Jambu', name: 'Jus Jambu Biji', tag: 'Super Vitamin C', desc: 'Jambu biji merah segar untuk imunitas dan kesegaran harian', image: '/images/jus_jambu.jpg' }
];

export default function MenuDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { addToCart } = useCart();

  const productId = params?.id as string;
  const product = MASTER_PRODUCTS.find(p => p.id === productId) || MASTER_PRODUCTS[1]; // Default Rendang Daging Premium

  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlist, setIsWishlist] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'storage' | 'serving'>('description');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('Mangga');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  const isDrink = product.category === 'Minuman' || product.id === 'm6' || product.name.toLowerCase().includes('jus');
  const activeDrinkVariant = DRINK_VARIANTS.find(v => v.id === selectedVariant) || DRINK_VARIANTS[0];

  const currentMainImage = isDrink 
    ? (selectedImage || activeDrinkVariant.image) 
    : (selectedImage || product.image);

  const productThumbnails = isDrink
    ? DRINK_VARIANTS.map(v => v.image)
    : [product.image];

  const handleSelectVariant = (variantId: string, imgUrl: string) => {
    setSelectedVariant(variantId);
    setSelectedImage(imgUrl);
  };

  const handleAddToCart = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id, isDrink ? selectedVariant : undefined);
    }
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#5C3D28] rounded-full animate-spin mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memuat Detail Menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans selection:bg-[#5C3D28]/10 selection:text-[#5C3D28] pb-20 lg:pb-0">
      
      {/* 1. TOP NAVBAR HEADER */}
      <Navbar />

      {/* 2. MAIN DETAIL CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-12 py-6 sm:py-10 space-y-6 sm:space-y-12">
        
        <Link href="/menu" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Katalog Menu</span>
        </Link>

        {/* TOP GRID: Product Gallery & Purchase Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative w-full h-[380px] sm:h-[450px] rounded-[32px] overflow-hidden bg-stone-100 shadow-md border border-stone-200/60">
              <Image
                src={currentMainImage}
                alt={product.name}
                fill
                className="object-cover object-center transition-all duration-300"
                priority
              />
            </div>

            {/* Thumbnails Row */}
            <div className="flex items-center gap-3">
              {productThumbnails.map((imgUrl, idx) => {
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
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-stone-100 ${
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

          {/* Right Column: Details & Purchase Actions */}
          <div className="lg:col-span-6 space-y-6">
            
            <div>
              <span className="inline-block px-3.5 py-1 bg-[#F5EBE1] text-[#7A4B29] text-xs font-medium rounded-full">
                {product.category}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
                {isDrink ? `Jus Segar (${activeDrinkVariant.id})` : product.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-light">
                <div className="flex items-center gap-1 font-semibold text-stone-800">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>5.0</span>
                </div>
                <span>|</span>
                <span>1.2k reviews</span>
                <span>|</span>
                <span>850 Terjual</span>
                <span className="ml-auto text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Ready Stock
                </span>
              </div>
            </div>

            <div className="font-serif text-3xl font-bold text-[#5C3D28]">
              Rp {product.price.toLocaleString('id-ID')}
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

            {/* Buttons: Add to Cart & Buy Now */}
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

            {addedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{quantity}x {isDrink ? `Jus Segar (${selectedVariant})` : product.name} ditambahkan ke keranjang belanja!</span>
              </div>
            )}

            {/* Tabs */}
            <div className="border-t border-stone-200/80 pt-6">
              <div className="flex items-center gap-6 border-b border-stone-200/60 pb-2 text-xs font-medium text-stone-500">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-2 transition-colors ${activeTab === 'description' ? 'text-[#5C3D28] font-semibold border-b-2 border-[#5C3D28]' : 'hover:text-stone-800'}`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`pb-2 transition-colors ${activeTab === 'ingredients' ? 'text-[#5C3D28] font-semibold border-b-2 border-[#5C3D28]' : 'hover:text-stone-800'}`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setActiveTab('storage')}
                  className={`pb-2 transition-colors ${activeTab === 'storage' ? 'text-[#5C3D28] font-semibold border-b-2 border-[#5C3D28]' : 'hover:text-stone-800'}`}
                >
                  Storage
                </button>
                <button
                  onClick={() => setActiveTab('serving')}
                  className={`pb-2 transition-colors ${activeTab === 'serving' ? 'text-[#5C3D28] font-semibold border-b-2 border-[#5C3D28]' : 'hover:text-stone-800'}`}
                >
                  Serving
                </button>
              </div>

              <div className="pt-4 text-xs text-stone-600 font-light leading-relaxed">
                {activeTab === 'description' && (
                  <p>{product.description || "Slow-cooked beef for 12 hours in traditional Padang spices and rich coconut milk. Tender, flavorful, and authentic. A masterpiece of Indonesian culinary heritage delivered to your doorstep."}</p>
                )}
                {activeTab === 'ingredients' && (
                  <p>Daging sapi pilihan, rempah-rempah alami (lengkuas, kunyit, serai, daun jeruk), santan kelapa murni, bawang merah, bawang putih, cabai merah premium.</p>
                )}
                {activeTab === 'storage' && (
                  <p>Simpan di dalam kulkas pada suhu 4°C (tahan hingga 7 hari) atau dalam freezer -18°C (tahan hingga 1 bulan).</p>
                )}
                {activeTab === 'serving' && (
                  <p>Panaskan dalam microwave selama 2-3 menit atau di atas wajan dengan api kecil selama 5 menit sebelum disajikan hangat.</p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: What Our Foodies Say */}
        <div className="border-t border-stone-200/80 pt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2D231C]">
              What Our Foodies Say
            </h2>
            <Link href="/comments" className="text-xs font-semibold text-[#7A4B29] hover:underline">
              Lihat Semua Komentar Foodies &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getProductSpecificReviews(product.name, product.image).map((rev) => (
              <div key={rev.id} className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-stone-100">
                      <Image src={rev.avatar} alt={rev.author} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900">{rev.author}</h4>
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
                  <p className="text-xs text-stone-600 font-light italic leading-relaxed">
                    {rev.text}
                  </p>
                </div>
                {rev.image && (
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden mt-2 border border-stone-100">
                    <Image src={rev.image} alt={product.name} fill className="object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* GUEST AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-amber-100 text-[#5C3D28] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              🔒
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-stone-900">Silakan Masuk Terlebih Dahulu</h3>
              <p className="text-xs text-stone-600 font-light leading-relaxed">
                Anda perlu masuk atau mendaftar akun untuk menambahkan makanan ini ke keranjang atau membeli.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-[#5C3D28] hover:bg-[#472B17] text-white font-medium text-xs rounded-full shadow transition-all"
              >
                Masuk ke Akun Saya
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full py-3 border border-[#5C3D28] text-[#5C3D28] hover:bg-[#5C3D28]/5 font-medium text-xs rounded-full transition-all"
              >
                Daftar Akun Baru
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-xs text-stone-400 hover:text-stone-600 font-light pt-1"
              >
                Lanjutkan Melihat Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
