'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
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
  MapPin
} from 'lucide-react';

export interface DetailProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount?: string;
  soldCount?: string;
  image: string;
  description: string;
  ingredients?: string;
  storage?: string;
  serving?: string;
  thumbnails?: string[];
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

export default function MenuDetailModal({ product, onClose }: MenuDetailModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlist, setIsWishlist] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'storage' | 'serving'>('description');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  if (!product) return null;

  const currentMainImage = selectedImage || product.image;
  const rawThumbnails = product.thumbnails && product.thumbnails.length > 0
    ? product.thumbnails
    : [
        product.image,
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80'
      ];
  const productThumbnails = rawThumbnails.slice(0, 2);

  const defaultReviews = product.reviews || [
    {
      id: 'r1',
      author: 'Amanda Rizky',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      text: '"The most authentic rendang I\'ve ever ordered online. The spice profile is complex and the meat literally melts in your mouth."',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'r2',
      author: 'Dimas Pratama',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      text: '"Incredible value for the price. You can really taste the 12-hour slow cooking process. Will definitely buy again."'
    },
    {
      id: 'r3',
      author: 'Budi Hartono',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      rating: 4,
      text: '"Packaging is very premium. Arrived fast and still fresh. Spices are spot on."'
    }
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
    onClose();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 md:p-10 flex items-center justify-center animate-fade-in">
      <div className="bg-[#FAF8F5] w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl border border-stone-200/80 relative my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-10 md:p-12 space-y-12">
          
          {/* TOP GRID: Product Gallery & Purchase Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left: Product Images & Gallery */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Display Image */}
              <div className="relative w-full h-[360px] sm:h-[420px] rounded-[28px] overflow-hidden bg-stone-100 shadow-md border border-stone-200/60">
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

            {/* Right: Purchase & Details Panel */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Category Pill Tag */}
              <div>
                <span className="inline-block px-3.5 py-1 bg-[#F5EBE1] text-[#7A4B29] text-xs font-medium rounded-full">
                  {product.category}
                </span>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
                  {product.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-light">
                  <div className="flex items-center gap-1 font-semibold text-stone-800">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                  <span>|</span>
                  <span>{product.reviewsCount || '1.2k reviews'}</span>
                  <span>|</span>
                  <span>{product.soldCount || '850 Terjual'}</span>
                  <span className="ml-auto text-emerald-700 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Ready Stock
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="font-serif text-3xl font-bold text-[#5C3D28]">
                Rp {product.price.toLocaleString('id-ID')}
              </div>

              {/* Production Origin Address Card */}
              <div className="p-3.5 bg-[#FAF6F0] border border-[#8A6337]/30 rounded-2xl flex items-start gap-3 text-xs text-stone-700">
                <MapPin className="w-4 h-4 text-[#8A6337] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#7A4B29] font-bold uppercase tracking-wider block mb-0.5">
                    🏭 ALAMAT &amp; DAERAH PRODUKSI:
                  </span>
                  <span className="font-semibold text-stone-900 leading-relaxed block">
                    {(product as any).origin || 'Dapur Utama Menteng, Jl. H.O.S. Cokroaminoto No. 88, Menteng, Jakarta Pusat, 10310'}
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

              {addedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{quantity}x {product.name} telah ditambahkan ke keranjang belanja!</span>
                </div>
              )}

              {/* Tabs Navigation */}
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

          {/* BOTTOM SECTION: What Our Foodies Say (Reviews & Comments) */}
          <div className="border-t border-stone-200/80 pt-10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2D231C]">
                What Our Foodies Say
              </h2>
              <Link 
                href="/comments" 
                onClick={onClose}
                className="text-xs font-semibold text-[#7A4B29] hover:underline"
              >
                Lihat Semua Ulasan Komentar &rarr;
              </Link>
            </div>

            {/* 3 Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {defaultReviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* User Header */}
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

                    {/* Review Quote Text */}
                    <p className="text-xs text-stone-600 font-light italic leading-relaxed">
                      {rev.text}
                    </p>
                  </div>

                  {/* Optional Review Food Image */}
                  {rev.image && (
                    <div className="relative w-full h-32 rounded-2xl overflow-hidden mt-2 border border-stone-100">
                      <Image src={rev.image} alt="Customer dish review" fill className="object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
