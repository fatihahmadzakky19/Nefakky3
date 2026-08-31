'use client';

/**
 * ============================================================================
 * HALAMAN: AdminReviewsPage (src/app/admin/reviews/page.tsx)
 * DESKRIPSI: Halaman moderasi ulasan rasa & testimoni pelanggan pada panel Admin.
 *            Mengambil daftar ulasan komunitas dari DataContext serta menyediakan
 *            fungsi penghapusan ulasan dan pengiriman balasan resmi admin resto.
 * ============================================================================
 */

// Mengimpor library React
import React from 'react';
// Mengimpor hook useData dari DataContext
import { useData } from '@/context/DataContext';
// Mengimpor komponen tampilan utama tab moderasi ulasan admin
import AdminReviewsTab from '@/components/admin/AdminReviewsTab';

/**
 * Komponen Utama: AdminReviewsPage
 */
export default function AdminReviewsPage() {
  // Mengambil state daftar ulasan dan fungsi aksi moderasi dari DataContext
  const { reviews, deleteReview, addReviewReply } = useData();

  // Merender komponen AdminReviewsTab dengan data ulasan dan handler yang diperlukan
  return (
    <AdminReviewsTab
      reviewList={reviews || []} // Daftar seluruh ulasan pelanggan (dengan fallback array kosong)
      deleteReview={deleteReview} // Handler penghapusan ulasan
      addReviewReply={addReviewReply} // Handler pengiriman balasan resmi admin resto
    />
  );
}
