'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface AdminReviewsTabProps {
  reviewList: any[];
  deleteReview: (id: string) => void;
}

export default function AdminReviewsTab({
  reviewList,
  deleteReview
}: AdminReviewsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#25160e]">Moderasi Ulasan Pelanggan</h1>
        <p className="text-xs text-[#4f4540]">Pantau ulasan cita rasa dan berikan tanggapan dari manajemen.</p>
      </div>

      <div className="space-y-4">
        {(reviewList || []).map((rev) => (
          <div key={rev.id} className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-xl space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25160e] text-white flex items-center justify-center font-bold text-xs">
                  {rev.authorName ? rev.authorName.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#25160e]">{rev.authorName}</h3>
                  <span className="text-[11px] text-[#4f4540]">{rev.date} • {rev.productName || 'Ayam Bakar'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400' : 'text-stone-300'}`} />
                ))}
              </div>
            </div>

            <p className="text-xs text-[#1b1c1a] font-light leading-relaxed">
              "{rev.comment}"
            </p>

            <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-xs">
              <span className="text-stone-400">{rev.likesCount || 10} Terbantu</span>
              <button
                onClick={() => deleteReview(rev.id)}
                className="text-rose-600 font-bold hover:underline"
              >
                Hapus Ulasan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
