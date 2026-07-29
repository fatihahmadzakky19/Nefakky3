'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart, MASTER_PRODUCTS } from '@/context/CartContext';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Star, 
  Heart, 
  Plus, 
  Minus, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

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
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  // Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const currentMainImage = selectedImage || product.image;
  const productThumbnails = [
    product.image,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
  ];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id);
    }
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id);
    }
    router.push('/cart');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#5C3D28] rounded-full animate-spin mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memuat Detail Menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans selection:bg-[#5C3D28]/10 selection:text-[#5C3D28]">
      
      {/* 1. TOP NAVBAR HEADER */}
      <header className="bg-[#FAF8F5] border-b border-stone-200/40 px-6 sm:px-12 py-5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-[#2D231C]">
            Nefakky
          </Link>

          {/* Navigation Links (Navbar with "Komentar") */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-stone-600">
            <Link href="/" className="hover:text-[#5C3D28] transition-colors">
              Home
            </Link>
            <Link href="/menu" className="text-[#5C3D28] font-bold border-b-2 border-[#5C3D28] pb-0.5">
              Menu
            </Link>
            <Link href="/#promo-section" className="hover:text-[#5C3D28] transition-colors">
              Promo
            </Link>
            <Link href="/comments" className="hover:text-[#5C3D28] transition-colors">
              Komentar
            </Link>
          </nav>

          {/* Utility Icons */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="p-2 text-stone-800 hover:text-[#5C3D28] transition-colors" title="Keranjang Belanja">
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            </Link>
            <Link href="/profile" className="p-2 text-stone-800 hover:text-[#5C3D28] transition-colors" title="Profil Pengguna">
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>
          </div>

        </div>
      </header>

      {/* 2. MAIN DETAIL CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-10 space-y-12">
        
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
              {productThumbnails.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-stone-100 ${
                    currentMainImage === imgUrl ? 'border-[#5C3D28] ring-2 ring-[#5C3D28]/20 scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <Image src={imgUrl} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
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
                {product.name}
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

            {/* Quantity Selector & Wishlist */}
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

              <button
                onClick={() => setIsWishlist(!isWishlist)}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors shadow-sm ${
                  isWishlist ? 'border-red-300 bg-red-50 text-red-500' : 'border-stone-300 bg-white text-stone-600 hover:text-red-500'
                }`}
                title="Simpan ke Favorit"
              >
                <Heart className={`w-5 h-5 ${isWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
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
                <span>{quantity}x {product.name} ditambahkan ke keranjang belanja!</span>
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
            <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-stone-100">
                  <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="Amanda Rizky" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-stone-900">Amanda Rizky</h4>
                  <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                    <Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-stone-600 font-light italic leading-relaxed">
                "The most authentic rendang I've ever ordered online. The spice profile is complex and the meat literally melts in your mouth."
              </p>
              <div className="relative w-full h-32 rounded-2xl overflow-hidden mt-2 border border-stone-100">
                <Image src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=80" alt="Dish photo" fill className="object-cover" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-stone-100">
                  <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" alt="Dimas Pratama" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-stone-900">Dimas Pratama</h4>
                  <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                    <Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-stone-600 font-light italic leading-relaxed">
                "Incredible value for the price. You can really taste the 12-hour slow cooking process. Will definitely buy again."
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-stone-100">
                  <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" alt="Budi Hartono" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-stone-900">Budi Hartono</h4>
                  <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                    <Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-stone-600 font-light italic leading-relaxed">
                "Packaging is very premium. Arrived fast and still fresh. Spices are spot on."
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
