'use client';

/**
 * ============================================================================
 * MODULE: Halaman Komentar & Ulasan Pelanggan (Comments Page)
 * DESKRIPSI: Memungkinkan pelanggan melihat serta menuliskan ulasan rasa
 *            berbasis Google Stitch AI Design System 
 *            (Espresso #25160E, Terracotta #934B19, Warm Cream #FBF9F5).
 * ============================================================================
 */

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import { 
  Star, 
  Send, 
  CheckCircle2, 
  MessageSquare,
  Sparkles,
  Quote
} from 'lucide-react';

export default function CommentsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { products, reviews, addReview } = useData();

  // State Lokal Formulir Komentar
  const [newComment, setNewComment] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5);
  const [selectedDish, setSelectedDish] = useState<string>(products[0]?.name || 'Ayam Bakar');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Silakan Masuk (Login) terlebih dahulu untuk menulis ulasan.');
      router.push('/login');
      return;
    }

    if (!newComment.trim()) return;

    const authorName = user.displayName || user.email?.split('@')[0] || 'Pengguna Nefakky';
    
    addReview({
      authorName,
      authorEmail: user.email || undefined,
      avatar: user.photoURL || undefined,
      rating: newRating,
      productName: selectedDish,
      comment: newComment
    });

    setNewComment('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#25160E] rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#4F4540] font-medium tracking-wide">Memuat Komentar & Ulasan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1B1C1A] font-sans selection:bg-[#934B19]/10 selection:text-[#934B19] pb-20 lg:pb-0">
      
      {/* 1. BILAH NAVIGASI UTAMA */}
      <Navbar />

      {/* 2. KONTEN UTAMA HALAMAN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-12 py-6 sm:py-10 space-y-6 sm:space-y-10">
        
        {/* Header Judul Halaman (Google Stitch Design Token) */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3.5 py-1.5 bg-[#934B19]/10 text-[#934B19] text-xs font-bold rounded-full border border-[#934B19]/20 uppercase tracking-wider inline-block">
            Komunitas Pecinta Kuliner
          </span>
          <h1 className="font-serif text-2xl sm:text-5xl font-bold text-[#25160E] tracking-tight">
            Ulasan & Pengalaman Pelanggan
          </h1>
          <p className="text-xs sm:text-sm text-[#4F4540] font-medium leading-relaxed">
            Temukan cerita cita rasa otentik dari pelanggan Nefakky. Bagikan masukan dan pengalaman kuliner Anda bersama kami.
          </p>
        </div>

        {/* Grid 2 Kolom: Form Komentar (Kiri) & Daftar Ulasan (Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* KOLOM KIRI: FORMULIR TAMBAH ULASAN */}
          <div className="lg:col-span-4 bg-white border border-amber-900/10 rounded-3xl p-6 shadow-xl shadow-amber-950/5 space-y-4 sticky top-24">
            <h2 className="font-serif text-xl font-bold text-[#25160E] flex items-center gap-2 border-b border-stone-100 pb-3">
              <MessageSquare className="w-5 h-5 text-[#934B19]" />
              <span>Tulis Ulasan Rasa</span>
            </h2>

            {/* Pesan Berhasil Terbit */}
            {submitSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-fade-in font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ulasan Anda berhasil diterbitkan!</span>
              </div>
            )}

            <form onSubmit={handleSubmitComment} className="space-y-4">
              
              {/* Pilihan Hidangan */}
              <div>
                <label className="block text-xs font-bold text-[#25160E] mb-1.5">Pilih Menu Hidangan</label>
                <select
                  value={selectedDish}
                  onChange={(e) => setSelectedDish(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 cursor-pointer shadow-sm"
                >
                  {(products || []).map((prod) => (
                    <option key={prod.id} value={prod.name}>
                      {prod.name} ({prod.category}) — Rating: {prod.rating.toFixed(1)} ★
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilihan Bintang Rating */}
              <div>
                <label className="block text-xs font-bold text-[#25160E] mb-1.5">Bintang Penilaian</label>
                <div className="flex items-center gap-1.5 bg-[#FBF9F5] p-2.5 rounded-2xl border border-amber-900/15">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#25160E] ml-auto">{newRating}.0 / 5.0</span>
                </div>
              </div>

              {/* Input Teks Komentar */}
              <div>
                <label className="block text-xs font-bold text-[#25160E] mb-1.5">Komentar / Ulasan Rasa</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Bagikan kelezatan masakan yang Anda rasakan..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] placeholder-stone-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 shadow-sm"
                  required
                />
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                className="w-full py-3.5 bg-[#25160E] hover:bg-[#3C2A21] text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] uppercase tracking-wider"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Kirim Ulasan</span>
              </button>
            </form>
          </div>

          {/* KOLOM KANAN: DAFTAR ULASAN PELANGGAN */}
          <div className="lg:col-span-8 space-y-6">
            {reviews.map((item) => {
              const avatarUrl = item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.authorName)}&background=3C2A21&color=ffffff&bold=true`;
              
              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-xl shadow-amber-950/5 space-y-4 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-[#3C2A21] border border-amber-900/20 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatarUrl} alt={item.authorName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#25160E]">
                          {item.authorName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#4F4540] font-medium mt-0.5">
                          <span>{item.date}</span>
                          {item.productName && (
                            <>
                              <span>•</span>
                              <span className="text-[#934B19] font-bold">{item.productName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bintang Penilaian */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-4 h-4 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200 fill-stone-200'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[#1B1C1A] font-light leading-relaxed pt-1 flex items-start gap-2">
                    <Quote className="w-4 h-4 text-[#934B19] shrink-0 rotate-180" />
                    <span>{item.comment}</span>
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </main>
    </div>
  );
}
