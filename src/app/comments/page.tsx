'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import { 
  Star, 
  ShoppingBag, 
  User, 
  Send, 
  CheckCircle2, 
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

interface CommentReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  dishName: string;
  dishImage?: string;
  likes: number;
}

const INITIAL_COMMENTS: CommentReview[] = [
  {
    id: 'c1',
    author: 'Amanda Rizky',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: 'Kemarin, 14:20',
    text: '"The most authentic rendang I\'ve ever ordered online. The spice profile is complex and the meat literally melts in your mouth. Porsi cukup banyak dan kemasan super aman!"',
    dishName: 'Rendang Daging Premium',
    dishImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=80',
    likes: 24
  },
  {
    id: 'c2',
    author: 'Dimas Pratama',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: '2 hari lalu',
    text: '"Incredible value for the price. You can really taste the 12-hour slow cooking process. Will definitely buy again. Sate Ayam nya bumbu kacangnya gurih medok banget!"',
    dishName: 'Sate Ayam Madura',
    likes: 18
  },
  {
    id: 'c3',
    author: 'Budi Hartono',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 4,
    date: '3 hari lalu',
    text: '"Packaging is very premium. Arrived fast and still fresh. Spices are spot on. Es Cendol Durian rasa duriannya asli melimpah."',
    dishName: 'Es Cendol Durian',
    likes: 12
  }
];

import { useData } from '@/context/DataContext';

export default function CommentsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { totalCartCount } = useCart();
  const { reviews, addReview } = useData();

  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [selectedDish, setSelectedDish] = useState('Rendang Daging Premium');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const authorName = user?.displayName || user?.email?.split('@')[0] || 'Pengguna Nefakky';
    addReview({
      authorName,
      authorEmail: user?.email || undefined,
      authorBadge: 'MEMBER',
      avatar: user?.photoURL || undefined,
      rating: newRating,
      productName: selectedDish,
      comment: newComment
    });

    setNewComment('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#5C3D28] rounded-full animate-spin mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memuat Komentar & Ulasan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans selection:bg-[#5C3D28]/10 selection:text-[#5C3D28]">
      
      {/* 1. TOP NAVBAR HEADER */}
      <Navbar />

      {/* 2. MAIN COMMENTS CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-10 space-y-10">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#2D231C] tracking-tight">
            What Our Foodies Say
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
            Komunitas pecinta kuliner rumahan Nefakky. Bagikan ulasan, cerita rasa, dan pengalaman Anda bersama kami.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Write a Review / Comment Form */}
          <div className="lg:col-span-4 bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm space-y-4 sticky top-28">
            <h2 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <MessageSquare className="w-5 h-5 text-[#5C3D28]" />
              <span>Tulis Komentar Anda</span>
            </h2>

            {submitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Komentar ulasan Anda berhasil diterbitkan!</span>
              </div>
            )}

            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Pilih Menu Hidangan</label>
                <select
                  value={selectedDish}
                  onChange={(e) => setSelectedDish(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F2EC] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#5C3D28]"
                >
                  <option value="Rendang Daging Premium">Rendang Daging Premium</option>
                  <option value="Sate Ayam Madura">Sate Ayam Madura</option>
                  <option value="Es Cendol Durian">Es Cendol Durian</option>
                  <option value="Special Wagyu Bowl">Special Wagyu Bowl</option>
                  <option value="Creamy Truffle Pasta">Creamy Truffle Pasta</option>
                  <option value="Berry Cheesecake">Berry Cheesecake</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Bintang Penilaian</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400' : 'text-stone-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-2">{newRating}.0 / 5.0</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Komentar / Ulasan Rasa</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Bagikan kelezatan masakan yang Anda rasakan..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#F5F2EC] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#5C3D28]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#5C3D28] hover:bg-[#472E1E] text-white text-xs font-semibold rounded-full shadow transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Komentar</span>
              </button>
            </form>
          </div>

          {/* RIGHT: Comments List */}
          <div className="lg:col-span-8 space-y-6">
            {reviews.map((item) => {
              const avatarUrl = item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.authorName)}&background=5C3D28&color=ffffff&bold=true`;
              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm space-y-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatarUrl} alt={item.authorName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-stone-900">{item.authorName}</h3>
                          {item.authorBadge && (
                            <span className="px-2 py-0.5 bg-amber-100 text-[#7A4B29] text-[9px] font-bold rounded-full">
                              {item.authorBadge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-400">
                          <span>{item.date}</span>
                          {item.productName && (
                            <>
                              <span>•</span>
                              <span className="text-[#8A6337] font-medium">{item.productName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200 fill-stone-200'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 font-light italic leading-relaxed pt-1">
                    "{item.comment}"
                  </p>

                  <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-400">
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <ThumbsUp className="w-3.5 h-3.5 text-[#5C3D28]" />
                      <span>{item.likesCount || 0} orang terbantu</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </main>
    </div>
  );
}
